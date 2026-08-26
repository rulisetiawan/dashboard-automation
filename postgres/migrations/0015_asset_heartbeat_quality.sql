-- One communication heartbeat per asset.
-- Discrete device states keep their last state while the asset heartbeat is healthy.
-- Analog/process measurements still use their own source timestamp for freshness.

ALTER TABLE tag_definition
  ADD COLUMN IF NOT EXISTS freshness_mode TEXT NOT NULL DEFAULT 'TAG_TIMESTAMP';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tag_definition_freshness_mode_check'
      AND conrelid = 'tag_definition'::regclass
  ) THEN
    ALTER TABLE tag_definition
      ADD CONSTRAINT tag_definition_freshness_mode_check
      CHECK (freshness_mode IN ('TAG_TIMESTAMP', 'ASSET_HEARTBEAT'));
  END IF;
END
$$;

-- Register exactly one canonical heartbeat for every active machine/asset.
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
  'SMM.' || asset.asset_id || '.COMMUNICATION.HEARTBEAT',
  asset.asset_id,
  'COMM_HEARTBEAT',
  'bool',
  'PENDING_MAPPING',
  TRUE,
  clock_timestamp(),
  30,
  'TAG_TIMESTAMP'
FROM asset
WHERE asset.active = TRUE
ON CONFLICT (tag_code)
DO UPDATE SET
  active = TRUE,
  stale_after_seconds = EXCLUDED.stale_after_seconds,
  freshness_mode = 'TAG_TIMESTAMP';

-- Discrete feedback is event/change based and inherits communication freshness.
-- Setpoints, process values, counters, and other analog tags remain TAG_TIMESTAMP.
UPDATE tag_definition
SET freshness_mode = 'ASSET_HEARTBEAT'
WHERE active = TRUE
  AND signal_role <> 'COMM_HEARTBEAT'
  AND (
    right(upper(signal_role), 3) = '_FB'
    OR right(upper(signal_role), 7) = '_STATUS'
    OR right(upper(signal_role), 6) = '_STATE'
    OR upper(signal_role) LIKE '%ALARM%'
  );

CREATE OR REPLACE VIEW asset_communication_state AS
WITH heartbeat AS (
  SELECT
    asset.asset_id,
    definition.tag_code AS heartbeat_tag_code,
    definition.stale_after_seconds,
    latest.value_number,
    latest.value_text,
    latest.quality AS raw_quality,
    latest.source_ts,
    latest.ingested_at,
    latest.gateway_id,
    latest.message_id,
    latest.updated_at,
    CASE
      WHEN lower(COALESCE(latest.value_text, '')) IN ('true', '1', 'on', 'online', 'connected', 'good') THEN TRUE
      WHEN lower(COALESCE(latest.value_text, '')) IN ('false', '0', 'off', 'offline', 'disconnected', 'bad') THEN FALSE
      WHEN latest.value_text IS NULL AND latest.value_number IS NOT NULL THEN latest.value_number <> 0
      ELSE NULL
    END AS heartbeat_value
  FROM asset
  LEFT JOIN tag_definition definition
    ON definition.asset_id = asset.asset_id
   AND definition.tag_code = 'SMM.' || asset.asset_id || '.COMMUNICATION.HEARTBEAT'
   AND definition.active = TRUE
  LEFT JOIN tag_latest latest ON latest.tag_code = definition.tag_code
  WHERE asset.active = TRUE
)
SELECT
  asset_id,
  heartbeat_tag_code,
  heartbeat_value,
  raw_quality,
  CASE
    WHEN heartbeat_tag_code IS NULL OR source_ts IS NULL THEN 'NOT_CONNECTED'
    WHEN upper(COALESCE(raw_quality, 'NOT_CONNECTED')) IN ('BAD', 'STALE', 'NOT_CONNECTED')
      THEN upper(COALESCE(raw_quality, 'NOT_CONNECTED'))
    WHEN source_ts < clock_timestamp() - make_interval(secs => stale_after_seconds) THEN 'STALE'
    WHEN heartbeat_value IS FALSE THEN 'NOT_CONNECTED'
    WHEN heartbeat_value IS TRUE THEN 'GOOD'
    ELSE 'BAD'
  END AS effective_quality,
  CASE
    WHEN heartbeat_tag_code IS NULL OR source_ts IS NULL THEN FALSE
    WHEN upper(COALESCE(raw_quality, 'NOT_CONNECTED')) <> 'GOOD' THEN FALSE
    WHEN source_ts < clock_timestamp() - make_interval(secs => stale_after_seconds) THEN FALSE
    ELSE heartbeat_value IS TRUE
  END AS online,
  stale_after_seconds,
  source_ts,
  ingested_at,
  gateway_id,
  message_id,
  updated_at
FROM heartbeat;

