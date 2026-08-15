const state = {
  page: "overview",
  selected: {
    jetflow: "JF-LA-01",
    calator: "CL-DPN-01",
    dryer: "DR-DPN-01",
    kalender: "KL-DPN-01",
    chemical: "DSP-DPN-01",
  },
  drill: {
    jetflow: { area: null, machine: null },
    calator: { area: null, machine: null },
    dryer: { area: null, machine: null },
    kalender: { area: null, machine: null },
    chemical: { area: null, machine: null },
  },
  range: "8H",
  history: {
    preset: "8H",
    start: Date.now() - 8 * 60 * 60 * 1000,
    end: Date.now(),
    viewStart: 0.72,
    viewFraction: 0.28,
  },
  management: {
    metric: {
      jetflow: "water",
      calator: "water",
      dryer: "energy",
      kalender: "steam",
      chemical: "chemical",
    },
    area: {
      jetflow: null,
      calator: null,
      dryer: null,
      kalender: null,
      chemical: null,
    },
  },
  utility: {
    electricalLevel: "cubical",
    selectedElectrical: "CUB-A",
  },
  sensorTrend: {
    range: "1H",
    enabled: {
      jetflow: ["main_temp", "water_level", "flow_meter"],
      calator: ["overfeed_out", "dancing_roller", "feeding_speed"],
      dryer: ["line_speed", "chamber_1", "chamber_5"],
      kalender: ["temp_upper", "temp_lower", "overfeed"],
      chemical: ["transfer_flow", "target_weight", "line_pressure"],
    },
  },
  batchInvestigation: {
    jetflow: { machineId: null, batch: null },
    calator: { machineId: null, batch: null },
    dryer: { machineId: null, batch: null },
    kalender: { machineId: null, batch: null },
    chemical: { machineId: null, batch: null },
  },
};

const pageMeta = {
  overview: ["Plant Overview", "Live Operations", "Seluruh proses, mesin, utilitas, dan exception dalam satu tampilan."],
  jetflow: ["Jetflow", "Dyeing Process", "Monitoring batch, tank, dosing, winch, pump, steam, dan alarm."],
  calator: ["Calator", "Washing Process", "Multi-speed, Overfeed Out, dancing roller, chemical, dan output."],
  dryer: ["Dryer", "Drying Process", "Speed, multi-chamber temperature, thermal oil, dan output."],
  kalender: ["Kalender", "Finishing Process", "Upper-lower balance, overfeed, width, motor, dan quality context."],
  utilities: ["Plant Utilities", "Resource Monitoring", "Electrical, water, steam, dan thermal oil supply-to-consumer."],
  chemical: ["Chemical Processing", "Dispensing & Transfer", "Tujuh varian chemical, transfer queue, route, dan daily usage."],
  alarms: ["Alarms & Events", "Exception Center", "Alarm aktif, acknowledgement, equipment event, dan impact context."],
  trends: ["Historical Trends", "Investigation Workspace", "Bandingkan actual, setpoint, machine state, dan alarm dalam satu timeline."],
  health: ["Data Health", "Collector & Tag Quality", "Koneksi PLC, gateway, meter, stale tag, dan historian health."],
};

const processAreas = {
  jetflow: [
    { code: "LA", label: "Lane A", count: 6 }, { code: "LB", label: "Lane B", count: 18 },
    { code: "LC", label: "Lane C", count: 18 }, { code: "LD", label: "Lane D", count: 18 },
    { code: "LE", label: "Lane E", count: 13 }, { code: "LF", label: "Lane F", count: 15 },
  ],
  calator: [{ code: "DPN", label: "Depan", count: 2 }, { code: "BLK", label: "Belakang", count: 9 }, { code: "TMR", label: "Timur", count: 7 }],
  dryer: [{ code: "DPN", label: "Depan", count: 1 }, { code: "BLK", label: "Belakang", count: 2 }, { code: "TMR", label: "Timur", count: 3 }],
  kalender: [{ code: "DPN", label: "Depan", count: 7 }, { code: "BLK", label: "Belakang", count: 7 }, { code: "TMR", label: "Timur", count: 7 }],
  chemical: [{ code: "DPN", label: "Depan", count: 1 }, { code: "BLK", label: "Belakang", count: 2 }, { code: "TMR", label: "Timur", count: 2 }],
};

const processConfig = {
  jetflow: { code: "JF", singular: "Jetflow", plural: "Jetflow", process: "Pencelupan", areas: "6 lanes" },
  calator: { code: "CL", singular: "Calator", plural: "Calator", process: "Pencucian", areas: "3 areas" },
  dryer: { code: "DR", singular: "Dryer", plural: "Dryer", process: "Pengeringan", areas: "3 areas" },
  kalender: { code: "KL", singular: "Kalender", plural: "Kalender", process: "Finishing", areas: "3 areas" },
  chemical: { code: "DSP", singular: "Dispensing", plural: "Dispensing Calator", process: "Chemical transfer", areas: "3 areas" },
};

function simulatedMachineState(index, areaIndex) {
  const marker = index + areaIndex * 5;
  if (marker % 19 === 0 && marker > 0) return "fault";
  if (marker % 11 === 0 && marker > 0) return "warning";
  if (marker % 7 === 0) return "idle";
  return "running";
}

function createFleet(type) {
  const config = processConfig[type];
  return processAreas[type].flatMap((area, areaIndex) => Array.from({ length: area.count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    const machineState = simulatedMachineState(index, areaIndex);
    const active = machineState === "running" || machineState === "warning";
    const base = {
      id: `${config.code}-${area.code}-${number}`,
      name: `${config.singular} ${area.label} ${number}`,
      area: area.code,
      areaLabel: area.label,
      state: machineState,
      batch: active ? `DB-260814-${String(areaIndex * 20 + index + 1).padStart(3, "0")}` : "—",
      progress: active ? 31 + ((index * 13 + areaIndex * 17) % 63) : 0,
      connected: machineState !== "offline",
    };
    if (type === "jetflow") return { ...base, winches: 2 + ((index + areaIndex) % 7), recipe: active ? ["NAVY-R12", "BLACK-R08", "OLIVE-R03"][index % 3] : "—", step: active ? ["Filling", "Dosing", "Heating", "Holding"][index % 4] : "Ready" };
    if (type === "calator") return { ...base, subtype: index % 6 === 5 ? "Bianco" : "Standard", recipe: active ? ["WASH-S04", "SOFT-B12", "SOFT-B08"][index % 3] : "—" };
    if (type === "dryer") return { ...base, chambers: 6 + ((index + areaIndex) % 2) * 2, setup: active ? ["DRY-COT-18", "DRY-POL-22", "DRY-COT-16"][index % 3] : "—" };
    if (type === "kalender") return { ...base, setup: active ? ["FIN-COT-07", "FIN-POL-05", "FIN-COT-09"][index % 3] : "—" };
    return { ...base, recipe: active ? "CHEM-TRANSFER-07" : "—", step: active ? "Ready / Transfer" : "Standby" };
  }));
}

const jetflows = createFleet("jetflow");
const calators = createFleet("calator");
const dryers = createFleet("dryer");
const kalenders = createFleet("kalender");
const dispensers = createFleet("chemical");

const alarms = [
  { id: 1, severity: "critical", title: "Tangle limit aktif", detail: "Limit tangle Winch 3 terdeteksi selama 18 detik.", source: "JF-03 · Winch 3", time: "10:38:42", ack: false },
  { id: 2, severity: "critical", title: "Chamber 05 under-temperature", detail: "Temperatur aktual 134.2°C, target 148.0°C.", source: "DR-03 · Chamber 05", time: "10:36:18", ack: false },
  { id: 3, severity: "warning", title: "Overfeed Out imbalance", detail: "Spread channel atas-bawah melewati tolerance 4.2%.", source: "CL-B02 · Overfeed Out", time: "10:31:09", ack: false },
  { id: 4, severity: "warning", title: "Steam header pressure low", detail: "Tekanan header berada di bawah baseline heating.", source: "Utility · Steam Header A", time: "10:24:51", ack: false },
  { id: 5, severity: "warning", title: "Fabric width approaching limit", detail: "Lebar aktual 179.1 cm, target 181.0 cm.", source: "KL-03 · Width Sensor", time: "10:17:33", ack: true },
];

const connectors = [
  ["GW-DYE-01", "Jetflow PLC Group A", "OPC UA", "Online", "16 ms", "8,420", "99.98%"],
  ["GW-WASH-01", "Calator & Dispensing", "Modbus TCP", "Online", "22 ms", "4,816", "99.94%"],
  ["GW-FIN-01", "Dryer & Kalender", "OPC UA", "Online", "19 ms", "7,240", "99.97%"],
  ["GW-UTL-01", "Utility Meters", "Modbus TCP", "Degraded", "184 ms", "2,168", "98.71%"],
  ["GW-BLR-01", "Steam / Thermal Oil", "OPC UA", "Online", "27 ms", "1,036", "99.91%"],
];

const chemicals = [
  ["CH-01", "Softener A", 1840, 2000, "#078eaa"],
  ["CH-02", "Softener B", 1260, 1500, "#4d8fd0"],
  ["CH-03", "Washing Agent", 980, 1200, "#119b70"],
  ["CH-04", "Anti-static", 460, 800, "#8267c7"],
  ["CH-05", "Fixing Agent", 740, 900, "#d68b05"],
  ["CH-06", "Neutralizer", 510, 700, "#db6d48"],
  ["CH-07", "Special Finish", 325, 600, "#c55f92"],
];

function statusPill(value) {
  const labels = { running: "Running", warning: "Warning", fault: "Fault", idle: "Idle", offline: "Offline" };
  return `<span class="status-pill ${value}">${labels[value] || value}</span>`;
}

function liveValue(value, unit = "", variance = 0.2, decimals = 1) {
  return `<span class="live-number" data-live data-value="${value}" data-variance="${variance}" data-decimals="${decimals}">${Number(value).toFixed(decimals)}</span><small>${unit}</small>`;
}

function pageHead(page, actions = "") {
  const meta = pageMeta[page];
  return `
    <section class="page-head">
      <div>
        <div class="eyebrow">${meta[1]}</div>
        <h1>${meta[0]}</h1>
        <p>${meta[2]}</p>
      </div>
      <div class="head-actions">${actions}</div>
    </section>
  `;
}

function panel(title, subtitle, content, actions = "", classes = "") {
  return `
    <article class="card panel ${classes}">
      <div class="panel-head">
        <div><h2 class="panel-title">${title}</h2><p class="panel-subtitle">${subtitle}</p></div>
        ${actions ? `<div class="panel-actions">${actions}</div>` : ""}
      </div>
      ${content}
    </article>
  `;
}

function kpi(label, value, unit, icon, foot, tone = "") {
  return `
    <article class="card kpi-card">
      <div class="kpi-top"><span class="kpi-label">${label}</span><span class="kpi-icon ${tone}">${icon}</span></div>
      <div class="kpi-value">${value}<small>${unit}</small></div>
      <div class="kpi-foot">${foot}</div>
    </article>
  `;
}

function machineHero(machine, code, meta) {
  return `
    <section class="card machine-hero">
      <div class="machine-identity">
        <div class="machine-avatar">${code}</div>
        <div>
          <h2>${machine.name} ${statusPill(machine.state)}</h2>
          <p>${meta}</p>
        </div>
      </div>
      <div class="machine-hero-meta">
        <div class="hero-meta-item"><span>Batch</span><strong>${machine.batch}</strong></div>
        <div class="hero-meta-item"><span>Progress</span><strong>${machine.progress}%</strong></div>
        <div class="hero-meta-item"><span>Last update</span><strong>NOW · 18ms</strong></div>
      </div>
    </section>
  `;
}

function remoteDisplayPanel(machine) {
  return `<section class="card remote-display-card">
    <div class="remote-display-head"><div><h2>Remote Display</h2><p>${machine.id} · reserved viewport untuk remote HMI/display melalui IP</p></div><span class="data-pill neutral">IP not configured</span></div>
    <div class="remote-display-viewport" role="img" aria-label="Placeholder remote display untuk ${machine.name}"></div>
  </section>`;
}

const sensorTrendConfig = {
  jetflow: [
    { key: "main_temp", label: "Main Tank Temperature", tag: "TEMP_MAIN", unit: "°C", sv: 93, variance: 2.4, decimals: 1, color: "#078eaa" },
    { key: "water_level", label: "Water Level", tag: "LEVEL_WATER", unit: "%", sv: 72, variance: 3.8, decimals: 1, color: "#4d8fd0" },
    { key: "flow_meter", label: "Main Flow Meter", tag: "FLOW_MAIN", unit: "m³/h", sv: 125, variance: 7.2, decimals: 1, color: "#119b70" },
    { key: "dosing_temp_1", label: "Dosing Tank 1 Temperature", tag: "TEMP_DOSING_01", unit: "°C", sv: 58, variance: 3.1, decimals: 1, color: "#8267c7" },
    { key: "dosing_temp_2", label: "Dosing Tank 2 Temperature", tag: "TEMP_DOSING_02", unit: "°C", sv: 43, variance: 2.7, decimals: 1, color: "#d68b05" },
    { key: "dosing_level", label: "Dosing Tank Level", tag: "LEVEL_DOSING", unit: "%", sv: 65, variance: 4.2, decimals: 1, color: "#db6d48" },
  ],
  calator: [
    { key: "overfeed_out", label: "Overfeed Out Speed", tag: "SPD_OF_OUT", unit: "m/min", sv: 29.2, variance: 0.9, decimals: 1, color: "#078eaa" },
    { key: "dancing_roller", label: "Dancing Roller", tag: "POS_DANCER", unit: "%", sv: 50, variance: 4.2, decimals: 1, color: "#4d8fd0" },
    { key: "feeding_speed", label: "Feeding Speed", tag: "SPD_FEED", unit: "m/min", sv: 28.4, variance: 0.8, decimals: 1, color: "#119b70" },
    { key: "squeezing_1", label: "Squeezing 1 Speed", tag: "SPD_SQ_01", unit: "m/min", sv: 28.1, variance: 0.75, decimals: 1, color: "#8267c7" },
    { key: "squeezing_2", label: "Squeezing 2 Speed", tag: "SPD_SQ_02", unit: "m/min", sv: 27.9, variance: 0.75, decimals: 1, color: "#d68b05" },
    { key: "folder_speed", label: "Folder Speed", tag: "SPD_FOLDER", unit: "m/min", sv: 27.6, variance: 0.8, decimals: 1, color: "#db6d48" },
    { key: "plaiter_speed", label: "Plaiter Speed", tag: "SPD_PLAITER", unit: "m/min", sv: 27.4, variance: 0.85, decimals: 1, color: "#217d94" },
  ],
  dryer: [
    { key: "line_speed", label: "Line Speed", tag: "SPD_LINE", unit: "m/min", sv: 29, variance: 1.1, decimals: 1, color: "#078eaa" },
    { key: "chamber_1", label: "Chamber 1 Temperature", tag: "TEMP_CH_01", unit: "°C", sv: 148, variance: 4.5, decimals: 1, color: "#4d8fd0" },
    { key: "chamber_3", label: "Chamber 3 Temperature", tag: "TEMP_CH_03", unit: "°C", sv: 150, variance: 4.8, decimals: 1, color: "#119b70" },
    { key: "chamber_5", label: "Chamber 5 Temperature", tag: "TEMP_CH_05", unit: "°C", sv: 148, variance: 6.2, decimals: 1, color: "#d68b05" },
    { key: "chamber_7", label: "Chamber 7 Temperature", tag: "TEMP_CH_07", unit: "°C", sv: 145, variance: 4.4, decimals: 1, color: "#8267c7" },
    { key: "oil_supply", label: "Thermal Oil Supply", tag: "TEMP_OIL_SUP", unit: "°C", sv: 218, variance: 3.6, decimals: 1, color: "#db6d48" },
  ],
  kalender: [
    { key: "temp_upper", label: "Upper Roll Temperature", tag: "TEMP_UPPER", unit: "°C", sv: 127, variance: 3.2, decimals: 1, color: "#078eaa" },
    { key: "temp_lower", label: "Lower Roll Temperature", tag: "TEMP_LOWER", unit: "°C", sv: 127, variance: 3.0, decimals: 1, color: "#4d8fd0" },
    { key: "overfeed", label: "Overfeed", tag: "OVERFEED", unit: "%", sv: 8.5, variance: 0.65, decimals: 1, color: "#119b70" },
    { key: "load_upper", label: "Loadcell Upper", tag: "LOAD_UPPER", unit: "kN", sv: 4.8, variance: 0.24, decimals: 2, color: "#8267c7" },
    { key: "load_lower", label: "Loadcell Lower", tag: "LOAD_LOWER", unit: "kN", sv: 4.8, variance: 0.24, decimals: 2, color: "#d68b05" },
    { key: "fabric_width", label: "Fabric Width", tag: "WIDTH_FABRIC", unit: "cm", sv: 181, variance: 1.2, decimals: 1, color: "#db6d48" },
  ],
  chemical: [
    { key: "transfer_flow", label: "Transfer Flow", tag: "FLOW_TRANSFER", unit: "kg/min", sv: 42.8, variance: 3.2, decimals: 1, color: "#078eaa" },
    { key: "target_weight", label: "Batch Weight", tag: "WEIGHT_BATCH", unit: "kg", sv: 128, variance: 4.8, decimals: 1, color: "#4d8fd0" },
    { key: "line_pressure", label: "Line Pressure", tag: "PRESS_LINE", unit: "bar", sv: 3.2, variance: 0.28, decimals: 2, color: "#119b70" },
    { key: "tank_level", label: "Source Tank Level", tag: "LEVEL_SOURCE", unit: "%", sv: 70, variance: 5.4, decimals: 1, color: "#8267c7" },
    { key: "pump_speed", label: "Transfer Pump Speed", tag: "SPD_PUMP", unit: "Hz", sv: 32, variance: 2.4, decimals: 1, color: "#d68b05" },
  ],
};

