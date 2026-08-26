-- TimescaleDB historian foundation for high-volume process telemetry.
-- Existing native aggregate tables are intentionally retained as a rollback path.

CREATE EXTENSION IF NOT EXISTS timescaledb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM timescaledb_information.hypertables
    WHERE hypertable_schema = 'public'
      AND hypertable_name = 'telemetry_sample'
  ) THEN
    ALTER TABLE telemetry_sample
      DROP CONSTRAINT IF EXISTS telemetry_sample_pkey,
      DROP CONSTRAINT IF EXISTS telemetry_sample_message_id_tag_code_key;

    ALTER TABLE telemetry_sample
      ADD CONSTRAINT telemetry_sample_pkey PRIMARY KEY (id, source_ts),
      ADD CONSTRAINT telemetry_sample_message_tag_source_key
        UNIQUE (message_id, tag_code, source_ts);
  END IF;
END
$$;

SELECT create_hypertable(
  'telemetry_sample',
  by_range('source_ts', INTERVAL '1 day'),
  create_default_indexes => FALSE,
  if_not_exists => TRUE,
  migrate_data => TRUE
);

CREATE INDEX IF NOT EXISTS idx_telemetry_asset_tag_ts
  ON telemetry_sample(asset_id, tag_code, source_ts DESC);

CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_cagg_1m
WITH (
  timescaledb.continuous,
  timescaledb.materialized_only = FALSE
) AS
SELECT
  time_bucket(INTERVAL '1 minute', source_ts) AS bucket_start,
  asset_id,
  tag_code,
  COUNT(*) AS sample_count,
  COUNT(*) FILTER (WHERE quality = 'GOOD') AS good_sample_count,
  COUNT(*) FILTER (WHERE quality <> 'GOOD') AS bad_sample_count,
  MIN(value_number) AS min_value,
  MAX(value_number) AS max_value,
  AVG(value_number) AS avg_value,
  first(value_number, source_ts) AS first_value,
  last(value_number, source_ts) AS last_value,
  last(value_number, source_ts) - first(value_number, source_ts) AS delta_value,
  MAX(source_ts) AS last_source_ts
FROM telemetry_sample
WHERE value_number IS NOT NULL
GROUP BY bucket_start, asset_id, tag_code
WITH NO DATA;

CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_cagg_15m
WITH (
  timescaledb.continuous,
  timescaledb.materialized_only = FALSE
) AS
SELECT
  time_bucket(INTERVAL '15 minutes', source_ts) AS bucket_start,
  asset_id,
  tag_code,
  COUNT(*) AS sample_count,
  COUNT(*) FILTER (WHERE quality = 'GOOD') AS good_sample_count,
  COUNT(*) FILTER (WHERE quality <> 'GOOD') AS bad_sample_count,
  MIN(value_number) AS min_value,
  MAX(value_number) AS max_value,
  AVG(value_number) AS avg_value,
  first(value_number, source_ts) AS first_value,
  last(value_number, source_ts) AS last_value,
  last(value_number, source_ts) - first(value_number, source_ts) AS delta_value,
  MAX(source_ts) AS last_source_ts
FROM telemetry_sample
WHERE value_number IS NOT NULL
GROUP BY bucket_start, asset_id, tag_code
WITH NO DATA;

CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_cagg_daily
WITH (
  timescaledb.continuous,
  timescaledb.materialized_only = FALSE
) AS
SELECT
  time_bucket(INTERVAL '1 day', source_ts) AS bucket_start,
  asset_id,
  tag_code,
  COUNT(*) AS sample_count,
  COUNT(*) FILTER (WHERE quality = 'GOOD') AS good_sample_count,
  COUNT(*) FILTER (WHERE quality <> 'GOOD') AS bad_sample_count,
  MIN(value_number) AS min_value,
  MAX(value_number) AS max_value,
  AVG(value_number) AS avg_value,
  first(value_number, source_ts) AS first_value,
  last(value_number, source_ts) AS last_value,
  last(value_number, source_ts) - first(value_number, source_ts) AS delta_value,
  MAX(source_ts) AS last_source_ts
FROM telemetry_sample
WHERE value_number IS NOT NULL
GROUP BY bucket_start, asset_id, tag_code
WITH NO DATA;

SELECT add_continuous_aggregate_policy(
  'telemetry_cagg_1m',
  start_offset => INTERVAL '30 days',
  end_offset => INTERVAL '1 minute',
  schedule_interval => INTERVAL '1 minute',
  if_not_exists => TRUE
);

SELECT add_continuous_aggregate_policy(
  'telemetry_cagg_15m',
  start_offset => INTERVAL '30 days',
  end_offset => INTERVAL '15 minutes',
  schedule_interval => INTERVAL '5 minutes',
  if_not_exists => TRUE
);

SELECT add_continuous_aggregate_policy(
  'telemetry_cagg_daily',
  start_offset => INTERVAL '30 days',
  end_offset => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 hour',
  if_not_exists => TRUE
);

ALTER TABLE telemetry_sample SET (
  timescaledb.enable_columnstore = TRUE,
  timescaledb.segmentby = 'asset_id,tag_code',
  timescaledb.orderby = 'source_ts DESC'
);

CALL add_columnstore_policy(
  'telemetry_sample',
  after => INTERVAL '7 days',
  if_not_exists => TRUE
);

SELECT add_retention_policy(
  'telemetry_sample',
  drop_after => INTERVAL '30 days',
  if_not_exists => TRUE
);

SELECT add_retention_policy(
  'telemetry_cagg_1m',
  drop_after => INTERVAL '400 days',
  if_not_exists => TRUE
);

SELECT add_retention_policy(
  'telemetry_cagg_15m',
  drop_after => INTERVAL '3 years',
  if_not_exists => TRUE
);

SELECT add_retention_policy(
  'telemetry_cagg_daily',
  drop_after => INTERVAL '10 years',
  if_not_exists => TRUE
);
