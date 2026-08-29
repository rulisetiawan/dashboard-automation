-- Actual AUTO/MANUAL selector feedback for every Chemical Dispensing unit.
-- This is machine control mode, not the mode recorded on a chemical transaction.

INSERT INTO tag_definition (
  tag_code,
  asset_id,
  signal_role,
  engineering_unit,
  source_status,
  active,
  created_at,
  stale_after_seconds,
  freshness_mode
)
SELECT
  'SMM.' || asset.asset_id || '.MACHINE.AUTO_MODE_FB',
  asset.asset_id,
  'MACHINE_AUTO_MODE_FB',
  'bool',
  'PENDING_MAPPING',
  TRUE,
  clock_timestamp(),
  30,
  'ASSET_HEARTBEAT'
FROM asset
WHERE asset.active = TRUE
  AND asset.process_type = 'chemical'
ON CONFLICT (tag_code)
DO UPDATE SET
  asset_id = EXCLUDED.asset_id,
  signal_role = EXCLUDED.signal_role,
  engineering_unit = EXCLUDED.engineering_unit,
  active = TRUE,
  stale_after_seconds = EXCLUDED.stale_after_seconds,
  freshness_mode = 'ASSET_HEARTBEAT';

COMMENT ON COLUMN tag_definition.freshness_mode IS
  'AUTO/MANUAL and other discrete feedback inherit the asset heartbeat; analog values retain TAG_TIMESTAMP freshness.';
