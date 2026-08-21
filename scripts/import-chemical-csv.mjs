import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import pg from "pg";

const sourceDirectoryArg = process.argv.find((argument) => argument.startsWith("--directory="));
if (!sourceDirectoryArg) throw new Error("CSV directory is required. Use --directory=<path>.");
const sourceDirectory = path.resolve(sourceDirectoryArg.slice("--directory=".length));
const apply = process.argv.includes("--apply");
const sourceSystem = "CHEMICAL_WEIGHING_CSV";
const batchSize = 500;

const fileMapping = {
  "timbang_obat_belakang_1_auto.csv": ["DSP-BLK-01", "Automatic"],
  "timbang_obat_belakang_1_emergency.csv": ["DSP-BLK-01", "Emergency"],
  "timbang_obat_belakang_1_manual.csv": ["DSP-BLK-01", "Manual"],
  "timbang_obat_belakang2_auto.csv": ["DSP-BLK-02", "Automatic"],
  "timbang_obat_belakang2_emergency.csv": ["DSP-BLK-02", "Emergency"],
  "timbang_obat_belakang2_manual.csv": ["DSP-BLK-02", "Manual"],
  "timbang_obat_depan_auto.csv": ["DSP-DPN-01", "Automatic"],
  "timbang_obat_depan_emergency.csv": ["DSP-DPN-01", "Emergency"],
  "timbang_obat_depan_manual.csv": ["DSP-DPN-01", "Manual"],
  "timbang_obat_timur1_auto.csv": ["DSP-TMR-01", "Automatic"],
  "timbang_obat_timur1_emergency.csv": ["DSP-TMR-01", "Emergency"],
  "timbang_obat_timur1_manual.csv": ["DSP-TMR-01", "Manual"],
  "timbang_obat_timur2_auto.csv": ["DSP-TMR-02", "Automatic"],
  "timbang_obat_timur2_emergency.csv": ["DSP-TMR-02", "Emergency"],
  "timbang_obat_timur2_manual.csv": ["DSP-TMR-02", "Manual"],
};

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value);
      value = "";
    } else value += character;
  }
  values.push(value);
  return values;
}

