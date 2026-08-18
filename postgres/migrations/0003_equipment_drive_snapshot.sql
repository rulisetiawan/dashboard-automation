-- Equipment and 3-phase drive diagnostics. No sample rows are created here.

CREATE TABLE IF NOT EXISTS equipment (
  equipment_id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES asset(asset_id) ON DELETE CASCADE,
  equipment_type TEXT NOT NULL,
  equipment_code TEXT NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT,
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE(asset_id, equipment_code)
);

CREATE INDEX IF NOT EXISTS idx_equipment_asset ON equipment(asset_id, active);

CREATE TABLE IF NOT EXISTS equipment_snapshot (
  equipment_id TEXT PRIMARY KEY REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  equipment_state TEXT NOT NULL DEFAULT 'offline',
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
  maintenance_due_at TIMESTAMPTZ,
  source_ts TIMESTAMPTZ NOT NULL,
  quality TEXT NOT NULL DEFAULT 'GOOD',
  values_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_equipment_snapshot_state ON equipment_snapshot(equipment_state, updated_at DESC);
