-- Migration 0028: Integrate Continuous Finishing Machine (CT-FIN-01) with live SCADA & MES telemetry.
-- Upgrades asset_communication_state to support active tag stream fallback.
-- Maps canonical signal roles and engineering units for 247 real continuous tags.
-- Synchronizes asset_snapshot with live continuous process state and key measurement dictionary.

-- 1. Upgrade asset_communication_state to fall back to active incoming telemetry
CREATE OR REPLACE VIEW asset_communication_state AS
WITH primary_heartbeat AS (
  SELECT
    asset.asset_id,
    definition.tag_code AS heartbeat_tag_code,
    COALESCE(definition.stale_after_seconds, 60) AS stale_after_seconds,
    latest.value_number,
    latest.value_text,
    latest.quality AS raw_quality,
    latest.source_ts,
    latest.ingested_at,
    latest.gateway_id,
    latest.message_id,
    latest.updated_at
  FROM asset
  LEFT JOIN tag_definition definition
    ON definition.asset_id = asset.asset_id
   AND definition.tag_code = 'SMM.' || asset.asset_id || '.COMMUNICATION.HEARTBEAT'
   AND definition.active = TRUE
  LEFT JOIN tag_latest latest ON latest.tag_code = definition.tag_code
  WHERE asset.active = TRUE
), fallback_telemetry AS (
  SELECT DISTINCT ON (asset_id)
    asset_id,
    tag_code,
    60 AS stale_after_seconds,
    value_number,
    value_text,
    quality,
    source_ts,
    ingested_at,
    gateway_id,
    message_id,
    updated_at
  FROM tag_latest
  WHERE source_ts IS NOT NULL
  ORDER BY asset_id,
    CASE
      WHEN tag_code LIKE '%SYSTEM.CONTROL_POWER%' THEN 0
      WHEN tag_code LIKE '%SYSTEM.DRIVE_START%' THEN 1
      ELSE 2
    END,
    source_ts DESC
), combined AS (
  SELECT
    p.asset_id,
    COALESCE(p.heartbeat_tag_code, f.tag_code) AS heartbeat_tag_code,
    COALESCE(p.stale_after_seconds, f.stale_after_seconds, 60) AS stale_after_seconds,
    CASE WHEN p.source_ts IS NOT NULL THEN p.value_number ELSE f.value_number END AS value_number,
    CASE WHEN p.source_ts IS NOT NULL THEN p.value_text ELSE f.value_text END AS value_text,
    CASE WHEN p.source_ts IS NOT NULL THEN p.raw_quality ELSE f.quality END AS raw_quality,
    COALESCE(p.source_ts, f.source_ts) AS source_ts,
    COALESCE(p.ingested_at, f.ingested_at) AS ingested_at,
    COALESCE(p.gateway_id, f.gateway_id) AS gateway_id,
    COALESCE(p.message_id, f.message_id) AS message_id,
    COALESCE(p.updated_at, f.updated_at) AS updated_at,
    CASE
      WHEN lower(COALESCE(CASE WHEN p.source_ts IS NOT NULL THEN p.value_text ELSE f.value_text END, '')) IN ('true', '1', 'on', 'online', 'connected', 'good') THEN TRUE
      WHEN lower(COALESCE(CASE WHEN p.source_ts IS NOT NULL THEN p.value_text ELSE f.value_text END, '')) IN ('false', '0', 'off', 'offline', 'disconnected', 'bad') THEN FALSE
      WHEN (CASE WHEN p.source_ts IS NOT NULL THEN p.value_text ELSE f.value_text END) IS NULL AND (CASE WHEN p.source_ts IS NOT NULL THEN p.value_number ELSE f.value_number END) IS NOT NULL THEN (CASE WHEN p.source_ts IS NOT NULL THEN p.value_number ELSE f.value_number END) <> 0
      WHEN COALESCE(p.source_ts, f.source_ts) >= clock_timestamp() - make_interval(secs => COALESCE(p.stale_after_seconds, f.stale_after_seconds, 60)) THEN TRUE
      ELSE NULL
    END AS heartbeat_value
  FROM primary_heartbeat p
  LEFT JOIN fallback_telemetry f ON f.asset_id = p.asset_id
)
SELECT
  asset_id,
  heartbeat_tag_code,
  heartbeat_value,
  raw_quality,
  CASE
    WHEN heartbeat_tag_code IS NULL OR source_ts IS NULL THEN 'NOT_CONNECTED'
    WHEN upper(COALESCE(raw_quality, 'NOT_CONNECTED')) IN ('BAD', 'STALE', 'NOT_CONNECTED')
      THEN upper(COALESCE(raw_quality, 'NOT_CONNECTED'))
    WHEN source_ts < clock_timestamp() - make_interval(secs => stale_after_seconds) THEN 'STALE'
    WHEN heartbeat_value IS FALSE THEN 'NOT_CONNECTED'
    WHEN heartbeat_value IS TRUE THEN 'GOOD'
    ELSE 'BAD'
  END AS effective_quality,
  CASE
    WHEN heartbeat_tag_code IS NULL OR source_ts IS NULL THEN FALSE
    WHEN upper(COALESCE(raw_quality, 'NOT_CONNECTED')) <> 'GOOD' THEN FALSE
    WHEN source_ts < clock_timestamp() - make_interval(secs => stale_after_seconds) THEN FALSE
    ELSE heartbeat_value IS TRUE
  END AS online,
  stale_after_seconds,
  source_ts,
  ingested_at,
  gateway_id,
  message_id,
  updated_at
