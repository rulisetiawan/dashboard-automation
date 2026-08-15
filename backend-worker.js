const API_PREFIX = "/api/v1";

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

function buildSeedAssets() {
  return Object.entries(processConfig).flatMap(([process, config]) => config.areas.flatMap(([areaCode, areaName, count], areaIndex) =>
    Array.from({ length: count }, (_, index) => {
      const state = seedState(index, areaIndex);
      const active = state === "running" || state === "warning";
      const id = `${config.code}-${areaCode}-${String(index + 1).padStart(2, "0")}`;
      const detail = process === "calator"
        ? { subtype: index % 6 === 5 ? "Bianco" : "Standard", recipe: active ? ["WASH-S04", "SOFT-B12", "SOFT-B08"][index % 3] : "—" }
        : process === "dryer"
          ? { chambers: 6 + ((index + areaIndex) % 2) * 2, recipe: active ? ["DRY-COT-18", "DRY-POL-22", "DRY-COT-16"][index % 3] : "—" }
          : process === "kalender"
            ? { recipe: active ? ["FIN-COT-07", "FIN-POL-05", "FIN-COT-09"][index % 3] : "—" }
            : { recipe: active ? "CHEM-TRANSFER-07" : "—", supported_calators: process === "chemical" ? [] : undefined };
      return {
        assetId: id,
        process,
        areaCode,
        areaName,
        displayName: `${config.label === "Dispensing Calator" ? "Dispensing" : config.label} ${areaName} ${String(index + 1).padStart(2, "0")}`,
        subtype: detail.subtype || null,
        config: detail,
        state,
        batch: active ? `DB-260815-${String(areaIndex * 20 + index + 1).padStart(3, "0")}` : "—",
        progress: active ? 31 + ((index * 13 + areaIndex * 17) % 63) : 0,
        connected: 1,
      };
    }),
  ));
}

function buildChemicalTransactions(now) {
  const rows = [
    [0.3, "REQ-CL-260815-041", "CL-DPN-01", "CH-02", "Softener B", 126.0, 126.2, "Automatic", "Completed", "Auto PLC", "Weighing 2 / 2"],
    [0.8, "REQ-CL-260815-040", "CL-BLK-04", "CH-01", "Softener A", 184.0, 183.7, "Automatic", "Completed", "Auto PLC", "Weighing 1 / 1"],
    [1.2, "REQ-CL-260815-039", "CL-TMR-03", "CH-05", "Fixing Agent", 74.0, 74.0, "Manual", "Completed", "A. Raka", "Manual verified"],
    [1.8, "REQ-CL-260815-038", "CL-BLK-02", "CH-03", "Washing Agent", 112.0, 109.6, "Automatic", "Hold", "Auto PLC", "Weighing 2 / 3"],
    [2.4, "REQ-CL-260815-037", "CL-DPN-02", "CH-04", "Anti-static", 48.0, 48.1, "Manual", "Completed", "S. Deni", "Manual verified"],
    [3.1, "REQ-CL-260815-036", "CL-TMR-06", "CH-06", "Neutralizer", 62.0, null, "Automatic", "Weighing", "Auto PLC", "Weighing 1 / 2"],
    [4.3, "REQ-CL-260815-035", "CL-BLK-07", "CH-07", "Special Finish", 38.0, 38.2, "Manual", "Completed", "N. Ilham", "Manual verified"],
    [6.8, "REQ-CL-260815-034", "CL-TMR-01", "CH-02", "Softener B", 118.0, 117.6, "Automatic", "Completed", "Auto PLC", "Weighing 2 / 2"],
    [9.2, "REQ-CL-260815-033", "CL-BLK-09", "CH-01", "Softener A", 168.0, 167.9, "Automatic", "Completed", "Auto PLC", "Weighing 1 / 1"],
    [13.4, "REQ-CL-260814-106", "CL-DPN-01", "CH-03", "Washing Agent", 104.0, 100.4, "Manual", "Hold", "A. Raka", "Manual re-weigh"],
  ];
  return rows.map(([hoursAgo, requestCode, calatorId, chemicalCode, chemicalName, targetKg, actualKg, mode, status, operatorName, stage], index) => ({
    transactionId: `seed-chem-${index + 1}`,
    requestCode,
    dispenserId: dispenserForCalator(calatorId),
    calatorId,
    chemicalCode,
    chemicalName,
    targetKg,
    actualKg,
    mode,
    status,
    operatorName,
    stage,
    occurredAt: new Date(now - hoursAgo * 60 * 60 * 1000).toISOString(),
  }));
}

