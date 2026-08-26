-- Dynamic PV/SV target tracking and batch process deviation events.
-- Static equipment thresholds remain in alarm_rule/alarm_event.

CREATE TABLE IF NOT EXISTS process_deviation_rule (
  rule_id UUID PRIMARY KEY,
  rule_code TEXT NOT NULL UNIQUE,
  rule_name TEXT NOT NULL,
  asset_id TEXT REFERENCES asset(asset_id),
  process_type TEXT,
  step_code TEXT,
  pv_tag_code TEXT REFERENCES tag_definition(tag_code),
  pv_signal_role TEXT,
  sv_tag_code TEXT REFERENCES tag_definition(tag_code),
  sv_signal_role TEXT,
  setpoint_key TEXT,
  deviation_mode TEXT NOT NULL DEFAULT 'ABSOLUTE'
    CHECK (deviation_mode IN ('ABSOLUTE', 'PERCENT')),
  tolerance_low DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (tolerance_low >= 0),
  tolerance_high DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (tolerance_high >= 0),
  startup_grace_seconds INTEGER NOT NULL DEFAULT 0 CHECK (startup_grace_seconds BETWEEN 0 AND 86400),
  expected_reach_time_seconds INTEGER CHECK (expected_reach_time_seconds IS NULL OR expected_reach_time_seconds BETWEEN 0 AND 604800),
  stable_confirmation_seconds INTEGER NOT NULL DEFAULT 0 CHECK (stable_confirmation_seconds BETWEEN 0 AND 86400),
  deviation_delay_seconds INTEGER NOT NULL DEFAULT 0 CHECK (deviation_delay_seconds BETWEEN 0 AND 86400),
  clear_confirmation_seconds INTEGER NOT NULL DEFAULT 0 CHECK (clear_confirmation_seconds BETWEEN 0 AND 86400),
  hysteresis_value DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (hysteresis_value >= 0),
  minimum_sv_change DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (minimum_sv_change >= 0),
  change_confirmation_seconds INTEGER NOT NULL DEFAULT 0 CHECK (change_confirmation_seconds BETWEEN 0 AND 86400),
  monitor_reach BOOLEAN NOT NULL DEFAULT TRUE,
  monitor_hold BOOLEAN NOT NULL DEFAULT TRUE,
  pause_on_machine_hold BOOLEAN NOT NULL DEFAULT TRUE,
  severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  impact_code TEXT NOT NULL DEFAULT 'PROCESS'
    CHECK (impact_code IN ('PROCESS', 'QUALITY', 'OUTPUT', 'DOWNTIME', 'UTILITY', 'EQUIPMENT')),
  alarm_message TEXT,
  recommendation TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  calculation_version TEXT NOT NULL DEFAULT '1.0',
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CHECK (asset_id IS NOT NULL OR process_type IS NOT NULL),
  CHECK (pv_tag_code IS NOT NULL OR pv_signal_role IS NOT NULL),
  CHECK (sv_tag_code IS NOT NULL OR sv_signal_role IS NOT NULL OR setpoint_key IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_process_deviation_rule_scope
  ON process_deviation_rule(enabled, process_type, asset_id, step_code);

CREATE INDEX IF NOT EXISTS idx_process_deviation_rule_pv_tag
  ON process_deviation_rule(pv_tag_code) WHERE pv_tag_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_process_deviation_rule_pv_role
  ON process_deviation_rule(pv_signal_role) WHERE pv_signal_role IS NOT NULL;

CREATE TABLE IF NOT EXISTS process_deviation_rule_audit (
  audit_id BIGSERIAL PRIMARY KEY,
  rule_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  before_json JSONB,
  after_json JSONB,
  occurred_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_process_deviation_rule_audit_time
  ON process_deviation_rule_audit(rule_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS process_target_execution (
  target_execution_id UUID PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES process_deviation_rule(rule_id),
  process_run_id UUID NOT NULL REFERENCES batch_process_run(process_run_id) ON DELETE CASCADE,
  step_execution_id UUID REFERENCES process_step_execution(step_execution_id),
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  batch_no TEXT NOT NULL REFERENCES production_batch(batch_no),
  parameter_code TEXT NOT NULL,
  pv_tag_code TEXT NOT NULL REFERENCES tag_definition(tag_code),
  sv_tag_code TEXT REFERENCES tag_definition(tag_code),
  revision_no INTEGER NOT NULL CHECK (revision_no > 0),
  sv_value DOUBLE PRECISION NOT NULL,
  tolerance_low DOUBLE PRECISION NOT NULL,
  tolerance_high DOUBLE PRECISION NOT NULL,
  target_state TEXT NOT NULL
    CHECK (target_state IN ('WAITING', 'RAMPING', 'STABILIZING', 'STABLE', 'PENDING', 'DEVIATING', 'CLEARING', 'PAUSED', 'COMPLETED', 'SUPERSEDED', 'CANCELLED')),
  tracking_started_at TIMESTAMPTZ NOT NULL,
  first_reached_at TIMESTAMPTZ,
  stable_at TIMESTAMPTZ,
  lost_target_at TIMESTAMPTZ,
  restored_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  end_reason TEXT,
  time_to_target_seconds INTEGER,
  total_paused_seconds INTEGER NOT NULL DEFAULT 0,
  worst_pv DOUBLE PRECISION,
  last_pv DOUBLE PRECISION,
  last_source_ts TIMESTAMPTZ,
  config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE(process_run_id, rule_id, pv_tag_code, revision_no)
);

CREATE INDEX IF NOT EXISTS idx_process_target_run_time
  ON process_target_execution(process_run_id, tracking_started_at);

CREATE INDEX IF NOT EXISTS idx_process_target_asset_active
  ON process_target_execution(asset_id, target_state, updated_at DESC);

CREATE TABLE IF NOT EXISTS process_setpoint_change_event (
  setpoint_change_id UUID PRIMARY KEY,
  process_run_id UUID NOT NULL REFERENCES batch_process_run(process_run_id) ON DELETE CASCADE,
  step_execution_id UUID REFERENCES process_step_execution(step_execution_id),
  target_execution_id UUID REFERENCES process_target_execution(target_execution_id),
  rule_id UUID NOT NULL REFERENCES process_deviation_rule(rule_id),
  batch_no TEXT NOT NULL REFERENCES production_batch(batch_no),
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  parameter_code TEXT NOT NULL,
  sv_tag_code TEXT REFERENCES tag_definition(tag_code),
  old_sv_value DOUBLE PRECISION,
  new_sv_value DOUBLE PRECISION NOT NULL,
  engineering_unit TEXT,
  changed_at TIMESTAMPTZ NOT NULL,
  change_source TEXT NOT NULL,
  changed_by TEXT,
  change_reason TEXT,
  source_message_id UUID,
  source_ts TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_process_setpoint_change_source
  ON process_setpoint_change_event(process_run_id, rule_id, parameter_code, source_ts, new_sv_value);

CREATE INDEX IF NOT EXISTS idx_process_setpoint_change_run_time
  ON process_setpoint_change_event(process_run_id, changed_at);

CREATE TABLE IF NOT EXISTS process_deviation_event (
  deviation_event_id UUID PRIMARY KEY,
  process_run_id UUID NOT NULL REFERENCES batch_process_run(process_run_id) ON DELETE CASCADE,
  step_execution_id UUID REFERENCES process_step_execution(step_execution_id),
  target_execution_id UUID NOT NULL REFERENCES process_target_execution(target_execution_id),
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  batch_no TEXT NOT NULL REFERENCES production_batch(batch_no),
  rule_id UUID NOT NULL REFERENCES process_deviation_rule(rule_id),
  event_class TEXT NOT NULL CHECK (event_class IN ('TIME_TO_TARGET', 'HOLD_TARGET')),
  severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  event_state TEXT NOT NULL CHECK (event_state IN ('ACTIVE', 'CLEARED', 'CLOSED', 'INVALIDATED')),
  pv_tag_code TEXT NOT NULL REFERENCES tag_definition(tag_code),
  sv_tag_code TEXT REFERENCES tag_definition(tag_code),
  sv_value DOUBLE PRECISION NOT NULL,
  trigger_pv DOUBLE PRECISION NOT NULL,
  worst_pv DOUBLE PRECISION NOT NULL,
  tolerance_low DOUBLE PRECISION NOT NULL,
  tolerance_high DOUBLE PRECISION NOT NULL,
  max_abs_deviation DOUBLE PRECISION NOT NULL,
  max_deviation_percent DOUBLE PRECISION,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  end_reason TEXT,
  impact_code TEXT NOT NULL,
  detail_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  alarm_event_id UUID REFERENCES alarm_event(alarm_event_id),
  calculation_version TEXT NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_process_deviation_run_time
  ON process_deviation_event(process_run_id, started_at);

CREATE INDEX IF NOT EXISTS idx_process_deviation_batch_time
  ON process_deviation_event(batch_no, started_at);

CREATE INDEX IF NOT EXISTS idx_process_deviation_asset_active
  ON process_deviation_event(asset_id, event_state, started_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_process_deviation_active_target
  ON process_deviation_event(target_execution_id)
  WHERE event_state = 'ACTIVE';

CREATE TABLE IF NOT EXISTS process_deviation_rule_state (
  state_id UUID PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES process_deviation_rule(rule_id) ON DELETE CASCADE,
  process_run_id UUID NOT NULL REFERENCES batch_process_run(process_run_id) ON DELETE CASCADE,
  step_execution_id UUID REFERENCES process_step_execution(step_execution_id),
  target_execution_id UUID NOT NULL REFERENCES process_target_execution(target_execution_id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  batch_no TEXT NOT NULL REFERENCES production_batch(batch_no),
  pv_tag_code TEXT NOT NULL REFERENCES tag_definition(tag_code),
  sv_tag_code TEXT REFERENCES tag_definition(tag_code),
  evaluation_state TEXT NOT NULL
    CHECK (evaluation_state IN ('WAITING', 'RAMPING', 'STABILIZING', 'STABLE', 'PENDING', 'DEVIATING', 'CLEARING', 'PAUSED')),
  state_before_pause TEXT,
  tracking_started_at TIMESTAMPTZ NOT NULL,
  within_since TIMESTAMPTZ,
  outside_since TIMESTAMPTZ,
  paused_since TIMESTAMPTZ,
  total_paused_seconds INTEGER NOT NULL DEFAULT 0,
  active_deviation_event_id UUID REFERENCES process_deviation_event(deviation_event_id),
  sv_value DOUBLE PRECISION NOT NULL,
  candidate_sv_value DOUBLE PRECISION,
  candidate_sv_since TIMESTAMPTZ,
  last_pv DOUBLE PRECISION,
  last_quality TEXT,
  last_evaluated_ts TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE(rule_id, process_run_id, pv_tag_code)
);

CREATE INDEX IF NOT EXISTS idx_process_deviation_state_asset
  ON process_deviation_rule_state(asset_id, evaluation_state, updated_at DESC);

ALTER TABLE process_target_execution ADD COLUMN IF NOT EXISTS total_paused_seconds INTEGER NOT NULL DEFAULT 0;
ALTER TABLE process_deviation_rule_state ADD COLUMN IF NOT EXISTS total_paused_seconds INTEGER NOT NULL DEFAULT 0;

ALTER TABLE alarm_event ADD COLUMN IF NOT EXISTS process_run_id UUID REFERENCES batch_process_run(process_run_id);
ALTER TABLE alarm_event ADD COLUMN IF NOT EXISTS step_execution_id UUID REFERENCES process_step_execution(step_execution_id);
ALTER TABLE alarm_event ADD COLUMN IF NOT EXISTS event_class TEXT;

CREATE INDEX IF NOT EXISTS idx_alarm_event_process_run_time
  ON alarm_event(process_run_id, occurred_at DESC)
  WHERE process_run_id IS NOT NULL;
