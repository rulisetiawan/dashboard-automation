-- PT.SMM Canonical Tag Library Registry
-- Mendaftarkan seluruh master asset dan tag canonical baku untuk seluruh mesin pabrik.

BEGIN;

-- ============================================================================
-- PROCESS: JETFLOW (Jetflow)
-- ============================================================================

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LA-01', 'jetflow', 'LA', 'Lane A', 'Jetflow Lane A 01', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LA-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-01.MAIN_TANK.TEMPERATURE_PV', 'JF-LA-01', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-01.MAIN_TANK.TEMPERATURE_SV', 'JF-LA-01', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-01.MAIN_TANK.LEVEL_PV', 'JF-LA-01', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-01.MAIN_TANK.LEVEL_SV', 'JF-LA-01', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-01.WATER_INLET.FLOW_PV', 'JF-LA-01', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-01.WATER_INLET.FLOW_TOTAL', 'JF-LA-01', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-01.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LA-01', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-01.DOSING_TANK_01.LEVEL_PV', 'JF-LA-01', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-01.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LA-01', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-01.DOSING_TANK_02.LEVEL_PV', 'JF-LA-01', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-01.MACHINE.PROCESS_STEP_CODE', 'JF-LA-01', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-01.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LA-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LA-02', 'jetflow', 'LA', 'Lane A', 'Jetflow Lane A 02', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LA-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-02.MAIN_TANK.TEMPERATURE_PV', 'JF-LA-02', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-02.MAIN_TANK.TEMPERATURE_SV', 'JF-LA-02', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-02.MAIN_TANK.LEVEL_PV', 'JF-LA-02', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-02.MAIN_TANK.LEVEL_SV', 'JF-LA-02', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-02.WATER_INLET.FLOW_PV', 'JF-LA-02', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-02.WATER_INLET.FLOW_TOTAL', 'JF-LA-02', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-02.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LA-02', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-02.DOSING_TANK_01.LEVEL_PV', 'JF-LA-02', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-02.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LA-02', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-02.DOSING_TANK_02.LEVEL_PV', 'JF-LA-02', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-02.MACHINE.PROCESS_STEP_CODE', 'JF-LA-02', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-02.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LA-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LA-03', 'jetflow', 'LA', 'Lane A', 'Jetflow Lane A 03', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LA-03', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-03.MAIN_TANK.TEMPERATURE_PV', 'JF-LA-03', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-03.MAIN_TANK.TEMPERATURE_SV', 'JF-LA-03', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-03.MAIN_TANK.LEVEL_PV', 'JF-LA-03', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-03.MAIN_TANK.LEVEL_SV', 'JF-LA-03', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-03.WATER_INLET.FLOW_PV', 'JF-LA-03', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-03.WATER_INLET.FLOW_TOTAL', 'JF-LA-03', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-03.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LA-03', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-03.DOSING_TANK_01.LEVEL_PV', 'JF-LA-03', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-03.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LA-03', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-03.DOSING_TANK_02.LEVEL_PV', 'JF-LA-03', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-03.MACHINE.PROCESS_STEP_CODE', 'JF-LA-03', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-03.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LA-03', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LA-04', 'jetflow', 'LA', 'Lane A', 'Jetflow Lane A 04', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LA-04', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-04.MAIN_TANK.TEMPERATURE_PV', 'JF-LA-04', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-04.MAIN_TANK.TEMPERATURE_SV', 'JF-LA-04', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-04.MAIN_TANK.LEVEL_PV', 'JF-LA-04', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-04.MAIN_TANK.LEVEL_SV', 'JF-LA-04', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-04.WATER_INLET.FLOW_PV', 'JF-LA-04', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-04.WATER_INLET.FLOW_TOTAL', 'JF-LA-04', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-04.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LA-04', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-04.DOSING_TANK_01.LEVEL_PV', 'JF-LA-04', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-04.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LA-04', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-04.DOSING_TANK_02.LEVEL_PV', 'JF-LA-04', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-04.MACHINE.PROCESS_STEP_CODE', 'JF-LA-04', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-04.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LA-04', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LA-05', 'jetflow', 'LA', 'Lane A', 'Jetflow Lane A 05', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LA-05', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-05.MAIN_TANK.TEMPERATURE_PV', 'JF-LA-05', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-05.MAIN_TANK.TEMPERATURE_SV', 'JF-LA-05', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-05.MAIN_TANK.LEVEL_PV', 'JF-LA-05', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-05.MAIN_TANK.LEVEL_SV', 'JF-LA-05', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-05.WATER_INLET.FLOW_PV', 'JF-LA-05', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-05.WATER_INLET.FLOW_TOTAL', 'JF-LA-05', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-05.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LA-05', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-05.DOSING_TANK_01.LEVEL_PV', 'JF-LA-05', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-05.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LA-05', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-05.DOSING_TANK_02.LEVEL_PV', 'JF-LA-05', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-05.MACHINE.PROCESS_STEP_CODE', 'JF-LA-05', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-05.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LA-05', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LA-06', 'jetflow', 'LA', 'Lane A', 'Jetflow Lane A 06', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LA-06', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-06.MAIN_TANK.TEMPERATURE_PV', 'JF-LA-06', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-06.MAIN_TANK.TEMPERATURE_SV', 'JF-LA-06', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-06.MAIN_TANK.LEVEL_PV', 'JF-LA-06', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-06.MAIN_TANK.LEVEL_SV', 'JF-LA-06', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-06.WATER_INLET.FLOW_PV', 'JF-LA-06', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-06.WATER_INLET.FLOW_TOTAL', 'JF-LA-06', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-06.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LA-06', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-06.DOSING_TANK_01.LEVEL_PV', 'JF-LA-06', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-06.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LA-06', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-06.DOSING_TANK_02.LEVEL_PV', 'JF-LA-06', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-06.MACHINE.PROCESS_STEP_CODE', 'JF-LA-06', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LA-06.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LA-06', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-01', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 01', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-01.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-01', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-01.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-01', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-01.MAIN_TANK.LEVEL_PV', 'JF-LB-01', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-01.MAIN_TANK.LEVEL_SV', 'JF-LB-01', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-01.WATER_INLET.FLOW_PV', 'JF-LB-01', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-01.WATER_INLET.FLOW_TOTAL', 'JF-LB-01', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-01.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-01', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-01.DOSING_TANK_01.LEVEL_PV', 'JF-LB-01', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-01.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-01', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-01.DOSING_TANK_02.LEVEL_PV', 'JF-LB-01', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-01.MACHINE.PROCESS_STEP_CODE', 'JF-LB-01', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-01.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-02', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 02', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-02.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-02', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-02.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-02', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-02.MAIN_TANK.LEVEL_PV', 'JF-LB-02', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-02.MAIN_TANK.LEVEL_SV', 'JF-LB-02', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-02.WATER_INLET.FLOW_PV', 'JF-LB-02', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-02.WATER_INLET.FLOW_TOTAL', 'JF-LB-02', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-02.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-02', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-02.DOSING_TANK_01.LEVEL_PV', 'JF-LB-02', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-02.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-02', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-02.DOSING_TANK_02.LEVEL_PV', 'JF-LB-02', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-02.MACHINE.PROCESS_STEP_CODE', 'JF-LB-02', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-02.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-03', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 03', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-03', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-03.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-03', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-03.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-03', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-03.MAIN_TANK.LEVEL_PV', 'JF-LB-03', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-03.MAIN_TANK.LEVEL_SV', 'JF-LB-03', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-03.WATER_INLET.FLOW_PV', 'JF-LB-03', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-03.WATER_INLET.FLOW_TOTAL', 'JF-LB-03', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-03.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-03', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-03.DOSING_TANK_01.LEVEL_PV', 'JF-LB-03', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-03.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-03', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-03.DOSING_TANK_02.LEVEL_PV', 'JF-LB-03', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-03.MACHINE.PROCESS_STEP_CODE', 'JF-LB-03', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-03.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-03', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-04', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 04', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-04', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-04.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-04', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-04.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-04', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-04.MAIN_TANK.LEVEL_PV', 'JF-LB-04', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-04.MAIN_TANK.LEVEL_SV', 'JF-LB-04', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-04.WATER_INLET.FLOW_PV', 'JF-LB-04', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-04.WATER_INLET.FLOW_TOTAL', 'JF-LB-04', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-04.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-04', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-04.DOSING_TANK_01.LEVEL_PV', 'JF-LB-04', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-04.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-04', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-04.DOSING_TANK_02.LEVEL_PV', 'JF-LB-04', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-04.MACHINE.PROCESS_STEP_CODE', 'JF-LB-04', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-04.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-04', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-05', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 05', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-05', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-05.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-05', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-05.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-05', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-05.MAIN_TANK.LEVEL_PV', 'JF-LB-05', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-05.MAIN_TANK.LEVEL_SV', 'JF-LB-05', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-05.WATER_INLET.FLOW_PV', 'JF-LB-05', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-05.WATER_INLET.FLOW_TOTAL', 'JF-LB-05', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-05.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-05', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-05.DOSING_TANK_01.LEVEL_PV', 'JF-LB-05', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-05.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-05', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-05.DOSING_TANK_02.LEVEL_PV', 'JF-LB-05', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-05.MACHINE.PROCESS_STEP_CODE', 'JF-LB-05', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-05.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-05', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-06', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 06', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-06', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-06.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-06', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-06.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-06', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-06.MAIN_TANK.LEVEL_PV', 'JF-LB-06', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-06.MAIN_TANK.LEVEL_SV', 'JF-LB-06', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-06.WATER_INLET.FLOW_PV', 'JF-LB-06', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-06.WATER_INLET.FLOW_TOTAL', 'JF-LB-06', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-06.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-06', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-06.DOSING_TANK_01.LEVEL_PV', 'JF-LB-06', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-06.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-06', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-06.DOSING_TANK_02.LEVEL_PV', 'JF-LB-06', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-06.MACHINE.PROCESS_STEP_CODE', 'JF-LB-06', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-06.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-06', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-07', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 07', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-07', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-07.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-07', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-07.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-07', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-07.MAIN_TANK.LEVEL_PV', 'JF-LB-07', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-07.MAIN_TANK.LEVEL_SV', 'JF-LB-07', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-07.WATER_INLET.FLOW_PV', 'JF-LB-07', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-07.WATER_INLET.FLOW_TOTAL', 'JF-LB-07', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-07.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-07', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-07.DOSING_TANK_01.LEVEL_PV', 'JF-LB-07', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-07.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-07', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-07.DOSING_TANK_02.LEVEL_PV', 'JF-LB-07', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-07.MACHINE.PROCESS_STEP_CODE', 'JF-LB-07', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-07.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-07', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-08', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 08', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-08', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-08.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-08', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-08.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-08', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-08.MAIN_TANK.LEVEL_PV', 'JF-LB-08', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-08.MAIN_TANK.LEVEL_SV', 'JF-LB-08', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-08.WATER_INLET.FLOW_PV', 'JF-LB-08', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-08.WATER_INLET.FLOW_TOTAL', 'JF-LB-08', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-08.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-08', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-08.DOSING_TANK_01.LEVEL_PV', 'JF-LB-08', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-08.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-08', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-08.DOSING_TANK_02.LEVEL_PV', 'JF-LB-08', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-08.MACHINE.PROCESS_STEP_CODE', 'JF-LB-08', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-08.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-08', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-09', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 09', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-09', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-09.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-09', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-09.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-09', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-09.MAIN_TANK.LEVEL_PV', 'JF-LB-09', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-09.MAIN_TANK.LEVEL_SV', 'JF-LB-09', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-09.WATER_INLET.FLOW_PV', 'JF-LB-09', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-09.WATER_INLET.FLOW_TOTAL', 'JF-LB-09', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-09.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-09', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-09.DOSING_TANK_01.LEVEL_PV', 'JF-LB-09', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-09.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-09', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-09.DOSING_TANK_02.LEVEL_PV', 'JF-LB-09', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-09.MACHINE.PROCESS_STEP_CODE', 'JF-LB-09', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-09.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-09', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-10', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 10', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-10', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-10.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-10', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-10.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-10', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-10.MAIN_TANK.LEVEL_PV', 'JF-LB-10', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-10.MAIN_TANK.LEVEL_SV', 'JF-LB-10', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-10.WATER_INLET.FLOW_PV', 'JF-LB-10', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-10.WATER_INLET.FLOW_TOTAL', 'JF-LB-10', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-10.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-10', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-10.DOSING_TANK_01.LEVEL_PV', 'JF-LB-10', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-10.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-10', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-10.DOSING_TANK_02.LEVEL_PV', 'JF-LB-10', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-10.MACHINE.PROCESS_STEP_CODE', 'JF-LB-10', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-10.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-10', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-11', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 11', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-11', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-11.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-11', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-11.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-11', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-11.MAIN_TANK.LEVEL_PV', 'JF-LB-11', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-11.MAIN_TANK.LEVEL_SV', 'JF-LB-11', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-11.WATER_INLET.FLOW_PV', 'JF-LB-11', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-11.WATER_INLET.FLOW_TOTAL', 'JF-LB-11', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-11.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-11', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-11.DOSING_TANK_01.LEVEL_PV', 'JF-LB-11', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-11.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-11', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-11.DOSING_TANK_02.LEVEL_PV', 'JF-LB-11', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-11.MACHINE.PROCESS_STEP_CODE', 'JF-LB-11', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-11.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-11', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-12', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 12', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-12', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-12.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-12', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-12.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-12', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-12.MAIN_TANK.LEVEL_PV', 'JF-LB-12', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-12.MAIN_TANK.LEVEL_SV', 'JF-LB-12', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-12.WATER_INLET.FLOW_PV', 'JF-LB-12', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-12.WATER_INLET.FLOW_TOTAL', 'JF-LB-12', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-12.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-12', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-12.DOSING_TANK_01.LEVEL_PV', 'JF-LB-12', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-12.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-12', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-12.DOSING_TANK_02.LEVEL_PV', 'JF-LB-12', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-12.MACHINE.PROCESS_STEP_CODE', 'JF-LB-12', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-12.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-12', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-13', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 13', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-13', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-13.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-13', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-13.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-13', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-13.MAIN_TANK.LEVEL_PV', 'JF-LB-13', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-13.MAIN_TANK.LEVEL_SV', 'JF-LB-13', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-13.WATER_INLET.FLOW_PV', 'JF-LB-13', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-13.WATER_INLET.FLOW_TOTAL', 'JF-LB-13', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-13.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-13', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-13.DOSING_TANK_01.LEVEL_PV', 'JF-LB-13', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-13.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-13', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-13.DOSING_TANK_02.LEVEL_PV', 'JF-LB-13', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-13.MACHINE.PROCESS_STEP_CODE', 'JF-LB-13', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-13.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-13', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-14', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 14', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-14', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-14.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-14', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-14.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-14', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-14.MAIN_TANK.LEVEL_PV', 'JF-LB-14', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-14.MAIN_TANK.LEVEL_SV', 'JF-LB-14', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-14.WATER_INLET.FLOW_PV', 'JF-LB-14', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-14.WATER_INLET.FLOW_TOTAL', 'JF-LB-14', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-14.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-14', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-14.DOSING_TANK_01.LEVEL_PV', 'JF-LB-14', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-14.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-14', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-14.DOSING_TANK_02.LEVEL_PV', 'JF-LB-14', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-14.MACHINE.PROCESS_STEP_CODE', 'JF-LB-14', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-14.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-14', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-15', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 15', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-15', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-15.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-15', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-15.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-15', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-15.MAIN_TANK.LEVEL_PV', 'JF-LB-15', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-15.MAIN_TANK.LEVEL_SV', 'JF-LB-15', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-15.WATER_INLET.FLOW_PV', 'JF-LB-15', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-15.WATER_INLET.FLOW_TOTAL', 'JF-LB-15', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-15.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-15', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-15.DOSING_TANK_01.LEVEL_PV', 'JF-LB-15', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-15.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-15', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-15.DOSING_TANK_02.LEVEL_PV', 'JF-LB-15', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-15.MACHINE.PROCESS_STEP_CODE', 'JF-LB-15', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-15.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-15', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-16', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 16', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-16', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-16.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-16', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-16.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-16', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-16.MAIN_TANK.LEVEL_PV', 'JF-LB-16', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-16.MAIN_TANK.LEVEL_SV', 'JF-LB-16', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-16.WATER_INLET.FLOW_PV', 'JF-LB-16', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-16.WATER_INLET.FLOW_TOTAL', 'JF-LB-16', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-16.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-16', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-16.DOSING_TANK_01.LEVEL_PV', 'JF-LB-16', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-16.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-16', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-16.DOSING_TANK_02.LEVEL_PV', 'JF-LB-16', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-16.MACHINE.PROCESS_STEP_CODE', 'JF-LB-16', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-16.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-16', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-17', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 17', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-17', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-17.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-17', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-17.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-17', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-17.MAIN_TANK.LEVEL_PV', 'JF-LB-17', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-17.MAIN_TANK.LEVEL_SV', 'JF-LB-17', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-17.WATER_INLET.FLOW_PV', 'JF-LB-17', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-17.WATER_INLET.FLOW_TOTAL', 'JF-LB-17', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-17.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-17', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-17.DOSING_TANK_01.LEVEL_PV', 'JF-LB-17', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-17.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-17', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-17.DOSING_TANK_02.LEVEL_PV', 'JF-LB-17', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-17.MACHINE.PROCESS_STEP_CODE', 'JF-LB-17', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-17.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-17', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LB-18', 'jetflow', 'LB', 'Lane B', 'Jetflow Lane B 18', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LB-18', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-18.MAIN_TANK.TEMPERATURE_PV', 'JF-LB-18', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-18.MAIN_TANK.TEMPERATURE_SV', 'JF-LB-18', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-18.MAIN_TANK.LEVEL_PV', 'JF-LB-18', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-18.MAIN_TANK.LEVEL_SV', 'JF-LB-18', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-18.WATER_INLET.FLOW_PV', 'JF-LB-18', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-18.WATER_INLET.FLOW_TOTAL', 'JF-LB-18', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-18.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LB-18', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-18.DOSING_TANK_01.LEVEL_PV', 'JF-LB-18', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-18.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LB-18', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-18.DOSING_TANK_02.LEVEL_PV', 'JF-LB-18', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-18.MACHINE.PROCESS_STEP_CODE', 'JF-LB-18', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LB-18.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LB-18', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-01', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 01', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-01.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-01', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-01.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-01', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-01.MAIN_TANK.LEVEL_PV', 'JF-LC-01', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-01.MAIN_TANK.LEVEL_SV', 'JF-LC-01', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-01.WATER_INLET.FLOW_PV', 'JF-LC-01', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-01.WATER_INLET.FLOW_TOTAL', 'JF-LC-01', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-01.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-01', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-01.DOSING_TANK_01.LEVEL_PV', 'JF-LC-01', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-01.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-01', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-01.DOSING_TANK_02.LEVEL_PV', 'JF-LC-01', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-01.MACHINE.PROCESS_STEP_CODE', 'JF-LC-01', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-01.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-02', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 02', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-02.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-02', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-02.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-02', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-02.MAIN_TANK.LEVEL_PV', 'JF-LC-02', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-02.MAIN_TANK.LEVEL_SV', 'JF-LC-02', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-02.WATER_INLET.FLOW_PV', 'JF-LC-02', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-02.WATER_INLET.FLOW_TOTAL', 'JF-LC-02', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-02.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-02', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-02.DOSING_TANK_01.LEVEL_PV', 'JF-LC-02', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-02.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-02', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-02.DOSING_TANK_02.LEVEL_PV', 'JF-LC-02', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-02.MACHINE.PROCESS_STEP_CODE', 'JF-LC-02', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-02.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-03', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 03', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-03', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-03.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-03', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-03.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-03', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-03.MAIN_TANK.LEVEL_PV', 'JF-LC-03', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-03.MAIN_TANK.LEVEL_SV', 'JF-LC-03', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-03.WATER_INLET.FLOW_PV', 'JF-LC-03', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-03.WATER_INLET.FLOW_TOTAL', 'JF-LC-03', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-03.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-03', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-03.DOSING_TANK_01.LEVEL_PV', 'JF-LC-03', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-03.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-03', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-03.DOSING_TANK_02.LEVEL_PV', 'JF-LC-03', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-03.MACHINE.PROCESS_STEP_CODE', 'JF-LC-03', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-03.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-03', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-04', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 04', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-04', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-04.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-04', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-04.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-04', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-04.MAIN_TANK.LEVEL_PV', 'JF-LC-04', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-04.MAIN_TANK.LEVEL_SV', 'JF-LC-04', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-04.WATER_INLET.FLOW_PV', 'JF-LC-04', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-04.WATER_INLET.FLOW_TOTAL', 'JF-LC-04', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-04.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-04', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-04.DOSING_TANK_01.LEVEL_PV', 'JF-LC-04', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-04.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-04', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-04.DOSING_TANK_02.LEVEL_PV', 'JF-LC-04', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-04.MACHINE.PROCESS_STEP_CODE', 'JF-LC-04', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-04.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-04', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-05', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 05', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-05', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-05.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-05', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-05.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-05', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-05.MAIN_TANK.LEVEL_PV', 'JF-LC-05', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-05.MAIN_TANK.LEVEL_SV', 'JF-LC-05', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-05.WATER_INLET.FLOW_PV', 'JF-LC-05', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-05.WATER_INLET.FLOW_TOTAL', 'JF-LC-05', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-05.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-05', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-05.DOSING_TANK_01.LEVEL_PV', 'JF-LC-05', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-05.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-05', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-05.DOSING_TANK_02.LEVEL_PV', 'JF-LC-05', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-05.MACHINE.PROCESS_STEP_CODE', 'JF-LC-05', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-05.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-05', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-06', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 06', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-06', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-06.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-06', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-06.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-06', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-06.MAIN_TANK.LEVEL_PV', 'JF-LC-06', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-06.MAIN_TANK.LEVEL_SV', 'JF-LC-06', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-06.WATER_INLET.FLOW_PV', 'JF-LC-06', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-06.WATER_INLET.FLOW_TOTAL', 'JF-LC-06', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-06.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-06', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-06.DOSING_TANK_01.LEVEL_PV', 'JF-LC-06', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-06.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-06', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-06.DOSING_TANK_02.LEVEL_PV', 'JF-LC-06', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-06.MACHINE.PROCESS_STEP_CODE', 'JF-LC-06', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-06.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-06', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-07', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 07', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-07', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-07.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-07', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-07.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-07', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-07.MAIN_TANK.LEVEL_PV', 'JF-LC-07', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-07.MAIN_TANK.LEVEL_SV', 'JF-LC-07', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-07.WATER_INLET.FLOW_PV', 'JF-LC-07', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-07.WATER_INLET.FLOW_TOTAL', 'JF-LC-07', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-07.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-07', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-07.DOSING_TANK_01.LEVEL_PV', 'JF-LC-07', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-07.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-07', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-07.DOSING_TANK_02.LEVEL_PV', 'JF-LC-07', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-07.MACHINE.PROCESS_STEP_CODE', 'JF-LC-07', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-07.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-07', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-08', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 08', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-08', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-08.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-08', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-08.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-08', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-08.MAIN_TANK.LEVEL_PV', 'JF-LC-08', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-08.MAIN_TANK.LEVEL_SV', 'JF-LC-08', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-08.WATER_INLET.FLOW_PV', 'JF-LC-08', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-08.WATER_INLET.FLOW_TOTAL', 'JF-LC-08', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-08.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-08', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-08.DOSING_TANK_01.LEVEL_PV', 'JF-LC-08', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-08.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-08', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-08.DOSING_TANK_02.LEVEL_PV', 'JF-LC-08', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-08.MACHINE.PROCESS_STEP_CODE', 'JF-LC-08', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-08.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-08', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-09', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 09', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-09', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-09.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-09', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-09.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-09', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-09.MAIN_TANK.LEVEL_PV', 'JF-LC-09', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-09.MAIN_TANK.LEVEL_SV', 'JF-LC-09', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-09.WATER_INLET.FLOW_PV', 'JF-LC-09', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-09.WATER_INLET.FLOW_TOTAL', 'JF-LC-09', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-09.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-09', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-09.DOSING_TANK_01.LEVEL_PV', 'JF-LC-09', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-09.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-09', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-09.DOSING_TANK_02.LEVEL_PV', 'JF-LC-09', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-09.MACHINE.PROCESS_STEP_CODE', 'JF-LC-09', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-09.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-09', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-10', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 10', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-10', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-10.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-10', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-10.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-10', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-10.MAIN_TANK.LEVEL_PV', 'JF-LC-10', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-10.MAIN_TANK.LEVEL_SV', 'JF-LC-10', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-10.WATER_INLET.FLOW_PV', 'JF-LC-10', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-10.WATER_INLET.FLOW_TOTAL', 'JF-LC-10', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-10.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-10', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-10.DOSING_TANK_01.LEVEL_PV', 'JF-LC-10', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-10.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-10', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-10.DOSING_TANK_02.LEVEL_PV', 'JF-LC-10', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-10.MACHINE.PROCESS_STEP_CODE', 'JF-LC-10', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-10.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-10', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-11', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 11', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-11', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-11.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-11', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-11.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-11', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-11.MAIN_TANK.LEVEL_PV', 'JF-LC-11', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-11.MAIN_TANK.LEVEL_SV', 'JF-LC-11', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-11.WATER_INLET.FLOW_PV', 'JF-LC-11', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-11.WATER_INLET.FLOW_TOTAL', 'JF-LC-11', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-11.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-11', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-11.DOSING_TANK_01.LEVEL_PV', 'JF-LC-11', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-11.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-11', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-11.DOSING_TANK_02.LEVEL_PV', 'JF-LC-11', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-11.MACHINE.PROCESS_STEP_CODE', 'JF-LC-11', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-11.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-11', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-12', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 12', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-12', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-12.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-12', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-12.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-12', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-12.MAIN_TANK.LEVEL_PV', 'JF-LC-12', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-12.MAIN_TANK.LEVEL_SV', 'JF-LC-12', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-12.WATER_INLET.FLOW_PV', 'JF-LC-12', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-12.WATER_INLET.FLOW_TOTAL', 'JF-LC-12', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-12.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-12', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-12.DOSING_TANK_01.LEVEL_PV', 'JF-LC-12', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-12.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-12', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-12.DOSING_TANK_02.LEVEL_PV', 'JF-LC-12', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-12.MACHINE.PROCESS_STEP_CODE', 'JF-LC-12', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-12.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-12', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-13', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 13', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-13', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-13.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-13', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-13.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-13', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-13.MAIN_TANK.LEVEL_PV', 'JF-LC-13', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-13.MAIN_TANK.LEVEL_SV', 'JF-LC-13', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-13.WATER_INLET.FLOW_PV', 'JF-LC-13', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-13.WATER_INLET.FLOW_TOTAL', 'JF-LC-13', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-13.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-13', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-13.DOSING_TANK_01.LEVEL_PV', 'JF-LC-13', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-13.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-13', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-13.DOSING_TANK_02.LEVEL_PV', 'JF-LC-13', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-13.MACHINE.PROCESS_STEP_CODE', 'JF-LC-13', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-13.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-13', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-14', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 14', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-14', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-14.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-14', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-14.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-14', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-14.MAIN_TANK.LEVEL_PV', 'JF-LC-14', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-14.MAIN_TANK.LEVEL_SV', 'JF-LC-14', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-14.WATER_INLET.FLOW_PV', 'JF-LC-14', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-14.WATER_INLET.FLOW_TOTAL', 'JF-LC-14', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-14.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-14', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-14.DOSING_TANK_01.LEVEL_PV', 'JF-LC-14', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-14.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-14', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-14.DOSING_TANK_02.LEVEL_PV', 'JF-LC-14', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-14.MACHINE.PROCESS_STEP_CODE', 'JF-LC-14', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-14.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-14', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-15', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 15', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-15', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-15.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-15', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-15.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-15', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-15.MAIN_TANK.LEVEL_PV', 'JF-LC-15', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-15.MAIN_TANK.LEVEL_SV', 'JF-LC-15', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-15.WATER_INLET.FLOW_PV', 'JF-LC-15', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-15.WATER_INLET.FLOW_TOTAL', 'JF-LC-15', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-15.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-15', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-15.DOSING_TANK_01.LEVEL_PV', 'JF-LC-15', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-15.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-15', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-15.DOSING_TANK_02.LEVEL_PV', 'JF-LC-15', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-15.MACHINE.PROCESS_STEP_CODE', 'JF-LC-15', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-15.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-15', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-16', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 16', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-16', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-16.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-16', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-16.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-16', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-16.MAIN_TANK.LEVEL_PV', 'JF-LC-16', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-16.MAIN_TANK.LEVEL_SV', 'JF-LC-16', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-16.WATER_INLET.FLOW_PV', 'JF-LC-16', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-16.WATER_INLET.FLOW_TOTAL', 'JF-LC-16', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-16.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-16', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-16.DOSING_TANK_01.LEVEL_PV', 'JF-LC-16', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-16.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-16', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-16.DOSING_TANK_02.LEVEL_PV', 'JF-LC-16', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-16.MACHINE.PROCESS_STEP_CODE', 'JF-LC-16', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-16.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-16', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-17', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 17', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-17', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-17.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-17', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-17.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-17', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-17.MAIN_TANK.LEVEL_PV', 'JF-LC-17', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-17.MAIN_TANK.LEVEL_SV', 'JF-LC-17', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-17.WATER_INLET.FLOW_PV', 'JF-LC-17', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-17.WATER_INLET.FLOW_TOTAL', 'JF-LC-17', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-17.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-17', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-17.DOSING_TANK_01.LEVEL_PV', 'JF-LC-17', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-17.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-17', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-17.DOSING_TANK_02.LEVEL_PV', 'JF-LC-17', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-17.MACHINE.PROCESS_STEP_CODE', 'JF-LC-17', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-17.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-17', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LC-18', 'jetflow', 'LC', 'Lane C', 'Jetflow Lane C 18', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LC-18', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-18.MAIN_TANK.TEMPERATURE_PV', 'JF-LC-18', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-18.MAIN_TANK.TEMPERATURE_SV', 'JF-LC-18', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-18.MAIN_TANK.LEVEL_PV', 'JF-LC-18', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-18.MAIN_TANK.LEVEL_SV', 'JF-LC-18', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-18.WATER_INLET.FLOW_PV', 'JF-LC-18', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-18.WATER_INLET.FLOW_TOTAL', 'JF-LC-18', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-18.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LC-18', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-18.DOSING_TANK_01.LEVEL_PV', 'JF-LC-18', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-18.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LC-18', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-18.DOSING_TANK_02.LEVEL_PV', 'JF-LC-18', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-18.MACHINE.PROCESS_STEP_CODE', 'JF-LC-18', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LC-18.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LC-18', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-01', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 01', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-01.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-01', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-01.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-01', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-01.MAIN_TANK.LEVEL_PV', 'JF-LD-01', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-01.MAIN_TANK.LEVEL_SV', 'JF-LD-01', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-01.WATER_INLET.FLOW_PV', 'JF-LD-01', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-01.WATER_INLET.FLOW_TOTAL', 'JF-LD-01', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-01.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-01', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-01.DOSING_TANK_01.LEVEL_PV', 'JF-LD-01', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-01.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-01', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-01.DOSING_TANK_02.LEVEL_PV', 'JF-LD-01', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-01.MACHINE.PROCESS_STEP_CODE', 'JF-LD-01', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-01.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-02', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 02', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-02.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-02', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-02.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-02', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-02.MAIN_TANK.LEVEL_PV', 'JF-LD-02', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-02.MAIN_TANK.LEVEL_SV', 'JF-LD-02', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-02.WATER_INLET.FLOW_PV', 'JF-LD-02', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-02.WATER_INLET.FLOW_TOTAL', 'JF-LD-02', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-02.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-02', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-02.DOSING_TANK_01.LEVEL_PV', 'JF-LD-02', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-02.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-02', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-02.DOSING_TANK_02.LEVEL_PV', 'JF-LD-02', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-02.MACHINE.PROCESS_STEP_CODE', 'JF-LD-02', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-02.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-03', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 03', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-03', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-03.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-03', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-03.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-03', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-03.MAIN_TANK.LEVEL_PV', 'JF-LD-03', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-03.MAIN_TANK.LEVEL_SV', 'JF-LD-03', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-03.WATER_INLET.FLOW_PV', 'JF-LD-03', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-03.WATER_INLET.FLOW_TOTAL', 'JF-LD-03', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-03.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-03', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-03.DOSING_TANK_01.LEVEL_PV', 'JF-LD-03', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-03.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-03', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-03.DOSING_TANK_02.LEVEL_PV', 'JF-LD-03', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-03.MACHINE.PROCESS_STEP_CODE', 'JF-LD-03', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-03.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-03', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-04', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 04', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-04', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-04.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-04', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-04.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-04', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-04.MAIN_TANK.LEVEL_PV', 'JF-LD-04', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-04.MAIN_TANK.LEVEL_SV', 'JF-LD-04', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-04.WATER_INLET.FLOW_PV', 'JF-LD-04', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-04.WATER_INLET.FLOW_TOTAL', 'JF-LD-04', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-04.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-04', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-04.DOSING_TANK_01.LEVEL_PV', 'JF-LD-04', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-04.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-04', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-04.DOSING_TANK_02.LEVEL_PV', 'JF-LD-04', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-04.MACHINE.PROCESS_STEP_CODE', 'JF-LD-04', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-04.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-04', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-05', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 05', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-05', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-05.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-05', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-05.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-05', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-05.MAIN_TANK.LEVEL_PV', 'JF-LD-05', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-05.MAIN_TANK.LEVEL_SV', 'JF-LD-05', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-05.WATER_INLET.FLOW_PV', 'JF-LD-05', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-05.WATER_INLET.FLOW_TOTAL', 'JF-LD-05', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-05.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-05', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-05.DOSING_TANK_01.LEVEL_PV', 'JF-LD-05', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-05.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-05', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-05.DOSING_TANK_02.LEVEL_PV', 'JF-LD-05', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-05.MACHINE.PROCESS_STEP_CODE', 'JF-LD-05', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-05.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-05', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-06', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 06', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-06', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-06.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-06', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-06.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-06', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-06.MAIN_TANK.LEVEL_PV', 'JF-LD-06', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-06.MAIN_TANK.LEVEL_SV', 'JF-LD-06', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-06.WATER_INLET.FLOW_PV', 'JF-LD-06', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-06.WATER_INLET.FLOW_TOTAL', 'JF-LD-06', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-06.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-06', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-06.DOSING_TANK_01.LEVEL_PV', 'JF-LD-06', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-06.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-06', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-06.DOSING_TANK_02.LEVEL_PV', 'JF-LD-06', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-06.MACHINE.PROCESS_STEP_CODE', 'JF-LD-06', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-06.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-06', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-07', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 07', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-07', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-07.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-07', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-07.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-07', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-07.MAIN_TANK.LEVEL_PV', 'JF-LD-07', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-07.MAIN_TANK.LEVEL_SV', 'JF-LD-07', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-07.WATER_INLET.FLOW_PV', 'JF-LD-07', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-07.WATER_INLET.FLOW_TOTAL', 'JF-LD-07', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-07.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-07', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-07.DOSING_TANK_01.LEVEL_PV', 'JF-LD-07', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-07.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-07', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-07.DOSING_TANK_02.LEVEL_PV', 'JF-LD-07', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-07.MACHINE.PROCESS_STEP_CODE', 'JF-LD-07', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-07.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-07', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-08', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 08', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-08', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-08.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-08', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-08.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-08', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-08.MAIN_TANK.LEVEL_PV', 'JF-LD-08', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-08.MAIN_TANK.LEVEL_SV', 'JF-LD-08', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-08.WATER_INLET.FLOW_PV', 'JF-LD-08', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-08.WATER_INLET.FLOW_TOTAL', 'JF-LD-08', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-08.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-08', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-08.DOSING_TANK_01.LEVEL_PV', 'JF-LD-08', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-08.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-08', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-08.DOSING_TANK_02.LEVEL_PV', 'JF-LD-08', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-08.MACHINE.PROCESS_STEP_CODE', 'JF-LD-08', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-08.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-08', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-09', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 09', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-09', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-09.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-09', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-09.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-09', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-09.MAIN_TANK.LEVEL_PV', 'JF-LD-09', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-09.MAIN_TANK.LEVEL_SV', 'JF-LD-09', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-09.WATER_INLET.FLOW_PV', 'JF-LD-09', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-09.WATER_INLET.FLOW_TOTAL', 'JF-LD-09', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-09.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-09', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-09.DOSING_TANK_01.LEVEL_PV', 'JF-LD-09', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-09.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-09', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-09.DOSING_TANK_02.LEVEL_PV', 'JF-LD-09', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-09.MACHINE.PROCESS_STEP_CODE', 'JF-LD-09', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-09.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-09', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-10', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 10', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-10', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-10.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-10', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-10.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-10', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-10.MAIN_TANK.LEVEL_PV', 'JF-LD-10', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-10.MAIN_TANK.LEVEL_SV', 'JF-LD-10', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-10.WATER_INLET.FLOW_PV', 'JF-LD-10', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-10.WATER_INLET.FLOW_TOTAL', 'JF-LD-10', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-10.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-10', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-10.DOSING_TANK_01.LEVEL_PV', 'JF-LD-10', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-10.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-10', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-10.DOSING_TANK_02.LEVEL_PV', 'JF-LD-10', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-10.MACHINE.PROCESS_STEP_CODE', 'JF-LD-10', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-10.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-10', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-11', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 11', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-11', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-11.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-11', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-11.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-11', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-11.MAIN_TANK.LEVEL_PV', 'JF-LD-11', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-11.MAIN_TANK.LEVEL_SV', 'JF-LD-11', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-11.WATER_INLET.FLOW_PV', 'JF-LD-11', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-11.WATER_INLET.FLOW_TOTAL', 'JF-LD-11', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-11.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-11', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-11.DOSING_TANK_01.LEVEL_PV', 'JF-LD-11', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-11.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-11', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-11.DOSING_TANK_02.LEVEL_PV', 'JF-LD-11', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-11.MACHINE.PROCESS_STEP_CODE', 'JF-LD-11', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-11.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-11', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-12', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 12', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-12', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-12.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-12', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-12.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-12', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-12.MAIN_TANK.LEVEL_PV', 'JF-LD-12', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-12.MAIN_TANK.LEVEL_SV', 'JF-LD-12', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-12.WATER_INLET.FLOW_PV', 'JF-LD-12', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-12.WATER_INLET.FLOW_TOTAL', 'JF-LD-12', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-12.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-12', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-12.DOSING_TANK_01.LEVEL_PV', 'JF-LD-12', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-12.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-12', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-12.DOSING_TANK_02.LEVEL_PV', 'JF-LD-12', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-12.MACHINE.PROCESS_STEP_CODE', 'JF-LD-12', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-12.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-12', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-13', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 13', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-13', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-13.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-13', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-13.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-13', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-13.MAIN_TANK.LEVEL_PV', 'JF-LD-13', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-13.MAIN_TANK.LEVEL_SV', 'JF-LD-13', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-13.WATER_INLET.FLOW_PV', 'JF-LD-13', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-13.WATER_INLET.FLOW_TOTAL', 'JF-LD-13', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-13.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-13', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-13.DOSING_TANK_01.LEVEL_PV', 'JF-LD-13', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-13.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-13', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-13.DOSING_TANK_02.LEVEL_PV', 'JF-LD-13', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-13.MACHINE.PROCESS_STEP_CODE', 'JF-LD-13', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-13.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-13', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-14', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 14', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-14', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-14.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-14', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-14.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-14', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-14.MAIN_TANK.LEVEL_PV', 'JF-LD-14', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-14.MAIN_TANK.LEVEL_SV', 'JF-LD-14', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-14.WATER_INLET.FLOW_PV', 'JF-LD-14', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-14.WATER_INLET.FLOW_TOTAL', 'JF-LD-14', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-14.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-14', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-14.DOSING_TANK_01.LEVEL_PV', 'JF-LD-14', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-14.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-14', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-14.DOSING_TANK_02.LEVEL_PV', 'JF-LD-14', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-14.MACHINE.PROCESS_STEP_CODE', 'JF-LD-14', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-14.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-14', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-15', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 15', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-15', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-15.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-15', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-15.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-15', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-15.MAIN_TANK.LEVEL_PV', 'JF-LD-15', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-15.MAIN_TANK.LEVEL_SV', 'JF-LD-15', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-15.WATER_INLET.FLOW_PV', 'JF-LD-15', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-15.WATER_INLET.FLOW_TOTAL', 'JF-LD-15', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-15.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-15', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-15.DOSING_TANK_01.LEVEL_PV', 'JF-LD-15', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-15.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-15', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-15.DOSING_TANK_02.LEVEL_PV', 'JF-LD-15', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-15.MACHINE.PROCESS_STEP_CODE', 'JF-LD-15', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-15.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-15', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-16', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 16', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-16', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-16.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-16', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-16.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-16', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-16.MAIN_TANK.LEVEL_PV', 'JF-LD-16', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-16.MAIN_TANK.LEVEL_SV', 'JF-LD-16', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-16.WATER_INLET.FLOW_PV', 'JF-LD-16', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-16.WATER_INLET.FLOW_TOTAL', 'JF-LD-16', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-16.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-16', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-16.DOSING_TANK_01.LEVEL_PV', 'JF-LD-16', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-16.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-16', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-16.DOSING_TANK_02.LEVEL_PV', 'JF-LD-16', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-16.MACHINE.PROCESS_STEP_CODE', 'JF-LD-16', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-16.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-16', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-17', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 17', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-17', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-17.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-17', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-17.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-17', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-17.MAIN_TANK.LEVEL_PV', 'JF-LD-17', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-17.MAIN_TANK.LEVEL_SV', 'JF-LD-17', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-17.WATER_INLET.FLOW_PV', 'JF-LD-17', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-17.WATER_INLET.FLOW_TOTAL', 'JF-LD-17', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-17.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-17', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-17.DOSING_TANK_01.LEVEL_PV', 'JF-LD-17', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-17.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-17', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-17.DOSING_TANK_02.LEVEL_PV', 'JF-LD-17', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-17.MACHINE.PROCESS_STEP_CODE', 'JF-LD-17', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-17.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-17', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LD-18', 'jetflow', 'LD', 'Lane D', 'Jetflow Lane D 18', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LD-18', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-18.MAIN_TANK.TEMPERATURE_PV', 'JF-LD-18', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-18.MAIN_TANK.TEMPERATURE_SV', 'JF-LD-18', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-18.MAIN_TANK.LEVEL_PV', 'JF-LD-18', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-18.MAIN_TANK.LEVEL_SV', 'JF-LD-18', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-18.WATER_INLET.FLOW_PV', 'JF-LD-18', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-18.WATER_INLET.FLOW_TOTAL', 'JF-LD-18', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-18.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LD-18', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-18.DOSING_TANK_01.LEVEL_PV', 'JF-LD-18', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-18.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LD-18', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-18.DOSING_TANK_02.LEVEL_PV', 'JF-LD-18', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-18.MACHINE.PROCESS_STEP_CODE', 'JF-LD-18', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LD-18.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LD-18', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-01', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 01', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-01.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-01', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-01.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-01', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-01.MAIN_TANK.LEVEL_PV', 'JF-LE-01', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-01.MAIN_TANK.LEVEL_SV', 'JF-LE-01', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-01.WATER_INLET.FLOW_PV', 'JF-LE-01', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-01.WATER_INLET.FLOW_TOTAL', 'JF-LE-01', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-01.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-01', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-01.DOSING_TANK_01.LEVEL_PV', 'JF-LE-01', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-01.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-01', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-01.DOSING_TANK_02.LEVEL_PV', 'JF-LE-01', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-01.MACHINE.PROCESS_STEP_CODE', 'JF-LE-01', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-01.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-02', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 02', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-02.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-02', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-02.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-02', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-02.MAIN_TANK.LEVEL_PV', 'JF-LE-02', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-02.MAIN_TANK.LEVEL_SV', 'JF-LE-02', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-02.WATER_INLET.FLOW_PV', 'JF-LE-02', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-02.WATER_INLET.FLOW_TOTAL', 'JF-LE-02', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-02.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-02', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-02.DOSING_TANK_01.LEVEL_PV', 'JF-LE-02', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-02.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-02', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-02.DOSING_TANK_02.LEVEL_PV', 'JF-LE-02', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-02.MACHINE.PROCESS_STEP_CODE', 'JF-LE-02', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-02.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-03', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 03', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-03', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-03.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-03', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-03.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-03', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-03.MAIN_TANK.LEVEL_PV', 'JF-LE-03', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-03.MAIN_TANK.LEVEL_SV', 'JF-LE-03', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-03.WATER_INLET.FLOW_PV', 'JF-LE-03', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-03.WATER_INLET.FLOW_TOTAL', 'JF-LE-03', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-03.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-03', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-03.DOSING_TANK_01.LEVEL_PV', 'JF-LE-03', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-03.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-03', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-03.DOSING_TANK_02.LEVEL_PV', 'JF-LE-03', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-03.MACHINE.PROCESS_STEP_CODE', 'JF-LE-03', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-03.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-03', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-04', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 04', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-04', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-04.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-04', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-04.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-04', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-04.MAIN_TANK.LEVEL_PV', 'JF-LE-04', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-04.MAIN_TANK.LEVEL_SV', 'JF-LE-04', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-04.WATER_INLET.FLOW_PV', 'JF-LE-04', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-04.WATER_INLET.FLOW_TOTAL', 'JF-LE-04', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-04.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-04', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-04.DOSING_TANK_01.LEVEL_PV', 'JF-LE-04', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-04.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-04', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-04.DOSING_TANK_02.LEVEL_PV', 'JF-LE-04', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-04.MACHINE.PROCESS_STEP_CODE', 'JF-LE-04', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-04.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-04', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-05', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 05', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-05', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-05.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-05', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-05.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-05', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-05.MAIN_TANK.LEVEL_PV', 'JF-LE-05', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-05.MAIN_TANK.LEVEL_SV', 'JF-LE-05', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-05.WATER_INLET.FLOW_PV', 'JF-LE-05', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-05.WATER_INLET.FLOW_TOTAL', 'JF-LE-05', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-05.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-05', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-05.DOSING_TANK_01.LEVEL_PV', 'JF-LE-05', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-05.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-05', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-05.DOSING_TANK_02.LEVEL_PV', 'JF-LE-05', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-05.MACHINE.PROCESS_STEP_CODE', 'JF-LE-05', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-05.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-05', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-06', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 06', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-06', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-06.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-06', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-06.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-06', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-06.MAIN_TANK.LEVEL_PV', 'JF-LE-06', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-06.MAIN_TANK.LEVEL_SV', 'JF-LE-06', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-06.WATER_INLET.FLOW_PV', 'JF-LE-06', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-06.WATER_INLET.FLOW_TOTAL', 'JF-LE-06', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-06.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-06', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-06.DOSING_TANK_01.LEVEL_PV', 'JF-LE-06', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-06.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-06', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-06.DOSING_TANK_02.LEVEL_PV', 'JF-LE-06', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-06.MACHINE.PROCESS_STEP_CODE', 'JF-LE-06', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-06.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-06', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-07', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 07', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-07', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-07.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-07', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-07.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-07', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-07.MAIN_TANK.LEVEL_PV', 'JF-LE-07', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-07.MAIN_TANK.LEVEL_SV', 'JF-LE-07', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-07.WATER_INLET.FLOW_PV', 'JF-LE-07', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-07.WATER_INLET.FLOW_TOTAL', 'JF-LE-07', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-07.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-07', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-07.DOSING_TANK_01.LEVEL_PV', 'JF-LE-07', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-07.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-07', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-07.DOSING_TANK_02.LEVEL_PV', 'JF-LE-07', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-07.MACHINE.PROCESS_STEP_CODE', 'JF-LE-07', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-07.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-07', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-08', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 08', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-08', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-08.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-08', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-08.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-08', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-08.MAIN_TANK.LEVEL_PV', 'JF-LE-08', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-08.MAIN_TANK.LEVEL_SV', 'JF-LE-08', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-08.WATER_INLET.FLOW_PV', 'JF-LE-08', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-08.WATER_INLET.FLOW_TOTAL', 'JF-LE-08', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-08.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-08', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-08.DOSING_TANK_01.LEVEL_PV', 'JF-LE-08', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-08.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-08', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-08.DOSING_TANK_02.LEVEL_PV', 'JF-LE-08', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-08.MACHINE.PROCESS_STEP_CODE', 'JF-LE-08', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-08.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-08', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-09', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 09', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-09', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-09.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-09', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-09.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-09', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-09.MAIN_TANK.LEVEL_PV', 'JF-LE-09', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-09.MAIN_TANK.LEVEL_SV', 'JF-LE-09', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-09.WATER_INLET.FLOW_PV', 'JF-LE-09', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-09.WATER_INLET.FLOW_TOTAL', 'JF-LE-09', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-09.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-09', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-09.DOSING_TANK_01.LEVEL_PV', 'JF-LE-09', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-09.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-09', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-09.DOSING_TANK_02.LEVEL_PV', 'JF-LE-09', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-09.MACHINE.PROCESS_STEP_CODE', 'JF-LE-09', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-09.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-09', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-10', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 10', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-10', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-10.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-10', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-10.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-10', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-10.MAIN_TANK.LEVEL_PV', 'JF-LE-10', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-10.MAIN_TANK.LEVEL_SV', 'JF-LE-10', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-10.WATER_INLET.FLOW_PV', 'JF-LE-10', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-10.WATER_INLET.FLOW_TOTAL', 'JF-LE-10', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-10.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-10', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-10.DOSING_TANK_01.LEVEL_PV', 'JF-LE-10', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-10.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-10', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-10.DOSING_TANK_02.LEVEL_PV', 'JF-LE-10', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-10.MACHINE.PROCESS_STEP_CODE', 'JF-LE-10', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-10.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-10', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-11', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 11', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-11', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-11.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-11', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-11.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-11', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-11.MAIN_TANK.LEVEL_PV', 'JF-LE-11', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-11.MAIN_TANK.LEVEL_SV', 'JF-LE-11', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-11.WATER_INLET.FLOW_PV', 'JF-LE-11', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-11.WATER_INLET.FLOW_TOTAL', 'JF-LE-11', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-11.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-11', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-11.DOSING_TANK_01.LEVEL_PV', 'JF-LE-11', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-11.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-11', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-11.DOSING_TANK_02.LEVEL_PV', 'JF-LE-11', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-11.MACHINE.PROCESS_STEP_CODE', 'JF-LE-11', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-11.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-11', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-12', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 12', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-12', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-12.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-12', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-12.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-12', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-12.MAIN_TANK.LEVEL_PV', 'JF-LE-12', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-12.MAIN_TANK.LEVEL_SV', 'JF-LE-12', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-12.WATER_INLET.FLOW_PV', 'JF-LE-12', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-12.WATER_INLET.FLOW_TOTAL', 'JF-LE-12', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-12.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-12', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-12.DOSING_TANK_01.LEVEL_PV', 'JF-LE-12', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-12.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-12', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-12.DOSING_TANK_02.LEVEL_PV', 'JF-LE-12', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-12.MACHINE.PROCESS_STEP_CODE', 'JF-LE-12', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-12.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-12', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LE-13', 'jetflow', 'LE', 'Lane E', 'Jetflow Lane E 13', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LE-13', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-13.MAIN_TANK.TEMPERATURE_PV', 'JF-LE-13', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-13.MAIN_TANK.TEMPERATURE_SV', 'JF-LE-13', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-13.MAIN_TANK.LEVEL_PV', 'JF-LE-13', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-13.MAIN_TANK.LEVEL_SV', 'JF-LE-13', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-13.WATER_INLET.FLOW_PV', 'JF-LE-13', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-13.WATER_INLET.FLOW_TOTAL', 'JF-LE-13', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-13.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LE-13', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-13.DOSING_TANK_01.LEVEL_PV', 'JF-LE-13', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-13.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LE-13', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-13.DOSING_TANK_02.LEVEL_PV', 'JF-LE-13', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-13.MACHINE.PROCESS_STEP_CODE', 'JF-LE-13', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LE-13.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LE-13', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-01', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 01', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-01.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-01', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-01.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-01', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-01.MAIN_TANK.LEVEL_PV', 'JF-LF-01', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-01.MAIN_TANK.LEVEL_SV', 'JF-LF-01', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-01.WATER_INLET.FLOW_PV', 'JF-LF-01', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-01.WATER_INLET.FLOW_TOTAL', 'JF-LF-01', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-01.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-01', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-01.DOSING_TANK_01.LEVEL_PV', 'JF-LF-01', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-01.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-01', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-01.DOSING_TANK_02.LEVEL_PV', 'JF-LF-01', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-01.MACHINE.PROCESS_STEP_CODE', 'JF-LF-01', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-01.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-02', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 02', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-02.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-02', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-02.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-02', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-02.MAIN_TANK.LEVEL_PV', 'JF-LF-02', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-02.MAIN_TANK.LEVEL_SV', 'JF-LF-02', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-02.WATER_INLET.FLOW_PV', 'JF-LF-02', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-02.WATER_INLET.FLOW_TOTAL', 'JF-LF-02', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-02.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-02', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-02.DOSING_TANK_01.LEVEL_PV', 'JF-LF-02', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-02.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-02', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-02.DOSING_TANK_02.LEVEL_PV', 'JF-LF-02', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-02.MACHINE.PROCESS_STEP_CODE', 'JF-LF-02', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-02.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-03', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 03', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-03', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-03.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-03', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-03.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-03', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-03.MAIN_TANK.LEVEL_PV', 'JF-LF-03', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-03.MAIN_TANK.LEVEL_SV', 'JF-LF-03', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-03.WATER_INLET.FLOW_PV', 'JF-LF-03', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-03.WATER_INLET.FLOW_TOTAL', 'JF-LF-03', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-03.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-03', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-03.DOSING_TANK_01.LEVEL_PV', 'JF-LF-03', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-03.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-03', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-03.DOSING_TANK_02.LEVEL_PV', 'JF-LF-03', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-03.MACHINE.PROCESS_STEP_CODE', 'JF-LF-03', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-03.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-03', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-04', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 04', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-04', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-04.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-04', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-04.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-04', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-04.MAIN_TANK.LEVEL_PV', 'JF-LF-04', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-04.MAIN_TANK.LEVEL_SV', 'JF-LF-04', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-04.WATER_INLET.FLOW_PV', 'JF-LF-04', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-04.WATER_INLET.FLOW_TOTAL', 'JF-LF-04', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-04.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-04', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-04.DOSING_TANK_01.LEVEL_PV', 'JF-LF-04', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-04.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-04', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-04.DOSING_TANK_02.LEVEL_PV', 'JF-LF-04', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-04.MACHINE.PROCESS_STEP_CODE', 'JF-LF-04', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-04.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-04', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-05', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 05', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-05', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-05.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-05', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-05.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-05', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-05.MAIN_TANK.LEVEL_PV', 'JF-LF-05', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-05.MAIN_TANK.LEVEL_SV', 'JF-LF-05', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-05.WATER_INLET.FLOW_PV', 'JF-LF-05', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-05.WATER_INLET.FLOW_TOTAL', 'JF-LF-05', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-05.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-05', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-05.DOSING_TANK_01.LEVEL_PV', 'JF-LF-05', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-05.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-05', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-05.DOSING_TANK_02.LEVEL_PV', 'JF-LF-05', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-05.MACHINE.PROCESS_STEP_CODE', 'JF-LF-05', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-05.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-05', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-06', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 06', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-06', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-06.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-06', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-06.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-06', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-06.MAIN_TANK.LEVEL_PV', 'JF-LF-06', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-06.MAIN_TANK.LEVEL_SV', 'JF-LF-06', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-06.WATER_INLET.FLOW_PV', 'JF-LF-06', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-06.WATER_INLET.FLOW_TOTAL', 'JF-LF-06', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-06.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-06', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-06.DOSING_TANK_01.LEVEL_PV', 'JF-LF-06', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-06.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-06', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-06.DOSING_TANK_02.LEVEL_PV', 'JF-LF-06', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-06.MACHINE.PROCESS_STEP_CODE', 'JF-LF-06', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-06.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-06', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-07', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 07', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-07', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-07.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-07', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-07.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-07', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-07.MAIN_TANK.LEVEL_PV', 'JF-LF-07', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-07.MAIN_TANK.LEVEL_SV', 'JF-LF-07', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-07.WATER_INLET.FLOW_PV', 'JF-LF-07', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-07.WATER_INLET.FLOW_TOTAL', 'JF-LF-07', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-07.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-07', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-07.DOSING_TANK_01.LEVEL_PV', 'JF-LF-07', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-07.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-07', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-07.DOSING_TANK_02.LEVEL_PV', 'JF-LF-07', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-07.MACHINE.PROCESS_STEP_CODE', 'JF-LF-07', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-07.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-07', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-08', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 08', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-08', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-08.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-08', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-08.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-08', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-08.MAIN_TANK.LEVEL_PV', 'JF-LF-08', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-08.MAIN_TANK.LEVEL_SV', 'JF-LF-08', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-08.WATER_INLET.FLOW_PV', 'JF-LF-08', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-08.WATER_INLET.FLOW_TOTAL', 'JF-LF-08', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-08.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-08', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-08.DOSING_TANK_01.LEVEL_PV', 'JF-LF-08', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-08.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-08', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-08.DOSING_TANK_02.LEVEL_PV', 'JF-LF-08', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-08.MACHINE.PROCESS_STEP_CODE', 'JF-LF-08', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-08.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-08', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-09', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 09', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-09', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-09.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-09', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-09.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-09', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-09.MAIN_TANK.LEVEL_PV', 'JF-LF-09', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-09.MAIN_TANK.LEVEL_SV', 'JF-LF-09', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-09.WATER_INLET.FLOW_PV', 'JF-LF-09', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-09.WATER_INLET.FLOW_TOTAL', 'JF-LF-09', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-09.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-09', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-09.DOSING_TANK_01.LEVEL_PV', 'JF-LF-09', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-09.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-09', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-09.DOSING_TANK_02.LEVEL_PV', 'JF-LF-09', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-09.MACHINE.PROCESS_STEP_CODE', 'JF-LF-09', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-09.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-09', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-10', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 10', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-10', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-10.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-10', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-10.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-10', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-10.MAIN_TANK.LEVEL_PV', 'JF-LF-10', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-10.MAIN_TANK.LEVEL_SV', 'JF-LF-10', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-10.WATER_INLET.FLOW_PV', 'JF-LF-10', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-10.WATER_INLET.FLOW_TOTAL', 'JF-LF-10', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-10.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-10', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-10.DOSING_TANK_01.LEVEL_PV', 'JF-LF-10', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-10.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-10', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-10.DOSING_TANK_02.LEVEL_PV', 'JF-LF-10', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-10.MACHINE.PROCESS_STEP_CODE', 'JF-LF-10', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-10.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-10', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-11', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 11', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-11', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-11.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-11', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-11.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-11', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-11.MAIN_TANK.LEVEL_PV', 'JF-LF-11', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-11.MAIN_TANK.LEVEL_SV', 'JF-LF-11', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-11.WATER_INLET.FLOW_PV', 'JF-LF-11', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-11.WATER_INLET.FLOW_TOTAL', 'JF-LF-11', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-11.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-11', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-11.DOSING_TANK_01.LEVEL_PV', 'JF-LF-11', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-11.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-11', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-11.DOSING_TANK_02.LEVEL_PV', 'JF-LF-11', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-11.MACHINE.PROCESS_STEP_CODE', 'JF-LF-11', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-11.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-11', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-12', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 12', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-12', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-12.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-12', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-12.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-12', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-12.MAIN_TANK.LEVEL_PV', 'JF-LF-12', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-12.MAIN_TANK.LEVEL_SV', 'JF-LF-12', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-12.WATER_INLET.FLOW_PV', 'JF-LF-12', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-12.WATER_INLET.FLOW_TOTAL', 'JF-LF-12', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-12.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-12', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-12.DOSING_TANK_01.LEVEL_PV', 'JF-LF-12', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-12.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-12', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-12.DOSING_TANK_02.LEVEL_PV', 'JF-LF-12', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-12.MACHINE.PROCESS_STEP_CODE', 'JF-LF-12', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-12.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-12', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-13', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 13', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-13', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-13.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-13', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-13.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-13', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-13.MAIN_TANK.LEVEL_PV', 'JF-LF-13', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-13.MAIN_TANK.LEVEL_SV', 'JF-LF-13', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-13.WATER_INLET.FLOW_PV', 'JF-LF-13', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-13.WATER_INLET.FLOW_TOTAL', 'JF-LF-13', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-13.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-13', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-13.DOSING_TANK_01.LEVEL_PV', 'JF-LF-13', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-13.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-13', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-13.DOSING_TANK_02.LEVEL_PV', 'JF-LF-13', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-13.MACHINE.PROCESS_STEP_CODE', 'JF-LF-13', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-13.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-13', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-14', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 14', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-14', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-14.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-14', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-14.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-14', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-14.MAIN_TANK.LEVEL_PV', 'JF-LF-14', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-14.MAIN_TANK.LEVEL_SV', 'JF-LF-14', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-14.WATER_INLET.FLOW_PV', 'JF-LF-14', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-14.WATER_INLET.FLOW_TOTAL', 'JF-LF-14', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-14.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-14', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-14.DOSING_TANK_01.LEVEL_PV', 'JF-LF-14', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-14.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-14', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-14.DOSING_TANK_02.LEVEL_PV', 'JF-LF-14', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-14.MACHINE.PROCESS_STEP_CODE', 'JF-LF-14', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-14.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-14', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('JF-LF-15', 'jetflow', 'LF', 'Lane F', 'Jetflow Lane F 15', '3 Winch', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('JF-LF-15', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-15.MAIN_TANK.TEMPERATURE_PV', 'JF-LF-15', 'MAIN_TANK_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-15.MAIN_TANK.TEMPERATURE_SV', 'JF-LF-15', 'MAIN_TANK_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-15.MAIN_TANK.LEVEL_PV', 'JF-LF-15', 'MAIN_TANK_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-15.MAIN_TANK.LEVEL_SV', 'JF-LF-15', 'MAIN_TANK_LEVEL_SV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-15.WATER_INLET.FLOW_PV', 'JF-LF-15', 'WATER_FLOW_PV', 'm³/h', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-15.WATER_INLET.FLOW_TOTAL', 'JF-LF-15', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-15.DOSING_TANK_01.TEMPERATURE_PV', 'JF-LF-15', 'DOSING_TANK_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-15.DOSING_TANK_01.LEVEL_PV', 'JF-LF-15', 'DOSING_TANK_1_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-15.DOSING_TANK_02.TEMPERATURE_PV', 'JF-LF-15', 'DOSING_TANK_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-15.DOSING_TANK_02.LEVEL_PV', 'JF-LF-15', 'DOSING_TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-15.MACHINE.PROCESS_STEP_CODE', 'JF-LF-15', 'PROCESS_STEP_CODE', NULL, 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.JF-LF-15.PRODUCTION.OUTPUT_TOTAL_M', 'JF-LF-15', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