CREATE OR REPLACE VIEW instrument_state AS
WITH parsed AS (
  SELECT
    latest.*,
    definition.signal_role,
    definition.engineering_unit,
    definition.source_status,
    definition.active,
    definition.stale_after_seconds,
    definition.freshness_mode,
    communication.effective_quality AS communication_quality,
    communication.source_ts AS heartbeat_source_ts,
    asset.process_type,
    asset.area_code,
    asset.area_name,
    asset.display_name AS asset_name,
    string_to_array(latest.tag_code, '.') AS tag_parts,
    CASE
      WHEN NOT (upper(definition.signal_role) LIKE ANY (ARRAY['%FB', '%STATUS', '%STATE', '%ALARM', '%CMD'])) THEN NULL
      WHEN lower(COALESCE(latest.value_text, '')) IN ('true', '1', 'on', 'open', 'running', 'active', 'online', 'connected') THEN TRUE
      WHEN lower(COALESCE(latest.value_text, '')) IN ('false', '0', 'off', 'closed', 'stopped', 'inactive', 'offline', 'disconnected') THEN FALSE
      WHEN latest.value_text IS NULL AND latest.value_number IS NOT NULL THEN latest.value_number <> 0
      ELSE NULL
    END AS boolean_value,
    CASE
      WHEN upper(latest.quality) IN ('BAD', 'STALE', 'NOT_CONNECTED') THEN upper(latest.quality)
      WHEN communication.effective_quality IN ('BAD', 'STALE', 'NOT_CONNECTED') THEN communication.effective_quality
      WHEN definition.freshness_mode = 'TAG_TIMESTAMP'
       AND latest.source_ts < clock_timestamp() - make_interval(secs => definition.stale_after_seconds) THEN 'STALE'
      ELSE upper(latest.quality)
    END AS effective_quality
  FROM tag_latest latest
  JOIN tag_definition definition ON definition.tag_code = latest.tag_code
  JOIN asset ON asset.asset_id = latest.asset_id
  LEFT JOIN asset_communication_state communication ON communication.asset_id = latest.asset_id
)
SELECT
  tag_code,
  asset_id,
  process_type,
  area_code,
  area_name,
  asset_name,
  CASE
    WHEN array_position(tag_parts, asset_id) IS NOT NULL
      AND array_length(tag_parts, 1) > array_position(tag_parts, asset_id)
      THEN tag_parts[array_position(tag_parts, asset_id) + 1]
    WHEN array_length(tag_parts, 1) >= 3 THEN tag_parts[3]
    ELSE signal_role
  END AS element_code,
  CASE
    WHEN array_position(tag_parts, asset_id) IS NOT NULL
      AND array_length(tag_parts, 1) > array_position(tag_parts, asset_id) + 1
      THEN array_to_string(tag_parts[(array_position(tag_parts, asset_id) + 2):], '.')
    WHEN array_length(tag_parts, 1) >= 4 THEN array_to_string(tag_parts[4:], '.')
    ELSE signal_role
  END AS parameter_code,
  signal_role,
  engineering_unit,
  source_status,
  active,
  value_number,
  value_text,
  boolean_value,
  quality AS raw_quality,
  effective_quality,
  CASE
    WHEN effective_quality IN ('BAD', 'STALE', 'NOT_CONNECTED') THEN effective_quality
    WHEN (upper(signal_role) LIKE '%FAULT%FB' OR upper(signal_role) LIKE '%TRIP%FB') AND boolean_value IS TRUE THEN 'FAULT'
    WHEN upper(signal_role) LIKE '%ALARM%' AND boolean_value IS TRUE THEN 'ALARM'
    WHEN upper(signal_role) LIKE '%OPEN%FB' AND boolean_value IS TRUE THEN 'OPEN'
    WHEN upper(signal_role) LIKE '%OPEN%FB' AND boolean_value IS FALSE THEN 'CLOSED'
    WHEN upper(signal_role) LIKE '%RUN%FB' AND boolean_value IS TRUE THEN 'RUNNING'
    WHEN upper(signal_role) LIKE '%RUN%FB' AND boolean_value IS FALSE THEN 'STOPPED'
    WHEN upper(signal_role) LIKE '%STATE' AND value_text IS NOT NULL THEN upper(value_text)
    WHEN boolean_value IS TRUE AND (upper(signal_role) LIKE '%FB' OR upper(signal_role) LIKE '%STATUS') THEN 'ACTIVE'
    WHEN boolean_value IS FALSE AND (upper(signal_role) LIKE '%FB' OR upper(signal_role) LIKE '%STATUS') THEN 'INACTIVE'
    ELSE 'VALUE'
  END AS semantic_state,
  stale_after_seconds,
  source_ts,
  ingested_at,
  gateway_id,
  message_id,
  updated_at,
  freshness_mode,
  communication_quality,
  heartbeat_source_ts
FROM parsed;

COMMENT ON COLUMN tag_definition.freshness_mode IS
  'TAG_TIMESTAMP checks each tag timestamp; ASSET_HEARTBEAT keeps change-based discrete state valid while the asset heartbeat is healthy.';

COMMENT ON VIEW asset_communication_state IS
  'One computed communication state per active asset, sourced from its canonical heartbeat tag.';

COMMENT ON VIEW instrument_state IS
  'P&ID projection of tag_latest with semantic state plus asset-heartbeat and per-tag freshness quality.';
