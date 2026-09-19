-- Register new finishing-area machines and their commissioning tag dictionaries.
-- All assets start offline/no-data until their PLC, meter, or camera signals are mapped.

WITH machine_rows AS (
  SELECT
    'CT-FIN-' || lpad(series::text, 2, '0') AS asset_id,
    'continuous'::text AS process_type,
    'Continuous Finishing ' || lpad(series::text, 2, '0') AS display_name,
    'Continuous'::text AS subtype,
    jsonb_build_object(
      'canonical_registered', true,
      'commissioning_status', 'PENDING_MAPPING',
      'primary_monitoring', jsonb_build_array('chemical_consumption', 'temperature', 'padder_pressure', 'speed', 'runtime', 'output')
    ) AS config_json
  FROM generate_series(1, 4) AS series
  UNION ALL
  SELECT
    'INSP-FIN-' || lpad(series::text, 2, '0'),
    'inspecting',
    'Inspecting ' || lpad(series::text, 2, '0'),
    'Fabric Inspection',
    jsonb_build_object(
      'canonical_registered', true,
      'commissioning_status', 'PENDING_MAPPING',
      'camera_integration', 'PLANNED',
      'primary_monitoring', jsonb_build_array('speed', 'runtime', 'output', 'defect_count', 'defect_length', 'quality_grade', 'camera_status')
    )
  FROM generate_series(1, 12) AS series
  UNION ALL
  SELECT
    'FIN-FIN-01',
    'finishing',
    'Finishing 01',
    'Finishing',
    jsonb_build_object(
      'canonical_registered', true,
      'commissioning_status', 'PENDING_MAPPING',
      'primary_monitoring', jsonb_build_array('speed', 'runtime', 'output', 'temperature', 'pressure')
    )
  UNION ALL
  SELECT
    'SD-FIN-' || lpad(series::text, 2, '0'),
    'setting_dongnam',
    'Setting Dongnam ' || lpad(series::text, 2, '0'),
    'Dongnam',
    jsonb_build_object(
      'canonical_registered', true,
      'commissioning_status', 'PENDING_MAPPING',
      'primary_monitoring', jsonb_build_array('speed', 'runtime', 'output', 'temperature', 'fabric_width', 'overfeed')
    )
  FROM generate_series(1, 4) AS series
)
INSERT INTO asset (
  asset_id, process_type, area_code, area_name, display_name, subtype,
  config_json, active, created_at, updated_at
)
SELECT
  asset_id, process_type, 'FIN', 'Finishing', display_name, subtype,
  config_json, TRUE, clock_timestamp(), clock_timestamp()
FROM machine_rows
ON CONFLICT (asset_id)
DO UPDATE SET
  process_type = EXCLUDED.process_type,
  area_code = EXCLUDED.area_code,
  area_name = EXCLUDED.area_name,
  display_name = EXCLUDED.display_name,
  subtype = EXCLUDED.subtype,
  config_json = asset.config_json || EXCLUDED.config_json,
  active = TRUE,
  updated_at = clock_timestamp();

INSERT INTO asset_snapshot (
  asset_id, machine_state, batch_no, progress_percent, connected,
  source_ts, quality, values_json, updated_at
)
SELECT
  asset_id, 'offline', '—', 0, FALSE,
  clock_timestamp(), 'NO_DATA', '{}'::jsonb, clock_timestamp()
FROM asset
WHERE process_type IN ('continuous', 'inspecting', 'finishing', 'setting_dongnam')
ON CONFLICT (asset_id) DO NOTHING;