function dispenserForCalator(calatorId) {
  const [, area, numberValue] = calatorId.split("-");
  const number = Number(numberValue);
  if (area === "DPN") return "DSP-DPN-01";
  if (area === "BLK") return number <= 5 ? "DSP-BLK-01" : "DSP-BLK-02";
  return number <= 4 ? "DSP-TMR-01" : "DSP-TMR-02";
}

const schemaStatements = [
  "CREATE TABLE IF NOT EXISTS backend_meta (meta_key TEXT PRIMARY KEY, meta_value TEXT NOT NULL, updated_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS asset (asset_id TEXT PRIMARY KEY, process_type TEXT NOT NULL, area_code TEXT NOT NULL, area_name TEXT NOT NULL, display_name TEXT NOT NULL, subtype TEXT, config_json TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_asset_process_area ON asset(process_type, area_code)",
  "CREATE TABLE IF NOT EXISTS asset_snapshot (asset_id TEXT PRIMARY KEY, machine_state TEXT NOT NULL, batch_no TEXT, progress_percent REAL NOT NULL DEFAULT 0, connected INTEGER NOT NULL DEFAULT 0, source_ts TEXT NOT NULL, quality TEXT NOT NULL DEFAULT 'GOOD', values_json TEXT NOT NULL DEFAULT '{}', updated_at TEXT NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_snapshot_state ON asset_snapshot(machine_state, updated_at)",
  "CREATE TABLE IF NOT EXISTS tag_definition (tag_code TEXT PRIMARY KEY, asset_id TEXT NOT NULL, signal_role TEXT NOT NULL, engineering_unit TEXT, source_status TEXT NOT NULL DEFAULT 'PENDING_MAPPING', active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_tag_definition_asset ON tag_definition(asset_id, active)",
  "CREATE TABLE IF NOT EXISTS telemetry_sample (id INTEGER PRIMARY KEY AUTOINCREMENT, asset_id TEXT NOT NULL, tag_code TEXT NOT NULL, source_ts TEXT NOT NULL, value_number REAL, value_text TEXT, quality TEXT NOT NULL, gateway_id TEXT, message_id TEXT NOT NULL, ingested_at TEXT NOT NULL, UNIQUE(message_id, tag_code))",
  "CREATE INDEX IF NOT EXISTS idx_telemetry_asset_tag_ts ON telemetry_sample(asset_id, tag_code, source_ts DESC)",
  "CREATE TABLE IF NOT EXISTS chemical_transaction (transaction_id TEXT PRIMARY KEY, request_code TEXT NOT NULL, dispenser_id TEXT NOT NULL, calator_id TEXT NOT NULL, chemical_code TEXT NOT NULL, chemical_name TEXT NOT NULL, target_kg REAL NOT NULL, actual_kg REAL, mode TEXT NOT NULL, status TEXT NOT NULL, operator_name TEXT, stage TEXT, occurred_at TEXT NOT NULL, created_at TEXT NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_chemical_transaction_filter ON chemical_transaction(dispenser_id, occurred_at DESC)",
  "CREATE TABLE IF NOT EXISTS utility_snapshot (utility_code TEXT PRIMARY KEY, label TEXT NOT NULL, value REAL NOT NULL, unit TEXT NOT NULL, quality TEXT NOT NULL, source_ts TEXT NOT NULL, updated_at TEXT NOT NULL)",
];

async function executeInChunks(db, statements, chunkSize = 50) {
  for (let index = 0; index < statements.length; index += chunkSize) {
    await db.batch(statements.slice(index, index + chunkSize));
  }
}

