-- Native PostgreSQL historian rollups. Works without TimescaleDB.

CREATE TABLE IF NOT EXISTS telemetry_aggregate_1m (
  bucket_start TIMESTAMPTZ NOT NULL,
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  tag_code TEXT NOT NULL REFERENCES tag_definition(tag_code),
  sample_count INTEGER NOT NULL,
  good_sample_count INTEGER NOT NULL,
  bad_sample_count INTEGER NOT NULL,
  min_value DOUBLE PRECISION,
  max_value DOUBLE PRECISION,
  avg_value DOUBLE PRECISION,
  first_value DOUBLE PRECISION,
  last_value DOUBLE PRECISION,
  delta_value DOUBLE PRECISION,
  last_source_ts TIMESTAMPTZ,
  refreshed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (bucket_start, tag_code)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_aggregate_1m_asset_time ON telemetry_aggregate_1m(asset_id, bucket_start DESC);

CREATE TABLE IF NOT EXISTS telemetry_aggregate_15m (
  bucket_start TIMESTAMPTZ NOT NULL,
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  tag_code TEXT NOT NULL REFERENCES tag_definition(tag_code),
  sample_count INTEGER NOT NULL,
  good_sample_count INTEGER NOT NULL,
  bad_sample_count INTEGER NOT NULL,
  min_value DOUBLE PRECISION,
  max_value DOUBLE PRECISION,
  avg_value DOUBLE PRECISION,
  first_value DOUBLE PRECISION,
  last_value DOUBLE PRECISION,
  delta_value DOUBLE PRECISION,
  last_source_ts TIMESTAMPTZ,
  refreshed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (bucket_start, tag_code)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_aggregate_15m_asset_time ON telemetry_aggregate_15m(asset_id, bucket_start DESC);

CREATE TABLE IF NOT EXISTS telemetry_aggregate_daily (
  bucket_start TIMESTAMPTZ NOT NULL,
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  tag_code TEXT NOT NULL REFERENCES tag_definition(tag_code),
  sample_count INTEGER NOT NULL,
  good_sample_count INTEGER NOT NULL,
  bad_sample_count INTEGER NOT NULL,
  min_value DOUBLE PRECISION,
  max_value DOUBLE PRECISION,
  avg_value DOUBLE PRECISION,
  first_value DOUBLE PRECISION,
  last_value DOUBLE PRECISION,
  delta_value DOUBLE PRECISION,
  last_source_ts TIMESTAMPTZ,
  refreshed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (bucket_start, tag_code)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_aggregate_daily_asset_time ON telemetry_aggregate_daily(asset_id, bucket_start DESC);

CREATE TABLE IF NOT EXISTS utility_sample (
  id BIGSERIAL PRIMARY KEY,
  utility_code TEXT NOT NULL,
  source_ts TIMESTAMPTZ NOT NULL,
  value_number DOUBLE PRECISION NOT NULL,
  engineering_unit TEXT NOT NULL,
  quality TEXT NOT NULL,
  gateway_id TEXT,
  message_id UUID NOT NULL UNIQUE,
  ingested_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_utility_sample_time ON utility_sample(utility_code, source_ts DESC);

CREATE TABLE IF NOT EXISTS utility_aggregate_daily (
  bucket_start TIMESTAMPTZ NOT NULL,
  utility_code TEXT NOT NULL,
  sample_count INTEGER NOT NULL,
  good_sample_count INTEGER NOT NULL,
  min_value DOUBLE PRECISION,
  max_value DOUBLE PRECISION,
  avg_value DOUBLE PRECISION,
  first_value DOUBLE PRECISION,
  last_value DOUBLE PRECISION,
  delta_value DOUBLE PRECISION,
  engineering_unit TEXT NOT NULL,
  last_source_ts TIMESTAMPTZ,
  refreshed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (bucket_start, utility_code)
);

CREATE TABLE IF NOT EXISTS machine_state_event (
  state_event_id UUID PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  machine_state TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  reason_code TEXT,
  source_ts TIMESTAMPTZ NOT NULL,
  quality TEXT NOT NULL DEFAULT 'GOOD',
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_machine_state_event_asset_time ON machine_state_event(asset_id, started_at DESC);

CREATE TABLE IF NOT EXISTS machine_state_aggregate_daily (
  bucket_start TIMESTAMPTZ NOT NULL,
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  machine_state TEXT NOT NULL,
  duration_seconds DOUBLE PRECISION NOT NULL,
  event_count INTEGER NOT NULL,
  refreshed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (bucket_start, asset_id, machine_state)
);

CREATE OR REPLACE FUNCTION refresh_telemetry_rollups(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM telemetry_aggregate_1m WHERE bucket_start >= date_trunc('minute', p_from) AND bucket_start <= date_trunc('minute', p_to);
  INSERT INTO telemetry_aggregate_1m
  SELECT date_trunc('minute', source_ts), asset_id, tag_code,
    COUNT(*)::int, COUNT(*) FILTER (WHERE quality = 'GOOD')::int, COUNT(*) FILTER (WHERE quality <> 'GOOD')::int,
    MIN(value_number), MAX(value_number), AVG(value_number),
    (ARRAY_AGG(value_number ORDER BY source_ts))[1], (ARRAY_AGG(value_number ORDER BY source_ts DESC))[1],
    (ARRAY_AGG(value_number ORDER BY source_ts DESC))[1] - (ARRAY_AGG(value_number ORDER BY source_ts))[1],
    MAX(source_ts), NOW()
  FROM telemetry_sample
  WHERE source_ts >= p_from AND source_ts <= p_to AND value_number IS NOT NULL
  GROUP BY 1, asset_id, tag_code;

  DELETE FROM telemetry_aggregate_15m WHERE bucket_start >= date_bin('15 minutes', p_from, '2000-01-01T00:00:00Z'::timestamptz) AND bucket_start <= date_bin('15 minutes', p_to, '2000-01-01T00:00:00Z'::timestamptz);
  INSERT INTO telemetry_aggregate_15m
  SELECT date_bin('15 minutes', source_ts, '2000-01-01T00:00:00Z'::timestamptz), asset_id, tag_code,
    COUNT(*)::int, COUNT(*) FILTER (WHERE quality = 'GOOD')::int, COUNT(*) FILTER (WHERE quality <> 'GOOD')::int,
    MIN(value_number), MAX(value_number), AVG(value_number),
    (ARRAY_AGG(value_number ORDER BY source_ts))[1], (ARRAY_AGG(value_number ORDER BY source_ts DESC))[1],
    (ARRAY_AGG(value_number ORDER BY source_ts DESC))[1] - (ARRAY_AGG(value_number ORDER BY source_ts))[1],
    MAX(source_ts), NOW()
  FROM telemetry_sample
  WHERE source_ts >= p_from AND source_ts <= p_to AND value_number IS NOT NULL
  GROUP BY 1, asset_id, tag_code;

  DELETE FROM telemetry_aggregate_daily WHERE bucket_start >= date_trunc('day', p_from) AND bucket_start <= date_trunc('day', p_to);
  INSERT INTO telemetry_aggregate_daily
  SELECT date_trunc('day', source_ts), asset_id, tag_code,
    COUNT(*)::int, COUNT(*) FILTER (WHERE quality = 'GOOD')::int, COUNT(*) FILTER (WHERE quality <> 'GOOD')::int,
    MIN(value_number), MAX(value_number), AVG(value_number),
    (ARRAY_AGG(value_number ORDER BY source_ts))[1], (ARRAY_AGG(value_number ORDER BY source_ts DESC))[1],
    (ARRAY_AGG(value_number ORDER BY source_ts DESC))[1] - (ARRAY_AGG(value_number ORDER BY source_ts))[1],
    MAX(source_ts), NOW()
  FROM telemetry_sample
  WHERE source_ts >= p_from AND source_ts <= p_to AND value_number IS NOT NULL
  GROUP BY 1, asset_id, tag_code;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_utility_rollups(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM utility_aggregate_daily WHERE bucket_start >= date_trunc('day', p_from) AND bucket_start <= date_trunc('day', p_to);
  INSERT INTO utility_aggregate_daily
  SELECT date_trunc('day', source_ts), utility_code,
    COUNT(*)::int, COUNT(*) FILTER (WHERE quality = 'GOOD')::int,
    MIN(value_number), MAX(value_number), AVG(value_number),
    (ARRAY_AGG(value_number ORDER BY source_ts))[1], (ARRAY_AGG(value_number ORDER BY source_ts DESC))[1],
    (ARRAY_AGG(value_number ORDER BY source_ts DESC))[1] - (ARRAY_AGG(value_number ORDER BY source_ts))[1],
    MAX(engineering_unit), MAX(source_ts), NOW()
  FROM utility_sample
  WHERE source_ts >= p_from AND source_ts <= p_to
  GROUP BY 1, utility_code;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_machine_state_rollups(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM machine_state_aggregate_daily WHERE bucket_start >= date_trunc('day', p_from) AND bucket_start <= date_trunc('day', p_to);
  INSERT INTO machine_state_aggregate_daily
  SELECT day_start, asset_id, machine_state,
    SUM(EXTRACT(EPOCH FROM (LEAST(COALESCE(ended_at, p_to), day_start + INTERVAL '1 day', p_to) - GREATEST(started_at, day_start, p_from)))),
    COUNT(*)::int, NOW()
  FROM (
    SELECT event.asset_id, event.machine_state, event.started_at, event.ended_at, day_start
    FROM machine_state_event event
    CROSS JOIN LATERAL generate_series(date_trunc('day', GREATEST(event.started_at, p_from)), date_trunc('day', LEAST(COALESCE(event.ended_at, p_to), p_to)), INTERVAL '1 day') AS series(day_start)
    WHERE event.started_at <= p_to AND COALESCE(event.ended_at, p_to) >= p_from
  ) AS expanded
  GROUP BY day_start, asset_id, machine_state;
END;
$$;
