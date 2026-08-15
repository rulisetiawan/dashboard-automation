CREATE TABLE IF NOT EXISTS backend_meta (
  meta_key TEXT PRIMARY KEY,
  meta_value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS asset (
  asset_id TEXT PRIMARY KEY,
  process_type TEXT NOT NULL,
  area_code TEXT NOT NULL,
  area_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  subtype TEXT,
  config_json TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS asset_snapshot (
  asset_id TEXT PRIMARY KEY,
  machine_state TEXT NOT NULL,
  batch_no TEXT,
  progress_percent REAL NOT NULL DEFAULT 0,
  connected INTEGER NOT NULL DEFAULT 0,
  source_ts TEXT NOT NULL,
  quality TEXT NOT NULL DEFAULT 'GOOD',
  values_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tag_definition (
  tag_code TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  signal_role TEXT NOT NULL,
  engineering_unit TEXT,
  source_status TEXT NOT NULL DEFAULT 'PENDING_MAPPING',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS telemetry_sample (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id TEXT NOT NULL,
  tag_code TEXT NOT NULL,
  source_ts TEXT NOT NULL,
  value_number REAL,
  value_text TEXT,
  quality TEXT NOT NULL,
  gateway_id TEXT,
  message_id TEXT NOT NULL,
  ingested_at TEXT NOT NULL,
  UNIQUE(message_id, tag_code)
);

CREATE TABLE IF NOT EXISTS chemical_transaction (
  transaction_id TEXT PRIMARY KEY,
  request_code TEXT NOT NULL,
  dispenser_id TEXT NOT NULL,
  calator_id TEXT NOT NULL,
  chemical_code TEXT NOT NULL,
  chemical_name TEXT NOT NULL,
  target_kg REAL NOT NULL,
  actual_kg REAL,
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  operator_name TEXT,
  stage TEXT,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS utility_snapshot (
  utility_code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  quality TEXT NOT NULL,
  source_ts TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_asset_process_area ON asset(process_type, area_code);
CREATE INDEX IF NOT EXISTS idx_snapshot_state ON asset_snapshot(machine_state, updated_at);
CREATE INDEX IF NOT EXISTS idx_tag_definition_asset ON tag_definition(asset_id, active);
CREATE INDEX IF NOT EXISTS idx_telemetry_asset_tag_ts ON telemetry_sample(asset_id, tag_code, source_ts DESC);
CREATE INDEX IF NOT EXISTS idx_chemical_transaction_filter ON chemical_transaction(dispenser_id, occurred_at DESC);
