-- Menjadikan batch_process_run sebagai source of truth untuk konteks batch aktif.
-- Penulis telemetry tetap boleh memperbarui sensor/state pada asset_snapshot,
-- tetapi tidak boleh menghapus batch_no/progress selama run masih RUNNING/HOLD.

ALTER TABLE batch_process_run
  ADD COLUMN IF NOT EXISTS progress_percent NUMERIC(5,2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'batch_process_run'::regclass
      AND conname = 'batch_process_run_progress_percent_check'
  ) THEN
    ALTER TABLE batch_process_run
      ADD CONSTRAINT batch_process_run_progress_percent_check
      CHECK (progress_percent IS NULL OR progress_percent BETWEEN 0 AND 100);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_batch_process_run_active_asset
  ON batch_process_run(asset_id, updated_at DESC)
  WHERE run_status IN ('RUNNING', 'HOLD');

CREATE OR REPLACE FUNCTION preserve_active_batch_snapshot_context()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  active_context RECORD;
BEGIN
  SELECT
    run.batch_no,
    run.progress_percent
  INTO active_context
  FROM batch_process_run run
  WHERE run.asset_id = NEW.asset_id
    AND run.run_status IN ('RUNNING', 'HOLD')
  ORDER BY run.source_updated_at DESC NULLS LAST, run.updated_at DESC, run.started_at DESC NULLS LAST
  LIMIT 1;

  IF FOUND THEN
    NEW.batch_no := active_context.batch_no;
    IF active_context.progress_percent IS NOT NULL THEN
      NEW.progress_percent := active_context.progress_percent;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgrelid = 'asset_snapshot'::regclass
      AND tgname = 'trg_preserve_active_batch_snapshot_context'
      AND NOT tgisinternal
  ) THEN
    CREATE TRIGGER trg_preserve_active_batch_snapshot_context
    BEFORE INSERT OR UPDATE ON asset_snapshot
    FOR EACH ROW
    EXECUTE FUNCTION preserve_active_batch_snapshot_context();
  END IF;
END;
$$;

-- Rekonsiliasi langsung agar snapshot lama mengikuti active run terbaru.
WITH latest_active AS (
  SELECT DISTINCT ON (asset_id)
    asset_id,
    batch_no,
    progress_percent
  FROM batch_process_run
  WHERE run_status IN ('RUNNING', 'HOLD')
  ORDER BY asset_id, source_updated_at DESC NULLS LAST, updated_at DESC, started_at DESC NULLS LAST
)
UPDATE asset_snapshot snapshot
SET
  batch_no = active.batch_no,
  progress_percent = COALESCE(active.progress_percent, snapshot.progress_percent),
  updated_at = NOW()
FROM latest_active active
WHERE snapshot.asset_id = active.asset_id
  AND (
    snapshot.batch_no IS DISTINCT FROM active.batch_no
    OR (active.progress_percent IS NOT NULL AND snapshot.progress_percent IS DISTINCT FROM active.progress_percent)
  );