FROM combined;

-- 2. Update Continuous Asset Metadata
UPDATE asset
SET
  config_json = jsonb_build_object(
    'canonical_registered', true,
    'commissioning_status', 'ACTIVE_INGESTION',
    'primary_monitoring', jsonb_build_array('line_speed', 'prewash_temperature', 'washing_temperature', 'steamer_temperature', 'dosing_flow', 'water_consumption', 'batch_length', 'dancers')
  ),
  updated_at = clock_timestamp()
WHERE asset_id = 'CT-FIN-01';

-- 3. Enhance Canonical Signal Roles & Engineering Units for Real Continuous Tags
UPDATE tag_definition SET signal_role = 'PREWASH_TEMPERATURE_PV', engineering_unit = '°C' WHERE tag_code LIKE 'SMM.CT-FIN-01.PW-%.TEMPERATURE_SV';
UPDATE tag_definition SET signal_role = 'PREWASH_TEMPERATURE_SP', engineering_unit = '°C' WHERE tag_code LIKE 'SMM.CT-FIN-01.PW-%.TEMPERATURE_SV.SETPOINT';
UPDATE tag_definition SET signal_role = 'WASHING_TEMPERATURE_PV', engineering_unit = '°C' WHERE tag_code LIKE 'SMM.CT-FIN-01.PW2-%.TEMPERATURE_SV';
UPDATE tag_definition SET signal_role = 'WASHING_TEMPERATURE_SP', engineering_unit = '°C' WHERE tag_code LIKE 'SMM.CT-FIN-01.PW2-%.TEMPERATURE_SV%SETPOINT%';
UPDATE tag_definition SET signal_role = 'STEAMER_TEMPERATURE_PV', engineering_unit = '°C' WHERE tag_code = 'SMM.CT-FIN-01.STREAMER.TEMPERATURE_SV';
UPDATE tag_definition SET signal_role = 'EXHAUST_TEMPERATURE_PV', engineering_unit = '°C' WHERE tag_code = 'SMM.CT-FIN-01.CEROBONG-STEAMER.TEMPERATURE_SV';
UPDATE tag_definition SET signal_role = 'HEAT_RECOVERY_TEMPERATURE_PV', engineering_unit = '°C' WHERE tag_code LIKE 'SMM.CT-FIN-01.HEAT-RECOVERY-%.TEMPERATURE_SV';
UPDATE tag_definition SET signal_role = 'OBA_INLET_TEMPERATURE_PV', engineering_unit = '°C' WHERE tag_code = 'SMM.CT-FIN-01.OBA-INLET.TEMPERATURE_SV';
UPDATE tag_definition SET signal_role = 'OBA_PROCESS_TEMPERATURE_PV', engineering_unit = '°C' WHERE tag_code = 'SMM.CT-FIN-01.OBA-PROCESS.TEMPERATURE_SV';
UPDATE tag_definition SET signal_role = 'OBA_EXIT_TEMPERATURE_PV', engineering_unit = '°C' WHERE tag_code = 'SMM.CT-FIN-01.OBA-EXIT.TEMPERATURE_SV';
UPDATE tag_definition SET signal_role = 'IMPREGNATION_TEMPERATURE_PV', engineering_unit = '°C' WHERE tag_code = 'SMM.CT-FIN-01.IMPREG.TEMPERATURE_SV';
UPDATE tag_definition SET signal_role = 'STEAM_POST_PW_TEMPERATURE_PV', engineering_unit = '°C' WHERE tag_code = 'SMM.CT-FIN-01.STEAM-SETELAH-PW.TEMPERATURE_SV';
UPDATE tag_definition SET signal_role = 'LINE_SPEED_PV', engineering_unit = 'm/min' WHERE tag_code = 'SMM.CT-FIN-01.LINE.SPEED_LOGIC_RAW';
UPDATE tag_definition SET signal_role = 'LINE_SPEED_SP', engineering_unit = 'm/min' WHERE tag_code = 'SMM.CT-FIN-01.LINE.SPEED_SETPOINT_RAW';
UPDATE tag_definition SET signal_role = 'BATCH_NO', engineering_unit = '' WHERE tag_code = 'SMM.CT-FIN-01.NOMOR-DATA';
UPDATE tag_definition SET signal_role = 'BATCH_LENGTH_M', engineering_unit = 'm' WHERE tag_code = 'SMM.CT-FIN-01.MES.LENGTH_BATCH';
UPDATE tag_definition SET signal_role = 'TOTAL_LENGTH_M', engineering_unit = 'm' WHERE tag_code = 'SMM.CT-FIN-01.MES.LENGTH_TOTAL';
UPDATE tag_definition SET signal_role = 'BATCH_MASS_KG', engineering_unit = 'kg' WHERE tag_code = 'SMM.CT-FIN-01.MES.MASS_BATCH_CALC';
UPDATE tag_definition SET signal_role = 'TOTAL_MASS_KG', engineering_unit = 'kg' WHERE tag_code = 'SMM.CT-FIN-01.MES.MASS_TOTAL_CALC';
UPDATE tag_definition SET signal_role = 'WATER_CONSUMPTION_L', engineering_unit = 'L' WHERE tag_code IN ('SMM.CT-FIN-01.MES.WATER_THOUSANDS', 'SMM.CT-FIN-01.MES.WATER_UNITS');
UPDATE tag_definition SET signal_role = 'RUNTIME_MINUTES', engineering_unit = 'min' WHERE tag_code = 'SMM.CT-FIN-01.MES.RUN_COMMAND_MINUTES';
UPDATE tag_definition SET signal_role = 'STATION_FLOW_PV', engineering_unit = 'L/h' WHERE tag_code LIKE 'SMM.CT-FIN-01.STASIUN-%.FLOW_PV';
UPDATE tag_definition SET signal_role = 'DOSING_FLOW_PV', engineering_unit = 'ml/h' WHERE tag_code LIKE 'SMM.CT-FIN-01.POMPA%-STASIUN%.DOSING';
UPDATE tag_definition SET signal_role = 'DOSING_SPEED_RPM', engineering_unit = 'RPM' WHERE tag_code LIKE 'SMM.CT-FIN-01.POMPA%-STASIUN%.DOSING-SPEED';
UPDATE tag_definition SET signal_role = 'DOSING_TOTALIZER_ML', engineering_unit = 'ml' WHERE tag_code LIKE 'SMM.CT-FIN-01.POMPA%-STASIUN%.DOSING-TOTALIZER';
UPDATE tag_definition SET signal_role = 'TENSION_DANCER_POSITION', engineering_unit = '%' WHERE tag_code LIKE 'SMM.CT-FIN-01.DANCER-R%';
UPDATE tag_definition SET signal_role = 'PH_MEASUREMENT', engineering_unit = 'pH' WHERE tag_code LIKE 'SMM.CT-FIN-01.PH-%.VALUE_RAW';

