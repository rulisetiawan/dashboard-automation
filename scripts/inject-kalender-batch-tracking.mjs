import pg from "pg";

const pool = new pg.Pool({
  ...(process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }),
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

const assetId = "KL-DPN-05";
const batchNo = "BATCH-KL5-20260821-001";
const processRunId = "51000000-0000-4000-8000-000000000001";
const startedAt = new Date("2026-08-21T10:00:00+07:00");
const endedAt = new Date("2026-08-21T12:00:00+07:00");
const previousExampleGateway = "LOCAL-BATCH-TRACKING";

const stepDefinitions = [
  {
    id: "51000000-0000-4000-8000-000000000101",
    no: 1,
    code: "SETUP_PREHEAT",
    name: "Setup & Preheat",
    start: "2026-08-21T10:00:00+07:00",
    end: "2026-08-21T10:10:00+07:00",
    setpoint: { temperature_upper_c: 127, temperature_lower_c: 127 },
  },
  {
    id: "51000000-0000-4000-8000-000000000102",
    no: 2,
    code: "FINISHING_RUN",
    name: "Kalender Finishing Run",
    start: "2026-08-21T10:10:00+07:00",
    end: "2026-08-21T11:50:00+07:00",
    setpoint: {
      loadcell_upper_kg: 480,
      loadcell_lower_kg: 475,
      fabric_width_cm: 181.2,
      overfeed_percent: 8.5,
      overspeed_expander_percent: 2,
      overspeed_inlet_percent: 1.5,
      overspeed_plaiter_percent: 1,
    },
  },
  {
    id: "51000000-0000-4000-8000-000000000103",
    no: 3,
    code: "UNLOAD_QC_HANDOFF",
    name: "Unload & QC Handoff",
    start: "2026-08-21T11:50:00+07:00",
    end: "2026-08-21T12:00:00+07:00",
    setpoint: { target_output_kg: 375 },
  },
];

function numeric(value) {
  return value == null ? null : Number(Number(value).toFixed(3));
}

async function actualStepMeasurements(start, end) {
  const result = await pool.query(`
    SELECT
      d.signal_role,
      d.engineering_unit,
      COUNT(s.value_number)::int AS sample_count,
      MIN(s.value_number) AS min_value,
      MAX(s.value_number) AS max_value,
      AVG(s.value_number) AS avg_value
    FROM telemetry_sample s
    JOIN tag_definition d ON d.tag_code = s.tag_code
    WHERE s.asset_id = $1
      AND s.source_ts >= $2
      AND s.source_ts <= $3
      AND s.value_number IS NOT NULL
      AND s.gateway_id IS DISTINCT FROM $4
    GROUP BY d.signal_role, d.engineering_unit
    ORDER BY d.signal_role
  `, [assetId, start, end, previousExampleGateway]);

  return Object.fromEntries(result.rows.map((row) => [String(row.signal_role).toLowerCase(), {
    unit: row.engineering_unit,
    samples: row.sample_count,
    min: numeric(row.min_value),
    max: numeric(row.max_value),
    avg: numeric(row.avg_value),
  }]));
}

async function run() {
  await pool.query("BEGIN");
  try {
    const asset = await pool.query("SELECT asset_id FROM asset WHERE asset_id = $1 AND process_type = 'kalender'", [assetId]);
    if (!asset.rows[0]) throw new Error(`${assetId} belum terdaftar sebagai asset Kalender.`);

    // Cleanup hanya menyentuh telemetry contoh milik script versi lama.
    const cleanup = await pool.query("DELETE FROM telemetry_sample WHERE asset_id = $1 AND gateway_id = $2", [assetId, previousExampleGateway]);
    await pool.query("SELECT refresh_telemetry_rollups($1, $2)", [startedAt, endedAt]);

    const steps = [];
    for (const definition of stepDefinitions) {
      const start = new Date(definition.start);
      const end = new Date(definition.end);
      steps.push({ ...definition, actual: await actualStepMeasurements(start, end) });
    }
    const actualSampleCount = steps.reduce((sum, step) => sum + Object.values(step.actual).reduce((count, measurement) => count + measurement.samples, 0), 0);
    if (!actualSampleCount) throw new Error(`Tidak ada telemetry aktual ${assetId} pada 10.00–12.00 WIB; batch tidak diinject agar tidak menghasilkan trend palsu.`);

    const now = new Date();
    await pool.query(`
      INSERT INTO production_batch (batch_no, customer_name, fabric_type, fabric_weight_gsm, target_width_cm, target_output_kg, delivery_target_at, batch_status, created_at, updated_at)
      VALUES ($1, 'CUSTOMER TRACKING SAMPLE', 'Polyester Interlock', 180, 181.2, 375, '2026-08-22T17:00:00+07:00', 'COMPLETED', $2, $2)
      ON CONFLICT (batch_no) DO UPDATE SET
        customer_name = EXCLUDED.customer_name,
        fabric_type = EXCLUDED.fabric_type,
        fabric_weight_gsm = EXCLUDED.fabric_weight_gsm,
        target_width_cm = EXCLUDED.target_width_cm,
        target_output_kg = EXCLUDED.target_output_kg,
        delivery_target_at = EXCLUDED.delivery_target_at,
        batch_status = EXCLUDED.batch_status,
        updated_at = EXCLUDED.updated_at
    `, [batchNo, now]);

    await pool.query(`
      INSERT INTO batch_process_run (process_run_id, batch_no, asset_id, process_type, recipe_code, run_status, started_at, ended_at, output_quantity, output_unit, created_at, updated_at)
      VALUES ($1, $2, $3, 'kalender', 'KAL-FIN-181-180GSM', 'COMPLETED', $4, $5, NULL, NULL, $6, $6)
      ON CONFLICT (process_run_id) DO UPDATE SET
        batch_no = EXCLUDED.batch_no,
        asset_id = EXCLUDED.asset_id,
        recipe_code = EXCLUDED.recipe_code,
        run_status = EXCLUDED.run_status,
        started_at = EXCLUDED.started_at,
        ended_at = EXCLUDED.ended_at,
        output_quantity = EXCLUDED.output_quantity,
        output_unit = EXCLUDED.output_unit,
        updated_at = EXCLUDED.updated_at
    `, [processRunId, batchNo, assetId, startedAt, endedAt, now]);

    for (const step of steps) {
      await pool.query(`
        INSERT INTO process_step_execution (step_execution_id, process_run_id, step_no, step_code, step_name, status, started_at, ended_at, setpoint_json, actual_json, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 'COMPLETED', $6, $7, $8::jsonb, $9::jsonb, $10, $10)
        ON CONFLICT (step_execution_id) DO UPDATE SET
          step_no = EXCLUDED.step_no,
          step_code = EXCLUDED.step_code,
          step_name = EXCLUDED.step_name,
          status = EXCLUDED.status,
          started_at = EXCLUDED.started_at,
          ended_at = EXCLUDED.ended_at,
          setpoint_json = EXCLUDED.setpoint_json,
          actual_json = EXCLUDED.actual_json,
          updated_at = EXCLUDED.updated_at
      `, [step.id, processRunId, step.no, step.code, step.name, new Date(step.start), new Date(step.end), JSON.stringify(step.setpoint), JSON.stringify(step.actual), now]);
    }

    await pool.query(`
      INSERT INTO machine_state_event (state_event_id, asset_id, machine_state, started_at, ended_at, reason_code, source_ts, quality, created_at)
      VALUES ('51000000-0000-4000-8000-000000000201', $1, 'running', $2, $3, $4, $2, 'GOOD', $5)
      ON CONFLICT (state_event_id) DO UPDATE SET started_at = EXCLUDED.started_at, ended_at = EXCLUDED.ended_at, reason_code = EXCLUDED.reason_code, source_ts = EXCLUDED.source_ts
    `, [assetId, startedAt, endedAt, batchNo, now]);

    await pool.query("SELECT refresh_machine_state_rollups($1, $2)", [startedAt, endedAt]);
    await pool.query("COMMIT");

    console.log(JSON.stringify({
      batch_no: batchNo,
      asset_id: assetId,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      process_steps: steps.length,
      removed_previous_demo_samples: cleanup.rowCount,
      actual_samples_referenced: actualSampleCount,
      telemetry_injected: 0,
      note: "Batch metadata dan setting diinject; trend membaca telemetry aktual yang sudah ada.",
    }, null, 2));
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
