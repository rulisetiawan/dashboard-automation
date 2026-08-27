-- Document the second supported write path for latest-only operational values.
-- Historical telemetry continues to populate tag_latest through the existing trigger.

COMMENT ON TABLE tag_latest IS
  'Latest value per canonical tag; updated either by the telemetry_sample trigger or the validated latest-only ingestion API.';

COMMENT ON COLUMN tag_latest.source_ts IS
  'Timestamp at the source/controller; older API payloads must not overwrite a newer value.';

COMMENT ON COLUMN tag_latest.message_id IS
  'Source message UUID used to identify duplicate live-value deliveries.';
