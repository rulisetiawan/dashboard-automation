-- 0023_wwtp_dblink_integration.sql
-- Integrasi Cross-Database IPAL Monitoring System (WWTP) ke PT SMM SCADA via postgres_fdw & dblink

CREATE EXTENSION IF NOT EXISTS postgres_fdw;
CREATE EXTENSION IF NOT EXISTS dblink;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_foreign_server WHERE srvname = 'ipal_db_server') THEN
    CREATE SERVER ipal_db_server
      FOREIGN DATA WRAPPER postgres_fdw
      OPTIONS (host '127.0.0.1', port '5433', dbname 'ipal_monitoring');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_user_mappings m
    JOIN pg_foreign_server s ON s.oid = m.srvid
    WHERE s.srvname = 'ipal_db_server'
  ) THEN
    CREATE USER MAPPING FOR postgres
      SERVER ipal_db_server
      OPTIONS (user 'postgres', password 'sensorSMM!');
  END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS wwtp;

-- Import atau re-import foreign tables dari ipal_monitoring
DO $$
BEGIN
  -- Drop foreign tables lama jika ada sebelum re-import
  DROP FOREIGN TABLE IF EXISTS wwtp.asset_sensor_master CASCADE;
  DROP FOREIGN TABLE IF EXISTS wwtp.sensor_realtime_values CASCADE;
  DROP FOREIGN TABLE IF EXISTS wwtp.sensor_daily_summary CASCADE;
  DROP FOREIGN TABLE IF EXISTS wwtp.sensor_history_minute CASCADE;
  DROP FOREIGN TABLE IF EXISTS wwtp.manual_control_logs CASCADE;
  DROP FOREIGN TABLE IF EXISTS wwtp.equipment_master CASCADE;
  DROP FOREIGN TABLE IF EXISTS wwtp.equipment_control_state CASCADE;
  DROP FOREIGN TABLE IF EXISTS wwtp.ipal_sensor_readings CASCADE;

  IMPORT FOREIGN SCHEMA public
    LIMIT TO (
      asset_sensor_master,
      sensor_realtime_values,
      sensor_daily_summary,
      sensor_history_minute,
      manual_control_logs,
      equipment_master,
      equipment_control_state,
      ipal_sensor_readings
    )
    FROM SERVER ipal_db_server
    INTO wwtp;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Import foreign schema notice: %', SQLERRM;
END $$;

-- Buat view pembantu hanya ketika foreign table sumber berhasil di-import.
-- Database IPAL boleh belum tersedia tanpa menghalangi migration dashboard lain.
DO $$
DECLARE
  mapping RECORD;
BEGIN
  FOR mapping IN
    SELECT * FROM (VALUES
      ('sensor_realtime_values', 'wwtp_sensor_realtime_values'),
      ('asset_sensor_master', 'wwtp_asset_sensor_master'),
      ('manual_control_logs', 'wwtp_manual_control_logs'),
      ('equipment_master', 'wwtp_equipment_master'),
      ('equipment_control_state', 'wwtp_equipment_control_state'),
      ('sensor_daily_summary', 'wwtp_sensor_daily_summary'),
      ('sensor_history_minute', 'wwtp_sensor_history_minute'),
      ('ipal_sensor_readings', 'wwtp_sensor_readings')
    ) AS entries(source_name, view_name)
  LOOP
    IF to_regclass(format('wwtp.%I', mapping.source_name)) IS NOT NULL THEN
      EXECUTE format(
        'CREATE OR REPLACE VIEW public.%I AS SELECT * FROM wwtp.%I',
        mapping.view_name,
        mapping.source_name
      );
    ELSE
      RAISE NOTICE 'WWTP source %.% belum tersedia; view % belum dibuat.', 'wwtp', mapping.source_name, mapping.view_name;
    END IF;
  END LOOP;
END $$;
