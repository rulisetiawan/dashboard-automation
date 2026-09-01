-- Add Calator 3 in area Depan and extend DSP-DPN-01 route topology.

INSERT INTO asset (
  asset_id, process_type, area_code, area_name, display_name, subtype,
  config_json, active, created_at, updated_at
)
VALUES (
  'CL-DPN-03', 'calator', 'DPN', 'Depan', 'Calator Depan 03', 'Standard',
  '{"canonical_registered": true, "commissioning_status": "PENDING_MAPPING"}'::jsonb,
  TRUE, clock_timestamp(), clock_timestamp()
)
ON CONFLICT (asset_id)
DO UPDATE SET
  process_type = EXCLUDED.process_type,
  area_code = EXCLUDED.area_code,
  area_name = EXCLUDED.area_name,
  display_name = EXCLUDED.display_name,
  subtype = EXCLUDED.subtype,
  active = TRUE,
  updated_at = clock_timestamp();

INSERT INTO asset_snapshot (
  asset_id, machine_state, batch_no, progress_percent, connected,
  source_ts, quality, values_json, updated_at
)
VALUES (
  'CL-DPN-03', 'offline', '—', 0, FALSE,
  clock_timestamp(), 'NO_DATA', '{}'::jsonb, clock_timestamp()
)
ON CONFLICT (asset_id) DO NOTHING;

WITH tag_rows(section_code, parameter_code, signal_role, engineering_unit, stale_after_seconds, freshness_mode) AS (
  VALUES
    ('FEEDING', 'SPEED_PV', 'FEEDING_SPEED_PV', 'm/min', 30, 'TAG_TIMESTAMP'),
    ('FEEDING', 'SPEED_SV', 'FEEDING_SPEED_SV', 'm/min', 30, 'TAG_TIMESTAMP'),
    ('SQUEEZING_01', 'SPEED_PV', 'SQUEEZING_01_SPEED_PV', 'm/min', 30, 'TAG_TIMESTAMP'),
    ('SQUEEZING_02', 'SPEED_PV', 'SQUEEZING_02_SPEED_PV', 'm/min', 30, 'TAG_TIMESTAMP'),
    ('OVERFEED_OUT', 'SPEED_PV', 'OVERFEED_OUT_SPEED_PV', 'm/min', 30, 'TAG_TIMESTAMP'),
    ('OVERFEED_OUT', 'SPEED_SV', 'OVERFEED_OUT_SPEED_SV', 'm/min', 30, 'TAG_TIMESTAMP'),
    ('DANCER', 'POSITION_PV', 'DANCER_POSITION_PV', '%', 30, 'TAG_TIMESTAMP'),
    ('FOLDER', 'SPEED_PV', 'FOLDER_SPEED_PV', 'm/min', 30, 'TAG_TIMESTAMP'),
    ('PLAITING', 'SPEED_PV', 'PLAITER_SPEED_PV', 'm/min', 30, 'TAG_TIMESTAMP'),
    ('WATER_INLET', 'FLOW_TOTAL', 'WATER_CONSUMPTION_M3', 'm³', 300, 'TAG_TIMESTAMP'),
    ('PRODUCTION', 'OUTPUT_TOTAL_M', 'OUTPUT_TOTAL_M', 'm', 300, 'TAG_TIMESTAMP'),
    ('COMMUNICATION', 'HEARTBEAT', 'COMM_HEARTBEAT', 'bool', 30, 'TAG_TIMESTAMP')
)
INSERT INTO tag_definition (
  tag_code, asset_id, signal_role, engineering_unit, source_status,
  active, created_at, stale_after_seconds, freshness_mode
)
SELECT
  'SMM.CL-DPN-03.' || section_code || '.' || parameter_code,
  'CL-DPN-03', signal_role, engineering_unit, 'PENDING_MAPPING',
  TRUE, clock_timestamp(), stale_after_seconds, freshness_mode
FROM tag_rows
ON CONFLICT (tag_code)
DO UPDATE SET
  asset_id = EXCLUDED.asset_id,
  signal_role = EXCLUDED.signal_role,
  engineering_unit = EXCLUDED.engineering_unit,
  active = TRUE,
  stale_after_seconds = EXCLUDED.stale_after_seconds,
  freshness_mode = EXCLUDED.freshness_mode;

WITH route_tags(parameter_code) AS (
  VALUES ('OPEN_FB'), ('FAULT_FB')
)
INSERT INTO tag_definition (
  tag_code, asset_id, signal_role, engineering_unit, source_status,
  active, created_at, stale_after_seconds, freshness_mode
)
SELECT
  'SMM.DSP-DPN-01.ROUTE_CL_03.' || parameter_code,
  'DSP-DPN-01', 'ROUTE_CL_03_' || parameter_code, 'bool',
  'PENDING_MAPPING', TRUE, clock_timestamp(), 30, 'ASSET_HEARTBEAT'
FROM route_tags
ON CONFLICT (tag_code)
DO UPDATE SET
  asset_id = EXCLUDED.asset_id,
  signal_role = EXCLUDED.signal_role,
  engineering_unit = EXCLUDED.engineering_unit,
  active = TRUE,
  stale_after_seconds = 30,
  freshness_mode = 'ASSET_HEARTBEAT';
