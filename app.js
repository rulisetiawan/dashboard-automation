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
    machinePowerType: "jetflow",
    selectedPowerArea: "LA",
    selectedPowerMachine: "JF-LA-01",
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
  jetflowProgram: {
    enabled: [],
  },
  chemicalLog: {
    range: "24H",
    customStart: Date.now() - 24 * 60 * 60 * 1000,
    customEnd: Date.now(),
    variant: "all",
    mode: "all",
    status: "all",
    calator: "all",
  },
  motorDrive: {
    selected: null,
    source: null,
    range: "8H",
    metric: "amp",
    viewStart: .72,
    viewFraction: .28,
  },
  batchInvestigation: {
    jetflow: { machineId: null, batch: null },
    calator: { machineId: null, batch: null },
    dryer: { machineId: null, batch: null },
    kalender: { machineId: null, batch: null },
    chemical: { machineId: null, batch: null },
  },
  alarms: {
    area: "all",
  },
};

const backendConnection = {
  status: "connecting",
  dataMode: "LOCAL_DEMO",
  storage: null,
  lastSync: null,
};

let backendUtilities = [];

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

const jetflowProcessSteps = [
  "Filling",
  "Drain",
  "Rinse Cooling",
  "Check PH",
  "Temperature Control",
  "Inject DT 1",
  "Inject DT 2",
  "Dosing DT 1",
  "Dosing DT 2",
  "Load",
  "Unload",
  "ST To MT Filling",
];

state.jetflowProgram.enabled = [...jetflowProcessSteps];

// Durasi ini adalah template recipe untuk demonstrasi historian. Pada integrasi PLC/MES,
// nilai ini akan diganti dengan timestamp aktual setiap process step pada batch.
const jetflowProcessDurations = [12, 8, 16, 7, 24, 9, 9, 14, 14, 18, 12, 11];

function jetflowProgramSchedule() {
  const total = jetflowProcessDurations.reduce((sum, duration) => sum + duration, 0);
  let cursor = 0;
  return jetflowProcessSteps.map((name, index) => {
    const start = cursor / total;
    cursor += jetflowProcessDurations[index];
    return { name, step: index + 1, start, end: cursor / total };
  });
}

function jetflowProgramForSensor(sensor) {
  const schedule = jetflowProgramSchedule();
  const phase = (name) => schedule.find((item) => item.name === name);
  const profiles = {
    main_temp: {
      initial: 28,
      phases: ["Temperature Control", "Rinse Cooling"],
      stages: [
        ["Temperature Control", .10, 60],
        ["Temperature Control", .42, 80],
        ["Temperature Control", .72, 93],
        ["Rinse Cooling", .18, 45],
      ],
    },
    water_level: {
      initial: 12,
      phases: ["Filling", "Drain", "ST To MT Filling"],
      stages: [["Filling", .54, 72], ["Drain", .20, 18], ["ST To MT Filling", .38, 55]],
    },
    flow_meter: {
      initial: 0,
      phases: ["Filling", "Drain", "ST To MT Filling"],
      stages: [["Filling", .30, 125], ["Drain", .22, 78], ["ST To MT Filling", .38, 110]],
    },
    dosing_temp_1: {
      initial: 30,
      phases: ["Inject DT 1", "Dosing DT 1"],
      stages: [["Inject DT 1", .30, 42], ["Dosing DT 1", .42, 58]],
    },
    dosing_temp_2: {
      initial: 28,
      phases: ["Inject DT 2", "Dosing DT 2"],
      stages: [["Inject DT 2", .30, 38], ["Dosing DT 2", .42, 43]],
    },
    dosing_level: {
      initial: 82,
      phases: ["Inject DT 1", "Dosing DT 1", "Inject DT 2", "Dosing DT 2"],
      stages: [["Inject DT 1", .25, 72], ["Dosing DT 1", .58, 65], ["Inject DT 2", .28, 48], ["Dosing DT 2", .55, 34]],
    },
  };
  const profile = profiles[sensor.key] || { initial: sensor.sv * .5, phases: [], stages: [] };
  const markers = profile.stages.map(([process, offset, value]) => {
    const step = phase(process);
    return {
      process,
      step: step.step,
      position: step.start + (step.end - step.start) * offset,
      value,
    };
  }).sort((a, b) => a.position - b.position);
  return {
    initial: profile.initial,
    phases: profile.phases.map((name) => phase(name)),
    markers,
  };
}

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
    if (type === "jetflow") return { ...base, winches: 2 + ((index + areaIndex) % 7), recipe: active ? ["NAVY-R12", "BLACK-R08", "OLIVE-R03"][index % 3] : "—", step: jetflowProcessSteps[(index + areaIndex * 3) % jetflowProcessSteps.length] };
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
  { id: 1, severity: "critical", title: "Tangle limit aktif", detail: "Limit tangle Winch 3 terdeteksi selama 18 detik.", source: "JF-LB-08 · Winch 3", area: "Jetflow · Lane B", time: "10:38:42", ack: false },
  { id: 2, severity: "critical", title: "Chamber 05 under-temperature", detail: "Temperatur aktual 134.2°C, target 148.0°C.", source: "DR-BLK-02 · Chamber 05", area: "Dryer · Belakang", time: "10:36:18", ack: false },
  { id: 3, severity: "warning", title: "Overfeed Out imbalance", detail: "Spread channel atas-bawah melewati tolerance 4.2%.", source: "CL-BLK-02 · Overfeed Out", area: "Calator · Belakang", time: "10:31:09", ack: false },
  { id: 4, severity: "warning", title: "Steam header pressure low", detail: "Tekanan header berada di bawah baseline heating.", source: "Utility · Steam Header A", area: "Utilities", time: "10:24:51", ack: false },
  { id: 5, severity: "warning", title: "Fabric width approaching limit", detail: "Lebar aktual 179.1 cm, target 181.0 cm.", source: "KL-TMR-05 · Width Sensor", area: "Kalender · Timur", time: "10:17:33", ack: true },
];

const downtimeRecords = [
  { area: "Jetflow · Lane B", process: "jetflow", machineId: "JF-LB-08", equipment: "Main Pump", reason: "Pump overload & tangle recovery", events: 4, minutes: 126, unplanned: 116, last: "10:38" },
  { area: "Calator · Belakang", process: "calator", machineId: "CL-BLK-02", equipment: "Overfeed Out", reason: "Overfeed imbalance", events: 5, minutes: 94, unplanned: 88, last: "10:31" },
  { area: "Dryer · Belakang", process: "dryer", machineId: "DR-BLK-02", equipment: "Chamber 05", reason: "Under-temperature", events: 3, minutes: 82, unplanned: 76, last: "10:36" },
  { area: "Kalender · Timur", process: "kalender", machineId: "KL-TMR-05", equipment: "Upper Felt", reason: "Loadcell deviation", events: 3, minutes: 61, unplanned: 55, last: "10:17" },
  { area: "Jetflow · Lane D", process: "jetflow", machineId: "JF-LD-11", equipment: "Winch 2", reason: "Drive overcurrent", events: 3, minutes: 54, unplanned: 49, last: "09:54" },
  { area: "Calator · Timur", process: "calator", machineId: "CL-TMR-04", equipment: "Dancing Roller", reason: "Fabric tension recovery", events: 4, minutes: 47, unplanned: 42, last: "09:12" },
  { area: "Utilities", process: "utilities", machineId: "STEAM-HDR-A", equipment: "Steam Header A", reason: "Low steam pressure", events: 2, minutes: 39, unplanned: 36, last: "10:24" },
  { area: "Kalender · Belakang", process: "kalender", machineId: "KL-BLK-03", equipment: "Lower Felt", reason: "Felt tracking correction", events: 2, minutes: 32, unplanned: 24, last: "08:48" },
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

const chemicalDispensingLogs = [
  { hoursAgo: .3, time: "15 Aug · 10:42", request: "REQ-CL-260815-041", calator: "CL-DPN-01", code: "CH-02", variant: "Softener B", target: "126.0 kg", actual: "126.2 kg", mode: "Automatic", status: "Completed", operator: "Auto PLC", stage: "Weighing 2 / 2" },
  { hoursAgo: .8, time: "15 Aug · 10:11", request: "REQ-CL-260815-040", calator: "CL-BLK-04", code: "CH-01", variant: "Softener A", target: "184.0 kg", actual: "183.7 kg", mode: "Automatic", status: "Completed", operator: "Auto PLC", stage: "Weighing 1 / 1" },
  { hoursAgo: 1.2, time: "15 Aug · 09:47", request: "REQ-CL-260815-039", calator: "CL-TMR-03", code: "CH-05", variant: "Fixing Agent", target: "74.0 kg", actual: "74.0 kg", mode: "Manual", status: "Completed", operator: "A. Raka", stage: "Manual verified" },
  { hoursAgo: 1.8, time: "15 Aug · 09:12", request: "REQ-CL-260815-038", calator: "CL-BLK-02", code: "CH-03", variant: "Washing Agent", target: "112.0 kg", actual: "109.6 kg", mode: "Automatic", status: "Hold", operator: "Auto PLC", stage: "Weighing 2 / 3" },
  { hoursAgo: 2.4, time: "15 Aug · 08:36", request: "REQ-CL-260815-037", calator: "CL-DPN-02", code: "CH-04", variant: "Anti-static", target: "48.0 kg", actual: "48.1 kg", mode: "Manual", status: "Completed", operator: "S. Deni", stage: "Manual verified" },
  { hoursAgo: 3.1, time: "15 Aug · 07:54", request: "REQ-CL-260815-036", calator: "CL-TMR-06", code: "CH-06", variant: "Neutralizer", target: "62.0 kg", actual: "—", mode: "Automatic", status: "Weighing", operator: "Auto PLC", stage: "Weighing 1 / 2" },
  { hoursAgo: 4.3, time: "15 Aug · 06:42", request: "REQ-CL-260815-035", calator: "CL-BLK-07", code: "CH-07", variant: "Special Finish", target: "38.0 kg", actual: "38.2 kg", mode: "Manual", status: "Completed", operator: "N. Ilham", stage: "Manual verified" },
  { hoursAgo: 6.8, time: "15 Aug · 04:14", request: "REQ-CL-260815-034", calator: "CL-TMR-01", code: "CH-02", variant: "Softener B", target: "118.0 kg", actual: "117.6 kg", mode: "Automatic", status: "Completed", operator: "Auto PLC", stage: "Weighing 2 / 2" },
  { hoursAgo: 9.2, time: "15 Aug · 01:48", request: "REQ-CL-260815-033", calator: "CL-BLK-09", code: "CH-01", variant: "Softener A", target: "168.0 kg", actual: "167.9 kg", mode: "Automatic", status: "Completed", operator: "Auto PLC", stage: "Weighing 1 / 1" },
  { hoursAgo: 13.4, time: "14 Aug · 21:36", request: "REQ-CL-260814-106", calator: "CL-DPN-01", code: "CH-03", variant: "Washing Agent", target: "104.0 kg", actual: "100.4 kg", mode: "Manual", status: "Hold", operator: "A. Raka", stage: "Manual re-weigh" },
  { hoursAgo: 18.6, time: "14 Aug · 16:24", request: "REQ-CL-260814-105", calator: "CL-TMR-04", code: "CH-05", variant: "Fixing Agent", target: "71.0 kg", actual: "71.3 kg", mode: "Automatic", status: "Completed", operator: "Auto PLC", stage: "Weighing 1 / 1" },
  { hoursAgo: 28.2, time: "14 Aug · 06:47", request: "REQ-CL-260814-097", calator: "CL-BLK-03", code: "CH-06", variant: "Neutralizer", target: "58.0 kg", actual: "57.7 kg", mode: "Automatic", status: "Completed", operator: "Auto PLC", stage: "Weighing 2 / 2" },
];

function backendTimeLabel(value) {
  return new Date(value).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).replace(",", " ·");
}

function updateBackendIndicator() {
  const indicator = document.querySelector(".system-health");
  if (!indicator) return;
  const title = indicator.querySelector("strong");
  const detail = indicator.querySelector("small");
  if (!title || !detail) return;
  if (backendConnection.status === "connected") {
    title.textContent = "Backend non-Jetflow online";
    detail.textContent = `${backendConnection.storage || "D1"} · ${backendConnection.dataMode === "SIMULATED_SEED" ? "DEMO SEED / TAG MAPPING PENDING" : "TELEMETRY CONNECTED"}`;
  } else if (backendConnection.status === "fallback") {
    title.textContent = "Demo fallback active";
    detail.textContent = "Backend tidak tersedia · data simulasi lokal";
  }
}

function utilityValue(code, fallback) {
  return backendUtilities.find((item) => item.utility_code === code)?.value ?? fallback;
}

function hydrateChemicalTransactions(rows) {
  const now = Date.now();
  chemicalDispensingLogs.splice(0, chemicalDispensingLogs.length, ...rows.map((item) => ({
    hoursAgo: Math.max(0, (now - new Date(item.occurred_at).getTime()) / 3600000),
    time: backendTimeLabel(item.occurred_at),
    request: item.request_code,
    calator: item.calator_id,
    code: item.chemical_code,
    variant: item.chemical_name,
    target: `${Number(item.target_kg).toFixed(1)} kg`,
    actual: item.actual_kg == null ? "—" : `${Number(item.actual_kg).toFixed(1)} kg`,
    mode: item.mode,
    status: item.status,
    operator: item.operator_name || "—",
    stage: item.stage || "—",
  })));
}

