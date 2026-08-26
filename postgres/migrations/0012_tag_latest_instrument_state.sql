-- Generic latest-value store for every canonical tag.
-- `instrument_state` is the operational/P&ID projection; `tag_latest` remains
-- generic enough for valves, motors, instruments, counters, and virtual tags.

CREATE TABLE IF NOT EXISTS tag_latest (
  tag_code TEXT PRIMARY KEY REFERENCES tag_definition(tag_code),
  asset_id TEXT NOT NULL REFERENCES asset(asset_id),
  value_number DOUBLE PRECISION,
  value_text TEXT,
  quality TEXT NOT NULL,
  source_ts TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL,
  gateway_id TEXT,
  message_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_tag_latest_asset_updated
  ON tag_latest(asset_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_tag_latest_updated
  ON tag_latest(updated_at DESC);

ALTER TABLE tag_definition
  ADD COLUMN IF NOT EXISTS stale_after_seconds INTEGER NOT NULL DEFAULT 30;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tag_definition_stale_after_seconds_check'
      AND conrelid = 'tag_definition'::regclass
  ) THEN
    ALTER TABLE tag_definition
      ADD CONSTRAINT tag_definition_stale_after_seconds_check
      CHECK (stale_after_seconds > 0);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION sync_tag_latest_from_telemetry()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO tag_latest (
    tag_code,
    asset_id,
    value_number,
    value_text,
    quality,
    source_ts,
    ingested_at,
    gateway_id,
    message_id,
    updated_at
  )
  VALUES (
    NEW.tag_code,
    NEW.asset_id,
    NEW.value_number,
    NEW.value_text,
    NEW.quality,
    NEW.source_ts,
    NEW.ingested_at,
    NEW.gateway_id,
    NEW.message_id,
    clock_timestamp()
  )
  ON CONFLICT (tag_code)
  DO UPDATE SET
    asset_id = EXCLUDED.asset_id,
    value_number = EXCLUDED.value_number,
    value_text = EXCLUDED.value_text,
    quality = EXCLUDED.quality,
    source_ts = EXCLUDED.source_ts,
    ingested_at = EXCLUDED.ingested_at,
    gateway_id = EXCLUDED.gateway_id,
    message_id = EXCLUDED.message_id,
    updated_at = clock_timestamp()
  WHERE (EXCLUDED.source_ts, EXCLUDED.ingested_at)
       > (tag_latest.source_ts, tag_latest.ingested_at);

  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_sync_tag_latest_from_telemetry ON telemetry_sample;

CREATE TRIGGER trg_sync_tag_latest_from_telemetry
AFTER INSERT ON telemetry_sample
FOR EACH ROW
EXECUTE FUNCTION sync_tag_latest_from_telemetry();

-- Efficient backfill: one indexed latest-row lookup for each registered tag.
INSERT INTO tag_latest (
  tag_code,
  asset_id,
  value_number,
  value_text,
  quality,
  source_ts,
  ingested_at,
  gateway_id,
  message_id,
  updated_at
)
SELECT
  latest.tag_code,
  latest.asset_id,
  latest.value_number,
  latest.value_text,
  latest.quality,
  latest.source_ts,
  latest.ingested_at,
  latest.gateway_id,
  latest.message_id,
  clock_timestamp()
FROM tag_definition definition
JOIN LATERAL (
  SELECT sample.*
  FROM telemetry_sample sample
  WHERE sample.asset_id = definition.asset_id
    AND sample.tag_code = definition.tag_code
  ORDER BY sample.source_ts DESC, sample.ingested_at DESC, sample.id DESC
  LIMIT 1
) latest ON TRUE
ON CONFLICT (tag_code)
DO UPDATE SET
  asset_id = EXCLUDED.asset_id,
  value_number = EXCLUDED.value_number,
  value_text = EXCLUDED.value_text,
  quality = EXCLUDED.quality,
  source_ts = EXCLUDED.source_ts,
  ingested_at = EXCLUDED.ingested_at,
  gateway_id = EXCLUDED.gateway_id,
  message_id = EXCLUDED.message_id,
  updated_at = clock_timestamp()
WHERE (EXCLUDED.source_ts, EXCLUDED.ingested_at)
     > (tag_latest.source_ts, tag_latest.ingested_at);

CREATE OR REPLACE VIEW instrument_state AS
WITH parsed AS (
  SELECT
    latest.*,
    definition.signal_role,
    definition.engineering_unit,
    definition.source_status,
    definition.active,
    definition.stale_after_seconds,
    asset.process_type,
    asset.area_code,
    asset.area_name,
    asset.display_name AS asset_name,
    string_to_array(latest.tag_code, '.') AS tag_parts,
    CASE
      WHEN NOT (upper(definition.signal_role) LIKE ANY (ARRAY['%FB', '%STATUS', '%STATE', '%ALARM', '%CMD'])) THEN NULL
      WHEN lower(COALESCE(latest.value_text, '')) IN ('true', '1', 'on', 'open', 'running', 'active') THEN TRUE
      WHEN lower(COALESCE(latest.value_text, '')) IN ('false', '0', 'off', 'closed', 'stopped', 'inactive') THEN FALSE
      WHEN latest.value_text IS NULL AND latest.value_number IS NOT NULL THEN latest.value_number <> 0
      ELSE NULL
    END AS boolean_value,
    CASE
      WHEN upper(latest.quality) IN ('BAD', 'STALE', 'NOT_CONNECTED') THEN upper(latest.quality)
      WHEN latest.source_ts < clock_timestamp() - make_interval(secs => definition.stale_after_seconds) THEN 'STALE'
      ELSE upper(latest.quality)
    END AS effective_quality
  FROM tag_latest latest
  JOIN tag_definition definition ON definition.tag_code = latest.tag_code
  JOIN asset ON asset.asset_id = latest.asset_id
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
  updated_at
FROM parsed;

COMMENT ON TABLE tag_latest IS
  'Generic latest value per canonical tag; maintained automatically from telemetry_sample.';

COMMENT ON VIEW instrument_state IS
  'P&ID-friendly projection of tag_latest with element, parameter, effective quality, and semantic state.';