function localTimestamp(value) {
  const match = String(value || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?$/);
  if (!match) throw new Error(`Invalid timestamp: ${value}`);
  const [, day, month, year, hour, minute, second, fraction = ""] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour}:${minute}:${second}${fraction ? `.${fraction}` : ""}+07:00`;
}

function deterministicUuid(key) {
  const bytes = Buffer.from(createHash("sha256").update(key).digest().subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function normalizeRow(fileName, dispenserId, mode, row) {
  const sourceRowId = String(row.id || "").trim();
  if (!sourceRowId) throw new Error(`${fileName}: source row id is empty`);
  const startedAt = localTimestamp(row.start_time);
  const endedAt = row.end_time ? localTimestamp(row.end_time) : null;
  const sourceKey = `${sourceSystem}|${fileName}|${sourceRowId}`;
  const emergency = mode === "Emergency";
  const weight = emergency ? null : Number(row.weight);
  if (!emergency && !Number.isFinite(weight)) throw new Error(`${fileName} row ${sourceRowId}: invalid weight ${row.weight}`);
  return {
    transactionId: deterministicUuid(sourceKey),
    requestCode: `CSV-${dispenserId}-${mode.toUpperCase()}-${sourceRowId}`,
    dispenserId,
    calatorId: null,
    chemicalCode: emergency ? "EMERGENCY" : String(row.chemical_code || "UNKNOWN").trim(),
    chemicalName: emergency ? String(row.emergency_state || "Emergency event").trim() : String(row.chemical || "Unknown chemical").trim(),
    targetKg: null,
    actualKg: weight,
    mode,
    status: endedAt ? "Completed" : "Active",
    operatorName: "CSV_IMPORT",
    stage: emergency ? `Emergency state · auto_state=${String(row.auto_state ?? "unknown").trim()}` : "Weighing completed",
    occurredAt: startedAt,
    createdAt: new Date().toISOString(),
    sourceSystem,
    sourceFile: fileName,
    sourceRowId,
    startedAt,
    endedAt,
    rawPayload: row,
  };
}

async function readSourceFile(fileName, dispenserId, mode) {
  const stream = createReadStream(path.join(sourceDirectory, fileName), { encoding: "utf8" });
  const lines = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headers = null;
  const records = [];
  for await (const line of lines) {
    if (!headers) {
      headers = parseCsvLine(line).map((header) => header.replace(/^\uFEFF/, "").trim());
      continue;
    }
    if (!line.trim()) continue;
    const values = parseCsvLine(line);
    if (values.length !== headers.length) throw new Error(`${fileName}: expected ${headers.length} columns, received ${values.length}`);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
    records.push(normalizeRow(fileName, dispenserId, mode, row));
  }
  return records;
}

async function insertBatch(client, records) {
  if (!records.length) return { inserted: 0, skipped: 0 };
  const columns = ["transaction_id", "request_code", "dispenser_id", "calator_id", "chemical_code", "chemical_name", "target_kg", "actual_kg", "mode", "status", "operator_name", "stage", "occurred_at", "created_at", "source_system", "source_file", "source_row_id", "started_at", "ended_at", "raw_payload"];
  const values = [];
  const placeholders = records.map((record, rowIndex) => {
    const rowValues = [record.transactionId, record.requestCode, record.dispenserId, record.calatorId, record.chemicalCode, record.chemicalName, record.targetKg, record.actualKg, record.mode, record.status, record.operatorName, record.stage, record.occurredAt, record.createdAt, record.sourceSystem, record.sourceFile, record.sourceRowId, record.startedAt, record.endedAt, JSON.stringify(record.rawPayload)];
    values.push(...rowValues);
    return `(${rowValues.map((_, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`).join(",")})`;
  }).join(",");
  const result = await client.query(`INSERT INTO chemical_transaction (${columns.join(",")}) VALUES ${placeholders} ON CONFLICT (transaction_id) DO NOTHING RETURNING transaction_id`, values);
  return { inserted: result.rowCount, skipped: records.length - result.rowCount };
}

const availableFiles = new Set((await readdir(sourceDirectory)).map((name) => name.toLowerCase()));
const missing = Object.keys(fileMapping).filter((fileName) => !availableFiles.has(fileName));
if (missing.length) throw new Error(`Missing CSV files: ${missing.join(", ")}`);

const summaries = [];
const allRecords = [];
for (const [fileName, [dispenserId, mode]] of Object.entries(fileMapping)) {
  const records = await readSourceFile(fileName, dispenserId, mode);
  allRecords.push(...records);
  summaries.push({ fileName, dispenserId, mode, rows: records.length, zeroWeight: records.filter((record) => record.actualKg === 0).length });
}

if (!apply) {
  console.log(JSON.stringify({ mode: "DRY_RUN", sourceDirectory, totalRows: allRecords.length, files: summaries }, null, 2));
  process.exit(0);
}

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: String(process.env.DATABASE_SSL).toLowerCase() === "true" ? { rejectUnauthorized: false } : false,
});

const client = await pool.connect();
let inserted = 0;
let skipped = 0;
try {
  await client.query("BEGIN");
  const requiredColumns = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='chemical_transaction'");
  const columnNames = new Set(requiredColumns.rows.map((row) => row.column_name));
  for (const required of ["source_system", "source_file", "source_row_id", "started_at", "ended_at", "raw_payload"]) {
    if (!columnNames.has(required)) throw new Error(`Migration 0007 is required; missing chemical_transaction.${required}`);
  }
  for (let offset = 0; offset < allRecords.length; offset += batchSize) {
    const result = await insertBatch(client, allRecords.slice(offset, offset + batchSize));
    inserted += result.inserted;
    skipped += result.skipped;
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}

console.log(JSON.stringify({ mode: "APPLY", totalRows: allRecords.length, inserted, skipped, files: summaries }, null, 2));
