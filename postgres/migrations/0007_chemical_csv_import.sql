BEGIN;

ALTER TABLE chemical_transaction
  ALTER COLUMN calator_id DROP NOT NULL,
  ALTER COLUMN target_kg DROP NOT NULL;

ALTER TABLE chemical_transaction
  ADD COLUMN IF NOT EXISTS source_system TEXT,
  ADD COLUMN IF NOT EXISTS source_file TEXT,
  ADD COLUMN IF NOT EXISTS source_row_id TEXT,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS raw_payload JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS uq_chemical_transaction_source_row
  ON chemical_transaction(source_system, source_file, source_row_id)
  WHERE source_system IS NOT NULL
    AND source_file IS NOT NULL
    AND source_row_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chemical_transaction_mode_time
  ON chemical_transaction(mode, occurred_at DESC);

COMMIT;