async function ensureDatabase(env) {
  if (!env.DB) return { available: false, mode: "FALLBACK" };
  await executeInChunks(env.DB, schemaStatements.map((statement) => env.DB.prepare(statement)));
  const meta = await env.DB.prepare("SELECT meta_value FROM backend_meta WHERE meta_key = ?").bind("non_jetflow_seed_v1").first();
  if (!meta) {
    const now = new Date().toISOString();
    const assets = buildSeedAssets();
    const tags = assets.flatMap((asset) => (seedTagMap[asset.process] || []).map((tag) => ({ tagCode: `SMM.${asset.areaCode}.${asset.assetId}.${tag}`, assetId: asset.assetId, role: tag.endsWith("_PV") ? "PV" : "STATE" })));
    const chemicalRows = buildChemicalTransactions(Date.now());
    const utilityRows = [
      ["ELECTRICAL_DEMAND", "Electrical demand", 1.84, "MW"],
      ["WATER_FLOW", "Water consumption rate", 184, "m³/h"],
      ["STEAM_FLOW", "Steam production", 12.8, "t/h"],
      ["THERMAL_OIL_SUPPLY", "Thermal oil supply", 218.4, "°C"],
    ];
    const statements = [
      env.DB.prepare("INSERT INTO backend_meta (meta_key, meta_value, updated_at) VALUES (?, ?, ?)").bind("non_jetflow_seed_v1", "1", now),
      ...assets.flatMap((asset) => [
        env.DB.prepare("INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(asset.assetId, asset.process, asset.areaCode, asset.areaName, asset.displayName, asset.subtype, JSON.stringify(asset.config), now, now),
        env.DB.prepare("INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(asset.assetId, asset.state, asset.batch, asset.progress, asset.connected, now, "SIMULATED", "{}", now),
      ]),
      ...tags.map((tag) => env.DB.prepare("INSERT INTO tag_definition (tag_code, asset_id, signal_role, source_status, created_at) VALUES (?, ?, ?, ?, ?)").bind(tag.tagCode, tag.assetId, tag.role, "PENDING_MAPPING", now)),
      ...chemicalRows.map((item) => env.DB.prepare("INSERT INTO chemical_transaction (transaction_id, request_code, dispenser_id, calator_id, chemical_code, chemical_name, target_kg, actual_kg, mode, status, operator_name, stage, occurred_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(item.transactionId, item.requestCode, item.dispenserId, item.calatorId, item.chemicalCode, item.chemicalName, item.targetKg, item.actualKg, item.mode, item.status, item.operatorName, item.stage, item.occurredAt, now)),
      ...utilityRows.map(([code, label, value, unit]) => env.DB.prepare("INSERT INTO utility_snapshot (utility_code, label, value, unit, quality, source_ts, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(code, label, value, unit, "SIMULATED", now, now)),
    ];
    await executeInChunks(env.DB, statements);
  }
  return { available: true, mode: "D1" };
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}

function assetRow(row) {
  return {
    id: row.asset_id,
    name: row.display_name,
    process: row.process_type,
    area: row.area_code,
    areaLabel: row.area_name,
    subtype: row.subtype,
    ...JSON.parse(row.config_json || "{}"),
    state: row.machine_state,
    batch: row.batch_no || "—",
    progress: row.progress_percent,
    connected: Boolean(row.connected),
    sourceTs: row.source_ts,
    quality: row.quality,
  };
}

async function apiResponse(request, env) {
  const url = new URL(request.url);
  const ready = await ensureDatabase(env);
  if (!ready.available) return json({ error: "D1 binding is unavailable", data_mode: "FALLBACK" }, 503);

  if (url.pathname === `${API_PREFIX}/integration/status`) {
    const rows = await env.DB.prepare("SELECT process_type, COUNT(*) AS asset_count FROM asset WHERE active = 1 GROUP BY process_type").all();
    return json({ data_mode: "SIMULATED_SEED", storage: "D1", scope: "NON_JETFLOW", processes: rows.results, gateway_ingestion: Boolean(env.EDGE_INGEST_TOKEN), server_time: new Date().toISOString() });
  }

  if (url.pathname === `${API_PREFIX}/assets`) {
    const process = url.searchParams.get("process");
    const area = url.searchParams.get("area");
    if (!process || !processConfig[process]) return json({ error: "process must be calator, dryer, kalender, or chemical" }, 400);
    const query = area
      ? env.DB.prepare("SELECT a.*, s.machine_state, s.batch_no, s.progress_percent, s.connected, s.source_ts, s.quality FROM asset a JOIN asset_snapshot s ON s.asset_id = a.asset_id WHERE a.process_type = ? AND a.area_code = ? AND a.active = 1 ORDER BY a.asset_id").bind(process, area)
      : env.DB.prepare("SELECT a.*, s.machine_state, s.batch_no, s.progress_percent, s.connected, s.source_ts, s.quality FROM asset a JOIN asset_snapshot s ON s.asset_id = a.asset_id WHERE a.process_type = ? AND a.active = 1 ORDER BY a.asset_id").bind(process);
    const result = await query.all();
    return json({ data_mode: "SIMULATED_SEED", assets: result.results.map(assetRow) });
  }

  if (url.pathname.startsWith(`${API_PREFIX}/assets/`) && url.pathname.endsWith("/snapshot")) {
    const assetId = decodeURIComponent(url.pathname.split("/")[4] || "");
    const asset = await env.DB.prepare("SELECT a.*, s.machine_state, s.batch_no, s.progress_percent, s.connected, s.source_ts, s.quality, s.values_json FROM asset a JOIN asset_snapshot s ON s.asset_id = a.asset_id WHERE a.asset_id = ?").bind(assetId).first();
    if (!asset) return json({ error: "asset not found" }, 404);
    const tags = await env.DB.prepare("SELECT tag_code, signal_role, engineering_unit, source_status FROM tag_definition WHERE asset_id = ? AND active = 1 ORDER BY tag_code").bind(assetId).all();
    return json({ data_mode: "SIMULATED_SEED", asset: { ...assetRow(asset), values: JSON.parse(asset.values_json || "{}") }, tags: tags.results });
  }

  if (url.pathname === `${API_PREFIX}/dispensing/transactions`) {
    const assetId = url.searchParams.get("asset_id");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const clauses = [];
    const bindings = [];
    if (assetId) { clauses.push("dispenser_id = ?"); bindings.push(assetId); }
    if (from) { clauses.push("occurred_at >= ?"); bindings.push(from); }
    if (to) { clauses.push("occurred_at <= ?"); bindings.push(to); }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await env.DB.prepare(`SELECT * FROM chemical_transaction ${where} ORDER BY occurred_at DESC LIMIT 250`).bind(...bindings).all();
    return json({ data_mode: "SIMULATED_SEED", transactions: result.results });
  }

  if (url.pathname === `${API_PREFIX}/utilities/snapshot`) {
    const result = await env.DB.prepare("SELECT * FROM utility_snapshot ORDER BY utility_code").all();
    return json({ data_mode: "SIMULATED_SEED", utilities: result.results });
  }

  if (url.pathname === `${API_PREFIX}/edge/telemetry` && request.method === "POST") {
    if (!env.EDGE_INGEST_TOKEN) return json({ error: "Edge ingestion is inactive until EDGE_INGEST_TOKEN is configured." }, 503);
    const auth = request.headers.get("authorization") || "";
    if (auth !== `Bearer ${env.EDGE_INGEST_TOKEN}`) return json({ error: "unauthorized" }, 401);
    const payload = await request.json();
    if (!payload.asset_id || !payload.message_id || !Array.isArray(payload.samples) || !payload.samples.length) return json({ error: "asset_id, message_id, and samples are required" }, 400);
    const now = new Date().toISOString();
    const statements = payload.samples.map((sample) => env.DB.prepare("INSERT OR IGNORE INTO telemetry_sample (asset_id, tag_code, source_ts, value_number, value_text, quality, gateway_id, message_id, ingested_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(payload.asset_id, sample.tag_code, sample.source_ts || now, typeof sample.value === "number" ? sample.value : null, typeof sample.value === "string" ? sample.value : null, sample.quality || "GOOD", payload.gateway_id || null, payload.message_id, now));
    await executeInChunks(env.DB, statements);
    return json({ accepted: payload.samples.length, message_id: payload.message_id }, 202);
  }

  return json({ error: "not found" }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith(API_PREFIX)) return apiResponse(request, env);
    const file = files[url.pathname] || files["/"];
    return new Response(file.body, {
      headers: {
        "content-type": file.type,
        "cache-control": url.pathname === "/" || url.pathname === "/index.html" ? "no-cache" : "public, max-age=3600",
        "x-content-type-options": "nosniff",
      },
    });
  },
};