WITH continuous_tags(section_code, parameter_code, signal_role, engineering_unit, stale_after_seconds) AS (
  VALUES
    ('COMMUNICATION', 'HEARTBEAT', 'COMM_HEARTBEAT', 'bool', 30),
    ('LINE', 'SPEED_PV', 'LINE_SPEED_PV', 'm/min', 30),
    ('RUNTIME', 'TOTAL_H', 'RUNTIME_TOTAL_H', 'h', 300),
    ('PRODUCTION', 'OUTPUT_TOTAL_M', 'OUTPUT_TOTAL_M', 'm', 300),
    ('CHEMICAL', 'CONSUMPTION_TOTAL_KG', 'CHEMICAL_CONSUMPTION_KG', 'kg', 300),
    ('CHEMICAL_01', 'CONSUMPTION_TOTAL_KG', 'CHEMICAL_01_CONSUMPTION_KG', 'kg', 300),
    ('CHEMICAL_02', 'CONSUMPTION_TOTAL_KG', 'CHEMICAL_02_CONSUMPTION_KG', 'kg', 300),
    ('CHEMICAL_03', 'CONSUMPTION_TOTAL_KG', 'CHEMICAL_03_CONSUMPTION_KG', 'kg', 300),
    ('CHEMICAL_04', 'CONSUMPTION_TOTAL_KG', 'CHEMICAL_04_CONSUMPTION_KG', 'kg', 300),
    ('TEMPERATURE', 'ZONE_01_PV', 'TEMPERATURE_ZONE_01_PV', '°C', 30),
    ('TEMPERATURE', 'ZONE_02_PV', 'TEMPERATURE_ZONE_02_PV', '°C', 30),
    ('TEMPERATURE', 'ZONE_03_PV', 'TEMPERATURE_ZONE_03_PV', '°C', 30),
    ('TEMPERATURE', 'ZONE_04_PV', 'TEMPERATURE_ZONE_04_PV', '°C', 30),
    ('PADDER_01', 'PRESSURE_PV', 'PADDER_01_PRESSURE_PV', 'bar', 30),
    ('PADDER_02', 'PRESSURE_PV', 'PADDER_02_PRESSURE_PV', 'bar', 30),
    ('PADDER_03', 'PRESSURE_PV', 'PADDER_03_PRESSURE_PV', 'bar', 30)
), continuous_assets AS (
  SELECT asset_id FROM asset WHERE process_type = 'continuous' AND active = TRUE
)
INSERT INTO tag_definition (
  tag_code, asset_id, signal_role, engineering_unit, source_status,
  active, created_at, stale_after_seconds, freshness_mode
)
SELECT
  'SMM.' || asset_id || '.' || section_code || '.' || parameter_code,
  asset_id, signal_role, engineering_unit, 'PENDING_MAPPING',
  TRUE, clock_timestamp(), stale_after_seconds, 'TAG_TIMESTAMP'
FROM continuous_assets CROSS JOIN continuous_tags
ON CONFLICT (tag_code)
DO UPDATE SET
  asset_id = EXCLUDED.asset_id,
  signal_role = EXCLUDED.signal_role,
  engineering_unit = EXCLUDED.engineering_unit,
  active = TRUE,
  stale_after_seconds = EXCLUDED.stale_after_seconds,
  freshness_mode = EXCLUDED.freshness_mode;

WITH inspecting_tags(section_code, parameter_code, signal_role, engineering_unit, stale_after_seconds) AS (
  VALUES
    ('COMMUNICATION', 'HEARTBEAT', 'COMM_HEARTBEAT', 'bool', 30),
    ('LINE', 'SPEED_PV', 'LINE_SPEED_PV', 'm/min', 30),
    ('RUNTIME', 'TOTAL_H', 'RUNTIME_TOTAL_H', 'h', 300),
    ('PRODUCTION', 'OUTPUT_TOTAL_M', 'OUTPUT_TOTAL_M', 'm', 300),
    ('QUALITY', 'DEFECT_COUNT', 'DEFECT_COUNT', 'count', 30),
    ('QUALITY', 'DEFECT_LENGTH_M', 'DEFECT_LENGTH_M', 'm', 30),
    ('QUALITY', 'GRADE', 'QUALITY_GRADE', NULL, 30),
    ('CAMERA', 'CONNECTED', 'CAMERA_CONNECTED', 'bool', 30),
    ('CAMERA', 'INSPECTION_ACTIVE', 'CAMERA_INSPECTION_ACTIVE', 'bool', 30),
    ('CAMERA', 'DEFECT_TYPE', 'CAMERA_DEFECT_TYPE', NULL, 30),
    ('CAMERA', 'DEFECT_POSITION_M', 'CAMERA_DEFECT_POSITION_M', 'm', 30)
), inspecting_assets AS (
  SELECT asset_id FROM asset WHERE process_type = 'inspecting' AND active = TRUE
)
INSERT INTO tag_definition (
  tag_code, asset_id, signal_role, engineering_unit, source_status,
  active, created_at, stale_after_seconds, freshness_mode
)
SELECT
  'SMM.' || asset_id || '.' || section_code || '.' || parameter_code,
  asset_id, signal_role, engineering_unit, 'PENDING_MAPPING',
  TRUE, clock_timestamp(), stale_after_seconds, 'TAG_TIMESTAMP'
FROM inspecting_assets CROSS JOIN inspecting_tags
ON CONFLICT (tag_code)
DO UPDATE SET
  asset_id = EXCLUDED.asset_id,
  signal_role = EXCLUDED.signal_role,
  engineering_unit = EXCLUDED.engineering_unit,
  active = TRUE,
  stale_after_seconds = EXCLUDED.stale_after_seconds,
  freshness_mode = EXCLUDED.freshness_mode;

