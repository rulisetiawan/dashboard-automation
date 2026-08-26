-- Metadata integrasi untuk ingest production batch dan batch process run dari aplikasi eksternal.

ALTER TABLE production_batch
  ADD COLUMN IF NOT EXISTS source_system TEXT,
  ADD COLUMN IF NOT EXISTS external_reference TEXT,
  ADD COLUMN IF NOT EXISTS source_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payload_json JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_production_batch_source
  ON production_batch(source_system, source_updated_at DESC);

ALTER TABLE batch_process_run
  ADD COLUMN IF NOT EXISTS source_system TEXT,
  ADD COLUMN IF NOT EXISTS external_run_id TEXT,
  ADD COLUMN IF NOT EXISTS source_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payload_json JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS uq_batch_process_run_external
  ON batch_process_run(source_system, external_run_id)
  WHERE external_run_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_batch_process_run_source_update
  ON batch_process_run(source_system, source_updated_at DESC);

