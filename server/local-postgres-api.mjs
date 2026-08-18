// Deprecated local prototype. Jalankan `npm run dev:postgres` untuk API NestJS + PostgreSQL.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT || 8787);
const migrationFile = resolve(root, "postgres", "migrations", "0001_non_jetflow_local.sql");
const databaseUrl = process.env.DATABASE_URL;
const databaseSsl = process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined;
const requiredDatabaseFields = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];

if (!databaseUrl && requiredDatabaseFields.some((field) => !process.env[field])) {
  throw new Error("Isi DATABASE_URL atau seluruh DB_HOST, DB_PORT, DB_NAME, DB_USER, dan DB_PASSWORD pada .env.");
}

const { Pool } = pg;
const db = new Pool({
  ...(databaseUrl
    ? { connectionString: databaseUrl }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }),
  ssl: databaseSsl,
});

const processConfig = {
  calator: { code: "CL", label: "Calator", areas: [["DPN", "Depan", 2], ["BLK", "Belakang", 9], ["TMR", "Timur", 7]] },
  dryer: { code: "DR", label: "Dryer", areas: [["DPN", "Depan", 1], ["BLK", "Belakang", 2], ["TMR", "Timur", 3]] },
  kalender: { code: "KL", label: "Kalender", areas: [["DPN", "Depan", 7], ["BLK", "Belakang", 7], ["TMR", "Timur", 7]] },
  chemical: { code: "DSP", label: "Dispensing Calator", areas: [["DPN", "Depan", 1], ["BLK", "Belakang", 2], ["TMR", "Timur", 2]] },
};

const seedTagMap = {
  calator: ["FEEDING.SPEED_PV", "SQUEEZING_01.SPEED_PV", "SQUEEZING_02.SPEED_PV", "OVERFEED_OUT.SPEED_PV", "DANCER.POSITION_PV", "PRODUCTION.OUTPUT_TOTAL_M"],
  dryer: ["LINE.SPEED_PV", "CHAMBER_01.TEMP_PV", "CHAMBER_02.TEMP_PV", "THERMAL_OIL.SUPPLY_TEMP_PV", "PRODUCTION.OUTPUT_TOTAL_M"],
  kalender: ["UPPER_FELT.LOADCELL_PV", "LOWER_FELT.LOADCELL_PV", "UPPER_FELT.TEMP_PV", "LOWER_FELT.TEMP_PV", "DANCER.POSITION_PV", "FABRIC.WIDTH_PV"],
  chemical: ["TANK_01.LOADCELL_TOTAL_KG", "TANK_02.LEVEL_PV", "INLET_VALVE_01.OPEN_FB", "TRANSFER_VALVE.OPEN_FB"],
};

function seedState(index, areaIndex) {
  const marker = index + areaIndex * 5;
  if (marker % 19 === 0 && marker > 0) return "fault";
  if (marker % 11 === 0 && marker > 0) return "warning";
  if (marker % 7 === 0) return "idle";
  return "running";
}

function seedAssets() {
  return Object.entries(processConfig).flatMap(([process, config]) => config.areas.flatMap(([areaCode, areaName, count], areaIndex) =>
    Array.from({ length: count }, (_, index) => {
      const state = seedState(index, areaIndex);
      const active = state === "running" || state === "warning";
      const assetId = `${config.code}-${areaCode}-${String(index + 1).padStart(2, "0")}`;
      const configJson = process === "calator"
        ? { subtype: index % 6 === 5 ? "Bianco" : "Standard", recipe: active ? ["WASH-S04", "SOFT-B12", "SOFT-B08"][index % 3] : "—" }
        : process === "dryer"
          ? { chambers: 6 + ((index + areaIndex) % 2) * 2, recipe: active ? ["DRY-COT-18", "DRY-POL-22", "DRY-COT-16"][index % 3] : "—" }
          : process === "kalender"
            ? { recipe: active ? ["FIN-COT-07", "FIN-POL-05", "FIN-COT-09"][index % 3] : "—" }
            : { recipe: active ? "CHEM-TRANSFER-07" : "—" };
      return { assetId, process, areaCode, areaName, displayName: `${config.label === "Dispensing Calator" ? "Dispensing" : config.label} ${areaName} ${String(index + 1).padStart(2, "0")}`, subtype: configJson.subtype || null, configJson, state, batch: active ? `DB-260818-${String(areaIndex * 20 + index + 1).padStart(3, "0")}` : "—", progress: active ? 31 + ((index * 13 + areaIndex * 17) % 63) : 0 };
    }),
  ));
}