function selectedBatchFor(type, machine) {
  const selection = state.batchInvestigation[type];
  return selection?.machineId === machine.id ? selection.batch : null;
}

function batchSeed(batch) {
  return [...batch].reduce((total, character, index) => total + character.charCodeAt(0) * (index + 1), 0);
}

function recentBatchHistory(machine) {
  const baseEnd = new Date("2026-08-15T06:40:00+07:00").getTime();
  return Array.from({ length: 18 }, (_, index) => {
    const batch = index === 0 && machine.batch && machine.batch !== "—"
      ? machine.batch
      : historicalBatchFor(machine, index + 1);
    const end = baseEnd - index * 97 * 60 * 1000;
    const start = end - (118 + (batchSeed(batch) % 145)) * 60 * 1000;
    const status = index === 0 && machine.batch === batch ? "Running" : index % 7 === 0 ? "Hold" : "Completed";
    const formatTime = (timestamp) => new Date(timestamp).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false,
    });
    return { batch, start: formatTime(start), end: status === "Running" ? "Now" : formatTime(end), status };
  });
}

function batchInvestigationPanel(type, machine) {
  const selectedBatch = selectedBatchFor(type, machine);
  const recentBatches = recentBatchHistory(machine);
  return `<section class="card batch-investigation-card">
    <div class="batch-investigation-copy"><span class="eyebrow">Batch historian lookup</span><h2>Search Production Batch</h2><p>Masukkan nomor batch untuk memuat trend sensor SV/PV dan abnormality log khusus batch tersebut.</p></div>
    <form class="batch-search-form" data-batch-form="${type}|${machine.id}">
      <label for="batch-search-${type}">Batch number</label>
      <div class="batch-search-row"><input class="search-control batch-search-input" id="batch-search-${type}" data-batch-input="${type}" value="${selectedBatch || ""}" placeholder="Contoh: DB-260814-032" autocomplete="off" maxlength="32"/><button class="button primary" type="submit">Search batch</button>${selectedBatch ? `<button class="button ghost" type="button" data-batch-clear="${type}|${machine.id}">Clear</button>` : ""}</div>
      <div class="batch-recent-head"><span>Recent batches</span><small>${recentBatches.length} records · scroll untuk melihat lainnya</small></div>
      <div class="batch-recent-table-wrap" tabindex="0" aria-label="Recent batch history ${machine.id}">
        <table class="batch-recent-table"><thead><tr><th>Batch No.</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr></thead><tbody>${recentBatches.map((item) => {
          const tone = item.status === "Completed" ? "good" : item.status === "Hold" ? "warning" : "neutral";
          const isSelected = selectedBatch === item.batch;
          return `<tr class="${isSelected ? "selected" : ""}"><td class="mono"><strong>${item.batch}</strong></td><td class="mono">${item.start}</td><td class="mono">${item.end}</td><td><span class="data-pill ${tone}">${item.status}</span></td><td><button class="batch-load-button ${isSelected ? "loaded" : ""}" type="button" data-batch-suggestion="${type}|${machine.id}|${item.batch}" ${isSelected ? "disabled" : ""}>${isSelected ? "Loaded" : "Load"}</button></td></tr>`;
        }).join("")}</tbody></table>
      </div>
    </form>
    ${selectedBatch ? `<div class="batch-active-context"><span class="kpi-scope historical">BATCH LOADED</span><strong>${selectedBatch}</strong><small>${machine.id} · trend dan log menggunakan scope batch yang sama</small></div>` : ""}
  </section>`;
}

function batchTrendWorkspace(type, machine) {
  const selectedBatch = selectedBatchFor(type, machine);
  if (selectedBatch) return sensorTrendPanel(type, machine);
  return `<section class="card batch-analysis-empty"><div class="batch-empty-icon">⌕</div><strong>Trend dan log belum dimuat</strong><span>Cari nomor batch di atas untuk menampilkan perbandingan SV/PV dan seluruh abnormal event pada batch tersebut.</span></section>`;
}

function batchAbnormalLog(type, machine) {
  return selectedBatchFor(type, machine) ? abnormalProcessLog(type, machine) : "";
}

function sensorTrendSeries(type, sensor, batch) {
  const count = { "1H": 36, "8H": 48, "24H": 60 }[state.sensorTrend.range] || 36;
  const span = { "1H": 60, "8H": 8 * 60, "24H": 24 * 60 }[state.sensorTrend.range] * 60 * 1000;
  const typePhase = ["jetflow", "calator", "dryer", "kalender", "chemical"].indexOf(type) * 0.43;
  const seed = batchSeed(batch);
  const keyPhase = sensor.key.length * 0.17 + seed % 19 * 0.07;
  const batchEnd = new Date("2026-08-14T14:00:00+07:00").getTime() - seed % 96 * 30 * 60 * 1000;
  const timestamps = Array.from({ length: count }, (_, index) => batchEnd - span + span * index / (count - 1));
  const sv = timestamps.map((_, index) => sensor.sv + (index > count * 0.68 ? sensor.variance * 0.08 : 0));
  const pv = sv.map((target, index) => target + Math.sin(index * 0.44 + typePhase + keyPhase) * sensor.variance * 0.52 + Math.cos(index * 0.17 + keyPhase) * sensor.variance * 0.18);
  return { timestamps, sv, pv };
}

function sensorTrendPanel(type, machine) {
  const sensors = sensorTrendConfig[type] || [];
  const enabled = state.sensorTrend.enabled[type] || [];
  const selectedBatch = selectedBatchFor(type, machine);
  const toggles = sensors.map((sensor) => `<label class="sensor-toggle ${enabled.includes(sensor.key) ? "active" : ""}"><input type="checkbox" data-sensor-toggle="${type}|${sensor.key}" ${enabled.includes(sensor.key) ? "checked" : ""}/><i style="--sensor-color:${sensor.color}"></i><span>${sensor.label}<small>${sensor.tag}</small></span></label>`).join("");
  const rows = sensors.filter((sensor) => enabled.includes(sensor.key)).map((sensor) => {
    const series = sensorTrendSeries(type, sensor, selectedBatch);
    const pv = series.pv.at(-1);
    const sv = series.sv.at(-1);
    const delta = pv - sv;
    return `<article class="sensor-trend-row">
      <div class="sensor-trend-row-head"><div><i style="background:${sensor.color}"></i><span><strong>${sensor.label}</strong><small>${sensor.tag} · ${sensor.unit}</small></span></div><div class="sensor-trend-readings"><span>PV<strong>${pv.toFixed(sensor.decimals)} ${sensor.unit}</strong></span><span>SV<strong>${sv.toFixed(sensor.decimals)} ${sensor.unit}</strong></span><span>Δ<strong class="${Math.abs(delta) > sensor.variance * .55 ? "warning" : ""}">${delta >= 0 ? "+" : ""}${delta.toFixed(sensor.decimals)} ${sensor.unit}</strong></span></div></div>
      <div class="sensor-line-legend"><span><i style="background:${sensor.color}"></i>PV · Process Value</span><span><i style="border-color:${sensor.color}"></i>SV · Set Value</span></div>
      <canvas class="sensor-trend-canvas" id="sensor-trend-${type}-${sensor.key}" aria-label="Trend PV dan SV ${sensor.label}"></canvas>
    </article>`;
  }).join("");
  const ranges = ["1H", "8H", "24H"].map((range) => `<button class="segment ${state.sensorTrend.range === range ? "active" : ""}" data-sensor-range="${range}">${range}</button>`).join("");
  return `<section class="card sensor-comparison-panel">
    <div class="sensor-comparison-head"><div><span class="eyebrow">Machine sensor historian</span><h2>Sensor SV / PV Comparison</h2><p>${machine.id} · batch ${selectedBatch} · setiap sensor menggunakan skala engineering unit masing-masing.</p></div><div class="sensor-comparison-actions"><span class="data-pill neutral">${selectedBatch}</span><div class="sensor-line-key"><span><i></i>PV solid</span><span><i></i>SV dashed</span></div><div class="segmented">${ranges}</div></div></div>
    <div class="sensor-toggle-toolbar"><div class="sensor-toggle-list">${toggles}</div><div class="sensor-bulk-actions"><button class="button ghost small" data-sensor-bulk="${type}|on">All On</button><button class="button ghost small" data-sensor-bulk="${type}|off">All Off</button></div></div>
    <div class="sensor-trend-stack">${rows || `<div class="sensor-trend-empty"><strong>Semua sensor dalam kondisi OFF</strong><span>Aktifkan sensor melalui checkbox untuk menampilkan perbandingan trend SV dan PV.</span></div>`}</div>
  </section>`;
}

function selector(items, page) {
  return `
    <select class="select-control" data-machine-select="${page}" aria-label="Pilih mesin">
      ${items.map((m) => `<option value="${m.id}" ${state.selected[page] === m.id ? "selected" : ""}>${m.name}</option>`).join("")}
    </select>
    <button class="button" data-page-target="trends">⌗ Historical</button>
  `;
}

function productionOutputDataset() {
  const datasets = {
    "1H": {
      labels: ["13:05", "13:10", "13:15", "13:20", "13:25", "13:30", "13:35", "13:40", "13:45", "13:50", "13:55", "14:00"],
      values: [142, 158, 166, 171, 182, 175, 188, 194, 201, 196, 209, 216],
      interval: "5 min",
      scope: "Last 1 hour",
      water: 166,
      runtime: 108,
      downtime: 5.4,
      energy: 3.4,
    },
    "8H": {
      labels: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00"],
      values: [1960, 2140, 2260, 2380, 2250, 2470, 2580, 2380],
      interval: "hour",
      scope: "Current 8-hour shift",
      water: 1284,
      runtime: 852,
      downtime: 42.6,
      energy: 26.8,
    },
    "24H": {
      labels: ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"],
      values: [2940, 2780, 3020, 3240, 3580, 3860, 4010, 4160, 3950, 4210, 4090, 3840],
      interval: "2 hours",
      scope: "Last 24 hours",
      water: 3160,
      runtime: 2498,
      downtime: 126,
      energy: 78.9,
    },
    "7D": {
      labels: ["08 Agu", "09 Agu", "10 Agu", "11 Agu", "12 Agu", "13 Agu", "14 Agu"],
      values: [41820, 43680, 42940, 45210, 44780, 46120, 45560],
      interval: "day",
      scope: "Last 7 days",
      water: 22480,
      runtime: 17540,
      downtime: 864,
      energy: 552,
    },
  };
  const selected = datasets[state.range] || datasets["8H"];
  const total = selected.values.reduce((sum, value) => sum + value, 0);
  return {
    ...selected,
    total,
    average: total / selected.values.length,
    peak: Math.max(...selected.values),
  };
}

