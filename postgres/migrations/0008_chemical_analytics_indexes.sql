BEGIN;

CREATE INDEX IF NOT EXISTS idx_chemical_transaction_occurred_at
  ON chemical_transaction(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_chemical_transaction_code_time
  ON chemical_transaction(chemical_code, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_chemical_transaction_dispenser_mode_time
  ON chemical_transaction(dispenser_id, mode, occurred_at DESC);

COMMIT;
