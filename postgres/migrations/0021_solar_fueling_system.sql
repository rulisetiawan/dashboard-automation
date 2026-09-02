CREATE TABLE solar_stock_config (
  tank_id VARCHAR(80) PRIMARY KEY,
  display_name VARCHAR(160) NOT NULL,
  capacity_liters NUMERIC(18,3) NOT NULL DEFAULT 0 CHECK (capacity_liters >= 0),
  opening_stock_liters NUMERIC(18,3) NOT NULL DEFAULT 0 CHECK (opening_stock_liters >= 0),
  opening_at TIMESTAMPTZ NOT NULL DEFAULT '2000-01-01T00:00:00Z',
  reorder_level_liters NUMERIC(18,3) NOT NULL DEFAULT 0 CHECK (reorder_level_liters >= 0),
  tolerance_percent NUMERIC(7,3) NOT NULL DEFAULT 1 CHECK (tolerance_percent >= 0),
  updated_by VARCHAR(160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

INSERT INTO solar_stock_config (tank_id, display_name)
VALUES ('SOLAR-MAIN', 'Main Solar Tank')
ON CONFLICT (tank_id) DO NOTHING;

CREATE TABLE solar_fueling_transaction (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_system VARCHAR(80) NOT NULL DEFAULT 'SOLAR_MACHINE',
  source_id BIGINT,
  qr_code VARCHAR(160) NOT NULL,
  requested_liters NUMERIC(14,3) NOT NULL CHECK (requested_liters >= 0),
  metered_liters NUMERIC(14,3) CHECK (metered_liters >= 0),
  calculated_liters NUMERIC(14,3) CHECK (calculated_liters >= 0),
  machine_totalizer_liters NUMERIC(18,3) CHECK (machine_totalizer_liters >= 0),
  operation_type VARCHAR(32) NOT NULL DEFAULT 'FUELING' CHECK (operation_type IN ('FUELING','STOCK_RECEIPT','ADJUSTMENT','STOCK_OPNAME')),
  movement_direction VARCHAR(8) NOT NULL DEFAULT 'OUT' CHECK (movement_direction IN ('IN','OUT','NONE')),
  execution_mode VARCHAR(24) NOT NULL DEFAULT 'QR' CHECK (execution_mode IN ('QR','MANUAL','EMERGENCY')),
  transaction_status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED' CHECK (transaction_status IN ('QR_CREATED','READY','DISPENSING','COMPLETED','PARTIAL','FAILED','CANCELLED','EXPIRED','MANUAL_REVIEW')),
  qr_created_at TIMESTAMPTZ,
  fueling_started_at TIMESTAMPTZ,
  fueling_completed_at TIMESTAMPTZ,
  requester_name VARCHAR(160),
  qr_created_by VARCHAR(160),
  processed_by VARCHAR(160),
  consumer_id VARCHAR(120),
  consumer_label VARCHAR(200),
  notes TEXT,
  source_updated_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (source_system, source_id)
);

CREATE INDEX idx_solar_transaction_completed ON solar_fueling_transaction(fueling_completed_at DESC);
CREATE INDEX idx_solar_transaction_qr ON solar_fueling_transaction(qr_code);
CREATE INDEX idx_solar_transaction_status_time ON solar_fueling_transaction(transaction_status, fueling_completed_at DESC);
CREATE INDEX idx_solar_transaction_requester ON solar_fueling_transaction(LOWER(requester_name), fueling_completed_at DESC);

CREATE TABLE solar_stock_movement (
  movement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id VARCHAR(80) NOT NULL REFERENCES solar_stock_config(tank_id),
  movement_type VARCHAR(24) NOT NULL CHECK (movement_type IN ('RECEIPT','ADJUSTMENT','TRANSFER')),
  direction VARCHAR(8) NOT NULL CHECK (direction IN ('IN','OUT')),
  quantity_liters NUMERIC(18,3) NOT NULL CHECK (quantity_liters > 0),
  occurred_at TIMESTAMPTZ NOT NULL,
  reference_code VARCHAR(160),
  notes TEXT,
  created_by VARCHAR(160) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_solar_movement_tank_time ON solar_stock_movement(tank_id, occurred_at DESC);

CREATE TABLE solar_stock_opname (
  opname_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_number VARCHAR(80) NOT NULL UNIQUE,
  tank_id VARCHAR(80) NOT NULL REFERENCES solar_stock_config(tank_id),
  cutoff_at TIMESTAMPTZ NOT NULL,
  system_stock_liters NUMERIC(18,3) NOT NULL,
  physical_stock_liters NUMERIC(18,3) NOT NULL CHECK (physical_stock_liters >= 0),
  variance_liters NUMERIC(18,3) NOT NULL,
  accuracy_percent NUMERIC(7,3),
  measurement_method VARCHAR(80) NOT NULL,
  measured_by VARCHAR(160) NOT NULL,
  verified_by VARCHAR(160),
  status VARCHAR(16) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SUBMITTED','VERIFIED','POSTED','REJECTED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  verified_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ
);

CREATE INDEX idx_solar_opname_tank_time ON solar_stock_opname(tank_id, cutoff_at DESC);
CREATE INDEX idx_solar_opname_status ON solar_stock_opname(status, updated_at DESC);

CREATE TABLE solar_audit_event (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(40) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  action VARCHAR(40) NOT NULL,
  actor VARCHAR(160) NOT NULL,
  before_data JSONB,
  after_data JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_solar_audit_entity ON solar_audit_event(entity_type, entity_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION mark_solar_dashboard_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO dashboard_change_marker (source_key, changed_at)
  VALUES (TG_ARGV[0], clock_timestamp())
  ON CONFLICT (source_key) DO UPDATE SET changed_at = EXCLUDED.changed_at;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_solar_transaction_change AFTER INSERT OR UPDATE OR DELETE ON solar_fueling_transaction
FOR EACH STATEMENT EXECUTE FUNCTION mark_solar_dashboard_change('solar_fueling_transaction');
CREATE TRIGGER trg_solar_movement_change AFTER INSERT OR UPDATE OR DELETE ON solar_stock_movement
FOR EACH STATEMENT EXECUTE FUNCTION mark_solar_dashboard_change('solar_stock_movement');
CREATE TRIGGER trg_solar_opname_change AFTER INSERT OR UPDATE OR DELETE ON solar_stock_opname
FOR EACH STATEMENT EXECUTE FUNCTION mark_solar_dashboard_change('solar_stock_opname');