function formatProductionOutput(value) {
  return Number(value).toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function overviewPage() {
  const alarmItems = alarms.filter((a) => !a.ack).slice(0, 3).map(alarmRow).join("");
  const productionFleet = [...jetflows, ...calators, ...dryers, ...kalenders];
  const runningMachines = statusCount(productionFleet, "running");
  const stoppedMachines = statusCount(productionFleet, "idle") + statusCount(productionFleet, "fault");
  const activeExceptions = statusCount(productionFleet, "warning") + statusCount(productionFleet, "fault");
  const productionOutput = productionOutputDataset();
  return `
    ${pageHead("overview", `<button class="button" data-page-target="health">⊕ Data health</button><button class="button primary" data-page-target="trends">⌗ Open trends</button>`)}
    <div class="management-section-label overview-section-label"><span class="kpi-scope live">LIVE NOW</span><p>Snapshot aktual plant; nilai tidak berubah saat time range historis diganti.</p></div>
    <section class="kpi-grid">
      ${kpi("Machines Running", runningMachines, "/ 133", "MC", `<strong>${(runningMachines / 133 * 100).toFixed(1)}%</strong>simulated fleet state`, "success")}
      ${kpi("Machines Stopped", stoppedMachines, "machines", "ST", `<strong class='danger'>${statusCount(productionFleet, "fault")} fault</strong>· ${statusCount(productionFleet, "idle")} idle`, stoppedMachines ? "warning" : "success")}
      ${kpi("Electrical Demand", "1.84", "MW", "EL", "<strong class='danger'>92%</strong>of demand baseline", "warning")}
      ${kpi("Active Exceptions", activeExceptions, "machines", "AL", `<strong class='danger'>${alarms.filter((alarm) => !alarm.ack).length} alarms</strong>not acknowledged`, activeExceptions ? "danger" : "success")}
    </section>
    <section class="grid-2">
      ${panel("Requires Attention", "Exception paling penting saat ini", `<div class="alarm-list">${alarmItems}</div>`, `<button class="button ghost small" data-page-target="alarms">View all →</button>`)}
      ${panel("Utility Snapshot", "Supply utama dan current demand", `
        <div class="metric-grid">
          ${metricTile("Electrical", liveValue(1.84, "MW", .02, 2), "Main incomer · PF 0.94")}
          ${metricTile("Steam Header", liveValue(7.8, "bar", .08, 1), "Jetflow + Kalender")}
          ${metricTile("Thermal Oil", liveValue(218.4, "°C", .25, 1), "Dryer supply")}
          ${metricTile("Data Good", "99.4<small>%</small>", "248.6K active tags")}
          ${metricTile("PLC Gateways", "18<small>/ 18</small>", "All gateways online")}
          ${metricTile("Historian Latency", "24<small>ms</small>", "Collector to historian")}
        </div>
      `, `<button class="button ghost small" data-page-target="utilities">Open utilities →</button>`)}
    </section>
    ${panel("Textile Process Flow", "Status real-time dari pencelupan sampai finishing", `
      <div class="process-flow">
        ${processNode("Jetflow", "Pencelupan · 88 assets", "jetflow", statusCount(jetflows, "running"), statusCount(jetflows, "warning"), statusCount(jetflows, "fault"))}
        ${processNode("Calator", "Pencucian · 18 assets", "calator", statusCount(calators, "running"), statusCount(calators, "warning"), statusCount(calators, "fault"))}
        ${processNode("Dryer", "Pengeringan · 6 assets", "dryer", statusCount(dryers, "running"), statusCount(dryers, "warning"), statusCount(dryers, "fault"))}
        ${processNode("Kalender", "Finishing · 21 assets", "kalender", statusCount(kalenders, "running"), statusCount(kalenders, "warning"), statusCount(kalenders, "fault"))}
      </div>
    `)}
    ${panel("Active Process Runs", "Material, recipe, progress, dan machine state", activeRunsTable(), `<button class="button ghost small">Export view</button>`)}
    <div class="management-section-label overview-section-label historical-section-label"><span class="kpi-scope historical">SELECTED RANGE</span><p>${state.range} · ${productionOutput.scope} · seluruh nilai di bawah mengikuti periode ini.</p>${rangeButtons()}</div>
    <section class="management-kpi-grid historical-grid overview-history-grid">
      ${managementKpi("historical", "Good Production Output", formatProductionOutput(productionOutput.total), "m", "Good fabric aggregate · demo")}
      ${managementKpi("historical", "Water Consumption", formatProductionOutput(productionOutput.water), "m³", "All production machines · demo")}
      ${managementKpi("historical", "Energy Consumption", formatManagementValue(productionOutput.energy, "MWh"), "MWh", "Accumulated electrical energy · demo")}
      ${managementKpi("historical", "Total Machine Runtime", formatProductionOutput(productionOutput.runtime), "h", "Accumulated across 133 machines")}
      ${managementKpi("historical", "Machine Downtime", formatManagementValue(productionOutput.downtime, "h"), "h", "Idle and fault duration · demo", "warning")}
    </section>
    ${panel("Production Output by Interval", `Good fabric output · ${productionOutput.scope} · meter kain`, `
      <div class="throughput-summary">
        <div><span>Total Output</span><strong>${formatProductionOutput(productionOutput.total)} <small>m</small></strong></div>
        <div><span>Average / ${productionOutput.interval}</span><strong>${formatProductionOutput(productionOutput.average)} <small>m</small></strong></div>
        <div><span>Peak / ${productionOutput.interval}</span><strong>${formatProductionOutput(productionOutput.peak)} <small>m</small></strong></div>
      </div>
      <div class="chart-container production-bar-chart"><canvas id="overview-chart" class="chart-canvas"></canvas></div>
    `)}
  `;
}

function processNode(name, subtitle, page, running, warning, fault) {
  return `
    <div class="process-node" data-page-target="${page}" role="button" tabindex="0">
      <div class="process-node-top"><div><strong>${name}</strong><small>${subtitle}</small></div>${fault ? statusPill("fault") : warning ? statusPill("warning") : statusPill("running")}</div>
      <div class="node-metrics">
        <div class="node-metric"><strong>${running}</strong><small>Run</small></div>
        <div class="node-metric"><strong>${warning}</strong><small>Warn</small></div>
        <div class="node-metric"><strong>${fault}</strong><small>Fault</small></div>
      </div>
    </div>
  `;
}

function metricTile(label, value, target) {
  return `<div class="metric-tile"><div class="metric-label"><span>${label}</span><span class="quality-pill good">Good</span></div><div class="metric-value">${value}</div><div class="metric-target">${target}</div></div>`;
}

function activeRunsTable() {
  const rows = [
    ["DB-260814-032", "Jetflow 02", "BLACK-R08", "Holding", 81, "12:14"],
    ["DB-260814-029", "Calator Bianco 01", "SOFT-B12", "Running", 62, "11:42"],
    ["DB-260814-024", "Dryer 01", "DRY-COT-18", "Running", 72, "11:28"],
    ["DB-260814-022", "Kalender 02", "FIN-POL-05", "Running", 65, "11:16"],
  ];
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Process Run</th><th>Machine</th><th>Recipe / Setup</th><th>Step</th><th>Progress</th><th>ETA</th></tr></thead><tbody>
    ${rows.map((r) => `<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td class="mono">${r[2]}</td><td>${r[3]}</td><td><span class="progress"><i class="progress-track"><i class="progress-fill" style="width:${r[4]}%"></i></i><span class="mono">${r[4]}%</span></span></td><td class="mono">${r[5]}</td></tr>`).join("")}
  </tbody></table></div>`;
}

function alarmRow(a) {
  return `
    <div class="alarm-row ${a.severity}">
      <div class="alarm-copy"><strong>${a.title}</strong><span>${a.detail}</span><small>${a.source}</small></div>
      <div class="alarm-meta"><span class="alarm-time">${a.time}</span>${a.ack ? `<span class="data-pill neutral">ACK</span>` : `<button class="button small" data-ack-id="${a.id}">Acknowledge</button>`}</div>
    </div>
  `;
}

function fleetFor(type) {
  return { jetflow: jetflows, calator: calators, dryer: dryers, kalender: kalenders, chemical: dispensers }[type] || [];
}

function processBreadcrumb(type, machine = null) {
  const config = processConfig[type];
  const areaCode = machine?.area || state.drill[type].area;
  const area = processAreas[type].find((item) => item.code === areaCode);
  return `<nav class="process-breadcrumb" aria-label="Lokasi halaman">
    <button data-process-level="overview" data-process-type="${type}">${config.plural}</button>
    ${area ? `<span>›</span><button data-process-level="area" data-process-type="${type}">${area.label}</button>` : ""}
    ${machine ? `<span>›</span><strong>${machine.id}</strong>` : ""}
  </nav>`;
}

function statusCount(items, machineState) {
  return items.filter((item) => item.state === machineState).length;
}

const managementConfig = {
  jetflow: {
    currentUtility: { label: "Water Flow Now", value: 184, unit: "m³/h" },
    output: { label: "Completed Batches", unit: "batch", rate: 0.12 },
    metrics: {
      water: { label: "Water Consumption", short: "Water", unit: "m³", rate: 2.45 },
      energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 34 },
      steam: { label: "Steam Consumption", short: "Steam", unit: "ton", rate: 0.24 },
    },
  },
  calator: {
    currentUtility: { label: "Water Flow Now", value: 42.6, unit: "m³/h" },
    output: { label: "Fabric Output", unit: "m", rate: 310 },
    metrics: {
      water: { label: "Water Consumption", short: "Water", unit: "m³", rate: 1.18 },
      chemical: { label: "Chemical Consumption", short: "Chemical", unit: "kg", rate: 10.8 },
      energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 18 },
    },
  },
  dryer: {
    currentUtility: { label: "Thermal Load Now", value: 4.82, unit: "MWth" },
    output: { label: "Fabric Output", unit: "m", rate: 340 },
    metrics: {
      energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 66 },
      thermal: { label: "Thermal Oil Energy", short: "Thermal", unit: "GJ", rate: 5.8 },
    },
  },
  kalender: {
    currentUtility: { label: "Steam Demand Now", value: 3.18, unit: "ton/h" },
    output: { label: "Fabric Output", unit: "m", rate: 290 },
    metrics: {
      steam: { label: "Steam Consumption", short: "Steam", unit: "ton", rate: 0.16 },
      energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 21 },
    },
  },
  chemical: {
    currentUtility: { label: "Transfer Flow Now", value: 286, unit: "kg/h" },
    output: { label: "Completed Transfers", unit: "transfer", rate: 1.7 },
    metrics: {
      chemical: { label: "Chemical Delivered", short: "Chemical", unit: "kg", rate: 18 },
      energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 7.5 },
    },
  },
};

const managementColors = ["#078eaa", "#4d8fd0", "#119b70", "#8267c7", "#d68b05", "#db6d48"];

function selectedRangeHours() {
  return Math.max(1 / 60, (state.history.end - state.history.start) / 3600000);
}

function historicalStateFactor(machine) {
  return { running: 0.91, warning: 0.84, idle: 0.63, fault: 0.48, offline: 0.12 }[machine.state] || 0.7;
}

function machineMetricValue(type, machine, metricKey) {
  const fleet = fleetFor(type);
  const index = Math.max(0, fleet.findIndex((item) => item.id === machine.id));
  const metric = managementConfig[type].metrics[metricKey];
  const variation = 0.82 + ((index * 17 + machine.area.charCodeAt(0)) % 31) / 100;
  return metric.rate * selectedRangeHours() * historicalStateFactor(machine) * variation;
}

function machineRuntime(type, machine) {
  const index = Math.max(0, fleetFor(type).findIndex((item) => item.id === machine.id));
  return selectedRangeHours() * historicalStateFactor(machine) * (0.96 + (index % 5) * 0.01);
}

function machineDowntime(type, machine) {
  const index = Math.max(0, fleetFor(type).findIndex((item) => item.id === machine.id));
  const base = machine.state === "fault" ? 0.12 : machine.state === "warning" ? 0.055 : 0.026;
  return selectedRangeHours() * (base + (index % 4) * 0.006);
}

function formatManagementValue(value, unit) {
  const decimals = unit === "ton" || unit === "GJ" ? 1 : value < 100 ? 1 : 0;
  return Number(value).toLocaleString("id-ID", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function managementKpi(scope, label, value, unit, foot, tone = "") {
  return `<article class="card management-kpi ${tone}">
    <div class="management-kpi-top"><span class="kpi-scope ${scope === "live" ? "live" : "historical"}">${scope === "live" ? "LIVE NOW" : "SELECTED RANGE"}</span><span class="quality-pill good">Simulated</span></div>
    <span class="management-kpi-label">${label}</span>
    <div class="management-kpi-value">${value}<small>${unit}</small></div>
    <div class="management-kpi-foot">${foot}</div>
  </article>`;
}

function managementTimeFilter() {
  return `<section class="card management-range-card">
    <div class="management-range-main">
      <div><span class="eyebrow">Historical scope</span><h2>Management Time Range</h2><p>Semua KPI bertanda Selected Range, donut, dan ranking mengikuti periode ini.</p></div>
      <div class="management-range-controls">${historyRangeButtons()}<span class="range-summary">${formatDateTime(state.history.start, true)} — ${formatDateTime(state.history.end, true)}</span></div>
    </div>
    <div class="custom-range-row ${state.history.preset === "CUSTOM" ? "" : "hidden"}" id="custom-range-row">
      <label class="date-field"><span>Start date</span><input type="datetime-local" id="history-start" value="${toDateTimeLocal(state.history.start)}" /></label>
      <span class="range-arrow">→</span>
      <label class="date-field"><span>End date</span><input type="datetime-local" id="history-end" value="${toDateTimeLocal(state.history.end)}" /></label>
      <button class="button primary" id="apply-history-range">Apply range</button>
    </div>
  </section>`;
}

function metricTotal(type, metricKey, items = fleetFor(type)) {
  return items.reduce((total, machine) => total + machineMetricValue(type, machine, metricKey), 0);
}

function resourceBreakdown(type) {
  const config = managementConfig[type];
  const metricKey = state.management.metric[type];
  const selectedArea = state.management.area[type];
  const metric = config.metrics[metricKey];
  const areas = processAreas[type].map((area, index) => {
    const items = fleetFor(type).filter((machine) => machine.area === area.code);
    return { ...area, index, value: metricTotal(type, metricKey, items) };
  });
  const total = areas.reduce((sum, area) => sum + area.value, 0);
  const circumference = 402.12;
  let used = 0;
  const segments = areas.map((area) => {
    const length = total ? area.value / total * circumference : 0;
    const segment = `<circle class="${selectedArea === area.code ? "selected" : ""}" cx="80" cy="80" r="64" fill="none" stroke="${managementColors[area.index]}" stroke-width="32" stroke-dasharray="${length.toFixed(2)} ${(circumference - length).toFixed(2)}" stroke-dashoffset="${(-used).toFixed(2)}" transform="rotate(-90 80 80)" data-resource-area="${type}|${area.code}|${metricKey}" tabindex="0"><title>${area.label}: ${formatManagementValue(area.value, metric.unit)} ${metric.unit}</title></circle>`;
    used += length;
    return segment;
  }).join("");
  const tabs = Object.entries(config.metrics).map(([key, item]) => `<button class="segment ${metricKey === key ? "active" : ""}" data-management-metric="${type}|${key}">${item.short}</button>`).join("");
  const legend = areas.map((area) => {
    const percent = total ? area.value / total * 100 : 0;
    return `<button class="resource-legend-row ${selectedArea === area.code ? "active" : ""}" data-resource-area="${type}|${area.code}|${metricKey}"><i style="background:${managementColors[area.index]}"></i><span>${type === "jetflow" ? area.label : `Area ${area.label}`}</span><strong>${percent.toFixed(1)}%</strong><small>${formatManagementValue(area.value, metric.unit)} ${metric.unit}</small></button>`;
  }).join("");
  const scopeLabel = selectedArea ? (processAreas[type].find((area) => area.code === selectedArea)?.label || selectedArea) : `Semua ${type === "jetflow" ? "Lane" : "Area"}`;
  return panel(`${metric.label} by ${type === "jetflow" ? "Lane" : "Area"}`, "Klik segmen atau area untuk memfilter ranking mesin di sebelah kanan.", `
    <div class="metric-tabs segmented">${tabs}</div>
    <div class="resource-filter-status"><span>Ranking scope</span><strong>${type === "jetflow" && selectedArea ? scopeLabel : selectedArea ? `Area ${scopeLabel}` : scopeLabel}</strong>${selectedArea ? `<button data-ranking-reset="${type}">Reset · All ${type === "jetflow" ? "Lanes" : "Areas"}</button>` : ""}</div>
    <div class="resource-donut-wrap">
      <div class="resource-donut" aria-label="Distribusi ${metric.label}"><svg viewBox="0 0 160 160" role="img">${segments}</svg><div><strong>${formatManagementValue(total, metric.unit)}</strong><small>${metric.unit}</small></div></div>
      <div class="resource-legend">${legend}</div>
    </div>
    <div class="management-coverage"><span>Meter coverage</span><strong>${type === "jetflow" ? "91%" : type === "chemical" ? "100%" : "94%"}</strong><small>Nilai demo; coverage aktual wajib ditampilkan saat commissioning.</small></div>
  `);
}

function consumptionRanking(type) {
  const metricKey = state.management.metric[type];
  const selectedArea = state.management.area[type];
  const metric = managementConfig[type].metrics[metricKey];
  const area = processAreas[type].find((item) => item.code === selectedArea);
  const scopedFleet = selectedArea ? fleetFor(type).filter((machine) => machine.area === selectedArea) : fleetFor(type);
  const ranked = scopedFleet.map((machine) => ({ machine, value: machineMetricValue(type, machine, metricKey) })).sort((a, b) => b.value - a.value).slice(0, 5);
  const max = ranked[0]?.value || 1;
  const scope = area ? `${type === "jetflow" ? area.label : `Area ${area.label}`} · ${scopedFleet.length} machines` : `All ${type === "jetflow" ? "lanes" : "areas"} · ${scopedFleet.length} machines`;
  return panel(`Top ${metric.short} Consumers${area ? ` · ${type === "jetflow" ? area.label : `Area ${area.label}`}` : ""}`, `${scope} · ${formatDateTime(state.history.start, true)} — ${formatDateTime(state.history.end, true)}`, `<div class="ranking-list">${ranked.map((item, index) => `<button class="ranking-row" data-machine-target="${type}|${item.machine.id}"><span class="ranking-number">${index + 1}</span><span class="ranking-copy"><strong>${item.machine.id}</strong><small>${item.machine.areaLabel} · ${item.machine.state}</small><i><b style="width:${item.value / max * 100}%"></b></i></span><span class="ranking-value">${formatManagementValue(item.value, metric.unit)}<small>${metric.unit}</small></span></button>`).join("")}</div>`, `${area ? `<button class="button ghost small ranking-reset-button" data-ranking-reset="${type}">All ${type === "jetflow" ? "Lanes" : "Areas"}</button>` : ""}<span class="data-pill ${area ? "good" : "neutral"}">${area ? "AREA FILTER" : "SELECTED RANGE"}</span>`);
}

function downtimePareto(type) {
  const reasons = {
    jetflow: [["Tangle / winch", 38], ["Heating delay", 27], ["Dosing wait", 19], ["Pump / circulation", 16]],
    calator: [["Speed imbalance", 36], ["Dancing roller", 29], ["Chemical wait", 21], ["Fabric handling", 14]],
    dryer: [["Under-temperature", 41], ["Thermal oil wait", 25], ["Fabric handling", 20], ["Drive fault", 14]],
    kalender: [["Load imbalance", 34], ["Steam wait", 28], ["Bowing / width", 23], ["Fabric handling", 15]],
    chemical: [["Route unavailable", 37], ["Chemical low", 29], ["Transfer timeout", 21], ["Pump fault", 13]],
  }[type];
  return panel("Unplanned Downtime Pareto", "Penyebab downtime demo untuk periode terpilih; planned idle tidak dihitung.", `<div class="downtime-bars">${reasons.map(([label, value], index) => `<div><span>${label}</span><i><b style="width:${value}%;background:${managementColors[index]}"></b></i><strong>${value}%</strong></div>`).join("")}</div>`);
}

function processFleetPage(type) {
  const config = processConfig[type];
  const fleet = fleetFor(type);
  const exceptions = statusCount(fleet, "warning") + statusCount(fleet, "fault");
  const running = statusCount(fleet, "running") + statusCount(fleet, "warning");
  const stopped = statusCount(fleet, "idle") + statusCount(fleet, "fault");
  const runtime = fleet.reduce((total, machine) => total + machineRuntime(type, machine), 0);
  const downtime = fleet.reduce((total, machine) => total + machineDowntime(type, machine), 0);
  const output = runtime * managementConfig[type].output.rate;
  const selectedMetric = managementConfig[type].metrics[state.management.metric[type]];
  const areaCards = processAreas[type].map((area) => {
    const items = fleet.filter((machine) => machine.area === area.code);
    const running = statusCount(items, "running");
    const idle = statusCount(items, "idle");
    const warning = statusCount(items, "warning");
    const fault = statusCount(items, "fault");
    const tone = fault ? "fault" : warning ? "warning" : "running";
    return `<article class="card area-card" data-area-target="${type}|${area.code}" role="button" tabindex="0">
      <div class="area-card-head"><div><span class="area-code">${area.code}</span><h2>${type === "jetflow" ? area.label : `Area ${area.label}`}</h2></div>${statusPill(tone)}</div>
      <div class="area-total"><strong>${items.length}</strong><span>${config.singular} registered</span></div>
      <div class="area-state-grid"><span><strong>${running}</strong>Run</span><span><strong>${idle}</strong>Idle</span><span><strong>${warning}</strong>Warn</span><span><strong>${fault}</strong>Fault</span></div>
      <div class="area-card-foot"><span>${formatManagementValue(metricTotal(type, state.management.metric[type], items), selectedMetric.unit)} ${selectedMetric.unit} ${selectedMetric.short.toLowerCase()}</span><strong>Open ranking →</strong></div>
    </article>`;
  }).join("");
  return `
    ${pageHead(type, `<span class="data-pill neutral">Asset mapping · simulated state</span><button class="button" data-page-target="trends">⌗ Historical</button>`)}
    <section class="fleet-summary card">
      <div><span class="eyebrow">${config.process}</span><h2>${config.plural} Fleet Overview</h2><p>Pilih ${type === "jetflow" ? "lane" : "area"} untuk melihat daftar mesin, kemudian masuk ke detail mesin.</p></div>
      <div class="fleet-total"><strong>${fleet.length}</strong><span>Total assets</span></div>
    </section>
    ${managementTimeFilter()}
    <div class="management-section-label"><span class="kpi-scope live">LIVE NOW</span><p>Snapshot aktual; tidak berubah saat time range historis diganti.</p></div>
    <section class="management-kpi-grid live-grid">
      ${managementKpi("live", "Machines Running Now", running, `/ ${fleet.length}`, `${Math.round(running / fleet.length * 100)}% of mapped fleet`, "success")}
      ${managementKpi("live", "Machines Stopped Now", stopped, "machines", `${statusCount(fleet, "fault")} fault · ${statusCount(fleet, "idle")} idle`, stopped ? "warning" : "success")}
      ${managementKpi("live", "Active Exceptions", exceptions, "machines", `${statusCount(fleet, "warning")} warning · ${statusCount(fleet, "fault")} fault`, exceptions ? "danger" : "success")}
      ${managementKpi("live", managementConfig[type].currentUtility.label, liveValue(managementConfig[type].currentUtility.value, "", managementConfig[type].currentUtility.value * .008, managementConfig[type].currentUtility.value < 10 ? 2 : 1), managementConfig[type].currentUtility.unit, "Current process demand", "")}
    </section>
    <div class="management-section-label"><span class="kpi-scope historical">SELECTED RANGE</span><p>${formatDateTime(state.history.start, true)} — ${formatDateTime(state.history.end, true)}</p></div>
    <section class="management-kpi-grid historical-grid">
      ${managementKpi("historical", "Total Machine Runtime", formatManagementValue(runtime, "h"), "h", "Accumulated across all assets")}
      ${managementKpi("historical", "Unplanned Downtime", formatManagementValue(downtime, "h"), "h", "Planned idle excluded", downtime > runtime * .08 ? "warning" : "")}
      ${managementKpi("historical", managementConfig[type].output.label, formatManagementValue(output, managementConfig[type].output.unit), managementConfig[type].output.unit, "Historian aggregate · demo")}
      ${Object.entries(managementConfig[type].metrics).map(([key, metric]) => managementKpi("historical", metric.label, formatManagementValue(metricTotal(type, key), metric.unit), metric.unit, "Meter aggregate · demo")).join("")}
    </section>
    <section class="management-analysis-grid">${resourceBreakdown(type)}${consumptionRanking(type)}</section>
    <section class="management-analysis-grid single-support">${downtimePareto(type)}<article class="card management-note"><span class="eyebrow">Management reading guide</span><h2>Mulai dari exception, lalu biaya proses.</h2><p>Gunakan Live Now untuk respon operasi. Gunakan Selected Range untuk membandingkan runtime, downtime, output, dan konsumsi. Klik area pada donut untuk ranking mesin, lalu buka detail mesin untuk investigasi sensor dan motor.</p><div><span>01 · Detect</span><span>02 · Compare</span><span>03 · Drill down</span></div></article></section>
    <div class="management-section-label area-label"><span class="kpi-scope neutral">AREA STATUS</span><p>Status saat ini dan konsumsi periode terpilih.</p></div>
    <section class="area-grid">${areaCards}</section>
  `;
}

function machineSnapshot(type, machine, index) {
  if (type === "jetflow") return `${machine.winches} winches · Tank ${(91.8 + index % 6 * .3).toFixed(1)}°C`;
  if (type === "calator") return `${machine.subtype} · OF Out ${(28.7 + index % 5 * .12).toFixed(1)} m/min`;
  if (type === "dryer") return `${machine.chambers} chambers · Avg ${(145.2 + index % 4 * .5).toFixed(1)}°C`;
  if (type === "kalender") return `Load balance ${(1.2 + index % 5 * .3).toFixed(1)}% · Width ${(180.8 + index % 4 * .2).toFixed(1)} cm`;
  return `${machine.step} · 7 variants`;
}

function processAreaPage(type) {
  const config = processConfig[type];
  const area = processAreas[type].find((item) => item.code === state.drill[type].area) || processAreas[type][0];
  const metricKey = state.management.metric[type];
  const metric = managementConfig[type].metrics[metricKey];
  const machines = fleetFor(type).filter((machine) => machine.area === area.code).sort((a, b) => machineMetricValue(type, b, metricKey) - machineMetricValue(type, a, metricKey));
  const cards = machines.map((machine, index) => `<article class="card fleet-machine-card" data-machine-target="${type}|${machine.id}" data-machine-state="${machine.state}" data-machine-search="${machine.id.toLowerCase()} ${machine.name.toLowerCase()} ${machine.batch.toLowerCase()}" role="button" tabindex="0">
    <div class="fleet-machine-top"><span class="machine-code ranking-badge ${machine.state === "fault" ? "fault" : machine.state === "warning" ? "warning" : ""}">#${index + 1}</span><div><strong>${machine.id}</strong><span>${machine.name}</span></div>${statusPill(machine.state)}</div>
    <div class="fleet-machine-reading">${machineSnapshot(type, machine, index)}</div>
    <div class="fleet-machine-meta"><span>${metric.short}<strong>${formatManagementValue(machineMetricValue(type, machine, metricKey), metric.unit)} ${metric.unit}</strong></span><span>Runtime<strong>${formatManagementValue(machineRuntime(type, machine), "h")} h</strong></span><span>State<strong>${machine.state}</strong></span></div>
    <div class="fleet-machine-foot"><span>${machine.connected ? "● Connected" : "○ Offline"}</span><strong>Machine detail →</strong></div>
  </article>`).join("");
  return `
    ${processBreadcrumb(type)}
    ${pageHead(type, `<button class="button" data-process-level="overview" data-process-type="${type}">← All ${type === "jetflow" ? "lanes" : "areas"}</button><button class="button" data-page-target="trends">⌗ Area trends</button>`)}
    <section class="fleet-area-head card"><div><span class="area-code">${area.code}</span><div><h2>${config.plural} ${area.label}</h2><p>Ranking ${machines.length} mesin berdasarkan ${metric.label.toLowerCase()} · ${formatDateTime(state.history.start, true)} — ${formatDateTime(state.history.end, true)}.</p></div></div><div class="area-health"><strong>${formatManagementValue(metricTotal(type, metricKey, machines), metric.unit)}</strong><span>${metric.unit} ${metric.short}</span></div></section>
    <section class="card fleet-filter"><input class="search-control" id="fleet-search" placeholder="Cari machine ID atau batch..." /><select class="select-control" id="fleet-state-filter"><option value="all">All states</option><option value="running">Running</option><option value="idle">Idle</option><option value="warning">Warning</option><option value="fault">Fault</option></select></section>
    <section class="fleet-machine-grid" id="fleet-machine-grid">${cards}</section>
    <div class="empty-state card hidden" id="fleet-empty"><strong>Mesin tidak ditemukan</strong><span>Ubah pencarian atau filter state.</span></div>
  `;
}

function processPage(type, detailRenderer) {
  const drill = state.drill[type];
  if (!drill.area) return processFleetPage(type);
  if (!drill.machine) return processAreaPage(type);
  return detailRenderer();
}

function jetflowPage() { return processPage("jetflow", jetflowDetailPage); }
function calatorPage() { return processPage("calator", calatorDetailPage); }
function dryerPage() { return processPage("dryer", dryerDetailPage); }
function kalenderPage() { return processPage("kalender", kalenderDetailPage); }
function chemicalPage() { return processPage("chemical", chemicalDetailPage); }

function jetflowDetailPage() {
  const machine = jetflows.find((m) => m.id === state.selected.jetflow) || jetflows[0];
  const winches = Array.from({ length: machine.winches }, (_, i) => {
    const warn = machine.id === "JF-03" && i === 2;
    return `<div class="winch-card"><div class="winch-card-head"><strong>Winch ${i + 1}</strong><i class="equipment-state ${warn ? "warning" : ""}"></i></div><div class="card-reading">${liveValue(42 + i * .7, "Hz", .25, 1)}</div><div class="card-caption">Motor · ${warn ? "Tangle detected" : "Limit clear"}</div><div class="mini-bar"><span style="width:${65 + i * 3}%"></span></div></div>`;
  }).join("");
  return `
    ${processBreadcrumb("jetflow", machine)}
    ${pageHead("jetflow", selector(jetflows.filter((item) => item.area === machine.area), "jetflow"))}
    ${machineHero(machine, "JF", `${machine.winches} winches · ${machine.recipe} · Active step: ${machine.step}`)}
    ${remoteDisplayPanel(machine)}
    <section class="kpi-grid">
      ${kpi("Main Tank Temp", liveValue(92.6, "", .18, 1), "°C", "MT", "<strong>Target 93.0°C</strong>· holding")}
      ${kpi("Water Level", liveValue(72.4, "", .12, 1), "%", "LV", "<strong>Within range</strong>· target 72%", "success")}
      ${kpi("Flow Meter", liveValue(124.8, "", .7, 1), "m³/h", "FL", "<strong>↑ 1.2%</strong>stable flow")}
      ${kpi("Steam Header", liveValue(7.8, "", .07, 1), "bar", "ST", "<strong class='danger'>Low baseline</strong>· 8.1 bar", "warning")}
    </section>
    <section class="grid-2 abnormal-log-layout">
      ${panel("Tank & Dosing", "Live tank condition and data quality", `
        <div class="metric-grid">
          ${metricTile("Main tank", liveValue(92.6, "°C", .15, 1), "Temperature · SP 93.0")}
          ${metricTile("Dosing tank 1", liveValue(58.2, "°C", .18, 1), "Level 64.8%")}
          ${metricTile("Dosing tank 2", liveValue(42.7, "°C", .16, 1), "Level 37.2%")}
          ${metricTile("Main pump", "46.2<small>A</small>", "Running · 1,482 rpm")}
          ${metricTile("Dosing pump 1", "18.4<small>Hz</small>", "Running")}
          ${metricTile("Dosing pump 2", "0.0<small>Hz</small>", "Ready")}
        </div>
      `)}
    </section>
    ${panel(`Dynamic Winch Group · ${machine.winches} units`, "Jumlah winch mengikuti konfigurasi mesin; setiap winch memiliki motor dan tangle limit.", `<div class="winch-grid">${winches}</div>`)}
    <section class="grid-equal">
      ${panel("Driven Equipment", "Motor, pump, circulation, dan mixer status", equipmentGrid([
        ["Main Pump", "46.2 A", "Running"], ["Circulation", "38.7 Hz", "Running"], ["Dosing Pump 1", "18.4 Hz", "Running"],
        ["Dosing Pump 2", "0.0 Hz", "Ready"], ["Mixer 1", "22.1 Hz", "Running"], ["Mixer 2", "0.0 Hz", "Ready"]
      ]))}
      ${panel("Batch Events", "State, dosing, steam, dan alarm timeline", eventTable([
        ["10:38:42", "Alarm", "Winch 3 tangle limit activated", "Warning"],
        ["10:24:11", "Process", "Holding temperature reached", "Good"],
        ["10:02:44", "Utility", "Steam header pressure below baseline", "Warning"],
        ["09:46:08", "Recipe", "Dosing step 04 completed", "Good"],
      ]))}
    </section>
    ${batchInvestigationPanel("jetflow", machine)}
    ${batchTrendWorkspace("jetflow", machine)}
    ${batchAbnormalLog("jetflow", machine)}
  `;
}

function equipmentGrid(items) {
  return `<div class="equipment-list">${items.map((it) => `<div class="equipment-row" style="grid-template-columns:35px minmax(0,1fr) auto"><span class="equipment-icon">M</span><div class="equipment-copy"><strong>${it[0]}</strong><span>${it[1]} · 1,284 operating hours</span></div><span class="data-pill ${it[2] === "Running" ? "good" : "neutral"}">${it[2]}</span></div>`).join("")}</div>`;
}

function eventTable(rows) {
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Type</th><th>Event</th><th>Status</th></tr></thead><tbody>${rows.map((r) => `<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><span class="data-pill ${r[3] === "Good" ? "good" : "warning"}">${r[3]}</span></td></tr>`).join("")}</tbody></table></div>`;
}

const abnormalLogTemplates = {
  jetflow: [
    ["14 Aug · 10:38:42", "10:43:31", "Main Tank Temperature", "93.0 °C", "89.8 °C", "-3.2 °C", 4.8, "Heating delay · holding time extended", "Open"],
    ["14 Aug · 10:14:08", "10:16:26", "Main Flow Meter", "125.0 m³/h", "112.4 m³/h", "-12.6 m³/h", 2.3, "Dye liquor circulation below recipe", "Recovered"],
    ["14 Aug · 09:42:17", "09:45:05", "Water Level", "72.0 %", "78.6 %", "+6.6 %", 2.8, "Liquor ratio outside tolerance", "Acknowledged"],
    ["14 Aug · 08:56:44", "09:01:12", "Dosing Tank 1 Temperature", "58.0 °C", "53.1 °C", "-4.9 °C", 4.5, "Dosing step delayed", "Recovered"],
    ["14 Aug · 07:48:31", "07:51:09", "Winch 3 Speed", "42.0 Hz", "34.8 Hz", "-7.2 Hz", 2.6, "Fabric circulation instability", "Recovered"],
    ["13 Aug · 22:16:04", "22:23:40", "Steam Header", "8.1 bar", "7.3 bar", "-0.8 bar", 7.6, "Heating rate below recipe baseline", "Acknowledged"],
  ],
  calator: [
    ["14 Aug · 10:31:09", "10:34:18", "Overfeed Out Speed", "29.2 m/min", "27.8 m/min", "-1.4 m/min", 3.2, "Chemical absorption and fabric tension risk", "Open"],
    ["14 Aug · 10:07:22", "10:09:06", "Dancing Roller", "50.0 %", "58.4 %", "+8.4 %", 1.7, "Fabric tension outside center window", "Recovered"],
    ["14 Aug · 09:38:51", "09:41:20", "Squeezing 2 Speed", "27.9 m/min", "26.5 m/min", "-1.4 m/min", 2.5, "Moisture carry-over increased", "Acknowledged"],
    ["14 Aug · 08:54:17", "08:58:46", "Chemical Transfer Weight", "184.0 kg", "178.2 kg", "-5.8 kg", 4.5, "Softener dosage below recipe", "Recovered"],
    ["14 Aug · 07:26:40", "07:29:22", "Folder Speed", "27.6 m/min", "25.9 m/min", "-1.7 m/min", 2.7, "Output folding instability", "Recovered"],
    ["13 Aug · 21:48:13", "21:54:01", "Feeding Speed", "28.4 m/min", "26.1 m/min", "-2.3 m/min", 5.8, "Line speed reduction", "Acknowledged"],
  ],
  dryer: [
    ["14 Aug · 10:36:18", "10:42:54", "Chamber 5 Temperature", "148.0 °C", "134.2 °C", "-13.8 °C", 6.6, "Under-drying risk · 168 m fabric affected", "Open"],
    ["14 Aug · 10:10:41", "10:11:23", "Line Speed", "32.5 m/min", "29.0 m/min", "-3.5 m/min", 0.7, "Output rate temporarily reduced", "Recovered"],
    ["14 Aug · 09:44:08", "09:49:36", "Thermal Oil Supply", "218.0 °C", "207.6 °C", "-10.4 °C", 5.5, "Chamber heating capacity reduced", "Acknowledged"],
    ["14 Aug · 08:37:52", "08:41:11", "Chamber 3 Temperature", "150.0 °C", "143.4 °C", "-6.6 °C", 3.3, "Drying profile outside tolerance", "Recovered"],
    ["14 Aug · 07:59:16", "08:02:24", "Chamber 7 Temperature", "145.0 °C", "138.1 °C", "-6.9 °C", 3.1, "Outlet moisture risk", "Recovered"],
    ["13 Aug · 23:14:28", "23:21:40", "Exhaust Fan Speed", "38.0 Hz", "31.2 Hz", "-6.8 Hz", 7.2, "Humidity evacuation below baseline", "Acknowledged"],
  ],
  kalender: [
    ["14 Aug · 10:24:32", "10:29:14", "Upper Roll Temperature", "127.0 °C", "122.8 °C", "-4.2 °C", 4.7, "Gramasi and shrinkage consistency risk", "Open"],
    ["14 Aug · 10:03:18", "10:05:47", "Loadcell Upper", "4.80 kN", "5.34 kN", "+0.54 kN", 2.5, "Upper/lower pressure imbalance", "Recovered"],
    ["14 Aug · 09:36:51", "09:40:05", "Fabric Width", "181.0 cm", "178.9 cm", "-2.1 cm", 3.2, "Width below finishing specification", "Acknowledged"],
    ["14 Aug · 08:48:09", "08:51:44", "Overfeed", "8.5 %", "6.9 %", "-1.6 %", 3.6, "Shrinkage correction below target", "Recovered"],
    ["14 Aug · 07:54:26", "07:59:18", "Lower Roll Temperature", "127.0 °C", "121.7 °C", "-5.3 °C", 4.9, "Bowing correction instability", "Recovered"],
    ["13 Aug · 22:32:15", "22:38:08", "Dancing Roller", "50.0 %", "57.6 %", "+7.6 %", 5.9, "Fabric tension outside center window", "Acknowledged"],
  ],
  chemical: [
    ["14 Aug · 10:28:14", "10:31:42", "Transfer Flow", "42.8 kg/min", "36.7 kg/min", "-6.1 kg/min", 3.5, "Chemical delivery below requested rate", "Open"],
    ["14 Aug · 10:04:27", "10:06:10", "Line Pressure", "3.20 bar", "2.74 bar", "-0.46 bar", 1.7, "Transfer stability outside tolerance", "Recovered"],
    ["14 Aug · 09:46:08", "09:48:36", "Batch Weight", "184.0 kg", "178.2 kg", "-5.8 kg", 2.5, "Delivered chemical below recipe target", "Acknowledged"],
    ["14 Aug · 08:52:19", "08:55:41", "Source Tank Level", "70.0 %", "62.8 %", "-7.2 %", 3.4, "Low source availability during request", "Recovered"],
    ["14 Aug · 07:41:55", "07:44:18", "Transfer Pump Speed", "32.0 Hz", "27.6 Hz", "-4.4 Hz", 2.4, "Extended chemical transfer duration", "Recovered"],
    ["13 Aug · 22:08:31", "22:13:22", "Route Valve Feedback", "Open", "Intermediate", "Mismatch", 4.9, "Transfer route confirmation delayed", "Acknowledged"],
  ],
};

function historicalBatchFor(machine, index) {
  if (index === 0 && machine.batch && machine.batch !== "—") return machine.batch;
  const seed = [...machine.id].reduce((total, character) => total + character.charCodeAt(0), 0);
  return `DB-260814-${String((seed + index * 17) % 190 + 1).padStart(3, "0")}`;
}

function abnormalProcessLog(type, machine) {
  const selectedBatch = selectedBatchFor(type, machine);
  const eventCount = 3 + batchSeed(selectedBatch) % 4;
  const rows = abnormalLogTemplates[type].slice(0, eventCount).map((row) => ({
    start: row[0], end: row[1], parameter: row[2], sv: row[3], pv: row[4], deviation: row[5], minutes: row[6], impact: row[7], status: row[8], batch: selectedBatch,
  }));
  const totalMinutes = rows.reduce((sum, row) => sum + row.minutes, 0);
  const open = rows.filter((row) => row.status === "Open").length;
  const tableRows = rows.map((row) => {
    const tone = row.status === "Open" ? "danger" : row.status === "Recovered" ? "good" : "neutral";
    return `<tr><td class="mono abnormal-time">${row.start}</td><td class="mono">${row.end}</td><td class="mono">${row.batch}</td><td><strong>${row.parameter}</strong></td><td class="mono">${row.sv}</td><td class="mono">${row.pv}</td><td class="mono abnormal-deviation">${row.deviation}</td><td class="mono">${row.minutes.toFixed(1)} min</td><td>${row.impact}</td><td><span class="data-pill ${tone}">${row.status}</span></td></tr>`;
  }).join("");
  return panel("Production Abnormality Log", `Setpoint miss dan process deviation · ${machine.id} · batch ${selectedBatch}`, `
    <div class="abnormal-log-summary"><div><span>Events in batch</span><strong>${rows.length}</strong></div><div><span>Open abnormality</span><strong class="${open ? "danger" : ""}">${open}</strong></div><div><span>Batch scope</span><strong class="batch-log-id">${selectedBatch}</strong></div><div><span>Total deviation</span><strong>${totalMinutes.toFixed(1)} min</strong></div></div>
    <div class="table-wrap abnormal-log-wrap"><table class="data-table abnormal-log-table"><thead><tr><th>Start Time</th><th>End Time</th><th>Batch No.</th><th>Parameter</th><th>SV</th><th>Worst PV</th><th>Deviation</th><th>Duration</th><th>Process Impact</th><th>Status</th></tr></thead><tbody>${tableRows}</tbody></table></div>
    <div class="abnormal-log-foot"><span>Demo log · seluruh event dibatasi pada nomor batch yang dipilih.</span><button class="button ghost small">Export batch log</button></div>
  `, `<span class="data-pill neutral">${selectedBatch}</span>`, "abnormal-log-panel");
}

function rangeButtons() {
  return `<div class="segmented">${["1H", "8H", "24H", "7D"].map((r) => `<button class="segment ${state.range === r ? "active" : ""}" data-range="${r}">${r}</button>`).join("")}</div>`;
}

function historyRangeButtons() {
  return `<div class="segmented history-presets">${["1H", "8H", "24H", "7D", "30D"].map((range) => `<button class="segment ${state.history.preset === range ? "active" : ""}" data-history-range="${range}">${range}</button>`).join("")}<button class="segment ${state.history.preset === "CUSTOM" ? "active" : ""}" data-history-range="CUSTOM">Custom</button></div>`;
}

function toDateTimeLocal(timestamp) {
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(timestamp - offset).toISOString().slice(0, 16);
}

function formatDateTime(timestamp, compact = false) {
  return new Date(timestamp).toLocaleString("id-ID", compact
    ? { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }
    : { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

function calatorDetailPage() {
  const machine = calators.find((m) => m.id === state.selected.calator) || calators[0];
  const isBianco = machine.subtype === "Bianco";
  const standard = [
    ["Feeding", 28.4], ["Squeezing 1", 28.1], ["Squeezing 2", 27.9], ["Overfeed Atas", 29.3],
    ["Overfeed Bawah", 29.0], ["Folder", 27.6], ["Plaiter", 27.4]
  ];
  const bianco = [
    ["OF In Bawah 1", 27.8], ["OF In Bawah 2", 27.9], ["OF In Atas 3", 28.1], ["OF In Atas 4", 28.0],
    ["Feeding", 28.2], ["Squeezing 1", 28.0], ["Squeezing 2", 27.7], ["OF Out Bawah 1", 29.2],
    ["OF Out Bawah 2", 29.0], ["OF Out Atas 3", 29.4], ["OF Out Atas 4", 29.1], ["Folder", 27.5], ["Plaiter", 27.3]
  ];
  const speeds = isBianco ? bianco : standard;
  return `
    ${processBreadcrumb("calator", machine)}
    ${pageHead("calator", selector(calators.filter((item) => item.area === machine.area), "calator"))}
    ${machineHero(machine, "CL", `${machine.subtype} · ${machine.recipe} · Jetflow source JF-04`)}
    ${remoteDisplayPanel(machine)}
    <section class="kpi-grid">
      ${kpi("Overfeed Out Avg", liveValue(29.18, "", .08, 2), "m/min", "OF", "<strong>Balance 1.4%</strong>· within range")}
      ${kpi("Dancing Roller", liveValue(51.6, "", .35, 1), "%", "DR", "<strong>Center ±3%</strong>· stable", "success")}
      ${kpi("Output Today", "4,860", "m", "OP", "<strong>↑ 3.2%</strong>vs shift plan")}
      ${kpi("Chemical Usage", "184.6", "kg", "CH", "<strong>98.7%</strong>recipe adherence")}
    </section>
    <section class="grid-2">
      ${panel(`Multi-Speed Profile · ${machine.subtype}`, "Actual speed dari feeding sampai plaiter", `<div class="speed-grid">${speeds.map(speedCard).join("")}</div>`)}
      ${panel("Critical Process", "Overfeed Out, dancing roller, dan current transfer", `
        <div class="metric-grid">
          ${metricTile("OF Out spread", liveValue(0.42, "m/min", .03, 2), "Limit 0.60")}
          ${metricTile("Dancing roller", liveValue(51.6, "%", .3, 1), "Center 50.0")}
          ${metricTile("Folder ratio", liveValue(0.944, "", .002, 3), "vs OF Out")}
          ${metricTile("Chemical route", "P-04", "CH-02 → CL-B01")}
          ${metricTile("Transfer status", "DONE", "182.4 / 184.0 kg")}
          ${metricTile("Good output", "4,738<small>m</small>", "97.5%")}
        </div>
      `)}
    </section>
    <section class="grid-2 abnormal-log-layout">
      ${panel("Speed Synchronization", "Difference dan ratio antarstage", `
        ${balanceRows([
          ["Feeding → SQ-1", 52, "+0.7%"], ["SQ-1 → SQ-2", 48, "+1.1%"], ["OF In → OF Out", 56, "+3.8%"],
          ["OF Out upper/lower", 51, "1.4%"], ["OF Out → Folder", 45, "-5.6%"], ["Folder → Plaiter", 49, "0.7%"]
        ])}
      `)}
    </section>
    ${panel("Process Run History", "Chemical, speed, slowdown, output, dan quality context", eventTable([
      ["10:31:09", "Warning", "Overfeed Out spread reached 0.62 m/min", "Warning"],
      ["10:18:24", "Chemical", "CH-02 transfer completed · 182.4 kg", "Good"],
      ["10:05:18", "Speed", "Running speed reached recipe window", "Good"],
      ["09:58:02", "Process", "Process run DB-260814-029 started", "Good"],
    ]))}
    ${batchInvestigationPanel("calator", machine)}
    ${batchTrendWorkspace("calator", machine)}
    ${batchAbnormalLog("calator", machine)}
  `;
}

function speedCard(item, index) {
  const warn = item[0].includes("Out Atas 4") && index % 3 === 0;
  return `<div class="speed-card"><div class="speed-card-head"><strong>${item[0]}</strong><i class="equipment-state ${warn ? "warning" : ""}"></i></div><div class="card-reading">${liveValue(item[1], "m/min", .06, 1)}</div><div class="card-caption">SP ${(item[1] + .1).toFixed(1)} · ${warn ? "Check balance" : "Good"}</div><div class="mini-bar"><span style="width:${Math.min(94, item[1] * 2.8)}%"></span></div></div>`;
}

function balanceRows(rows) {
  return `<div>${rows.map((r) => `<div class="balance-row"><span class="balance-label">${r[0]}</span><div class="balance-track"><i class="balance-indicator" style="left:${r[1]}%"></i></div><span class="balance-value">${r[2]}</span></div>`).join("")}</div>`;
}

function dryerDetailPage() {
  const machine = dryers.find((m) => m.id === state.selected.dryer) || dryers[0];
  const temps = Array.from({ length: machine.chambers }, (_, i) => ({ actual: 142 + i * 1.2 + (i === 4 ? -9 : 0), sp: 144 + i * 1.0 }));
  return `
    ${processBreadcrumb("dryer", machine)}
    ${pageHead("dryer", selector(dryers.filter((item) => item.area === machine.area), "dryer"))}
    ${machineHero(machine, "DR", `${machine.chambers} chambers · ${machine.setup} · Calator source CL-03`)}
    ${remoteDisplayPanel(machine)}
    <section class="kpi-grid">
      ${kpi("Machine Speed", liveValue(32.4, "", .08, 1), "m/min", "SP", "<strong>Target 32.5</strong>· stable")}
      ${kpi("Avg. Chamber Temp", liveValue(146.8, "", .12, 1), "°C", "TP", "<strong>7 / 8 ready</strong>· one deviation", "warning")}
      ${kpi("Thermal Oil Supply", liveValue(218.4, "", .22, 1), "°C", "TO", "<strong>ΔT 21.7°C</strong>· normal", "success")}
      ${kpi("Output Today", "6,420", "m", "OP", "<strong>↑ 2.6%</strong>vs shift target")}
    </section>
    ${panel(`Chamber Temperature Heatmap · ${machine.chambers} zones`, "Actual, setpoint, dan deviation setiap chamber", `
      <div class="heatmap-grid">${temps.map((t, i) => `<div class="heatmap-cell ${Math.abs(t.actual - t.sp) > 5 ? "warning" : ""}"><strong>CH-${String(i + 1).padStart(2, "0")}</strong><span>${t.actual.toFixed(1)}°</span><small>SP ${t.sp.toFixed(1)} · Δ ${(t.actual - t.sp).toFixed(1)}</small></div>`).join("")}</div>
    `)}
    <section class="grid-2 abnormal-log-layout">
      ${panel("Drying Context", "Input, output, utility, dan quality risk", `
        <div class="metric-grid">
          ${metricTile("Moisture inlet", "42.8<small>%</small>", "Manual sample")}
          ${metricTile("Moisture outlet", "8.4<small>%</small>", "Target 8.0–9.0")}
          ${metricTile("Residence time", "4.82<small>min</small>", "Calculated")}
          ${metricTile("Oil supply", "218.4<small>°C</small>", "Return 196.7")}
          ${metricTile("Energy intensity", "0.84<small>kWh/kg</small>", "Baseline 0.82")}
          ${metricTile("Risk length", "168<small>m</small>", "CH-05 deviation")}
        </div>
      `)}
    </section>
    ${panel("Chamber & Drive Events", "Heating, fan, drive, thermal oil, dan positional risk", eventTable([
      ["10:36:18", "Alarm", "Chamber 05 under-temperature · segment 3,240–3,408 m", "Warning"],
      ["10:22:04", "Utility", "Thermal oil supply recovered to 218°C", "Good"],
      ["10:10:41", "Speed", "Speed reduced to 29.0 m/min for 42 sec", "Warning"],
      ["09:51:12", "Process", "All chambers ready · run started", "Good"],
    ]))}
    ${batchInvestigationPanel("dryer", machine)}
    ${batchTrendWorkspace("dryer", machine)}
    ${batchAbnormalLog("dryer", machine)}
  `;
}

function kalenderDetailPage() {
  const machine = kalenders.find((m) => m.id === state.selected.kalender) || kalenders[0];
  const motors = ["Inlet", "Expander L", "Expander R", "Upper Felt", "Lower Felt", "Cooling Belt", "Conveyor Belt", "Plaiter", "Conveyor Table", "Up Down Table"];
  return `
    ${processBreadcrumb("kalender", machine)}
    ${pageHead("kalender", selector(kalenders.filter((item) => item.area === machine.area), "kalender"))}
    ${machineHero(machine, "KL", `${machine.setup} · Dryer source DR-02 · Cotton 220 GSM`)}
    ${remoteDisplayPanel(machine)}
    <section class="kpi-grid">
      ${kpi("Loadcell Balance", liveValue(1.8, "", .05, 1), "%", "LC", "<strong>Within ±3%</strong>· stable", "success")}
      ${kpi("Temperature Upper", liveValue(126.4, "", .15, 1), "°C", "TU", "<strong>Target 127°C</strong>· good")}
      ${kpi("Overfeed", liveValue(8.6, "", .04, 1), "%", "OF", "<strong>Target 8.5%</strong>· stable")}
      ${kpi("Fabric Width", liveValue(181.2, "", .06, 1), "cm", "FW", "<strong>Target 181.0</strong>· good", "success")}
    </section>
    <section class="grid-2">
      ${panel("Upper / Lower Balance", "Mechanical, thermal, expander, dan felt synchronization", balanceRows([
        ["Loadcell U/L", 52, "1.8%"], ["Temperature U/L", 49, "0.6°C"], ["Expander L/R", 51, "0.9%"],
        ["Upper/Lower Felt", 48, "1.2%"], ["Dancing Roller", 54, "53.8%"], ["Fabric Width", 50, "181.2 cm"]
      ]))}
      ${panel("Live Process Measurements", "Input sampai output finishing", `
        <div class="metric-grid">
          ${metricTile("Temp inlet", liveValue(74.8, "°C", .12, 1), "From Dryer")}
          ${metricTile("Temp upper", liveValue(126.4, "°C", .13, 1), "SP 127.0")}
          ${metricTile("Temp lower", liveValue(125.8, "°C", .13, 1), "SP 127.0")}
          ${metricTile("Loadcell upper", liveValue(4.82, "kN", .02, 2), "Within range")}
          ${metricTile("Loadcell lower", liveValue(4.73, "kN", .02, 2), "Within range")}
          ${metricTile("Dancing roller", liveValue(53.8, "%", .22, 1), "Center 50.0")}
        </div>
      `)}
    </section>
    <section class="grid-2 abnormal-log-layout">
      ${panel("Quality Context", "Target dan latest inspection result", `
        <div class="ring-wrap">
          <div class="ring" style="--value:94;--ring-color:#119b70"><div class="ring-copy"><strong>94.2%</strong><small>Quality score</small></div></div>
          <div class="ring-stats">
            <div class="ring-stat"><span>Gramasi</span><strong>221.4 GSM</strong></div>
            <div class="ring-stat"><span>Bowing</span><strong>1.2%</strong></div>
            <div class="ring-stat"><span>Shrinkage</span><strong>-3.4%</strong></div>
            <div class="ring-stat"><span>Fabric width</span><strong>181.2 cm</strong></div>
          </div>
        </div>
      `)}
    </section>
    ${panel("Motor & Driven Equipment", "Status dari inlet sampai output table", `<div class="motor-grid">${motors.map((m, i) => `<div class="motor-card"><div class="motor-card-head"><strong>${m}</strong><i class="equipment-state ${i === 8 ? "warning" : ""}"></i></div><div class="card-reading">${(24 + i * 1.2).toFixed(1)}<small>Hz</small></div><div class="card-caption">${i === 8 ? "Current above baseline" : "Running · Good"}</div></div>`).join("")}</div>`)}
    ${batchInvestigationPanel("kalender", machine)}
    ${batchTrendWorkspace("kalender", machine)}
    ${batchAbnormalLog("kalender", machine)}
  `;
}

function createElectricalAsset(spec, index) {
  return {
    ...spec,
    status: spec.status || "running",
    powerFactor: (0.92 + (index % 4) * 0.01).toFixed(2),
    load: 61 + (index * 7) % 28,
    voltage: 396 + (index * 3) % 8,
    peak: Math.round(spec.demand * (1.07 + (index % 3) * 0.025)),
    energy: spec.demand * (6.85 + (index % 4) * 0.22) / 1000,
  };
}

const electricalDistribution = {
  cubical: [
    { id: "CUB-A", name: "Electrical Cubical A", demand: 720, location: "Main LV Room A", supply: "Main Incomer · Transformer 01", downstream: "MDP Jetflow 1, Jetflow 2, Washing" },
    { id: "CUB-B", name: "Electrical Cubical B", demand: 612, location: "Main LV Room B", supply: "Main Incomer · Transformer 02", downstream: "MDP Dryer, MDP Kalender" },
    { id: "CUB-C", name: "Electrical Cubical C", demand: 508, location: "Utility Power Room", supply: "Main Incomer · Transformer 03", downstream: "MDP Utility & Auxiliary", status: "warning" },
  ].map(createElectricalAsset),
  mdp: [
    { id: "MDP-JF-1", name: "MDP Jetflow Lane A–C", demand: 408, location: "Dyeing West", supply: "Electrical Cubical A", downstream: "SDP Jetflow Lane A, B, C" },
    { id: "MDP-JF-2", name: "MDP Jetflow Lane D–F", demand: 382, location: "Dyeing East", supply: "Electrical Cubical A", downstream: "SDP Jetflow Lane D, E, F" },
    { id: "MDP-WASH", name: "MDP Calator & Dispensing", demand: 198, location: "Washing Area", supply: "Electrical Cubical A", downstream: "SDP Calator Depan, Belakang, Timur" },
    { id: "MDP-DRY", name: "MDP Dryer", demand: 314, location: "Drying Area", supply: "Electrical Cubical B", downstream: "SDP Dryer Depan, Belakang, Timur" },
    { id: "MDP-KAL", name: "MDP Kalender", demand: 286, location: "Finishing Area", supply: "Electrical Cubical B", downstream: "SDP Kalender Depan, Belakang, Timur" },
    { id: "MDP-UTL", name: "MDP Utility & Auxiliary", demand: 252, location: "Utility Building", supply: "Electrical Cubical C", downstream: "SDP Boiler dan SDP Auxiliary", status: "warning" },
  ].map(createElectricalAsset),
  sdp: [
    { id: "SDP-JF-A", name: "SDP Jetflow Lane A", demand: 120, location: "Lane A", supply: "MDP Jetflow Lane A–C", downstream: "6 Jetflow machines" },
    { id: "SDP-JF-B", name: "SDP Jetflow Lane B", demand: 142, location: "Lane B", supply: "MDP Jetflow Lane A–C", downstream: "18 Jetflow machines" },
    { id: "SDP-JF-C", name: "SDP Jetflow Lane C", demand: 146, location: "Lane C", supply: "MDP Jetflow Lane A–C", downstream: "18 Jetflow machines" },
    { id: "SDP-JF-D", name: "SDP Jetflow Lane D", demand: 136, location: "Lane D", supply: "MDP Jetflow Lane D–F", downstream: "18 Jetflow machines" },
    { id: "SDP-JF-E", name: "SDP Jetflow Lane E", demand: 110, location: "Lane E", supply: "MDP Jetflow Lane D–F", downstream: "13 Jetflow machines" },
    { id: "SDP-JF-F", name: "SDP Jetflow Lane F", demand: 136, location: "Lane F", supply: "MDP Jetflow Lane D–F", downstream: "15 Jetflow machines" },
    { id: "SDP-CL-D", name: "SDP Calator Depan", demand: 58, location: "Area Depan", supply: "MDP Calator & Dispensing", downstream: "2 Calator + 1 Dispensing" },
    { id: "SDP-CL-B", name: "SDP Calator Belakang", demand: 82, location: "Area Belakang", supply: "MDP Calator & Dispensing", downstream: "9 Calator + 2 Dispensing" },
    { id: "SDP-CL-T", name: "SDP Calator Timur", demand: 58, location: "Area Timur", supply: "MDP Calator & Dispensing", downstream: "7 Calator + 2 Dispensing" },
    { id: "SDP-DR-D", name: "SDP Dryer Depan", demand: 74, location: "Area Depan", supply: "MDP Dryer", downstream: "1 Dryer machine" },
    { id: "SDP-DR-B", name: "SDP Dryer Belakang", demand: 106, location: "Area Belakang", supply: "MDP Dryer", downstream: "2 Dryer machines" },
    { id: "SDP-DR-T", name: "SDP Dryer Timur", demand: 134, location: "Area Timur", supply: "MDP Dryer", downstream: "3 Dryer machines", status: "warning" },
    { id: "SDP-KL-D", name: "SDP Kalender Depan", demand: 92, location: "Area Depan", supply: "MDP Kalender", downstream: "7 Kalender machines" },
    { id: "SDP-KL-B", name: "SDP Kalender Belakang", demand: 98, location: "Area Belakang", supply: "MDP Kalender", downstream: "7 Kalender machines" },
    { id: "SDP-KL-T", name: "SDP Kalender Timur", demand: 96, location: "Area Timur", supply: "MDP Kalender", downstream: "7 Kalender machines" },
    { id: "SDP-BLR", name: "SDP Boiler", demand: 152, location: "Boiler House", supply: "MDP Utility & Auxiliary", downstream: "Steam and thermal oil boiler" },
    { id: "SDP-AUX", name: "SDP Auxiliary", demand: 100, location: "Utility Building", supply: "MDP Utility & Auxiliary", downstream: "WWTP, pumps, lighting, auxiliary" },
  ].map(createElectricalAsset),
};

const electricalColors = ["#078eaa", "#4d8fd0", "#119b70", "#8267c7", "#d68b05", "#db6d48", "#4aa8b8", "#6d9bd1", "#55a685", "#9a82ca", "#dfaa43", "#df8467", "#217d94", "#3d78b7", "#287e61", "#7054aa", "#b9780a"];

function electricalDistributionPanel() {
  const level = state.utility.electricalLevel;
  const assets = electricalDistribution[level];
  if (!assets.some((asset) => asset.id === state.utility.selectedElectrical)) state.utility.selectedElectrical = assets[0].id;
  const selected = assets.find((asset) => asset.id === state.utility.selectedElectrical) || assets[0];
  const total = assets.reduce((sum, asset) => sum + asset.demand, 0);
  const share = selected.demand / total * 100;
  const levelLabels = { cubical: "Electrical Cubical", mdp: "Electrical MDP", sdp: "Electrical SDP" };
  const legend = assets.map((asset, index) => `<button class="electrical-legend-row ${asset.id === selected.id ? "active" : ""}" data-electrical-asset="${asset.id}"><i style="background:${electricalColors[index]}"></i><span><strong>${asset.id}</strong><small>${asset.name}</small></span><b>${asset.demand} kW</b><em>${(asset.demand / total * 100).toFixed(1)}%</em></button>`).join("");
  return `<section class="card electrical-distribution-card">
    <div class="electrical-distribution-head">
      <div><span class="eyebrow">Electrical mapping</span><h2>Electrical Distribution</h2><p>Pilih level distribusi, kemudian klik segmen pie atau daftar untuk melihat detail sumber dan beban.</p></div>
      <div class="electrical-dropdowns">
        <label><span>Distribution level</span><select class="select-control" id="electrical-level-select"><option value="cubical" ${level === "cubical" ? "selected" : ""}>Electrical Cubical · 3 units</option><option value="mdp" ${level === "mdp" ? "selected" : ""}>Electrical MDP · 6 units</option><option value="sdp" ${level === "sdp" ? "selected" : ""}>Electrical SDP · 17 units</option></select></label>
        <label><span>Selected equipment</span><select class="select-control" id="electrical-asset-select">${assets.map((asset) => `<option value="${asset.id}" ${asset.id === selected.id ? "selected" : ""}>${asset.id} · ${asset.name}</option>`).join("")}</select></label>
      </div>
    </div>
    <div class="electrical-distribution-layout">
      <div class="electrical-chart-panel">
        <div class="electrical-pie-wrap"><canvas id="electrical-pie-chart" aria-label="Perbandingan demand ${levelLabels[level]}"></canvas><div class="electrical-pie-total"><strong>${(total / 1000).toFixed(2)}</strong><span>MW total</span><small>${levelLabels[level]}</small></div></div>
        <div class="electrical-legend">${legend}</div>
      </div>
      <aside class="electrical-detail-panel">
        <div class="electrical-detail-head"><div><span>${selected.id}</span><h3>${selected.name}</h3><p>${selected.location}</p></div>${statusPill(selected.status)}</div>
        <div class="electrical-primary-reading"><strong>${selected.demand}</strong><span>kW actual demand</span><small>${share.toFixed(1)}% dari total ${levelLabels[level]}</small></div>
        <div class="electrical-detail-grid"><div><span>Peak demand</span><strong>${selected.peak} kW</strong></div><div><span>Load</span><strong>${selected.load}%</strong></div><div><span>Power factor</span><strong>${selected.powerFactor}</strong></div><div><span>Voltage</span><strong>${selected.voltage} V</strong></div><div><span>Energy shift</span><strong>${selected.energy.toFixed(2)} MWh</strong></div><div><span>Data status</span><strong>Good · 24 ms</strong></div></div>
        <div class="electrical-load-bar"><span><b style="width:${selected.load}%"></b></span><small>Loading terhadap configured capacity · demo</small></div>
        <div class="electrical-path"><div><span>Supply from</span><strong>${selected.supply}</strong></div><i>→</i><div><span>Feeds</span><strong>${selected.downstream}</strong></div></div>
        <button class="button ghost electrical-history-button" data-page-target="trends">⌗ Open electrical historical</button>
      </aside>
    </div>
  </section>`;
}

function utilitiesPage() {
  return `
    ${pageHead("utilities", `<select class="select-control"><option>All utilities</option><option>Electrical</option><option>Water</option><option>Steam</option><option>Thermal Oil</option></select><button class="button" data-page-target="trends">⌗ Historical</button>`)}
    <section class="kpi-grid">
      ${kpi("Electrical Demand", liveValue(1.84, "", .02, 2), "MW", "EL", "<strong>Peak 1.96 MW</strong>· 10:12")}
      ${kpi("Water Consumption", "1,284", "m³", "WA", "<strong>82.4%</strong>daily baseline")}
      ${kpi("Steam Production", liveValue(12.8, "", .09, 1), "t/h", "ST", "<strong class='danger'>Pressure 7.8 bar</strong>", "warning")}
      ${kpi("Thermal Oil Supply", liveValue(218.4, "", .2, 1), "°C", "TO", "<strong>3 Dryers</strong>active demand", "success")}
    </section>
    <section class="grid-2">
      ${panel("Plant Electrical Demand", "Power, target baseline, dan peak demand", `<div class="chart-container"><canvas id="utility-chart" class="chart-canvas"></canvas></div>`, rangeButtons())}
      ${panel("Energy Balance", "Upstream versus downstream metering coverage", `
        <div class="ring-wrap">
          <div class="ring" style="--value:92;--ring-color:#078eaa"><div class="ring-copy"><strong>92.4%</strong><small>Metered</small></div></div>
          <div class="ring-stats">
            <div class="ring-stat"><span>Main incomer</span><strong>14.82 MWh</strong></div>
            <div class="ring-stat"><span>Downstream sum</span><strong>13.69 MWh</strong></div>
            <div class="ring-stat"><span>Unmetered</span><strong>0.72 MWh</strong></div>
            <div class="ring-stat"><span>Difference</span><strong>0.41 MWh</strong></div>
          </div>
        </div>
      `)}
    </section>
    ${electricalDistributionPanel()}
    ${panel("Boiler & Water", "Supply status and affected consumers", `
        <div class="metric-grid">
          ${metricTile("Steam boiler", "RUN", "Load 78.4%")}
          ${metricTile("Steam header", liveValue(7.8, "bar", .06, 1), "Baseline 8.1")}
          ${metricTile("Steam consumers", "9<small>units</small>", "Jetflow + Kalender")}
          ${metricTile("Oil boiler", "RUN", "Load 71.2%")}
          ${metricTile("Oil supply/return", "218/197<small>°C</small>", "ΔT 21.7")}
          ${metricTile("Water flow", liveValue(184, "m³/h", 1, 0), "32 machine meters")}
        </div>
      `)}
    ${panel("Machine Energy Intensity", "Consumption terhadap good output · current shift", energyTable())}
  `;
}

function energyTable() {
  const rows = [
    ["Jetflow 02", "DB-260814-032", "486.2 kWh", "2.18 kWh/kg", "+3.1%", "Good"],
    ["Calator B01", "DB-260814-029", "128.6 kWh", "0.027 kWh/m", "-1.8%", "Good"],
    ["Dryer 01", "DB-260814-024", "382.4 kWh", "0.84 kWh/kg", "+6.4%", "Warning"],
    ["Kalender 02", "DB-260814-022", "94.7 kWh", "0.021 kWh/m", "-0.7%", "Good"],
  ];
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Machine</th><th>Process Run</th><th>Energy</th><th>Intensity</th><th>vs Baseline</th><th>Data</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r[0]}</td><td class="mono">${r[1]}</td><td class="mono">${r[2]}</td><td class="mono">${r[3]}</td><td class="mono">${r[4]}</td><td><span class="data-pill ${r[5] === "Good" ? "good" : "warning"}">${r[5]}</span></td></tr>`).join("")}</tbody></table></div>`;
}

function chemicalDetailPage() {
  const machine = dispensers.find((item) => item.id === state.selected.chemical) || dispensers[0];
  const transactions = [
    ["TR-28419", "CH-02", "CL-B01", "184.0 kg", "182.4 kg", "P-04", "Completed"],
    ["TR-28420", "CH-01", "CL-02", "128.0 kg", "82.6 kg", "P-02", "Transfer"],
    ["TR-28421", "CH-05", "CL-01", "94.0 kg", "—", "P-05", "Queued"],
    ["TR-28418", "CH-03", "CL-B02", "110.0 kg", "108.1 kg", "P-03", "Partial"],
  ];
  return `
    ${processBreadcrumb("chemical", machine)}
    ${pageHead("chemical", selector(dispensers.filter((item) => item.area === machine.area), "chemical"))}
    ${machineHero(machine, "DSP", `${machine.areaLabel} · 7 chemical variants · Calator destination group`)}
    ${remoteDisplayPanel(machine)}
    <section class="kpi-grid">
      ${kpi("Usage Today", "6,115", "kg", "CH", "<strong>81.5%</strong>of daily forecast")}
      ${kpi("Active Transfers", "1", "route", "TR", "<strong>CH-01 → CL-02</strong>· 64.5%")}
      ${kpi("Request Queue", "2", "requests", "RQ", "<strong>Avg wait 02:14</strong>")}
      ${kpi("Usage Variance", "1.8", "%", "VR", "<strong>Within ±3%</strong>tolerance", "success")}
    </section>
    ${panel("Seven Chemical Variants", "Daily usage, forecast, dan availability", `<div class="chemical-grid">${chemicals.map((c) => {
      const pct = Math.round(c[2] / c[3] * 100);
      return `<div class="chemical-card"><div class="chemical-card-head"><strong>${c[0]} · ${c[1]}</strong><i class="equipment-state"></i></div><div class="card-reading">${c[2].toLocaleString()}<small>kg</small></div><div class="card-caption">${pct}% of ${c[3].toLocaleString()} kg forecast</div><div class="mini-bar"><span style="width:${pct}%;background:${c[4]}"></span></div></div>`;
    }).join("")}</div>`)}
    ${panel("Transfer Route", "Current source-to-Calator path", `
      <div class="utility-tree">
        <div class="utility-node"><div class="utility-name"><span>TK</span><strong>CH-01 Source Tank</strong></div><span class="utility-reading">68.4%</span>${statusPill("running")}</div>
        <div class="utility-node depth-1"><div class="utility-name"><span>DS</span><strong>Dispensing Unit 01</strong></div><span class="utility-reading">82.6 / 128 kg</span>${statusPill("running")}</div>
        <div class="utility-node depth-2"><div class="utility-name"><span>PP</span><strong>Pipe Route P-02</strong></div><span class="utility-reading">42.8 kg/min</span>${statusPill("running")}</div>
        <div class="utility-node depth-3"><div class="utility-name"><span>CL</span><strong>Calator 02</strong></div><span class="utility-reading">Destination</span>${statusPill("running")}</div>
      </div>
    `)}
    ${panel("Daily Usage by Variant", "Accumulated chemical usage · kg", `<div class="chart-container production-bar-chart"><canvas id="chemical-chart" class="chart-canvas"></canvas></div>`)}
    ${panel("Dispensing Transactions", "Request, target, actual, route, dan transfer status", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Request</th><th>Chemical</th><th>Destination</th><th>Target</th><th>Actual</th><th>Route</th><th>Status</th></tr></thead><tbody>${transactions.map((r) => `<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td class="mono">${r[3]}</td><td class="mono">${r[4]}</td><td class="mono">${r[5]}</td><td><span class="data-pill ${r[6] === "Completed" ? "good" : r[6] === "Partial" ? "warning" : "neutral"}">${r[6]}</span></td></tr>`).join("")}</tbody></table></div>`)}
    ${batchInvestigationPanel("chemical", machine)}
    ${batchTrendWorkspace("chemical", machine)}
    ${batchAbnormalLog("chemical", machine)}
  `;
}

function alarmsPage() {
  return `
    ${pageHead("alarms", `<button class="button" id="ack-all">Acknowledge visible</button><button class="button primary" data-page-target="trends">Open event timeline</button>`)}
    <section class="kpi-grid">
      ${kpi("Critical Active", "2", "alarms", "CR", "<strong class='danger'>Oldest 08:14</strong>", "danger")}
      ${kpi("Warning Active", "3", "alarms", "WR", "<strong>2 unacknowledged</strong>", "warning")}
      ${kpi("Avg Response", "01:42", "min", "RT", "<strong>↓ 18 sec</strong>vs previous shift", "success")}
      ${kpi("Communication", "1", "event", "CM", "<strong>Utility GW degraded</strong>", "warning")}
    </section>
    <section class="card filter-bar">
      <input class="search-control" id="alarm-search" placeholder="Cari alarm, machine, atau equipment..." />
      <select class="select-control" id="alarm-severity"><option value="all">All severity</option><option value="critical">Critical</option><option value="warning">Warning</option></select>
      <select class="select-control"><option>All areas</option><option>Dyeing</option><option>Finishing</option><option>Utilities</option></select>
    </section>
    <section class="grid-2">
      ${panel("Active Alarms", "Live alarm list · sorted by severity", `<div id="alarm-page-list" class="alarm-list">${alarms.map(alarmRow).join("")}</div>`)}
      ${panel("Event Sequence", "State dan event terakhir sebelum alarm critical", eventTable([
        ["10:38:42.418", "Alarm", "JF-03 Winch 3 tangle limit active", "Warning"],
        ["10:38:41.904", "Drive", "Winch 3 current increased to 28.4 A", "Warning"],
        ["10:38:40.122", "Process", "Winch 3 speed variation +8.2%", "Warning"],
        ["10:37:54.710", "Recipe", "Dosing step 03 active", "Good"],
        ["10:36:11.028", "State", "Jetflow running · all winches good", "Good"],
      ]))}
    </section>
    ${panel("Alarm Frequency · Current Shift", "Recurring alarm groups dan total duration", `<div class="chart-container compact"><canvas id="alarm-chart" class="chart-canvas"></canvas></div>`)}
  `;
}

function trendsPage() {
  const fullRange = `${formatDateTime(state.history.start)} — ${formatDateTime(state.history.end)} WIB`;
  const customVisible = state.history.preset === "CUSTOM" ? "" : "hidden";
  return `
    ${pageHead("trends", `<button class="button">Save view</button><button class="button primary">Export CSV</button>`)}
    <section class="card history-filter">
      <div class="history-filter-main">
        <label class="field-group"><span>Machine</span><select class="select-control"><option>Jetflow 02</option><option>Calator Bianco 01</option><option>Dryer 01</option><option>Kalender 02</option></select></label>
        <div class="field-group range-field"><span>Time range</span>${historyRangeButtons()}</div>
        <label class="field-group tag-search"><span>Parameters</span><input class="search-control" placeholder="Tambah tag atau parameter..." /></label>
        <button class="button add-tag-button">+ Add tag</button>
      </div>
      <div class="custom-range-row ${customVisible}" id="custom-range-row">
        <label class="date-field"><span>Start date & time</span><input type="datetime-local" id="history-start" value="${toDateTimeLocal(state.history.start)}" /></label>
        <span class="range-arrow">→</span>
        <label class="date-field"><span>End date & time</span><input type="datetime-local" id="history-end" value="${toDateTimeLocal(state.history.end)}" /></label>
        <button class="button primary" id="apply-history-range">Apply range</button>
        <span class="range-help">Waktu menggunakan zona WIB</span>
      </div>
    </section>
    <section class="card panel">
      <div class="panel-head">
        <div><h2 class="panel-title">Historical Trend Explorer</h2><p class="panel-subtitle" id="history-range-summary">JF-02 · ${fullRange}</p></div>
        <div class="panel-actions trend-actions"><button class="button small" id="trend-zoom-out" title="Perlebar window">−</button><button class="button small" id="trend-zoom-in" title="Persempit window">+</button><button class="button small" id="trend-fit">Fit range</button></div>
      </div>
      <div class="tag-chip-list">
        <span class="tag-chip"><i style="background:#078eaa"></i>Main Tank Temperature</span>
        <span class="tag-chip"><i style="background:#8b999f"></i>Temperature Setpoint</span>
        <span class="tag-chip"><i style="background:#119b70"></i>Water Level</span>
        <span class="tag-chip"><i style="background:#d68b05"></i>Steam Pressure</span>
      </div>
      <div class="trend-window-bar"><span id="history-visible-label">Visible window</span><span>Drag chart atau navigator untuk menggeser waktu</span></div>
      <div class="chart-container tall interactive-chart"><canvas id="trends-chart" class="chart-canvas" tabindex="0" aria-label="Historical trend. Geser kiri atau kanan untuk menelusuri waktu."></canvas><div class="drag-hint">↔ Drag to explore</div></div>
      <div class="trend-navigator" id="trend-navigator" role="slider" tabindex="0" aria-label="Posisi waktu historical" aria-valuemin="0" aria-valuemax="100">
        <div class="navigator-track"><div class="navigator-selection" id="navigator-selection"><span></span><span></span></div></div>
      </div>
    </section>
    <section class="grid-equal">
      ${panel("State Timeline", "Machine state dan recipe step", `
        <div class="utility-tree">
          <div class="utility-node"><div class="utility-name"><span>06</span><strong>Filling</strong></div><span class="utility-reading">06:00—06:18</span>${statusPill("running")}</div>
          <div class="utility-node"><div class="utility-name"><span>07</span><strong>Dosing</strong></div><span class="utility-reading">06:18—07:02</span>${statusPill("running")}</div>
          <div class="utility-node"><div class="utility-name"><span>08</span><strong>Heating</strong></div><span class="utility-reading">07:02—09:24</span>${statusPill("running")}</div>
          <div class="utility-node"><div class="utility-name"><span>09</span><strong>Holding</strong></div><span class="utility-reading">09:24—Now</span>${statusPill("running")}</div>
        </div>
      `)}
      ${panel("Events in Range", "Alarm dan perubahan penting pada chart", eventTable([
        ["07:22:18", "Utility", "Steam pressure dipped to 7.4 bar", "Warning"],
        ["08:10:42", "Process", "Heating rate below recipe baseline", "Warning"],
        ["09:24:02", "Recipe", "Holding target reached", "Good"],
        ["10:24:11", "Quality", "Temperature stability window passed", "Good"],
      ]))}
    </section>
  `;
}

function healthPage() {
  const tagRows = [
    ["JF-03.WINCH_03.TANGLE_LIMIT", "Jetflow 03 / Winch 3", "Good", "10:42:18.420", "12 ms"],
    ["DR-03.CH_05.TEMP_ACT", "Dryer 03 / Chamber 05", "Good", "10:42:18.401", "18 ms"],
    ["UTL.MDP_B.POWER_KW", "MDP-B / Power Meter", "Stale", "10:41:56.102", "22 sec"],
    ["CL-B02.OF_OUT_U4.SPEED", "Calator Bianco 02", "Good", "10:42:18.387", "24 ms"],
    ["KL-03.FABRIC_WIDTH.ACT", "Kalender 03 / Width", "Good", "10:42:18.372", "29 ms"],
  ];
  return `
    ${pageHead("health", `<button class="button">Run health check</button><button class="button primary">Download report</button>`)}
    <section class="kpi-grid">
      ${kpi("Good Data", "99.42", "%", "GD", "<strong>247,158 tags</strong>healthy", "success")}
      ${kpi("Stale Tags", "184", "tags", "ST", "<strong class='danger'>+46</strong>since 10:40", "warning")}
      ${kpi("Bad / No Data", "62", "tags", "BD", "<strong>0.02%</strong>of active tags", "danger")}
      ${kpi("Collector Latency", "24", "ms", "LT", "<strong>p95 118ms</strong>· normal", "success")}
    </section>
    <section class="grid-2">
      ${panel("Connector Health", "Gateway, protocol, latency, dan data availability", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Gateway</th><th>Source</th><th>Protocol</th><th>Status</th><th>Latency</th><th>Tags</th><th>Availability</th></tr></thead><tbody>${connectors.map((r) => `<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><span class="data-pill ${r[3] === "Online" ? "good" : "warning"}">${r[3]}</span></td><td class="mono">${r[4]}</td><td class="mono">${r[5]}</td><td class="mono">${r[6]}</td></tr>`).join("")}</tbody></table></div>`)}
      ${panel("Data Quality Distribution", "Good, stale, uncertain, bad, dan no-data", `
        <div class="ring-wrap">
          <div class="ring" style="--value:99.4;--ring-color:#119b70"><div class="ring-copy"><strong>99.4%</strong><small>Good data</small></div></div>
          <div class="ring-stats">
            <div class="ring-stat"><span>Good</span><strong>247,158</strong></div>
            <div class="ring-stat"><span>Stale</span><strong>184</strong></div>
            <div class="ring-stat"><span>Uncertain</span><strong>1,196</strong></div>
            <div class="ring-stat"><span>Bad / No data</span><strong>62</strong></div>
          </div>
        </div>
      `)}
    </section>
    ${panel("Tag Health Inspector", "Nilai tanpa kualitas baik tidak dianggap valid oleh dashboard", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Tag</th><th>Asset</th><th>Quality</th><th>Last Update</th><th>Age</th></tr></thead><tbody>${tagRows.map((r) => `<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td><span class="quality-pill ${r[2].toLowerCase()}">${r[2]}</span></td><td class="mono">${r[3]}</td><td class="mono">${r[4]}</td></tr>`).join("")}</tbody></table></div>`)}
    <section class="grid-equal">
      ${panel("Ingestion Rate", "Samples per second dan processing latency", `<div class="chart-container compact"><canvas id="health-chart" class="chart-canvas"></canvas></div>`)}
      ${panel("System Services", "Collector, historian, API, dan alarm engine", equipmentGrid([
        ["Edge Collectors", "5 / 5 healthy", "Running"], ["Real-time Stream", "48.2K msg/s", "Running"],
        ["Historian", "24 ms write latency", "Running"], ["Alarm Engine", "12 ms evaluation", "Running"],
        ["Dashboard API", "p95 86 ms", "Running"], ["Backup Service", "Last backup 02:00", "Ready"]
      ]))}
    </section>
  `;
}

function renderPage({ preserveScroll = false } = {}) {
  const previousScroll = Number.isFinite(window.scrollY) ? window.scrollY : 0;
  const content = document.getElementById("page-content");
  const renderers = {
    overview: overviewPage,
    jetflow: jetflowPage,
    calator: calatorPage,
    dryer: dryerPage,
    kalender: kalenderPage,
    utilities: utilitiesPage,
    chemical: chemicalPage,
    alarms: alarmsPage,
    trends: trendsPage,
    health: healthPage,
  };
  content.innerHTML = (renderers[state.page] || overviewPage)();
  document.getElementById("breadcrumb-page").textContent = pageMeta[state.page][0];
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.page === state.page));
  bindPageEvents();
  requestAnimationFrame(() => {
    initPageCharts();
    window.scrollTo({ top: preserveScroll ? previousScroll : 0, behavior: preserveScroll ? "auto" : "smooth" });
  });
}

function normalizeBatchNumber(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 32);
}

function loadBatchInvestigation(type, machineId, rawBatch) {
  const batch = normalizeBatchNumber(rawBatch);
  if (!batch) {
    showToast("Batch number required", "Masukkan nomor batch sebelum memuat trend dan abnormality log.");
    document.querySelector(`[data-batch-input="${type}"]`)?.focus();
    return;
  }
  state.batchInvestigation[type] = { machineId, batch };
  showToast("Batch historian loaded", `${machineId} · ${batch}`);
  renderPage({ preserveScroll: true });
}

function bindPageEvents() {
  document.querySelectorAll("[data-page-target]").forEach((el) => {
    el.addEventListener("click", () => navigate(el.dataset.pageTarget));
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") navigate(el.dataset.pageTarget);
    });
  });
  document.querySelectorAll("[data-machine-select]").forEach((select) => {
    select.addEventListener("change", () => {
      state.selected[select.dataset.machineSelect] = select.value;
      if (state.drill[select.dataset.machineSelect]) state.drill[select.dataset.machineSelect].machine = select.value;
      renderPage();
    });
  });
  document.querySelectorAll("[data-batch-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const [type, machineId] = form.dataset.batchForm.split("|");
      loadBatchInvestigation(type, machineId, form.querySelector("[data-batch-input]")?.value);
    });
  });
  document.querySelectorAll("[data-batch-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      const [type, machineId, batch] = button.dataset.batchSuggestion.split("|");
      loadBatchInvestigation(type, machineId, batch);
    });
  });
  document.querySelectorAll("[data-batch-clear]").forEach((button) => {
    button.addEventListener("click", () => {
      const [type] = button.dataset.batchClear.split("|");
      state.batchInvestigation[type] = { machineId: null, batch: null };
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-area-target]").forEach((card) => {
    const openArea = () => {
      const [type, area] = card.dataset.areaTarget.split("|");
      state.drill[type] = { area, machine: null };
      renderPage();
    };
    card.addEventListener("click", openArea);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openArea(); }
    });
  });
  document.querySelectorAll("[data-machine-target]").forEach((card) => {
    const openMachine = () => {
      const [type, machine] = card.dataset.machineTarget.split("|");
      const target = fleetFor(type).find((item) => item.id === machine);
      state.selected[type] = machine;
      state.drill[type] = { area: target?.area || state.drill[type].area, machine };
      renderPage();
    };
    card.addEventListener("click", openMachine);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openMachine(); }
    });
  });
  document.querySelectorAll("[data-management-metric]").forEach((button) => {
    button.addEventListener("click", () => {
      const [type, metric] = button.dataset.managementMetric.split("|");
      state.management.metric[type] = metric;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-resource-area]").forEach((button) => {
    const openResourceArea = () => {
      const [type, area, metric] = button.dataset.resourceArea.split("|");
      state.management.metric[type] = metric;
      state.management.area[type] = area;
      renderPage({ preserveScroll: true });
    };
    button.addEventListener("click", openResourceArea);
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openResourceArea(); }
    });
  });
  document.querySelectorAll("[data-ranking-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      state.management.area[button.dataset.rankingReset] = null;
      renderPage({ preserveScroll: true });
    });
  });
  document.getElementById("electrical-level-select")?.addEventListener("change", (event) => {
    state.utility.electricalLevel = event.target.value;
    state.utility.selectedElectrical = electricalDistribution[event.target.value][0].id;
    renderPage({ preserveScroll: true });
  });
  document.getElementById("electrical-asset-select")?.addEventListener("change", (event) => {
    state.utility.selectedElectrical = event.target.value;
    renderPage({ preserveScroll: true });
  });
  document.querySelectorAll("[data-electrical-asset]").forEach((button) => {
    button.addEventListener("click", () => {
      state.utility.selectedElectrical = button.dataset.electricalAsset;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-process-level]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.processType;
      if (button.dataset.processLevel === "overview") state.drill[type] = { area: null, machine: null };
      else state.drill[type].machine = null;
      renderPage();
    });
  });
  document.querySelectorAll("[data-range]").forEach((button) => {
    button.addEventListener("click", () => {
      state.range = button.dataset.range;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-sensor-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const [type, key] = checkbox.dataset.sensorToggle.split("|");
      const enabled = state.sensorTrend.enabled[type];
      if (checkbox.checked && !enabled.includes(key)) enabled.push(key);
      if (!checkbox.checked) state.sensorTrend.enabled[type] = enabled.filter((item) => item !== key);
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-sensor-bulk]").forEach((button) => {
    button.addEventListener("click", () => {
      const [type, action] = button.dataset.sensorBulk.split("|");
      state.sensorTrend.enabled[type] = action === "on" ? sensorTrendConfig[type].map((sensor) => sensor.key) : [];
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-sensor-range]").forEach((button) => {
    button.addEventListener("click", () => {
      state.sensorTrend.range = button.dataset.sensorRange;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-history-range]").forEach((button) => {
    button.addEventListener("click", () => selectHistoryRange(button.dataset.historyRange));
  });
  const applyHistory = document.getElementById("apply-history-range");
  if (applyHistory) applyHistory.addEventListener("click", applyCustomHistoryRange);
  document.getElementById("trend-zoom-in")?.addEventListener("click", () => zoomHistoricalTrend(0.68));
  document.getElementById("trend-zoom-out")?.addEventListener("click", () => zoomHistoricalTrend(1.45));
  document.getElementById("trend-fit")?.addEventListener("click", fitHistoricalTrend);
  if (state.page === "trends") bindHistoricalPan();
  document.querySelectorAll("[data-ack-id]").forEach((button) => {
    button.addEventListener("click", () => acknowledgeAlarm(Number(button.dataset.ackId)));
  });
  const ackAll = document.getElementById("ack-all");
  if (ackAll) ackAll.addEventListener("click", acknowledgeAll);
  const alarmSearch = document.getElementById("alarm-search");
  const alarmSeverity = document.getElementById("alarm-severity");
  if (alarmSearch) alarmSearch.addEventListener("input", filterAlarms);
  if (alarmSeverity) alarmSeverity.addEventListener("change", filterAlarms);
  const fleetSearch = document.getElementById("fleet-search");
  const fleetState = document.getElementById("fleet-state-filter");
  if (fleetSearch) fleetSearch.addEventListener("input", filterFleetMachines);
  if (fleetState) fleetState.addEventListener("change", filterFleetMachines);
}

function navigate(page) {
  if (state.drill[page]) state.drill[page] = { area: null, machine: null };
  state.page = page;
  renderPage();
  closeSidebar();
}

function filterFleetMachines() {
  const query = (document.getElementById("fleet-search")?.value || "").trim().toLowerCase();
  const machineState = document.getElementById("fleet-state-filter")?.value || "all";
  let visible = 0;
  document.querySelectorAll("[data-machine-search]").forEach((card) => {
    const matchesSearch = card.dataset.machineSearch.includes(query);
    const matchesState = machineState === "all" || card.dataset.machineState === machineState;
    const show = matchesSearch && matchesState;
    card.classList.toggle("hidden", !show);
    if (show) visible += 1;
  });
  document.getElementById("fleet-empty")?.classList.toggle("hidden", visible > 0);
}

function selectHistoryRange(range) {
  if (range === "CUSTOM") {
    state.history.preset = "CUSTOM";
    document.querySelectorAll("[data-history-range]").forEach((button) => button.classList.toggle("active", button.dataset.historyRange === "CUSTOM"));
    document.getElementById("custom-range-row")?.classList.remove("hidden");
    document.getElementById("history-start")?.focus();
    return;
  }
  const durationMap = { "1H": 1, "8H": 8, "24H": 24, "7D": 24 * 7, "30D": 24 * 30 };
  const end = Date.now();
  state.history.preset = range;
  state.history.end = end;
  state.history.start = end - durationMap[range] * 60 * 60 * 1000;
  resetHistoricalViewport();
  renderPage({ preserveScroll: true });
}

function applyCustomHistoryRange() {
  const startValue = document.getElementById("history-start")?.value;
  const endValue = document.getElementById("history-end")?.value;
  const start = new Date(startValue).getTime();
  const end = new Date(endValue).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    showToast("Range belum lengkap", "Pilih start date dan end date terlebih dahulu.");
    return;
  }
  if (start >= end) {
    showToast("Range tidak valid", "End date harus lebih besar dari start date.");
    return;
  }
  state.history.preset = "CUSTOM";
  state.history.start = start;
  state.history.end = end;
  resetHistoricalViewport();
  renderPage({ preserveScroll: true });
}

function resetHistoricalViewport() {
  state.history.viewFraction = 0.28;
  state.history.viewStart = 1 - state.history.viewFraction;
}

function fitHistoricalTrend() {
  state.history.viewStart = 0;
  state.history.viewFraction = 1;
  drawHistoricalTrend();
}

function zoomHistoricalTrend(multiplier) {
  const oldFraction = state.history.viewFraction;
  const center = state.history.viewStart + oldFraction / 2;
  const nextFraction = clamp(oldFraction * multiplier, 0.05, 1);
  state.history.viewFraction = nextFraction;
  state.history.viewStart = clamp(center - nextFraction / 2, 0, 1 - nextFraction);
  drawHistoricalTrend();
}

function acknowledgeAlarm(id) {
  const alarm = alarms.find((item) => item.id === id);
  if (!alarm) return;
  alarm.ack = true;
  updateAlarmCounts();
  showToast("Alarm acknowledged", `${alarm.source} · ${alarm.title}`);
  renderPage();
}

function acknowledgeAll() {
  alarms.forEach((alarm) => { alarm.ack = true; });
  updateAlarmCounts();
  showToast("Visible alarms acknowledged", "Acknowledgement tercatat pada sesi demo.");
  renderPage();
}

function filterAlarms() {
  const query = (document.getElementById("alarm-search")?.value || "").toLowerCase();
  const severity = document.getElementById("alarm-severity")?.value || "all";
  const list = document.getElementById("alarm-page-list");
  if (!list) return;
  const filtered = alarms.filter((a) => {
    const matchQuery = [a.title, a.detail, a.source].join(" ").toLowerCase().includes(query);
    const matchSeverity = severity === "all" || a.severity === severity;
    return matchQuery && matchSeverity;
  });
  list.innerHTML = filtered.length ? filtered.map(alarmRow).join("") : `<div class="empty-state"><strong>Tidak ada alarm</strong><span>Ubah filter atau kata pencarian.</span></div>`;
  list.querySelectorAll("[data-ack-id]").forEach((button) => button.addEventListener("click", () => acknowledgeAlarm(Number(button.dataset.ackId))));
}

function updateAlarmCounts() {
  const count = alarms.filter((a) => !a.ack).length;
  document.getElementById("nav-alarm-count").textContent = count;
  document.getElementById("header-alarm-count").textContent = count;
}

function showToast(title, detail) {
  const root = document.getElementById("toast-root");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong>${detail}`;
  root.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function initPageCharts() {
  const labels = Array.from({ length: 32 }, (_, i) => i);
  const charts = {
    overview: () => {
      const productionOutput = productionOutputDataset();
      drawBarChart(
        "overview-chart",
        productionOutput.values,
        productionOutput.labels,
        productionOutput.values.map(() => "#078eaa"),
        { showValues: true, standard: true, unit: "m" }
      );
    },
    jetflow: () => drawLineChart("jetflow-chart", [
      { data: wave(32, 78, 4, .55, .2), color: "#078eaa", fill: true },
      { data: wave(32, 79, .4, .5, 0), color: "#8b999f", dash: true },
      { data: wave(32, 70, 1.8, .08, 1.2), color: "#119b70" },
    ], labels),
    calator: () => drawLineChart("calator-chart", [
      { data: wave(32, 29.1, .25, .008, .2), color: "#078eaa", fill: true },
      { data: wave(32, 28.8, .18, .008, 1.5), color: "#4d8fd0" },
      { data: wave(32, 27.5, .12, .003, 2.4), color: "#d68b05" },
    ], labels),
    dryer: () => drawLineChart("dryer-chart", [
      { data: wave(32, 146, 2.4, .1, .3), color: "#078eaa", fill: true },
      { data: wave(32, 148, .25, .05, 0), color: "#8b999f", dash: true },
      { data: wave(32, 140, 3.1, .12, 1.8), color: "#d68b05" },
    ], labels),
    kalender: () => drawLineChart("kalender-chart", [
      { data: wave(32, 126, 1.2, .03, .3), color: "#078eaa", fill: true },
      { data: wave(32, 123, 1.0, .03, 1.5), color: "#4d8fd0" },
      { data: wave(32, 118, .7, .01, 2.2), color: "#119b70" },
    ], labels),
    utilities: () => {
      drawLineChart("utility-chart", [
        { data: wave(32, 1.58, .12, .014, .2), color: "#078eaa", fill: true },
        { data: wave(32, 1.75, .02, .009, 0), color: "#d68b05", dash: true },
      ], labels);
      drawElectricalDistributionChart();
    },
    chemical: () => drawBarChart(
      "chemical-chart",
      chemicals.map((chemical) => chemical[2]),
      chemicals.map((chemical) => chemical[0]),
      chemicals.map((chemical) => chemical[4]),
      { showValues: true, standard: true, unit: "kg" }
    ),
    alarms: () => drawBarChart("alarm-chart", [18, 12, 9, 7, 5, 4], ["Tangle", "Temp", "Speed", "Steam", "Data", "Drive"], ["#d9485c", "#d68b05", "#d68b05", "#d68b05", "#8b999f", "#8b999f"]),
    trends: drawHistoricalTrend,
    health: () => drawLineChart("health-chart", [
      { data: wave(32, 46, 2.2, .06, .2), color: "#078eaa", fill: true },
      { data: wave(32, 23, 3.4, .02, 1.8), color: "#119b70" },
    ], labels),
  };
  charts[state.page]?.();
  if (state.drill[state.page]?.machine && sensorTrendConfig[state.page]) drawSensorComparisonTrends(state.page);
}

function drawSensorComparisonTrends(type) {
  const machine = fleetFor(type).find((item) => item.id === state.selected[type]);
  const selectedBatch = machine ? selectedBatchFor(type, machine) : null;
  if (!selectedBatch) return;
  const enabled = state.sensorTrend.enabled[type] || [];
  sensorTrendConfig[type].filter((sensor) => enabled.includes(sensor.key)).forEach((sensor) => {
    const series = sensorTrendSeries(type, sensor, selectedBatch);
    drawLineChart(`sensor-trend-${type}-${sensor.key}`, [
      { data: series.pv, color: sensor.color, fill: true },
      { data: series.sv, color: sensor.color, dash: true },
    ], series.timestamps, {
      labelFormatter: (timestamp) => new Date(timestamp).toLocaleTimeString("id-ID", state.sensorTrend.range === "24H"
        ? { day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }
        : { hour: "2-digit", minute: "2-digit", hour12: false }),
    });
  });
}

function wave(length, start, amplitude, trend = 0, phase = 0) {
  return Array.from({ length }, (_, i) => start + Math.sin(i * .42 + phase) * amplitude + Math.cos(i * .17 + phase) * amplitude * .28 + i * trend);
}

function drawLineChart(id, series, labels, options = {}) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * ratio);
  canvas.height = Math.max(1, rect.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  const width = rect.width;
  const height = rect.height;
  const pad = { top: 18, right: 12, bottom: 25, left: 42 };
  const all = series.flatMap((s) => s.data);
  let min = Math.min(...all);
  let max = Math.max(...all);
  const spread = max - min || 1;
  min -= spread * .14;
  max += spread * .14;
  ctx.clearRect(0, 0, width, height);
  ctx.font = "9px DM Mono, monospace";
  ctx.fillStyle = "#8b999f";
  ctx.strokeStyle = "rgba(19,46,57,.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = pad.top + ((height - pad.top - pad.bottom) / 4) * i;
    ctx.beginPath();
    ctx.setLineDash([3, 5]);
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
    const value = max - ((max - min) / 4) * i;
    ctx.fillText(formatAxis(value), 2, y + 3);
  }
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const xAt = (i, len) => pad.left + (i / Math.max(1, len - 1)) * plotW;
  const yAt = (value) => pad.top + (1 - (value - min) / (max - min)) * plotH;
  series.forEach((line) => {
    ctx.beginPath();
    ctx.lineWidth = line.dash ? 1.4 : 2;
    ctx.strokeStyle = line.color;
    ctx.setLineDash(line.dash ? [6, 6] : []);
    line.data.forEach((value, i) => {
      const x = xAt(i, line.data.length);
      const y = yAt(value);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    if (line.fill) {
      ctx.lineTo(xAt(line.data.length - 1, line.data.length), height - pad.bottom);
      ctx.lineTo(pad.left, height - pad.bottom);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
      gradient.addColorStop(0, line.color + "26");
      gradient.addColorStop(1, line.color + "00");
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  });
  const tickCount = Math.min(6, labels.length);
  for (let i = 0; i < tickCount; i += 1) {
    const idx = Math.round((labels.length - 1) * i / (tickCount - 1));
    const x = xAt(idx, labels.length);
    ctx.fillStyle = "#8b999f";
    ctx.textAlign = i === 0 ? "left" : i === tickCount - 1 ? "right" : "center";
    const label = options.labelFormatter ? options.labelFormatter(labels[idx], idx, labels) : timeLabel(idx, labels.length);
    ctx.fillText(label, x, height - 5);
  }
  ctx.textAlign = "left";
}

function drawBarChart(id, data, labels, colors, options = {}) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * ratio);
  canvas.height = Math.max(1, rect.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  const width = rect.width;
  const height = rect.height;
  const pad = options.standard
    ? { top: 30, right: 14, bottom: 34, left: 54 }
    : { top: 15, right: 10, bottom: 28, left: 35 };
  const rawMax = Math.max(...data);
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(1, rawMax)));
  const max = options.standard ? Math.ceil(rawMax / magnitude) * magnitude : rawMax * 1.16;
  ctx.clearRect(0, 0, width, height);
  ctx.font = "9px DM Mono, monospace";
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const gap = plotW / data.length;
  const barW = options.standard ? gap * .76 : Math.min(42, gap * .58);
  const labelStep = gap < 31 ? 2 : 1;
  const gridLines = options.standard ? 5 : 4;
  for (let i = 0; i < gridLines; i += 1) {
    const y = pad.top + plotH / (gridLines - 1) * i;
    ctx.strokeStyle = "rgba(19,46,57,.08)";
    ctx.setLineDash(options.standard && i === gridLines - 1 ? [] : [3, 5]);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
    if (options.standard) {
      const axisValue = max - max / (gridLines - 1) * i;
      ctx.fillStyle = "#8b999f";
      ctx.textAlign = "right";
      ctx.fillText(axisValue === 0 ? "0" : formatAxis(axisValue), pad.left - 8, y + 3);
    }
  }
  if (options.standard && options.unit) {
    ctx.fillStyle = "#8b999f";
    ctx.textAlign = "left";
    ctx.fillText(options.unit, 3, 12);
  }
  data.forEach((value, i) => {
    const h = value / max * plotH;
    const x = pad.left + gap * i + (gap - barW) / 2;
    const y = pad.top + plotH - h;
    ctx.fillStyle = colors[i] || "#078eaa";
    if (options.standard) ctx.fillRect(x, y, barW, h);
    else {
      roundedRect(ctx, x, y, barW, h, 5);
      ctx.fill();
    }
    if (options.showValues) {
      ctx.fillStyle = "#53666e";
      ctx.font = "9px DM Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(formatAxis(value), x + barW / 2, Math.max(22, y - 6));
    }
    if (i % labelStep === 0 || i === data.length - 1) {
      ctx.fillStyle = "#8b999f";
      ctx.textAlign = "center";
      ctx.fillText(labels[i], x + barW / 2, height - 7);
    }
  });
  ctx.textAlign = "left";
}