function dispenserForCalator(calatorId) {
  const [, area, numberValue] = calatorId.split("-");
  const number = Number(numberValue);
  if (area === "DPN") return "DSP-DPN-01";
  if (area === "BLK") return number <= 5 ? "DSP-BLK-01" : "DSP-BLK-02";
  return number <= 4 ? "DSP-TMR-01" : "DSP-TMR-02";
}

function seedChemicalTransactions(now) {
  const rows = [
    [0.3, "REQ-CL-260818-041", "CL-DPN-01", "CH-02", "Softener B", 126, 126.2, "Automatic", "Completed", "Auto PLC", "Weighing 2 / 2"],
    [0.8, "REQ-CL-260818-040", "CL-BLK-04", "CH-01", "Softener A", 184, 183.7, "Automatic", "Completed", "Auto PLC", "Weighing 1 / 1"],
    [1.2, "REQ-CL-260818-039", "CL-TMR-03", "CH-05", "Fixing Agent", 74, 74, "Manual", "Completed", "A. Raka", "Manual verified"],
    [1.8, "REQ-CL-260818-038", "CL-BLK-02", "CH-03", "Washing Agent", 112, 109.6, "Automatic", "Hold", "Auto PLC", "Weighing 2 / 3"],
    [2.4, "REQ-CL-260818-037", "CL-DPN-02", "CH-04", "Anti-static", 48, 48.1, "Manual", "Completed", "S. Deni", "Manual verified"],
    [3.1, "REQ-CL-260818-036", "CL-TMR-06", "CH-06", "Neutralizer", 62, null, "Automatic", "Weighing", "Auto PLC", "Weighing 1 / 2"],
  ];
  return rows.map(([hoursAgo, requestCode, calatorId, chemicalCode, chemicalName, targetKg, actualKg, mode, status, operatorName, stage], index) => ({
    transactionId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    requestCode, dispenserId: dispenserForCalator(calatorId), calatorId, chemicalCode, chemicalName, targetKg, actualKg, mode, status, operatorName, stage,
    occurredAt: new Date(now - hoursAgo * 60 * 60 * 1000).toISOString(),
  }));
}

try {
  await db.query("SELECT 1 AS connected");
  await db.query(await readFile(migrationFile, "utf8"));
} catch (error) {
  const detail = error instanceof Error ? error.message : "unknown database error";
  throw new Error(`Koneksi PostgreSQL native gagal: ${detail}`);
}

async function seedDatabase() {
  const result = await db.query("SELECT COUNT(*)::int AS count FROM asset");
  if (result.rows[0].count > 0) return;
  const now = new Date().toISOString();
  for (const asset of seedAssets()) {
    await db.query("INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$8)", [asset.assetId, asset.process, asset.areaCode, asset.areaName, asset.displayName, asset.subtype, JSON.stringify(asset.configJson), now]);
    await db.query("INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, updated_at) VALUES ($1,$2,$3,$4,TRUE,$5,'SIMULATED',$5)", [asset.assetId, asset.state, asset.batch, asset.progress, now]);
    for (const signal of seedTagMap[asset.process]) {
      await db.query("INSERT INTO tag_definition (tag_code, asset_id, signal_role, source_status, created_at) VALUES ($1,$2,$3,'PENDING_MAPPING',$4)", [`SMM.${asset.areaCode}.${asset.assetId}.${signal}`, asset.assetId, signal.endsWith("_PV") ? "PV" : "STATE", now]);
    }
  }
  for (const item of seedChemicalTransactions(Date.now())) {
    await db.query("INSERT INTO chemical_transaction (transaction_id, request_code, dispenser_id, calator_id, chemical_code, chemical_name, target_kg, actual_kg, mode, status, operator_name, stage, occurred_at, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", [item.transactionId, item.requestCode, item.dispenserId, item.calatorId, item.chemicalCode, item.chemicalName, item.targetKg, item.actualKg, item.mode, item.status, item.operatorName, item.stage, item.occurredAt, now]);
  }
  for (const [code, label, value, unit] of [["ELECTRICAL_DEMAND", "Electrical demand", 1.84, "MW"], ["WATER_FLOW", "Water consumption rate", 184, "m³/h"], ["STEAM_FLOW", "Steam production", 12.8, "t/h"], ["THERMAL_OIL_SUPPLY", "Thermal oil supply", 218.4, "°C"]]) {
    await db.query("INSERT INTO utility_snapshot (utility_code, label, value, unit, quality, source_ts, updated_at) VALUES ($1,$2,$3,$4,'SIMULATED',$5,$5)", [code, label, value, unit, now]);
  }
  await db.query("INSERT INTO backend_meta (meta_key, meta_value, updated_at) VALUES ('non_jetflow_seed_v1','1',$1)", [now]);
}

