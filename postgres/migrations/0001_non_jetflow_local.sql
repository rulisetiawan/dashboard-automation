CREATE TABLE IF NOT EXISTS backend_meta (
  meta_key TEXT PRIMARY KEY,
  meta_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS asset (
  asset_id TEXT PRIMARY KEY,
  process_type TEXT NOT NULL,
  area_code TEXT NOT NULL,
  area_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  subtype TEXT,
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_asset_process_area ON asset(process_type, area_code);

CREATE TABLE IF NOT EXISTS asset_snapshot (
  asset_id TEXT PRIMARY KEY REFERENCES asset(asset_id),
  machine_state TEXT NOT NULL,
  batch_no TEXT,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  connected BOOLEAN NOT NULL DEFAULT FALSE,
  source_ts TIMESTAMPTZ NOT NULL,
  quality TEXT NOT NULL DEFAULT 'GOOD',
  values_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshot_state ON asset_snapshot(machine_state, updated_at DESC);

CREATE TABLE IF NOT EXISTS tag_definition (
  tag_code TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  signal_role TEXT NOT NULL,
  engineering_unit TEXT,
  source_status TEXT NOT NULL DEFAULT 'PENDING_MAPPING',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tag_definition_asset ON tag_definition(asset_id, active);

CREATE TABLE IF NOT EXISTS telemetry_sample (
  id BIGSERIAL PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  tag_code TEXT NOT NULL REFERENCES tag_definition(tag_code),
  source_ts TIMESTAMPTZ NOT NULL,
  value_number DOUBLE PRECISION,
  value_text TEXT,
  quality TEXT NOT NULL,
  gateway_id TEXT,
  message_id UUID NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL,
  UNIQUE(message_id, tag_code)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_asset_tag_ts ON telemetry_sample(asset_id, tag_code, source_ts DESC);

CREATE TABLE IF NOT EXISTS chemical_transaction (
  transaction_id UUID PRIMARY KEY,
  request_code TEXT NOT NULL,
  dispenser_id TEXT NOT NULL REFERENCES asset(asset_id),
  calator_id TEXT NOT NULL REFERENCES asset(asset_id),
  chemical_code TEXT NOT NULL,
  chemical_name TEXT NOT NULL,
  target_kg NUMERIC(12,3) NOT NULL,
  actual_kg NUMERIC(12,3),
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  operator_name TEXT,
  stage TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chemical_transaction_filter ON chemical_transaction(dispenser_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS utility_snapshot (
  utility_code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  unit TEXT NOT NULL,
  quality TEXT NOT NULL,
  source_ts TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