async function connectNonJetflowBackend() {
  try {
    const statusResponse = await fetch("/api/v1/integration/status", { cache: "no-store" });
    if (!statusResponse.ok) throw new Error("Backend not ready");
    const status = await statusResponse.json();
    const processes = ["calator", "dryer", "kalender", "chemical"];
    const responses = await Promise.all(processes.map(async (process) => {
      const response = await fetch(`/api/v1/assets?process=${process}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Asset API ${process} unavailable`);
      return [process, await response.json()];
    }));
    const chemicalResponse = await fetch("/api/v1/dispensing/transactions", { cache: "no-store" });
    const utilityResponse = await fetch("/api/v1/utilities/snapshot", { cache: "no-store" });
    if (!chemicalResponse.ok || !utilityResponse.ok) throw new Error("Operational API unavailable");
    const targetFleet = { calator: calators, dryer: dryers, kalender: kalenders, chemical: dispensers };
    responses.forEach(([process, payload]) => targetFleet[process].splice(0, targetFleet[process].length, ...payload.assets));
    hydrateChemicalTransactions((await chemicalResponse.json()).transactions);
    backendUtilities = (await utilityResponse.json()).utilities;
    backendConnection.status = "connected";
    backendConnection.storage = status.storage;
    backendConnection.dataMode = status.data_mode;
    backendConnection.lastSync = status.server_time;
  } catch {
    backendConnection.status = "fallback";
  }
  updateBackendIndicator();
  renderPage({ preserveScroll: true });
}

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
        <div class="hero-meta-item"><span>Last update</span><strong>${machine.sourceTs ? backendTimeLabel(machine.sourceTs) : "NOW · 18ms"}</strong></div>
      </div>
    </section>
  `;
}

function chemicalDispensingPidPanel(machine) {
  const destinations = dispensingSupportedCalators(machine);
  const destinationYs = destinations.map((_, index) => 350 + index * 62);
  const diagramHeight = Math.max(610, 310 + destinations.length * 62);
  const valve = (x, y, label, flow = "inlet") => `<g class="pid-valve pid-${flow}"><title>${label} · open</title><path d="M ${x - 13} ${y} L ${x} ${y - 13} L ${x + 13} ${y} L ${x} ${y + 13} Z"/><circle cx="${x}" cy="${y}" r="3"/><text x="${x}" y="${y - 22}" text-anchor="middle">${label}</text></g>`;
  const inletLeft = [0, 1, 2, 3].map((index) => {
    const y = 170 + index * 36;
    return `<g><line class="pid-pipe" x1="105" y1="${y}" x2="420" y2="${y}"/>${valve(300, y, `XV-10${index + 1}`)}<text class="pid-source-label" x="116" y="${y - 9}">INLET ${index + 1}</text></g>`;
  }).join("");
  const inletRight = [0, 1, 2, 3].map((index) => {
    const y = 170 + index * 36;
    return `<g><line class="pid-pipe" x1="610" y1="${y}" x2="925" y2="${y}"/>${valve(730, y, `XV-10${index + 5}`)}<text class="pid-source-label" x="908" y="${y - 9}" text-anchor="end">INLET ${index + 5}</text></g>`;
  }).join("");
  const branches = destinations.map((calator, index) => {
    const y = destinationYs[index];
    return `<g class="pid-destination"><line class="pid-pipe pid-discharge" x1="715" y1="${y}" x2="805" y2="${y}"/><circle cx="715" cy="${y}" r="4"/><rect x="805" y="${y - 22}" width="245" height="44" rx="8"/><text class="pid-destination-id" x="824" y="${y - 2}">${calator.id}</text><text class="pid-destination-name" x="824" y="${y + 14}">${calator.name}</text></g>`;
  }).join("");
  return `<section class="card pid-card">
    <div class="pid-head"><div><span class="eyebrow">P&amp;ID CONCEPT</span><h2>Chemical Dispensing Flow · ${machine.id}</h2><p>Diagram proses read-only: delapan inlet menuju Tank 1, transfer ke Tank 2, lalu distribusi ke Calator area ${machine.areaLabel}.</p></div><div class="pid-legend"><span><i class="pid-legend-valve"></i>Valve open</span><span><i class="pid-legend-line"></i>Process line</span></div></div>
    <div class="pid-scroll" tabindex="0" aria-label="P and ID chemical dispensing ${machine.id}">
      <svg class="chemical-dispensing-pid" viewBox="0 0 1120 ${diagramHeight}" role="img" aria-label="P and ID dispensing chemical: 8 valve ke Tank 1, loadcell, valve transfer, Tank 2, dan distribusi ke Calator">
        <defs><linearGradient id="pidTankFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#d8f2ed"/><stop offset="100%" stop-color="#eff8f6"/></linearGradient><marker id="pidArrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#078eaa"/></marker></defs>
        <text class="pid-section-label" x="104" y="112">CHEMICAL SUPPLY INLETS</text>
        ${inletLeft}${inletRight}
        <g class="pid-tank"><ellipse cx="515" cy="160" rx="95" ry="20"/><path d="M420 160 V303 C420 331 610 331 610 303 V160"/><ellipse cx="515" cy="303" rx="95" ry="20"/><rect x="431" y="239" width="168" height="61" rx="0"/><text class="pid-tank-title" x="515" y="226">TANK 1</text><text class="pid-tank-sub" x="515" y="247">WEIGHING / BUFFER TANK</text><text class="pid-tank-value" x="515" y="281">Level 68.4%</text></g>
        <g class="pid-loadcells"><text x="515" y="362" text-anchor="middle">LOADCELL · LC-101 / LC-102 / LC-103</text><path d="M450 327 L464 350 H436 Z"/><path d="M515 327 L529 350 H501 Z"/><path d="M580 327 L594 350 H566 Z"/><line class="pid-pipe thin" x1="448" y1="353" x2="582" y2="353"/></g>
        <g><line class="pid-pipe pid-transfer-line" x1="515" y1="323" x2="515" y2="420" marker-end="url(#pidArrow)"/>${valve(515, 382, "XV-201", "transfer")}<text class="pid-flow-label" x="535" y="391">TRANSFER TO TANK 2</text></g>
        <g class="pid-tank pid-tank-2"><ellipse cx="515" cy="432" rx="88" ry="18"/><path d="M427 432 V535 C427 559 603 559 603 535 V432"/><ellipse cx="515" cy="535" rx="88" ry="18"/><rect x="438" y="486" width="154" height="46" rx="0"/><text class="pid-tank-title" x="515" y="471">TANK 2</text><text class="pid-tank-sub" x="515" y="490">DISTRIBUTION TANK</text><text class="pid-tank-value" x="515" y="517">Ready to dose</text></g>
        <g><line class="pid-pipe pid-discharge" x1="603" y1="484" x2="715" y2="484" marker-end="url(#pidArrow)"/><line class="pid-pipe pid-discharge" x1="715" y1="${destinationYs[0]}" x2="715" y2="${destinationYs[destinationYs.length - 1]}"/><text class="pid-section-label" x="804" y="315">CALATOR DESTINATIONS</text>${branches}</g>
      </svg>
    </div>
    <div class="pid-foot"><span><strong>8</strong> inlet valve · <strong>1</strong> transfer valve · <strong>${destinations.length}</strong> Calator destination</span><small>Konsep visual; tag, interlock, valve state, dan route aktual harus diverifikasi dari P&amp;ID/SOP engineering.</small></div>
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
    { key: "load_upper", label: "Loadcell Upper", tag: "LOAD_UPPER", unit: "kg", sv: 480, variance: 24, decimals: 1, color: "#8267c7" },
    { key: "load_lower", label: "Loadcell Lower", tag: "LOAD_LOWER", unit: "kg", sv: 475, variance: 24, decimals: 1, color: "#d68b05" },
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
    <div class="batch-investigation-header">
      <div class="batch-investigation-copy"><span class="eyebrow">Batch historian lookup</span><h2>Search Production Batch</h2><p>Masukkan nomor batch untuk memuat trend sensor SV/PV dan abnormality log khusus batch tersebut.</p></div>
      <form class="batch-search-form" data-batch-form="${type}|${machine.id}">
        <label for="batch-search-${type}">Batch number</label>
        <div class="batch-search-row"><input class="search-control batch-search-input" id="batch-search-${type}" data-batch-input="${type}" value="${selectedBatch || ""}" placeholder="Contoh: DB-260814-032" autocomplete="off" maxlength="32"/><button class="button primary" type="submit">Search batch</button>${selectedBatch ? `<button class="button ghost" type="button" data-batch-clear="${type}|${machine.id}">Clear</button>` : ""}</div>
      </form>
    </div>
    <div class="batch-recent-head"><span>Recent batches</span><small>${recentBatches.length} records · scroll untuk melihat lainnya</small></div>
    <div class="batch-recent-table-wrap" tabindex="0" aria-label="Recent batch history ${machine.id}">
      <table class="batch-recent-table"><thead><tr><th>Batch No.</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr></thead><tbody>${recentBatches.map((item) => {
        const tone = item.status === "Completed" ? "good" : item.status === "Hold" ? "warning" : "neutral";
        const isSelected = selectedBatch === item.batch;
        return `<tr class="${isSelected ? "selected" : ""}"><td class="mono"><strong>${item.batch}</strong></td><td class="mono">${item.start}</td><td class="mono">${item.end}</td><td><span class="data-pill ${tone}">${item.status}</span></td><td><button class="batch-load-button ${isSelected ? "loaded" : ""}" type="button" data-batch-suggestion="${type}|${machine.id}|${item.batch}" ${isSelected ? "disabled" : ""}>${isSelected ? "Loaded" : "Load"}</button></td></tr>`;
      }).join("")}</tbody></table>
      </div>
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
  if (type === "jetflow") {
    const program = jetflowProgramForSensor(sensor);
    const sv = timestamps.map((_, index) => {
      const position = index / Math.max(1, count - 1);
      return program.markers.reduce((target, marker) => position >= marker.position ? marker.value : target, program.initial);
    });
    let actual = program.initial - sensor.variance * .18;
    const pv = sv.map((target, index) => {
      const response = index === 0 ? .14 : .2;
      actual += (target - actual) * response;
      actual += Math.sin(index * .54 + keyPhase) * sensor.variance * .08 + Math.cos(index * .21 + keyPhase) * sensor.variance * .035;
      return actual;
    });
    return { timestamps, sv, pv };
  }
  const sv = timestamps.map((_, index) => sensor.sv + (index > count * 0.68 ? sensor.variance * 0.08 : 0));
  const pv = sv.map((target, index) => target + Math.sin(index * 0.44 + typePhase + keyPhase) * sensor.variance * 0.52 + Math.cos(index * 0.17 + keyPhase) * sensor.variance * 0.18);
  return { timestamps, sv, pv };
}

