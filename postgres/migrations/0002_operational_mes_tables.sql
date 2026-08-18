-- Struktur operasional tanpa seed/demo data.

CREATE TABLE IF NOT EXISTS production_batch (
  batch_no TEXT PRIMARY KEY,
  customer_name TEXT,
  fabric_type TEXT,
  fabric_weight_gsm NUMERIC(10,3),
  target_width_cm NUMERIC(10,3),
  target_output_kg NUMERIC(12,3),
  delivery_target_at TIMESTAMPTZ,
  batch_status TEXT NOT NULL DEFAULT 'PLANNED',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS batch_process_run (
  process_run_id UUID PRIMARY KEY,
  batch_no TEXT NOT NULL REFERENCES production_batch(batch_no),
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  process_type TEXT NOT NULL,
  recipe_code TEXT,
  run_status TEXT NOT NULL DEFAULT 'PLANNED',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  output_quantity NUMERIC(12,3),
  output_unit TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_batch_process_run_asset_time ON batch_process_run(asset_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_process_run_batch ON batch_process_run(batch_no, started_at DESC);

CREATE TABLE IF NOT EXISTS process_step_execution (
  step_execution_id UUID PRIMARY KEY,
  process_run_id UUID NOT NULL REFERENCES batch_process_run(process_run_id) ON DELETE CASCADE,
  step_no INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  setpoint_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  actual_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE(process_run_id, step_no)
);

CREATE INDEX IF NOT EXISTS idx_process_step_run ON process_step_execution(process_run_id, step_no);

CREATE TABLE IF NOT EXISTS alarm_event (
  alarm_event_id UUID PRIMARY KEY,
  asset_id TEXT REFERENCES asset(asset_id),
  tag_code TEXT REFERENCES tag_definition(tag_code),
  batch_no TEXT REFERENCES production_batch(batch_no),
  area_code TEXT,
  severity TEXT NOT NULL,
  event_state TEXT NOT NULL,
  alarm_code TEXT,
  title TEXT NOT NULL,
  detail TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  cleared_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by TEXT,
  source_ts TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alarm_event_time ON alarm_event(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_alarm_event_asset ON alarm_event(asset_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS maintenance_plan (
  maintenance_plan_id UUID PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  equipment_code TEXT,
  plan_type TEXT NOT NULL,
  plan_status TEXT NOT NULL DEFAULT 'PLANNED',
  due_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  description TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_maintenance_plan_due ON maintenance_plan(asset_id, due_at);

CREATE TABLE IF NOT EXISTS utility_meter (
  meter_id TEXT PRIMARY KEY,
  meter_name TEXT NOT NULL,
  utility_type TEXT NOT NULL,
  hierarchy_level TEXT NOT NULL,
  parent_meter_id TEXT REFERENCES utility_meter(meter_id),
  area_code TEXT,
  asset_id TEXT REFERENCES asset(asset_id),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_utility_meter_hierarchy ON utility_meter(utility_type, hierarchy_level, area_code);