await seedDatabase();

const json = (res, status, payload) => {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
  res.end(JSON.stringify(payload));
};

const assetProjection = "SELECT a.*, s.machine_state, s.batch_no, s.progress_percent, s.connected, s.source_ts, s.quality FROM asset a JOIN asset_snapshot s ON s.asset_id = a.asset_id";
const assetRow = (row) => ({ id: row.asset_id, name: row.display_name, process: row.process_type, area: row.area_code, areaLabel: row.area_name, subtype: row.subtype, ...row.config_json, state: row.machine_state, batch: row.batch_no || "—", progress: Number(row.progress_percent), connected: row.connected, sourceTs: row.source_ts, quality: row.quality });

async function handleApi(req, res, url) {
  if (url.pathname === "/api/v1/integration/status") {
    const result = await db.query("SELECT process_type, COUNT(*)::int AS asset_count FROM asset WHERE active = TRUE GROUP BY process_type ORDER BY process_type");
    return json(res, 200, { data_mode: "SIMULATED_SEED", storage: "POSTGRESQL_NATIVE_LOCAL", scope: "NON_JETFLOW", processes: result.rows, gateway_ingestion: false, server_time: new Date().toISOString() });
  }
  if (url.pathname === "/api/v1/assets") {
    const process = url.searchParams.get("process");
    const area = url.searchParams.get("area");
    if (!processConfig[process]) return json(res, 400, { error: "process must be calator, dryer, kalender, or chemical" });
    const result = area
      ? await db.query(`${assetProjection} WHERE a.process_type = $1 AND a.area_code = $2 AND a.active = TRUE ORDER BY a.asset_id`, [process, area])
      : await db.query(`${assetProjection} WHERE a.process_type = $1 AND a.active = TRUE ORDER BY a.asset_id`, [process]);
    return json(res, 200, { data_mode: "SIMULATED_SEED", assets: result.rows.map(assetRow) });
  }
  if (url.pathname.startsWith("/api/v1/assets/") && url.pathname.endsWith("/snapshot")) {
    const assetId = decodeURIComponent(url.pathname.split("/")[4] || "");
    const asset = await db.query(`${assetProjection} WHERE a.asset_id = $1`, [assetId]);
    if (!asset.rows[0]) return json(res, 404, { error: "asset not found" });
    const tags = await db.query("SELECT tag_code, signal_role, engineering_unit, source_status FROM tag_definition WHERE asset_id = $1 AND active = TRUE ORDER BY tag_code", [assetId]);
    return json(res, 200, { data_mode: "SIMULATED_SEED", asset: assetRow(asset.rows[0]), tags: tags.rows });
  }
  if (url.pathname === "/api/v1/dispensing/transactions") {
    const assetId = url.searchParams.get("asset_id");
    const result = assetId
      ? await db.query("SELECT * FROM chemical_transaction WHERE dispenser_id = $1 ORDER BY occurred_at DESC LIMIT 250", [assetId])
      : await db.query("SELECT * FROM chemical_transaction ORDER BY occurred_at DESC LIMIT 250");
    return json(res, 200, { data_mode: "SIMULATED_SEED", transactions: result.rows });
  }
  if (url.pathname === "/api/v1/utilities/snapshot") {
    const result = await db.query("SELECT * FROM utility_snapshot ORDER BY utility_code");
    return json(res, 200, { data_mode: "SIMULATED_SEED", utilities: result.rows });
  }
  return json(res, 404, { error: "not found" });
}

const contentTypes = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/v1/")) return await handleApi(req, res, url);
    const requested = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\//, "");
    const filePath = resolve(root, requested);
    if (!filePath.startsWith(root)) return json(res, 403, { error: "forbidden" });
    const contents = await readFile(filePath);
    res.writeHead(200, { "content-type": contentTypes[extname(filePath)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(contents);
  } catch (error) {
    json(res, 500, { error: "local server error", detail: error instanceof Error ? error.message : "unknown" });
  }
});

server.listen(port, () => console.log(`PT.SMM local PostgreSQL dashboard running at http://localhost:${port}`));