function drawElectricalDistributionChart() {
  const canvas = document.getElementById("electrical-pie-chart");
  if (!canvas) return;
  const assets = electricalDistribution[state.utility.electricalLevel];
  const total = assets.reduce((sum, asset) => sum + asset.demand, 0);
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * ratio);
  canvas.height = Math.max(1, rect.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const radius = Math.max(10, Math.min(rect.width, rect.height) / 2 - 12);
  let start = -Math.PI / 2;
  const slices = [];
  ctx.clearRect(0, 0, rect.width, rect.height);
  assets.forEach((asset, index) => {
    const end = start + asset.demand / total * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = electricalColors[index];
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = asset.id === state.utility.selectedElectrical ? 4 : 2;
    ctx.stroke();
    slices.push({ start, end, asset });
    start = end;
  });
  const assetAtPointer = (event) => {
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    if (Math.hypot(x, y) > Math.min(bounds.width, bounds.height) / 2 - 8) return null;
    let angle = Math.atan2(y, x);
    if (angle < -Math.PI / 2) angle += Math.PI * 2;
    return slices.find((slice) => angle >= slice.start && angle < slice.end)?.asset || null;
  };
  canvas._electricalAssetAtPointer = assetAtPointer;
  if (canvas.dataset.electricalBound) return;
  canvas.dataset.electricalBound = "true";
  canvas.addEventListener("pointermove", (event) => {
    const asset = canvas._electricalAssetAtPointer(event);
    canvas.style.cursor = asset ? "pointer" : "default";
    canvas.title = asset ? `${asset.name}: ${asset.demand} kW` : "";
  });
  canvas.addEventListener("click", (event) => {
    const asset = canvas._electricalAssetAtPointer(event);
    if (!asset) return;
    state.utility.selectedElectrical = asset.id;
    renderPage({ preserveScroll: true });
  });
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function formatAxis(value) {
  if (Math.abs(value) >= 1000) return (value / 1000).toFixed(1) + "K";
  if (Math.abs(value) < 10) return value.toFixed(1);
  return Math.round(value).toString();
}

function timeLabel(index, length) {
  const start = 6 * 60;
  const minutes = start + Math.round(index / Math.max(1, length - 1) * 8 * 60);
  return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function historicalDataset() {
  const count = 720;
  const span = state.history.end - state.history.start;
  const timestamps = Array.from({ length: count }, (_, index) => state.history.start + span * index / (count - 1));
  const values = timestamps.map((timestamp, index) => {
    const cycle = timestamp / 3600000;
    const step = Math.floor(index / 90) % 2;
    return {
      temperature: 90 + Math.sin(cycle * 1.7) * 3.8 + Math.cos(index * .09) * 1.2 + step * 1.7,
      setpoint: 91.5 + Math.sin(cycle * .42) * .45 + step * 1.35,
      level: 70 + Math.sin(cycle * 1.08 + 1.4) * 2.2 + Math.cos(index * .045) * .7,
      steam: 66 + Math.sin(cycle * 2.1 + 2.2) * 1.5 + Math.cos(index * .15) * .5,
    };
  });
  return { timestamps, values };
}

function drawHistoricalTrend() {
  const canvas = document.getElementById("trends-chart");
  if (!canvas) return;
  const { timestamps, values } = historicalDataset();
  const visibleCount = Math.max(24, Math.round(timestamps.length * state.history.viewFraction));
  const maxStartIndex = Math.max(0, timestamps.length - visibleCount);
  const startIndex = Math.min(maxStartIndex, Math.round(state.history.viewStart * (timestamps.length - 1)));
  const endIndex = Math.min(timestamps.length, startIndex + visibleCount);
  const visibleTimestamps = timestamps.slice(startIndex, endIndex);
  const visibleValues = values.slice(startIndex, endIndex);
  const visibleSpan = visibleTimestamps.at(-1) - visibleTimestamps[0];
  drawLineChart("trends-chart", [
    { data: visibleValues.map((item) => item.temperature), color: "#078eaa", fill: true },
    { data: visibleValues.map((item) => item.setpoint), color: "#8b999f", dash: true },
    { data: visibleValues.map((item) => item.level), color: "#119b70" },
    { data: visibleValues.map((item) => item.steam), color: "#d68b05" },
  ], visibleTimestamps, { labelFormatter: (timestamp) => historicalAxisLabel(timestamp, visibleSpan) });
  updateHistoricalViewportUI(visibleTimestamps[0], visibleTimestamps.at(-1));
}

function historicalAxisLabel(timestamp, visibleSpan) {
  const date = new Date(timestamp);
  if (visibleSpan <= 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  if (visibleSpan <= 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function updateHistoricalViewportUI(visibleStart, visibleEnd) {
  const summary = document.getElementById("history-range-summary");
  if (summary) summary.textContent = `JF-02 · ${formatDateTime(state.history.start)} — ${formatDateTime(state.history.end)} WIB`;
  const visibleLabel = document.getElementById("history-visible-label");
  if (visibleLabel) visibleLabel.textContent = `Visible: ${formatDateTime(visibleStart, true)} — ${formatDateTime(visibleEnd, true)} WIB`;
  const selection = document.getElementById("navigator-selection");
  if (selection) {
    selection.style.left = `${state.history.viewStart * 100}%`;
    selection.style.width = `${state.history.viewFraction * 100}%`;
  }
  const navigator = document.getElementById("trend-navigator");
  if (navigator) {
    const range = 1 - state.history.viewFraction;
    navigator.setAttribute("aria-valuenow", range ? Math.round(state.history.viewStart / range * 100) : "0");
    navigator.setAttribute("aria-valuetext", `${formatDateTime(visibleStart, true)} sampai ${formatDateTime(visibleEnd, true)}`);
  }
}

function shiftHistoricalTrend(delta) {
  state.history.viewStart = clamp(state.history.viewStart + delta, 0, 1 - state.history.viewFraction);
  drawHistoricalTrend();
}

function handleHistoricalKey(event) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  const direction = event.key === "ArrowLeft" ? -1 : 1;
  shiftHistoricalTrend(direction * state.history.viewFraction * .12);
}

function bindHistoricalPan() {
  const canvas = document.getElementById("trends-chart");
  const navigator = document.getElementById("trend-navigator");
  const selection = document.getElementById("navigator-selection");
  if (!canvas || !navigator || !selection) return;

  let canvasPointer = null;
  let canvasOriginX = 0;
  let canvasOriginStart = 0;
  canvas.addEventListener("pointerdown", (event) => {
    canvasPointer = event.pointerId;
    canvasOriginX = event.clientX;
    canvasOriginStart = state.history.viewStart;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (canvasPointer !== event.pointerId) return;
    const width = Math.max(1, canvas.getBoundingClientRect().width);
    const delta = (event.clientX - canvasOriginX) / width * state.history.viewFraction;
    state.history.viewStart = clamp(canvasOriginStart - delta, 0, 1 - state.history.viewFraction);
    drawHistoricalTrend();
  });
  const stopCanvasDrag = (event) => {
    if (canvasPointer !== event.pointerId) return;
    canvasPointer = null;
    canvas.classList.remove("dragging");
  };
  canvas.addEventListener("pointerup", stopCanvasDrag);
  canvas.addEventListener("pointercancel", stopCanvasDrag);
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const direction = Math.sign(event.deltaX || event.deltaY);
    shiftHistoricalTrend(direction * state.history.viewFraction * .08);
  }, { passive: false });
  canvas.addEventListener("keydown", handleHistoricalKey);

  let navigatorPointer = null;
  let navigatorOriginX = 0;
  let navigatorOriginStart = 0;
  navigator.addEventListener("pointerdown", (event) => {
    const rect = navigator.getBoundingClientRect();
    if (!event.target.closest(".navigator-selection")) {
      const next = (event.clientX - rect.left) / Math.max(1, rect.width) - state.history.viewFraction / 2;
      state.history.viewStart = clamp(next, 0, 1 - state.history.viewFraction);
      drawHistoricalTrend();
    }
    navigatorPointer = event.pointerId;
    navigatorOriginX = event.clientX;
    navigatorOriginStart = state.history.viewStart;
    navigator.setPointerCapture(event.pointerId);
    navigator.classList.add("dragging");
  });
  navigator.addEventListener("pointermove", (event) => {
    if (navigatorPointer !== event.pointerId) return;
    const width = Math.max(1, navigator.getBoundingClientRect().width);
    state.history.viewStart = clamp(navigatorOriginStart + (event.clientX - navigatorOriginX) / width, 0, 1 - state.history.viewFraction);
    drawHistoricalTrend();
  });
  const stopNavigatorDrag = (event) => {
    if (navigatorPointer !== event.pointerId) return;
    navigatorPointer = null;
    navigator.classList.remove("dragging");
  };
  navigator.addEventListener("pointerup", stopNavigatorDrag);
  navigator.addEventListener("pointercancel", stopNavigatorDrag);
  navigator.addEventListener("keydown", handleHistoricalKey);
}

function updateLiveNumbers() {
  document.querySelectorAll("[data-live]").forEach((el) => {
    const base = Number(el.dataset.value);
    const variance = Number(el.dataset.variance || .1);
    const decimals = Number(el.dataset.decimals || 1);
    const next = base + (Math.random() - .5) * variance * 2;
    el.textContent = next.toFixed(decimals);
  });
}

function updateClock() {
  const now = new Date();
  document.getElementById("header-clock").textContent = now.toLocaleTimeString("id-ID", { hour12: false });
}

function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
}

document.getElementById("main-nav").addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (button) navigate(button.dataset.page);
});
document.getElementById("alarm-shortcut").addEventListener("click", () => navigate("alarms"));
document.getElementById("menu-button").addEventListener("click", openSidebar);
document.getElementById("sidebar-close").addEventListener("click", closeSidebar);
document.getElementById("sidebar-backdrop").addEventListener("click", closeSidebar);
window.addEventListener("resize", () => requestAnimationFrame(initPageCharts));

updateAlarmCounts();
updateClock();
renderPage();
window.setInterval(updateClock, 1000);
window.setInterval(updateLiveNumbers, 1800);