-- ============================================================================
-- PROCESS: CALATOR (Calator)
-- ============================================================================

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-DPN-01', 'calator', 'DPN', 'Depan', 'Calator Depan 01', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-DPN-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-01.FEEDING.SPEED_PV', 'CL-DPN-01', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-01.FEEDING.SPEED_SV', 'CL-DPN-01', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-01.SQUEEZING_01.SPEED_PV', 'CL-DPN-01', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-01.SQUEEZING_02.SPEED_PV', 'CL-DPN-01', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-01.OVERFEED_OUT.SPEED_PV', 'CL-DPN-01', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-01.OVERFEED_OUT.SPEED_SV', 'CL-DPN-01', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-01.DANCER.POSITION_PV', 'CL-DPN-01', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-01.FOLDER.SPEED_PV', 'CL-DPN-01', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-01.PLAITING.SPEED_PV', 'CL-DPN-01', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-01.WATER_INLET.FLOW_TOTAL', 'CL-DPN-01', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-01.PRODUCTION.OUTPUT_TOTAL_M', 'CL-DPN-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-DPN-02', 'calator', 'DPN', 'Depan', 'Calator Depan 02', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-DPN-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-02.FEEDING.SPEED_PV', 'CL-DPN-02', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-02.FEEDING.SPEED_SV', 'CL-DPN-02', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-02.SQUEEZING_01.SPEED_PV', 'CL-DPN-02', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-02.SQUEEZING_02.SPEED_PV', 'CL-DPN-02', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-02.OVERFEED_OUT.SPEED_PV', 'CL-DPN-02', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-02.OVERFEED_OUT.SPEED_SV', 'CL-DPN-02', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-02.DANCER.POSITION_PV', 'CL-DPN-02', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-02.FOLDER.SPEED_PV', 'CL-DPN-02', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-02.PLAITING.SPEED_PV', 'CL-DPN-02', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-02.WATER_INLET.FLOW_TOTAL', 'CL-DPN-02', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-DPN-02.PRODUCTION.OUTPUT_TOTAL_M', 'CL-DPN-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-BLK-01', 'calator', 'BLK', 'Belakang', 'Calator Belakang 01', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-BLK-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-01.FEEDING.SPEED_PV', 'CL-BLK-01', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-01.FEEDING.SPEED_SV', 'CL-BLK-01', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-01.SQUEEZING_01.SPEED_PV', 'CL-BLK-01', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-01.SQUEEZING_02.SPEED_PV', 'CL-BLK-01', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-01.OVERFEED_OUT.SPEED_PV', 'CL-BLK-01', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-01.OVERFEED_OUT.SPEED_SV', 'CL-BLK-01', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-01.DANCER.POSITION_PV', 'CL-BLK-01', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-01.FOLDER.SPEED_PV', 'CL-BLK-01', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-01.PLAITING.SPEED_PV', 'CL-BLK-01', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-01.WATER_INLET.FLOW_TOTAL', 'CL-BLK-01', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-01.PRODUCTION.OUTPUT_TOTAL_M', 'CL-BLK-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-BLK-02', 'calator', 'BLK', 'Belakang', 'Calator Belakang 02', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-BLK-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-02.FEEDING.SPEED_PV', 'CL-BLK-02', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-02.FEEDING.SPEED_SV', 'CL-BLK-02', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-02.SQUEEZING_01.SPEED_PV', 'CL-BLK-02', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-02.SQUEEZING_02.SPEED_PV', 'CL-BLK-02', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-02.OVERFEED_OUT.SPEED_PV', 'CL-BLK-02', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-02.OVERFEED_OUT.SPEED_SV', 'CL-BLK-02', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-02.DANCER.POSITION_PV', 'CL-BLK-02', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-02.FOLDER.SPEED_PV', 'CL-BLK-02', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-02.PLAITING.SPEED_PV', 'CL-BLK-02', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-02.WATER_INLET.FLOW_TOTAL', 'CL-BLK-02', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-02.PRODUCTION.OUTPUT_TOTAL_M', 'CL-BLK-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-BLK-03', 'calator', 'BLK', 'Belakang', 'Calator Belakang 03', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-BLK-03', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-03.FEEDING.SPEED_PV', 'CL-BLK-03', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-03.FEEDING.SPEED_SV', 'CL-BLK-03', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-03.SQUEEZING_01.SPEED_PV', 'CL-BLK-03', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-03.SQUEEZING_02.SPEED_PV', 'CL-BLK-03', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-03.OVERFEED_OUT.SPEED_PV', 'CL-BLK-03', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-03.OVERFEED_OUT.SPEED_SV', 'CL-BLK-03', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-03.DANCER.POSITION_PV', 'CL-BLK-03', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-03.FOLDER.SPEED_PV', 'CL-BLK-03', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-03.PLAITING.SPEED_PV', 'CL-BLK-03', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-03.WATER_INLET.FLOW_TOTAL', 'CL-BLK-03', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-03.PRODUCTION.OUTPUT_TOTAL_M', 'CL-BLK-03', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-BLK-04', 'calator', 'BLK', 'Belakang', 'Calator Belakang 04', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-BLK-04', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-04.FEEDING.SPEED_PV', 'CL-BLK-04', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-04.FEEDING.SPEED_SV', 'CL-BLK-04', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-04.SQUEEZING_01.SPEED_PV', 'CL-BLK-04', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-04.SQUEEZING_02.SPEED_PV', 'CL-BLK-04', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-04.OVERFEED_OUT.SPEED_PV', 'CL-BLK-04', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-04.OVERFEED_OUT.SPEED_SV', 'CL-BLK-04', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-04.DANCER.POSITION_PV', 'CL-BLK-04', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-04.FOLDER.SPEED_PV', 'CL-BLK-04', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-04.PLAITING.SPEED_PV', 'CL-BLK-04', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-04.WATER_INLET.FLOW_TOTAL', 'CL-BLK-04', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-04.PRODUCTION.OUTPUT_TOTAL_M', 'CL-BLK-04', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-BLK-05', 'calator', 'BLK', 'Belakang', 'Calator Belakang 05', 'Bianco', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-BLK-05', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-05.FEEDING.SPEED_PV', 'CL-BLK-05', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-05.FEEDING.SPEED_SV', 'CL-BLK-05', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-05.SQUEEZING_01.SPEED_PV', 'CL-BLK-05', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-05.SQUEEZING_02.SPEED_PV', 'CL-BLK-05', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-05.OVERFEED_OUT.SPEED_PV', 'CL-BLK-05', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-05.OVERFEED_OUT.SPEED_SV', 'CL-BLK-05', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-05.DANCER.POSITION_PV', 'CL-BLK-05', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-05.FOLDER.SPEED_PV', 'CL-BLK-05', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-05.PLAITING.SPEED_PV', 'CL-BLK-05', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-05.WATER_INLET.FLOW_TOTAL', 'CL-BLK-05', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-05.PRODUCTION.OUTPUT_TOTAL_M', 'CL-BLK-05', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-BLK-06', 'calator', 'BLK', 'Belakang', 'Calator Belakang 06', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-BLK-06', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-06.FEEDING.SPEED_PV', 'CL-BLK-06', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-06.FEEDING.SPEED_SV', 'CL-BLK-06', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-06.SQUEEZING_01.SPEED_PV', 'CL-BLK-06', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-06.SQUEEZING_02.SPEED_PV', 'CL-BLK-06', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-06.OVERFEED_OUT.SPEED_PV', 'CL-BLK-06', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-06.OVERFEED_OUT.SPEED_SV', 'CL-BLK-06', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-06.DANCER.POSITION_PV', 'CL-BLK-06', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-06.FOLDER.SPEED_PV', 'CL-BLK-06', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-06.PLAITING.SPEED_PV', 'CL-BLK-06', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-06.WATER_INLET.FLOW_TOTAL', 'CL-BLK-06', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-06.PRODUCTION.OUTPUT_TOTAL_M', 'CL-BLK-06', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-BLK-07', 'calator', 'BLK', 'Belakang', 'Calator Belakang 07', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-BLK-07', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-07.FEEDING.SPEED_PV', 'CL-BLK-07', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-07.FEEDING.SPEED_SV', 'CL-BLK-07', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-07.SQUEEZING_01.SPEED_PV', 'CL-BLK-07', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-07.SQUEEZING_02.SPEED_PV', 'CL-BLK-07', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-07.OVERFEED_OUT.SPEED_PV', 'CL-BLK-07', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-07.OVERFEED_OUT.SPEED_SV', 'CL-BLK-07', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-07.DANCER.POSITION_PV', 'CL-BLK-07', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-07.FOLDER.SPEED_PV', 'CL-BLK-07', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-07.PLAITING.SPEED_PV', 'CL-BLK-07', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-07.WATER_INLET.FLOW_TOTAL', 'CL-BLK-07', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-07.PRODUCTION.OUTPUT_TOTAL_M', 'CL-BLK-07', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-BLK-08', 'calator', 'BLK', 'Belakang', 'Calator Belakang 08', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-BLK-08', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-08.FEEDING.SPEED_PV', 'CL-BLK-08', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-08.FEEDING.SPEED_SV', 'CL-BLK-08', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-08.SQUEEZING_01.SPEED_PV', 'CL-BLK-08', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-08.SQUEEZING_02.SPEED_PV', 'CL-BLK-08', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-08.OVERFEED_OUT.SPEED_PV', 'CL-BLK-08', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-08.OVERFEED_OUT.SPEED_SV', 'CL-BLK-08', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-08.DANCER.POSITION_PV', 'CL-BLK-08', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-08.FOLDER.SPEED_PV', 'CL-BLK-08', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-08.PLAITING.SPEED_PV', 'CL-BLK-08', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-08.WATER_INLET.FLOW_TOTAL', 'CL-BLK-08', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-08.PRODUCTION.OUTPUT_TOTAL_M', 'CL-BLK-08', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-BLK-09', 'calator', 'BLK', 'Belakang', 'Calator Belakang 09', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-BLK-09', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-09.FEEDING.SPEED_PV', 'CL-BLK-09', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-09.FEEDING.SPEED_SV', 'CL-BLK-09', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-09.SQUEEZING_01.SPEED_PV', 'CL-BLK-09', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-09.SQUEEZING_02.SPEED_PV', 'CL-BLK-09', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-09.OVERFEED_OUT.SPEED_PV', 'CL-BLK-09', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-09.OVERFEED_OUT.SPEED_SV', 'CL-BLK-09', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-09.DANCER.POSITION_PV', 'CL-BLK-09', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-09.FOLDER.SPEED_PV', 'CL-BLK-09', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-09.PLAITING.SPEED_PV', 'CL-BLK-09', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-09.WATER_INLET.FLOW_TOTAL', 'CL-BLK-09', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-BLK-09.PRODUCTION.OUTPUT_TOTAL_M', 'CL-BLK-09', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-TMR-01', 'calator', 'TMR', 'Timur', 'Calator Timur 01', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-TMR-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-01.FEEDING.SPEED_PV', 'CL-TMR-01', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-01.FEEDING.SPEED_SV', 'CL-TMR-01', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-01.SQUEEZING_01.SPEED_PV', 'CL-TMR-01', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-01.SQUEEZING_02.SPEED_PV', 'CL-TMR-01', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-01.OVERFEED_OUT.SPEED_PV', 'CL-TMR-01', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-01.OVERFEED_OUT.SPEED_SV', 'CL-TMR-01', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-01.DANCER.POSITION_PV', 'CL-TMR-01', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-01.FOLDER.SPEED_PV', 'CL-TMR-01', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-01.PLAITING.SPEED_PV', 'CL-TMR-01', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-01.WATER_INLET.FLOW_TOTAL', 'CL-TMR-01', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-01.PRODUCTION.OUTPUT_TOTAL_M', 'CL-TMR-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-TMR-02', 'calator', 'TMR', 'Timur', 'Calator Timur 02', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-TMR-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-02.FEEDING.SPEED_PV', 'CL-TMR-02', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-02.FEEDING.SPEED_SV', 'CL-TMR-02', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-02.SQUEEZING_01.SPEED_PV', 'CL-TMR-02', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-02.SQUEEZING_02.SPEED_PV', 'CL-TMR-02', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-02.OVERFEED_OUT.SPEED_PV', 'CL-TMR-02', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-02.OVERFEED_OUT.SPEED_SV', 'CL-TMR-02', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-02.DANCER.POSITION_PV', 'CL-TMR-02', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-02.FOLDER.SPEED_PV', 'CL-TMR-02', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-02.PLAITING.SPEED_PV', 'CL-TMR-02', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-02.WATER_INLET.FLOW_TOTAL', 'CL-TMR-02', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-02.PRODUCTION.OUTPUT_TOTAL_M', 'CL-TMR-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-TMR-03', 'calator', 'TMR', 'Timur', 'Calator Timur 03', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-TMR-03', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-03.FEEDING.SPEED_PV', 'CL-TMR-03', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-03.FEEDING.SPEED_SV', 'CL-TMR-03', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-03.SQUEEZING_01.SPEED_PV', 'CL-TMR-03', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-03.SQUEEZING_02.SPEED_PV', 'CL-TMR-03', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-03.OVERFEED_OUT.SPEED_PV', 'CL-TMR-03', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-03.OVERFEED_OUT.SPEED_SV', 'CL-TMR-03', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-03.DANCER.POSITION_PV', 'CL-TMR-03', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-03.FOLDER.SPEED_PV', 'CL-TMR-03', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-03.PLAITING.SPEED_PV', 'CL-TMR-03', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-03.WATER_INLET.FLOW_TOTAL', 'CL-TMR-03', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-03.PRODUCTION.OUTPUT_TOTAL_M', 'CL-TMR-03', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-TMR-04', 'calator', 'TMR', 'Timur', 'Calator Timur 04', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-TMR-04', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-04.FEEDING.SPEED_PV', 'CL-TMR-04', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-04.FEEDING.SPEED_SV', 'CL-TMR-04', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-04.SQUEEZING_01.SPEED_PV', 'CL-TMR-04', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-04.SQUEEZING_02.SPEED_PV', 'CL-TMR-04', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-04.OVERFEED_OUT.SPEED_PV', 'CL-TMR-04', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-04.OVERFEED_OUT.SPEED_SV', 'CL-TMR-04', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-04.DANCER.POSITION_PV', 'CL-TMR-04', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-04.FOLDER.SPEED_PV', 'CL-TMR-04', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-04.PLAITING.SPEED_PV', 'CL-TMR-04', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-04.WATER_INLET.FLOW_TOTAL', 'CL-TMR-04', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-04.PRODUCTION.OUTPUT_TOTAL_M', 'CL-TMR-04', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-TMR-05', 'calator', 'TMR', 'Timur', 'Calator Timur 05', 'Bianco', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-TMR-05', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-05.FEEDING.SPEED_PV', 'CL-TMR-05', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-05.FEEDING.SPEED_SV', 'CL-TMR-05', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-05.SQUEEZING_01.SPEED_PV', 'CL-TMR-05', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-05.SQUEEZING_02.SPEED_PV', 'CL-TMR-05', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-05.OVERFEED_OUT.SPEED_PV', 'CL-TMR-05', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-05.OVERFEED_OUT.SPEED_SV', 'CL-TMR-05', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-05.DANCER.POSITION_PV', 'CL-TMR-05', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-05.FOLDER.SPEED_PV', 'CL-TMR-05', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-05.PLAITING.SPEED_PV', 'CL-TMR-05', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-05.WATER_INLET.FLOW_TOTAL', 'CL-TMR-05', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-05.PRODUCTION.OUTPUT_TOTAL_M', 'CL-TMR-05', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-TMR-06', 'calator', 'TMR', 'Timur', 'Calator Timur 06', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-TMR-06', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-06.FEEDING.SPEED_PV', 'CL-TMR-06', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-06.FEEDING.SPEED_SV', 'CL-TMR-06', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-06.SQUEEZING_01.SPEED_PV', 'CL-TMR-06', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-06.SQUEEZING_02.SPEED_PV', 'CL-TMR-06', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-06.OVERFEED_OUT.SPEED_PV', 'CL-TMR-06', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-06.OVERFEED_OUT.SPEED_SV', 'CL-TMR-06', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-06.DANCER.POSITION_PV', 'CL-TMR-06', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-06.FOLDER.SPEED_PV', 'CL-TMR-06', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-06.PLAITING.SPEED_PV', 'CL-TMR-06', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-06.WATER_INLET.FLOW_TOTAL', 'CL-TMR-06', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-06.PRODUCTION.OUTPUT_TOTAL_M', 'CL-TMR-06', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('CL-TMR-07', 'calator', 'TMR', 'Timur', 'Calator Timur 07', 'Standard', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('CL-TMR-07', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-07.FEEDING.SPEED_PV', 'CL-TMR-07', 'FEEDING_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-07.FEEDING.SPEED_SV', 'CL-TMR-07', 'FEEDING_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-07.SQUEEZING_01.SPEED_PV', 'CL-TMR-07', 'SQUEEZING_01_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-07.SQUEEZING_02.SPEED_PV', 'CL-TMR-07', 'SQUEEZING_02_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-07.OVERFEED_OUT.SPEED_PV', 'CL-TMR-07', 'OVERFEED_OUT_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-07.OVERFEED_OUT.SPEED_SV', 'CL-TMR-07', 'OVERFEED_OUT_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-07.DANCER.POSITION_PV', 'CL-TMR-07', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-07.FOLDER.SPEED_PV', 'CL-TMR-07', 'FOLDER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-07.PLAITING.SPEED_PV', 'CL-TMR-07', 'PLAITER_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-07.WATER_INLET.FLOW_TOTAL', 'CL-TMR-07', 'WATER_CONSUMPTION_M3', 'm³', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.CL-TMR-07.PRODUCTION.OUTPUT_TOTAL_M', 'CL-TMR-07', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