WITH finishing_tags(section_code, parameter_code, signal_role, engineering_unit, stale_after_seconds) AS (
  VALUES
    ('COMMUNICATION', 'HEARTBEAT', 'COMM_HEARTBEAT', 'bool', 30),
    ('LINE', 'SPEED_PV', 'LINE_SPEED_PV', 'm/min', 30),
    ('RUNTIME', 'TOTAL_H', 'RUNTIME_TOTAL_H', 'h', 300),
    ('PRODUCTION', 'OUTPUT_TOTAL_M', 'OUTPUT_TOTAL_M', 'm', 300),
    ('TEMPERATURE', 'ZONE_01_PV', 'TEMPERATURE_ZONE_01_PV', '°C', 30),
    ('TEMPERATURE', 'ZONE_02_PV', 'TEMPERATURE_ZONE_02_PV', '°C', 30),
    ('PROCESS', 'PRESSURE_PV', 'PROCESS_PRESSURE_PV', 'bar', 30)
), finishing_assets AS (
  SELECT asset_id FROM asset WHERE process_type = 'finishing' AND active = TRUE
)
INSERT INTO tag_definition (
  tag_code, asset_id, signal_role, engineering_unit, source_status,
  active, created_at, stale_after_seconds, freshness_mode
)
SELECT
  'SMM.' || asset_id || '.' || section_code || '.' || parameter_code,
  asset_id, signal_role, engineering_unit, 'PENDING_MAPPING',
  TRUE, clock_timestamp(), stale_after_seconds, 'TAG_TIMESTAMP'
FROM finishing_assets CROSS JOIN finishing_tags
ON CONFLICT (tag_code)
DO UPDATE SET
  asset_id = EXCLUDED.asset_id,
  signal_role = EXCLUDED.signal_role,
  engineering_unit = EXCLUDED.engineering_unit,
  active = TRUE,
  stale_after_seconds = EXCLUDED.stale_after_seconds,
  freshness_mode = EXCLUDED.freshness_mode;

WITH dongnam_tags(section_code, parameter_code, signal_role, engineering_unit, stale_after_seconds) AS (
  VALUES
    ('COMMUNICATION', 'HEARTBEAT', 'COMM_HEARTBEAT', 'bool', 30),
    ('LINE', 'SPEED_PV', 'LINE_SPEED_PV', 'm/min', 30),
    ('RUNTIME', 'TOTAL_H', 'RUNTIME_TOTAL_H', 'h', 300),
    ('PRODUCTION', 'OUTPUT_TOTAL_M', 'OUTPUT_TOTAL_M', 'm', 300),
    ('TEMPERATURE', 'ZONE_01_PV', 'TEMPERATURE_ZONE_01_PV', '°C', 30),
    ('TEMPERATURE', 'ZONE_02_PV', 'TEMPERATURE_ZONE_02_PV', '°C', 30),
    ('TEMPERATURE', 'ZONE_03_PV', 'TEMPERATURE_ZONE_03_PV', '°C', 30),
    ('TEMPERATURE', 'ZONE_04_PV', 'TEMPERATURE_ZONE_04_PV', '°C', 30),
    ('FABRIC', 'WIDTH_PV', 'FABRIC_WIDTH_PV', 'cm', 30),
    ('FABRIC', 'OVERFEED_PV', 'OVERFEED_PV', '%', 30)
), dongnam_assets AS (
  SELECT asset_id FROM asset WHERE process_type = 'setting_dongnam' AND active = TRUE
)
INSERT INTO tag_definition (
  tag_code, asset_id, signal_role, engineering_unit, source_status,
  active, created_at, stale_after_seconds, freshness_mode
)
SELECT
  'SMM.' || asset_id || '.' || section_code || '.' || parameter_code,
  asset_id, signal_role, engineering_unit, 'PENDING_MAPPING',
  TRUE, clock_timestamp(), stale_after_seconds, 'TAG_TIMESTAMP'
FROM dongnam_assets CROSS JOIN dongnam_tags
ON CONFLICT (tag_code)
DO UPDATE SET
  asset_id = EXCLUDED.asset_id,
  signal_role = EXCLUDED.signal_role,
  engineering_unit = EXCLUDED.engineering_unit,
  active = TRUE,
  stale_after_seconds = EXCLUDED.stale_after_seconds,
  freshness_mode = EXCLUDED.freshness_mode;