function programTimeLabel(timestamp) {
  return new Date(timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function jetflowTrendProgramOverlay(sensor, series) {
  const program = jetflowProgramForSensor(sensor);
  const enabledProcesses = state.jetflowProgram.enabled;
  const selectedPhases = jetflowProgramSchedule().filter((phase) => enabledProcesses.includes(phase.name));
  const selectedMarkers = program.markers.filter((marker) => enabledProcesses.includes(marker.process));
  const timeAt = (position) => series.timestamps[Math.round(position * (series.timestamps.length - 1))];
  const phases = selectedPhases.map((phase) => `<span class="jetflow-program-phase"><b>Step ${String(phase.step).padStart(2, "0")}</b><strong>${phase.name}</strong><small>${programTimeLabel(timeAt(phase.start))}–${programTimeLabel(timeAt(phase.end))}</small></span>`).join("");
  const markers = selectedMarkers.map((marker) => `<span class="jetflow-sv-marker"><b>${programTimeLabel(timeAt(marker.position))}</b><strong>SV → ${marker.value.toFixed(sensor.decimals)} ${sensor.unit}</strong><small>Step ${String(marker.step).padStart(2, "0")} · ${marker.process}</small></span>`).join("");
  return `<div class="jetflow-program-overlay" aria-label="Program proses dan perubahan SV untuk ${sensor.label}">
    <div class="jetflow-overlay-heading"><span>Selected program overlay</span><small>Process yang dicentang tampil pada seluruh trend sensor.</small></div>
    <div class="jetflow-program-phases">${phases || `<span class="jetflow-overlay-empty">Tidak ada process dipilih.</span>`}</div>
    <div class="jetflow-sv-markers">${markers || `<span class="jetflow-overlay-empty">Tidak ada perubahan SV pada sensor ini di process terpilih.</span>`}</div>
  </div>`;
}

function sensorTrendPanel(type, machine) {
  const sensors = sensorTrendConfig[type] || [];
  const enabled = state.sensorTrend.enabled[type] || [];
  const selectedBatch = selectedBatchFor(type, machine);
  const toggles = sensors.map((sensor) => `<label class="sensor-toggle ${enabled.includes(sensor.key) ? "active" : ""}"><input type="checkbox" data-sensor-toggle="${type}|${sensor.key}" ${enabled.includes(sensor.key) ? "checked" : ""}/><i style="--sensor-color:${sensor.color}"></i><span>${sensor.label}<small>${sensor.tag}</small></span></label>`).join("");
  const processToggles = type === "jetflow" ? jetflowProcessSteps.map((process, index) => `<label class="process-toggle ${state.jetflowProgram.enabled.includes(process) ? "active" : ""}"><input type="checkbox" data-jetflow-process-toggle="${process}" ${state.jetflowProgram.enabled.includes(process) ? "checked" : ""}/><span>Step ${String(index + 1).padStart(2, "0")}</span><strong>${process}</strong></label>`).join("") : "";
  const rows = sensors.filter((sensor) => enabled.includes(sensor.key)).map((sensor) => {
    const series = sensorTrendSeries(type, sensor, selectedBatch);
    const pv = series.pv.at(-1);
    const sv = series.sv.at(-1);
    const delta = pv - sv;
    const programOverlay = type === "jetflow" ? jetflowTrendProgramOverlay(sensor, series) : "";
    return `<article class="sensor-trend-row">
      <div class="sensor-trend-row-head"><div><i style="background:${sensor.color}"></i><span><strong>${sensor.label}</strong><small>${sensor.tag} · ${sensor.unit}</small></span></div><div class="sensor-trend-readings"><span>PV<strong>${pv.toFixed(sensor.decimals)} ${sensor.unit}</strong></span><span>SV<strong>${sv.toFixed(sensor.decimals)} ${sensor.unit}</strong></span><span>Δ<strong class="${Math.abs(delta) > sensor.variance * .55 ? "warning" : ""}">${delta >= 0 ? "+" : ""}${delta.toFixed(sensor.decimals)} ${sensor.unit}</strong></span></div></div>
      <div class="sensor-line-legend"><span><i style="background:${sensor.color}"></i>PV · Process Value</span><span><i style="border-color:${sensor.color}"></i>SV · Set Value</span></div>
      ${programOverlay}
      <canvas class="sensor-trend-canvas" id="sensor-trend-${type}-${sensor.key}" aria-label="Trend PV dan SV ${sensor.label}"></canvas>
    </article>`;
  }).join("");
  const ranges = ["1H", "8H", "24H"].map((range) => `<button class="segment ${state.sensorTrend.range === range ? "active" : ""}" data-sensor-range="${range}">${range}</button>`).join("");
  return `<section class="card sensor-comparison-panel">
    <div class="sensor-comparison-head"><div><span class="eyebrow">Machine sensor historian</span><h2>Sensor SV / PV Comparison</h2><p>${machine.id} · batch ${selectedBatch} · setiap sensor menggunakan skala engineering unit masing-masing.</p></div><div class="sensor-comparison-actions"><span class="data-pill neutral">${selectedBatch}</span><div class="sensor-line-key"><span><i></i>PV solid</span><span><i></i>SV dashed</span></div><div class="segmented">${ranges}</div></div></div>
    <div class="sensor-toggle-toolbar"><div class="sensor-toggle-list">${toggles}</div><div class="sensor-bulk-actions"><button class="button ghost small" data-sensor-bulk="${type}|on">All On</button><button class="button ghost small" data-sensor-bulk="${type}|off">All Off</button></div></div>
    ${type === "jetflow" ? `<div class="process-filter-toolbar"><div class="process-filter-head"><div><strong>Process program filter</strong><small>Pilih process yang ingin ditampilkan pada semua trend sensor.</small></div><div class="sensor-bulk-actions"><button class="button ghost small" data-jetflow-process-bulk="on">All On</button><button class="button ghost small" data-jetflow-process-bulk="off">All Off</button></div></div><div class="process-toggle-list">${processToggles}</div></div>` : ""}
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
      completedBatches: 4,
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
      completedBatches: 31,
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
      completedBatches: 88,
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
      completedBatches: 612,
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

function overviewMachineRecords() {
  return Object.keys(processConfig).filter((type) => type !== "chemical").flatMap((type) => fleetFor(type).map((machine) => {
    const seed = [...machine.id].reduce((total, character) => total + character.charCodeAt(0), 0);
    const condition = machine.state === "running" ? "running"
      : machine.state === "warning" ? "problem"
        : machine.state === "fault" ? "fault"
          : seed % 3 === 0 ? "maintenance" : "stopped";
    return { ...machine, type, condition, operating: machine.state === "running" || machine.state === "warning" };
  }));
}

function overviewConditionPill(condition) {
  const labels = { running: "Running", problem: "Problem", fault: "Fault", maintenance: "Maintenance", stopped: "Stopped" };
  const tones = { running: "good", problem: "warning", fault: "danger", maintenance: "neutral", stopped: "neutral" };
  return `<span class="data-pill ${tones[condition]}">${labels[condition]}</span>`;
}

function overviewMachineStatusTable(records, emptyLabel) {
  if (!records.length) return `<div class="empty-state"><strong>${emptyLabel}</strong><span>Tidak ada mesin pada kategori ini.</span></div>`;
  return `<div class="overview-machine-table-wrap"><table class="overview-machine-table"><thead><tr><th>Machine</th><th>Process</th><th>Area / Lane</th><th>Batch</th><th>Condition</th></tr></thead><tbody>${records.map((machine) => `<tr data-machine-target="${machine.type}|${machine.id}" tabindex="0"><td><strong>${machine.id}</strong><small>${machine.name}</small></td><td>${processConfig[machine.type].singular}</td><td>${machine.areaLabel}</td><td class="mono">${machine.batch}</td><td>${overviewConditionPill(machine.condition)}</td></tr>`).join("")}</tbody></table></div>`;
}

function plantManagementSummary(productionOutput, records) {
  const operating = records.filter((machine) => machine.operating);
  const normalRunning = records.filter((machine) => machine.condition === "running").length;
  const problems = records.filter((machine) => machine.condition === "problem").length;
  const faults = records.filter((machine) => machine.condition === "fault").length;
  const maintenance = records.filter((machine) => machine.condition === "maintenance").length;
  const stopped = records.filter((machine) => machine.condition === "stopped").length;
  const attention = records.length - normalRunning;
  const activeBatches = new Set(operating.filter((machine) => machine.batch !== "—").map((machine) => machine.batch)).size;
  const rangeHours = { "1H": 1, "8H": 8, "24H": 24, "7D": 168 }[state.range] || 8;
  const steamConsumption = rangeHours * 11.8;
  const thermalOilConsumption = rangeHours * 105.2;
  return `
    <div class="plant-summary-head"><div><span class="eyebrow">Plant management summary</span><h2>Plant Operations Summary</h2><p>Status live operasi serta ringkasan output, konsumsi, dan completed batch berdasarkan selected time range.</p></div><div class="plant-summary-actions"><span class="quality-pill good">Simulated data</span>${rangeButtons()}</div></div>
    <section class="plant-answer-grid">
      <article class="card plant-answer-card live-answer"><div class="plant-answer-top"><span class="kpi-scope live">LIVE NOW</span><span>01</span></div><h3>Machine Operating Status</h3><div class="plant-answer-value"><strong>${operating.length}</strong><small>/ ${records.length} mesin</small></div><div class="plant-answer-breakdown"><span>${normalRunning} normal</span><span class="warning">${problems} dengan warning</span></div><p>Daftar lengkap tersedia tepat di bawah.</p></article>
      <article class="card plant-answer-card danger-answer"><div class="plant-answer-top"><span class="kpi-scope live">LIVE NOW</span><span>02</span></div><h3>Machine Attention Status</h3><div class="plant-answer-value"><strong>${attention}</strong><small>perlu diketahui</small></div><div class="plant-answer-breakdown compact"><span>${stopped} stop</span><span>${maintenance} maintenance</span><span class="warning">${problems} problem</span><span class="danger">${faults} fault</span></div><p>Warning dapat terjadi saat mesin masih running.</p></article>
      <article class="card plant-answer-card"><div class="plant-answer-top"><span class="kpi-scope historical">SELECTED RANGE</span><span>03</span></div><h3>Total Production Output</h3><div class="plant-answer-value"><strong>${formatProductionOutput(productionOutput.total)}</strong><small>m good fabric</small></div><div class="plant-answer-breakdown"><span>Avg ${formatProductionOutput(productionOutput.average)} m / ${productionOutput.interval}</span><span>Peak ${formatProductionOutput(productionOutput.peak)} m</span></div><p>${state.range} · ${productionOutput.scope}</p></article>
      <article class="card plant-answer-card utility-live-answer"><div class="plant-answer-top"><span class="kpi-scope live">LIVE NOW</span><span>04</span></div><h3>Current Utility Usage</h3><div class="plant-answer-value"><strong>3</strong><small>normal · 1 watch</small></div><div class="plant-utility-mini"><span><b>${liveValue(1.84, "MW", .02, 2)}</b>Electrical</span><span><b>${liveValue(184, "m³/h", 1, 0)}</b>Water</span><span class="warning"><b>${liveValue(12.8, "t/h", .09, 1)}</b>Steam · 7.8 bar</span><span><b>${liveValue(218.4, "°C", .2, 1)}</b>Thermal oil</span></div></article>
      <article class="card plant-answer-card utility-total-answer"><div class="plant-answer-top"><span class="kpi-scope historical">SELECTED RANGE</span><span>05</span></div><h3>Total Utility Consumption</h3><div class="plant-utility-total-grid"><span><b>${formatManagementValue(productionOutput.energy, "MWh")} MWh</b>Electrical energy</span><span><b>${formatProductionOutput(productionOutput.water)} m³</b>Water</span><span><b>${formatManagementValue(steamConsumption, "ton")} ton</b>Steam</span><span><b>${formatManagementValue(thermalOilConsumption, "GJ")} GJ</b>Thermal oil</span></div><p>${state.range} · seluruh total mengikuti periode yang sama.</p></article>
      <article class="card plant-answer-card live-answer"><div class="plant-answer-top"><span class="kpi-scope live">LIVE NOW</span><span>06</span></div><h3>Batches In Process</h3><div class="plant-answer-value"><strong>${activeBatches}</strong><small>batch aktif</small></div><div class="plant-answer-breakdown"><span>${operating.length} active process runs</span></div><p>Dihitung sebagai batch number unik pada mesin aktif.</p></article>
      <article class="card plant-answer-card"><div class="plant-answer-top"><span class="kpi-scope historical">SELECTED RANGE</span><span>07</span></div><h3>Completed Batches</h3><div class="plant-answer-value"><strong>${productionOutput.completedBatches}</strong><small>batch selesai</small></div><div class="plant-answer-breakdown"><span>${state.range} · ${productionOutput.scope}</span></div><p>Completion mengikuti boundary batch historian.</p></article>
    </section>
  `;
}

function overviewPage() {
  const alarmItems = alarms.filter((a) => !a.ack).slice(0, 3).map(alarmRow).join("");
  const productionOutput = productionOutputDataset();
  const machineRecords = overviewMachineRecords();
  const operatingMachines = machineRecords.filter((machine) => machine.operating).sort((a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id));
  const attentionPriority = { fault: 0, problem: 1, maintenance: 2, stopped: 3 };
  const attentionMachines = machineRecords.filter((machine) => machine.condition !== "running").sort((a, b) => attentionPriority[a.condition] - attentionPriority[b.condition] || a.id.localeCompare(b.id));
  return `
    ${pageHead("overview", `<button class="button" data-page-target="health">⊕ Data health</button><button class="button primary" data-page-target="trends">⌗ Open trends</button>`)}
    ${plantManagementSummary(productionOutput, machineRecords)}
    <section class="overview-machine-directory">
      ${panel("Mesin Running Sekarang", `${operatingMachines.length} mesin operating · termasuk mesin running dengan warning`, overviewMachineStatusTable(operatingMachines, "Tidak ada mesin running"), `<span class="data-pill good">LIVE NOW</span>`)}
      ${panel("Stop / Maintenance / Problem", `${attentionMachines.length} mesin memerlukan status awareness`, overviewMachineStatusTable(attentionMachines, "Tidak ada exception mesin"), `<span class="data-pill warning">LIVE NOW</span>`)}
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
    currentUtility: { label: "Active Process Stages", value: jetflowProcessSteps.length, unit: "stages" },
    output: { label: "Completed Batches", unit: "batch", rate: 0.12 },
    metrics: {
      water: { label: "Total Water Consumption", short: "Water", unit: "m³", rate: 2.45 },
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
      ${managementKpi("live", managementConfig[type].currentUtility.label, type === "jetflow" ? managementConfig[type].currentUtility.value : liveValue(managementConfig[type].currentUtility.value, "", managementConfig[type].currentUtility.value * .008, managementConfig[type].currentUtility.value < 10 ? 2 : 1), managementConfig[type].currentUtility.unit, type === "jetflow" ? "Configured Jetflow production sequence" : "Current process demand", "")}
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
  if (type === "jetflow") return `${machine.step} · ${machine.winches} winches`;
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
  const motors = processMotorAssets("jetflow", machine);
  const selectedMotor = state.motorDrive.source === "jetflow" ? motors.find((motor) => motor.id === state.motorDrive.selected) : null;
  const waterSeed = [...machine.id].reduce((total, character) => total + character.charCodeAt(0), 0);
  const totalWaterConsumption = (118 + waterSeed % 890 / 10).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const processPosition = jetflowProcessSteps.indexOf(machine.step) + 1;
  const currentElapsedMinutes = 5 + waterSeed % 8;
  const completedDuration = jetflowProcessDurations.slice(0, processPosition - 1).reduce((total, duration) => total + duration, 0);
  let sequenceCursor = Date.now() - (completedDuration + currentElapsedMinutes) * 60 * 1000;
  const formatProcessTime = (timestamp) => new Date(timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const processTimeline = jetflowProcessSteps.map((process, index) => {
    if (index > processPosition - 1) return { start: "—", end: "—" };
    const start = formatProcessTime(sequenceCursor);
    if (index === processPosition - 1) return { start, end: "In progress" };
    sequenceCursor += jetflowProcessDurations[index] * 60 * 1000;
    return { start, end: formatProcessTime(sequenceCursor) };
  });
  const winches = motors.filter((motor) => motor.category === "winch");
  return `
    ${processBreadcrumb("jetflow", machine)}
    ${pageHead("jetflow", selector(jetflows.filter((item) => item.area === machine.area), "jetflow"))}
    ${machineHero(machine, "JF", `${machine.winches} winches · ${machine.recipe} · Active step: ${machine.step}`)}
    <section class="kpi-grid">
      ${kpi("Main Tank Temp", liveValue(92.6, "", .18, 1), "°C", "MT", "<strong>Target 93.0°C</strong>· holding")}
      ${kpi("Current Process", `<span class="process-value">${machine.step}</span>`, "", "PR", `<strong>Step ${processPosition}</strong>of ${jetflowProcessSteps.length} process stages`, "success")}
      ${kpi("Total Water Consumption", totalWaterConsumption, "m³", "WA", "<strong>Current batch</strong>· accumulated total")}
      ${kpi("Steam Header", liveValue(7.8, "", .07, 1), "bar", "ST", "<strong class='danger'>Low baseline</strong>· 8.1 bar", "warning")}
    </section>
    ${panel("Jetflow Process Sequence", `Current process · ${machine.step} · step ${processPosition} of ${jetflowProcessSteps.length}`, `<div class="jetflow-sequence-table-wrap" tabindex="0" aria-label="Jetflow process sequence ${machine.id}"><table class="jetflow-sequence-table"><thead><tr><th scope="col">Step</th><th scope="col">Process</th><th scope="col">Start Time</th><th scope="col">End Time</th><th scope="col">Status</th></tr></thead><tbody>${jetflowProcessSteps.map((process, index) => {
      const processState = index === processPosition - 1 ? "active" : index < processPosition - 1 ? "completed" : "upcoming";
      const processLabel = processState === "active" ? "Current" : processState === "completed" ? "Complete" : "Pending";
      const timeline = processTimeline[index];
      return `<tr class="${processState}"><td class="sequence-step-number">${String(index + 1).padStart(2, "0")}</td><td><strong>${process}</strong></td><td class="sequence-time">${timeline.start}</td><td class="sequence-time ${processState === "active" ? "in-progress" : ""}">${timeline.end}</td><td><span class="sequence-state ${processState}">${processLabel}</span></td></tr>`;
    }).join("")}</tbody></table></div>`, `<span class="data-pill neutral">${jetflowProcessSteps.length} STEPS</span>`)}
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
    ${panel(`Dynamic Winch Group · ${machine.winches} units`, "Jumlah winch mengikuti konfigurasi mesin; klik winch untuk analisa motor 3-phase dan tangle context.", `<div class="motor-grid">${winches.map((motor) => motorDrillableCard(motor, "jetflow")).join("")}</div>`)}
    <section class="grid-equal">
      ${motorEquipmentPanel("jetflow", machine, motors.filter((motor) => motor.category !== "winch"), "Driven Equipment")}
      ${panel("Batch Events", "State, dosing, steam, dan alarm timeline", eventTable([
        ["10:38:42", "Alarm", "Winch 3 tangle limit activated", "Warning"],
        ["10:24:11", "Process", "Holding temperature reached", "Good"],
        ["10:02:44", "Utility", "Steam header pressure below baseline", "Warning"],
        ["09:46:08", "Recipe", "Dosing step 04 completed", "Good"],
      ]))}
    </section>
    ${selectedMotor ? motorDriveDetailPanel(selectedMotor) : ""}
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
    ["14 Aug · 10:03:18", "10:05:47", "Loadcell Upper", "480.0 kg", "534.0 kg", "+54.0 kg", 2.5, "Upper/lower pressure imbalance", "Recovered"],
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
  const motors = processMotorAssets("calator", machine);
  const selectedMotor = state.motorDrive.source === "calator" ? motors.find((motor) => motor.id === state.motorDrive.selected) : null;
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
    ${motorEquipmentPanel("calator", machine, motors)}
    ${selectedMotor ? motorDriveDetailPanel(selectedMotor) : ""}
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

function parameterConfigurationRows(rows) {
  return `<div class="parameter-config-wrap" tabindex="0" aria-label="Kalender parameter configuration"><table class="parameter-config-table"><thead><tr><th>Parameter</th><th>Configuration</th><th>Unit</th></tr></thead><tbody>${rows.map((row) => `<tr><td><strong>${row[0]}</strong></td><td class="mono">${row[1]}</td><td>${row[2]}</td></tr>`).join("")}</tbody></table></div>`;
}

function kalenderMotorAssets() {
  return [
    ["KL-MTR-INLET", "Inlet", 28.6, 14.8, 36.0], ["KL-MTR-EXP-L", "Expander L", 24.8, 12.9, 34.0],
    ["KL-MTR-EXP-R", "Expander R", 25.2, 13.1, 34.0], ["KL-MTR-UP-FELT", "Upper Felt", 31.4, 16.2, 42.0],
    ["KL-MTR-LOW-FELT", "Lower Felt", 30.9, 15.9, 42.0], ["KL-MTR-COOL", "Cooling Belt", 18.6, 9.4, 28.0],
    ["KL-MTR-CONVEYOR", "Conveyor Belt", 16.2, 8.1, 25.0], ["KL-MTR-PLAIT", "Plaiter", 27.8, 14.3, 36.0],
    ["KL-MTR-TABLE", "Conveyor Table", 21.6, 11.1, 30.0], ["KL-MTR-UPDOWN", "Up Down Table", 14.8, 7.6, 22.0],
  ].map(([id, name, amps, kw, hz], index) => ({ id, name, amps, kw, hz, voltage: 397 + index % 4 * 2, runtime: 842 + index * 17, pmRuntime: 1000, status: index === 8 ? "warning" : "running" }));
}

function processMotorAssets(type, machine) {
  if (type === "kalender") return kalenderMotorAssets().map((motor) => ({ ...motor, source: type, parentMachine: machine.id, processLabel: "Kalender finishing" }));
  const specs = type === "jetflow"
    ? [
      ...Array.from({ length: machine.winches }, (_, index) => [`WINCH-${String(index + 1).padStart(2, "0")}`, `Winch ${index + 1}`, 21.8 + index * .85, 10.4 + index * .48, 38 + index * .7, "winch"]),
      ["MAIN-PUMP", "Main Pump", 46.2, 24.6, 42.0, "pump"], ["CIRCULATION", "Circulation Pump", 38.7, 19.8, 38.0, "pump"],
      ["DOSING-01", "Dosing Pump 1", 18.4, 7.6, 28.0, "pump"], ["DOSING-02", "Dosing Pump 2", 16.8, 6.9, 27.0, "pump"],
      ["MIXER-01", "Mixer 1", 14.6, 5.3, 22.1, "mixer"], ["MIXER-02", "Mixer 2", 14.2, 5.1, 21.8, "mixer"],
    ]
    : type === "calator"
      ? [["FEED", "Feeding", 28.4, 13.8, 28.4, "line"], ["SQ-01", "Squeezing 1", 24.8, 11.7, 28.1, "line"], ["SQ-02", "Squeezing 2", 25.1, 11.9, 27.9, "line"], ["OF-UP", "Overfeed Upper", 21.7, 9.8, 29.3, "line"], ["OF-LOW", "Overfeed Lower", 21.4, 9.6, 29.0, "line"], ["FOLDER", "Folder", 18.6, 8.2, 27.6, "line"], ["PLAIT", "Plaiter", 27.8, 14.3, 27.4, "line"]]
      : [["MAIN-DRIVE", "Main Drive", 32.4, 17.6, 32.4, "drive"], ...Array.from({ length: machine.chambers }, (_, index) => [`FAN-${String(index + 1).padStart(2, "0")}`, `Chamber Fan ${index + 1}`, 11.4 + index * .55, 4.6 + index * .26, 36 + index * .35, "fan"]), ["EXHAUST", "Exhaust Fan", 19.8, 9.1, 38.0, "fan"], ["COOLING", "Cooling Fan", 13.6, 5.8, 31.0, "fan"]];
  const seed = [...machine.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return specs.map(([code, name, amps, kw, hz, category], index) => ({
    id: `${machine.id}-MTR-${code}`, name, amps, kw, hz, category,
    voltage: 396 + (seed + index * 3) % 7,
    runtime: 760 + (seed % 80) + index * 23,
    pmRuntime: 1000,
    status: type === "jetflow" && name === "Winch 3" && machine.id === "JF-LA-01" ? "warning" : "running",
    source: type,
    parentMachine: machine.id,
    processLabel: type === "jetflow" ? "Jetflow dyeing" : type === "calator" ? "Calator washing" : "Dryer process",
  }));
}

function selectedMotorDriveAsset() {
  const type = state.motorDrive.source;
  if (!type || !state.motorDrive.selected) return null;
  const machine = fleetFor(type).find((item) => item.id === state.selected[type]);
  return machine ? processMotorAssets(type, machine).find((item) => item.id === state.motorDrive.selected) : null;
}

function motorDrillableCard(motor, type) {
  return `<div class="motor-card drillable ${state.motorDrive.selected === motor.id && state.motorDrive.source === type ? "selected" : ""}" data-motor-drive-target="${motor.id}" data-motor-drive-source="${type}" role="button" tabindex="0"><div class="motor-card-head"><strong>${motor.name}</strong><i class="equipment-state ${motor.status === "warning" ? "warning" : ""}"></i></div><div class="card-reading">${motor.hz.toFixed(1)}<small>Hz</small></div><div class="card-caption">${motor.amps.toFixed(1)} A · ${motor.kw.toFixed(1)} kW · ${motor.status === "warning" ? "Check current" : "Running"}</div></div>`;
}

function motorEquipmentPanel(type, machine, motors, title = "Motor & Driven Equipment") {
  return panel(title, "Klik equipment untuk membuka analisa drive 3-phase, historical trend, troubleshooting, dan export log.", `<div class="motor-grid">${motors.map((motor) => motorDrillableCard(motor, type)).join("")}</div>`, `<span class="data-pill neutral">${motors.length} MOTOR</span>`);
}

function motorDriveData(motor) {
  const rangeHours = { "1H": 1, "8H": 8, "24H": 24, "7D": 168 }[state.motorDrive.range] || 8;
  const count = 96;
  const end = Date.now();
  const start = end - rangeHours * 60 * 60 * 1000;
  const phase = motor.name.length * .17;
  const timestamps = Array.from({ length: count }, (_, index) => start + (end - start) * index / (count - 1));
  const values = {
    amp: timestamps.map((_, index) => motor.amps + Math.sin(index * .36 + phase) * motor.amps * .075 + Math.cos(index * .12) * .42),
    voltage: timestamps.map((_, index) => motor.voltage + Math.sin(index * .22 + phase) * 3.6 + Math.cos(index * .13) * 1.4),
    kw: timestamps.map((_, index) => motor.kw + Math.sin(index * .33 + phase) * motor.kw * .09 + Math.cos(index * .18) * .24),
  };
  const config = {
    amp: { label: "RMS Current", unit: "A", color: "#078eaa" },
    voltage: { label: "Voltage", unit: "V", color: "#8267c7" },
    kw: { label: "Active Power", unit: "kW", color: "#d68b05" },
  }[state.motorDrive.metric];
  return { timestamps, values: values[state.motorDrive.metric], ...config };
}

function motorThreePhaseReadings(motor) {
  const seed = [...motor.id].reduce((total, character) => total + character.charCodeAt(0), 0);
  const offsets = [-.018, .013, .005];
  const voltageOffsets = [-.7, .5, .2];
  const phases = ["R", "S", "T"].map((phase, index) => ({
    phase,
    current: motor.amps * (1 + offsets[index]) + (seed % 3) * .04,
    voltage: 229.8 + voltageOffsets[index] + (seed % 2) * .15,
  }));
  const averageCurrent = phases.reduce((sum, item) => sum + item.current, 0) / phases.length;
  const imbalance = Math.max(...phases.map((item) => Math.abs(item.current - averageCurrent))) / averageCurrent * 100;
  return { phases, imbalance };
}

function motorThreePhaseHistoricalData(motor) {
  const rangeHours = { "1H": 1, "8H": 8, "24H": 24, "7D": 168 }[state.motorDrive.range] || 8;
  const count = 96;
  const end = Date.now();
  const start = end - rangeHours * 60 * 60 * 1000;
  const seed = [...motor.id].reduce((total, character) => total + character.charCodeAt(0), 0);
  const timestamps = Array.from({ length: count }, (_, index) => start + (end - start) * index / (count - 1));
  const factors = [-.018, .013, .005];
  const phases = ["R", "S", "T"].map((phase, phaseIndex) => {
    const current = timestamps.map((_, index) => motor.amps * (1 + factors[phaseIndex] + Math.sin(index * .34 + phaseIndex * .85 + seed * .01) * .055 + Math.cos(index * .11 + phaseIndex) * .019));
    const voltage = timestamps.map((_, index) => 229.8 + phaseIndex * .35 + Math.sin(index * .22 + phaseIndex) * 1.65 + Math.cos(index * .07) * .55);
    const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
    const maxIndex = current.indexOf(Math.max(...current));
    const minIndex = current.indexOf(Math.min(...current));
    return {
      phase,
      current,
      voltage,
      currentMin: current[minIndex],
      currentAverage: average(current),
      currentMax: current[maxIndex],
      voltageMin: Math.min(...voltage),
      voltageAverage: average(voltage),
      voltageMax: Math.max(...voltage),
      highTime: timestamps[maxIndex],
      lowTime: timestamps[minIndex],
    };
  });
  const imbalancePoints = timestamps.map((time, index) => {
    const values = phases.map((phase) => phase.current[index]);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return { time, value: Math.max(...values.map((value) => Math.abs(value - average))) / average * 100 };
  });
  const voltageSpreadPoints = timestamps.map((time, index) => {
    const values = phases.map((phase) => phase.voltage[index]);
    return { time, value: Math.max(...values) - Math.min(...values) };
  });
  const maxImbalance = imbalancePoints.reduce((highest, point) => point.value > highest.value ? point : highest, imbalancePoints[0]);
  const maxVoltageSpread = voltageSpreadPoints.reduce((highest, point) => point.value > highest.value ? point : highest, voltageSpreadPoints[0]);
  return { timestamps, phases, maxImbalance, maxVoltageSpread };
}

function motorHistoricalLogData(motor, phaseHistory) {
  const currentLimit = motor.hz === 42 ? 34 : 32;
  return phaseHistory.timestamps.map((timestamp, index) => {
    const currentR = phaseHistory.phases[0].current[index];
    const currentS = phaseHistory.phases[1].current[index];
    const currentT = phaseHistory.phases[2].current[index];
    const voltageR = phaseHistory.phases[0].voltage[index];
    const voltageS = phaseHistory.phases[1].voltage[index];
    const voltageT = phaseHistory.phases[2].voltage[index];
    const currentAverage = (currentR + currentS + currentT) / 3;
    const voltageAverage = (voltageR + voltageS + voltageT) / 3;
    const imbalance = Math.max(Math.abs(currentR - currentAverage), Math.abs(currentS - currentAverage), Math.abs(currentT - currentAverage)) / currentAverage * 100;
    const lineVoltage = voltageAverage * Math.sqrt(3);
    const kw = motor.kw * (currentAverage / motor.amps) * (1 + Math.sin(index * .17) * .018);
    const hz = motor.hz + Math.sin(index * .21 + motor.name.length) * .22;
    const status = currentAverage > currentLimit || imbalance > 3 ? "Review" : "Normal";
    return { timestamp, currentR, currentS, currentT, voltageR, voltageS, voltageT, currentAverage, lineVoltage, kw, hz, imbalance, status };
  });
}

function motorHistoricalLogPanel(motor, phaseHistory, rangeLabel) {
  const rows = motorHistoricalLogData(motor, phaseHistory);
  return `<section class="motor-log-panel" aria-label="Motor historical data log">
    <div class="motor-log-head"><div><strong>Complete Historical Data Log</strong><small>${rows.length} record · ${rangeLabel} · semua nilai mengikuti time range aktif.</small></div><button class="button ghost small" data-motor-log-export>Export CSV</button></div>
    <div class="motor-log-table-wrap" tabindex="0"><table class="data-table motor-log-table"><thead><tr><th>Timestamp</th><th>Phase R</th><th>Phase S</th><th>Phase T</th><th>Load</th><th>Drive</th><th>Quality</th></tr></thead><tbody>${rows.map((row) => `<tr><td class="mono" data-label="Timestamp">${formatDateTime(row.timestamp, true)}</td><td class="phase-cell" data-label="Phase R"><div class="phase-cell-inner"><span><small>RMS Amp</small><strong>${row.currentR.toFixed(1)} A</strong></span><span><small>Voltage</small><b>${row.voltageR.toFixed(1)} V</b></span></div></td><td class="phase-cell" data-label="Phase S"><div class="phase-cell-inner"><span><small>RMS Amp</small><strong>${row.currentS.toFixed(1)} A</strong></span><span><small>Voltage</small><b>${row.voltageS.toFixed(1)} V</b></span></div></td><td class="phase-cell" data-label="Phase T"><div class="phase-cell-inner"><span><small>RMS Amp</small><strong>${row.currentT.toFixed(1)} A</strong></span><span><small>Voltage</small><b>${row.voltageT.toFixed(1)} V</b></span></div></td><td class="phase-cell" data-label="Load"><div class="phase-cell-inner"><span><small>Avg Current</small><strong>${row.currentAverage.toFixed(1)} A</strong></span><span><small>Line Voltage</small><b>${row.lineVoltage.toFixed(0)} V</b></span></div></td><td class="phase-cell" data-label="Drive"><div class="phase-cell-inner"><span><small>Active power</small><strong>${row.kw.toFixed(1)} kW</strong></span><span><small>Frequency</small><b>${row.hz.toFixed(1)} Hz</b></span></div></td><td class="phase-cell quality-cell" data-label="Quality"><div class="phase-cell-inner"><span><small>Imbalance</small><strong>${row.imbalance.toFixed(1)}%</strong></span><span class="data-pill ${row.status === "Review" ? "warning" : "good"}">${row.status}</span></div></td></tr>`).join("")}</tbody></table></div>
    <div class="motor-log-foot"><span>Gunakan timestamp untuk menghubungkan kondisi motor dengan batch, event proses, alarm, dan log operator.</span><span>CSV akan memakai data dan time range yang sama.</span></div>
  </section>`;
}

function exportMotorHistoricalLog() {
  const motor = selectedMotorDriveAsset();
  if (!motor) return;
  const phaseHistory = motorThreePhaseHistoricalData(motor);
  const rows = motorHistoricalLogData(motor, phaseHistory);
  const headers = ["Timestamp", "Motor ID", "Phase R Current A", "Phase S Current A", "Phase T Current A", "Average Current A", "Phase R Voltage V", "Phase S Voltage V", "Phase T Voltage V", "Line Voltage V", "Active Power kW", "Drive Frequency Hz", "Current Imbalance %", "Status"];
  const csvRows = rows.map((row) => [
    new Date(row.timestamp).toISOString(), motor.id, row.currentR.toFixed(2), row.currentS.toFixed(2), row.currentT.toFixed(2), row.currentAverage.toFixed(2), row.voltageR.toFixed(2), row.voltageS.toFixed(2), row.voltageT.toFixed(2), row.lineVoltage.toFixed(2), row.kw.toFixed(2), row.hz.toFixed(2), row.imbalance.toFixed(2), row.status,
  ]);
  const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const blob = new Blob([[headers, ...csvRows].map((row) => row.map(quote).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${motor.id.toLowerCase()}-historical-${state.motorDrive.range.toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function motorPhaseTroubleshootingPanel(motor, phaseHistory, rangeLabel) {
  const limit = motor.hz === 42 ? 34 : 32;
  const phaseWithHighestCurrent = phaseHistory.phases.reduce((highest, phase) => phase.currentMax > highest.currentMax ? phase : highest, phaseHistory.phases[0]);
  const phaseWithLowestCurrent = phaseHistory.phases.reduce((lowest, phase) => phase.currentMin < lowest.currentMin ? phase : lowest, phaseHistory.phases[0]);
  const showTime = (timestamp) => formatDateTime(timestamp, true);
  const highestTone = phaseWithHighestCurrent.currentMax > limit ? "warning" : "good";
  const imbalanceTone = phaseHistory.maxImbalance.value > 3 ? "warning" : "good";
  return `<section class="motor-troubleshooting-panel" aria-label="Three phase troubleshooting analysis">
    <div class="motor-troubleshooting-head"><div><strong>3-Phase Historical Diagnostic</strong><small>Minimum, average, maximum, dan waktu ekstrem dalam ${rangeLabel}.</small></div><span class="data-pill neutral">TROUBLESHOOTING REFERENCE</span></div>
    <div class="motor-phase-table-wrap" tabindex="0"><table class="data-table motor-phase-table"><thead><tr><th>Phase</th><th>Current Min / Avg / Max</th><th>Time High</th><th>Time Low</th><th>Voltage Min / Avg / Max</th><th>Condition</th></tr></thead><tbody>${phaseHistory.phases.map((phase) => {
      const phaseTone = phase.currentMax > limit ? "warning" : "good";
      return `<tr><td><span class="phase-name phase-${phase.phase.toLowerCase()}">${phase.phase}</span></td><td class="mono"><span class="compact-stat"><span><small>MIN</small><b>${phase.currentMin.toFixed(1)} A</b></span><span><small>AVG</small><b>${phase.currentAverage.toFixed(1)} A</b></span><span><small>MAX</small><strong>${phase.currentMax.toFixed(1)} A</strong></span></span></td><td class="mono">${showTime(phase.highTime)}</td><td class="mono">${showTime(phase.lowTime)}</td><td class="mono"><span class="compact-stat"><span><small>MIN</small><b>${phase.voltageMin.toFixed(1)} V</b></span><span><small>AVG</small><b>${phase.voltageAverage.toFixed(1)} V</b></span><span><small>MAX</small><b>${phase.voltageMax.toFixed(1)} V</b></span></span></td><td><span class="data-pill ${phaseTone}">${phase.currentMax > limit ? "High review" : "Within limit"}</span></td></tr>`;
    }).join("")}</tbody></table></div>
    <div class="motor-finding-grid">
      <article class="motor-finding ${highestTone}"><span>Highest RMS current</span><strong>Phase ${phaseWithHighestCurrent.phase} · ${phaseWithHighestCurrent.currentMax.toFixed(1)} A</strong><small>${showTime(phaseWithHighestCurrent.highTime)} · limit ${limit.toFixed(1)} A</small><p>Jika meningkat melewati baseline/limit, periksa beban mekanis, bearing, tension felt/belt, alignment, dan kondisi driven equipment.</p></article>
      <article class="motor-finding"><span>Lowest RMS current</span><strong>Phase ${phaseWithLowestCurrent.phase} · ${phaseWithLowestCurrent.currentMin.toFixed(1)} A</strong><small>${showTime(phaseWithLowestCurrent.lowTime)} · compare dengan kondisi proses</small><p>Gunakan waktu ini untuk cek kemungkinan no-load, slip, material tidak masuk, coupling, atau pembacaan sensor yang tidak normal.</p></article>
      <article class="motor-finding ${imbalanceTone}"><span>Maximum current imbalance</span><strong>${phaseHistory.maxImbalance.value.toFixed(1)}%</strong><small>${showTime(phaseHistory.maxImbalance.time)} · action threshold 3.0%</small><p>Jika melewati threshold, verifikasi terminal, kabel, contactor, output drive, dan ketidakseimbangan beban antar fase.</p></article>
      <article class="motor-finding ${phaseHistory.maxVoltageSpread.value > 4 ? "warning" : "good"}"><span>Maximum voltage spread</span><strong>${phaseHistory.maxVoltageSpread.value.toFixed(1)} V</strong><small>${showTime(phaseHistory.maxVoltageSpread.time)} · phase-to-neutral</small><p>Jika spread meningkat, cek incoming supply, terminal connection, fuse/contactor, serta kualitas suplai drive.</p></article>
    </div>
  </section>`;
}

function motorDriveDetailPanel(motor) {
  const rangeLabel = { "1H": "Last 1 hour", "8H": "Last 8 hours", "24H": "Last 24 hours", "7D": "Last 7 days" }[state.motorDrive.range];
  const runtime = ({ "1H": .9, "8H": 7.4, "24H": 20.8, "7D": 143.6 })[state.motorDrive.range];
  const ranges = ["1H", "8H", "24H", "7D"].map((range) => `<button class="segment ${state.motorDrive.range === range ? "active" : ""}" data-motor-drive-range="${range}">${range}</button>`).join("");
  const metrics = [["amp", "RMS Amp"], ["voltage", "Voltage"], ["kw", "kW"]].map(([key, label]) => `<button class="segment ${state.motorDrive.metric === key ? "active" : ""}" data-motor-drive-metric="${key}">${label}</button>`).join("");
  const due = Math.max(0, motor.pmRuntime - motor.runtime);
  const phaseData = motorThreePhaseReadings(motor);
  const phaseHistory = motorThreePhaseHistoricalData(motor);
  return `<div class="motor-modal-backdrop" data-motor-drive-backdrop>
  <section class="card motor-drive-analysis" id="motor-drive-analysis" role="dialog" aria-modal="true" aria-labelledby="motor-drive-title">
    <div class="motor-analysis-head"><div><span class="eyebrow">Motor & drive diagnostic</span><h2 id="motor-drive-title">${motor.name} · ${motor.id}</h2><p>${motor.parentMachine || "Kalender"} · ${motor.processLabel || "Kalender finishing"} · read-only analysis untuk kondisi drive, historical operation, dan target maintenance.</p></div><div class="motor-analysis-actions"><span class="data-pill ${motor.status === "warning" ? "warning" : "good"}">${motor.status === "warning" ? "CHECK CURRENT" : "RUNNING"}</span><button class="button ghost small" data-motor-drive-close>Close detail</button></div></div>
    <div class="motor-analysis-scope"><span class="kpi-scope live">LIVE NOW</span><span>Nilai aktual drive saat ini</span></div>
    <div class="motor-live-grid">
      ${metricTile("RMS Current Avg.", liveValue(motor.amps, "A", .28, 1), `R/S/T · Limit ${motor.hz === 42 ? "34.0" : "32.0"} A`)}
      ${metricTile("Line Voltage Avg.", liveValue(motor.voltage, "V", 1.2, 0), "L-L · Window 380–415 V")}
      ${metricTile("Active Power", liveValue(motor.kw, "kW", .16, 1), `Drive ${motor.hz.toFixed(1)} Hz`)}
      ${metricTile("Drive Frequency", liveValue(motor.hz, "Hz", .08, 1), "Command tracking good")}
    </div>
    <section class="motor-phase-panel" aria-label="Three phase measurement R S T">
      <div class="motor-phase-head"><div><strong>3-Phase Live Measurement</strong><small>Phase-to-neutral voltage dan RMS current per phase.</small></div><span class="data-pill ${phaseData.imbalance > 3 ? "warning" : "good"}">Current imbalance ${phaseData.imbalance.toFixed(1)}%</span></div>
      <div class="motor-phase-grid">${phaseData.phases.map((item) => `<article class="motor-phase-reading phase-${item.phase.toLowerCase()}"><span>Phase ${item.phase}</span><strong>${item.current.toFixed(1)}<small>A</small></strong><em>${item.voltage.toFixed(1)} V</em><i>${Math.abs(item.current - motor.amps) < motor.amps * .03 ? "Balanced" : "Review"}</i></article>`).join("")}</div>
    </section>
    <div class="motor-analysis-scope historical"><span class="kpi-scope historical">SELECTED RANGE</span><span>${rangeLabel}</span><div class="segmented">${ranges}</div></div>
    <div class="motor-history-grid">
      ${metricTile("Runtime", `${runtime.toFixed(1)}<small>h</small>`, "Running time")}
      ${metricTile("Max RMS Amp", `${(motor.amps * 1.09).toFixed(1)}<small>A</small>`, "Peak within range")}
      ${metricTile("Energy", `${(motor.kw * runtime * .88).toFixed(1)}<small>kWh</small>`, "Selected range")}
      ${metricTile("Unplanned Stop", motor.status === "warning" ? "4.2<small>min</small>" : "0.0<small>min</small>", motor.status === "warning" ? "Review drive load" : "No event")}
    </div>
    ${motorPhaseTroubleshootingPanel(motor, phaseHistory, rangeLabel)}
    <div class="motor-trend-head"><div><strong>Drive Historical Trend</strong><small>Drag chart atau navigator untuk menggeser waktu.</small></div><div class="segmented">${metrics}</div></div>
    <div class="motor-trend-window"><span id="motor-trend-visible-label">Visible window</span><span>${rangeLabel}</span></div>
    <canvas class="chart-canvas motor-drive-trend-canvas" id="motor-drive-trend" tabindex="0" aria-label="Motor drive historical trend ${motor.name}"></canvas>
    <div class="trend-navigator motor-trend-navigator" id="motor-trend-navigator" role="slider" tabindex="0" aria-label="Posisi waktu motor historical"><div class="navigator-track"><div class="navigator-selection" id="motor-navigator-selection"><span></span><span></span></div></div></div>
    ${motorHistoricalLogPanel(motor, phaseHistory, rangeLabel)}
    <div class="motor-maintenance-grid">
      ${panel("Maintenance Target Plan", "Target berbasis runtime, inspeksi, dan condition threshold", `<div class="table-wrap"><table class="data-table motor-maintenance-table"><thead><tr><th>Plan</th><th>Target</th><th>Current</th><th>Next Action</th><th>Status</th></tr></thead><tbody>
        <tr><td>Preventive drive inspection</td><td class="mono">${motor.pmRuntime.toLocaleString()} runtime h</td><td class="mono">${motor.runtime.toLocaleString()} h</td><td>Due in ${due.toLocaleString()} runtime h</td><td><span class="data-pill ${due < 150 ? "warning" : "good"}">${due < 150 ? "Plan soon" : "On plan"}</span></td></tr>
        <tr><td>RMS current verification</td><td class="mono">≤ ${motor.hz === 42 ? "34.0" : "32.0"} A</td><td class="mono">${motor.amps.toFixed(1)} A</td><td>Check each shift</td><td><span class="data-pill good">Normal</span></td></tr>
        <tr><td>Drive cooling & terminal</td><td>Weekly inspection</td><td>Last check 3 days ago</td><td>Inspect fan, filter, terminal</td><td><span class="data-pill good">On plan</span></td></tr>
        <tr><td>Bearing lubrication</td><td class="mono">Every 500 h</td><td class="mono">482 h since last</td><td>Plan within 18 h</td><td><span class="data-pill warning">Plan soon</span></td></tr>
      </tbody></table></div>`, "", "motor-maintenance-panel")}
      ${panel("Maintenance Recommendation", "Condition-based suggestion dari data drive", `<div class="maintenance-recommendation"><strong>${motor.status === "warning" ? "Review load profile before next production run" : "Maintain current preventive schedule"}</strong><span>${motor.status === "warning" ? "Current motor ini berada di atas baseline. Verifikasi mechanical load, alignment, belt/felt tension, dan terminal drive sebelum kondisi meningkat." : "Current, voltage, dan power masih berada pada window normal. Lanjutkan inspeksi cooling, terminal, dan lubrication sesuai target plan."}</span></div>`, "", "motor-recommendation-panel")}
    </div>
  </section></div>`;
}

function dryerDetailPage() {
  const machine = dryers.find((m) => m.id === state.selected.dryer) || dryers[0];
  const motors = processMotorAssets("dryer", machine);
  const selectedMotor = state.motorDrive.source === "dryer" ? motors.find((motor) => motor.id === state.motorDrive.selected) : null;
  const temps = Array.from({ length: machine.chambers }, (_, i) => ({ actual: 142 + i * 1.2 + (i === 4 ? -9 : 0), sp: 144 + i * 1.0 }));
  return `
    ${processBreadcrumb("dryer", machine)}
    ${pageHead("dryer", selector(dryers.filter((item) => item.area === machine.area), "dryer"))}
    ${machineHero(machine, "DR", `${machine.chambers} chambers · ${machine.setup} · Calator source CL-03`)}
    <section class="kpi-grid">
      ${kpi("Machine Speed", liveValue(32.4, "", .08, 1), "m/min", "SP", "<strong>Target 32.5</strong>· stable")}
      ${kpi("Avg. Chamber Temp", liveValue(146.8, "", .12, 1), "°C", "TP", "<strong>7 / 8 ready</strong>· one deviation", "warning")}
      ${kpi("Thermal Oil Supply", liveValue(218.4, "", .22, 1), "°C", "TO", "<strong>ΔT 21.7°C</strong>· normal", "success")}
      ${kpi("Output Today", "6,420", "m", "OP", "<strong>↑ 2.6%</strong>vs shift target")}
    </section>
    ${panel(`Chamber Temperature Heatmap · ${machine.chambers} zones`, "Actual, setpoint, dan deviation setiap chamber", `
      <div class="heatmap-grid">${temps.map((t, i) => `<div class="heatmap-cell ${Math.abs(t.actual - t.sp) > 5 ? "warning" : ""}"><strong>CH-${String(i + 1).padStart(2, "0")}</strong><span>${t.actual.toFixed(1)}°</span><small>SP ${t.sp.toFixed(1)} · Δ ${(t.actual - t.sp).toFixed(1)}</small></div>`).join("")}</div>
    `)}
    ${motorEquipmentPanel("dryer", machine, motors)}
    ${selectedMotor ? motorDriveDetailPanel(selectedMotor) : ""}
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
  const motors = processMotorAssets("kalender", machine);
  const selectedMotor = state.motorDrive.source === "kalender" ? motors.find((motor) => motor.id === state.motorDrive.selected) : null;
  return `
    ${processBreadcrumb("kalender", machine)}
    ${pageHead("kalender", selector(kalenders.filter((item) => item.area === machine.area), "kalender"))}
    ${machineHero(machine, "KL", `${machine.setup} · Dryer source DR-02 · Cotton 220 GSM`)}
    <section class="kpi-grid">
      ${kpi("Energy Consumption", "1,284", "kWh", "EN", "<strong>Current shift</strong>· total consumption")}
      ${kpi("Power Demand", liveValue(86.4, "", .35, 1), "kW", "PW", "<strong>72% load</strong>· within capacity", "success")}
      ${kpi("Output Progress", "68", "%", "OP", "<strong>3,264 / 4,800 m</strong>· shift target")}
      ${kpi("Completed Batches", "12", "batch", "BT", "<strong>Current day</strong>· 2 in process")}
    </section>
    <section class="grid-2">
      ${panel("Parameter Configuration", "Setpoint recipe, speed limit, dan target finishing aktif", parameterConfigurationRows([
        ["SV Loadcell Upper", "480.0", "kg"], ["SV Loadcell Lower", "475.0", "kg"],
        ["SV Temperature Upper", "127.0", "°C"], ["SV Temperature Lower", "127.0", "°C"],
        ["Overspeed Expander", "2.0", "%"], ["Overspeed Inlet", "1.5", "%"],
        ["Overspeed Plaiter", "1.8", "%"], ["Fabric Width", "181.0", "cm"]
      ]))}
      ${panel("Live Sensor Measurements", "Actual sensor yang terkait langsung dengan mesin Kalender", `
        <div class="metric-grid">
          ${metricTile("Loadcell upper", liveValue(482, "kg", 2, 1), "SV 480.0 kg")}
          ${metricTile("Loadcell lower", liveValue(473, "kg", 2, 1), "SV 475.0 kg")}
          ${metricTile("Temperature upper", liveValue(126.4, "°C", .13, 1), "SV 127.0°C")}
          ${metricTile("Temperature lower", liveValue(125.8, "°C", .13, 1), "SV 127.0°C")}
          ${metricTile("Dancing roller", liveValue(53.8, "%", .22, 1), "Center 50.0%")}
          ${metricTile("Fabric width", liveValue(181.2, "cm", .12, 1), "Target 181.0 cm")}
        </div>
      `, "", "live-sensor-panel")}
    </section>
    ${panel("Production & Delivery Detail", "Order, target finishing, dan progress proses mesin berjalan", `
      <div class="process-detail-grid">
        <div class="process-detail-item"><span>Customer</span><strong>PT Nusantara Apparel</strong></div>
        <div class="process-detail-item"><span>Fabric Type</span><strong>Cotton Combed 30s</strong></div>
        <div class="process-detail-item"><span>Target Grammage</span><strong>220 GSM</strong></div>
        <div class="process-detail-item"><span>Target Fabric Width</span><strong>181.0 cm</strong></div>
        <div class="process-detail-item"><span>Expected Output</span><strong>4,800 m / shift</strong></div>
        <div class="process-detail-item"><span>Delivery Target</span><strong>15 Aug 2026 · 18:00</strong></div>
      </div>
      <div class="production-progress-block">
        <div class="production-progress-head"><div><strong>Machine Production Progress</strong><small>KL-DPN-01 · FIN-COT-07 · running</small></div><strong>68%</strong></div>
        <div class="production-progress-track"><i style="width:68%"></i></div>
        <div class="production-progress-foot"><span>Actual output <strong>3,264 m</strong></span><span>Remaining <strong>1,536 m</strong></span><span>Est. completion <strong>17:12</strong></span></div>
      </div>
    `)}
    ${motorEquipmentPanel("kalender", machine, motors)}
    ${selectedMotor ? motorDriveDetailPanel(selectedMotor) : ""}
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

const machinePowerConfig = {
  jetflow: { label: "Jetflow", baseDemand: 11.8 },
  calator: { label: "Calator", baseDemand: 16.2 },
  dryer: { label: "Dryer", baseDemand: 52.4 },
  kalender: { label: "Kalender", baseDemand: 12.8 },
  chemical: { label: "Dispensing", baseDemand: 7.4 },
};

function machinePowerRangeHours() {
  return { "1H": 1, "8H": 8, "24H": 24, "7D": 168 }[state.range] || 8;
}

function machinePowerMeters(type) {
  const config = machinePowerConfig[type];
  return fleetFor(type).map((machine, index) => {
    const seed = [...machine.id].reduce((total, character) => total + character.charCodeAt(0), 0);
    const stateFactor = { running: 1, warning: 0.91, idle: 0.16, fault: 0.22, offline: 0 }[machine.state] ?? 0.7;
    const demand = config.baseDemand * (0.82 + seed % 37 / 100) * stateFactor;
    const energy = demand * machinePowerRangeHours() * (0.88 + index % 9 / 100);
    return {
      ...machine,
      demand,
      energy,
      load: Math.min(100, Math.round(demand / (config.baseDemand * 1.28) * 100)),
      powerFactor: Math.min(0.99, 0.91 + seed % 7 / 100),
      voltage: 396 + seed % 9,
      meterStatus: machine.connected ? machine.state === "warning" || machine.state === "fault" ? "warning" : "good" : "offline",
    };
  });
}

function machinePowerAreaSummary(type = state.utility.machinePowerType) {
  const meters = machinePowerMeters(type);
  return processAreas[type].map((area) => {
    const areaMeters = meters.filter((meter) => meter.area === area.code);
    return {
      ...area,
      meters: areaMeters,
      energy: areaMeters.reduce((total, meter) => total + meter.energy, 0),
      demand: areaMeters.reduce((total, meter) => total + meter.demand, 0),
    };
  });
}

function powerEnergyDisplay(value) {
  return value >= 1000
    ? { value: (value / 1000).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), unit: "MWh" }
    : { value: value.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }), unit: "kWh" };
}

function machinePowerMeterPanel() {
  const type = state.utility.machinePowerType;
  const config = machinePowerConfig[type];
  const areas = machinePowerAreaSummary(type);
  if (!areas.some((area) => area.code === state.utility.selectedPowerArea)) state.utility.selectedPowerArea = areas[0].code;
  const selectedArea = areas.find((area) => area.code === state.utility.selectedPowerArea) || areas[0];
  const rankedMeters = [...selectedArea.meters].sort((a, b) => b.energy - a.energy);
  if (!rankedMeters.some((meter) => meter.id === state.utility.selectedPowerMachine)) state.utility.selectedPowerMachine = rankedMeters[0]?.id || null;
  const selectedMeter = rankedMeters.find((meter) => meter.id === state.utility.selectedPowerMachine) || rankedMeters[0];
  const totalEnergy = areas.reduce((total, area) => total + area.energy, 0);
  const totalDisplay = powerEnergyDisplay(totalEnergy);
  const areaLegend = areas.map((area, index) => {
    const display = powerEnergyDisplay(area.energy);
    const share = totalEnergy ? area.energy / totalEnergy * 100 : 0;
    return `<button class="electrical-legend-row ${area.code === selectedArea.code ? "active" : ""}" data-machine-power-area="${area.code}"><i style="background:${electricalColors[index]}"></i><span><strong>${area.label}</strong><small>${area.count} machine power meters</small></span><b>${display.value} ${display.unit}</b><em>${share.toFixed(1)}%</em></button>`;
  }).join("");
  const ranking = rankedMeters.map((meter, index) => {
    const display = powerEnergyDisplay(meter.energy);
    return `<button class="machine-power-rank-row ${meter.id === selectedMeter.id ? "active" : ""}" data-machine-power-meter="${meter.id}"><span>${index + 1}</span><span><strong>${meter.id}</strong><small>${meter.state} · meter ${meter.meterStatus}</small></span><b>${display.value}<small>${display.unit}</small></b><em>${meter.demand.toFixed(1)} kW</em></button>`;
  }).join("");
  const selectedEnergy = powerEnergyDisplay(selectedMeter.energy);
  return `<section class="card electrical-distribution-card machine-power-card">
    <div class="electrical-distribution-head machine-power-head">
      <div><span class="eyebrow">Machine power meter mapping</span><h2>Machine Electrical Consumption</h2><p>Pilih kelompok mesin, klik area pada pie, lalu pilih mesin untuk melihat detail meter listriknya.</p></div>
      <div class="machine-power-controls">
        <label><span>Machine group</span><select class="select-control" id="machine-power-type-select">${Object.entries(machinePowerConfig).map(([key, item]) => `<option value="${key}" ${key === type ? "selected" : ""}>${item.label} · ${fleetFor(key).length} machines</option>`).join("")}</select></label>
        <label><span>Historical range</span>${rangeButtons()}</label>
      </div>
    </div>
    <div class="electrical-distribution-layout machine-power-layout">
      <div class="electrical-chart-panel">
        <div class="electrical-pie-wrap"><canvas id="machine-power-area-chart" aria-label="Perbandingan konsumsi listrik ${config.label} per area"></canvas><div class="electrical-pie-total"><strong>${totalDisplay.value}</strong><span>${totalDisplay.unit} total</span><small>${state.range} · ${config.label}</small></div></div>
        <div class="electrical-legend">${areaLegend}</div>
      </div>
      <aside class="electrical-detail-panel machine-power-ranking-panel">
        <div class="machine-power-ranking-head"><div><span>Selected area</span><h3>${selectedArea.label}</h3><p>${selectedArea.count} meter · ranking berdasarkan ${state.range}</p></div><span class="kpi-scope historical">SELECTED RANGE</span></div>
        <div class="machine-power-rank-list">${ranking}</div>
        <div class="machine-meter-detail">
          <div class="electrical-detail-head"><div><span>${selectedMeter.id}</span><h3>${selectedMeter.name}</h3><p>Individual machine power meter</p></div>${statusPill(selectedMeter.state)}</div>
          <div class="electrical-detail-grid machine-meter-grid"><div><span>Energy · ${state.range}</span><strong>${selectedEnergy.value} ${selectedEnergy.unit}</strong></div><div><span>Actual demand</span><strong>${selectedMeter.demand.toFixed(1)} kW</strong></div><div><span>Load</span><strong>${selectedMeter.load}%</strong></div><div><span>Power factor</span><strong>${selectedMeter.powerFactor.toFixed(2)}</strong></div><div><span>Voltage</span><strong>${selectedMeter.voltage} V</strong></div><div><span>Meter data</span><strong>${selectedMeter.meterStatus === "good" ? "Good · 24 ms" : selectedMeter.meterStatus === "warning" ? "Check quality" : "No data"}</strong></div></div>
          <button class="button ghost electrical-history-button" data-open-power-machine="${type}|${selectedMeter.id}">Open machine detail</button>
        </div>
      </aside>
    </div>
    <div class="machine-power-coverage"><span>Design coverage</span><strong>${fleetFor(type).length} / ${fleetFor(type).length} power meters</strong><small>Target desain 100%; coverage commissioning aktual wajib menggantikan nilai demo.</small></div>
  </section>`;
}

function utilitiesPage() {
  return `
    ${pageHead("utilities", `<select class="select-control"><option>All utilities</option><option>Electrical</option><option>Water</option><option>Steam</option><option>Thermal Oil</option></select><button class="button" data-page-target="trends">⌗ Historical</button>`)}
    <section class="kpi-grid">
      ${kpi("Electrical Demand", liveValue(utilityValue("ELECTRICAL_DEMAND", 1.84), "", .02, 2), "MW", "EL", "<strong>Peak 1.96 MW</strong>· 10:12")}
      ${kpi("Water Consumption", "1,284", "m³", "WA", "<strong>82.4%</strong>daily baseline")}
      ${kpi("Steam Production", liveValue(utilityValue("STEAM_FLOW", 12.8), "", .09, 1), "t/h", "ST", "<strong class='danger'>Pressure 7.8 bar</strong>", "warning")}
      ${kpi("Thermal Oil Supply", liveValue(utilityValue("THERMAL_OIL_SUPPLY", 218.4), "", .2, 1), "°C", "TO", "<strong>3 Dryers</strong>active demand", "success")}
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
    ${machinePowerMeterPanel()}
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

function dispensingSupportedCalators(machine) {
  const areaCalators = calators.filter((calator) => calator.area === machine.area);
  const unitNumber = Number(machine.id.slice(-2));
  if (machine.area === "DPN") return areaCalators;
  const splitAt = machine.area === "BLK" ? 5 : 4;
  return areaCalators.filter((_, index) => unitNumber === 1 ? index < splitAt : index >= splitAt);
}

function dispenserForCalator(calatorId) {
  const area = calatorId.split("-")[1];
  const number = Number(calatorId.slice(-2));
  if (area === "DPN") return "DSP-DPN-01";
  if (area === "BLK") return number <= 5 ? "DSP-BLK-01" : "DSP-BLK-02";
  return number <= 4 ? "DSP-TMR-01" : "DSP-TMR-02";
}

function calatorChemicalUsage(calator) {
  const seed = [...calator.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return chemicals.map((chemical, index) => ({
    code: chemical[0], name: chemical[1], color: chemical[4], kg: 24 + ((seed * (index + 5) + index * 31) % 142),
  }));
}

function chemicalUsageByCalatorPanel(machine) {
  const supported = dispensingSupportedCalators(machine);
  const activeCalator = state.chemicalLog.calator;
  return panel("Chemical Usage by Supported Calator", "Klik Calator untuk memfilter log transaksi dan melihat penggunaan chemical unit ini", `<div class="table-wrap"><table class="data-table calator-chemical-matrix"><thead><tr><th>Calator Destination</th>${chemicals.map((chemical) => `<th>${chemical[0]}</th>`).join("")}<th>Total</th></tr></thead><tbody>${supported.map((calator) => {
    const usage = calatorChemicalUsage(calator);
    const total = usage.reduce((sum, item) => sum + item.kg, 0);
    return `<tr class="${activeCalator === calator.id ? "selected" : ""}"><td><button class="calator-usage-button" data-dispensing-calator-filter="${calator.id}"><strong>${calator.id}</strong><small>${calator.name}</small></button></td>${usage.map((item) => `<td class="mono">${item.kg.toLocaleString()} kg</td>`).join("")}<td class="mono"><strong>${total.toLocaleString()} kg</strong></td></tr>`;
  }).join("")}</tbody></table></div><div class="calator-matrix-foot"><span>${supported.length} Calator didukung oleh <strong>${machine.id}</strong></span>${activeCalator !== "all" ? `<button class="button ghost small" data-dispensing-calator-reset>All supported Calators</button>` : ""}</div>`, `<span class="data-pill neutral">${machine.areaLabel.toUpperCase()} SUPPORT</span>`, "calator-usage-panel");
}

function calatorChemicalRankingPanel(machine) {
  const supported = dispensingSupportedCalators(machine);
  return panel("Top Chemical per Calator", "Ranking penggunaan terbanyak pada setiap Calator yang didukung", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Calator</th><th>Top 1 Chemical</th><th>Usage</th><th>Top 2 Chemical</th><th>Usage</th><th>Top 3 Chemical</th><th>Usage</th></tr></thead><tbody>${supported.map((calator) => {
    const top = calatorChemicalUsage(calator).sort((a, b) => b.kg - a.kg).slice(0, 3);
    return `<tr><td><strong>${calator.id}</strong><small class="table-subline">${calator.name}</small></td>${top.flatMap((item) => [`<td><span class="chemical-rank-dot" style="background:${item.color}"></span>${item.code} · ${item.name}</td>`, `<td class="mono">${item.kg.toLocaleString()} kg</td>`]).join("")}</tr>`;
  }).join("")}</tbody></table></div>`, "", "calator-ranking-panel");
}

function chemicalDispensingLogPanel(machine) {
  const rangeHours = { "8H": 8, "24H": 24, "7D": 168 };
  const supported = dispensingSupportedCalators(machine).map((calator) => calator.id);
  const now = Date.now();
  const customActive = state.chemicalLog.range === "CUSTOM";
  const rangeStart = customActive ? state.chemicalLog.customStart : now - rangeHours[state.chemicalLog.range] * 60 * 60 * 1000;
  const rangeEnd = customActive ? state.chemicalLog.customEnd : now;
  const visible = chemicalDispensingLogs.filter((item) => dispenserForCalator(item.calator) === machine.id
    && (() => { const timestamp = now - item.hoursAgo * 60 * 60 * 1000; return timestamp >= rangeStart && timestamp <= rangeEnd; })()
    && (state.chemicalLog.variant === "all" || item.code === state.chemicalLog.variant)
    && (state.chemicalLog.mode === "all" || item.mode === state.chemicalLog.mode)
    && (state.chemicalLog.status === "all" || item.status === state.chemicalLog.status)
    && (state.chemicalLog.calator === "all" || item.calator === state.chemicalLog.calator));
  const option = (value, label, selected) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`;
  return panel("Dispensing Request Log", "Track request code, proses penimbangan, dan transfer chemical ke Calator", `
    <div class="dispensing-filter-row">
      <label>Time range<select class="select-control" data-chemical-log-filter="range">${option("8H", "Last 8 hours", state.chemicalLog.range)}${option("24H", "Last 24 hours", state.chemicalLog.range)}${option("7D", "Last 7 days", state.chemicalLog.range)}${option("CUSTOM", "Custom range", state.chemicalLog.range)}</select></label>
      <label>Chemical variant<select class="select-control" data-chemical-log-filter="variant">${option("all", "All variants", state.chemicalLog.variant)}${chemicals.map((chemical) => option(chemical[0], `${chemical[0]} · ${chemical[1]}`, state.chemicalLog.variant)).join("")}</select></label>
      <label>Calator destination<select class="select-control" data-chemical-log-filter="calator">${option("all", "All supported Calators", state.chemicalLog.calator)}${supported.map((calator) => option(calator, calator, state.chemicalLog.calator)).join("")}</select></label>
      <label>Dispensing type<select class="select-control" data-chemical-log-filter="mode">${option("all", "Manual + Automatic", state.chemicalLog.mode)}${option("Manual", "Manual", state.chemicalLog.mode)}${option("Automatic", "Automatic", state.chemicalLog.mode)}</select></label>
      <label>Status<select class="select-control" data-chemical-log-filter="status">${option("all", "All status", state.chemicalLog.status)}${option("Completed", "Completed", state.chemicalLog.status)}${option("Weighing", "Weighing", state.chemicalLog.status)}${option("Hold", "Hold", state.chemicalLog.status)}</select></label>
    </div>
    ${customActive ? `<div class="chemical-custom-range"><label class="date-field"><span>Start date & time</span><input type="datetime-local" data-chemical-custom-date="start" value="${toDateTimeLocal(state.chemicalLog.customStart)}" /></label><label class="date-field"><span>End date & time</span><input type="datetime-local" data-chemical-custom-date="end" value="${toDateTimeLocal(state.chemicalLog.customEnd)}" /></label><button class="button primary small" data-chemical-custom-apply>Apply range</button></div>` : ""}
    <div class="dispensing-log-table-wrap" tabindex="0" aria-label="Chemical dispensing request log"><table class="data-table dispensing-log-table"><thead><tr><th>Time</th><th>Request Code</th><th>Calator</th><th>Chemical Variant</th><th>Target</th><th>Actual</th><th>Type</th><th>Weighing Process</th><th>Status</th><th>Operator / Source</th></tr></thead><tbody>${visible.map((item) => {
      const tone = item.status === "Completed" ? "good" : item.status === "Hold" ? "warning" : "neutral";
      return `<tr><td class="mono">${item.time}</td><td class="mono"><strong>${item.request}</strong></td><td>${item.calator}</td><td><strong>${item.code}</strong> · ${item.variant}</td><td class="mono">${item.target}</td><td class="mono">${item.actual}</td><td><span class="data-pill ${item.mode === "Automatic" ? "good" : "neutral"}">${item.mode}</span></td><td>${item.stage}</td><td><span class="data-pill ${tone}">${item.status}</span></td><td>${item.operator}</td></tr>`;
    }).join("") || `<tr><td colspan="10" class="dispensing-empty-row">Tidak ada transaksi sesuai filter.</td></tr>`}</tbody></table></div>
    <div class="dispensing-log-foot"><strong>${visible.length}</strong> transaksi ditemukan · ${customActive ? `${formatDateTime(rangeStart, true)} — ${formatDateTime(rangeEnd, true)}` : `Last ${state.chemicalLog.range.replace("H", " hours").replace("7D", "7 days")}`} · data penimbangan dapat ditelusuri per request code.</div>
  `, `<span class="data-pill neutral">CALATOR DISPENSING</span>`, "dispensing-log-panel");
}

function chemicalVariantSummaryTable() {
  return panel("Chemical Variant Summary", "Akumulasi hari ini per varian untuk Chemical Dispensing Calator", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Code</th><th>Chemical Variant</th><th>Dispensed Today</th><th>Daily Forecast</th><th>Forecast Usage</th><th>Availability</th></tr></thead><tbody>${chemicals.map((chemical) => {
    const pct = Math.round(chemical[2] / chemical[3] * 100);
    return `<tr><td class="mono"><strong>${chemical[0]}</strong></td><td>${chemical[1]}</td><td class="mono">${chemical[2].toLocaleString()} kg</td><td class="mono">${chemical[3].toLocaleString()} kg</td><td><div class="inline-progress"><i style="width:${pct}%;background:${chemical[4]}"></i></div><span class="mono">${pct}%</span></td><td><span class="data-pill good">Available</span></td></tr>`;
  }).join("")}</tbody></table></div>`, "", "chemical-summary-panel");
}

function chemicalDetailPage() {
  const machine = dispensers.find((item) => item.id === state.selected.chemical) || dispensers[0];
  const supported = dispensingSupportedCalators(machine);
  const usage = supported.flatMap((calator) => calatorChemicalUsage(calator));
  const totalUsage = usage.reduce((sum, item) => sum + item.kg, 0);
  const topChemical = chemicals.map((chemical) => ({ code: chemical[0], name: chemical[1], kg: usage.filter((item) => item.code === chemical[0]).reduce((sum, item) => sum + item.kg, 0) })).sort((a, b) => b.kg - a.kg)[0];
  return `
    ${processBreadcrumb("chemical", machine)}
    ${pageHead("chemical", selector(dispensers.filter((item) => item.area === machine.area), "chemical"))}
    ${machineHero(machine, "DSP", `${machine.areaLabel} · Chemical Dispensing Calator · 7 variants`)}
    ${chemicalDispensingPidPanel(machine)}
    <section class="kpi-grid">
      ${kpi("Supported Calators", supported.length, "machines", "CL", `<strong>${machine.areaLabel}</strong>· area coverage`)}
      ${kpi("Active Requests", "2", "requests", "RQ", "<strong>1 weighing · 1 hold</strong>")}
      ${kpi("Total Dispensed", totalUsage.toLocaleString(), "kg", "CH", "<strong>Selected unit</strong>· supported Calators")}
      ${kpi("Top Chemical", topChemical?.code || "—", "", "TC", `<strong>${topChemical?.name || "No data"}</strong>· ${topChemical?.kg.toLocaleString() || 0} kg`, "success")}
    </section>
    ${chemicalUsageByCalatorPanel(machine)}
    ${calatorChemicalRankingPanel(machine)}
    ${chemicalDispensingLogPanel(machine)}
  `;
}

function alarmsPage() {
  const areas = alarmDowntimeAreas();
  const totalDowntime = downtimeRecords.reduce((sum, record) => sum + record.unplanned, 0);
  const worstArea = areas[0];
  const scopeLabel = state.alarms.area === "all" ? "All Areas" : state.alarms.area;
  return `
    ${pageHead("alarms", `<button class="button" id="ack-all">Acknowledge visible</button><button class="button primary" data-page-target="trends">Open event timeline</button>`)}
    <section class="kpi-grid">
      ${kpi("Critical Active", "2", "alarms", "CR", "<strong class='danger'>Oldest 08:14</strong>", "danger")}
      ${kpi("Warning Active", "3", "alarms", "WR", "<strong>2 unacknowledged</strong>", "warning")}
      ${kpi("Unplanned Downtime", formatDowntime(totalDowntime), "", "DT", `<strong>${downtimeRecords.length} machines / assets</strong>· selected range`, "warning")}
      ${kpi("Highest Impact Area", worstArea.label, "", "HI", `<strong>${formatDowntime(worstArea.minutes)}</strong>· ${worstArea.events} events`, "danger")}
    </section>
    <section class="card filter-bar">
      <input class="search-control" id="alarm-search" placeholder="Cari alarm, machine, atau equipment..." />
      <select class="select-control" id="alarm-severity"><option value="all">All severity</option><option value="critical">Critical</option><option value="warning">Warning</option></select>
      <select class="select-control" id="alarm-area-filter"><option value="all">All areas</option>${areas.map((area) => `<option value="${area.label}" ${state.alarms.area === area.label ? "selected" : ""}>${area.label}</option>`).join("")}</select>
    </section>
    <section class="management-analysis-grid alarm-impact-grid">
      ${alarmDowntimeAreaPanel(areas)}
      ${alarmDowntimeMachinePanel(scopeLabel)}
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

function formatDowntime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return hours ? `${hours}h ${String(remaining).padStart(2, "0")}m` : `${remaining}m`;
}

function alarmDowntimeAreas() {
  const areaMap = new Map();
  downtimeRecords.forEach((record) => {
    const current = areaMap.get(record.area) || { label: record.area, minutes: 0, events: 0, machines: 0 };
    current.minutes += record.unplanned;
    current.events += record.events;
    current.machines += 1;
    areaMap.set(record.area, current);
  });
  return [...areaMap.values()].sort((a, b) => b.minutes - a.minutes);
}

function alarmDowntimeAreaPanel(areas) {
  const max = Math.max(...areas.map((area) => area.minutes));
  return panel("Downtime by Area", "Klik area untuk membandingkan mesin penyumbang downtime terbesar.", `<div class="downtime-area-list">${areas.map((area, index) => `
    <button class="downtime-area-row ${state.alarms.area === area.label ? "active" : ""}" data-alarm-downtime-area="${area.label}">
      <span class="downtime-area-rank">${index + 1}</span>
      <span class="downtime-area-copy"><strong>${area.label}</strong><small>${area.machines} machine / asset · ${area.events} alarm events</small><i><b style="width:${(area.minutes / max) * 100}%"></b></i></span>
      <span class="downtime-area-value"><strong>${formatDowntime(area.minutes)}</strong><small>unplanned</small></span>
    </button>`).join("")}</div>`, state.alarms.area !== "all" ? `<button class="button ghost small" data-alarm-downtime-area="all">Reset area</button>` : "");
}

function alarmDowntimeMachinePanel(scopeLabel) {
  const rows = downtimeRecords
    .filter((record) => state.alarms.area === "all" || record.area === state.alarms.area)
    .sort((a, b) => b.unplanned - a.unplanned);
  return panel(`Top Downtime Machines · ${scopeLabel}`, "Urutan berdasarkan unplanned downtime dalam selected range. Klik mesin untuk investigasi.", `<div class="table-wrap downtime-machine-table"><table class="data-table"><thead><tr><th>Rank</th><th>Machine / Equipment</th><th>Issue</th><th>Events</th><th>Unplanned</th><th>Last Event</th></tr></thead><tbody>${rows.map((record, index) => `<tr class="${record.process !== "utilities" ? "downtime-machine-row" : ""}" ${record.process !== "utilities" ? `data-alarm-machine="${record.process}|${record.machineId}" tabindex="0"` : ""}><td><span class="ranking-number">${index + 1}</span></td><td><strong>${record.machineId}</strong><small>${record.equipment} · ${record.area}</small></td><td>${record.reason}</td><td class="mono">${record.events}</td><td class="mono"><strong>${formatDowntime(record.unplanned)}</strong></td><td class="mono">${record.last}</td></tr>`).join("")}</tbody></table></div>`);
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
      if (select.dataset.machineSelect === "chemical") state.chemicalLog.calator = "all";
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
  document.getElementById("machine-power-type-select")?.addEventListener("change", (event) => {
    const type = event.target.value;
    const firstArea = processAreas[type][0];
    const firstMachine = fleetFor(type).find((machine) => machine.area === firstArea.code);
    state.utility.machinePowerType = type;
    state.utility.selectedPowerArea = firstArea.code;
    state.utility.selectedPowerMachine = firstMachine?.id || null;
    renderPage({ preserveScroll: true });
  });
  document.querySelectorAll("[data-machine-power-area]").forEach((button) => {
    button.addEventListener("click", () => {
      const area = button.dataset.machinePowerArea;
      const firstMachine = fleetFor(state.utility.machinePowerType).find((machine) => machine.area === area);
      state.utility.selectedPowerArea = area;
      state.utility.selectedPowerMachine = firstMachine?.id || null;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-machine-power-meter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.utility.selectedPowerMachine = button.dataset.machinePowerMeter;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-open-power-machine]").forEach((button) => {
    button.addEventListener("click", () => {
      const [type, machineId] = button.dataset.openPowerMachine.split("|");
      const machine = fleetFor(type).find((item) => item.id === machineId);
      if (!machine) return;
      state.page = type;
      state.selected[type] = machineId;
      state.drill[type] = { area: machine.area, machine: machineId };
      renderPage();
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
  document.querySelectorAll("[data-jetflow-process-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const process = checkbox.dataset.jetflowProcessToggle;
      const enabled = state.jetflowProgram.enabled;
      if (checkbox.checked && !enabled.includes(process)) enabled.push(process);
      if (!checkbox.checked) state.jetflowProgram.enabled = enabled.filter((item) => item !== process);
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-jetflow-process-bulk]").forEach((button) => {
    button.addEventListener("click", () => {
      state.jetflowProgram.enabled = button.dataset.jetflowProcessBulk === "on" ? [...jetflowProcessSteps] : [];
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-sensor-range]").forEach((button) => {
    button.addEventListener("click", () => {
      state.sensorTrend.range = button.dataset.sensorRange;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-chemical-log-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      state.chemicalLog[select.dataset.chemicalLogFilter] = select.value;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-chemical-custom-date]").forEach((input) => {
    input.addEventListener("change", () => {
      const value = new Date(input.value).getTime();
      if (Number.isFinite(value)) state.chemicalLog[input.dataset.chemicalCustomDate === "start" ? "customStart" : "customEnd"] = value;
    });
  });
  document.querySelectorAll("[data-chemical-custom-apply]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.chemicalLog.customEnd < state.chemicalLog.customStart) {
        [state.chemicalLog.customStart, state.chemicalLog.customEnd] = [state.chemicalLog.customEnd, state.chemicalLog.customStart];
      }
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-dispensing-calator-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.chemicalLog.calator = button.dataset.dispensingCalatorFilter;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-dispensing-calator-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      state.chemicalLog.calator = "all";
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-motor-drive-target]").forEach((card) => {
    const openMotorDrive = () => {
      state.motorDrive.selected = card.dataset.motorDriveTarget;
      state.motorDrive.source = card.dataset.motorDriveSource || "kalender";
      renderPage({ preserveScroll: true });
    };
    card.addEventListener("click", openMotorDrive);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openMotorDrive(); }
    });
  });
  document.querySelectorAll("[data-motor-drive-range]").forEach((button) => {
    button.addEventListener("click", () => {
      state.motorDrive.range = button.dataset.motorDriveRange;
      state.motorDrive.viewFraction = .28;
      state.motorDrive.viewStart = .72;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-motor-drive-metric]").forEach((button) => {
    button.addEventListener("click", () => {
      state.motorDrive.metric = button.dataset.motorDriveMetric;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-motor-drive-close]").forEach((button) => {
    button.addEventListener("click", () => {
      state.motorDrive.selected = null;
      state.motorDrive.source = null;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-motor-drive-backdrop]").forEach((backdrop) => {
    backdrop.addEventListener("click", (event) => {
      if (event.target !== backdrop) return;
      state.motorDrive.selected = null;
      state.motorDrive.source = null;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-motor-log-export]").forEach((button) => {
    button.addEventListener("click", exportMotorHistoricalLog);
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
  const alarmArea = document.getElementById("alarm-area-filter");
  if (alarmSearch) alarmSearch.addEventListener("input", filterAlarms);
  if (alarmSeverity) alarmSeverity.addEventListener("change", filterAlarms);
  if (alarmArea) alarmArea.addEventListener("change", (event) => {
    state.alarms.area = event.target.value;
    renderPage({ preserveScroll: true });
  });
  document.querySelectorAll("[data-alarm-downtime-area]").forEach((button) => {
    button.addEventListener("click", () => {
      state.alarms.area = button.dataset.alarmDowntimeArea;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-alarm-machine]").forEach((row) => {
    const openMachine = () => {
      const [type, machineId] = row.dataset.alarmMachine.split("|");
      state.selected[type] = machineId;
      navigate(type);
    };
    row.addEventListener("click", openMachine);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openMachine(); }
    });
  });
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
  const area = state.alarms.area;
  const list = document.getElementById("alarm-page-list");
  if (!list) return;
  const filtered = alarms.filter((a) => {
    const matchQuery = [a.title, a.detail, a.source].join(" ").toLowerCase().includes(query);
    const matchSeverity = severity === "all" || a.severity === severity;
    const matchArea = area === "all" || a.area === area;
    return matchQuery && matchSeverity && matchArea;
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
      drawMachinePowerAreaChart();
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
  if (state.motorDrive.selected && state.motorDrive.source === state.page) {
    drawMotorDriveTrend();
    bindMotorDrivePan();
  }
}

function drawSensorComparisonTrends(type) {
  const machine = fleetFor(type).find((item) => item.id === state.selected[type]);
  const selectedBatch = machine ? selectedBatchFor(type, machine) : null;
  if (!selectedBatch) return;
  const enabled = state.sensorTrend.enabled[type] || [];
  sensorTrendConfig[type].filter((sensor) => enabled.includes(sensor.key)).forEach((sensor) => {
    const series = sensorTrendSeries(type, sensor, selectedBatch);
    const program = type === "jetflow" ? jetflowProgramForSensor(sensor) : null;
    const selectedProcesses = state.jetflowProgram.enabled;
    drawLineChart(`sensor-trend-${type}-${sensor.key}`, [
      { data: series.pv, color: sensor.color, fill: true },
      { data: series.sv, color: sensor.color, dash: true },
    ], series.timestamps, {
      topPad: program ? 42 : 18,
      annotations: program ? {
        bands: jetflowProgramSchedule().filter((phase) => selectedProcesses.includes(phase.name)).map((phase) => ({
          start: phase.start,
          end: phase.end,
          label: `S${String(phase.step).padStart(2, "0")} ${phase.name}`,
          color: `${sensor.color}14`,
          textColor: sensor.color,
        })),
        markers: program.markers.filter((marker) => selectedProcesses.includes(marker.process)).map((marker) => ({
          position: marker.position,
          label: `${marker.value.toFixed(sensor.decimals)}${sensor.unit}`,
          color: sensor.color,
        })),
      } : null,
      labelFormatter: (timestamp) => new Date(timestamp).toLocaleTimeString("id-ID", state.sensorTrend.range === "24H"
        ? { day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }
        : { hour: "2-digit", minute: "2-digit", hour12: false }),
    });
  });
}

function drawMotorDriveTrend() {
  const motor = selectedMotorDriveAsset();
  if (!motor) return;
  const trend = motorDriveData(motor);
  const fraction = state.motorDrive.viewFraction;
  const start = Math.round(state.motorDrive.viewStart * (trend.values.length - 1));
  const end = Math.min(trend.values.length, start + Math.max(12, Math.round(trend.values.length * fraction)));
  const values = trend.values.slice(start, end);
  const timestamps = trend.timestamps.slice(start, end);
  drawLineChart("motor-drive-trend", [{ data: values, color: trend.color, fill: true }], timestamps, {
    labelFormatter: (timestamp) => new Date(timestamp).toLocaleTimeString("id-ID", state.motorDrive.range === "7D"
      ? { day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }
      : { hour: "2-digit", minute: "2-digit", hour12: false }),
  });
  const visibleStart = timestamps[0];
  const visibleEnd = timestamps.at(-1);
  const label = document.getElementById("motor-trend-visible-label");
  if (label && visibleStart && visibleEnd) label.textContent = `${trend.label} · ${new Date(visibleStart).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })} — ${new Date(visibleEnd).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })} · ${trend.unit}`;
  const selection = document.getElementById("motor-navigator-selection");
  if (selection) {
    selection.style.left = `${state.motorDrive.viewStart * 100}%`;
    selection.style.width = `${state.motorDrive.viewFraction * 100}%`;
  }
  const navigator = document.getElementById("motor-trend-navigator");
  if (navigator) {
    navigator.setAttribute("aria-valuenow", String(Math.round(state.motorDrive.viewStart * 100)));
    navigator.setAttribute("aria-valuetext", `${trend.label} visible range`);
  }
}

function shiftMotorDriveTrend(delta) {
  state.motorDrive.viewStart = clamp(state.motorDrive.viewStart + delta, 0, 1 - state.motorDrive.viewFraction);
  drawMotorDriveTrend();
}

function bindMotorDrivePan() {
  const canvas = document.getElementById("motor-drive-trend");
  const navigator = document.getElementById("motor-trend-navigator");
  const selection = document.getElementById("motor-navigator-selection");
  if (!canvas || !navigator || !selection) return;
  let canvasPointer = null;
  let canvasOriginX = 0;
  let canvasOriginStart = 0;
  canvas.addEventListener("pointerdown", (event) => {
    canvasPointer = event.pointerId;
    canvasOriginX = event.clientX;
    canvasOriginStart = state.motorDrive.viewStart;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (canvasPointer !== event.pointerId) return;
    const width = Math.max(1, canvas.getBoundingClientRect().width);
    const delta = (event.clientX - canvasOriginX) / width * state.motorDrive.viewFraction;
    state.motorDrive.viewStart = clamp(canvasOriginStart - delta, 0, 1 - state.motorDrive.viewFraction);
    drawMotorDriveTrend();
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
    shiftMotorDriveTrend(Math.sign(event.deltaX || event.deltaY) * state.motorDrive.viewFraction * .08);
  }, { passive: false });
  canvas.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    shiftMotorDriveTrend((event.key === "ArrowLeft" ? -1 : 1) * state.motorDrive.viewFraction * .12);
  });
  let navigatorPointer = null;
  let navigatorOriginX = 0;
  let navigatorOriginStart = 0;
  navigator.addEventListener("pointerdown", (event) => {
    const rect = navigator.getBoundingClientRect();
    if (!event.target.closest(".navigator-selection")) {
      state.motorDrive.viewStart = clamp((event.clientX - rect.left) / Math.max(1, rect.width) - state.motorDrive.viewFraction / 2, 0, 1 - state.motorDrive.viewFraction);
      drawMotorDriveTrend();
    }
    navigatorPointer = event.pointerId;
    navigatorOriginX = event.clientX;
    navigatorOriginStart = state.motorDrive.viewStart;
    navigator.setPointerCapture(event.pointerId);
    navigator.classList.add("dragging");
  });
  navigator.addEventListener("pointermove", (event) => {
    if (navigatorPointer !== event.pointerId) return;
    const width = Math.max(1, navigator.getBoundingClientRect().width);
    state.motorDrive.viewStart = clamp(navigatorOriginStart + (event.clientX - navigatorOriginX) / width, 0, 1 - state.motorDrive.viewFraction);
    drawMotorDriveTrend();
  });
  const stopNavigatorDrag = (event) => {
    if (navigatorPointer !== event.pointerId) return;
    navigatorPointer = null;
    navigator.classList.remove("dragging");
  };
  navigator.addEventListener("pointerup", stopNavigatorDrag);
  navigator.addEventListener("pointercancel", stopNavigatorDrag);
  navigator.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    shiftMotorDriveTrend((event.key === "ArrowLeft" ? -1 : 1) * state.motorDrive.viewFraction * .12);
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
  const pad = { top: options.topPad || 18, right: 12, bottom: 25, left: 42 };
  const all = series.flatMap((s) => s.data);
  let min = Math.min(...all);
  let max = Math.max(...all);
  const spread = max - min || 1;
  min -= spread * .14;
  max += spread * .14;
  ctx.clearRect(0, 0, width, height);
  ctx.font = "9px DM Mono, monospace";
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const xAt = (i, len) => pad.left + (i / Math.max(1, len - 1)) * plotW;
  const yAt = (value) => pad.top + (1 - (value - min) / (max - min)) * plotH;
  const annotation = options.annotations || {};
  (annotation.bands || []).forEach((band) => {
    const x = pad.left + Math.max(0, band.start) * plotW;
    const endX = pad.left + Math.min(1, band.end) * plotW;
    const bandWidth = Math.max(1, endX - x);
    ctx.fillStyle = band.color || "rgba(7,142,170,.08)";
    ctx.fillRect(x, pad.top, bandWidth, plotH);
    if (bandWidth > 42) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 2, 2, Math.max(1, bandWidth - 4), pad.top - 4);
      ctx.clip();
      ctx.fillStyle = band.textColor || "#078eaa";
      ctx.font = "7px DM Mono, monospace";
      ctx.fillText(band.label, x + 4, 10);
      ctx.restore();
    }
  });
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
  (annotation.markers || []).forEach((marker, index) => {
    const x = pad.left + Math.max(0, Math.min(1, marker.position)) * plotW;
    ctx.strokeStyle = marker.color || "#078eaa";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, height - pad.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = marker.color || "#078eaa";
    ctx.beginPath();
    ctx.arc(x, pad.top + 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    const text = marker.label || "SV";
    ctx.font = "7px DM Mono, monospace";
    const labelWidth = ctx.measureText(text).width + 6;
    const labelX = Math.max(pad.left, Math.min(x - labelWidth / 2, width - pad.right - labelWidth));
    const labelY = 15 + (index % 3) * 9;
    ctx.fillStyle = "rgba(255,255,255,.94)";
    ctx.fillRect(labelX, labelY - 7, labelWidth, 9);
    ctx.fillStyle = marker.color || "#078eaa";
    ctx.fillText(text, labelX + 3, labelY);
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

function drawMachinePowerAreaChart() {
  const canvas = document.getElementById("machine-power-area-chart");
  if (!canvas) return;
  const areas = machinePowerAreaSummary();
  const total = areas.reduce((sum, area) => sum + area.energy, 0);
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
  areas.forEach((area, index) => {
    const end = start + (total ? area.energy / total : 0) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = electricalColors[index];
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = area.code === state.utility.selectedPowerArea ? 4 : 2;
    ctx.stroke();
    slices.push({ start, end, area });
    start = end;
  });
  const areaAtPointer = (event) => {
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    if (Math.hypot(x, y) > Math.min(bounds.width, bounds.height) / 2 - 8) return null;
    let angle = Math.atan2(y, x);
    if (angle < -Math.PI / 2) angle += Math.PI * 2;
    return slices.find((slice) => angle >= slice.start && angle < slice.end)?.area || null;
  };
  canvas._machinePowerAreaAtPointer = areaAtPointer;
  if (canvas.dataset.machinePowerBound) return;
  canvas.dataset.machinePowerBound = "true";
  canvas.addEventListener("pointermove", (event) => {
    const area = canvas._machinePowerAreaAtPointer(event);
    const display = area ? powerEnergyDisplay(area.energy) : null;
    canvas.style.cursor = area ? "pointer" : "default";
    canvas.title = area ? `${area.label}: ${display.value} ${display.unit}` : "";
  });
  canvas.addEventListener("click", (event) => {
    const area = canvas._machinePowerAreaAtPointer(event);
    if (!area) return;
    state.utility.selectedPowerArea = area.code;
    state.utility.selectedPowerMachine = area.meters[0]?.id || null;
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
connectNonJetflowBackend();
window.setInterval(updateClock, 1000);
window.setInterval(updateLiveNumbers, 1800);
