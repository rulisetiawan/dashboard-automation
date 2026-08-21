import { createHash } from "node:crypto";
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
const now = new Date();
const round = (value, decimals = 3) => Number(value.toFixed(decimals));
const stableUuid = (value) => {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

const productionWindow = (minute) => minute >= 10 && minute <= 110;
const rampIn = (minute) => Math.min(1, Math.max(0, minute / 10));
const rampOut = (minute) => Math.min(1, Math.max(0, (minute - 110) / 10));

const tags = [
  { code: `SMM.${assetId}.UPPER_FELT.TEMPERATURE_SV`, value: (minute) => minute < 115 ? 127 : 100 },
  { code: `SMM.${assetId}.UPPER_FELT.TEMPERATURE_PV`, value: (minute) => minute < 10 ? 78 + 48.2 * rampIn(minute) : minute > 110 ? 126.2 - 11 * rampOut(minute) : 126.2 + Math.sin(minute * 0.22) * 0.55 },
  { code: `SMM.${assetId}.LOWER_FELT.TEMPERATURE_SV`, value: (minute) => minute < 115 ? 127 : 100 },
  { code: `SMM.${assetId}.LOWER_FELT.TEMPERATURE_PV`, value: (minute) => minute < 10 ? 76 + 49.4 * rampIn(minute) : minute > 110 ? 125.4 - 10.5 * rampOut(minute) : 125.4 + Math.cos(minute * 0.2) * 0.5 },
  { code: `SMM.${assetId}.UPPER_FELT.LOADCELL_SV`, value: () => 480 },
  { code: `SMM.${assetId}.UPPER_FELT.LOADCELL_PV`, value: (minute) => productionWindow(minute) ? 480 + Math.sin(minute * 0.28) * 2.6 : 480 * Math.max(0, rampIn(minute) - rampOut(minute)) },
  { code: `SMM.${assetId}.LOWER_FELT.LOADCELL_SV`, value: () => 475 },
  { code: `SMM.${assetId}.LOWER_FELT.LOADCELL_PV`, value: (minute) => productionWindow(minute) ? 475 + Math.cos(minute * 0.25) * 2.4 : 475 * Math.max(0, rampIn(minute) - rampOut(minute)) },
  { code: `SMM.${assetId}.DANCER.POSITION_PV`, value: (minute) => productionWindow(minute) ? 50 + Math.sin(minute * 0.31) * 1.8 : 0 },
  { code: `SMM.${assetId}.FABRIC.WIDTH_PV`, value: (minute) => productionWindow(minute) ? 181.2 + Math.cos(minute * 0.19) * 0.22 : 0 },
  { code: `SMM.${assetId}.OVERFEED.SPEED_PV`, value: (minute) => productionWindow(minute) ? 8.5 + Math.sin(minute * 0.27) * 0.16 : 0 },
  { code: `SMM.${assetId}.UPPER_FELT.SPEED_PV`, value: (minute) => productionWindow(minute) ? 11.5 + Math.sin(minute * 0.18) * 0.2 : 0 },
  { code: `SMM.${assetId}.PRODUCTION.OUTPUT_TOTAL_M`, value: (minute) => minute <= 10 ? 0 : minute >= 110 ? 1150 : (minute - 10) / 100 * 1150 },
];

const steps = [
  {
    id: "51000000-0000-4000-8000-000000000101",
    no: 1,
    code: "SETUP_PREHEAT",
    name: "Setup & Preheat",
    start: "2026-08-21T10:00:00+07:00",
    end: "2026-08-21T10:10:00+07:00",
    setpoint: { temperature_upper_c: 127, temperature_lower_c: 127 },
    actual: { temperature_upper_c: 126.2, temperature_lower_c: 125.4 },
  },
  {
    id: "51000000-0000-4000-8000-000000000102",
    no: 2,
    code: "FINISHING_RUN",
    name: "Kalender Finishing Run",
    start: "2026-08-21T10:10:00+07:00",
    end: "2026-08-21T11:50:00+07:00",
    setpoint: { loadcell_upper_kg: 480, loadcell_lower_kg: 475, fabric_width_cm: 181.2, overfeed_percent: 8.5 },
    actual: { output_m: 1150, quality: "GOOD" },
  },
  {
    id: "51000000-0000-4000-8000-000000000103",
    no: 3,
    code: "UNLOAD_QC_HANDOFF",
    name: "Unload & QC Handoff",
    start: "2026-08-21T11:50:00+07:00",
    end: "2026-08-21T12:00:00+07:00",
    setpoint: { target_output_m: 1150 },
    actual: { final_output_m: 1150, status: "RELEASED_TO_QC" },
  },
];

async function insertTelemetry(tag) {
  const rows = Array.from({ length: 121 }, (_, minute) => {
    const sourceTs = new Date(startedAt.getTime() + minute * 60_000);
    return [assetId, tag.code, sourceTs, round(tag.value(minute)), "GOOD", "LOCAL-BATCH-TRACKING", stableUuid(`${batchNo}|${tag.code}|${sourceTs.toISOString()}`), now];
  });
  const values = rows.flat();
  const placeholders = rows.map((_, rowIndex) => {
    const offset = rowIndex * 8;
    return `($${offset + 1},$${offset + 2},$${offset + 3},$${offset + 4},$${offset + 5},$${offset + 6},$${offset + 7},$${offset + 8})`;
  }).join(",");
  await pool.query(`
    INSERT INTO telemetry_sample (asset_id, tag_code, source_ts, value_number, quality, gateway_id, message_id, ingested_at)
    VALUES ${placeholders}
    ON CONFLICT (message_id, tag_code) DO UPDATE SET
      source_ts = EXCLUDED.source_ts,
      value_number = EXCLUDED.value_number,
      quality = EXCLUDED.quality,
      gateway_id = EXCLUDED.gateway_id,
      ingested_at = EXCLUDED.ingested_at
  `, values);
}

async function run() {
  await pool.query("BEGIN");
  try {
    const asset = await pool.query("SELECT asset_id FROM asset WHERE asset_id = $1 AND process_type = 'kalender'", [assetId]);
    if (!asset.rows[0]) throw new Error(`${assetId} belum terdaftar sebagai asset Kalender.`);

    const registered = await pool.query("SELECT tag_code FROM tag_definition WHERE asset_id = $1 AND tag_code = ANY($2::text[])", [assetId, tags.map((tag) => tag.code)]);
    const available = new Set(registered.rows.map((row) => row.tag_code));
    const missing = tags.map((tag) => tag.code).filter((tagCode) => !available.has(tagCode));
    if (missing.length) throw new Error(`Tag belum terdaftar: ${missing.join(", ")}`);

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
      VALUES ($1, $2, $3, 'kalender', 'KAL-FIN-181-180GSM', 'COMPLETED', $4, $5, 1150, 'm', $6, $6)
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

    for (const tag of tags) await insertTelemetry(tag);
    await pool.query("SELECT refresh_telemetry_rollups($1, $2)", [startedAt, endedAt]);
    await pool.query("SELECT refresh_machine_state_rollups($1, $2)", [startedAt, endedAt]);
    await pool.query("COMMIT");

    console.log(JSON.stringify({
      batch_no: batchNo,
      asset_id: assetId,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      process_steps: steps.length,
      telemetry_tags: tags.length,
      telemetry_samples: tags.length * 121,
      output: { value: 1150, unit: "m" },
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
