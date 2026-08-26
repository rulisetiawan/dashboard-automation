-- Complete valve-only canonical tag registry for Calator dispensing units.
-- Element names intentionally match SVG data-element-code values.

-- Motor monitoring is intentionally outside the Dispensing Calator scope.
-- Deactivate first so a future row with historical references never leaks into
-- operational APIs, then remove definitions that have no telemetry dependency.
UPDATE tag_definition
SET active = FALSE,
    source_status = 'NOT_REQUIRED'
WHERE asset_id LIKE 'DSP-%'
  AND tag_code ~ '\.(INLET_PUMP|TANK_01_MIXER|TRANSFER_PUMP)\.';

DELETE FROM tag_definition definition
WHERE definition.asset_id LIKE 'DSP-%'
  AND definition.tag_code ~ '\.(INLET_PUMP|TANK_01_MIXER|TRANSFER_PUMP)\.'
  AND NOT EXISTS (
    SELECT 1 FROM telemetry_sample sample WHERE sample.tag_code = definition.tag_code
  )
  AND NOT EXISTS (
    SELECT 1 FROM tag_latest latest WHERE latest.tag_code = definition.tag_code
  );

DELETE FROM equipment
WHERE asset_id LIKE 'DSP-%'
  AND equipment_code IN ('INLET-PUMP', 'TANK-MIXER', 'TRANSFER');

DO $$
DECLARE
  unit_row RECORD;
  element_code TEXT;
  parameter_row RECORD;
  canonical_tag TEXT;
BEGIN
  FOR unit_row IN
    SELECT * FROM (
      VALUES
        ('DSP-DPN-01', 2),
        ('DSP-BLK-01', 5),
        ('DSP-BLK-02', 4),
        ('DSP-TMR-01', 4),
        ('DSP-TMR-02', 3)
    ) AS units(asset_id, route_count)
  LOOP
    -- Eight chemical inlet valves, one Tank 1 -> Tank 2 transfer valve,
    -- and one route valve for every supported Calator branch.
    FOR element_code IN
      SELECT format('INLET_VALVE_%s', lpad(sequence_no::text, 2, '0'))
      FROM generate_series(1, 8) AS sequence_no
      UNION ALL
      SELECT 'TRANSFER_VALVE'
      UNION ALL
      SELECT format('ROUTE_CL_%s', lpad(sequence_no::text, 2, '0'))
      FROM generate_series(1, unit_row.route_count) AS sequence_no
    LOOP
      FOR parameter_row IN
        SELECT * FROM (
          VALUES
            ('OPEN_FB', 'bool', 30),
            ('FAULT_FB', 'bool', 30)
        ) AS parameters(parameter_code, engineering_unit, stale_seconds)
      LOOP
        canonical_tag := format(
          'SMM.%s.%s.%s',
          unit_row.asset_id,
          element_code,
          parameter_row.parameter_code
        );

        INSERT INTO tag_definition (
          tag_code, asset_id, signal_role, engineering_unit,
          source_status, active, created_at, stale_after_seconds
        )
        VALUES (
          canonical_tag,
          unit_row.asset_id,
          element_code || '_' || parameter_row.parameter_code,
          parameter_row.engineering_unit,
          'PENDING_MAPPING',
          TRUE,
          NOW(),
          parameter_row.stale_seconds
        )
        ON CONFLICT (tag_code)
        DO UPDATE SET
          asset_id = EXCLUDED.asset_id,
          signal_role = EXCLUDED.signal_role,
          engineering_unit = EXCLUDED.engineering_unit,
          active = TRUE,
          stale_after_seconds = EXCLUDED.stale_after_seconds;
      END LOOP;
    END LOOP;

  END LOOP;
END
$$;

COMMENT ON COLUMN tag_definition.signal_role IS
  'Semantic role; dispensing valve registry uses ELEMENT_CODE_PARAMETER_CODE so instrument_state can resolve OPEN/CLOSED and FAULT.';