-- 4. Function to Synchronize Asset Snapshot for Continuous Machines
CREATE OR REPLACE FUNCTION sync_continuous_asset_snapshot(target_asset_id TEXT DEFAULT 'CT-FIN-01')
RETURNS VOID AS $$
DECLARE
  v_source_ts TIMESTAMPTZ;
  v_machine_state TEXT := 'offline';
  v_batch_no TEXT := '—';
  v_power NUMERIC;
  v_drive NUMERIC;
  v_fault NUMERIC;
  v_emergency NUMERIC;
  v_speed NUMERIC;
  v_values JSONB;
BEGIN
  -- Get max source_ts
  SELECT MAX(source_ts) INTO v_source_ts
  FROM tag_latest
  WHERE asset_id = target_asset_id;

  IF v_source_ts IS NULL THEN
    RETURN;
  END IF;

  -- Read key state indicators
  SELECT value_number INTO v_power FROM tag_latest WHERE tag_code = 'SMM.' || target_asset_id || '.SYSTEM.CONTROL_POWER';
  SELECT value_number INTO v_drive FROM tag_latest WHERE tag_code = 'SMM.' || target_asset_id || '.SYSTEM.DRIVE_START';
  SELECT value_number INTO v_fault FROM tag_latest WHERE tag_code = 'SMM.' || target_asset_id || '.SYSTEM.FAULT_PRESENT';
  SELECT value_number INTO v_emergency FROM tag_latest WHERE tag_code = 'SMM.' || target_asset_id || '.SYSTEM.EMERGENCY';
  SELECT COALESCE(value_number, 0) INTO v_speed FROM tag_latest WHERE tag_code = 'SMM.' || target_asset_id || '.LINE.SPEED_LOGIC_RAW';
  SELECT COALESCE(value_text, '—') INTO v_batch_no FROM tag_latest WHERE tag_code = 'SMM.' || target_asset_id || '.NOMOR-DATA';

  -- Determine state
  IF v_source_ts < clock_timestamp() - INTERVAL '5 minutes' THEN
    v_machine_state := 'offline';
  ELSIF COALESCE(v_fault, 0) > 0 OR COALESCE(v_emergency, 0) > 0 THEN
    v_machine_state := 'fault';
  ELSIF COALESCE(v_drive, 0) > 0 OR v_speed > 0 THEN
    v_machine_state := 'running';
  ELSIF COALESCE(v_power, 0) > 0 THEN
    v_machine_state := 'idle';
  ELSE
    v_machine_state := 'offline';
  END IF;

  -- Build values_json dictionary
  SELECT jsonb_object_agg(
    metric_key,
    metric_val
  ) INTO v_values
  FROM (
    SELECT
      CASE
        WHEN tag_code = 'SMM.' || target_asset_id || '.LINE.SPEED_LOGIC_RAW' THEN 'line_speed_pv'
        WHEN tag_code = 'SMM.' || target_asset_id || '.LINE.SPEED_SETPOINT_RAW' THEN 'line_speed_sp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.STREAMER.TEMPERATURE_SV' THEN 'steamer_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.CEROBONG-STEAMER.TEMPERATURE_SV' THEN 'cerobong_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.PW-1.TEMPERATURE_SV' THEN 'prewash_1_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.PW-2.TEMPERATURE_SV' THEN 'prewash_2_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.PW-3.TEMPERATURE_SV' THEN 'prewash_3_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.PW2-1.TEMPERATURE_SV' THEN 'wash2_1_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.PW2-2.TEMPERATURE_SV' THEN 'wash2_2_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.PW2-3.TEMPERATURE_SV' THEN 'wash2_3_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.PW2-4.TEMPERATURE_SV' THEN 'wash2_4_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.PW2-5.TEMPERATURE_SV' THEN 'wash2_5_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.PW2-6.TEMPERATURE_SV' THEN 'wash2_6_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.HEAT-RECOVERY-1.TEMPERATURE_SV' THEN 'heat_recovery_1'
        WHEN tag_code = 'SMM.' || target_asset_id || '.HEAT-RECOVERY-2.TEMPERATURE_SV' THEN 'heat_recovery_2'
        WHEN tag_code = 'SMM.' || target_asset_id || '.HEAT-RECOVERY-3.TEMPERATURE_SV' THEN 'heat_recovery_3'
        WHEN tag_code = 'SMM.' || target_asset_id || '.HEAT-RECOVERY-4.TEMPERATURE_SV' THEN 'heat_recovery_4'
        WHEN tag_code = 'SMM.' || target_asset_id || '.OBA-INLET.TEMPERATURE_SV' THEN 'oba_inlet_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.OBA-PROCESS.TEMPERATURE_SV' THEN 'oba_process_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.OBA-EXIT.TEMPERATURE_SV' THEN 'oba_exit_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.STEAM-SETELAH-PW.TEMPERATURE_SV' THEN 'steam_post_pw_temp'
        WHEN tag_code = 'SMM.' || target_asset_id || '.STEAM-SETELAH-PW.CONTROL_PERCENT' THEN 'steam_control_pct'
        WHEN tag_code = 'SMM.' || target_asset_id || '.MES.LENGTH_BATCH' THEN 'batch_length_m'
        WHEN tag_code = 'SMM.' || target_asset_id || '.MES.LENGTH_TOTAL' THEN 'total_length_m'
        WHEN tag_code = 'SMM.' || target_asset_id || '.MES.MASS_BATCH_CALC' THEN 'batch_mass_kg'
        WHEN tag_code = 'SMM.' || target_asset_id || '.MES.RUN_COMMAND_MINUTES' THEN 'runtime_minutes'
        WHEN tag_code = 'SMM.' || target_asset_id || '.STASIUN-1.FLOW_PV' THEN 'station_1_flow'
        WHEN tag_code = 'SMM.' || target_asset_id || '.STASIUN-2.FLOW_PV' THEN 'station_2_flow'
        WHEN tag_code = 'SMM.' || target_asset_id || '.STASIUN-3.FLOW_PV' THEN 'station_3_flow'
        WHEN tag_code = 'SMM.' || target_asset_id || '.STASIUN-4.FLOW_PV' THEN 'station_4_flow'
        WHEN tag_code = 'SMM.' || target_asset_id || '.DRIVE-0.SPEED_CONVERTED' THEN 'drive_0_speed'
        ELSE NULL
      END AS metric_key,
      COALESCE(value_number::text, value_text) AS metric_val
    FROM tag_latest
    WHERE asset_id = target_asset_id
  ) sub
  WHERE metric_key IS NOT NULL;

  -- Add water total calculation
  SELECT v_values || jsonb_build_object(
    'water_total_liters',
    COALESCE(
      (SELECT value_number * 1000 FROM tag_latest WHERE tag_code = 'SMM.' || target_asset_id || '.MES.WATER_THOUSANDS') +
      (SELECT value_number FROM tag_latest WHERE tag_code = 'SMM.' || target_asset_id || '.MES.WATER_UNITS'),
      0
    )
  ) INTO v_values;

  -- Upsert asset_snapshot
  INSERT INTO asset_snapshot (
    asset_id, machine_state, batch_no, progress_percent, connected,
    source_ts, quality, values_json, updated_at
  )
  VALUES (
    target_asset_id,
    v_machine_state,
    v_batch_no,
    0,
    v_source_ts >= clock_timestamp() - INTERVAL '5 minutes',
    v_source_ts,
    'GOOD',
    COALESCE(v_values, '{}'::jsonb),
    clock_timestamp()
  )
  ON CONFLICT (asset_id)
  DO UPDATE SET
    machine_state = EXCLUDED.machine_state,
    batch_no = EXCLUDED.batch_no,
    connected = EXCLUDED.connected,
    source_ts = EXCLUDED.source_ts,
    quality = EXCLUDED.quality,
    values_json = EXCLUDED.values_json,
    updated_at = EXCLUDED.updated_at;

  -- Also ensure production_batch exists for the active batch
  IF v_batch_no IS NOT NULL AND v_batch_no <> '—' AND v_batch_no <> '' THEN
    INSERT INTO production_batch (
      batch_no, customer_name, fabric_type, fabric_weight_gsm, target_width_cm,
      target_output_kg, delivery_target_at, batch_status, created_at, updated_at,
      source_system, external_reference, source_updated_at, payload_json
    ) VALUES (
      v_batch_no, 'PT SMM Finishing Line', 'Continuous Bleached & Washed Fabric', 200, 180, 1000,
      v_source_ts + INTERVAL '1 day', 'IN_PROCESS', v_source_ts, clock_timestamp(),
      'CONTINUOUS_SCADA', v_batch_no, v_source_ts, jsonb_build_object('auto_created', true, 'asset_id', target_asset_id)
    )
    ON CONFLICT (batch_no) DO UPDATE SET
      batch_status = 'IN_PROCESS',
      source_updated_at = EXCLUDED.source_updated_at,
      updated_at = clock_timestamp();

    INSERT INTO batch_process_run (
      process_run_id, batch_no, asset_id, process_type, recipe_code, run_status,
      started_at, output_quantity, output_unit, created_at, updated_at,
      source_system, external_run_id, source_updated_at, progress_percent, payload_json
    ) VALUES (
      md5(target_asset_id || ':' || v_batch_no)::uuid,
      v_batch_no, target_asset_id, 'continuous', 'CONTINUOUS-STANDARD',
      CASE WHEN v_machine_state = 'running' THEN 'RUNNING' ELSE 'HOLD' END,
      v_source_ts - INTERVAL '2 hours',
      COALESCE((SELECT value_number FROM tag_latest WHERE tag_code = 'SMM.' || target_asset_id || '.MES.LENGTH_BATCH'), 0),
      'm', v_source_ts, clock_timestamp(),
      'CONTINUOUS_SCADA', 'RUN-' || target_asset_id || '-' || v_batch_no, v_source_ts, NULL,
      jsonb_build_object('auto_created', true)
    )
    ON CONFLICT (process_run_id) DO UPDATE SET
      run_status = EXCLUDED.run_status,
      output_quantity = EXCLUDED.output_quantity,
      progress_percent = NULL,
      source_updated_at = EXCLUDED.source_updated_at,
      updated_at = clock_timestamp();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Execute snapshot sync immediately for CT-FIN-01
SELECT sync_continuous_asset_snapshot('CT-FIN-01');

-- 6. Trigger to automatically keep continuous snapshot synced on telemetry ingestion
CREATE OR REPLACE FUNCTION trg_sync_continuous_on_telemetry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.asset_id LIKE 'CT-FIN%' THEN
    PERFORM sync_continuous_asset_snapshot(NEW.asset_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_sync_continuous ON tag_latest;
CREATE TRIGGER trg_auto_sync_continuous
AFTER INSERT OR UPDATE ON tag_latest
FOR EACH ROW
EXECUTE FUNCTION trg_sync_continuous_on_telemetry();
