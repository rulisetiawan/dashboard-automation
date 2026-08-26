-- Configurable alarm rules and persistent evaluation state.
-- Safety interlocks and machine trips remain the responsibility of the PLC.

CREATE TABLE IF NOT EXISTS alarm_rule (
  rule_id UUID PRIMARY KEY,
  rule_name TEXT NOT NULL,
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  tag_code TEXT NOT NULL REFERENCES tag_definition(tag_code),
  rule_type TEXT NOT NULL CHECK (rule_type IN ('HIGH', 'HIGH_HIGH', 'LOW', 'LOW_LOW')),
  threshold_value DOUBLE PRECISION NOT NULL,
  hysteresis_value DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (hysteresis_value >= 0),
  delay_seconds INTEGER NOT NULL DEFAULT 0 CHECK (delay_seconds >= 0 AND delay_seconds <= 86400),
  severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  alarm_message TEXT,
  recommendation TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alarm_rule_asset ON alarm_rule(asset_id, enabled, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_alarm_rule_tag ON alarm_rule(tag_code, enabled);

CREATE TABLE IF NOT EXISTS alarm_rule_state (
  rule_id UUID PRIMARY KEY REFERENCES alarm_rule(rule_id) ON DELETE CASCADE,
  evaluation_state TEXT NOT NULL CHECK (evaluation_state IN ('NORMAL', 'PENDING', 'ACTIVE')),
  pending_since TIMESTAMPTZ,
  active_alarm_event_id UUID REFERENCES alarm_event(alarm_event_id),
  last_value DOUBLE PRECISION,
  last_quality TEXT,
  last_evaluated_ts TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE alarm_event ADD COLUMN IF NOT EXISTS rule_id UUID REFERENCES alarm_rule(rule_id);
ALTER TABLE alarm_event ADD COLUMN IF NOT EXISTS trigger_value DOUBLE PRECISION;
ALTER TABLE alarm_event ADD COLUMN IF NOT EXISTS threshold_value DOUBLE PRECISION;
ALTER TABLE alarm_event ADD COLUMN IF NOT EXISTS recommendation TEXT;

CREATE INDEX IF NOT EXISTS idx_alarm_event_rule_time ON alarm_event(rule_id, occurred_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_alarm_event_rule_active
  ON alarm_event(rule_id)
  WHERE rule_id IS NOT NULL AND event_state <> 'CLEARED';

CREATE TABLE IF NOT EXISTS alarm_rule_audit (
  audit_id BIGSERIAL PRIMARY KEY,
  rule_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  before_json JSONB,
  after_json JSONB,
  occurred_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alarm_rule_audit_rule_time ON alarm_rule_audit(rule_id, occurred_at DESC);
