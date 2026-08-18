-- Motor historian and versioned Jetflow program execution.

CREATE TABLE IF NOT EXISTS equipment_telemetry_sample (
  id BIGSERIAL PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  source_ts TIMESTAMPTZ NOT NULL,
  equipment_state TEXT NOT NULL,
  current_r_a DOUBLE PRECISION,
  current_s_a DOUBLE PRECISION,
  current_t_a DOUBLE PRECISION,
  voltage_rs_v DOUBLE PRECISION,
  voltage_st_v DOUBLE PRECISION,
  voltage_tr_v DOUBLE PRECISION,
  active_power_kw DOUBLE PRECISION,
  drive_frequency_hz DOUBLE PRECISION,
  runtime_hours DOUBLE PRECISION,
  energy_kwh DOUBLE PRECISION,
  quality TEXT NOT NULL DEFAULT 'GOOD',
  gateway_id TEXT,
  message_id UUID NOT NULL UNIQUE,
  ingested_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_equipment_telemetry_time ON equipment_telemetry_sample(equipment_id, source_ts DESC);

CREATE TABLE IF NOT EXISTS equipment_telemetry_aggregate_1m (
  bucket_start TIMESTAMPTZ NOT NULL,
  equipment_id TEXT NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  sample_count INTEGER NOT NULL,
  current_r_avg_a DOUBLE PRECISION, current_s_avg_a DOUBLE PRECISION, current_t_avg_a DOUBLE PRECISION,
  current_r_min_a DOUBLE PRECISION, current_r_max_a DOUBLE PRECISION,
  current_s_min_a DOUBLE PRECISION, current_s_max_a DOUBLE PRECISION,
  current_t_min_a DOUBLE PRECISION, current_t_max_a DOUBLE PRECISION,
  active_power_avg_kw DOUBLE PRECISION, drive_frequency_avg_hz DOUBLE PRECISION,
  energy_delta_kwh DOUBLE PRECISION, last_source_ts TIMESTAMPTZ, refreshed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (bucket_start, equipment_id)
);

CREATE INDEX IF NOT EXISTS idx_equipment_telemetry_1m_time ON equipment_telemetry_aggregate_1m(equipment_id, bucket_start DESC);

CREATE TABLE IF NOT EXISTS equipment_telemetry_aggregate_15m (
  bucket_start TIMESTAMPTZ NOT NULL, equipment_id TEXT NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE, sample_count INTEGER NOT NULL,
  current_r_avg_a DOUBLE PRECISION, current_s_avg_a DOUBLE PRECISION, current_t_avg_a DOUBLE PRECISION,
  current_r_min_a DOUBLE PRECISION, current_r_max_a DOUBLE PRECISION, current_s_min_a DOUBLE PRECISION, current_s_max_a DOUBLE PRECISION, current_t_min_a DOUBLE PRECISION, current_t_max_a DOUBLE PRECISION,
  active_power_avg_kw DOUBLE PRECISION, drive_frequency_avg_hz DOUBLE PRECISION, energy_delta_kwh DOUBLE PRECISION, last_source_ts TIMESTAMPTZ, refreshed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (bucket_start, equipment_id)
);

CREATE INDEX IF NOT EXISTS idx_equipment_telemetry_15m_time ON equipment_telemetry_aggregate_15m(equipment_id, bucket_start DESC);

CREATE TABLE IF NOT EXISTS equipment_telemetry_aggregate_daily (
  bucket_start TIMESTAMPTZ NOT NULL, equipment_id TEXT NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE, sample_count INTEGER NOT NULL,
  current_r_avg_a DOUBLE PRECISION, current_s_avg_a DOUBLE PRECISION, current_t_avg_a DOUBLE PRECISION,
  current_r_min_a DOUBLE PRECISION, current_r_max_a DOUBLE PRECISION, current_s_min_a DOUBLE PRECISION, current_s_max_a DOUBLE PRECISION, current_t_min_a DOUBLE PRECISION, current_t_max_a DOUBLE PRECISION,
  active_power_avg_kw DOUBLE PRECISION, drive_frequency_avg_hz DOUBLE PRECISION, energy_delta_kwh DOUBLE PRECISION, last_source_ts TIMESTAMPTZ, refreshed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (bucket_start, equipment_id)
);

CREATE INDEX IF NOT EXISTS idx_equipment_telemetry_daily_time ON equipment_telemetry_aggregate_daily(equipment_id, bucket_start DESC);

CREATE OR REPLACE FUNCTION refresh_equipment_rollups(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE item RECORD;
BEGIN
  FOR item IN SELECT * FROM (VALUES
    ('equipment_telemetry_aggregate_1m', '1 minute'::interval),
    ('equipment_telemetry_aggregate_15m', '15 minutes'::interval),
    ('equipment_telemetry_aggregate_daily', '1 day'::interval)
  ) AS buckets(table_name, interval_size)
  LOOP
    EXECUTE format('DELETE FROM %I WHERE bucket_start >= date_bin($1, $2, ''2000-01-01T00:00:00Z''::timestamptz) AND bucket_start <= date_bin($1, $3, ''2000-01-01T00:00:00Z''::timestamptz)', item.table_name)
    USING item.interval_size, p_from, p_to;
    EXECUTE format($sql$
      INSERT INTO %I
      SELECT date_bin($1, source_ts, '2000-01-01T00:00:00Z'::timestamptz), equipment_id, COUNT(*)::int,
        AVG(current_r_a), AVG(current_s_a), AVG(current_t_a), MIN(current_r_a), MAX(current_r_a), MIN(current_s_a), MAX(current_s_a), MIN(current_t_a), MAX(current_t_a),
        AVG(active_power_kw), AVG(drive_frequency_hz),
        (ARRAY_AGG(energy_kwh ORDER BY source_ts DESC))[1] - (ARRAY_AGG(energy_kwh ORDER BY source_ts))[1], MAX(source_ts), NOW()
      FROM equipment_telemetry_sample
      WHERE source_ts >= $2 AND source_ts <= $3
      GROUP BY 1, equipment_id
    $sql$, item.table_name) USING item.interval_size, p_from, p_to;
  END LOOP;
END;
$$;

CREATE TABLE IF NOT EXISTS process_program_version (
  program_version_id UUID PRIMARY KEY,
  program_code TEXT NOT NULL,
  version_no INTEGER NOT NULL,
  process_type TEXT NOT NULL DEFAULT 'jetflow',
  recipe_code TEXT,
  version_status TEXT NOT NULL DEFAULT 'DRAFT',
  change_reason TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  effective_from TIMESTAMPTZ,
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE(program_code, version_no)
);

CREATE TABLE IF NOT EXISTS process_program_step (
  program_step_id UUID PRIMARY KEY,
  program_version_id UUID NOT NULL REFERENCES process_program_version(program_version_id) ON DELETE CASCADE,
  sequence_no INTEGER NOT NULL,
  step_code TEXT NOT NULL,
  step_name TEXT NOT NULL,
  completion_rule TEXT,
  setpoint_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  expected_duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE(program_version_id, sequence_no)
);

ALTER TABLE batch_process_run ADD COLUMN IF NOT EXISTS program_version_id UUID REFERENCES process_program_version(program_version_id);
ALTER TABLE process_step_execution ADD COLUMN IF NOT EXISTS program_step_id UUID REFERENCES process_program_step(program_step_id);
ALTER TABLE process_step_execution ADD COLUMN IF NOT EXISTS step_code TEXT;

CREATE TABLE IF NOT EXISTS process_transition_event (
  transition_event_id UUID PRIMARY KEY,
  process_run_id UUID NOT NULL REFERENCES batch_process_run(process_run_id) ON DELETE CASCADE,
  from_step_execution_id UUID REFERENCES process_step_execution(step_execution_id),
  to_step_execution_id UUID REFERENCES process_step_execution(step_execution_id),
  transition_type TEXT NOT NULL,
  transition_status TEXT NOT NULL DEFAULT 'APPLIED',
  reason_code TEXT,
  source_signal TEXT,
  source_ts TIMESTAMPTZ NOT NULL,
  requested_by TEXT,
  detail_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_process_transition_run_time ON process_transition_event(process_run_id, source_ts DESC);
