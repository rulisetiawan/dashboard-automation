ALTER TABLE solar_fueling_transaction
  ADD COLUMN source_totalizer_in_liters NUMERIC(18,3),
  ADD COLUMN source_totalizer_out_liters NUMERIC(18,3),
  ADD COLUMN calculated_stock_liters NUMERIC(18,3);

CREATE TABLE solar_level_sample (
  level_sample_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_system VARCHAR(80) NOT NULL,
  source_id BIGINT NOT NULL,
  tank_id VARCHAR(80) NOT NULL REFERENCES solar_stock_config(tank_id),
  stock_liters DOUBLE PRECISION NOT NULL,
  quality VARCHAR(16) NOT NULL CHECK (quality IN ('GOOD','BAD','STALE','NOT_CONNECTED')),
  quality_reason VARCHAR(200),
  source_ts TIMESTAMPTZ NOT NULL,
  source_created_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (source_system, source_id)
);

CREATE INDEX idx_solar_level_tank_ts ON solar_level_sample(tank_id, source_ts DESC);
CREATE INDEX idx_solar_level_good_ts ON solar_level_sample(tank_id, source_ts DESC) WHERE quality = 'GOOD';

CREATE TABLE solar_source_sync_state (
  source_system VARCHAR(80) NOT NULL,
  source_table VARCHAR(120) NOT NULL,
  last_source_id BIGINT NOT NULL DEFAULT 0,
  source_row_count BIGINT NOT NULL DEFAULT 0,
  last_source_ts TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  last_status VARCHAR(24) NOT NULL DEFAULT 'SUCCESS',
  last_error TEXT,
  PRIMARY KEY (source_system, source_table)
);

CREATE TRIGGER trg_solar_level_change AFTER INSERT OR UPDATE OR DELETE ON solar_level_sample
FOR EACH STATEMENT EXECUTE FUNCTION mark_solar_dashboard_change('solar_level_sample');

INSERT INTO dashboard_change_marker (source_key, changed_at)
VALUES ('solar_level_sample', clock_timestamp())
ON CONFLICT (source_key) DO UPDATE SET changed_at = EXCLUDED.changed_at;