-- ============================================================================
-- PROCESS: DRYER (Dryer)
-- ============================================================================

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('DR-DPN-01', 'dryer', 'DPN', 'Depan', 'Dryer Depan 01', '6 Chamber', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('DR-DPN-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.LINE.SPEED_PV', 'DR-DPN-01', 'LINE_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.LINE.SPEED_SV', 'DR-DPN-01', 'LINE_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.CHAMBER_01.TEMPERATURE_PV', 'DR-DPN-01', 'CHAMBER_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.CHAMBER_01.TEMPERATURE_SV', 'DR-DPN-01', 'CHAMBER_1_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.CHAMBER_02.TEMPERATURE_PV', 'DR-DPN-01', 'CHAMBER_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.CHAMBER_02.TEMPERATURE_SV', 'DR-DPN-01', 'CHAMBER_2_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.CHAMBER_03.TEMPERATURE_PV', 'DR-DPN-01', 'CHAMBER_3_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.CHAMBER_03.TEMPERATURE_SV', 'DR-DPN-01', 'CHAMBER_3_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.CHAMBER_04.TEMPERATURE_PV', 'DR-DPN-01', 'CHAMBER_4_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.CHAMBER_04.TEMPERATURE_SV', 'DR-DPN-01', 'CHAMBER_4_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.CHAMBER_05.TEMPERATURE_PV', 'DR-DPN-01', 'CHAMBER_5_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.CHAMBER_05.TEMPERATURE_SV', 'DR-DPN-01', 'CHAMBER_5_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.CHAMBER_06.TEMPERATURE_PV', 'DR-DPN-01', 'CHAMBER_6_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.CHAMBER_06.TEMPERATURE_SV', 'DR-DPN-01', 'CHAMBER_6_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.THERMAL_OIL_SUPPLY.TEMPERATURE_PV', 'DR-DPN-01', 'THERMAL_OIL_SUPPLY_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-DPN-01.PRODUCTION.OUTPUT_TOTAL_M', 'DR-DPN-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('DR-BLK-01', 'dryer', 'BLK', 'Belakang', 'Dryer Belakang 01', '6 Chamber', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('DR-BLK-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.LINE.SPEED_PV', 'DR-BLK-01', 'LINE_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.LINE.SPEED_SV', 'DR-BLK-01', 'LINE_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.CHAMBER_01.TEMPERATURE_PV', 'DR-BLK-01', 'CHAMBER_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.CHAMBER_01.TEMPERATURE_SV', 'DR-BLK-01', 'CHAMBER_1_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.CHAMBER_02.TEMPERATURE_PV', 'DR-BLK-01', 'CHAMBER_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.CHAMBER_02.TEMPERATURE_SV', 'DR-BLK-01', 'CHAMBER_2_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.CHAMBER_03.TEMPERATURE_PV', 'DR-BLK-01', 'CHAMBER_3_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.CHAMBER_03.TEMPERATURE_SV', 'DR-BLK-01', 'CHAMBER_3_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.CHAMBER_04.TEMPERATURE_PV', 'DR-BLK-01', 'CHAMBER_4_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.CHAMBER_04.TEMPERATURE_SV', 'DR-BLK-01', 'CHAMBER_4_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.CHAMBER_05.TEMPERATURE_PV', 'DR-BLK-01', 'CHAMBER_5_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.CHAMBER_05.TEMPERATURE_SV', 'DR-BLK-01', 'CHAMBER_5_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.CHAMBER_06.TEMPERATURE_PV', 'DR-BLK-01', 'CHAMBER_6_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.CHAMBER_06.TEMPERATURE_SV', 'DR-BLK-01', 'CHAMBER_6_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.THERMAL_OIL_SUPPLY.TEMPERATURE_PV', 'DR-BLK-01', 'THERMAL_OIL_SUPPLY_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-01.PRODUCTION.OUTPUT_TOTAL_M', 'DR-BLK-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('DR-BLK-02', 'dryer', 'BLK', 'Belakang', 'Dryer Belakang 02', '6 Chamber', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('DR-BLK-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.LINE.SPEED_PV', 'DR-BLK-02', 'LINE_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.LINE.SPEED_SV', 'DR-BLK-02', 'LINE_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.CHAMBER_01.TEMPERATURE_PV', 'DR-BLK-02', 'CHAMBER_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.CHAMBER_01.TEMPERATURE_SV', 'DR-BLK-02', 'CHAMBER_1_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.CHAMBER_02.TEMPERATURE_PV', 'DR-BLK-02', 'CHAMBER_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.CHAMBER_02.TEMPERATURE_SV', 'DR-BLK-02', 'CHAMBER_2_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.CHAMBER_03.TEMPERATURE_PV', 'DR-BLK-02', 'CHAMBER_3_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.CHAMBER_03.TEMPERATURE_SV', 'DR-BLK-02', 'CHAMBER_3_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.CHAMBER_04.TEMPERATURE_PV', 'DR-BLK-02', 'CHAMBER_4_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.CHAMBER_04.TEMPERATURE_SV', 'DR-BLK-02', 'CHAMBER_4_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.CHAMBER_05.TEMPERATURE_PV', 'DR-BLK-02', 'CHAMBER_5_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.CHAMBER_05.TEMPERATURE_SV', 'DR-BLK-02', 'CHAMBER_5_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.CHAMBER_06.TEMPERATURE_PV', 'DR-BLK-02', 'CHAMBER_6_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.CHAMBER_06.TEMPERATURE_SV', 'DR-BLK-02', 'CHAMBER_6_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.THERMAL_OIL_SUPPLY.TEMPERATURE_PV', 'DR-BLK-02', 'THERMAL_OIL_SUPPLY_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-BLK-02.PRODUCTION.OUTPUT_TOTAL_M', 'DR-BLK-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('DR-TMR-01', 'dryer', 'TMR', 'Timur', 'Dryer Timur 01', '6 Chamber', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('DR-TMR-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.LINE.SPEED_PV', 'DR-TMR-01', 'LINE_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.LINE.SPEED_SV', 'DR-TMR-01', 'LINE_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.CHAMBER_01.TEMPERATURE_PV', 'DR-TMR-01', 'CHAMBER_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.CHAMBER_01.TEMPERATURE_SV', 'DR-TMR-01', 'CHAMBER_1_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.CHAMBER_02.TEMPERATURE_PV', 'DR-TMR-01', 'CHAMBER_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.CHAMBER_02.TEMPERATURE_SV', 'DR-TMR-01', 'CHAMBER_2_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.CHAMBER_03.TEMPERATURE_PV', 'DR-TMR-01', 'CHAMBER_3_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.CHAMBER_03.TEMPERATURE_SV', 'DR-TMR-01', 'CHAMBER_3_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.CHAMBER_04.TEMPERATURE_PV', 'DR-TMR-01', 'CHAMBER_4_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.CHAMBER_04.TEMPERATURE_SV', 'DR-TMR-01', 'CHAMBER_4_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.CHAMBER_05.TEMPERATURE_PV', 'DR-TMR-01', 'CHAMBER_5_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.CHAMBER_05.TEMPERATURE_SV', 'DR-TMR-01', 'CHAMBER_5_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.CHAMBER_06.TEMPERATURE_PV', 'DR-TMR-01', 'CHAMBER_6_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.CHAMBER_06.TEMPERATURE_SV', 'DR-TMR-01', 'CHAMBER_6_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.THERMAL_OIL_SUPPLY.TEMPERATURE_PV', 'DR-TMR-01', 'THERMAL_OIL_SUPPLY_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-01.PRODUCTION.OUTPUT_TOTAL_M', 'DR-TMR-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('DR-TMR-02', 'dryer', 'TMR', 'Timur', 'Dryer Timur 02', '6 Chamber', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('DR-TMR-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.LINE.SPEED_PV', 'DR-TMR-02', 'LINE_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.LINE.SPEED_SV', 'DR-TMR-02', 'LINE_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.CHAMBER_01.TEMPERATURE_PV', 'DR-TMR-02', 'CHAMBER_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.CHAMBER_01.TEMPERATURE_SV', 'DR-TMR-02', 'CHAMBER_1_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.CHAMBER_02.TEMPERATURE_PV', 'DR-TMR-02', 'CHAMBER_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.CHAMBER_02.TEMPERATURE_SV', 'DR-TMR-02', 'CHAMBER_2_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.CHAMBER_03.TEMPERATURE_PV', 'DR-TMR-02', 'CHAMBER_3_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.CHAMBER_03.TEMPERATURE_SV', 'DR-TMR-02', 'CHAMBER_3_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.CHAMBER_04.TEMPERATURE_PV', 'DR-TMR-02', 'CHAMBER_4_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.CHAMBER_04.TEMPERATURE_SV', 'DR-TMR-02', 'CHAMBER_4_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.CHAMBER_05.TEMPERATURE_PV', 'DR-TMR-02', 'CHAMBER_5_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.CHAMBER_05.TEMPERATURE_SV', 'DR-TMR-02', 'CHAMBER_5_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.CHAMBER_06.TEMPERATURE_PV', 'DR-TMR-02', 'CHAMBER_6_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.CHAMBER_06.TEMPERATURE_SV', 'DR-TMR-02', 'CHAMBER_6_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.THERMAL_OIL_SUPPLY.TEMPERATURE_PV', 'DR-TMR-02', 'THERMAL_OIL_SUPPLY_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-02.PRODUCTION.OUTPUT_TOTAL_M', 'DR-TMR-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('DR-TMR-03', 'dryer', 'TMR', 'Timur', 'Dryer Timur 03', '6 Chamber', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('DR-TMR-03', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.LINE.SPEED_PV', 'DR-TMR-03', 'LINE_SPEED_PV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.LINE.SPEED_SV', 'DR-TMR-03', 'LINE_SPEED_SV', 'm/min', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.CHAMBER_01.TEMPERATURE_PV', 'DR-TMR-03', 'CHAMBER_1_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.CHAMBER_01.TEMPERATURE_SV', 'DR-TMR-03', 'CHAMBER_1_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.CHAMBER_02.TEMPERATURE_PV', 'DR-TMR-03', 'CHAMBER_2_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.CHAMBER_02.TEMPERATURE_SV', 'DR-TMR-03', 'CHAMBER_2_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.CHAMBER_03.TEMPERATURE_PV', 'DR-TMR-03', 'CHAMBER_3_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.CHAMBER_03.TEMPERATURE_SV', 'DR-TMR-03', 'CHAMBER_3_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.CHAMBER_04.TEMPERATURE_PV', 'DR-TMR-03', 'CHAMBER_4_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.CHAMBER_04.TEMPERATURE_SV', 'DR-TMR-03', 'CHAMBER_4_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.CHAMBER_05.TEMPERATURE_PV', 'DR-TMR-03', 'CHAMBER_5_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.CHAMBER_05.TEMPERATURE_SV', 'DR-TMR-03', 'CHAMBER_5_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.CHAMBER_06.TEMPERATURE_PV', 'DR-TMR-03', 'CHAMBER_6_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.CHAMBER_06.TEMPERATURE_SV', 'DR-TMR-03', 'CHAMBER_6_TEMPERATURE_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.THERMAL_OIL_SUPPLY.TEMPERATURE_PV', 'DR-TMR-03', 'THERMAL_OIL_SUPPLY_TEMPERATURE_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DR-TMR-03.PRODUCTION.OUTPUT_TOTAL_M', 'DR-TMR-03', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

-- ============================================================================
-- PROCESS: KALENDER (Kalender)
-- ============================================================================

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-DPN-01', 'kalender', 'DPN', 'Depan', 'Kalender Depan 01', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-DPN-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-01.UPPER_FELT.LOADCELL_PV', 'KL-DPN-01', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-01.UPPER_FELT.LOADCELL_SV', 'KL-DPN-01', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-01.LOWER_FELT.LOADCELL_PV', 'KL-DPN-01', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-01.LOWER_FELT.LOADCELL_SV', 'KL-DPN-01', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-01.UPPER_FELT.TEMPERATURE_PV', 'KL-DPN-01', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-01.UPPER_FELT.TEMPERATURE_SV', 'KL-DPN-01', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-01.LOWER_FELT.TEMPERATURE_PV', 'KL-DPN-01', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-01.LOWER_FELT.TEMPERATURE_SV', 'KL-DPN-01', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-01.DANCER.POSITION_PV', 'KL-DPN-01', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-01.FABRIC.WIDTH_PV', 'KL-DPN-01', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-01.OVERFEED.SPEED_PV', 'KL-DPN-01', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-01.PRODUCTION.OUTPUT_TOTAL_M', 'KL-DPN-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-DPN-02', 'kalender', 'DPN', 'Depan', 'Kalender Depan 02', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-DPN-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-02.UPPER_FELT.LOADCELL_PV', 'KL-DPN-02', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-02.UPPER_FELT.LOADCELL_SV', 'KL-DPN-02', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-02.LOWER_FELT.LOADCELL_PV', 'KL-DPN-02', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-02.LOWER_FELT.LOADCELL_SV', 'KL-DPN-02', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-02.UPPER_FELT.TEMPERATURE_PV', 'KL-DPN-02', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-02.UPPER_FELT.TEMPERATURE_SV', 'KL-DPN-02', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-02.LOWER_FELT.TEMPERATURE_PV', 'KL-DPN-02', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-02.LOWER_FELT.TEMPERATURE_SV', 'KL-DPN-02', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-02.DANCER.POSITION_PV', 'KL-DPN-02', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-02.FABRIC.WIDTH_PV', 'KL-DPN-02', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-02.OVERFEED.SPEED_PV', 'KL-DPN-02', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-02.PRODUCTION.OUTPUT_TOTAL_M', 'KL-DPN-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-DPN-03', 'kalender', 'DPN', 'Depan', 'Kalender Depan 03', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-DPN-03', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-03.UPPER_FELT.LOADCELL_PV', 'KL-DPN-03', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-03.UPPER_FELT.LOADCELL_SV', 'KL-DPN-03', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-03.LOWER_FELT.LOADCELL_PV', 'KL-DPN-03', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-03.LOWER_FELT.LOADCELL_SV', 'KL-DPN-03', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-03.UPPER_FELT.TEMPERATURE_PV', 'KL-DPN-03', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-03.UPPER_FELT.TEMPERATURE_SV', 'KL-DPN-03', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-03.LOWER_FELT.TEMPERATURE_PV', 'KL-DPN-03', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-03.LOWER_FELT.TEMPERATURE_SV', 'KL-DPN-03', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-03.DANCER.POSITION_PV', 'KL-DPN-03', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-03.FABRIC.WIDTH_PV', 'KL-DPN-03', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-03.OVERFEED.SPEED_PV', 'KL-DPN-03', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-03.PRODUCTION.OUTPUT_TOTAL_M', 'KL-DPN-03', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-DPN-04', 'kalender', 'DPN', 'Depan', 'Kalender Depan 04', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-DPN-04', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-04.UPPER_FELT.LOADCELL_PV', 'KL-DPN-04', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-04.UPPER_FELT.LOADCELL_SV', 'KL-DPN-04', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-04.LOWER_FELT.LOADCELL_PV', 'KL-DPN-04', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-04.LOWER_FELT.LOADCELL_SV', 'KL-DPN-04', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-04.UPPER_FELT.TEMPERATURE_PV', 'KL-DPN-04', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-04.UPPER_FELT.TEMPERATURE_SV', 'KL-DPN-04', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-04.LOWER_FELT.TEMPERATURE_PV', 'KL-DPN-04', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-04.LOWER_FELT.TEMPERATURE_SV', 'KL-DPN-04', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-04.DANCER.POSITION_PV', 'KL-DPN-04', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-04.FABRIC.WIDTH_PV', 'KL-DPN-04', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-04.OVERFEED.SPEED_PV', 'KL-DPN-04', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-04.PRODUCTION.OUTPUT_TOTAL_M', 'KL-DPN-04', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-DPN-05', 'kalender', 'DPN', 'Depan', 'Kalender Depan 05', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-DPN-05', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-05.UPPER_FELT.LOADCELL_PV', 'KL-DPN-05', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-05.UPPER_FELT.LOADCELL_SV', 'KL-DPN-05', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-05.LOWER_FELT.LOADCELL_PV', 'KL-DPN-05', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-05.LOWER_FELT.LOADCELL_SV', 'KL-DPN-05', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-05.UPPER_FELT.TEMPERATURE_PV', 'KL-DPN-05', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-05.UPPER_FELT.TEMPERATURE_SV', 'KL-DPN-05', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-05.LOWER_FELT.TEMPERATURE_PV', 'KL-DPN-05', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-05.LOWER_FELT.TEMPERATURE_SV', 'KL-DPN-05', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-05.DANCER.POSITION_PV', 'KL-DPN-05', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-05.FABRIC.WIDTH_PV', 'KL-DPN-05', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-05.OVERFEED.SPEED_PV', 'KL-DPN-05', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-05.PRODUCTION.OUTPUT_TOTAL_M', 'KL-DPN-05', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-DPN-06', 'kalender', 'DPN', 'Depan', 'Kalender Depan 06', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-DPN-06', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-06.UPPER_FELT.LOADCELL_PV', 'KL-DPN-06', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-06.UPPER_FELT.LOADCELL_SV', 'KL-DPN-06', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-06.LOWER_FELT.LOADCELL_PV', 'KL-DPN-06', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-06.LOWER_FELT.LOADCELL_SV', 'KL-DPN-06', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-06.UPPER_FELT.TEMPERATURE_PV', 'KL-DPN-06', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-06.UPPER_FELT.TEMPERATURE_SV', 'KL-DPN-06', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-06.LOWER_FELT.TEMPERATURE_PV', 'KL-DPN-06', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-06.LOWER_FELT.TEMPERATURE_SV', 'KL-DPN-06', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-06.DANCER.POSITION_PV', 'KL-DPN-06', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-06.FABRIC.WIDTH_PV', 'KL-DPN-06', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-06.OVERFEED.SPEED_PV', 'KL-DPN-06', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-06.PRODUCTION.OUTPUT_TOTAL_M', 'KL-DPN-06', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-DPN-07', 'kalender', 'DPN', 'Depan', 'Kalender Depan 07', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-DPN-07', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-07.UPPER_FELT.LOADCELL_PV', 'KL-DPN-07', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-07.UPPER_FELT.LOADCELL_SV', 'KL-DPN-07', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-07.LOWER_FELT.LOADCELL_PV', 'KL-DPN-07', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-07.LOWER_FELT.LOADCELL_SV', 'KL-DPN-07', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-07.UPPER_FELT.TEMPERATURE_PV', 'KL-DPN-07', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-07.UPPER_FELT.TEMPERATURE_SV', 'KL-DPN-07', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-07.LOWER_FELT.TEMPERATURE_PV', 'KL-DPN-07', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-07.LOWER_FELT.TEMPERATURE_SV', 'KL-DPN-07', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-07.DANCER.POSITION_PV', 'KL-DPN-07', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-07.FABRIC.WIDTH_PV', 'KL-DPN-07', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-07.OVERFEED.SPEED_PV', 'KL-DPN-07', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-DPN-07.PRODUCTION.OUTPUT_TOTAL_M', 'KL-DPN-07', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-BLK-01', 'kalender', 'BLK', 'Belakang', 'Kalender Belakang 01', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-BLK-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-01.UPPER_FELT.LOADCELL_PV', 'KL-BLK-01', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-01.UPPER_FELT.LOADCELL_SV', 'KL-BLK-01', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-01.LOWER_FELT.LOADCELL_PV', 'KL-BLK-01', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-01.LOWER_FELT.LOADCELL_SV', 'KL-BLK-01', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-01.UPPER_FELT.TEMPERATURE_PV', 'KL-BLK-01', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-01.UPPER_FELT.TEMPERATURE_SV', 'KL-BLK-01', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-01.LOWER_FELT.TEMPERATURE_PV', 'KL-BLK-01', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-01.LOWER_FELT.TEMPERATURE_SV', 'KL-BLK-01', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-01.DANCER.POSITION_PV', 'KL-BLK-01', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-01.FABRIC.WIDTH_PV', 'KL-BLK-01', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-01.OVERFEED.SPEED_PV', 'KL-BLK-01', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-01.PRODUCTION.OUTPUT_TOTAL_M', 'KL-BLK-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-BLK-02', 'kalender', 'BLK', 'Belakang', 'Kalender Belakang 02', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-BLK-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-02.UPPER_FELT.LOADCELL_PV', 'KL-BLK-02', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-02.UPPER_FELT.LOADCELL_SV', 'KL-BLK-02', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-02.LOWER_FELT.LOADCELL_PV', 'KL-BLK-02', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-02.LOWER_FELT.LOADCELL_SV', 'KL-BLK-02', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-02.UPPER_FELT.TEMPERATURE_PV', 'KL-BLK-02', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-02.UPPER_FELT.TEMPERATURE_SV', 'KL-BLK-02', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-02.LOWER_FELT.TEMPERATURE_PV', 'KL-BLK-02', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-02.LOWER_FELT.TEMPERATURE_SV', 'KL-BLK-02', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-02.DANCER.POSITION_PV', 'KL-BLK-02', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-02.FABRIC.WIDTH_PV', 'KL-BLK-02', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-02.OVERFEED.SPEED_PV', 'KL-BLK-02', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-02.PRODUCTION.OUTPUT_TOTAL_M', 'KL-BLK-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-BLK-03', 'kalender', 'BLK', 'Belakang', 'Kalender Belakang 03', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-BLK-03', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-03.UPPER_FELT.LOADCELL_PV', 'KL-BLK-03', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-03.UPPER_FELT.LOADCELL_SV', 'KL-BLK-03', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-03.LOWER_FELT.LOADCELL_PV', 'KL-BLK-03', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-03.LOWER_FELT.LOADCELL_SV', 'KL-BLK-03', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-03.UPPER_FELT.TEMPERATURE_PV', 'KL-BLK-03', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-03.UPPER_FELT.TEMPERATURE_SV', 'KL-BLK-03', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-03.LOWER_FELT.TEMPERATURE_PV', 'KL-BLK-03', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-03.LOWER_FELT.TEMPERATURE_SV', 'KL-BLK-03', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-03.DANCER.POSITION_PV', 'KL-BLK-03', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-03.FABRIC.WIDTH_PV', 'KL-BLK-03', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-03.OVERFEED.SPEED_PV', 'KL-BLK-03', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-03.PRODUCTION.OUTPUT_TOTAL_M', 'KL-BLK-03', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-BLK-04', 'kalender', 'BLK', 'Belakang', 'Kalender Belakang 04', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-BLK-04', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-04.UPPER_FELT.LOADCELL_PV', 'KL-BLK-04', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-04.UPPER_FELT.LOADCELL_SV', 'KL-BLK-04', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-04.LOWER_FELT.LOADCELL_PV', 'KL-BLK-04', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-04.LOWER_FELT.LOADCELL_SV', 'KL-BLK-04', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-04.UPPER_FELT.TEMPERATURE_PV', 'KL-BLK-04', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-04.UPPER_FELT.TEMPERATURE_SV', 'KL-BLK-04', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-04.LOWER_FELT.TEMPERATURE_PV', 'KL-BLK-04', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-04.LOWER_FELT.TEMPERATURE_SV', 'KL-BLK-04', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-04.DANCER.POSITION_PV', 'KL-BLK-04', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-04.FABRIC.WIDTH_PV', 'KL-BLK-04', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-04.OVERFEED.SPEED_PV', 'KL-BLK-04', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-04.PRODUCTION.OUTPUT_TOTAL_M', 'KL-BLK-04', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-BLK-05', 'kalender', 'BLK', 'Belakang', 'Kalender Belakang 05', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-BLK-05', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-05.UPPER_FELT.LOADCELL_PV', 'KL-BLK-05', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-05.UPPER_FELT.LOADCELL_SV', 'KL-BLK-05', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-05.LOWER_FELT.LOADCELL_PV', 'KL-BLK-05', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-05.LOWER_FELT.LOADCELL_SV', 'KL-BLK-05', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-05.UPPER_FELT.TEMPERATURE_PV', 'KL-BLK-05', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-05.UPPER_FELT.TEMPERATURE_SV', 'KL-BLK-05', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-05.LOWER_FELT.TEMPERATURE_PV', 'KL-BLK-05', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-05.LOWER_FELT.TEMPERATURE_SV', 'KL-BLK-05', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-05.DANCER.POSITION_PV', 'KL-BLK-05', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-05.FABRIC.WIDTH_PV', 'KL-BLK-05', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-05.OVERFEED.SPEED_PV', 'KL-BLK-05', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-05.PRODUCTION.OUTPUT_TOTAL_M', 'KL-BLK-05', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-BLK-06', 'kalender', 'BLK', 'Belakang', 'Kalender Belakang 06', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-BLK-06', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-06.UPPER_FELT.LOADCELL_PV', 'KL-BLK-06', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-06.UPPER_FELT.LOADCELL_SV', 'KL-BLK-06', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-06.LOWER_FELT.LOADCELL_PV', 'KL-BLK-06', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-06.LOWER_FELT.LOADCELL_SV', 'KL-BLK-06', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-06.UPPER_FELT.TEMPERATURE_PV', 'KL-BLK-06', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-06.UPPER_FELT.TEMPERATURE_SV', 'KL-BLK-06', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-06.LOWER_FELT.TEMPERATURE_PV', 'KL-BLK-06', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-06.LOWER_FELT.TEMPERATURE_SV', 'KL-BLK-06', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-06.DANCER.POSITION_PV', 'KL-BLK-06', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-06.FABRIC.WIDTH_PV', 'KL-BLK-06', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-06.OVERFEED.SPEED_PV', 'KL-BLK-06', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-06.PRODUCTION.OUTPUT_TOTAL_M', 'KL-BLK-06', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-BLK-07', 'kalender', 'BLK', 'Belakang', 'Kalender Belakang 07', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-BLK-07', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-07.UPPER_FELT.LOADCELL_PV', 'KL-BLK-07', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-07.UPPER_FELT.LOADCELL_SV', 'KL-BLK-07', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-07.LOWER_FELT.LOADCELL_PV', 'KL-BLK-07', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-07.LOWER_FELT.LOADCELL_SV', 'KL-BLK-07', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-07.UPPER_FELT.TEMPERATURE_PV', 'KL-BLK-07', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-07.UPPER_FELT.TEMPERATURE_SV', 'KL-BLK-07', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-07.LOWER_FELT.TEMPERATURE_PV', 'KL-BLK-07', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-07.LOWER_FELT.TEMPERATURE_SV', 'KL-BLK-07', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-07.DANCER.POSITION_PV', 'KL-BLK-07', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-07.FABRIC.WIDTH_PV', 'KL-BLK-07', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-07.OVERFEED.SPEED_PV', 'KL-BLK-07', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-BLK-07.PRODUCTION.OUTPUT_TOTAL_M', 'KL-BLK-07', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-TMR-01', 'kalender', 'TMR', 'Timur', 'Kalender Timur 01', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-TMR-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-01.UPPER_FELT.LOADCELL_PV', 'KL-TMR-01', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-01.UPPER_FELT.LOADCELL_SV', 'KL-TMR-01', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-01.LOWER_FELT.LOADCELL_PV', 'KL-TMR-01', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-01.LOWER_FELT.LOADCELL_SV', 'KL-TMR-01', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-01.UPPER_FELT.TEMPERATURE_PV', 'KL-TMR-01', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-01.UPPER_FELT.TEMPERATURE_SV', 'KL-TMR-01', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-01.LOWER_FELT.TEMPERATURE_PV', 'KL-TMR-01', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-01.LOWER_FELT.TEMPERATURE_SV', 'KL-TMR-01', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-01.DANCER.POSITION_PV', 'KL-TMR-01', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-01.FABRIC.WIDTH_PV', 'KL-TMR-01', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-01.OVERFEED.SPEED_PV', 'KL-TMR-01', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-01.PRODUCTION.OUTPUT_TOTAL_M', 'KL-TMR-01', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-TMR-02', 'kalender', 'TMR', 'Timur', 'Kalender Timur 02', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-TMR-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-02.UPPER_FELT.LOADCELL_PV', 'KL-TMR-02', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-02.UPPER_FELT.LOADCELL_SV', 'KL-TMR-02', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-02.LOWER_FELT.LOADCELL_PV', 'KL-TMR-02', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-02.LOWER_FELT.LOADCELL_SV', 'KL-TMR-02', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-02.UPPER_FELT.TEMPERATURE_PV', 'KL-TMR-02', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-02.UPPER_FELT.TEMPERATURE_SV', 'KL-TMR-02', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-02.LOWER_FELT.TEMPERATURE_PV', 'KL-TMR-02', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-02.LOWER_FELT.TEMPERATURE_SV', 'KL-TMR-02', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-02.DANCER.POSITION_PV', 'KL-TMR-02', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-02.FABRIC.WIDTH_PV', 'KL-TMR-02', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-02.OVERFEED.SPEED_PV', 'KL-TMR-02', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-02.PRODUCTION.OUTPUT_TOTAL_M', 'KL-TMR-02', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-TMR-03', 'kalender', 'TMR', 'Timur', 'Kalender Timur 03', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-TMR-03', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-03.UPPER_FELT.LOADCELL_PV', 'KL-TMR-03', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-03.UPPER_FELT.LOADCELL_SV', 'KL-TMR-03', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-03.LOWER_FELT.LOADCELL_PV', 'KL-TMR-03', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-03.LOWER_FELT.LOADCELL_SV', 'KL-TMR-03', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-03.UPPER_FELT.TEMPERATURE_PV', 'KL-TMR-03', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-03.UPPER_FELT.TEMPERATURE_SV', 'KL-TMR-03', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-03.LOWER_FELT.TEMPERATURE_PV', 'KL-TMR-03', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-03.LOWER_FELT.TEMPERATURE_SV', 'KL-TMR-03', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-03.DANCER.POSITION_PV', 'KL-TMR-03', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-03.FABRIC.WIDTH_PV', 'KL-TMR-03', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-03.OVERFEED.SPEED_PV', 'KL-TMR-03', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-03.PRODUCTION.OUTPUT_TOTAL_M', 'KL-TMR-03', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-TMR-04', 'kalender', 'TMR', 'Timur', 'Kalender Timur 04', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-TMR-04', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-04.UPPER_FELT.LOADCELL_PV', 'KL-TMR-04', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-04.UPPER_FELT.LOADCELL_SV', 'KL-TMR-04', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-04.LOWER_FELT.LOADCELL_PV', 'KL-TMR-04', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-04.LOWER_FELT.LOADCELL_SV', 'KL-TMR-04', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-04.UPPER_FELT.TEMPERATURE_PV', 'KL-TMR-04', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-04.UPPER_FELT.TEMPERATURE_SV', 'KL-TMR-04', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-04.LOWER_FELT.TEMPERATURE_PV', 'KL-TMR-04', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-04.LOWER_FELT.TEMPERATURE_SV', 'KL-TMR-04', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-04.DANCER.POSITION_PV', 'KL-TMR-04', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-04.FABRIC.WIDTH_PV', 'KL-TMR-04', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-04.OVERFEED.SPEED_PV', 'KL-TMR-04', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-04.PRODUCTION.OUTPUT_TOTAL_M', 'KL-TMR-04', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-TMR-05', 'kalender', 'TMR', 'Timur', 'Kalender Timur 05', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-TMR-05', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-05.UPPER_FELT.LOADCELL_PV', 'KL-TMR-05', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-05.UPPER_FELT.LOADCELL_SV', 'KL-TMR-05', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-05.LOWER_FELT.LOADCELL_PV', 'KL-TMR-05', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-05.LOWER_FELT.LOADCELL_SV', 'KL-TMR-05', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-05.UPPER_FELT.TEMPERATURE_PV', 'KL-TMR-05', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-05.UPPER_FELT.TEMPERATURE_SV', 'KL-TMR-05', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-05.LOWER_FELT.TEMPERATURE_PV', 'KL-TMR-05', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-05.LOWER_FELT.TEMPERATURE_SV', 'KL-TMR-05', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-05.DANCER.POSITION_PV', 'KL-TMR-05', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-05.FABRIC.WIDTH_PV', 'KL-TMR-05', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-05.OVERFEED.SPEED_PV', 'KL-TMR-05', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-05.PRODUCTION.OUTPUT_TOTAL_M', 'KL-TMR-05', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-TMR-06', 'kalender', 'TMR', 'Timur', 'Kalender Timur 06', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-TMR-06', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-06.UPPER_FELT.LOADCELL_PV', 'KL-TMR-06', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-06.UPPER_FELT.LOADCELL_SV', 'KL-TMR-06', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-06.LOWER_FELT.LOADCELL_PV', 'KL-TMR-06', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-06.LOWER_FELT.LOADCELL_SV', 'KL-TMR-06', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-06.UPPER_FELT.TEMPERATURE_PV', 'KL-TMR-06', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-06.UPPER_FELT.TEMPERATURE_SV', 'KL-TMR-06', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-06.LOWER_FELT.TEMPERATURE_PV', 'KL-TMR-06', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-06.LOWER_FELT.TEMPERATURE_SV', 'KL-TMR-06', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-06.DANCER.POSITION_PV', 'KL-TMR-06', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-06.FABRIC.WIDTH_PV', 'KL-TMR-06', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-06.OVERFEED.SPEED_PV', 'KL-TMR-06', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-06.PRODUCTION.OUTPUT_TOTAL_M', 'KL-TMR-06', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('KL-TMR-07', 'kalender', 'TMR', 'Timur', 'Kalender Timur 07', 'Finishing', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('KL-TMR-07', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-07.UPPER_FELT.LOADCELL_PV', 'KL-TMR-07', 'LOADCELL_UPPER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-07.UPPER_FELT.LOADCELL_SV', 'KL-TMR-07', 'LOADCELL_UPPER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-07.LOWER_FELT.LOADCELL_PV', 'KL-TMR-07', 'LOADCELL_LOWER_PV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-07.LOWER_FELT.LOADCELL_SV', 'KL-TMR-07', 'LOADCELL_LOWER_SV', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-07.UPPER_FELT.TEMPERATURE_PV', 'KL-TMR-07', 'TEMPERATURE_UPPER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-07.UPPER_FELT.TEMPERATURE_SV', 'KL-TMR-07', 'TEMPERATURE_UPPER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-07.LOWER_FELT.TEMPERATURE_PV', 'KL-TMR-07', 'TEMPERATURE_LOWER_PV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-07.LOWER_FELT.TEMPERATURE_SV', 'KL-TMR-07', 'TEMPERATURE_LOWER_SV', '°C', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-07.DANCER.POSITION_PV', 'KL-TMR-07', 'DANCER_POSITION_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-07.FABRIC.WIDTH_PV', 'KL-TMR-07', 'FABRIC_WIDTH_PV', 'cm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-07.OVERFEED.SPEED_PV', 'KL-TMR-07', 'OVERFEED_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.KL-TMR-07.PRODUCTION.OUTPUT_TOTAL_M', 'KL-TMR-07', 'OUTPUT_TOTAL_M', 'm', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

-- ============================================================================
-- PROCESS: CHEMICAL (Dispensing Calator)
-- ============================================================================

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('DSP-DPN-01', 'chemical', 'DPN', 'Depan', 'Dispensing Calator Depan 01', '2 Tank', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('DSP-DPN-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-DPN-01.TANK_01.WEIGHT_PV', 'DSP-DPN-01', 'TANK_1_LOADCELL_KG', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-DPN-01.TANK_02.LEVEL_PV', 'DSP-DPN-01', 'TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-DPN-01.INLET_VALVE_01.OPEN_FB', 'DSP-DPN-01', 'INLET_VALVE_1_OPEN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-DPN-01.TRANSFER_VALVE.OPEN_FB', 'DSP-DPN-01', 'TRANSFER_VALVE_OPEN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-DPN-01.TRANSFER_PUMP.RUN_FB', 'DSP-DPN-01', 'TRANSFER_PUMP_RUN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('DSP-BLK-01', 'chemical', 'BLK', 'Belakang', 'Dispensing Calator Belakang 01', '2 Tank', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('DSP-BLK-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-BLK-01.TANK_01.WEIGHT_PV', 'DSP-BLK-01', 'TANK_1_LOADCELL_KG', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-BLK-01.TANK_02.LEVEL_PV', 'DSP-BLK-01', 'TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-BLK-01.INLET_VALVE_01.OPEN_FB', 'DSP-BLK-01', 'INLET_VALVE_1_OPEN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-BLK-01.TRANSFER_VALVE.OPEN_FB', 'DSP-BLK-01', 'TRANSFER_VALVE_OPEN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-BLK-01.TRANSFER_PUMP.RUN_FB', 'DSP-BLK-01', 'TRANSFER_PUMP_RUN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('DSP-BLK-02', 'chemical', 'BLK', 'Belakang', 'Dispensing Calator Belakang 02', '2 Tank', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('DSP-BLK-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-BLK-02.TANK_01.WEIGHT_PV', 'DSP-BLK-02', 'TANK_1_LOADCELL_KG', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-BLK-02.TANK_02.LEVEL_PV', 'DSP-BLK-02', 'TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-BLK-02.INLET_VALVE_01.OPEN_FB', 'DSP-BLK-02', 'INLET_VALVE_1_OPEN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-BLK-02.TRANSFER_VALVE.OPEN_FB', 'DSP-BLK-02', 'TRANSFER_VALVE_OPEN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-BLK-02.TRANSFER_PUMP.RUN_FB', 'DSP-BLK-02', 'TRANSFER_PUMP_RUN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('DSP-TMR-01', 'chemical', 'TMR', 'Timur', 'Dispensing Calator Timur 01', '2 Tank', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('DSP-TMR-01', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-TMR-01.TANK_01.WEIGHT_PV', 'DSP-TMR-01', 'TANK_1_LOADCELL_KG', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-TMR-01.TANK_02.LEVEL_PV', 'DSP-TMR-01', 'TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-TMR-01.INLET_VALVE_01.OPEN_FB', 'DSP-TMR-01', 'INLET_VALVE_1_OPEN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-TMR-01.TRANSFER_VALVE.OPEN_FB', 'DSP-TMR-01', 'TRANSFER_VALVE_OPEN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-TMR-01.TRANSFER_PUMP.RUN_FB', 'DSP-TMR-01', 'TRANSFER_PUMP_RUN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, active, created_at, updated_at)
VALUES ('DSP-TMR-02', 'chemical', 'TMR', 'Timur', 'Dispensing Calator Timur 02', '2 Tank', '{"canonical_registered": true}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT (asset_id) DO UPDATE SET display_name = EXCLUDED.display_name, area_name = EXCLUDED.area_name, subtype = EXCLUDED.subtype;

INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
VALUES ('DSP-TMR-02', 'idle', '—', 0, TRUE, NOW(), 'GOOD', '{}'::jsonb, NOW())
ON CONFLICT (asset_id) DO NOTHING;

INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-TMR-02.TANK_01.WEIGHT_PV', 'DSP-TMR-02', 'TANK_1_LOADCELL_KG', 'kg', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-TMR-02.TANK_02.LEVEL_PV', 'DSP-TMR-02', 'TANK_2_LEVEL_PV', '%', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-TMR-02.INLET_VALVE_01.OPEN_FB', 'DSP-TMR-02', 'INLET_VALVE_1_OPEN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-TMR-02.TRANSFER_VALVE.OPEN_FB', 'DSP-TMR-02', 'TRANSFER_VALVE_OPEN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;
INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
VALUES ('SMM.DSP-TMR-02.TRANSFER_PUMP.RUN_FB', 'DSP-TMR-02', 'TRANSFER_PUMP_RUN_FB', 'bool', 'PENDING_MAPPING', TRUE, NOW())
ON CONFLICT (tag_code) DO UPDATE SET signal_role = EXCLUDED.signal_role, engineering_unit = EXCLUDED.engineering_unit, source_status = EXCLUDED.source_status;

COMMIT;

-- Total Assets Registered: 138
-- Total Canonical Tags Registered: 1627