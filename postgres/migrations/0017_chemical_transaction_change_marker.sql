BEGIN;

CREATE TABLE IF NOT EXISTS dashboard_change_marker (
  source_key TEXT PRIMARY KEY,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

INSERT INTO dashboard_change_marker (source_key, changed_at)
SELECT 'chemical_transaction', COALESCE(MAX(created_at), clock_timestamp())
FROM chemical_transaction
ON CONFLICT (source_key) DO NOTHING;

CREATE OR REPLACE FUNCTION mark_chemical_transaction_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO dashboard_change_marker (source_key, changed_at)
  VALUES ('chemical_transaction', clock_timestamp())
  ON CONFLICT (source_key) DO UPDATE
  SET changed_at = GREATEST(
    clock_timestamp(),
    dashboard_change_marker.changed_at + INTERVAL '1 microsecond'
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_chemical_transaction_change ON chemical_transaction;
CREATE TRIGGER trg_chemical_transaction_change
AFTER INSERT OR UPDATE OR DELETE ON chemical_transaction
FOR EACH STATEMENT
EXECUTE FUNCTION mark_chemical_transaction_change();

COMMIT;
