function jakartaShiftSelection(timestamp = Date.now()) {
  const values = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp)).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const year = Number(values.year);
  const month = Number(values.month) - 1;
  const day = Number(values.day);
  const hour = Number(values.hour);
  const calendarDate = `${values.year}-${values.month}-${values.day}`;
  if (hour >= 23) return { productionDate: calendarDate, calendarDate, shiftCode: "C" };
  if (hour >= 15) return { productionDate: calendarDate, calendarDate, shiftCode: "B" };
  if (hour >= 7) return { productionDate: calendarDate, calendarDate, shiftCode: "A" };
  return { productionDate: new Date(Date.UTC(year, month, day - 1)).toISOString().slice(0, 10), calendarDate, shiftCode: "C" };
}

const defaultMachineShift = jakartaShiftSelection();

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
    range: "30D",
    anchorEnd: Date.now(),
    customStart: Date.now() - 30 * 24 * 60 * 60 * 1000,
    customEnd: Date.now(),
    variant: "all",
    mode: "all",
    status: "all",
    calator: "all",
    page: 1,
    pageSize: 25,
    chartHidden: [],
  },
  solar: {
    tab: "overview",
    range: "30D",
    customFrom: Date.now() - 30 * 86400000,
    customTo: Date.now(),
    search: "",
    status: "all",
    page: 1,
    pageSize: 25,
  },
  motorDrive: {
    selected: null,
    source: null,
    range: "8H",
    metric: "amp",
    viewStart: .72,
    viewFraction: .28,
  },
  machineSummary: {
    scope: "shift",
    productionDate: defaultMachineShift.productionDate,
    shiftCode: defaultMachineShift.shiftCode,
  },
  productionOutput: {
    mode: "effective",
    process: "kalender",
    productionDate: defaultMachineShift.productionDate,
    shiftCode: defaultMachineShift.shiftCode,
  },
  pidPanel: {
    kalender: false,
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
  alarmConfig: {
    assetId: null,
    tagCode: null,
    editingRuleId: null,
    draft: {},
    deviationAssetId: null,
    deviationPvTagCode: null,
    deviationSvTagCode: null,
    editingDeviationRuleId: null,
    deviationDraft: {},
  },
  machineTable: {
    process: "all",
    area: "all",
    status: "all",
    search: "",
    page: 1,
    pageSize: 8,
  },
  historyTable: {
    process: "all",
    area: "all",
    assetId: "all",
    role: "all",
    search: "",
    page: 1,
    pageSize: 15,
    fetchMode: "per_asset",
  },
};

const navigationStorageKey = "pt-smm.dashboard.navigation.v2";
const navigationPages = new Set(["overview", "jetflow", "calator", "dryer", "kalender", "utilities", "chemical", "solar", "alarms", "trends", "health"]);
const processNavigationPages = ["jetflow", "calator", "dryer", "kalender", "chemical"];

function restoreDashboardNavigation() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(navigationStorageKey) || "null");
    if (!saved || typeof saved !== "object") return;
    if (navigationPages.has(saved.page)) state.page = saved.page;
    processNavigationPages.forEach((type) => {
      if (typeof saved.selected?.[type] === "string") state.selected[type] = saved.selected[type];
      const savedDrill = saved.drill?.[type];
      if (savedDrill && typeof savedDrill === "object") {
        state.drill[type] = {
          area: typeof savedDrill.area === "string" ? savedDrill.area : null,
          machine: typeof savedDrill.machine === "string" ? savedDrill.machine : null,
        };
      }
      const savedBatch = saved.batchInvestigation?.[type];
      if (savedBatch && typeof savedBatch === "object") {
        state.batchInvestigation[type] = {
          machineId: typeof savedBatch.machineId === "string" ? savedBatch.machineId : null,
          batch: typeof savedBatch.batch === "string" ? savedBatch.batch : null,
          ...(typeof savedBatch.processRunId === "string" ? { processRunId: savedBatch.processRunId } : {}),
        };
      }
    });
    if (["batch", "shift", "today"].includes(saved.machineSummaryScope)) state.machineSummary.scope = saved.machineSummaryScope;
    if (/^\d{4}-\d{2}-\d{2}$/.test(saved.machineSummaryProductionDate || "")) state.machineSummary.productionDate = saved.machineSummaryProductionDate;
    if (["A", "B", "C"].includes(saved.machineSummaryShiftCode)) state.machineSummary.shiftCode = saved.machineSummaryShiftCode;
    if (["effective", "actual", "estimated"].includes(saved.productionOutput?.mode)) state.productionOutput.mode = saved.productionOutput.mode;
    if (["jetflow", "calator", "dryer", "kalender"].includes(saved.productionOutput?.process)) state.productionOutput.process = saved.productionOutput.process;
    if (/^\d{4}-\d{2}-\d{2}$/.test(saved.productionOutput?.productionDate || "")) state.productionOutput.productionDate = saved.productionOutput.productionDate;
    if (["A", "B", "C"].includes(saved.productionOutput?.shiftCode)) state.productionOutput.shiftCode = saved.productionOutput.shiftCode;
    if (typeof saved.pidPanel?.kalender === "boolean") state.pidPanel.kalender = saved.pidPanel.kalender;
  } catch {
    // Gunakan default navigation jika browser storage tidak tersedia atau rusak.
  }
}

function persistDashboardNavigation() {
  try {
    window.localStorage.setItem(navigationStorageKey, JSON.stringify({
      page: state.page,
      selected: state.selected,
      drill: state.drill,
      batchInvestigation: state.batchInvestigation,
      machineSummaryScope: state.machineSummary.scope,
      machineSummaryProductionDate: state.machineSummary.productionDate,
      machineSummaryShiftCode: state.machineSummary.shiftCode,
      productionOutput: state.productionOutput,
      pidPanel: state.pidPanel,
    }));
  } catch {
    // Dashboard tetap berfungsi selama sesi berjalan tanpa browser storage.
  }
}

restoreDashboardNavigation();

const backendConnection = {
  status: "connecting",
  dataMode: "ACTUAL_DATABASE",
  storage: null,
  lastSync: null,
  realtime: "connecting",
};
const authentication = {
  user: null,
  dashboardStarted: false,
  intervalsStarted: false,
};
const loginUsernameStorageKey = "pt-smm.dashboard.login-username";
const defaultHeartbeatStaleAfterSeconds = 30;

let backendUtilities = [];
let backendTelemetry = [];
let backendAlarmEvents = [];
let backendActiveAlarmEvents = [];
let backendEquipment = [];
let backendProcessRuns = [];
const productionOutputByBatch = { key: null, data: null, loading: false, error: null, requestId: 0 };
const solarFueling = { key: null, data: null, loading: false, error: null, requestId: 0 };
let realtimeSocket = null;
let realtimeRefreshTimer = null;
let deferredRealtimeRender = false;
let realtimeBackendRefreshInFlight = false;
const realtimePendingSources = new Set();
const realtimeUiRefresh = {
  pending: false,
  timer: null,
  activePointers: new Set(),
  lastInteractionAt: 0,
};
const pidInstrumentStateCache = new Map();
let pidInstrumentRequestId = 0;
let pidSubscribedAssetId = null;
const actualBatchPrograms = new Map();
const actualBatchProgramLoading = new Set();
const actualBatchProgramErrors = new Map();
const actualMachineSummaries = new Map();
const actualMachineSummaryLoading = new Set();
const actualMachineSummaryErrors = new Map();
const alarmConfiguration = {
  rules: [],
  deviationRules: [],
  tagsByAsset: new Map(),
  tagLoading: new Set(),
  tagErrors: new Map(),
  loading: false,
  loaded: false,
  error: null,
};
const alarmPopupUi = {
  selectedAlarmId: null,
};
const historianParameterStorageKey = "pt-smm.historian.selected-parameter.v2";

function loadHistorianParameterPreferences() {
  try {
    const value = JSON.parse(window.localStorage.getItem(historianParameterStorageKey) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

const historianParameterPreferences = loadHistorianParameterPreferences();
const actualHistorian = {
  range: "8H",
  cache: new Map(),
  loading: new Set(),
  explorerAssetId: null,
  viewStart: 0,
  viewFraction: 1,
  selectedParameter: new Map(),
  selectedEquipment: new Map(),
};

function rememberActualParameter(assetId, parameterKey) {
  if (!assetId || !parameterKey) return;
  actualHistorian.selectedParameter.set(assetId, parameterKey);
  historianParameterPreferences[assetId] = parameterKey;
  try {
    window.localStorage.setItem(historianParameterStorageKey, JSON.stringify(historianParameterPreferences));
  } catch {
    // The in-memory selection remains active when browser storage is unavailable.
  }
}

const pageMeta = {
  overview: ["Plant Overview", "Live Operations", "Seluruh proses, mesin, utilitas, dan exception dalam satu tampilan."],
  jetflow: ["Jetflow", "Dyeing Process", "Monitoring batch, tank, dosing, winch, pump, steam, dan alarm."],
  calator: ["Calator", "Washing Process", "Multi-speed, Overfeed Out, dancing roller, chemical, dan output."],
  dryer: ["Dryer", "Drying Process", "Speed, multi-chamber temperature, thermal oil, dan output."],
  kalender: ["Kalender", "Finishing Process", "Upper-lower balance, overfeed, width, motor, dan quality context."],
  utilities: ["Plant Utilities", "Resource Monitoring", "Electrical, water, steam, dan thermal oil supply-to-consumer."],
  chemical: ["Chemical Processing", "Dispensing Consumption", "Konsumsi per chemical, transaksi Automatic/Manual/Emergency, dan analisis per unit."],
  solar: ["Solar Fueling", "Fuel Operations", "Distribusi solar, validasi flow meter dan totalizer, serta kesesuaian stok aktual."],
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
  calator: [{ code: "DPN", label: "Depan", count: 3 }, { code: "BLK", label: "Belakang", count: 9 }, { code: "TMR", label: "Timur", count: 7 }],
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

const jetflowSequenceMeasurements = {
  "Filling": { parameter: "Main tank level", sv: "72.0 %", pv: "71.8 %" },
  "Drain": { parameter: "Main tank level", sv: "12.0 %", pv: "12.6 %" },
  "Rinse Cooling": { parameter: "Main tank temp", sv: "40.0 °C", pv: "40.8 °C" },
  "Check PH": { parameter: "pH", sv: "6.80", pv: "6.86" },
  "Temperature Control": { parameter: "Main tank temp", sv: "93.0 °C", pv: "92.6 °C" },
  "Inject DT 1": { parameter: "DT 1 weight", sv: "24.0 kg", pv: "24.0 kg" },
  "Inject DT 2": { parameter: "DT 2 weight", sv: "18.0 kg", pv: "17.8 kg" },
  "Dosing DT 1": { parameter: "DT 1 flow", sv: "9.0 L/min", pv: "8.9 L/min" },
  "Dosing DT 2": { parameter: "DT 2 flow", sv: "7.5 L/min", pv: "7.4 L/min" },
  "Load": { parameter: "Fabric load", sv: "320.0 kg", pv: "318.6 kg" },
  "Unload": { parameter: "Fabric load", sv: "0.0 kg", pv: "0.0 kg" },
  "ST To MT Filling": { parameter: "Dosing tank 1 level", sv: "65.0 %", pv: "64.8 %" },
};

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

// Semua fleet diisi hanya oleh endpoint PostgreSQL. Tidak ada fallback dummy di browser.
const jetflows = [];
const calators = [];
const dryers = [];
const kalenders = [];
const dispensers = [];
const alarms = [];
const downtimeRecords = [];

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

const chemicalDispensingLogs = [];
const chemicalAnalytics = {
  key: "",
  dataKey: "",
  loading: false,
  error: null,
  data: null,
  requestId: 0,
};

const chemicalChartColors = ["#078eaa", "#d97706", "#119b70", "#8267c7", "#d9485c", "#2563eb", "#c55f92", "#64748b", "#0f766e", "#b45309", "#7c3aed", "#be123c"];

function chemicalRangeWindow() {
  const end = state.chemicalLog.range === "CUSTOM" ? new Date(state.chemicalLog.customEnd) : new Date(state.chemicalLog.anchorEnd);
  let start;
  if (state.chemicalLog.range === "CUSTOM") start = new Date(state.chemicalLog.customStart);
  else if (state.chemicalLog.range === "THIS_MONTH") start = new Date(end.getFullYear(), end.getMonth(), 1);
  else {
    const hours = { "24H": 24, "7D": 24 * 7, "30D": 24 * 30 }[state.chemicalLog.range] || 24 * 30;
    start = new Date(end.getTime() - hours * 60 * 60_000);
  }
  return { start, end };
}

function chemicalAnalyticsQuery() {
  const range = chemicalRangeWindow();
  const dispenser = state.drill.chemical.machine || "all";
  const params = new URLSearchParams({
    from: range.start.toISOString(),
    to: range.end.toISOString(),
    dispenser_id: dispenser,
    chemical_code: state.chemicalLog.variant,
    mode: state.chemicalLog.mode,
    page: String(state.chemicalLog.page),
    page_size: String(state.chemicalLog.pageSize),
  });
  return { key: params.toString(), url: `/api/v1/chemical/analytics?${params.toString()}` };
}

function requestChemicalAnalytics({ preserveAnchor = null } = {}) {
  const query = chemicalAnalyticsQuery();
  if (chemicalAnalytics.key === query.key && (chemicalAnalytics.loading || chemicalAnalytics.dataKey === query.key || chemicalAnalytics.error)) return;
  const requestId = chemicalAnalytics.requestId + 1;
  chemicalAnalytics.requestId = requestId;
  chemicalAnalytics.key = query.key;
  chemicalAnalytics.loading = true;
  chemicalAnalytics.error = null;
  fetch(query.url, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`Chemical analytics unavailable (${response.status})`);
      return response.json();
    })
    .then((payload) => {
      if (chemicalAnalytics.requestId !== requestId) return;
      chemicalAnalytics.data = payload;
      chemicalAnalytics.dataKey = query.key;
      chemicalAnalytics.loading = false;
      if (state.page === "chemical") renderPage({ preserveScroll: true, preserveAnchor });
    })
    .catch((error) => {
      if (chemicalAnalytics.requestId !== requestId) return;
      chemicalAnalytics.loading = false;
      chemicalAnalytics.error = error instanceof Error ? error.message : "Chemical analytics unavailable";
      if (state.page === "chemical") renderPage({ preserveScroll: true, preserveAnchor });
    });
}

function invalidateChemicalAnalytics() {
  chemicalAnalytics.key = "";
  chemicalAnalytics.error = null;
}

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
    title.textContent = "Data services connected";
    detail.textContent = backendConnection.realtime === "connected" ? "Live updates active" : "Live updates reconnecting";
  } else if (backendConnection.status === "fallback") {
    title.textContent = "Data service unavailable";
    detail.textContent = "Live values cannot be loaded";
  }
}

function connectRealtimeChannel() {
  if (typeof window.io !== "function" || realtimeSocket) return;
  realtimeSocket = window.io("/realtime", { transports: ["websocket", "polling"] });
  realtimeSocket.on("connect", () => {
    backendConnection.realtime = "connected";
    realtimeSocket.emit("dashboard:subscribe");
    subscribeActivePidAsset();
    updateBackendIndicator();
  });
  realtimeSocket.on("disconnect", () => {
    backendConnection.realtime = "reconnecting";
    pidSubscribedAssetId = null;
    updateBackendIndicator();
  });
  realtimeSocket.on("dashboard:refresh", (payload) => {
    queueRealtimeBackendRefresh(payload?.sources);
  });
  realtimeSocket.on("alarm:active", (alarm) => {
    upsertActiveAlarm(alarm);
    updateNavigationCounts();
    showAlarmPopup(alarm);
    alarmConfiguration.loaded = false;
  });
  realtimeSocket.on("alarm:cleared", (alarm) => {
    removeActiveAlarm(alarm?.alarm_event_id);
    updateNavigationCounts();
    syncActiveAlarmPopups();
    alarmConfiguration.loaded = false;
  });
  realtimeSocket.on("instrument:delta", (payload) => {
    const assetId = String(payload?.asset_id || "").trim().toUpperCase();
    if (!assetId || !Array.isArray(payload?.states)) return;
    cachePidInstrumentStates(assetId, payload.states);
    if (activePidAssetId() === assetId) applyPidInstrumentStates(assetId);
  });
  realtimeSocket.on("asset:communication", (payload) => {
    const assetId = String(payload?.assetId || "").trim().toUpperCase();
    if (!assetId) return;
    const machine = actualFleet().find((item) => String(item.id).toUpperCase() === assetId);
    if (!machine) return;
    machine.connected = payload.connected === true;
    machine.connectionStatus = payload.connectionStatus || "NOT_CONNECTED";
    machine.heartbeatTagCode = payload.heartbeatTagCode || null;
    machine.heartbeatValue = payload.heartbeatValue ?? null;
    machine.heartbeatStaleAfterSeconds = Number(payload.heartbeatStaleAfterSeconds || defaultHeartbeatStaleAfterSeconds);
    machine.heartbeatSourceTs = payload.heartbeatSourceTs || null;
    machine.controlMode = payload.controlMode || "UNKNOWN";
    machine.controlModeQuality = payload.controlModeQuality || "NO_DATA";
    machine.controlModeSourceTs = payload.controlModeSourceTs || null;
    updateMachineConnectionIndicators();
  });
}

const pidVisualStateClasses = [
  "pid-live-open", "pid-live-closed", "pid-live-running", "pid-live-stopped",
  "pid-live-active", "pid-live-inactive", "pid-live-fault", "pid-live-alarm",
  "pid-live-stale", "pid-live-bad", "pid-live-unknown",
];

function activePidAssetId() {
  if (!document.querySelector(".chemical-dispensing-pid, .kalender-process-pid")) return null;
  const machineId = state.drill[state.page]?.machine;
  return typeof machineId === "string" && machineId ? machineId.toUpperCase() : null;
}

function cachePidInstrumentStates(assetId, states) {
  const assetCache = pidInstrumentStateCache.get(assetId) || new Map();
  states.forEach((item) => {
    if (!item?.elementCode) return;
    const key = item.tagCode || `${item.elementCode}.${item.parameterCode || "STATE"}`;
    assetCache.set(key, item);
  });
  pidInstrumentStateCache.set(assetId, assetCache);
}

function pidStatePriority(item) {
  const semantic = String(item?.semanticState || "UNKNOWN").toUpperCase();
  const quality = String(item?.quality || "UNKNOWN").toUpperCase();
  if (["BAD", "NOT_CONNECTED"].includes(quality) || ["BAD", "NOT_CONNECTED"].includes(semantic)) return 100;
  if (quality === "STALE" || semantic === "STALE") return 90;
  if (semantic === "FAULT") return 80;
  if (semantic === "ALARM") return 70;
  if (["OPEN", "RUNNING", "ACTIVE"].includes(semantic)) return 60;
  if (["CLOSED", "STOPPED", "INACTIVE"].includes(semantic)) return 50;
  return 10;
}

function pidVisualState(item) {
  const quality = String(item?.quality || "UNKNOWN").toUpperCase();
  const semantic = String(item?.semanticState || "UNKNOWN").toUpperCase();
  if (["BAD", "NOT_CONNECTED"].includes(quality) || ["BAD", "NOT_CONNECTED"].includes(semantic)) return "bad";
  if (quality === "STALE" || semantic === "STALE") return "stale";
  return ["OPEN", "CLOSED", "RUNNING", "STOPPED", "ACTIVE", "INACTIVE", "FAULT", "ALARM"].includes(semantic)
    ? semantic.toLowerCase()
    : "unknown";
}

function pidLiveDisplayValue(item) {
  const raw = item?.valueNumber ?? item?.value;
  const number = Number(raw);
  const value = Number.isFinite(number)
    ? number.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : raw == null || raw === "" ? "—" : String(raw);
  const unit = String(item?.engineeringUnit || "").trim();
  return `${value}${unit ? ` ${unit}` : ""}`;
}

function applyPidInstrumentStates(assetId) {
  if (activePidAssetId() !== assetId) return;
  const cached = [...(pidInstrumentStateCache.get(assetId)?.values() || [])];
  const controlModeState = cached.find((item) => String(item.elementCode || "").toUpperCase() === "MACHINE"
    && String(item.parameterCode || "").toUpperCase() === "AUTO_MODE_FB");
  const machine = dispensers.find((item) => String(item.id).toUpperCase() === assetId);
  if (machine && controlModeState) {
    const valueText = String(controlModeState.valueText ?? controlModeState.value ?? "").trim().toUpperCase();
    machine.controlMode = ["AUTO", "AUTOMATIC"].includes(valueText) || controlModeState.booleanValue === true
      ? "AUTO"
      : valueText === "MANUAL" || controlModeState.booleanValue === false
        ? "MANUAL"
        : "UNKNOWN";
    machine.controlModeQuality = controlModeState.quality || "NO_DATA";
    machine.controlModeSourceTs = controlModeState.sourceTs || null;
    updateChemicalControlModeIndicators();
  }
  const byElement = new Map();
  cached.forEach((item) => {
    const code = String(item.elementCode || "").toUpperCase();
    if (!code) return;
    const current = byElement.get(code);
    if (!current || pidStatePriority(item) >= pidStatePriority(current)) byElement.set(code, item);
  });

  document.querySelectorAll(".chemical-dispensing-pid [data-element-code], .kalender-process-pid [data-element-code]").forEach((element) => {
    const item = byElement.get(String(element.dataset.elementCode || "").toUpperCase());
    element.classList.remove(...pidVisualStateClasses);
    if (!item) return;
    const visualState = pidVisualState(item);
    element.classList.add("pid-live-state", `pid-live-${visualState}`);
    element.dataset.pidSemanticState = String(item.semanticState || "UNKNOWN").toUpperCase();
    element.dataset.pidQuality = String(item.quality || "UNKNOWN").toUpperCase();
    const sourceTime = item.sourceTs ? new Date(item.sourceTs).toLocaleString("id-ID", { hour12: false }) : "—";
    const stateLabel = `${element.dataset.pidSemanticState} · ${element.dataset.pidQuality} · ${sourceTime}`;
    if (!element.dataset.pidBaseLabel) element.dataset.pidBaseLabel = element.getAttribute("aria-label") || element.dataset.elementCode;
    element.setAttribute("aria-label", `${element.dataset.pidBaseLabel} · ${stateLabel}`);
    const title = [...element.children].find((child) => child.tagName?.toLowerCase() === "title");
    if (title) title.textContent = `${element.dataset.pidBaseLabel} · ${stateLabel}`;
    element.querySelectorAll("[data-pid-live-value]").forEach((label) => {
      const parameterCode = String(label.dataset.pidLiveValue || "").toUpperCase();
      const valueItem = cached.find((candidate) => String(candidate.elementCode || "").toUpperCase() === String(element.dataset.elementCode || "").toUpperCase()
        && String(candidate.parameterCode || "").toUpperCase() === parameterCode);
      if (!valueItem) return;
      const prefix = label.dataset.pidValuePrefix || "";
      const quality = String(valueItem.quality || "UNKNOWN").toUpperCase();
      label.textContent = `${prefix}${pidLiveDisplayValue(valueItem)}`;
      label.dataset.quality = quality;
      const readout = label.closest("[data-pid-live-readout]");
      if (readout) {
        readout.dataset.quality = quality;
        const qualityLabel = [...readout.querySelectorAll("[data-pid-live-quality]")]
          .find((candidate) => String(candidate.dataset.pidLiveQuality || "").toUpperCase() === parameterCode);
        if (qualityLabel) qualityLabel.textContent = quality === "GOOD" ? "LIVE · GOOD" : quality.replaceAll("_", " ");
      }
    });
  });
}

function subscribeActivePidAsset() {
  const assetId = activePidAssetId();
  if (!assetId || !realtimeSocket?.connected) return;
  if (pidSubscribedAssetId === assetId) return;
  pidSubscribedAssetId = assetId;
  realtimeSocket.emit("asset:subscribe", { asset_id: assetId });
}

async function activatePidBindingForCurrentView() {
  const assetId = activePidAssetId();
  if (!assetId) return;
  subscribeActivePidAsset();
  applyPidInstrumentStates(assetId);
  const requestId = ++pidInstrumentRequestId;
  try {
    const response = await fetch(`/api/v1/assets/${encodeURIComponent(assetId)}/instrument-states`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Instrument state API ${response.status}`);
    const payload = await response.json();
    if (requestId !== pidInstrumentRequestId || activePidAssetId() !== assetId) return;
    cachePidInstrumentStates(assetId, payload.states || []);
    applyPidInstrumentStates(assetId);
  } catch (error) {
    console.warn("P&ID live-state binding unavailable", error);
  }
}

function utilityValue(code, fallback) {
  return backendUtilities.find((item) => item.utility_code === code)?.value ?? "—";
}

function hydrateChemicalTransactions(rows) {
  const now = Date.now();
  chemicalDispensingLogs.splice(0, chemicalDispensingLogs.length, ...rows.map((item) => ({
    hoursAgo: Math.max(0, (now - new Date(item.occurred_at).getTime()) / 3600000),
    time: backendTimeLabel(item.occurred_at),
    request: item.request_code,
    dispenser: item.dispenser_id,
    calator: item.calator_id,
    code: item.chemical_code,
    variant: item.chemical_name,
    target: item.target_kg == null ? "—" : `${Number(item.target_kg).toFixed(1)} kg`,
    actual: item.actual_kg == null ? "—" : `${Number(item.actual_kg).toFixed(1)} kg`,
    mode: item.mode,
    status: item.status,
    operator: item.operator_name || "—",
    stage: item.stage || "—",
  })));
}

const backendProcesses = ["jetflow", "calator", "dryer", "kalender", "chemical"];

async function fetchJson(url, label) {
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 401 && !String(url).includes("/auth/")) showAuthenticationScreen("Session Anda telah berakhir. Silakan masuk kembali.");
  if (!response.ok) throw new Error(`${label} unavailable (${response.status})`);
  return response.json();
}

function solarRange() {
  const end = state.solar.range === "CUSTOM" ? new Date(state.solar.customTo) : new Date();
  const durations = { "TODAY": 86400000, "7D": 7 * 86400000, "30D": 30 * 86400000, "90D": 90 * 86400000 };
  const start = state.solar.range === "CUSTOM" ? new Date(state.solar.customFrom) : new Date(end.getTime() - (durations[state.solar.range] || durations["30D"]));
  return { from: start.toISOString(), to: end.toISOString() };
}

function solarRequestKey() {
  const range = solarRange();
  return `${range.from}|${range.to}|${state.solar.search}|${state.solar.status}|${state.solar.page}|${state.solar.pageSize}`;
}

async function loadSolarFueling({ force = false, preserveScroll = true } = {}) {
  const key = solarRequestKey();
  if (solarFueling.loading || (!force && solarFueling.key === key && solarFueling.data)) return;
  const requestId = ++solarFueling.requestId;
  solarFueling.loading = true;
  solarFueling.error = null;
  if (state.page === "solar") renderPage({ preserveScroll });
  try {
    const range = solarRange();
    const common = new URLSearchParams({ from: range.from, to: range.to });
    const transactionQuery = new URLSearchParams({ ...Object.fromEntries(common), search: state.solar.search, status: state.solar.status, page: String(state.solar.page), page_size: String(state.solar.pageSize) });
    const [overview, transactions, movements, opnames] = await Promise.all([
      fetchJson(`/api/v1/solar/overview?${common}`, "Solar overview API"),
      fetchJson(`/api/v1/solar/transactions?${transactionQuery}`, "Solar transaction API"),
      fetchJson(`/api/v1/solar/stock/movements?${common}`, "Solar stock movement API"),
      fetchJson(`/api/v1/solar/stock-opnames?${common}`, "Solar stock opname API"),
    ]);
    if (requestId !== solarFueling.requestId) return;
    solarFueling.key = key;
    solarFueling.data = { overview, transactions, movements, opnames };
  } catch (error) {
    if (requestId !== solarFueling.requestId) return;
    solarFueling.error = error instanceof Error ? error.message : "Solar fueling data unavailable";
  } finally {
    if (requestId !== solarFueling.requestId) return;
    solarFueling.loading = false;
    if (state.page === "solar") renderPage({ preserveScroll });
  }
}

function invalidateSolarFueling() {
  solarFueling.key = null;
  solarFueling.requestId += 1;
  solarFueling.loading = false;
}

async function submitSolarJson(url, method, payload) {
  const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || result.error || `Request gagal (${response.status})`);
  invalidateSolarFueling();
  await loadSolarFueling({ force: true });
  return result;
}

function productionOutputRequestKey() {
  const config = state.productionOutput;
  return `${config.productionDate}|${config.shiftCode}|${config.process}`;
}

function productionOutputRequestUrl() {
  const config = state.productionOutput;
  const query = new URLSearchParams({
    production_date: config.productionDate,
    shift_code: config.shiftCode,
    process_type: config.process,
  });
  return `/api/v1/production/output-by-batch?${query}`;
}

function invalidateProductionOutputByBatch() {
  productionOutputByBatch.requestId += 1;
  productionOutputByBatch.key = null;
  productionOutputByBatch.data = null;
  productionOutputByBatch.loading = false;
  productionOutputByBatch.error = null;
}

async function loadProductionOutputByBatch({ render = true, force = false } = {}) {
  const requestKey = productionOutputRequestKey();
  if (!force && productionOutputByBatch.key === requestKey && (productionOutputByBatch.data || productionOutputByBatch.error)) return;
  const requestId = productionOutputByBatch.requestId + 1;
  productionOutputByBatch.requestId = requestId;
  productionOutputByBatch.loading = true;
  productionOutputByBatch.error = null;
  try {
    const payload = await fetchJson(productionOutputRequestUrl(), "Production output API");
    if (requestId !== productionOutputByBatch.requestId || requestKey !== productionOutputRequestKey()) return;
    productionOutputByBatch.key = requestKey;
    productionOutputByBatch.data = payload;
  } catch (error) {
    if (requestId !== productionOutputByBatch.requestId || requestKey !== productionOutputRequestKey()) return;
    productionOutputByBatch.key = requestKey;
    productionOutputByBatch.error = error instanceof Error ? error.message : "Production output unavailable";
  } finally {
    if (requestId !== productionOutputByBatch.requestId) return;
    productionOutputByBatch.loading = false;
    if (render && state.page === "overview") renderPage({ preserveAnchor: ".production-output-panel" });
  }
}

async function refreshAssetFleets() {
  const payloads = await Promise.all(backendProcesses.map(async (process) => [
    process,
    await fetchJson(`/api/v1/assets?process=${process}`, `Asset API ${process}`),
  ]));
  const targetFleet = { jetflow: jetflows, calator: calators, dryer: dryers, kalender: kalenders, chemical: dispensers };
  payloads.forEach(([process, payload]) => targetFleet[process].splice(0, targetFleet[process].length, ...(payload.assets || [])));
}

function realtimeRenderBlocked() {
  const active = document.activeElement;
  const controlFocused = active?.matches?.("input, select, textarea, [contenteditable='true']");
  return document.hidden
    || realtimeUiRefresh.activePointers.size > 0
    || controlFocused
    || Boolean(document.querySelector("[data-motor-drive-backdrop], .sidebar.open"))
    || Date.now() - realtimeUiRefresh.lastInteractionAt < 1200;
}

function scheduleSafeRealtimeRender() {
  realtimeUiRefresh.pending = true;
  if (realtimeUiRefresh.timer) return;
  const attempt = () => {
    realtimeUiRefresh.timer = null;
    if (!realtimeUiRefresh.pending) return;
    if (realtimeRenderBlocked()) {
      realtimeUiRefresh.timer = window.setTimeout(attempt, 400);
      return;
    }
    realtimeUiRefresh.pending = false;
    deferredRealtimeRender = false;
    renderPage({ preserveScroll: true });
  };
  realtimeUiRefresh.timer = window.setTimeout(attempt, 400);
}

function markRealtimeInteraction() {
  realtimeUiRefresh.lastInteractionAt = Date.now();
}

function queueRealtimeBackendRefresh(sources) {
  const values = Array.isArray(sources) && sources.length ? sources : ["__all__"];
  values.forEach((source) => realtimePendingSources.add(String(source)));
  if (realtimeRefreshTimer) clearTimeout(realtimeRefreshTimer);
  realtimeRefreshTimer = window.setTimeout(() => {
    realtimeRefreshTimer = null;
    void flushRealtimeBackendRefresh();
  }, 180);
}

async function flushRealtimeBackendRefresh() {
  if (realtimeBackendRefreshInFlight) return;
  const sources = new Set(realtimePendingSources);
  realtimePendingSources.clear();
  if (!sources.size) return;
  realtimeBackendRefreshInFlight = true;
  try {
    await refreshBackendSources(sources);
  } catch (error) {
    console.warn("Selective realtime refresh failed", error);
  } finally {
    realtimeBackendRefreshInFlight = false;
    if (realtimePendingSources.size) queueRealtimeBackendRefresh([...realtimePendingSources]);
  }
}

async function refreshBackendSources(sources) {
  const knownSources = new Set([
    "asset", "asset_snapshot", "utility_snapshot", "chemical_transaction", "alarm_event", "alarm_rule_state",
    "solar_fueling_transaction", "solar_level_sample", "solar_stock_movement", "solar_stock_opname",
    "production_batch", "batch_process_run", "equipment", "equipment_snapshot", "telemetry_sample",
    "process_deviation_rule", "process_target_execution", "process_setpoint_change_event", "process_deviation_event",
  ]);
  const refreshAll = sources.has("__all__") || [...sources].some((source) => !knownSources.has(source));
  const tasks = [];

  if (refreshAll || sources.has("asset") || sources.has("asset_snapshot")) tasks.push(refreshAssetFleets());
  if (refreshAll || sources.has("chemical_transaction")) {
    tasks.push(fetchJson("/api/v1/dispensing/transactions", "Chemical transaction API").then((payload) => {
      hydrateChemicalTransactions(payload.transactions || []);
      if (state.chemicalLog.range !== "CUSTOM") state.chemicalLog.anchorEnd = Date.now();
      invalidateChemicalAnalytics();
    }));
  }
  if (refreshAll || sources.has("utility_snapshot")) {
    tasks.push(fetchJson("/api/v1/utilities/snapshot", "Utility API").then((payload) => { backendUtilities = payload.utilities || []; }));
  }
  if (refreshAll || sources.has("solar_fueling_transaction") || sources.has("solar_level_sample") || sources.has("solar_stock_movement") || sources.has("solar_stock_opname")) {
    invalidateSolarFueling();
    if (state.page === "solar") tasks.push(loadSolarFueling({ force: true }));
  }
  if (refreshAll || sources.has("alarm_event") || sources.has("alarm_rule_state")) {
    tasks.push(fetchJson("/api/v1/alarms/recent?limit=100", "Alarm API").then((payload) => {
      backendAlarmEvents = payload.alarms || [];
      backendActiveAlarmEvents = payload.active_alarms || backendAlarmEvents.filter((item) => item.event_state !== "CLEARED");
    }));
  }
  if (refreshAll || sources.has("equipment") || sources.has("equipment_snapshot")) {
    tasks.push(fetchJson("/api/v1/equipment", "Equipment API").then((payload) => { backendEquipment = payload.equipment || []; }));
  }
  if (refreshAll || sources.has("production_batch") || sources.has("batch_process_run")) {
    tasks.push(fetchJson("/api/v1/batch/process-runs", "Batch process API").then((payload) => {
      backendProcessRuns = payload.runs || [];
      actualMachineSummaries.clear();
    }));
  }
  if (refreshAll || sources.has("process_deviation_rule")) alarmConfiguration.loaded = false;
  if (refreshAll || sources.has("process_target_execution") || sources.has("process_setpoint_change_event") || sources.has("process_deviation_event")) {
    actualBatchPrograms.clear();
    actualBatchProgramErrors.clear();
  }
  if (refreshAll || sources.has("telemetry_sample")) {
    const fetchMode = state.historyTable.fetchMode || "per_asset";
    const telemetryUrl = fetchMode === "per_asset"
      ? "/api/v1/telemetry/recent?per_asset=true&limit=2000"
      : "/api/v1/telemetry/recent?limit=500";
    tasks.push(fetchJson(telemetryUrl, "Telemetry API").then((payload) => { backendTelemetry = payload.samples || []; }));
  }
  if (refreshAll || sources.has("production_batch") || sources.has("batch_process_run") || sources.has("telemetry_sample")) {
    invalidateProductionOutputByBatch();
    tasks.push(loadProductionOutputByBatch({ render: false, force: true }));
  }

  await Promise.all(tasks);
  backendConnection.lastSync = new Date().toISOString();
  updateNavigationCounts();
  syncActiveAlarmPopups();
  updateBackendIndicator();
  if (realtimeSourcesAffectCurrentPage(sources, refreshAll)) scheduleSafeRealtimeRender();
}

function realtimeSourcesAffectCurrentPage(sources, refreshAll = false) {
  if (refreshAll || state.page === "overview") return true;
  const sourceGroups = {
    asset: new Set(["asset", "asset_snapshot"]),
    batch: new Set(["production_batch", "batch_process_run", "process_target_execution", "process_setpoint_change_event", "process_deviation_event"]),
    alarm: new Set(["alarm_event", "alarm_rule_state", "process_deviation_rule", "process_deviation_event"]),
    equipment: new Set(["equipment", "equipment_snapshot"]),
    utility: new Set(["utility_snapshot"]),
    chemical: new Set(["chemical_transaction"]),
    solar: new Set(["solar_fueling_transaction", "solar_level_sample", "solar_stock_movement", "solar_stock_opname"]),
    telemetry: new Set(["telemetry_sample"]),
  };
  const matches = (...groups) => groups.some((group) => [...sourceGroups[group]].some((source) => sources.has(source)));
  if (["jetflow", "calator", "dryer", "kalender"].includes(state.page)) return matches("asset", "batch", "alarm", "equipment");
  if (state.page === "chemical") return matches("asset", "chemical", "alarm");
  if (state.page === "solar") return matches("solar");
  if (state.page === "utilities") return matches("utility", "asset");
  if (state.page === "alarms") return matches("alarm");
  if (state.page === "trends") return matches("telemetry", "batch");
  if (state.page === "health") return matches("telemetry", "asset", "equipment");
  return true;
}

async function connectNonJetflowBackend() {
  try {
    const status = await fetchJson("/api/v1/integration/status", "Backend status");
    const fetchMode = state.historyTable.fetchMode || "per_asset";
    const telemetryUrl = fetchMode === "per_asset"
      ? "/api/v1/telemetry/recent?per_asset=true&limit=2000"
      : "/api/v1/telemetry/recent?limit=500";
    const [, chemicalPayload, utilityPayload, telemetryPayload, alarmPayload, equipmentPayload, processRunPayload] = await Promise.all([
      refreshAssetFleets(),
      fetchJson("/api/v1/dispensing/transactions", "Chemical transaction API"),
      fetchJson("/api/v1/utilities/snapshot", "Utility API"),
      fetchJson(telemetryUrl, "Telemetry API"),
      fetchJson("/api/v1/alarms/recent?limit=100", "Alarm API"),
      fetchJson("/api/v1/equipment", "Equipment API"),
      fetchJson("/api/v1/batch/process-runs", "Batch process API"),
    ]);
    hydrateChemicalTransactions(chemicalPayload.transactions || []);
    backendUtilities = utilityPayload.utilities || [];
    backendTelemetry = telemetryPayload.samples || [];
    backendAlarmEvents = alarmPayload.alarms || [];
    backendActiveAlarmEvents = alarmPayload.active_alarms || backendAlarmEvents.filter((item) => item.event_state !== "CLEARED");
    backendEquipment = equipmentPayload.equipment || [];
    backendProcessRuns = processRunPayload.runs || [];
    backendConnection.status = "connected";
    backendConnection.storage = status.storage;
    backendConnection.dataMode = status.data_mode;
    backendConnection.lastSync = status.server_time;
    void loadProductionOutputByBatch();
    updateNavigationCounts();
    syncActiveAlarmPopups();
  } catch {
    backendConnection.status = "fallback";
  }
  updateBackendIndicator();
  requestHistorianRender();
}

function statusPill(value) {
  const labels = { running: "Running", warning: "Warning", fault: "Fault", idle: "Idle", offline: "Offline" };
  return `<span class="status-pill ${value}">${labels[value] || value}</span>`;
}

function heartbeatAgeLabel(ageSeconds) {
  if (!Number.isFinite(ageSeconds)) return "Heartbeat belum diterima";
  if (ageSeconds < 1) return "Heartbeat baru diterima";
  if (ageSeconds < 60) return `Heartbeat ${Math.floor(ageSeconds)} detik lalu`;
  return `Heartbeat ${Math.floor(ageSeconds / 60)} menit lalu`;
}

function machineConnectionSnapshot(machine, now = Date.now()) {
  const quality = String(machine?.connectionStatus || "").toUpperCase();
  const staleAfterSeconds = Math.max(1, Number(machine?.heartbeatStaleAfterSeconds) || defaultHeartbeatStaleAfterSeconds);
  const heartbeatTime = machine?.heartbeatSourceTs ? new Date(machine.heartbeatSourceTs).getTime() : Number.NaN;
  const ageSeconds = Number.isFinite(heartbeatTime) ? Math.max(0, (now - heartbeatTime) / 1000) : Number.NaN;

  // Kompatibilitas untuk data demo lama yang belum memiliki tag heartbeat.
  if (!quality && !Number.isFinite(heartbeatTime)) {
    return {
      state: machine?.connected ? "connected" : "disconnected",
      label: machine?.connected ? "Connected" : "Disconnected",
      detail: "Status snapshot",
    };
  }

  const connected = machine?.connected === true
    && quality === "GOOD"
    && Number.isFinite(ageSeconds)
    && ageSeconds <= staleAfterSeconds;
  if (connected) return { state: "connected", label: "Connected", detail: heartbeatAgeLabel(ageSeconds) };
  const timedOut = Number.isFinite(ageSeconds) && ageSeconds > staleAfterSeconds;
  return {
    state: "disconnected",
    label: "Disconnected",
    detail: timedOut ? `Timeout ${staleAfterSeconds} detik · ${heartbeatAgeLabel(ageSeconds).replace("Heartbeat ", "")}` : heartbeatAgeLabel(ageSeconds),
  };
}

function machineConnectionBadge(machine, mode = "connection") {
  const connection = machineConnectionSnapshot(machine);
  const connectedLabel = mode === "controller" ? "Controller Active" : "Connected";
  const disconnectedLabel = mode === "controller" ? "Controller Offline" : "Disconnected";
  const label = connection.state === "connected" ? connectedLabel : disconnectedLabel;
  return `<span class="machine-connection-status ${connection.state}" data-machine-connection-id="${actualText(machine.id)}" data-connection-connected-label="${connectedLabel}" data-connection-disconnected-label="${disconnectedLabel}" title="${actualText(connection.detail)}"><i aria-hidden="true"></i><span><strong data-connection-label>${label}</strong><small data-connection-detail>${actualText(connection.detail)}</small></span></span>`;
}

function updateMachineConnectionIndicators() {
  const machines = new Map(actualFleet().map((machine) => [String(machine.id).toUpperCase(), machine]));
  document.querySelectorAll("[data-machine-connection-id]").forEach((element) => {
    const machine = machines.get(String(element.dataset.machineConnectionId || "").toUpperCase());
    if (!machine) return;
    const connection = machineConnectionSnapshot(machine);
    element.classList.toggle("connected", connection.state === "connected");
    element.classList.toggle("disconnected", connection.state === "disconnected");
    element.title = connection.detail;
    const label = element.querySelector("[data-connection-label]");
    const detail = element.querySelector("[data-connection-detail]");
    if (label) label.textContent = connection.state === "connected"
      ? element.dataset.connectionConnectedLabel || connection.label
      : element.dataset.connectionDisconnectedLabel || connection.label;
    if (detail) detail.textContent = connection.detail;
  });
  updateChemicalControlModeIndicators();
}

function machineControlModeSnapshot(machine) {
  const connection = machineConnectionSnapshot(machine);
  const quality = String(machine?.controlModeQuality || "NO_DATA").toUpperCase();
  const mode = String(machine?.controlMode || "UNKNOWN").toUpperCase();
  if (connection.state !== "connected") return { state: "unknown", label: "UNKNOWN", detail: "Controller offline · mode tidak dapat divalidasi" };
  if (quality !== "GOOD" || !["AUTO", "MANUAL"].includes(mode)) {
    return { state: "unknown", label: "UNKNOWN", detail: `Feedback mode ${quality.replaceAll("_", " ")}` };
  }
  return {
    state: mode.toLowerCase(),
    label: mode,
    detail: machine?.controlModeSourceTs ? `Feedback aktual · ${backendTimeLabel(machine.controlModeSourceTs)}` : "Feedback aktual controller",
  };
}

function machineControlModeBadge(machine, compact = false) {
  const snapshot = machineControlModeSnapshot(machine);
  return `<span class="chemical-control-mode ${snapshot.state}${compact ? " compact" : ""}" data-chemical-control-mode-id="${actualText(machine.id)}" title="${actualText(snapshot.detail)}"><b aria-hidden="true" data-control-mode-symbol>${snapshot.state === "auto" ? "A" : snapshot.state === "manual" ? "M" : "?"}</b><span><small>Control mode</small><strong data-control-mode-label>${snapshot.label}</strong><em data-control-mode-detail>${actualText(snapshot.detail)}</em></span></span>`;
}

function updateChemicalControlModeIndicators() {
  const machines = new Map(dispensers.map((machine) => [String(machine.id).toUpperCase(), machine]));
  document.querySelectorAll("[data-chemical-control-mode-id]").forEach((element) => {
    const machine = machines.get(String(element.dataset.chemicalControlModeId || "").toUpperCase());
    if (!machine) return;
    const snapshot = machineControlModeSnapshot(machine);
    element.classList.remove("auto", "manual", "unknown");
    element.classList.add(snapshot.state);
    element.title = snapshot.detail;
    const symbol = element.querySelector("[data-control-mode-symbol]");
    const label = element.querySelector("[data-control-mode-label]");
    const detail = element.querySelector("[data-control-mode-detail]");
    if (symbol) symbol.textContent = snapshot.state === "auto" ? "A" : snapshot.state === "manual" ? "M" : "?";
    if (label) label.textContent = snapshot.label;
    if (detail) detail.textContent = snapshot.detail;
  });
}

function liveValue(value, unit = "", variance = 0.2, decimals = 1) {
  if (backendConnection.status === "connected" && backendConnection.dataMode === "ACTUAL_DATABASE") {
    return `<span class="live-number no-data">—</span><small>${unit}</small>`;
  }
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

function activeAlarmsForAsset(assetId) {
  return backendActiveAlarmEvents
    .filter((alarm) => alarm.asset_id === assetId && alarm.event_state !== "CLEARED")
    .sort((left, right) => {
      const priority = { critical: 0, warning: 1, info: 2 };
      const severityOrder = (priority[String(left.severity || "warning").toLowerCase()] ?? 3) - (priority[String(right.severity || "warning").toLowerCase()] ?? 3);
      return severityOrder || new Date(right.occurred_at || 0) - new Date(left.occurred_at || 0);
    });
}

function machineAlarmNote(assetId, compact = false) {
  const events = activeAlarmsForAsset(assetId);
  if (!events.length) return compact ? `<span class="machine-alarm-clear">No active alarm</span>` : "";
  const criticalCount = events.filter((alarm) => String(alarm.severity).toLowerCase() === "critical").length;
  const primary = events[0];
  const tone = criticalCount ? "critical" : "warning";
  const countLabel = criticalCount ? `${criticalCount} critical` : `${events.length} active`;
  const ruleType = String(primary.rule_type || primary.alarm_type || "HIGH").replace(/^RULE_/, "");
  const operator = alarmRuleOperator(ruleType);
  const unit = primary.engineering_unit || "";
  const threshold = primary.threshold_value == null ? Number.NaN : Number(primary.threshold_value);
  const trigger = primary.trigger_value == null ? Number.NaN : Number(primary.trigger_value);
  const thresholdText = Number.isFinite(threshold) ? `${operator} ${threshold.toLocaleString("id-ID", { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ""}` : "—";
  const triggerText = Number.isFinite(trigger) ? `${trigger.toLocaleString("id-ID", { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ""}` : "—";
  if (compact) return `<span class="machine-alarm-compact ${tone}"><span class="machine-alarm-signal" aria-hidden="true"></span><span><strong>${actualText(countLabel)}</strong><small>${actualTime(primary.occurred_at)} · Rule ${actualText(thresholdText)}</small></span></span>`;
  return `<div class="machine-active-alarm-note ${tone}" role="note" aria-label="Active alarm information">
    <span class="machine-alarm-signal" aria-hidden="true"></span>
    <span class="machine-alarm-summary"><strong>${actualText(countLabel)}</strong><small>${actualText(primary.title || "Process alarm")}${events.length > 1 ? ` · +${events.length - 1} alarm lain` : ""}</small></span>
    <dl class="machine-alarm-facts">
      <div><dt>Started</dt><dd>${actualTime(primary.occurred_at)}</dd></div>
      <div><dt>Parameter / Rule</dt><dd>${actualText(primary.signal_role || primary.tag_code || "—")} · ${actualText(ruleType)} ${actualText(thresholdText)}</dd></div>
      <div><dt>Trigger value</dt><dd>${actualText(triggerText)}</dd></div>
    </dl>
  </div>`;
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
        ${machineConnectionBadge(machine)}
      </div>
      ${machineAlarmNote(machine.id)}
    </section>
  `;
}

function chemicalDispensingPidPanel(machine) {
  const destinations = dispensingSupportedCalators(machine);
  const availableChemicals = chemicalAnalytics.data?.available_chemicals || [];
  const inletSources = [
    { code: "WTR", name: "Process water" },
    ...availableChemicals.slice(0, 7).map((item) => ({ code: item.chemical_code, name: item.chemical_name })),
  ];
  while (inletSources.length < 8) {
    const sequence = inletSources.length;
    inletSources.push({ code: `CH-${String(sequence).padStart(2, "0")}`, name: `Chemical line ${sequence}` });
  }
  const diagramHeight = 760;
  const gradientId = `pid-vessel-${String(machine.id).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  const patternId = `pid-grid-${String(machine.id).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  const arrowId = `pid-arrow-${String(machine.id).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  const valve = (x, y, label, elementCode, flow = "inlet") => {
    const tagX = flow === "transfer" ? x + 27 : x;
    const tagY = flow === "transfer" ? y + 4 : y + 28;
    const tagAnchor = flow === "transfer" ? "start" : "middle";
    return `<g class="pid-valve pid-${flow} pid-state-ready" data-element-code="${elementCode}" role="img" aria-label="${label} valve">
    <title>${label} · live state ready</title>
    <path class="pid-valve-body" d="M ${x - 14} ${y - 10} L ${x} ${y} L ${x - 14} ${y + 10} Z M ${x + 14} ${y - 10} L ${x} ${y} L ${x + 14} ${y + 10} Z"/>
    <line class="pid-valve-stem" x1="${x}" y1="${y}" x2="${x}" y2="${y - 18}"/>
    <rect class="pid-valve-actuator" x="${x - 8}" y="${y - 28}" width="16" height="10" rx="2"/>
    <circle class="pid-status-dot" cx="${x + 21}" cy="${y - 20}" r="4"/>
    <text class="pid-equipment-tag" x="${tagX}" y="${tagY}" text-anchor="${tagAnchor}">${label}</text>
  </g>`;
  };
  const inlets = inletSources.slice(0, 8).map((source, index) => {
    const y = 142 + index * 70;
    const valveCode = `INLET_VALVE_${String(index + 1).padStart(2, "0")}`;
    return `<g class="pid-inlet-line" data-element-code="${valveCode}">
      <rect class="pid-source-card" x="62" y="${y - 24}" width="170" height="48" rx="8"/>
      <rect class="pid-source-index" x="62" y="${y - 24}" width="38" height="48" rx="8"/>
      <text class="pid-source-code" x="81" y="${y + 4}" text-anchor="middle">${String(index + 1).padStart(2, "0")}</text>
      <text class="pid-source-label" x="112" y="${y - 4}">${actualText(source.code)}</text>
      <text class="pid-source-name" x="112" y="${y + 12}">${actualText(source.name)}</text>
      <path class="pid-pipe" d="M232 ${y} H392"/>
      ${valve(306, y, `XV-${String(101 + index)}`, valveCode)}
      <circle class="pid-junction" cx="392" cy="${y}" r="5"/>
    </g>`;
  }).join("");
  const destinationGap = 64;
  const destinationStart = 548 - ((Math.max(destinations.length, 1) - 1) * destinationGap) / 2;
  const destinationYs = destinations.length ? destinations.map((_, index) => destinationStart + index * destinationGap) : [548];
  const branches = destinations.map((calator, index) => {
    const y = destinationYs[index];
    const routeCode = `ROUTE_CL_${String(index + 1).padStart(2, "0")}`;
    return `<g class="pid-destination pid-state-ready" data-element-code="${routeCode}" data-destination-asset="${actualText(calator.id)}">
      <path class="pid-pipe pid-discharge" d="M1060 ${y} H1134"/>
      ${valve(1100, y, `XV-${String(301 + index)}`, routeCode, "route")}
      <circle class="pid-junction" cx="1060" cy="${y}" r="5"/>
      <rect class="pid-destination-card" x="1134" y="${y - 27}" width="242" height="54" rx="9"/>
      <rect class="pid-destination-status" x="1134" y="${y - 27}" width="7" height="54" rx="3"/>
      <text class="pid-destination-id" x="1158" y="${y - 3}">${actualText(calator.id)}</text>
      <text class="pid-destination-name" x="1158" y="${y + 15}">${actualText(calator.name)}</text>
    </g>`;
  }).join("");
  return `<section class="card pid-card">
    <div class="pid-head"><div><span class="eyebrow">LIVE PROCESS SCHEMATIC</span><h2>Chemical Dispensing Skid · ${actualText(machine.id)}</h2><p>Delapan supply line masuk ke common manifold, ditimbang pada Tank 1, ditransfer ke Tank 2, lalu dialirkan melalui distribution header ke Calator area ${actualText(machine.areaLabel)}.</p></div><div class="pid-head-actions chemical-pid-head-actions"><div class="chemical-pid-live-status">${machineConnectionBadge(machine, "controller")}${machineControlModeBadge(machine, true)}</div><div class="pid-legend"><span><i class="pid-legend-dot ready"></i>No live data / binding ready</span><span><i class="pid-legend-valve"></i>Actuated valve</span><span><i class="pid-legend-line"></i>Process pipe</span></div></div></div>
    <div class="pid-scroll" tabindex="0" aria-label="P and ID chemical dispensing ${machine.id}">
      <svg class="chemical-dispensing-pid" viewBox="0 0 1440 ${diagramHeight}" role="img" aria-label="P and ID dispensing chemical: supply rack 8 valve, common manifold, Tank 1 dengan loadcell, transfer valve dan pump, Tank 2, serta distribution header ke Calator">
        <title>Chemical dispensing process schematic ${actualText(machine.id)}</title>
        <defs>
          <linearGradient id="${gradientId}" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#f9fcfc"/><stop offset="100%" stop-color="#e6f1f3"/></linearGradient>
          <pattern id="${patternId}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#dce7e9" stroke-width="1"/></pattern>
          <marker id="${arrowId}" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0,0 L0,8 L9,4 z" class="pid-arrow-head"/></marker>
        </defs>
        <rect class="pid-canvas-grid" x="28" y="28" width="1384" height="704" rx="16" fill="url(#${patternId})"/>
        <g class="pid-zone"><rect x="44" y="54" width="374" height="650" rx="14"/><text class="pid-zone-index" x="66" y="84">01</text><text class="pid-section-label" x="104" y="84">SUPPLY &amp; VALVE RACK</text><text class="pid-section-note" x="66" y="101">8 dedicated inlet lines</text></g>
        <g class="pid-zone"><rect x="438" y="54" width="510" height="650" rx="14"/><text class="pid-zone-index" x="460" y="84">02</text><text class="pid-section-label" x="498" y="84">WEIGHING &amp; TRANSFER</text><text class="pid-section-note" x="460" y="101">Tank 1 → transfer → Tank 2</text></g>
        <g class="pid-zone"><rect x="968" y="54" width="428" height="650" rx="14"/><text class="pid-zone-index" x="990" y="84">03</text><text class="pid-section-label" x="1028" y="84">CALATOR DISTRIBUTION</text><text class="pid-section-note" x="990" y="101">Header and destination routes</text></g>

        ${inlets}
        <g class="pid-manifold" data-element-code="SUPPLY_MANIFOLD">
          <path class="pid-pipe pid-header-pipe" d="M392 142 V632"/>
          <path class="pid-pipe pid-active-pipe" d="M392 184 H520 Q536 184 536 168 V154 H566" marker-end="url(#${arrowId})"/>
          <rect class="pid-line-tag" x="346" y="92" width="92" height="24" rx="12"/><text x="392" y="108" text-anchor="middle">MH-101</text>
          <text class="pid-flow-label" x="438" y="171">COMMON INLET</text>
        </g>

        <g class="pid-vessel" data-element-code="TANK_01" role="img" aria-label="Tank 1 weighing and buffer tank">
          <path class="pid-vessel-shadow" d="M568 139 Q568 116 684 116 Q800 116 800 139 V294 Q800 326 684 326 Q568 326 568 294 Z"/>
          <path class="pid-vessel-shell" d="M568 132 Q568 110 684 110 Q800 110 800 132 V288 Q800 320 684 320 Q568 320 568 288 Z" fill="url(#${gradientId})"/>
          <ellipse class="pid-vessel-top" cx="684" cy="132" rx="116" ry="22"/>
          <path class="pid-vessel-band" d="M568 265 H800"/>
          <rect class="pid-equipment-plate" x="588" y="164" width="192" height="115" rx="12"/>
          <text class="pid-tank-title" x="684" y="188">TANK 1 · TK-101</text>
          <text class="pid-tank-sub" x="684" y="205">WEIGHING / BUFFER</text>
          <g class="pid-live-readout" data-pid-live-readout="WEIGHT_PV" data-quality="UNKNOWN">
            <rect class="pid-live-panel" x="598" y="213" width="172" height="58" rx="10"/>
            <circle class="pid-live-dot" cx="612" cy="228" r="4"/>
            <text class="pid-live-label" x="622" y="231">LC-101 · LIVE WEIGHT</text>
            <text class="pid-live-quality" x="760" y="231" text-anchor="end" data-pid-live-quality="WEIGHT_PV">NO DATA</text>
            <text class="pid-live-value" x="684" y="259" data-pid-live-value="WEIGHT_PV">— kg</text>
          </g>
          <path class="pid-vessel-leg" d="M606 314 V337 M762 314 V337"/>
        </g>
        <g class="pid-loadcells" data-element-code="TANK_01_LOADCELL">
          <rect x="591" y="337" width="30" height="17" rx="3"/><rect x="747" y="337" width="30" height="17" rx="3"/>
          <path class="pid-signal-line" d="M591 346 H526"/>
          <circle class="pid-instrument" cx="501" cy="346" r="25"/><text class="pid-instrument-code" x="501" y="343" text-anchor="middle">WT</text><text class="pid-instrument-no" x="501" y="356" text-anchor="middle">101</text>
        </g>

        <g class="pid-transfer-skid" data-element-code="TRANSFER_LINE">
          <path class="pid-pipe pid-active-pipe" d="M684 320 V458" marker-end="url(#${arrowId})"/>
          ${valve(684, 397, "XV-201", "TRANSFER_VALVE", "transfer")}
          <g class="pid-pump pid-state-ready" data-element-code="TRANSFER_PUMP"><title>P-201 transfer pump · live state ready</title><circle cx="684" cy="432" r="23"/><path d="M675 420 L699 432 L675 444 Z"/><circle class="pid-status-dot" cx="708" cy="413" r="4"/><text class="pid-equipment-tag" x="728" y="436">P-201</text></g>
          <rect class="pid-line-tag" x="744" y="377" width="122" height="24" rx="12"/><text x="805" y="393" text-anchor="middle">TRANSFER SKID</text>
        </g>

        <g class="pid-vessel pid-vessel-secondary" data-element-code="TANK_02" role="img" aria-label="Tank 2 distribution tank">
          <path class="pid-vessel-shadow" d="M578 489 Q578 468 684 468 Q790 468 790 489 V612 Q790 642 684 642 Q578 642 578 612 Z"/>
          <path class="pid-vessel-shell" d="M578 482 Q578 462 684 462 Q790 462 790 482 V606 Q790 636 684 636 Q578 636 578 606 Z" fill="url(#${gradientId})"/>
          <ellipse class="pid-vessel-top" cx="684" cy="482" rx="106" ry="20"/>
          <path class="pid-vessel-band" d="M578 590 H790"/>
          <rect class="pid-equipment-plate" x="608" y="520" width="152" height="65" rx="10"/>
          <text class="pid-tank-title" x="684" y="543">TANK 2 · TK-201</text>
          <text class="pid-tank-sub" x="684" y="562">DISTRIBUTION TANK</text>
          <text class="pid-tank-value" x="684" y="581">ROUTE HEADER READY</text>
          <path class="pid-vessel-leg" d="M618 631 V658 M750 631 V658"/>
          <path class="pid-pipe thin" d="M602 658 H766"/>
        </g>

        <g class="pid-distribution-header" data-element-code="DISTRIBUTION_MANIFOLD">
          <path class="pid-pipe pid-active-pipe pid-discharge" d="M790 548 H1060" marker-end="url(#${arrowId})"/>
          <path class="pid-pipe pid-header-pipe pid-discharge" d="M1060 ${Math.min(548, destinationYs[0])} V${Math.max(548, destinationYs[destinationYs.length - 1])}"/>
          <rect class="pid-line-tag" x="808" y="510" width="142" height="24" rx="12"/><text x="879" y="526" text-anchor="middle">DH-201 · OUTLET</text>
          ${branches || `<text class="pid-empty-note" x="1134" y="553">No Calator destination mapped</text>`}
        </g>
      </svg>
    </div>
    <div class="pid-foot"><span><strong>8</strong> inlet valves · <strong>1</strong> common manifold · <strong>2</strong> tanks · <strong>${destinations.length}</strong> Calator routes</span><small>Setiap group SVG memiliki <span class="mono">data-element-code</span> agar state valve, pump, loadcell, tank, dan route dapat di-binding ke <span class="mono">instrument_state</span>.</small></div>
  </section>`;
}

function kalenderPidPanelLegacy(machine) {
  const assetCode = actualText(machine.id);
  const isCollapsed = Boolean(state.pidPanel.kalender);
  const safeId = String(machine.id).replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const gridId = `kalender-grid-${safeId}`;
  const metalId = `kalender-metal-${safeId}`;
  const steamArrowId = `kalender-steam-arrow-${safeId}`;
  const fabricArrowId = `kalender-fabric-arrow-${safeId}`;
  const valve = (x, y, label, elementCode, orientation = "horizontal") => {
    const transform = orientation === "vertical" ? `translate(${x} ${y}) rotate(90)` : `translate(${x} ${y})`;
    const tagX = orientation === "vertical" ? x + 24 : x;
    const tagY = orientation === "vertical" ? y + 4 : y + 30;
    const anchor = orientation === "vertical" ? "start" : "middle";
    return `<g class="kalender-pid-valve pid-state-binding" data-element-code="${elementCode}" role="img" aria-label="${label}">
      <title>${label} · live state binding ready</title>
      <g transform="${transform}"><path d="M -14 -10 L 0 0 L -14 10 Z M 14 -10 L 0 0 L 14 10 Z"/><line x1="0" y1="0" x2="0" y2="-18"/><rect x="-8" y="-29" width="16" height="11" rx="2"/></g>
      <circle class="kalender-pid-state-dot" cx="${orientation === "vertical" ? x + 19 : x + 21}" cy="${y - 20}" r="4"/>
      <text class="kalender-pid-tag" x="${tagX}" y="${tagY}" text-anchor="${anchor}">${label}</text>
    </g>`;
  };
  const motor = (x, y, label, elementCode) => `<g class="kalender-pid-motor pid-state-binding" data-element-code="${elementCode}" role="img" aria-label="Motor ${label}">
    <title>${label} motor · live state binding ready</title><circle cx="${x}" cy="${y}" r="18"/><text x="${x}" y="${y + 4}" text-anchor="middle">M</text><circle class="kalender-pid-state-dot" cx="${x + 15}" cy="${y - 15}" r="4"/><text class="kalender-pid-motor-label" x="${x}" y="${y + 34}" text-anchor="middle">${label}</text>
  </g>`;
  return `<section class="card pid-card kalender-pid-card ${isCollapsed ? "is-collapsed" : ""}" data-pid-panel="kalender">
    <div class="pid-head"><div><span class="eyebrow">LIVE PROCESS SCHEMATIC</span><h2>Kalender Process P&amp;ID · ${assetCode}</h2><p>Alur kain dari inlet dan expander menuju upper/lower heated roll, cooling belt, dancing roller, conveyor, lalu pelipatan di plaiter table.</p></div><div class="pid-head-actions"><div class="pid-legend kalender-pid-legend"><span><i class="kalender-legend-fabric"></i>Fabric path</span><span><i class="kalender-legend-steam"></i>Steam heating</span><span><i class="pid-legend-dot binding"></i>Live binding ready</span></div><button class="pid-collapse-button" type="button" data-pid-toggle="kalender" aria-expanded="${isCollapsed ? "false" : "true"}" aria-controls="kalender-pid-content-${safeId}"><span>${isCollapsed ? "Expand P&amp;ID" : "Minimize P&amp;ID"}</span><i aria-hidden="true"></i></button></div></div>
    <div class="kalender-pid-body" id="kalender-pid-content-${safeId}" ${isCollapsed ? "aria-hidden=\"true\"" : ""}>
    <div class="pid-scroll kalender-pid-scroll" tabindex="0" aria-label="P and ID process Kalender ${assetCode}">
      <svg class="kalender-process-pid" viewBox="0 0 1600 700" role="img" aria-label="P and ID Kalender: fabric supply, inlet, expander, heated upper lower roll, cooling belt, dancing roller, conveyor, folder, dan plaiter table">
        <title>Kalender process schematic ${assetCode}</title>
        <defs>
          <pattern id="${gridId}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#dce7e9" stroke-width="1"/></pattern>
          <linearGradient id="${metalId}" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="52%" stop-color="#edf4f5"/><stop offset="100%" stop-color="#cbdde1"/></linearGradient>
          <marker id="${steamArrowId}" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0 0L0 8L9 4Z" class="kalender-steam-arrow"/></marker>
          <marker id="${fabricArrowId}" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0 0L0 8L9 4Z" class="kalender-fabric-arrow"/></marker>
        </defs>
        <rect class="kalender-pid-canvas" x="24" y="24" width="1552" height="652" rx="18" fill="url(#${gridId})"/>
        <g class="kalender-pid-zone"><rect x="42" y="48" width="300" height="604" rx="14"/><text class="kalender-zone-index" x="64" y="78">01</text><text class="kalender-zone-title" x="102" y="78">FABRIC INFEED</text><text class="kalender-zone-note" x="64" y="98">Supply, inlet roller and width sensing</text></g>
        <g class="kalender-pid-zone"><rect x="358" y="48" width="650" height="604" rx="14"/><text class="kalender-zone-index" x="380" y="78">02</text><text class="kalender-zone-title" x="418" y="78">EXPANDING · HEATING · PRESSURE</text><text class="kalender-zone-note" x="380" y="98">Open-width alignment and upper/lower heated cylinders</text></g>
        <g class="kalender-pid-zone"><rect x="1024" y="48" width="272" height="604" rx="14"/><text class="kalender-zone-index" x="1046" y="78">03</text><text class="kalender-zone-title" x="1084" y="78">COOLING &amp; TENSION</text><text class="kalender-zone-note" x="1046" y="98">Cooling belt and dancing roller</text></g>
        <g class="kalender-pid-zone"><rect x="1312" y="48" width="246" height="604" rx="14"/><text class="kalender-zone-index" x="1334" y="78">04</text><text class="kalender-zone-title" x="1372" y="78">FOLDING OUTPUT</text><text class="kalender-zone-note" x="1334" y="98">Conveyor, folder and plaiter table</text></g>

        <g class="kalender-steam-system" data-element-code="STEAM_HEATING_HEADER">
          <path class="kalender-utility-pipe" d="M214 132H948" marker-end="url(#${steamArrowId})"/>
          <rect class="kalender-line-tag" x="218" y="104" width="84" height="22" rx="11"/><text x="260" y="119" text-anchor="middle">STEAM</text>
          <path class="kalender-utility-pipe" d="M286 132V177"/>
          ${valve(286, 166, "TCV-401", "HEATING_INLET_VALVE", "vertical")}
          <path class="kalender-utility-pipe" d="M286 177V220" marker-end="url(#${steamArrowId})"/>
          <path class="kalender-utility-pipe" d="M700 132V187"/>
          ${valve(700, 166, "TCV-402", "UPPER_HEATING_VALVE", "vertical")}
          <path class="kalender-utility-pipe" d="M700 187V210" marker-end="url(#${steamArrowId})"/>
          <path class="kalender-utility-pipe" d="M948 132V344Q948 365 926 381" marker-end="url(#${steamArrowId})"/>
          ${valve(948, 166, "TCV-403", "LOWER_HEATING_VALVE", "vertical")}
          <text class="kalender-utility-label" x="286" y="118" text-anchor="middle">INLET HEAT</text><text class="kalender-utility-label" x="700" y="118" text-anchor="middle">UPPER HEAT</text><text class="kalender-utility-label" x="948" y="118" text-anchor="middle">LOWER HEAT</text>
        </g>

        <g class="kalender-fabric-supply" data-element-code="FABRIC_SUPPLY">
          <rect class="kalender-source-rack" x="66" y="492" width="150" height="112" rx="7"/>
          <path class="kalender-source-rack" d="M58 604H224M76 492V472H206V492"/>
          <path class="kalender-fabric-stack" d="M82 576H198M82 562H198M82 548H198M82 534H198M82 520H198"/>
          <text class="kalender-equipment-title" x="76" y="628">FABRIC SUPPLY</text>
        </g>
        <g class="kalender-inlet" data-element-code="INLET_ROLLER">
          <path class="kalender-machine-stand" d="M84 454V214Q84 184 114 184H292V468H326"/>
          <rect class="kalender-machine-frame" x="108" y="202" width="164" height="42" rx="5"/>
          <circle class="kalender-guide-roll" cx="132" cy="184" r="20"/><circle class="kalender-guide-roll" cx="270" cy="184" r="20"/><circle class="kalender-guide-roll" cx="274" cy="458" r="20"/>
          <rect class="kalender-machine-frame" x="118" y="212" width="126" height="20" rx="3"/>
          <text class="kalender-equipment-title" x="112" y="168">INLET / PRE-HEATING</text>${motor(228, 278, "INLET", "INLET_MOTOR")}
        </g>
        <g class="kalender-width-sensor" data-element-code="FABRIC_WIDTH_SENSOR">
          <path class="kalender-signal-line" d="M288 468H368"/><path class="kalender-width-beam" d="M314 446V494M352 432V478"/><circle class="kalender-instrument" cx="340" cy="408" r="22"/><text class="kalender-instrument-code" x="340" y="405" text-anchor="middle">WIT</text><text class="kalender-instrument-no" x="340" y="417" text-anchor="middle">401</text><text class="kalender-sensor-label" x="306" y="386">FABRIC WIDTH · cm</text>
        </g>
        <g class="kalender-expander" data-element-code="EXPANDER_LR">
          <path class="kalender-expander-bed" d="M326 472L518 330"/><path class="kalender-expander-bed kalender-expander-axis" d="M350 469L494 362"/><circle class="kalender-expander-roll" cx="378" cy="434" r="18"/><circle class="kalender-expander-roll" cx="438" cy="389" r="18"/><circle class="kalender-expander-roll" cx="496" cy="346" r="18"/>
          <text class="kalender-equipment-title" x="374" y="330">EXPANDER L / R</text>${motor(392, 530, "EXP L", "EXPANDER_L_MOTOR")}${motor(454, 530, "EXP R", "EXPANDER_R_MOTOR")}
        </g>

        <rect class="kalender-process-frame" x="548" y="174" width="428" height="408" rx="9"/>
        <g class="kalender-roll kalender-upper-roll" data-element-code="UPPER_FELT">
          <circle class="kalender-roll-shadow" cx="718" cy="288" r="86"/><circle class="kalender-heated-roll" cx="718" cy="280" r="86" fill="url(#${metalId})"/><circle class="kalender-roll-hub" cx="718" cy="280" r="26"/><text class="kalender-roll-title" x="718" y="275" text-anchor="middle">UPPER FELT</text><text class="kalender-roll-sub" x="718" y="294" text-anchor="middle">CYLINDER · CR-401</text>${motor(602, 220, "UPPER", "UPPER_FELT_MOTOR")}
        </g>
        <g class="kalender-roll kalender-lower-roll" data-element-code="LOWER_FELT">
          <circle class="kalender-roll-shadow" cx="842" cy="470" r="82"/><circle class="kalender-heated-roll" cx="842" cy="462" r="82" fill="url(#${metalId})"/><circle class="kalender-roll-hub" cx="842" cy="462" r="25"/><text class="kalender-roll-title" x="842" y="457" text-anchor="middle">LOWER FELT</text><text class="kalender-roll-sub" x="842" y="476" text-anchor="middle">CYLINDER · CR-402</text>${motor(760, 605, "LOWER", "LOWER_FELT_MOTOR")}
        </g>
        <g class="kalender-guide-system" data-element-code="GUIDE_ROLLERS">
          <circle class="kalender-guide-roll" cx="572" cy="348" r="18"/><circle class="kalender-guide-roll" cx="618" cy="314" r="18"/><circle class="kalender-guide-roll" cx="632" cy="392" r="18"/><circle class="kalender-guide-roll" cx="650" cy="445" r="18"/><circle class="kalender-guide-roll" cx="936" cy="348" r="18"/>
        </g>
        <g class="kalender-temperature-sensors">
          <g data-element-code="UPPER_TEMPERATURE"><circle class="kalender-instrument" cx="576" cy="260" r="22"/><text class="kalender-instrument-code" x="576" y="257" text-anchor="middle">TT</text><text class="kalender-instrument-no" x="576" y="270" text-anchor="middle">401</text><path class="kalender-signal-line" d="M598 260L632 266"/><text class="kalender-sensor-label" x="552" y="294">TEMP UPPER · °C</text></g>
          <g data-element-code="LOWER_TEMPERATURE"><circle class="kalender-instrument" cx="608" cy="538" r="22"/><text class="kalender-instrument-code" x="608" y="535" text-anchor="middle">TT</text><text class="kalender-instrument-no" x="608" y="548" text-anchor="middle">402</text><path class="kalender-signal-line" d="M630 532L765 494"/><text class="kalender-sensor-label" x="572" y="575">TEMP LOWER · °C</text></g>
        </g>
        <g class="kalender-loadcell kalender-loadcell-upper" data-element-code="LOADCELL_UPPER"><path class="kalender-signal-line" d="M790 302L858 320"/><circle class="kalender-loadcell-roll" cx="805" cy="306" r="13"/><circle class="kalender-instrument" cx="880" cy="326" r="22"/><text class="kalender-instrument-code" x="880" y="323" text-anchor="middle">LC</text><text class="kalender-instrument-no" x="880" y="336" text-anchor="middle">401</text><text class="kalender-sensor-label" x="848" y="362">LOADCELL UPPER · kg</text></g>
        <g class="kalender-loadcell kalender-loadcell-lower" data-element-code="LOADCELL_LOWER"><path class="kalender-signal-line" d="M910 492L930 548"/><circle class="kalender-loadcell-roll" cx="912" cy="492" r="13"/><circle class="kalender-instrument" cx="938" cy="570" r="22"/><text class="kalender-instrument-code" x="938" y="567" text-anchor="middle">LC</text><text class="kalender-instrument-no" x="938" y="580" text-anchor="middle">402</text><text class="kalender-sensor-label" x="888" y="610">LOADCELL LOWER · kg</text></g>

        <g class="kalender-cooling-belt" data-element-code="COOLING_BELT">
          <rect class="kalender-belt-body" x="1044" y="208" width="190" height="66" rx="13"/><circle class="kalender-belt-roll" cx="1070" cy="241" r="18"/><circle class="kalender-belt-roll" cx="1208" cy="241" r="18"/><path class="kalender-belt-line" d="M1070 223H1208M1070 259H1208"/><text class="kalender-equipment-title" x="1090" y="190">COOLING BELT</text>${motor(1138, 314, "COOLING", "COOLING_BELT_MOTOR")}
        </g>
        <g class="kalender-dancing" data-element-code="DANCING_ROLLER"><path class="kalender-dancer-arm" d="M1246 278L1274 344"/><circle class="kalender-guide-roll" cx="1276" cy="350" r="23"/><path class="kalender-signal-line" d="M1276 373V405"/><circle class="kalender-instrument" cx="1276" cy="427" r="22"/><text class="kalender-instrument-code" x="1276" y="424" text-anchor="middle">ZT</text><text class="kalender-instrument-no" x="1276" y="437" text-anchor="middle">401</text><text class="kalender-sensor-label" x="1240" y="466">DANCING · %</text></g>

        <g class="kalender-conveyor" data-element-code="CONVEYOR_BELT">
          <rect class="kalender-belt-body" x="1334" y="208" width="192" height="66" rx="13"/><circle class="kalender-belt-roll" cx="1360" cy="241" r="18"/><circle class="kalender-belt-roll" cx="1498" cy="241" r="18"/><path class="kalender-belt-line" d="M1360 223H1498M1360 259H1498"/><path class="kalender-conveyor-chute" d="M1498 241L1540 340L1518 350L1480 270"/><text class="kalender-equipment-title" x="1390" y="190">CONVEYOR BELT</text>${motor(1370, 314, "CONVEYOR", "CONVEYOR_BELT_MOTOR")}
        </g>
        <g class="kalender-plaiter" data-element-code="PLAITER">
          <path class="kalender-plaiter-arm" d="M1528 346V410L1478 448"/><circle class="kalender-plaiter-pivot" cx="1528" cy="346" r="12"/><rect class="kalender-machine-frame kalender-plaiter-body" x="1338" y="478" width="198" height="126" rx="8"/><path class="kalender-table" d="M1354 478H1520M1354 491H1520"/>
          <path class="kalender-folded-fabric" d="M1370 468Q1390 446 1410 468T1450 468T1490 468T1520 468"/>
          <text class="kalender-equipment-title" x="1360" y="535">PLAITER &amp; OUTPUT TABLE</text>${motor(1380, 574, "PLAIT", "PLAITER_MOTOR")}${motor(1490, 574, "TABLE", "CONVEYOR_TABLE_MOTOR")}
        </g>

        <g class="kalender-fabric-flow" data-element-code="FABRIC_PATH">
          <path class="kalender-fabric-shadow" d="M82 518Q98 490 112 466L112 218Q112 184 138 184H268Q292 184 292 208V430Q292 462 320 470L346 477Q370 482 392 466L510 376Q528 363 548 348H572Q598 348 618 326L640 302Q654 286 654 260C654 214 680 188 718 188C768 188 804 226 804 276C804 310 788 332 764 352L742 370Q724 386 724 416V444C724 494 758 530 812 530C866 530 902 498 902 450C902 410 882 382 852 362L878 374Q910 388 936 356L1010 264Q1028 241 1058 241H1206Q1228 241 1238 268L1260 328Q1266 350 1276 350Q1288 350 1294 328L1312 266Q1320 241 1348 241H1492Q1510 241 1518 261L1540 330L1528 346V410L1478 448V456"/>
          <path class="kalender-fabric-path" d="M82 518Q98 490 112 466L112 218Q112 184 138 184H268Q292 184 292 208V430Q292 462 320 470L346 477Q370 482 392 466L510 376Q528 363 548 348H572Q598 348 618 326L640 302Q654 286 654 260C654 214 680 188 718 188C768 188 804 226 804 276C804 310 788 332 764 352L742 370Q724 386 724 416V444C724 494 758 530 812 530C866 530 902 498 902 450C902 410 882 382 852 362L878 374Q910 388 936 356L1010 264Q1028 241 1058 241H1206Q1228 241 1238 268L1260 328Q1266 350 1276 350Q1288 350 1294 328L1312 266Q1320 241 1348 241H1492Q1510 241 1518 261L1540 330L1528 346V410L1478 448V456" marker-end="url(#${fabricArrowId})"/>
          <rect class="kalender-flow-label" x="58" y="434" width="126" height="26" rx="13"/><text x="121" y="451" text-anchor="middle">FABRIC IN</text>
          <g class="kalender-flow-directions" aria-hidden="true"><path d="M224 184h34" marker-end="url(#${fabricArrowId})"/><path d="M410 448l28-21" marker-end="url(#${fabricArrowId})"/><path d="M972 316l24-30" marker-end="url(#${fabricArrowId})"/><path d="M1120 241h38" marker-end="url(#${fabricArrowId})"/><path d="M1398 241h38" marker-end="url(#${fabricArrowId})"/></g>
        </g>
      </svg>
    </div>
    <div class="pid-foot"><span><strong>4</strong> process zones · <strong>3</strong> heating valves · <strong>2</strong> heated rolls · <strong>2</strong> loadcells · <strong>1</strong> continuous fabric path</span><small>Element code disiapkan untuk live status. Steam pressure, condensate return, fail-safe valve, dan instrument loop final wajib divalidasi dari P&amp;ID engineering mesin aktual.</small></div>
    </div>
  </section>`;
}

function kalenderPidPanel(machine) {
  const assetCode = actualText(machine.id);
  const isCollapsed = Boolean(state.pidPanel.kalender);
  const safeId = String(machine.id).replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const gridId = `kalender-simple-grid-${safeId}`;
  const metalId = `kalender-simple-metal-${safeId}`;
  const steamArrowId = `kalender-simple-steam-${safeId}`;
  const fabricArrowId = `kalender-simple-fabric-${safeId}`;
  const valve = (x, label, elementCode) => `<g class="kalender-pid-valve kalender-simple-valve pid-state-binding" data-element-code="${elementCode}" role="img" aria-label="${label}">
    <title>${label} · live state binding ready</title>
    <path d="M${x - 14} 134L${x} 146L${x - 14} 158ZM${x + 14} 134L${x} 146L${x + 14} 158Z"/><line x1="${x}" y1="146" x2="${x}" y2="126"/><rect x="${x - 8}" y="115" width="16" height="11" rx="2"/>
    <circle class="kalender-pid-state-dot" cx="${x + 20}" cy="120" r="4"/><text class="kalender-pid-tag" x="${x}" y="174" text-anchor="middle">${label}</text>
  </g>`;
  const monitor = (x, y, width, label, elementCode, detail = "LIVE") => `<g class="kalender-monitor-chip pid-state-binding" data-element-code="${elementCode}" role="img" aria-label="${label}">
    <title>${label} · ${detail} · live state binding ready</title><rect x="${x}" y="${y}" width="${width}" height="38" rx="8"/><circle class="kalender-pid-state-dot" cx="${x + 15}" cy="${y + 19}" r="4"/><text class="kalender-monitor-label" x="${x + 28}" y="${y + 16}">${label}</text><text class="kalender-monitor-detail" x="${x + 28}" y="${y + 29}">${detail}</text>
  </g>`;
  return `<section class="card pid-card kalender-pid-card kalender-pid-simple-card ${isCollapsed ? "is-collapsed" : ""}" data-pid-panel="kalender">
    <div class="pid-head"><div><span class="eyebrow">LIVE PROCESS SCHEMATIC</span><h2>Kalender Process Flow · ${assetCode}</h2><p>Alur kain dan titik monitoring utama. Warna indikator mengikuti status aktual dari instrument state.</p></div><div class="pid-head-actions"><div class="pid-legend kalender-pid-legend"><span><i class="kalender-legend-fabric"></i>Fabric flow</span><span><i class="kalender-legend-steam"></i>Steam</span><span><i class="pid-legend-dot binding"></i>Live status</span></div><button class="pid-collapse-button" type="button" data-pid-toggle="kalender" aria-expanded="${isCollapsed ? "false" : "true"}" aria-controls="kalender-pid-content-${safeId}"><span>${isCollapsed ? "Expand P&amp;ID" : "Minimize P&amp;ID"}</span><i aria-hidden="true"></i></button></div></div>
    <div class="kalender-pid-body" id="kalender-pid-content-${safeId}" ${isCollapsed ? "aria-hidden=\"true\"" : ""}>
      <div class="pid-scroll kalender-pid-scroll" tabindex="0" aria-label="Kalender process flow ${assetCode}">
        <svg class="kalender-process-pid kalender-process-pid-simple" viewBox="0 0 1600 650" role="img" aria-label="Simplified Kalender process flow from fabric supply to plaiter output">
          <title>Kalender simplified live process flow ${assetCode}</title>
          <defs>
            <pattern id="${gridId}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#dce7e9" stroke-width="1"/></pattern>
            <linearGradient id="${metalId}" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="55%" stop-color="#edf4f5"/><stop offset="100%" stop-color="#cbdde1"/></linearGradient>
            <marker id="${steamArrowId}" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0 0L0 8L9 4Z" class="kalender-steam-arrow"/></marker>
            <marker id="${fabricArrowId}" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0 0L0 8L9 4Z" class="kalender-fabric-arrow"/></marker>
          </defs>
          <rect class="kalender-pid-canvas" x="24" y="24" width="1552" height="602" rx="18" fill="url(#${gridId})"/>

          <g class="kalender-simple-zone kalender-simple-zone-1"><rect x="42" y="44" width="286" height="580" rx="14"/><text class="kalender-zone-index" x="62" y="73">01</text><text class="kalender-zone-title" x="98" y="73">INFEED</text><text class="kalender-zone-note" x="62" y="93">Supply · inlet · width · expander</text></g>
          <g class="kalender-simple-zone kalender-simple-zone-2"><rect x="344" y="44" width="620" height="580" rx="14"/><text class="kalender-zone-index" x="364" y="73">02</text><text class="kalender-zone-title" x="400" y="73">HEATING &amp; PRESSURE</text><text class="kalender-zone-note" x="364" y="93">Upper/lower felt and steam control</text></g>
          <g class="kalender-simple-zone kalender-simple-zone-3"><rect x="980" y="44" width="278" height="580" rx="14"/><text class="kalender-zone-index" x="1000" y="73">03</text><text class="kalender-zone-title" x="1036" y="73">COOLING &amp; TENSION</text><text class="kalender-zone-note" x="1000" y="93">Cooling belt · dancing roller</text></g>
          <g class="kalender-simple-zone kalender-simple-zone-4"><rect x="1274" y="44" width="284" height="580" rx="14"/><text class="kalender-zone-index" x="1294" y="73">04</text><text class="kalender-zone-title" x="1330" y="73">FOLDING OUTPUT</text><text class="kalender-zone-note" x="1294" y="93">Conveyor · folder · plaiter</text></g>

          <g class="kalender-simple-steam" data-element-code="STEAM_HEATING_HEADER">
            <rect class="kalender-line-tag" x="366" y="112" width="78" height="22" rx="11"/><text x="405" y="127" text-anchor="middle">STEAM</text>
            <path class="kalender-utility-pipe" d="M446 123H918" marker-end="url(#${steamArrowId})"/>
            <path class="kalender-utility-pipe kalender-steam-drop" d="M500 123V176M655 123V176M858 123V176"/>
            ${valve(500, "INLET HEAT", "HEATING_INLET_VALVE")}${valve(655, "UPPER HEAT", "UPPER_HEATING_VALVE")}${valve(858, "LOWER HEAT", "LOWER_HEATING_VALVE")}
          </g>

          <g class="kalender-simple-supply" data-element-code="FABRIC_SUPPLY">
            <rect class="kalender-source-rack" x="62" y="366" width="112" height="102" rx="7"/><path class="kalender-fabric-stack" d="M76 444H160M76 430H160M76 416H160M76 402H160M76 388H160"/><text class="kalender-equipment-title" x="72" y="490">FABRIC SUPPLY</text>
          </g>
          <g class="kalender-simple-inlet" data-element-code="INLET_ROLLER">
            <path class="kalender-machine-stand" d="M94 350V224Q94 202 116 202H252V354"/><rect class="kalender-machine-frame" x="112" y="216" width="118" height="28" rx="4"/><circle class="kalender-guide-roll" cx="116" cy="202" r="17"/><circle class="kalender-guide-roll" cx="248" cy="202" r="17"/><circle class="kalender-guide-roll" cx="248" cy="354" r="17"/><text class="kalender-equipment-title" x="116" y="184">INLET</text>
          </g>
          <g class="kalender-simple-expander" data-element-code="EXPANDER_LR">
            <g transform="translate(276 344) rotate(-27)"><rect class="kalender-expander-bar" x="0" y="-18" width="152" height="18" rx="7"/><rect class="kalender-expander-bar" x="0" y="8" width="152" height="18" rx="7"/><path class="kalender-expander-axis" d="M8 4H144"/></g>
            <circle class="kalender-expander-roll" cx="282" cy="356" r="14"/><circle class="kalender-expander-roll" cx="414" cy="290" r="14"/>
            <text class="kalender-equipment-title" x="282" y="273">EXPANDER L / R</text><text class="kalender-function-label" x="282" y="286">OPEN WIDTH &amp; ALIGNMENT</text>
          </g>

          <rect class="kalender-simple-process-frame" x="420" y="194" width="518" height="290" rx="10"/>
          <g class="kalender-felt-loop kalender-upper-felt-loop" data-element-code="UPPER_FELT">
            <path d="M530 210L710 250L560 330Z"/><circle class="kalender-felt-guide" cx="530" cy="210" r="17"/><circle class="kalender-felt-drive" cx="710" cy="250" r="19"/><path class="kalender-drive-cross" d="M699 239L721 261M721 239L699 261"/><circle class="kalender-felt-guide" cx="560" cy="330" r="17"/>
            <circle class="kalender-roll-shadow" cx="620" cy="271" r="61"/><circle class="kalender-heated-roll" cx="620" cy="266" r="61" fill="url(#${metalId})"/><circle class="kalender-roll-hub" cx="620" cy="266" r="18"/><text class="kalender-roll-title" x="620" y="262" text-anchor="middle">UPPER FELT</text><text class="kalender-roll-sub" x="620" y="278" text-anchor="middle">CR-401</text>
          </g>
          <g class="kalender-felt-loop kalender-lower-felt-loop" data-element-code="LOWER_FELT">
            <path d="M700 395L680 470L865 440Z"/><circle class="kalender-felt-guide" cx="700" cy="395" r="17"/><circle class="kalender-felt-guide" cx="680" cy="470" r="17"/><circle class="kalender-felt-drive" cx="865" cy="440" r="19"/><path class="kalender-drive-cross" d="M854 429L876 451M876 429L854 451"/>
            <circle class="kalender-roll-shadow" cx="770" cy="428" r="57"/><circle class="kalender-heated-roll" cx="770" cy="423" r="57" fill="url(#${metalId})"/><circle class="kalender-roll-hub" cx="770" cy="423" r="17"/><text class="kalender-roll-title" x="770" y="419" text-anchor="middle">LOWER FELT</text><text class="kalender-roll-sub" x="770" y="435" text-anchor="middle">CR-402</text>
          </g>
          <g class="kalender-simple-guides" data-element-code="GUIDE_ROLLERS">
            <circle class="kalender-guide-roll" cx="448" cy="304" r="15"/><text class="kalender-function-label" x="426" y="278">ENTRY GUIDE</text>
            <circle class="kalender-guide-roll" cx="900" cy="306" r="15"/><text class="kalender-function-label" x="874" y="280">EXIT GUIDE</text>
          </g>
          <g class="kalender-loadcell-roller" data-element-code="LOADCELL_UPPER" role="img" aria-label="Loadcell upper roller"><title>Loadcell Upper · small measuring roller after Upper Felt</title><circle class="kalender-loadcell-roll" cx="716" cy="350" r="14"/><circle class="kalender-pid-state-dot" cx="728" cy="338" r="3.5"/><text class="kalender-loadcell-code" x="734" y="354">LC UPPER</text></g>
          <g class="kalender-loadcell-roller" data-element-code="LOADCELL_LOWER" role="img" aria-label="Loadcell lower roller"><title>Loadcell Lower · small measuring roller after Lower Felt</title><circle class="kalender-loadcell-roll" cx="850" cy="374" r="14"/><circle class="kalender-pid-state-dot" cx="862" cy="362" r="3.5"/><text class="kalender-loadcell-code" x="846" y="350" text-anchor="middle">LC LOWER</text></g>

          <g class="kalender-cooling-belt" data-element-code="COOLING_BELT"><rect class="kalender-belt-body" x="1004" y="222" width="190" height="58" rx="12"/><circle class="kalender-belt-roll" cx="1028" cy="251" r="16"/><circle class="kalender-belt-roll" cx="1170" cy="251" r="16"/><path class="kalender-belt-line" d="M1028 235H1170M1028 267H1170"/><text class="kalender-equipment-title" x="1050" y="203">COOLING BELT</text></g>
          <g class="kalender-dancing" data-element-code="DANCING_ROLLER"><path class="kalender-dancer-arm" d="M1190 282L1216 344"/><circle class="kalender-guide-roll" cx="1218" cy="350" r="20"/><text class="kalender-equipment-title" x="1163" y="390">DANCING ROLLER</text></g>

          <g class="kalender-conveyor" data-element-code="CONVEYOR_BELT"><rect class="kalender-belt-body" x="1298" y="222" width="212" height="58" rx="12"/><circle class="kalender-belt-roll" cx="1322" cy="251" r="16"/><circle class="kalender-belt-roll" cx="1486" cy="251" r="16"/><path class="kalender-belt-line" d="M1322 235H1486M1322 267H1486"/><path class="kalender-conveyor-chute" d="M1486 251L1524 342L1506 351L1470 278"/><text class="kalender-equipment-title" x="1362" y="203">CONVEYOR</text></g>
          <g class="kalender-plaiter" data-element-code="PLAITER"><path class="kalender-plaiter-arm" d="M1515 350V401L1474 430"/><circle class="kalender-plaiter-pivot" cx="1515" cy="350" r="10"/><rect class="kalender-machine-frame kalender-plaiter-body" x="1320" y="466" width="212" height="58" rx="7"/><path class="kalender-table" d="M1336 466H1516M1336 477H1516"/><path class="kalender-folded-fabric" d="M1350 456Q1370 436 1390 456T1430 456T1470 456T1510 456"/><text class="kalender-equipment-title" x="1375" y="510">PLAITER TABLE</text></g>

          <g class="kalender-fabric-flow" data-element-code="FABRIC_PATH">
            <path class="kalender-fabric-shadow" d="M80 390Q96 370 105 344V228Q105 202 128 202H238Q260 202 260 224V328Q260 354 282 356L414 290Q432 298 448 304L560 330C544 300 548 258 570 230C592 202 632 192 666 206C704 222 722 256 716 290C712 318 696 338 672 352L696 346Q708 344 716 350L700 395C688 424 696 454 720 472C748 494 790 490 818 466C844 444 854 408 840 382L850 374Q864 368 876 348L900 306L966 252Q982 241 1006 251H1170Q1194 251 1202 278L1210 328Q1214 350 1218 350Q1224 350 1228 328L1240 278Q1248 251 1278 251H1484Q1500 251 1508 270L1524 330L1515 350V401L1474 430V446"/>
            <path class="kalender-fabric-path" d="M80 390Q96 370 105 344V228Q105 202 128 202H238Q260 202 260 224V328Q260 354 282 356L414 290Q432 298 448 304L560 330C544 300 548 258 570 230C592 202 632 192 666 206C704 222 722 256 716 290C712 318 696 338 672 352L696 346Q708 344 716 350L700 395C688 424 696 454 720 472C748 494 790 490 818 466C844 444 854 408 840 382L850 374Q864 368 876 348L900 306L966 252Q982 241 1006 251H1170Q1194 251 1202 278L1210 328Q1214 350 1218 350Q1224 350 1228 328L1240 278Q1248 251 1278 251H1484Q1500 251 1508 270L1524 330L1515 350V401L1474 430V446" marker-end="url(#${fabricArrowId})"/>
            <g class="kalender-flow-directions" aria-hidden="true"><path d="M174 202H216" marker-end="url(#${fabricArrowId})"/><path d="M348 326L378 304" marker-end="url(#${fabricArrowId})"/><path d="M930 276L954 259" marker-end="url(#${fabricArrowId})"/><path d="M1078 251H1122" marker-end="url(#${fabricArrowId})"/><path d="M1378 251H1422" marker-end="url(#${fabricArrowId})"/></g>
          </g>

          <text class="kalender-monitor-heading" x="62" y="524">MONITORED POINTS</text>
          ${monitor(62, 536, 124, "INLET DRIVE", "INLET_MOTOR", "RUN / STOP")}${monitor(194, 536, 116, "FABRIC WIDTH", "FABRIC_WIDTH_SENSOR", "cm")}
          ${monitor(62, 578, 124, "EXPANDER L", "EXPANDER_L_MOTOR", "RUN / STOP")}${monitor(194, 578, 116, "EXPANDER R", "EXPANDER_R_MOTOR", "RUN / STOP")}

          <text class="kalender-monitor-heading" x="364" y="504">MONITORED POINTS</text>
          ${monitor(364, 516, 184, "TEMP UPPER", "UPPER_TEMPERATURE", "PV / SV · °C")}${monitor(556, 516, 184, "LOADCELL UPPER", "LOADCELL_UPPER", "PV / SV · kg")}${monitor(748, 516, 194, "UPPER FELT DRIVE", "UPPER_FELT_MOTOR", "RUN / STOP")}
          ${monitor(364, 558, 184, "TEMP LOWER", "LOWER_TEMPERATURE", "PV / SV · °C")}${monitor(556, 558, 184, "LOADCELL LOWER", "LOADCELL_LOWER", "PV / SV · kg")}${monitor(748, 558, 194, "LOWER FELT DRIVE", "LOWER_FELT_MOTOR", "RUN / STOP")}

          <text class="kalender-monitor-heading" x="1000" y="504">MONITORED POINTS</text>
          ${monitor(1000, 516, 238, "COOLING BELT DRIVE", "COOLING_BELT_MOTOR", "RUN / STOP")}${monitor(1000, 558, 238, "DANCING ROLLER", "DANCING_ROLLER", "POSITION · %")}

          <text class="kalender-monitor-heading" x="1294" y="524">MONITORED POINTS</text>
          ${monitor(1294, 536, 246, "CONVEYOR DRIVE", "CONVEYOR_BELT_MOTOR", "RUN / STOP")}${monitor(1294, 578, 119, "PLAITER", "PLAITER_MOTOR", "RUN / STOP")}${monitor(1421, 578, 119, "TABLE", "CONVEYOR_TABLE_MOTOR", "RUN / STOP")}
        </svg>
      </div>
      <div class="pid-foot"><span><strong>Fabric flow</strong> menunjukkan urutan proses; status strip menunjukkan titik yang dipantau secara live.</span><small>Hijau: running/active · abu-abu: stopped/inactive · merah: fault/alarm · amber: stale. Detail PV/SV tetap tersedia pada live sensor dan historical trend.</small></div>
    </div>
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
      ${managementKpi("historical", "Total Machine Runtime", formatProductionOutput(productionOutput.runtime), "h", "Accumulated across 134 machines")}
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
  const actualOnly = backendConnection.status === "connected" && backendConnection.dataMode === "ACTUAL_DATABASE";
  const historicalValue = actualOnly && scope === "historical" ? "—" : value;
  const actualFoot = actualOnly && scope === "historical" ? "No data · historian aggregate belum dimapping" : foot;
  return `<article class="card management-kpi ${tone}">
    <div class="management-kpi-top"><span class="kpi-scope ${scope === "live" ? "live" : "historical"}">${scope === "live" ? "LIVE NOW" : "SELECTED RANGE"}</span><span class="quality-pill good">${actualOnly ? "ACTUAL" : "Simulated"}</span></div>
    <span class="management-kpi-label">${label}</span>
    <div class="management-kpi-value">${historicalValue}<small>${unit}</small></div>
    <div class="management-kpi-foot">${actualFoot}</div>
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

function areaStateSummary(running, idle, warning, fault) {
  const states = [
    ["run", "Run", running],
    ["idle", "Idle", idle],
    ["warn", "Warn", warning],
    ["fault", "Fault", fault],
  ];
  return `<div class="area-state-grid">${states.map(([tone, label, count]) => `<span class="area-state-item state-${tone} ${Number(count) > 0 ? "is-active" : "is-empty"}"><strong>${count}</strong><small>${label}</small></span>`).join("")}</div>`;
}

function processFleetPage(type) {
  const config = processConfig[type];
  const fleet = fleetFor(type);
  const actualOnly = backendConnection.status === "connected" && backendConnection.dataMode === "ACTUAL_DATABASE";
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
    const tone = fault ? "fault" : warning ? "warning" : running ? "running" : idle ? "idle" : "offline";
    return `<article class="card area-card" data-area-state="${tone}" data-area-target="${type}|${area.code}" role="button" tabindex="0">
      <div class="area-card-head"><div><span class="area-code">${area.code}</span><h2>${type === "jetflow" ? area.label : `Area ${area.label}`}</h2></div>${statusPill(tone)}</div>
      <div class="area-total"><strong>${items.length}</strong><span>${config.singular} registered</span></div>
      ${areaStateSummary(running, idle, warning, fault)}
      <div class="area-card-foot"><span>${actualOnly ? "No data aggregate" : `${formatManagementValue(metricTotal(type, state.management.metric[type], items), selectedMetric.unit)} ${selectedMetric.unit} ${selectedMetric.short.toLowerCase()}`}</span><strong>Open ranking →</strong></div>
    </article>`;
  }).join("");
  return `
    ${pageHead(type, `<span class="data-pill good">PostgreSQL actual</span><button class="button" data-page-target="trends">⌗ Historical</button>`)}
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
  if (type === "calator") {
    const overfeed = machine.values?.overfeed_out_speed_pv;
    return `${machine.subtype || "—"} · OF Out ${overfeed == null ? "—" : `${overfeed} m/min`}`;
  }
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
    <div class="fleet-machine-reading"><span>${machineSnapshot(type, machine, index)}</span><small>Batch <strong>${machine.batch}</strong></small></div>
    <div class="fleet-machine-meta"><span>${metric.short}<strong>${formatManagementValue(machineMetricValue(type, machine, metricKey), metric.unit)} ${metric.unit}</strong></span><span>Runtime<strong>${formatManagementValue(machineRuntime(type, machine), "h")} h</strong></span><span>State<strong>${machine.state}</strong></span></div>
    <div class="fleet-machine-foot">${machineConnectionBadge(machine)}<strong>Machine detail →</strong></div>
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
    ${panel("Jetflow Process Sequence", `Current process · ${machine.step} · step ${processPosition} of ${jetflowProcessSteps.length}`, `<div class="jetflow-sequence-table-wrap" tabindex="0" aria-label="Jetflow process sequence ${machine.id}"><table class="jetflow-sequence-table"><thead><tr><th scope="col">Step</th><th scope="col">Process</th><th scope="col">SV</th><th scope="col">PV</th><th scope="col">Start Time</th><th scope="col">End Time</th><th scope="col">Status</th></tr></thead><tbody>${jetflowProcessSteps.map((process, index) => {
      const processState = index === processPosition - 1 ? "active" : index < processPosition - 1 ? "completed" : "upcoming";
      const processLabel = processState === "active" ? "Current" : processState === "completed" ? "Complete" : "Pending";
      const timeline = processTimeline[index];
      const measurement = jetflowSequenceMeasurements[process];
      const actual = processState === "upcoming" ? "—" : measurement.pv;
      return `<tr class="${processState}"><td class="sequence-step-number">${String(index + 1).padStart(2, "0")}</td><td><strong>${process}</strong></td><td><span class="sequence-measurement"><small>${measurement.parameter}</small><strong>${measurement.sv}</strong></span></td><td><span class="sequence-measurement ${processState === "active" ? "tracking" : ""}"><small>${measurement.parameter}</small><strong>${actual}</strong></span></td><td class="sequence-time">${timeline.start}</td><td class="sequence-time ${processState === "active" ? "in-progress" : ""}">${timeline.end}</td><td><span class="sequence-state ${processState}">${processLabel}</span></td></tr>`;
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
  const value = (key, decimals = 1) => {
    const raw = machine.values?.[key];
    return raw == null || raw === "" ? "—" : Number.isFinite(Number(raw)) ? Number(raw).toFixed(decimals) : String(raw);
  };
  const latestChemical = chemicalDispensingLogs.find((item) => item.calator === machine.id);
  const standard = [
    ["Feeding", "feeding_speed_pv"], ["Squeezing 1", "squeezing_1_speed_pv"], ["Squeezing 2", "squeezing_2_speed_pv"], ["Overfeed Out", "overfeed_out_speed_pv"],
    ["Overfeed Atas", "overfeed_upper_speed_pv"], ["Overfeed Bawah", "overfeed_lower_speed_pv"], ["Folder", "folder_speed_pv"], ["Plaiter", "plaiter_speed_pv"]
  ];
  const bianco = [
    ["OF In Bawah 1", "overfeed_in_lower_1_speed_pv"], ["OF In Bawah 2", "overfeed_in_lower_2_speed_pv"], ["OF In Atas 3", "overfeed_in_upper_3_speed_pv"], ["OF In Atas 4", "overfeed_in_upper_4_speed_pv"],
    ["Feeding", "feeding_speed_pv"], ["Squeezing 1", "squeezing_1_speed_pv"], ["Squeezing 2", "squeezing_2_speed_pv"], ["OF Out Bawah 1", "overfeed_out_lower_1_speed_pv"],
    ["OF Out Bawah 2", "overfeed_out_lower_2_speed_pv"], ["OF Out Atas 3", "overfeed_out_upper_3_speed_pv"], ["OF Out Atas 4", "overfeed_out_upper_4_speed_pv"], ["Folder", "folder_speed_pv"], ["Plaiter", "plaiter_speed_pv"]
  ];
  const speeds = isBianco ? bianco : standard;
  return `
    ${processBreadcrumb("calator", machine)}
    ${pageHead("calator", selector(calators.filter((item) => item.area === machine.area), "calator"))}
    ${machineHero(machine, "CL", `${machine.subtype || "—"} · ${machine.recipe || "Recipe belum dimapping"} · Jetflow source belum dimapping`)}
    <section class="kpi-grid">
      ${kpi("Overfeed Out Avg", value("overfeed_out_speed_pv", 2), "m/min", "OF", "<strong>PV aktual</strong>· snapshot PostgreSQL")}
      ${kpi("Dancing Roller", value("dancer_position_pv"), "%", "DR", "<strong>PV aktual</strong>· snapshot PostgreSQL", "success")}
      ${kpi("Output Current", value("output_total_m", 0), "m", "OP", "<strong>Output aktual</strong>· snapshot PostgreSQL")}
      ${kpi("Chemical Usage", latestChemical?.actual || "—", "", "CH", latestChemical ? `<strong>${latestChemical.status}</strong>· ${latestChemical.request}` : "No data · chemical transaction belum ada")}
    </section>
    <section class="grid-2">
      ${panel("Critical Process", `Speed ${machine.subtype} dari feeding sampai plaiter`, `<div class="speed-grid">${speeds.map((item, index) => speedCard(item, index, machine)).join("")}</div>`)}
      ${panel("Live Monitoring", "Overfeed Out, dancing roller, chemical transfer, dan output saat ini", `
        <div class="metric-grid">
          ${metricTile("OF Out spread", value("overfeed_out_spread_pv", 2), "No data · limit belum dimapping")}
          ${metricTile("Dancing roller", value("dancer_position_pv"), "PV aktual · center belum dimapping")}
          ${metricTile("Folder ratio", value("folder_ratio_pv", 3), "No data · tag belum dimapping")}
          ${metricTile("Chemical route", latestChemical ? latestChemical.code : "—", latestChemical ? `${latestChemical.variant} → ${machine.id}` : "No data")}
          ${metricTile("Transfer status", latestChemical?.status || "—", latestChemical ? `${latestChemical.actual} / ${latestChemical.target}` : "No data")}
          ${metricTile("Good output", `${value("output_total_m", 0)}<small>m</small>`, "Output aktual snapshot")}
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

function speedCard(item, index, machine) {
  const [label, key] = item;
  const raw = machine.values?.[key];
  const hasValue = raw != null && raw !== "" && Number.isFinite(Number(raw));
  const value = hasValue ? Number(raw).toFixed(1) : "—";
  const setpoint = machine.values?.[key.replace(/_pv$/, "_sv")];
  const progress = hasValue ? Math.min(94, Number(raw) * 2.8) : 0;
  return `<div class="speed-card"><div class="speed-card-head"><strong>${label}</strong><i class="equipment-state ${hasValue ? "" : "offline"}"></i></div><div class="card-reading">${value}<small>m/min</small></div><div class="card-caption">SV ${setpoint == null ? "—" : setpoint} · ${hasValue ? "PV actual" : "No data"}</div><div class="mini-bar"><span style="width:${progress}%"></span></div></div>`;
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
    ${kalenderPidPanel(machine)}
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
    { id: "SDP-CL-D", name: "SDP Calator Depan", demand: 58, location: "Area Depan", supply: "MDP Calator & Dispensing", downstream: "3 Calator + 1 Dispensing" },
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

function databaseIntegrationPage() {
  const isLoading = backendConnection.status === "connecting";
  const unavailable = backendConnection.status === "fallback";
  const title = isLoading ? "Connecting live data" : unavailable ? "Live data unavailable" : "Waiting for operational data";
  const description = isLoading
    ? "Loading the latest machine and production status."
    : unavailable
      ? "Current operating data cannot be loaded. Please contact the system administrator."
      : "No operational records are available yet.";
  return `
    ${pageHead(state.page)}
    <section class="card panel">
      <div class="empty-state">
        <strong>${title}</strong>
        <span>${description}</span>
      </div>
    </section>
  `;
}

function actualText(value) {
  return String(value ?? "—").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[character]));
}

function actualLabel(key) {
  return String(key).replace(/[_\.]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function actualTime(value) {
  return value ? new Date(value).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }) : "—";
}

function actualMetric(label, value, unit = "", foot = "Data aktual") {
  return `<article class="card kpi-card"><div class="kpi-top"><span class="kpi-label">${actualText(label)}</span><span class="quality-pill good">ACTUAL</span></div><div class="kpi-value">${actualText(value)}<small>${actualText(unit)}</small></div><div class="kpi-foot">${actualText(foot)}</div></article>`;
}

function actualUtilityKind(item) {
  const descriptor = `${item.utility_code || ""} ${item.label || ""} ${item.unit || ""}`.toUpperCase();
  if (descriptor.includes("STEAM") || descriptor.includes("BOILER")) return "steam";
  if (descriptor.includes("THERMAL") || descriptor.includes("OIL")) return "thermal";
  if (descriptor.includes("WATER") || descriptor.includes("H2O") || /(^|[\s_.-])AIR($|[\s_.-])/.test(descriptor) || descriptor.includes("M³")) return "water";
  if (descriptor.includes("ELECT") || descriptor.includes("POWER") || /(^|[\s_.-])[KM]W(H)?($|[\s_.-])/.test(descriptor)) return "electrical";
  return "other";
}

function actualUtilityQuality(quality) {
  const value = String(quality || "UNKNOWN").trim().toUpperCase();
  if (value === "GOOD") return { tone: "good", pill: "good", label: "GOOD" };
  if (["BAD", "ERROR", "NOT_CONNECTED"].includes(value)) return { tone: "bad", pill: "bad", label: value };
  if (["STALE", "UNCERTAIN", "WARNING"].includes(value)) return { tone: "warning", pill: "stale", label: value };
  return { tone: "unknown", pill: "unknown", label: value || "UNKNOWN" };
}

function actualUtilityKpi(utilities) {
  const utilitySlots = [
    { kind: "water", label: "Water", icon: "💧" },
    { kind: "electrical", label: "Electrical Energy", icon: "⚡" },
    { kind: "steam", label: "Steam", icon: "≋" },
    { kind: "thermal", label: "Thermal Oil", icon: "♨" },
  ];
  const selectedUtilities = utilitySlots.map((slot) => ({
    ...slot,
    item: utilities.find((item) => actualUtilityKind(item) === slot.kind),
  }));
  const mappedUtilities = selectedUtilities.map((slot) => slot.item).filter(Boolean);
  const goodCount = mappedUtilities.filter((item) => actualUtilityQuality(item.quality).tone === "good").length;
  const newestTimestamp = mappedUtilities
    .map((item) => new Date(item.source_ts).getTime())
    .filter(Number.isFinite)
    .sort((left, right) => right - left)[0];
  const readings = selectedUtilities.map(({ kind, label, icon, item }) => {
    if (!item) {
      return `<div class="utility-kpi-reading utility-${kind} no-data"><span class="utility-kpi-icon" aria-hidden="true">${icon}</span><div class="utility-kpi-copy"><span class="utility-kpi-name">${label}</span><small>No mapped snapshot</small><strong>—<small></small></strong></div></div>`;
    }
    const rawValue = item.value;
    const numericValue = rawValue !== null && rawValue !== "" ? Number(rawValue) : Number.NaN;
    const displayValue = Number.isFinite(numericValue)
      ? numericValue.toLocaleString("id-ID", { maximumFractionDigits: 2 })
      : actualText(rawValue);
    return `<div class="utility-kpi-reading utility-${kind}"><span class="utility-kpi-icon" aria-hidden="true">${icon}</span><div class="utility-kpi-copy"><span class="utility-kpi-name">${label}</span><small title="${actualText(item.label)}">${actualText(item.label)}</small><strong>${displayValue}<small>${actualText(item.unit)}</small></strong></div></div>`;
  }).join("");
  const qualityTone = !mappedUtilities.length ? "unknown" : goodCount === utilitySlots.length ? "good" : "stale";
  const qualityLabel = !mappedUtilities.length ? "NO DATA" : `${goodCount}/${utilitySlots.length} GOOD`;
  return `
    <article class="card kpi-card overview-utility-kpi">
      <div class="kpi-top"><span class="kpi-label">Utility Now</span><span class="quality-pill ${qualityTone}">${qualityLabel}</span></div>
      <div class="utility-kpi-grid">${readings}</div>
      <div class="kpi-foot">Latest received · ${newestTimestamp ? actualTime(newestTimestamp) : "—"}</div>
    </article>
  `;
}

function actualFleet() {
  return [...jetflows, ...calators, ...dryers, ...kalenders, ...dispensers];
}

function actualEmpty(label = "Belum ada data aktual") {
  return `<div class="empty-state"><strong>${actualText(label)}</strong><span>Collector atau proses input database belum mengirim data untuk tampilan ini.</span></div>`;
}

function actualAssetTable(assets) {
  if (!assets.length) return actualEmpty("Belum ada asset terdaftar");

  const distinctProcesses = [...new Set(assets.map((a) => a.process).filter(Boolean))];
  const isMultiProcess = distinctProcesses.length > 1;

  let processFiltered = assets;
  if (isMultiProcess && state.machineTable.process !== "all") {
    processFiltered = assets.filter((a) => a.process === state.machineTable.process);
  }

  const areaMap = new Map();
  processFiltered.forEach((a) => {
    if (a.area && !areaMap.has(a.area)) {
      areaMap.set(a.area, a.areaLabel || a.area);
    }
  });

  let areaFiltered = processFiltered;
  if (state.machineTable.area !== "all") {
    areaFiltered = processFiltered.filter((a) => a.area === state.machineTable.area);
  }

  let statusFiltered = areaFiltered;
  if (state.machineTable.status !== "all") {
    statusFiltered = areaFiltered.filter((a) => a.state === state.machineTable.status);
  }

  const query = (state.machineTable.search || "").trim().toLowerCase();
  let searchFiltered = statusFiltered;
  if (query) {
    searchFiltered = statusFiltered.filter((a) =>
      String(a.id || "").toLowerCase().includes(query) ||
      String(a.name || "").toLowerCase().includes(query) ||
      String(a.batch || "").toLowerCase().includes(query) ||
      String(a.areaLabel || a.area || "").toLowerCase().includes(query)
    );
  }

  const totalFiltered = searchFiltered.length;
  const pageSize = state.machineTable.pageSize || 8;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const currentPage = Math.min(Math.max(1, state.machineTable.page), totalPages);
  state.machineTable.page = currentPage;

  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = searchFiltered.slice(startIndex, startIndex + pageSize);
  const startItem = totalFiltered === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(startIndex + pageSize, totalFiltered);

  const processTabs = isMultiProcess ? `
    <div class="machine-table-process-tabs">
      <button class="mt-tab ${state.machineTable.process === "all" ? "active" : ""}" data-mt-process="all">
        Semua Proses <span class="mt-badge">${assets.length}</span>
      </button>
      ${distinctProcesses.map((p) => {
        const count = assets.filter((a) => a.process === p).length;
        const label = processConfig[p]?.singular || p;
        return `<button class="mt-tab ${state.machineTable.process === p ? "active" : ""}" data-mt-process="${p}">
          ${actualText(label)} <span class="mt-badge">${count}</span>
        </button>`;
      }).join("")}
    </div>
  ` : "";

  const areaPills = areaMap.size > 0 ? `
    <div class="machine-table-area-bar">
      <span class="mt-filter-label">Filter Area:</span>
      <div class="machine-table-area-pills">
        <button class="mt-area-pill ${state.machineTable.area === "all" ? "active" : ""}" data-mt-area="all">
          Semua Area <small>(${processFiltered.length})</small>
        </button>
        ${[...areaMap.entries()].map(([code, label]) => {
          const count = processFiltered.filter((a) => a.area === code).length;
          return `<button class="mt-area-pill ${state.machineTable.area === code ? "active" : ""}" data-mt-area="${code}">
            ${actualText(label)} <small>(${count})</small>
          </button>`;
        }).join("")}
      </div>
    </div>
  ` : "";

  const statusOptions = [
    { id: "all", label: "Semua Status" },
    { id: "running", label: "Running" },
    { id: "idle", label: "Idle" },
    { id: "warning", label: "Warning" },
    { id: "fault", label: "Fault" },
  ];
  const toolbar = `
    <div class="machine-table-toolbar">
      <div class="machine-table-search-box">
        <span class="search-icon" aria-hidden="true">🔍</span>
        <input type="search" class="machine-table-search-input" placeholder="Cari mesin, nomor batch, atau nama..." value="${actualText(state.machineTable.search)}" data-mt-search />
        ${state.machineTable.search ? `<button class="search-clear-btn" data-mt-clear-search aria-label="Hapus pencarian">×</button>` : ""}
      </div>
      <div class="machine-table-status-filters">
        ${statusOptions.map((st) => `
          <button class="mt-status-btn ${state.machineTable.status === st.id ? "active" : ""} ${st.id}" data-mt-status="${st.id}">
            ${st.label}
          </button>
        `).join("")}
      </div>
    </div>
  `;

  const tableRows = pageItems.length ? pageItems.map((asset) => `
    <tr class="clickable-row" data-machine-row="${asset.process || 'jetflow'}|${asset.id}" role="button" tabindex="0" aria-label="Buka detail mesin ${actualText(asset.id)}" title="Klik untuk membuka detail ${asset.id}">
      <td>
        <strong class="machine-id-highlight">${actualText(asset.id)}</strong>
        <br><small class="machine-name-sub">${actualText(asset.name)}</small>
      </td>
      <td>
        <span class="machine-area-badge">${actualText(asset.areaLabel || asset.area)}</span>
      </td>
      <td>${statusPill(asset.state)}</td>
      <td>${machineConnectionBadge(asset, "controller")}</td>
      <td>${machineAlarmNote(asset.id, true)}</td>
      <td class="mono"><strong>${actualText(asset.batch)}</strong></td>
      <td>
        <div class="machine-progress-wrap">
          <div class="machine-progress-bar"><span style="width: ${Math.min(100, Math.max(0, asset.progress))}%"></span></div>
          <small>${actualText(asset.progress)}%</small>
        </div>
      </td>
      <td class="mono">${actualTime(asset.sourceTs)}</td>
      <td><span class="quality-pill ${String(asset.quality).toLowerCase() === "good" ? "good" : "stale"}">${actualText(asset.quality)}</span></td>
    </tr>
  `).join("") : `<tr><td colspan="9" class="table-empty-row">Tidak ada mesin yang sesuai dengan filter yang dipilih.</td></tr>`;

  const paginationFooter = `
    <div class="machine-table-pagination">
      <div class="mt-page-info">
        Menampilkan <strong>${startItem}–${endItem}</strong> dari <strong>${totalFiltered}</strong> asset
      </div>
      <div class="mt-page-actions">
        <button class="mt-page-btn" data-mt-page="first" ${currentPage <= 1 ? "disabled" : ""} title="Halaman Pertama">«</button>
        <button class="mt-page-btn" data-mt-page="prev" ${currentPage <= 1 ? "disabled" : ""} title="Halaman Sebelumnya">‹ Prev</button>
        <span class="mt-page-current">Halaman <strong>${currentPage}</strong> dari <strong>${totalPages}</strong></span>
        <button class="mt-page-btn" data-mt-page="next" ${currentPage >= totalPages ? "disabled" : ""} title="Halaman Berikutnya">Next ›</button>
        <button class="mt-page-btn" data-mt-page="last" ${currentPage >= totalPages ? "disabled" : ""} title="Halaman Terakhir">»</button>
      </div>
    </div>
  `;

  return `
    <div class="machine-status-container">
      ${processTabs}
      ${areaPills}
      ${toolbar}
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Area</th>
              <th>Status</th>
              <th>Controller</th>
              <th>Active alarm</th>
              <th>Batch</th>
              <th>Progress</th>
              <th>Source time</th>
              <th>Quality</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
      ${paginationFooter}
    </div>
  `;
}

function actualSensorValues(assets) {
  const rows = assets.flatMap((asset) => Object.entries(asset.values || {}).filter(([key]) => !["source", "note"].includes(key)).map(([key, value]) => ({ asset, key, value })));
  if (!rows.length) return actualEmpty("Belum ada nilai sensor untuk mesin ini");
  return `<div class="actual-sensor-grid">${rows.map(({ asset, key, value }) => {
    const normalizedKey = key.toUpperCase();
    const tag = backendTelemetry.find((item) => item.asset_id === asset.id && String(item.signal_role || "").replace(/[._]/g, "_") === normalizedKey);
    const unit = tag?.engineering_unit || "";
    return `<article class="actual-sensor-card">
      <div class="actual-sensor-card-top"><span class="actual-sensor-asset">${actualText(asset.id)}</span><span class="quality-pill ${String(asset.quality).toLowerCase() === "good" ? "good" : "stale"}">${actualText(asset.quality)}</span></div>
      <span class="actual-sensor-label">${actualText(actualLabel(key))}</span>
      <strong class="actual-sensor-value">${actualText(value)}<small>${actualText(unit)}</small></strong>
      <span class="actual-sensor-time">Updated ${actualTime(asset.sourceTs)}</span>
    </article>`;
  }).join("")}</div>`;
}

function actualHistorianRange() {
  if (actualHistorian.range === "CUSTOM") {
    const from = new Date(state.history.start);
    const to = new Date(state.history.end);
    const hours = Math.max(1 / 60, (to.getTime() - from.getTime()) / 3_600_000);
    return { from, to, granularity: hours > 24 ? "15m" : "1m" };
  }
  const hours = { "1H": 1, "8H": 8, "24H": 24, "7D": 24 * 7 }[actualHistorian.range] || 8;
  const to = new Date();
  return { from: new Date(to.getTime() - hours * 60 * 60_000), to, granularity: hours > 24 ? "15m" : "1m" };
}

function actualHistorianKey(assetId) {
  return `${assetId}:${actualHistorian.range}`;
}

function actualSignalLabel(signalRole) {
  return String(signalRole || "").replace(/[._]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function actualTagSeriesKind(tag) {
  const source = `${tag?.signal_role || ""}.${tag?.tag_code || ""}`;
  return source.match(/(?:^|[._])(PV|SV|TOTAL)$/i)?.[1]?.toUpperCase() || "VALUE";
}

function actualTagParameterKey(assetId, tag) {
  const tagCode = String(tag?.tag_code || "");
  const marker = `${assetId}.`;
  const markerIndex = tagCode.indexOf(marker);
  const semanticName = markerIndex >= 0
    ? tagCode.slice(markerIndex + marker.length)
    : String(tag?.signal_role || tagCode);
  return semanticName.replace(/[._](PV|SV|TOTAL)$/i, "");
}

function actualSensorParameters(assetId, sensors) {
  const parameters = new Map();
  sensors.forEach((tag) => {
    const key = actualTagParameterKey(assetId, tag);
    if (!parameters.has(key)) parameters.set(key, { key, label: actualSignalLabel(key), tags: [] });
    parameters.get(key).tags.push(tag);
  });
  return [...parameters.values()].sort((left, right) => left.label.localeCompare(right.label));
}

function actualParameterSeries(parameter, kind) {
  return parameter?.tags.find((tag) => actualTagSeriesKind(tag) === kind);
}

const actualBatchSetpointKeyByParameter = {
  "UPPER_FELT.TEMPERATURE": "temperature_upper_c",
  "LOWER_FELT.TEMPERATURE": "temperature_lower_c",
  "UPPER_FELT.LOADCELL": "loadcell_upper_kg",
  "LOWER_FELT.LOADCELL": "loadcell_lower_kg",
  "FABRIC.WIDTH": "fabric_width_cm",
  "OVERFEED.SPEED": "overfeed_percent",
};

function actualBatchSetpointSeries(machine, parameter, registeredTag) {
  const run = actualBatchRunFor(machine);
  const context = run ? actualBatchPrograms.get(run.process_run_id) : null;
  const setpointKey = actualBatchSetpointKeyByParameter[parameter?.key];
  if (!context || !setpointKey) return null;
  const configuredSteps = context.steps.filter((step) => step.setpoint_json?.[setpointKey] != null && step.started_at);
  if (!configuredSteps.length) return null;
  const points = configuredSteps.flatMap((step, index) => {
    const value = Number(step.setpoint_json[setpointKey]);
    const nextStart = configuredSteps[index + 1]?.started_at;
    const end = nextStart || context.run.ended_at || step.ended_at || step.started_at;
    return [
      { bucket_start: step.started_at, avg_value: value, last_value: value },
      { bucket_start: end, avg_value: value, last_value: value },
    ];
  });
  return {
    ...(registeredTag || {}),
    signal_role: registeredTag?.signal_role || `${setpointKey.toUpperCase()}_SV`,
    engineering_unit: registeredTag?.engineering_unit || actualBatchSettingMeta(setpointKey)[1],
    points,
    derived_from_process_step: true,
  };
}

function selectedActualParameter(machine, data) {
  const parameters = actualSensorParameters(machine.id, data?.sensors || []);
  const storedKey = actualHistorian.selectedParameter.get(machine.id) || historianParameterPreferences[machine.id];
  const fallbackKey = parameters.find((parameter) => actualParameterSeries(parameter, "PV") || actualParameterSeries(parameter, "SV"))?.key || parameters[0]?.key;
  const selectedKey = parameters.some((parameter) => parameter.key === storedKey) ? storedKey : fallbackKey;
  if (selectedKey && actualHistorian.selectedParameter.get(machine.id) !== selectedKey) {
    rememberActualParameter(machine.id, selectedKey);
  }
  return {
    parameters,
    parameter: parameters.find((item) => item.key === selectedKey),
  };
}

function actualHistorianDisplayValue(value, unit = "") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${number.toLocaleString("id-ID", { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ""}`;
}

function requestHistorianRender() {
  const alarmRuleForm = document.querySelector("[data-alarm-rule-form]");
  if (alarmRuleForm) captureAlarmRuleDraft(alarmRuleForm);
  deferredRealtimeRender = true;
  scheduleSafeRealtimeRender();
}

async function loadActualHistorian(machine) {
  const key = actualHistorianKey(machine.id);
  if (actualHistorian.cache.has(key) || actualHistorian.loading.has(key)) return;
  actualHistorian.loading.add(key);
  try {
    const range = actualHistorianRange();
    const snapshotResponse = await fetch(`/api/v1/assets/${encodeURIComponent(machine.id)}/snapshot`, { cache: "no-store" });
    if (!snapshotResponse.ok) throw new Error("Tag registry unavailable");
    const snapshot = await snapshotResponse.json();
    const sensorResults = (snapshot.tags || []).map((tag) => ({ ...tag, points: null }));
    const equipment = backendEquipment.filter((item) => item.assetId === machine.id).slice(0, 12);
    const motorResults = await Promise.all(equipment.map(async (item) => {
      const url = new URL(`/api/v1/equipment/${encodeURIComponent(item.id)}/trend`, window.location.origin);
      url.searchParams.set("granularity", range.granularity);
      url.searchParams.set("from", range.from.toISOString());
      url.searchParams.set("to", range.to.toISOString());
      const response = await fetch(url, { cache: "no-store" });
      const payload = response.ok ? await response.json() : { points: [] };
      return { ...item, points: payload.points || [] };
    }));
    actualHistorian.cache.set(key, { sensors: sensorResults, motors: motorResults, range });
  } catch (error) {
    actualHistorian.cache.set(key, { error: error instanceof Error ? error.message : "Historian unavailable", sensors: [], motors: [] });
  } finally {
    actualHistorian.loading.delete(key);
    requestHistorianRender();
  }
}

async function loadActualSensorSeries(machine, tagCode) {
  const key = actualHistorianKey(machine.id);
  const requestKey = `${key}:${tagCode}`;
  const data = actualHistorian.cache.get(key);
  const sensor = data?.sensors.find((item) => item.tag_code === tagCode);
  if (!data || !sensor || Array.isArray(sensor.points) || actualHistorian.loading.has(requestKey)) return;
  actualHistorian.loading.add(requestKey);
  try {
    const url = new URL("/api/v1/telemetry/aggregate", window.location.origin);
    url.searchParams.set("asset_id", machine.id);
    url.searchParams.set("tag_code", tagCode);
    url.searchParams.set("granularity", data.range.granularity);
    url.searchParams.set("from", data.range.from.toISOString());
    url.searchParams.set("to", data.range.to.toISOString());
    const response = await fetch(url, { cache: "no-store" });
    const payload = response.ok ? await response.json() : { points: [] };
    sensor.points = payload.points || [];
  } finally {
    actualHistorian.loading.delete(requestKey);
    requestHistorianRender();
  }
}

function databaseActualHistorianPanel(machine) {
  const key = actualHistorianKey(machine.id);
  const data = actualHistorian.cache.get(key);
  const trackedBatch = selectedBatchFor(machine.process, machine);
  const trackingLabel = trackedBatch ? `Batch ${actualText(trackedBatch)} · ` : "";
  if (!data && !actualHistorian.loading.has(key)) void loadActualHistorian(machine);
  const rangeButtons = ["1H", "8H", "24H", "7D", "CUSTOM"].map((range) => `<button class="${actualHistorian.range === range ? "active" : ""}" data-actual-trend-range="${range}">${range === "CUSTOM" ? "Custom" : range}</button>`).join("");
  const customRange = actualHistorian.range === "CUSTOM" ? `<div class="chemical-custom-range actual-history-custom"><label class="date-field"><span>Start date & time</span><input type="datetime-local" data-actual-history-date="start" value="${toDateTimeLocal(state.history.start)}" /></label><label class="date-field"><span>End date & time</span><input type="datetime-local" data-actual-history-date="end" value="${toDateTimeLocal(state.history.end)}" /></label><button class="button primary small" data-actual-history-apply="${actualText(machine.id)}">Apply range</button></div>` : "";
  if (!data) return panel("Historical Trends", `${trackingLabel}Memuat aggregate historian PostgreSQL untuk sensor dan motor.`, `${customRange}<div class="actual-historian-loading">Loading ${actualText(actualHistorian.range)} trend data…</div>`, `<div class="segmented">${rangeButtons}</div>`, "actual-historian-panel");
  if (data.error) return panel("Historical Trends", `${trackingLabel}Historian PostgreSQL`, actualEmpty(data.error), `<div class="segmented">${rangeButtons}</div>`, "actual-historian-panel");
  const sensors = data.sensors;
  const motors = data.motors;
  const { parameters, parameter: selectedParameter } = selectedActualParameter(machine, data);
  const pvSensor = actualParameterSeries(selectedParameter, "PV");
  const registeredSvSensor = actualParameterSeries(selectedParameter, "SV");
  const valueSensor = pvSensor || registeredSvSensor || selectedParameter?.tags[0];
  const visibleSensors = [...new Set([pvSensor, registeredSvSensor].filter(Boolean).length ? [pvSensor, registeredSvSensor].filter(Boolean) : [valueSensor].filter(Boolean))];
  visibleSensors.forEach((sensor) => {
    if (!Array.isArray(sensor.points)) void loadActualSensorSeries(machine, sensor.tag_code);
  });
  const derivedSvSensor = actualBatchSetpointSeries(machine, selectedParameter, registeredSvSensor);
  const svSensor = registeredSvSensor?.points?.length ? registeredSvSensor : derivedSvSensor || registeredSvSensor;
  const selectedEquipmentId = actualHistorian.selectedEquipment.get(machine.id) || motors.find((item) => item.points.length)?.id || motors[0]?.id;
  const selectedMotor = motors.find((item) => item.id === selectedEquipmentId) || motors[0];
  const rangeText = data.range ? `${formatDateTime(data.range.from.getTime(), true)} — ${formatDateTime(data.range.to.getTime(), true)}` : actualHistorian.range;
  const sensorLoading = visibleSensors.some((sensor) => !Array.isArray(sensor.points));
  const sensorHasPoints = Boolean(pvSensor?.points?.length || svSensor?.points?.length || valueSensor?.points?.length);
  const pvLatest = pvSensor?.points?.at(-1)?.last_value ?? pvSensor?.points?.at(-1)?.avg_value;
  const svLatest = svSensor?.points?.at(-1)?.last_value ?? svSensor?.points?.at(-1)?.avg_value;
  const deviation = Number.isFinite(Number(pvLatest)) && Number.isFinite(Number(svLatest)) ? Number(pvLatest) - Number(svLatest) : null;
  const sensorUnit = pvSensor?.engineering_unit || svSensor?.engineering_unit || valueSensor?.engineering_unit || "";
  const totalPoints = [pvSensor, svSensor].filter(Boolean).reduce((sum, sensor) => sum + (Array.isArray(sensor.points) ? sensor.points.length : 0), 0);
  const sensorContent = selectedParameter ? `
    <div class="actual-historian-toolbar"><label>Parameter<select class="history-select-control" data-actual-trend-parameter="${machine.id}">${parameters.map((item) => `<option value="${actualText(item.key)}" ${item.key === selectedParameter.key ? "selected" : ""}>${actualText(item.label)}</option>`).join("")}</select></label><span class="data-pill neutral">${sensorLoading ? "…" : totalPoints} POINTS</span></div>
    ${sensorLoading ? `<div class="actual-historian-loading">Memuat trend PV/SV ${actualText(selectedParameter.label)}…</div>` : sensorHasPoints ? `<div class="chart-container compact"><canvas class="chart-canvas" id="actual-sensor-trend-${machine.id}" aria-label="Trend PV dan SV ${actualText(selectedParameter.label)}"></canvas></div><div class="actual-trend-legend"><span class="${pvSensor?.points?.length ? "" : "muted"}"><i class="pv"></i>PV · Actual telemetry${pvSensor?.points?.length ? "" : " (belum ada data)"}</span><span class="${svSensor?.points?.length ? "" : "muted"}"><i class="sv"></i>SV · ${svSensor?.derived_from_process_step ? "Process setting" : "Setpoint telemetry"}${svSensor?.points?.length ? "" : " (belum ada data)"}</span></div><div class="actual-historian-summary"><span>PV terkini <b>${actualHistorianDisplayValue(pvLatest, sensorUnit)}</b></span><span>SV terkini <b>${actualHistorianDisplayValue(svLatest, sensorUnit)}</b></span><span>Deviasi PV − SV <b>${actualHistorianDisplayValue(deviation, sensorUnit)}</b></span></div>` : actualEmpty("Parameter terdaftar, tetapi belum memiliki data numerik pada range ini.")}
    ${!registeredSvSensor && !derivedSvSensor ? `<p class="actual-trend-note">Tag atau process setting SV untuk parameter ini belum tersedia. Grafik tetap menampilkan PV aktual yang ada.</p>` : ""}` : actualEmpty("Belum ada tag aktif untuk asset ini.");
  const motorContent = selectedMotor ? `
    <div class="actual-historian-toolbar"><label>Motor<select class="history-select-control" data-actual-motor-select="${machine.id}">${motors.map((item) => `<option value="${actualText(item.id)}" ${item.id === selectedMotor.id ? "selected" : ""}>${actualText(item.name)} · ${actualText(item.code)}</option>`).join("")}</select></label><span class="data-pill neutral">${selectedMotor.points.length} POINTS</span></div>
    ${selectedMotor.points.length ? `<div class="chart-container compact"><canvas class="chart-canvas" id="actual-motor-trend-${machine.id}" aria-label="Trend motor ${actualText(selectedMotor.name)}"></canvas></div><div class="actual-trend-legend"><span><i class="phase-r"></i>Phase R</span><span><i class="phase-s"></i>Phase S</span><span><i class="phase-t"></i>Phase T</span></div><div class="actual-historian-summary"><span>Power avg <b>${actualHistorianDisplayValue(selectedMotor.points.at(-1)?.active_power_avg_kw, "kW")}</b></span><span>Frequency <b>${actualHistorianDisplayValue(selectedMotor.points.at(-1)?.drive_frequency_avg_hz, "Hz")}</b></span><span>Energy delta <b>${actualHistorianDisplayValue(selectedMotor.points.at(-1)?.energy_delta_kwh, "kWh")}</b></span></div>` : actualEmpty("Equipment terdaftar, tetapi belum memiliki historian motor pada range ini.")}` : actualEmpty("Belum ada master equipment untuk asset ini.");
  return panel("Historical Trends", `${trackingLabel}${actualText(rangeText)} · aggregate ${actualText(data.range?.granularity || "")} · satu parameter dengan pasangan PV/SV`, `${customRange}<div class="actual-historian-grid"><article class="actual-historian-block"><div class="actual-historian-block-head"><span class="eyebrow">PROCESS SENSOR</span><h3>PV / SV Parameter Trend</h3></div>${sensorContent}</article><article class="actual-historian-block"><div class="actual-historian-block-head"><span class="eyebrow">MOTOR & DRIVE</span><h3>3-Phase Trend</h3></div>${motorContent}</article></div>`, `<div class="segmented">${rangeButtons}</div>`, "actual-historian-panel");
}

function alignedActualParameterTrend(parameter, machine = null) {
  const registeredSv = actualParameterSeries(parameter, "SV");
  const effectiveSv = machine && !registeredSv?.points?.length ? actualBatchSetpointSeries(machine, parameter, registeredSv) || registeredSv : registeredSv;
  const available = [
    { kind: "PV", tag: actualParameterSeries(parameter, "PV") },
    { kind: "SV", tag: effectiveSv },
  ].filter((item) => item.tag?.points?.length);
  if (!available.length) {
    const fallback = parameter?.tags.find((tag) => tag.points?.length);
    if (fallback) available.push({ kind: "PV", tag: fallback });
  }
  const timestamps = [...new Set(available.flatMap(({ tag }) => tag.points.map((point) => new Date(point.bucket_start).getTime())))].sort((left, right) => left - right);
  const series = available.map(({ kind, tag }) => {
    const pointsByTime = new Map(tag.points.map((point) => [new Date(point.bucket_start).getTime(), Number(point.avg_value ?? point.last_value)]));
    let lastValue = [...pointsByTime.values()].find(Number.isFinite) ?? 0;
    return {
      kind,
      data: timestamps.map((timestamp) => {
        const nextValue = pointsByTime.get(timestamp);
        if (Number.isFinite(nextValue)) lastValue = nextValue;
        return lastValue;
      }),
    };
  });
  return { timestamps, series };
}

function drawActualMachineHistorian() {
  const type = state.page;
  const machineId = state.drill[type]?.machine || state.selected[type];
  const machine = fleetFor(type).find((item) => item.id === machineId);
  if (!machine) return;
  const data = actualHistorian.cache.get(actualHistorianKey(machine.id));
  if (!data || data.error) return;
  const { parameter } = selectedActualParameter(machine, data);
  const parameterTrend = alignedActualParameterTrend(parameter, machine);
  const sensorUnit = parameter?.tags?.find((tag) => tag.engineering_unit)?.engineering_unit || "";
  if (parameterTrend.timestamps.length) drawLineChart(`actual-sensor-trend-${machine.id}`, parameterTrend.series.map((series) => ({ data: series.data, color: series.kind === "SV" ? "#d68b05" : "#078eaa", dash: series.kind === "SV", fill: series.kind === "PV", label: series.kind === "SV" ? "SV · Setpoint" : "PV · Actual", unit: sensorUnit })), parameterTrend.timestamps, { labelFormatter: historicalAxisLabel });
  const selectedMotor = data.motors.find((item) => item.id === (actualHistorian.selectedEquipment.get(machine.id) || data.motors.find((candidate) => candidate.points.length)?.id));
  if (selectedMotor?.points.length) drawLineChart(`actual-motor-trend-${machine.id}`, [{ data: selectedMotor.points.map((point) => Number(point.current_r_avg_a)), color: "#0072b2", width: 2.4, label: "Phase R", unit: "A" }, { data: selectedMotor.points.map((point) => Number(point.current_s_avg_a)), color: "#d55e00", width: 2.4, label: "Phase S", unit: "A" }, { data: selectedMotor.points.map((point) => Number(point.current_t_avg_a)), color: "#009e73", width: 2.4, label: "Phase T", unit: "A" }], selectedMotor.points.map((point) => new Date(point.bucket_start).getTime()), { labelFormatter: historicalAxisLabel, axisDecimals: 2 });
}

function actualOverviewPage() {
  const assets = actualFleet();
  const running = assets.filter((asset) => asset.state === "running").length;
  const stopped = assets.filter((asset) => ["idle", "fault", "offline"].includes(asset.state)).length;
  const batches = new Set(assets.map((asset) => asset.batch).filter((batch) => batch && batch !== "—")).size;
  const faults = assets.filter((asset) => asset.state === "fault").length;
  const utilities = backendUtilities.length
    ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Utility</th><th>Value</th><th>Source time</th><th>Quality</th></tr></thead><tbody>${backendUtilities.map((item) => `<tr><td>${actualText(item.label)}</td><td><strong>${actualText(item.value)} ${actualText(item.unit)}</strong></td><td class="mono">${actualTime(item.source_ts)}</td><td>${actualText(item.quality)}</td></tr>`).join("")}</tbody></table></div>`
    : actualEmpty("Belum ada snapshot utilitas");
  return `${pageHead("overview", `<span class="range-badge">LIVE DATA</span>`)}
    <section class="kpi-grid">
      ${actualMetric("Registered machines", assets.length, "asset", "asset + snapshot aktual")}
      ${actualMetric("Machine running", running, "asset", "machine_state = running")}
      ${actualMetric("Stop / fault / offline", stopped, "asset", `${faults} fault`) }
      ${actualMetric("Active batches", batches, "batch", "batch pada snapshot mesin")}
    </section>
    ${panel("Machine status", "Current operating condition", actualAssetTable(assets))}
    ${panel("Current utility usage", "Latest utility readings", utilities)}
  `;
}

function actualProcessPage(type) {
  const assets = { jetflow: jetflows, calator: calators, dryer: dryers, kalender: kalenders, chemical: dispensers }[type] || [];
  return `${pageHead(type, `<span class="range-badge">LIVE DATA</span>`)}
    ${panel(`${processConfig[type].plural} registered`, "Current machine status", actualAssetTable(assets))}
    ${panel("Live sensor measurements", "Latest validated measurements", actualSensorValues(assets))}
  `;
}

function actualUtilitiesPage() {
  const content = backendUtilities.length
    ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Code</th><th>Meter / Utility</th><th>Value</th><th>Source timestamp</th><th>Quality</th></tr></thead><tbody>${backendUtilities.map((item) => `<tr><td class="mono">${actualText(item.utility_code)}</td><td>${actualText(item.label)}</td><td><strong>${actualText(item.value)} ${actualText(item.unit)}</strong></td><td class="mono">${actualTime(item.source_ts)}</td><td>${actualText(item.quality)}</td></tr>`).join("")}</tbody></table></div>`
    : actualEmpty("Belum ada meter atau utility snapshot");
  const assetById = new Map(actualFleet().map((asset) => [asset.id, asset]));
  const areaMap = new Map();
  backendEquipment.forEach((equipment) => {
    const asset = assetById.get(equipment.assetId);
    const area = asset?.area || "UNMAPPED";
    const current = areaMap.get(area) || { key: area, label: asset?.areaLabel || area, value: 0, equipment: [] };
    current.value += Number(equipment.powerKw) || 0;
    current.equipment.push(equipment);
    areaMap.set(area, current);
  });
  const powerAreas = [...areaMap.values()].sort((left, right) => right.value - left.value);
  if (!powerAreas.some((area) => area.key === state.utility.selectedPowerArea)) state.utility.selectedPowerArea = powerAreas[0]?.key || null;
  const selectedArea = powerAreas.find((area) => area.key === state.utility.selectedPowerArea) || powerAreas[0];
  const powerRanking = [...(selectedArea?.equipment || [])].sort((left, right) => Number(right.powerKw || 0) - Number(left.powerKw || 0));
  const maxPower = Number(powerRanking[0]?.powerKw) || 1;
  const ranking = powerRanking.length ? `<div class="ranking-list">${powerRanking.map((item, index) => `<button class="ranking-row" data-machine-target="${actualText(assetById.get(item.assetId)?.process || "calator")}|${actualText(item.assetId)}"><span class="ranking-number">${index + 1}</span><span class="ranking-copy"><strong>${actualText(item.assetId)} · ${actualText(item.name)}</strong><small>${actualText(item.code)} · ${actualText(item.state)}</small><i><b style="width:${Number(item.powerKw || 0) / maxPower * 100}%"></b></i></span><span class="ranking-value">${Number(item.powerKw || 0).toLocaleString("id-ID", { maximumFractionDigits: 2 })}<small>kW</small></span></button>`).join("")}</div>` : actualEmpty("Belum ada snapshot power meter pada area ini.");
  const powerPanel = powerAreas.length ? `<section class="management-analysis-grid">${panel("Electrical Demand by Area", "Penjumlahan active power seluruh equipment aktual per area.", actualDonutMarkup(powerAreas.map((area) => ({ ...area, key: area.key, selected: area.key === state.utility.selectedPowerArea })), "kW total", "kW", "data-actual-power-area"), `<span class="data-pill good">LIVE NOW</span>`)}${panel(`Top Electrical Loads${selectedArea ? ` · ${actualText(selectedArea.label)}` : ""}`, "Klik area pada pie, kemudian buka mesin untuk diagnostic motor dan drive.", ranking, `<span class="data-pill neutral">${powerRanking.length} EQUIPMENT</span>`)}</section>` : panel("Electrical Demand by Area", "Waiting for power readings", actualEmpty("Belum ada power meter equipment aktual."));
  return `${pageHead("utilities", `<span class="range-badge">LIVE DATA</span>`)}
    <section class="kpi-grid">${backendUtilities.map((item) => actualMetric(item.label, Number(item.value).toLocaleString("id-ID", { maximumFractionDigits: 2 }), item.unit, `${actualTime(item.source_ts)} · ${item.quality}`)).join("") || actualMetric("Utility snapshot", "—", "", "No data")}</section>
    ${powerPanel}
    ${panel("Utility Snapshot Detail", "Latest validated utility readings", content)}
  `;
}

function chemicalNumber(value, maximumFractionDigits = 1) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("id-ID", { maximumFractionDigits }) : "—";
}

function chemicalDuration(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value)) return "—";
  if (value < 60) return `${value} sec`;
  return `${Math.floor(value / 60)}m ${value % 60}s`;
}

function chemicalRangeLabel(data) {
  if (!data?.range) return "Selected range";
  return `${actualTime(data.range.from)} — ${actualTime(data.range.to)} · ${actualText(data.range.granularity)} interval`;
}

function chemicalColorFor(data, code) {
  const index = Math.max(0, (data?.available_chemicals || []).findIndex((item) => item.chemical_code === code));
  return chemicalChartColors[index % chemicalChartColors.length];
}

function chemicalFilterPanel(data, machine) {
  const option = (value, label, selected) => `<option value="${actualText(value)}" ${selected === value ? "selected" : ""}>${actualText(label)}</option>`;
  const available = data?.available_chemicals || [];
  const customActive = state.chemicalLog.range === "CUSTOM";
  return `<section class="card chemical-filter-card">
    <div class="chemical-filter-copy"><span class="eyebrow">CONSUMPTION RANGE</span><h2>${machine ? actualText(machine.name) : "All Chemical Dispensing Units"}</h2><p>${chemicalRangeLabel(data)}</p></div>
    <div class="chemical-filter-controls">
      <label>Time range<select class="select-control" data-chemical-analytics-filter="range">${option("24H", "Last 24 hours", state.chemicalLog.range)}${option("7D", "Last 7 days", state.chemicalLog.range)}${option("30D", "Last 30 days", state.chemicalLog.range)}${option("THIS_MONTH", "This month", state.chemicalLog.range)}${option("CUSTOM", "Custom range", state.chemicalLog.range)}</select></label>
      <label>Chemical<select class="select-control" data-chemical-analytics-filter="variant">${option("all", "All chemicals", state.chemicalLog.variant)}${available.map((item) => option(item.chemical_code, `${item.chemical_code} · ${item.chemical_name}`, state.chemicalLog.variant)).join("")}</select></label>
      <label>Transaction mode<select class="select-control" data-chemical-analytics-filter="mode">${option("all", "Automatic + Manual + Emergency", state.chemicalLog.mode)}${option("Automatic", "Automatic", state.chemicalLog.mode)}${option("Manual", "Manual", state.chemicalLog.mode)}${option("Emergency", "Emergency", state.chemicalLog.mode)}</select></label>
    </div>
    ${customActive ? `<div class="chemical-custom-range chemical-analytics-custom"><label class="date-field"><span>Start date & time</span><input type="datetime-local" data-chemical-analytics-date="start" value="${toDateTimeLocal(state.chemicalLog.customStart)}" /></label><label class="date-field"><span>End date & time</span><input type="datetime-local" data-chemical-analytics-date="end" value="${toDateTimeLocal(state.chemicalLog.customEnd)}" /></label><button class="button primary small" data-chemical-analytics-apply>Apply range</button></div>` : ""}
  </section>`;
}

function chemicalUnitOverview(data) {
  const units = new Map((data.units || []).map((item) => [item.dispenser_id, item]));
  const cards = dispensers.map((machine) => {
    const item = units.get(machine.id) || {};
    return `<article class="card chemical-unit-card" data-chemical-unit="${actualText(machine.id)}" role="button" tabindex="0">
      <div class="chemical-unit-head"><div><span class="area-code">${actualText(machine.area)}</span><h2>${actualText(machine.name)}</h2><p>${actualText(machine.id)} · ${actualText(machine.areaLabel)}</p></div>${statusPill(machine.state || "offline")}</div>
      <div class="chemical-unit-total"><strong>${chemicalNumber(item.total_kg || 0)}</strong><span>kg consumed</span></div>
      <div class="chemical-unit-status-grid"><div class="chemical-unit-controller">${machineConnectionBadge(machine, "controller")}</div>${machineControlModeBadge(machine)}</div>
      <div class="chemical-unit-modes"><span><strong>${chemicalNumber(item.automatic_count || 0, 0)}</strong>Automatic</span><span><strong>${chemicalNumber(item.manual_count || 0, 0)}</strong>Manual</span><span class="${Number(item.emergency_count) ? "warning" : ""}"><strong>${chemicalNumber(item.emergency_count || 0, 0)}</strong>Emergency</span></div>
      <div class="chemical-unit-top"><span>Top chemical</span><strong>${actualText(item.top_chemical_code || "—")} · ${actualText(item.top_chemical_name || "No consumption")}</strong><small>${item.last_transaction_at ? `Last transaction ${actualTime(item.last_transaction_at)}` : "No transaction in selected range"}</small></div>
      <div class="area-card-foot"><span>${dispensingSupportedCalators(machine).length} supported Calators</span><strong>Open unit detail →</strong></div>
    </article>`;
  }).join("");
  return `<section class="chemical-unit-grid">${cards}</section>`;
}

function chemicalVariantSummaryPanel(data) {
  const variants = data.variants || [];
  const total = variants.reduce((sum, item) => sum + Number(item.total_kg || 0), 0) || 1;
  const rows = variants.map((item) => {
    const share = Number(item.total_kg || 0) / total * 100;
    const color = chemicalColorFor(data, item.chemical_code);
    return `<tr><td><span class="chemical-rank-dot" style="background:${color}"></span><strong>${actualText(item.chemical_code)}</strong></td><td>${actualText(item.chemical_name)}</td><td class="mono"><strong>${chemicalNumber(item.total_kg, 2)} kg</strong></td><td class="mono">${chemicalNumber(item.transaction_count, 0)}</td><td class="mono">${chemicalNumber(item.average_kg, 2)} kg</td><td class="mono">${chemicalNumber(item.minimum_kg, 2)} / ${chemicalNumber(item.maximum_kg, 2)} kg</td><td><div class="chemical-share"><i><b style="width:${Math.min(100, share)}%;background:${color}"></b></i><span>${chemicalNumber(share, 1)}%</span></div></td></tr>`;
  }).join("");
  const content = rows ? `<div class="chemical-summary-wrap"><table class="data-table chemical-summary-table"><thead><tr><th>Code</th><th>Chemical</th><th>Total</th><th>Transactions</th><th>Average</th><th>Min / Max</th><th>Share</th></tr></thead><tbody>${rows}</tbody></table></div>` : actualEmpty("Tidak ada konsumsi chemical pada range terpilih");
  return panel("Chemical Consumption Detail", "Total, frekuensi, rata-rata, minimum, maksimum, dan kontribusi masing-masing chemical", content, `<span class="data-pill neutral">${variants.length} CHEMICALS</span>`);
}

function chemicalConsumptionChartPanel(data) {
  const available = data.available_chemicals || [];
  const hidden = new Set(state.chemicalLog.chartHidden);
  const legend = available.map((item) => `<label class="chemical-chart-toggle"><input type="checkbox" data-chemical-chart-code="${actualText(item.chemical_code)}" ${hidden.has(item.chemical_code) ? "" : "checked"} /><i style="background:${chemicalColorFor(data, item.chemical_code)}"></i><span><strong>${actualText(item.chemical_code)}</strong>${actualText(item.chemical_name)}</span></label>`).join("");
  const content = data.time_series?.length ? `<div class="chemical-chart-toolbar"><span>Select chemical untuk menampilkan atau menyembunyikan series.</span><div class="chemical-chart-actions"><button class="button ghost small" data-chemical-chart-bulk="show">Show all</button><button class="button ghost small" data-chemical-chart-bulk="hide">Hide all</button></div></div><div class="chemical-chart-layout"><div class="chart-container chemical-consumption-chart"><canvas id="chemical-consumption-chart" class="chart-canvas" aria-label="Chemical consumption by time range"></canvas></div><div class="chemical-chart-legend">${legend}</div></div>` : actualEmpty("Belum ada time-series konsumsi pada range terpilih");
  return panel("Chemical Consumption Trend", `${chemicalRangeLabel(data)} · stacked consumption per interval`, content, `<span class="data-pill good">POSTGRESQL AGGREGATE</span>`);
}

function chemicalModeSummary(data) {
  const summary = data.summary || {};
  const items = [["Automatic", summary.automatic_count, "Proses penimbangan otomatis", "good"], ["Manual", summary.manual_count, "Pengambilan atau penimbangan manual", "neutral"], ["Emergency", summary.emergency_count, "Event emergency tercatat", Number(summary.emergency_count) ? "warning" : "good"]];
  return `<section class="chemical-mode-grid">${items.map(([label, value, detail, tone]) => `<article class="card chemical-mode-card ${tone}"><span>${label}</span><strong>${chemicalNumber(value || 0, 0)}</strong><small>${detail}</small></article>`).join("")}</section>`;
}

function chemicalTransactionPanel(data) {
  const rows = (data.transactions || []).map((item) => {
    const modeTone = item.mode === "Automatic" ? "good" : item.mode === "Emergency" ? "warning" : "neutral";
    const detail = item.mode === "Emergency" ? `<strong>${actualText(item.emergency_state || item.chemical_name)}</strong><small>Auto state: ${actualText(item.auto_state || "—")}</small>` : `<span>${actualText(item.stage || "Weighing completed")}</span>`;
    return `<tr><td class="chemical-time-cell"><strong>${actualTime(item.started_at || item.occurred_at)}</strong><small>End ${actualTime(item.ended_at)}</small><small>${chemicalDuration(item.duration_seconds)}</small></td><td><strong class="mono">${actualText(item.source_row_id || item.request_code)}</strong><small>${actualText(item.source_file || item.source_system)}</small></td><td><strong>${actualText(item.chemical_code)}</strong><small>${actualText(item.chemical_name)}</small></td><td class="mono"><strong>${item.actual_kg == null ? "—" : `${chemicalNumber(item.actual_kg, 3)} kg`}</strong></td><td><span class="data-pill ${modeTone}">${actualText(item.mode)}</span></td><td class="chemical-emergency-cell">${detail}</td><td>${actualText(item.calator_id || "Belum teridentifikasi")}</td><td><span class="data-pill ${item.status === "Completed" ? "good" : "warning"}">${actualText(item.status)}</span></td></tr>`;
  }).join("");
  const pagination = data.pagination || { page: 1, total_pages: 1, total_rows: 0, page_size: state.chemicalLog.pageSize };
  const first = pagination.total_rows ? (pagination.page - 1) * pagination.page_size + 1 : 0;
  const last = Math.min(pagination.total_rows, pagination.page * pagination.page_size);
  const content = `<div class="chemical-log-table-wrap"><table class="data-table chemical-transaction-table"><thead><tr><th>Time</th><th>Source ID</th><th>Chemical</th><th>Actual</th><th>Mode</th><th>Process / Emergency Detail</th><th>Calator Destination</th><th>Status</th></tr></thead><tbody>${rows || `<tr><td colspan="8" class="dispensing-empty-row">Tidak ada transaksi sesuai filter.</td></tr>`}</tbody></table></div><div class="chemical-pagination"><div><strong>${chemicalNumber(first, 0)}–${chemicalNumber(last, 0)}</strong><span>dari ${chemicalNumber(pagination.total_rows, 0)} transaksi</span></div><label>Rows<select class="select-control" data-chemical-page-size><option value="25" ${pagination.page_size === 25 ? "selected" : ""}>25</option><option value="50" ${pagination.page_size === 50 ? "selected" : ""}>50</option><option value="100" ${pagination.page_size === 100 ? "selected" : ""}>100</option></select></label><div class="chemical-page-actions"><button class="button small" data-chemical-page="prev" ${pagination.page <= 1 ? "disabled" : ""}>← Previous</button><span>Page <strong>${pagination.page}</strong> / ${pagination.total_pages}</span><button class="button small" data-chemical-page="next" ${pagination.page >= pagination.total_pages ? "disabled" : ""}>Next →</button></div></div>`;
  const autoUpdateConnected = backendConnection.realtime === "connected";
  const autoUpdateBadge = `<span class="data-pill ${autoUpdateConnected ? "good" : "warning"}">${autoUpdateConnected ? "LIVE AUTO-UPDATE" : "AUTO-UPDATE PAUSED"}</span>`;
  return panel("Chemical Transaction Log", "Automatic, Manual, dan Emergency · transaksi baru dimuat otomatis", content, autoUpdateBadge, "chemical-transaction-panel");
}

function chemicalUnitHeader(machine, data) {
  const supported = dispensingSupportedCalators(machine);
  return `<section class="card chemical-unit-hero"><div><span class="eyebrow">CHEMICAL DISPENSING UNIT</span><h1>${actualText(machine.name)}</h1><p>${actualText(machine.id)} · Area ${actualText(machine.areaLabel)} · mendukung ${supported.length} Calator</p></div><div class="chemical-supported-list"><span>Supported Calators</span><strong>${supported.map((item) => actualText(item.id)).join(" · ") || "Belum dimapping"}</strong><small>Destination transaksi tetap “Belum teridentifikasi” sampai calator_id tersedia dari sumber.</small></div><div class="chemical-unit-live">${machineConnectionBadge(machine, "controller")}${machineControlModeBadge(machine)}<div class="chemical-unit-live-reading"><span>Machine state</span>${statusPill(machine.state || "offline")}</div><div class="chemical-unit-live-reading"><span>Last transaction</span><strong>${actualTime(data.summary?.last_transaction_at)}</strong></div></div></section>`;
}

function actualChemicalPage() {
  const preserveTransactionAnchor = chemicalAnalytics.data ? ".chemical-transaction-panel" : null;
  requestChemicalAnalytics({ preserveAnchor: preserveTransactionAnchor });
  const query = chemicalAnalyticsQuery();
  const fresh = chemicalAnalytics.dataKey === query.key;
  const machine = dispensers.find((item) => item.id === state.drill.chemical.machine) || null;
  const actions = machine ? `<button class="button" data-chemical-view="overview">← All dispensing units</button><span class="range-badge">LIVE DATA</span>` : `<span class="range-badge">LIVE DATA</span>`;
  const header = `${machine ? `<div class="process-breadcrumb"><button data-chemical-view="overview">Chemical Processing</button><span>›</span><strong>${actualText(machine.id)}</strong></div>` : ""}${pageHead("chemical", actions)}`;
  if (chemicalAnalytics.error && !chemicalAnalytics.data) return `${header}${chemicalFilterPanel(chemicalAnalytics.data, machine)}${panel("Chemical analytics unavailable", "Data transaksi tetap aman di PostgreSQL", actualEmpty(chemicalAnalytics.error))}`;
  if (!fresh && !chemicalAnalytics.data) return `${header}${chemicalFilterPanel(chemicalAnalytics.data, machine)}${panel("Loading Chemical Consumption", "Menghitung agregasi dan transaksi sesuai filter", `<div class="actual-historian-loading">Loading consumption, mode, emergency, dan transaction page…</div>`)}`;
  const data = chemicalAnalytics.data;
  const summary = data.summary || {};
  return `${header}
    ${machine ? chemicalUnitHeader(machine, data) : ""}
    ${chemicalFilterPanel(data, machine)}
    <section class="chemical-kpi-grid">${actualMetric("Total Consumption", chemicalNumber(summary.total_kg, 2), "kg", "actual_kg · selected range")}${actualMetric("Transactions", chemicalNumber(summary.transaction_count, 0), "rows", "Automatic + Manual + Emergency")}${actualMetric("Average Weight", chemicalNumber(summary.average_kg, 2), "kg", "average completed weighing")}${actualMetric("Maximum Weight", chemicalNumber(summary.maximum_kg, 2), "kg", "highest weighing in range")}${actualMetric("Emergency Events", chemicalNumber(summary.emergency_count, 0), "events", "emergency source records")}</section>
    ${machine ? chemicalDispensingPidPanel(machine) : chemicalUnitOverview(data)}
    ${chemicalModeSummary(data)}
    ${chemicalConsumptionChartPanel(data)}
    ${chemicalVariantSummaryPanel(data)}
    ${chemicalTransactionPanel(data)}
  `;
}

function solarNumber(value, decimals = 1) {
  return Number(value || 0).toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function solarStatusPill(status) {
  const value = String(status || "UNKNOWN").toUpperCase();
  const tone = ["COMPLETED", "VERIFIED", "POSTED"].includes(value) ? "good" : ["FAILED", "REJECTED", "MANUAL_REVIEW"].includes(value) ? "bad" : ["PARTIAL", "SUBMITTED", "DISPENSING"].includes(value) ? "warning" : "neutral";
  return `<span class="data-pill ${tone}">${actualText(value.replaceAll("_", " "))}</span>`;
}

function solarRangeToolbar() {
  const buttons = [["TODAY","Today"],["7D","7 days"],["30D","30 days"],["90D","90 days"],["CUSTOM","Custom"]].map(([value,label]) => `<button class="button small ${state.solar.range === value ? "primary" : "ghost"}" data-solar-range="${value}">${label}</button>`).join("");
  return `<section class="card solar-toolbar"><div><span class="eyebrow">ANALYSIS RANGE</span><strong>${actualText(state.solar.range === "CUSTOM" ? `${actualTime(solarRange().from)} — ${actualTime(solarRange().to)}` : `${state.solar.range} rolling window`)}</strong></div><div class="solar-range-actions">${buttons}</div>${state.solar.range === "CUSTOM" ? `<div class="solar-custom-range"><label>From<input type="datetime-local" data-solar-date="from" value="${toDateTimeLocal(state.solar.customFrom)}"></label><label>To<input type="datetime-local" data-solar-date="to" value="${toDateTimeLocal(state.solar.customTo)}"></label><button class="button primary small" data-solar-apply-range>Apply</button></div>` : ""}</section>`;
}

function solarTransactionTable(data, compact = false) {
  const rows = (data?.transactions || []).map((item) => {
    const requested = Number(item.requested_liters || 0), metered = item.metered_liters == null ? null : Number(item.metered_liters), variance = metered == null ? null : metered-requested;
    return `<tr><td><strong>${actualTime(item.fueling_completed_at || item.qr_created_at || item.ingested_at)}</strong><small>${actualText(item.source_system)}</small></td><td><strong class="mono">${actualText(item.qr_code)}</strong><small>${actualText(item.consumer_label || item.consumer_id || "Consumer belum dimapping")}</small></td><td><strong>${actualText(item.requester_name || "—")}</strong><small>${actualText(item.processed_by || item.qr_created_by || "—")}</small></td><td class="mono">${solarNumber(requested)} L</td><td class="mono"><strong>${metered == null ? "—" : `${solarNumber(metered)} L`}</strong></td><td class="mono ${variance != null && Math.abs(variance) > Math.max(1,requested*.02) ? "solar-variance-bad" : ""}">${variance == null ? "—" : `${variance >= 0 ? "+" : ""}${solarNumber(variance)} L`}</td><td class="mono">${item.machine_totalizer_liters == null ? "—" : `${solarNumber(item.machine_totalizer_liters)} L`}</td><td>${solarStatusPill(item.transaction_status)}</td></tr>`;
  }).join("");
  return `<div class="table-wrap solar-table-wrap"><table class="data-table solar-table"><thead><tr><th>Completed</th><th>QR / Consumer</th><th>Requester / Operator</th><th>Requested</th><th>Flow meter</th><th>Variance</th><th>Totalizer</th><th>Status</th></tr></thead><tbody>${rows || `<tr><td colspan="8">${compact ? "Belum ada transaksi terbaru." : "Tidak ada transaksi sesuai filter."}</td></tr>`}</tbody></table></div>`;
}

function solarOverview(data) {
  const overview = data.overview || {}, summary = overview.summary || {}, trend = overview.time_series || [], levelTrend = overview.level_time_series || [], users = overview.user_ranking || [];
  const maximum = Math.max(1, ...trend.map((item) => Number(item.metered_liters || 0)));
  const bars = trend.map((item) => `<div class="solar-trend-column" title="${actualText(item.bucket)} · ${solarNumber(item.metered_liters)} L"><i style="height:${Math.max(4, Number(item.metered_liters || 0)/maximum*100)}%"></i><span>${actualText(String(item.bucket || "").slice(5,10) || "—")}</span></div>`).join("");
  const levelMaximum = Math.max(1, ...levelTrend.map((item) => Number(item.maximum_stock_liters || 0)));
  const levelBars = levelTrend.map((item) => `<div class="solar-trend-column level" title="${actualText(item.bucket)} · avg ${solarNumber(item.average_stock_liters)} L"><i style="height:${Math.max(4, Number(item.average_stock_liters || 0)/levelMaximum*100)}%"></i><span>${actualText(String(item.bucket || "").slice(5,10) || "—")}</span></div>`).join("");
  const userRows = users.map((item,index) => `<div class="solar-user-row"><b>${index+1}</b><span><strong>${actualText(item.user_name)}</strong><small>${solarNumber(item.transactions,0)} transactions</small></span><em>${solarNumber(item.liters)} L</em></div>`).join("");
  const match = summary.metering_match_percent == null ? "N/A" : `${solarNumber(summary.metering_match_percent,1)}%`;
  const accuracy = summary.stock_accuracy_percent == null ? "N/A" : `${solarNumber(summary.stock_accuracy_percent,1)}%`;
  const liveLevel = summary.live_stock_liters == null ? "—" : solarNumber(summary.live_stock_liters);
  const levelFoot = summary.live_level_source_ts ? `${actualText(summary.live_level_quality)} · ${actualTime(summary.live_level_source_ts)}` : "Sensor level belum diterima";
  return `<section class="solar-kpi-grid">
    ${actualMetric("Live Tank Level", liveLevel, "L", levelFoot)}
    ${actualMetric("System Stock", solarNumber(summary.system_stock_liters), "L", "Calculated stock dari sistem sumber")}
    ${actualMetric("Fuel Consumption", solarNumber(summary.metered_liters), "L", "Flow meter · selected range")}
    ${actualMetric("Completed Fueling", solarNumber(summary.completed_transactions,0), "QR", "Completed + partial transactions")}
    ${actualMetric("Metering Match", match, "", "Backend sum vs machine totalizer")}
    ${actualMetric("Stock Accuracy", accuracy, "", "Latest physical stock opname")}
    ${actualMetric("Need Review", solarNumber(summary.review_count,0), "items", "Variance, partial, failed, manual review")}
  </section>
  <section class="solar-reconciliation-grid">
    <article class="card solar-recon-card"><span>01 · DISPENSING</span><h3>Requested vs Flow Meter</h3><strong>${solarNumber(summary.requested_liters)} L <i>→</i> ${solarNumber(summary.metered_liters)} L</strong><p>Memastikan volume aktual sesuai permintaan QR.</p></article>
    <article class="card solar-recon-card"><span>02 · TOTALIZER</span><h3>Backend vs Machine Counter</h3><strong>${solarNumber(summary.metered_liters)} L <i>↔</i> ${summary.machine_delta_liters == null ? "N/A" : `${solarNumber(summary.machine_delta_liters)} L`}</strong><p>${summary.totalizer_reset_count ? `${summary.totalizer_reset_count} reset totalizer terdeteksi.` : "Selisih totalizer dipantau per range."}</p></article>
    <article class="card solar-recon-card"><span>03 · INVENTORY</span><h3>Sensor Level vs System Stock</h3><strong>${summary.live_stock_liters == null ? "N/A" : `${solarNumber(summary.live_stock_liters)} L`} <i>↔</i> ${solarNumber(summary.system_stock_liters)} L</strong><p>Stock opname fisik tetap menjadi validasi final kesesuaian inventory.</p></article>
  </section>
  <section class="solar-analysis-grid">${panel("Tank Level Trend", "Historian sensor level aktual dalam liter", levelTrend.length ? `<div class="solar-trend">${levelBars}</div>` : actualEmpty("Belum ada histori sensor level"), `<span class="data-pill ${summary.live_level_quality === "GOOD" ? "good" : "warning"}">${actualText(summary.live_level_quality || "NO DATA")}</span>`)}${panel("Consumption Trend", "Actual flow-meter output per interval", trend.length ? `<div class="solar-trend">${bars}</div>` : actualEmpty("Belum ada transaksi pada range ini"), `<span class="data-pill good">FLOW METER</span>`, "solar-trend-panel")}${panel("Top Requesters", "Total konsumsi berdasarkan user", userRows ? `<div class="solar-user-list">${userRows}</div>` : actualEmpty("Belum ada data requester"))}</section>
  ${panel("Recent Fueling Transactions", "QR, volume requested, actual flow meter, dan totalizer", solarTransactionTable(data.transactions, true), `<button class="button small" data-solar-tab="transactions">Open full log →</button>`)}`;
}

function solarTransactions(data) {
  const transactionData = data.transactions || {}, page = transactionData.pagination || { page:1,total_pages:1,total_rows:0 };
  return `<section class="card solar-filter-card"><form data-solar-search-form><label>Search QR or user<input type="search" name="search" value="${actualText(state.solar.search)}" placeholder="QR code, requester, operator…"></label><label>Status<select name="status"><option value="all">All status</option>${["COMPLETED","PARTIAL","DISPENSING","FAILED","MANUAL_REVIEW","CANCELLED"].map((value) => `<option value="${value}" ${state.solar.status===value?"selected":""}>${value.replaceAll("_"," ")}</option>`).join("")}</select></label><button class="button primary" type="submit">Search log</button></form></section>${panel("Fueling Transaction Log", "Server-side search dan pagination · tidak menggeser posisi halaman saat auto-update", `${solarTransactionTable(transactionData)}<div class="solar-pagination"><span><strong>${solarNumber(page.total_rows,0)}</strong> records</span><div><button class="button small" data-solar-page="prev" ${page.page<=1?"disabled":""}>← Previous</button><span>Page ${page.page} / ${page.total_pages}</span><button class="button small" data-solar-page="next" ${page.page>=page.total_pages?"disabled":""}>Next →</button></div></div>`, `<span class="data-pill ${backendConnection.realtime === "connected" ? "good" : "warning"}">${backendConnection.realtime === "connected" ? "LIVE AUTO-UPDATE" : "AUTO-UPDATE PAUSED"}</span>`, "solar-log-panel")}`;
}

function solarMovements(data) {
  const rows = (data.movements?.movements || []).map((item) => `<tr><td>${actualTime(item.occurred_at)}</td><td>${solarStatusPill(item.movement_type)}</td><td><strong>${actualText(item.direction)}</strong></td><td class="mono"><strong>${solarNumber(item.quantity_liters)} L</strong></td><td class="mono">${actualText(item.reference_code)}</td><td>${actualText(item.created_by)}</td><td>${actualText(item.notes)}</td></tr>`).join("");
  return `<section class="solar-operation-grid">${panel("Register Stock Movement", "Catat penerimaan, adjustment, atau transfer selain fueling", `<form class="solar-entry-form" data-solar-movement-form><label>Movement<select name="movement_type"><option value="RECEIPT">Receipt</option><option value="ADJUSTMENT">Adjustment</option><option value="TRANSFER">Transfer</option></select></label><label>Direction<select name="direction"><option value="IN">IN</option><option value="OUT">OUT</option></select></label><label>Quantity (L)<input type="number" name="quantity_liters" min="0.001" step="0.001" required></label><label>Reference<input name="reference_code" maxlength="160" placeholder="Delivery note / adjustment"></label><label class="wide">Notes<textarea name="notes" rows="2"></textarea></label><button class="button primary" type="submit">Save movement</button></form>`)}${panel("Stock Control Rule", "Fueling OUT berasal dari transaksi flow meter dan tidak diduplikasi", `<div class="solar-stock-rule"><strong>System Stock</strong><span>Opening stock + receipts − metered fueling ± adjustments</span><small>Semua perubahan manual tercatat bersama user yang melakukan input.</small></div>`)}</section>${panel("Stock Movement Log", "Non-fueling inventory movement", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Type</th><th>Direction</th><th>Quantity</th><th>Reference</th><th>Created by</th><th>Notes</th></tr></thead><tbody>${rows || `<tr><td colspan="7">Belum ada stock movement.</td></tr>`}</tbody></table></div>`)}`;
}

function solarOpnames(data) {
  const rows = (data.opnames?.opnames || []).map((item) => `<tr><td><strong class="mono">${actualText(item.opname_number)}</strong><small>${actualTime(item.cutoff_at)}</small></td><td class="mono">${solarNumber(item.system_stock_liters)} L</td><td class="mono"><strong>${solarNumber(item.physical_stock_liters)} L</strong></td><td class="mono ${Math.abs(Number(item.variance_liters||0))>1?"solar-variance-bad":""}">${Number(item.variance_liters)>=0?"+":""}${solarNumber(item.variance_liters)} L</td><td>${item.accuracy_percent==null?"N/A":`${solarNumber(item.accuracy_percent,2)}%`}</td><td>${solarStatusPill(item.status)}</td><td>${actualText(item.measured_by)}</td><td>${["SUBMITTED","VERIFIED"].includes(item.status) ? `<div class="solar-row-actions">${item.status==="SUBMITTED"?`<button class="button small" data-solar-opname-action="VERIFY" data-solar-opname-id="${actualText(item.opname_id)}">Verify</button>`:""}${item.status==="VERIFIED"?`<button class="button primary small" data-solar-opname-action="POST" data-solar-opname-id="${actualText(item.opname_id)}">Post</button>`:""}<button class="button ghost small" data-solar-opname-action="REJECT" data-solar-opname-id="${actualText(item.opname_id)}">Reject</button></div>` : "—"}</td></tr>`).join("");
  return `<section class="solar-operation-grid">${panel("New Stock Opname", "Bandingkan stok sistem dengan hasil pengukuran fisik", `<form class="solar-entry-form" data-solar-opname-form><label>Physical stock (L)<input type="number" name="physical_stock_liters" min="0" step="0.001" required></label><label>Measurement method<select name="measurement_method"><option value="DIPSTICK">Dipstick</option><option value="TANK_GAUGE">Tank gauge</option><option value="FLOWMETER_RECONCILIATION">Flowmeter reconciliation</option></select></label><label>Status<select name="status"><option value="SUBMITTED">Submit for verification</option><option value="DRAFT">Save draft</option></select></label><label class="wide">Notes<textarea name="notes" rows="2" placeholder="Kondisi tank, waktu ukur, atau catatan selisih"></textarea></label><button class="button primary" type="submit">Record opname</button></form>`)}${panel("Approval Workflow", "Pemisahan input dan validasi menjaga audit trail", `<div class="solar-workflow"><span>DRAFT</span><i>→</i><span>SUBMITTED</span><i>→</i><span>VERIFIED</span><i>→</i><span>POSTED</span></div><p class="solar-workflow-note">Supervisor, Engineer, atau Admin dapat memverifikasi dan mem-posting hasil opname.</p>`)}</section>${panel("Stock Opname History", "System stock, physical stock, variance, dan accuracy", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Opname</th><th>System</th><th>Physical</th><th>Variance</th><th>Accuracy</th><th>Status</th><th>Measured by</th><th>Action</th></tr></thead><tbody>${rows || `<tr><td colspan="8">Belum ada stock opname.</td></tr>`}</tbody></table></div>`)}`;
}

function actualSolarPage() {
  if (!solarFueling.data && !solarFueling.loading) void loadSolarFueling();
  const tabs = [["overview","Overview"],["transactions","Transaction Log"],["movements","Stock Movement"],["opname","Stock Opname"]].map(([value,label]) => `<button class="${state.solar.tab===value?"active":""}" data-solar-tab="${value}">${label}</button>`).join("");
  const header = `${pageHead("solar", `<span class="range-badge">ACTUAL DATABASE</span>`)}<nav class="solar-tabs">${tabs}</nav>${solarRangeToolbar()}`;
  if (solarFueling.loading && !solarFueling.data) return `${header}${panel("Loading Solar Fueling", "Membaca transaksi, totalizer, dan inventory", `<div class="actual-historian-loading">Loading actual fuel operations…</div>`)}`;
  if (solarFueling.error && !solarFueling.data) return `${header}${panel("Solar Fueling unavailable", "Periksa koneksi backend dan migration database", actualEmpty(solarFueling.error))}`;
  const data = solarFueling.data || { overview:{summary:{}},transactions:{transactions:[]},movements:{movements:[]},opnames:{opnames:[]} };
  if (state.solar.tab === "transactions") return `${header}${solarTransactions(data)}`;
  if (state.solar.tab === "movements") return `${header}${solarMovements(data)}`;
  if (state.solar.tab === "opname") return `${header}${solarOpnames(data)}`;
  return `${header}${solarOverview(data)}`;
}

async function requestAlarmConfiguration(force = false) {
  if (alarmConfiguration.loading || (alarmConfiguration.loaded && !force)) return;
  alarmConfiguration.loading = true;
  alarmConfiguration.error = null;
  try {
    const [alarmResponse, deviationResponse] = await Promise.all([
      fetch("/api/v1/alarm-rules", { cache: "no-store" }),
      fetch("/api/v1/process-deviation-rules", { cache: "no-store" }),
    ]);
    if (!alarmResponse.ok) throw new Error("Alarm rule API belum tersedia.");
    if (!deviationResponse.ok) throw new Error("Process deviation rule API belum tersedia.");
    alarmConfiguration.rules = (await alarmResponse.json()).rules || [];
    alarmConfiguration.deviationRules = (await deviationResponse.json()).rules || [];
    alarmConfiguration.loaded = true;
  } catch (error) {
    alarmConfiguration.error = error instanceof Error ? error.message : "Alarm rule configuration unavailable";
  } finally {
    alarmConfiguration.loading = false;
    if (state.page === "alarms") requestHistorianRender();
  }
}

async function requestAlarmTags(assetId) {
  if (!assetId || alarmConfiguration.tagsByAsset.has(assetId) || alarmConfiguration.tagLoading.has(assetId)) return;
  alarmConfiguration.tagLoading.add(assetId);
  alarmConfiguration.tagErrors.delete(assetId);
  try {
    const response = await fetch(`/api/v1/alarm-rules/tags?asset_id=${encodeURIComponent(assetId)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Tag registry asset tidak dapat dimuat.");
    alarmConfiguration.tagsByAsset.set(assetId, (await response.json()).tags || []);
  } catch (error) {
    alarmConfiguration.tagsByAsset.set(assetId, []);
    alarmConfiguration.tagErrors.set(assetId, error instanceof Error ? error.message : "Tag registry unavailable");
  } finally {
    alarmConfiguration.tagLoading.delete(assetId);
    if (state.page === "alarms") requestHistorianRender();
  }
}

function alarmRuleOperator(ruleType) {
  return ["HIGH", "HIGH_HIGH"].includes(ruleType) ? "≥" : "≤";
}

function captureAlarmRuleDraft(form) {
  if (!form) return;
  const data = new FormData(form);
  const current = state.alarmConfig.draft || {};
  const valueOrCurrent = (key, fallback = "") => data.has(key) ? data.get(key) : (current[key] ?? fallback);
  state.alarmConfig.draft = {
    ...current,
    rule_name: valueOrCurrent("rule_name"),
    asset_id: valueOrCurrent("asset_id", state.alarmConfig.assetId),
    tag_code: valueOrCurrent("tag_code", state.alarmConfig.tagCode),
    rule_type: valueOrCurrent("rule_type", "HIGH"),
    severity: valueOrCurrent("severity", "WARNING"),
    threshold_value: valueOrCurrent("threshold_value"),
    hysteresis_value: valueOrCurrent("hysteresis_value", "0"),
    delay_seconds: valueOrCurrent("delay_seconds", "0"),
    alarm_message: valueOrCurrent("alarm_message"),
    recommendation: valueOrCurrent("recommendation"),
    enabled: Boolean(form.elements.enabled?.checked),
  };
}

function alarmDecimal(value) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  return normalized ? Number(normalized) : Number.NaN;
}

function alarmRuleConfigPanel() {
  if (!alarmConfiguration.loaded && !alarmConfiguration.loading) void requestAlarmConfiguration();
  const assets = actualFleet().slice().sort((left, right) => `${left.process}-${left.id}`.localeCompare(`${right.process}-${right.id}`));
  const editing = alarmConfiguration.rules.find((rule) => rule.rule_id === state.alarmConfig.editingRuleId) || null;
  const draft = state.alarmConfig.draft || {};
  const requestedAssetId = draft.asset_id || editing?.asset_id || state.alarmConfig.assetId;
  if (!assets.some((asset) => asset.id === requestedAssetId)) state.alarmConfig.assetId = assets[0]?.id || null;
  else state.alarmConfig.assetId = requestedAssetId;
  const assetId = state.alarmConfig.assetId;
  if (assetId && !alarmConfiguration.tagsByAsset.has(assetId) && !alarmConfiguration.tagLoading.has(assetId)) void requestAlarmTags(assetId);
  const tags = alarmConfiguration.tagsByAsset.get(assetId) || [];
  const selectedTag = draft.tag_code || editing?.tag_code || state.alarmConfig.tagCode || tags[0]?.tag_code || "";
  if (!editing && selectedTag && state.alarmConfig.tagCode !== selectedTag) state.alarmConfig.tagCode = selectedTag;
  const fieldValue = (key, fallback = "") => actualText(draft[key] ?? editing?.[key] ?? fallback);
  const selectedOption = (value, current) => value === current ? "selected" : "";
  const ruleType = draft.rule_type || editing?.rule_type || "HIGH";
  const severity = draft.severity || editing?.severity || "WARNING";
  const enabled = draft.enabled ?? (editing ? Boolean(editing.enabled) : true);
  const tagError = alarmConfiguration.tagErrors.get(assetId);
  const form = assets.length ? `<form class="alarm-rule-form" data-alarm-rule-form data-rule-id="${actualText(editing?.rule_id || "")}">
    <div class="alarm-rule-form-head"><div><span class="eyebrow">${editing ? "EDIT RULE" : "NEW RULE"}</span><h3>${editing ? actualText(editing.rule_name) : "Configure sensor alarm"}</h3><p>Rule disimpan di PostgreSQL dan dievaluasi 24/7 oleh NestJS alarm engine.</p></div><label class="alarm-enabled-control"><input type="checkbox" name="enabled" ${enabled ? "checked" : ""}/><span>Rule enabled</span></label></div>
    <div class="alarm-rule-form-grid">
      <label class="field-group"><span>Machine / Asset</span><select class="select-control" name="asset_id" data-alarm-rule-asset required>${assets.map((asset) => `<option value="${actualText(asset.id)}" ${selectedOption(asset.id, assetId)}>${actualText(asset.id)} · ${actualText(asset.name)}</option>`).join("")}</select></label>
      <label class="field-group alarm-tag-field"><span>Tag monitored</span><select class="select-control" name="tag_code" data-alarm-rule-tag required ${alarmConfiguration.tagLoading.has(assetId) ? "disabled" : ""}>${tags.length ? tags.map((tag) => `<option value="${actualText(tag.tag_code)}" ${selectedOption(tag.tag_code, selectedTag)}>${actualText(tag.signal_role)}${tag.engineering_unit ? ` · ${actualText(tag.engineering_unit)}` : ""}</option>`).join("") : `<option value="">${alarmConfiguration.tagLoading.has(assetId) ? "Loading tags…" : "No active tag"}</option>`}</select>${tagError ? `<small class="field-error">${actualText(tagError)}</small>` : ""}</label>
      <label class="field-group"><span>Rule type</span><select class="select-control" name="rule_type">${["HIGH", "HIGH_HIGH", "LOW", "LOW_LOW"].map((value) => `<option value="${value}" ${selectedOption(value, ruleType)}>${value.replace("_", "-")}</option>`).join("")}</select></label>
      <label class="field-group"><span>Severity</span><select class="select-control" name="severity">${["INFO", "WARNING", "CRITICAL"].map((value) => `<option value="${value}" ${selectedOption(value, severity)}>${value}</option>`).join("")}</select></label>
      <label class="field-group"><span>Threshold</span><input class="search-control" name="threshold_value" type="text" inputmode="decimal" value="${fieldValue("threshold_value")}" placeholder="Contoh: 170 atau 170,5" required/></label>
      <label class="field-group"><span>Hysteresis</span><input class="search-control" name="hysteresis_value" type="text" inputmode="decimal" value="${fieldValue("hysteresis_value", 0)}" placeholder="Contoh: 2 atau 2,5" required/></label>
      <label class="field-group"><span>Activation delay</span><div class="alarm-input-unit"><input class="search-control" name="delay_seconds" type="number" min="0" max="86400" step="1" value="${fieldValue("delay_seconds", 0)}" required/><span>sec</span></div></label>
      <label class="field-group alarm-name-field"><span>Alarm name</span><input class="search-control" name="rule_name" value="${fieldValue("rule_name")}" maxlength="160" placeholder="Contoh: Upper temperature high" required/></label>
      <label class="field-group alarm-message-field"><span>Alarm message</span><textarea class="search-control" name="alarm_message" maxlength="500" placeholder="Keterangan yang muncul pada popup">${fieldValue("alarm_message")}</textarea></label>
      <label class="field-group alarm-message-field"><span>Operator recommendation</span><textarea class="search-control" name="recommendation" maxlength="1000" placeholder="Tindakan pemeriksaan yang direkomendasikan">${fieldValue("recommendation")}</textarea></label>
    </div>
    <div class="alarm-rule-form-foot"><span>Safety trip dan interlock tetap berada di PLC. Rule ini khusus monitoring SCADA/MES.</span><div>${editing ? `<button class="button ghost" type="button" data-alarm-rule-cancel>Cancel</button>` : ""}<button class="button primary" type="submit" ${!tags.length ? "disabled" : ""}>${editing ? "Update rule" : "Save alarm rule"}</button></div></div>
  </form>` : actualEmpty("Belum ada asset aktif untuk membuat alarm rule.");
  const ruleRows = alarmConfiguration.rules.length ? alarmConfiguration.rules.map((rule) => {
    const stateTone = rule.evaluation_state === "ACTIVE" ? "warning" : rule.evaluation_state === "PENDING" ? "neutral" : "good";
    return `<tr><td><strong>${actualText(rule.rule_name)}</strong><small>${actualText(rule.process_type)} · ${actualText(rule.area_code)}</small></td><td><strong>${actualText(rule.asset_id)}</strong><small class="mono">${actualText(rule.tag_code)}</small></td><td><span class="data-pill neutral">${actualText(rule.rule_type)}</span></td><td class="mono"><strong>${alarmRuleOperator(rule.rule_type)} ${actualText(rule.threshold_value)}</strong> ${actualText(rule.engineering_unit || "")}</td><td class="mono">${actualText(rule.hysteresis_value)} ${actualText(rule.engineering_unit || "")}<small>${actualText(rule.delay_seconds)} sec delay</small></td><td><span class="data-pill ${String(rule.severity).toLowerCase() === "critical" ? "warning" : "neutral"}">${actualText(rule.severity)}</span></td><td><span class="data-pill ${stateTone}">${actualText(rule.evaluation_state || "NOT EVALUATED")}</span><small>${rule.last_value == null ? "No sample" : `Last ${actualText(Number(rule.last_value).toLocaleString("id-ID", { maximumFractionDigits: 2 }))}`}</small></td><td><div class="alarm-rule-row-actions"><button class="button small" data-alarm-rule-edit="${actualText(rule.rule_id)}">Edit</button><button class="button small ${rule.enabled ? "ghost" : "primary"}" data-alarm-rule-toggle="${actualText(rule.rule_id)}" data-rule-enabled="${rule.enabled}">${rule.enabled ? "Disable" : "Enable"}</button></div></td></tr>`;
  }).join("") : `<tr><td colspan="8">${actualEmpty(alarmConfiguration.loading ? "Loading alarm rules…" : "Belum ada alarm rule. Gunakan form di atas untuk membuat rule pertama.")}</td></tr>`;
  const staticRulePanel = `<section class="card alarm-rule-configuration" id="alarm-rule-configuration">
    <div class="alarm-rule-config-header"><div><span class="eyebrow">ALARM CONFIGURATION</span><h2>Tag Threshold & Severity Rules</h2><p>Frontend mengatur rule; backend mengevaluasi telemetry dan mencatat lifecycle alarm.</p></div><span class="range-badge">${alarmConfiguration.rules.length} RULES</span></div>
    ${alarmConfiguration.error ? `<div class="alarm-config-error">${actualText(alarmConfiguration.error)}</div>` : form}
    <div class="table-wrap alarm-rule-table-wrap"><table class="data-table alarm-rule-table"><thead><tr><th>Rule</th><th>Asset / Tag</th><th>Type</th><th>Threshold</th><th>Stability</th><th>Severity</th><th>Engine State</th><th>Action</th></tr></thead><tbody>${ruleRows}</tbody></table></div>
  </section>`;
  return `${staticRulePanel}${processDeviationRuleConfigPanel()}`;
}

async function saveAlarmRule(form) {
  const submit = form.querySelector('button[type="submit"]');
  if (submit) submit.disabled = true;
  captureAlarmRuleDraft(form);
  const draft = state.alarmConfig.draft;
  const thresholdValue = alarmDecimal(draft.threshold_value);
  const hysteresisValue = alarmDecimal(draft.hysteresis_value);
  const delaySeconds = Number(draft.delay_seconds);
  if (!Number.isFinite(thresholdValue) || !Number.isFinite(hysteresisValue) || !Number.isFinite(delaySeconds)) {
    showToast("Nilai belum valid", "Threshold, hysteresis, dan activation delay harus berupa angka.");
    if (submit) submit.disabled = false;
    return;
  }
  const payload = {
    rule_name: draft.rule_name, asset_id: draft.asset_id, tag_code: draft.tag_code,
    rule_type: draft.rule_type, severity: draft.severity, threshold_value: thresholdValue,
    hysteresis_value: hysteresisValue, delay_seconds: delaySeconds,
    alarm_message: draft.alarm_message, recommendation: draft.recommendation, enabled: draft.enabled,
  };
  const ruleId = form.dataset.ruleId;
  try {
    const response = await fetch(ruleId ? `/api/v1/alarm-rules/${encodeURIComponent(ruleId)}` : "/api/v1/alarm-rules", {
      method: ruleId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", "X-Operator-Name": "Dashboard Engineer" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(Array.isArray(result.message) ? result.message.join(" · ") : result.message || "Alarm rule gagal disimpan.");
    state.alarmConfig.editingRuleId = null;
    state.alarmConfig.draft = {};
    alarmConfiguration.loaded = false;
    showToast(ruleId ? "Alarm rule updated" : "Alarm rule created", `${payload.rule_name} disimpan dan akan dievaluasi backend.`);
    await requestAlarmConfiguration(true);
  } catch (error) {
    showToast("Save failed", error instanceof Error ? error.message : "Alarm rule gagal disimpan.");
    if (submit) submit.disabled = false;
  }
}

async function toggleAlarmRule(ruleId, enabled) {
  try {
    const response = await fetch(`/api/v1/alarm-rules/${encodeURIComponent(ruleId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Operator-Name": "Dashboard Engineer" },
      body: JSON.stringify({ enabled }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Rule status gagal diubah.");
    alarmConfiguration.loaded = false;
    showToast(enabled ? "Rule enabled" : "Rule disabled", "Perubahan disimpan di PostgreSQL.");
    await requestAlarmConfiguration(true);
  } catch (error) {
    showToast("Update failed", error instanceof Error ? error.message : "Rule status gagal diubah.");
  }
}

function captureDeviationRuleDraft(form) {
  if (!form) return;
  const data = new FormData(form);
  const current = state.alarmConfig.deviationDraft || {};
  const valueOrCurrent = (key, fallback = "") => data.has(key) ? data.get(key) : (current[key] ?? fallback);
  state.alarmConfig.deviationDraft = {
    ...current,
    rule_code: valueOrCurrent("rule_code"),
    rule_name: valueOrCurrent("rule_name"),
    asset_id: valueOrCurrent("asset_id", state.alarmConfig.deviationAssetId),
    pv_tag_code: valueOrCurrent("pv_tag_code", state.alarmConfig.deviationPvTagCode),
    sv_tag_code: valueOrCurrent("sv_tag_code", state.alarmConfig.deviationSvTagCode),
    sv_signal_role: valueOrCurrent("sv_signal_role"),
    setpoint_key: valueOrCurrent("setpoint_key"),
    step_code: valueOrCurrent("step_code"),
    deviation_mode: valueOrCurrent("deviation_mode", "ABSOLUTE"),
    tolerance_low: valueOrCurrent("tolerance_low", "0"),
    tolerance_high: valueOrCurrent("tolerance_high", "0"),
    startup_grace_seconds: valueOrCurrent("startup_grace_seconds", "0"),
    expected_reach_time_seconds: valueOrCurrent("expected_reach_time_seconds"),
    stable_confirmation_seconds: valueOrCurrent("stable_confirmation_seconds", "0"),
    deviation_delay_seconds: valueOrCurrent("deviation_delay_seconds", "0"),
    clear_confirmation_seconds: valueOrCurrent("clear_confirmation_seconds", "0"),
    hysteresis_value: valueOrCurrent("hysteresis_value", "0"),
    minimum_sv_change: valueOrCurrent("minimum_sv_change", "0"),
    change_confirmation_seconds: valueOrCurrent("change_confirmation_seconds", "0"),
    severity: valueOrCurrent("severity", "WARNING"),
    impact_code: valueOrCurrent("impact_code", "PROCESS"),
    alarm_message: valueOrCurrent("alarm_message"),
    recommendation: valueOrCurrent("recommendation"),
    monitor_reach: Boolean(form.elements.monitor_reach?.checked),
    monitor_hold: Boolean(form.elements.monitor_hold?.checked),
    pause_on_machine_hold: Boolean(form.elements.pause_on_machine_hold?.checked),
    enabled: Boolean(form.elements.enabled?.checked),
  };
}

function processDeviationRuleConfigPanel() {
  const assets = actualFleet().filter((asset) => asset.process !== "chemical").slice().sort((left, right) => `${left.process}-${left.id}`.localeCompare(`${right.process}-${right.id}`));
  const editing = alarmConfiguration.deviationRules.find((rule) => rule.rule_id === state.alarmConfig.editingDeviationRuleId) || null;
  const draft = state.alarmConfig.deviationDraft || {};
  const requestedAssetId = draft.asset_id || editing?.asset_id || state.alarmConfig.deviationAssetId;
  state.alarmConfig.deviationAssetId = assets.some((asset) => asset.id === requestedAssetId) ? requestedAssetId : assets[0]?.id || null;
  const assetId = state.alarmConfig.deviationAssetId;
  if (assetId && !alarmConfiguration.tagsByAsset.has(assetId) && !alarmConfiguration.tagLoading.has(assetId)) void requestAlarmTags(assetId);
  const tags = alarmConfiguration.tagsByAsset.get(assetId) || [];
  const pvTags = tags.filter((tag) => /(^|[._])PV($|[._])|_PV$/i.test(tag.signal_role) || /_PV$/i.test(tag.tag_code));
  const svTags = tags.filter((tag) => /(^|[._])SV($|[._])|_SV$/i.test(tag.signal_role) || /_SV$/i.test(tag.tag_code));
  const selectedPv = draft.pv_tag_code || editing?.pv_tag_code || state.alarmConfig.deviationPvTagCode || pvTags[0]?.tag_code || "";
  const selectedSv = draft.sv_tag_code || editing?.sv_tag_code || state.alarmConfig.deviationSvTagCode || "";
  const fieldValue = (key, fallback = "") => actualText(draft[key] ?? editing?.[key] ?? fallback);
  const selectedOption = (value, current) => value === current ? "selected" : "";
  const checked = (key, fallback = true) => (draft[key] ?? (editing ? Boolean(editing[key]) : fallback)) ? "checked" : "";
  const deviationMode = draft.deviation_mode || editing?.deviation_mode || "ABSOLUTE";
  const severity = draft.severity || editing?.severity || "WARNING";
  const impactCode = draft.impact_code || editing?.impact_code || "PROCESS";
  const form = assets.length ? `<form class="alarm-rule-form process-deviation-rule-form" data-deviation-rule-form data-rule-id="${actualText(editing?.rule_id || "")}">
    <div class="alarm-rule-form-head"><div><span class="eyebrow">${editing ? "EDIT PROCESS DEVIATION" : "NEW PROCESS DEVIATION"}</span><h3>${editing ? actualText(editing.rule_name) : "Configure PV / SV target monitoring"}</h3><p>Rule hanya dievaluasi ketika process run aktif. Fase RAMPING tetap normal sampai reach-time terlampaui.</p></div><label class="alarm-enabled-control"><input type="checkbox" name="enabled" ${checked("enabled")}/><span>Rule enabled</span></label></div>
    <div class="alarm-rule-form-grid deviation-rule-form-grid">
      <label class="field-group"><span>Machine / Asset</span><select class="select-control" name="asset_id" data-deviation-rule-asset required>${assets.map((asset) => `<option value="${actualText(asset.id)}" ${selectedOption(asset.id, assetId)}>${actualText(asset.id)} · ${actualText(asset.name)}</option>`).join("")}</select></label>
      <label class="field-group"><span>PV parameter</span><select class="select-control" name="pv_tag_code" data-deviation-pv-tag required>${pvTags.length ? pvTags.map((tag) => `<option value="${actualText(tag.tag_code)}" ${selectedOption(tag.tag_code, selectedPv)}>${actualText(tag.signal_role)}${tag.engineering_unit ? ` · ${actualText(tag.engineering_unit)}` : ""}</option>`).join("") : `<option value="">No PV tag registered</option>`}</select></label>
      <label class="field-group"><span>SV telemetry tag (optional)</span><select class="select-control" name="sv_tag_code" data-deviation-sv-tag><option value="">Use signal role / process setpoint</option>${svTags.map((tag) => `<option value="${actualText(tag.tag_code)}" ${selectedOption(tag.tag_code, selectedSv)}>${actualText(tag.signal_role)}${tag.engineering_unit ? ` · ${actualText(tag.engineering_unit)}` : ""}</option>`).join("")}</select></label>
      <label class="field-group"><span>SV signal role (optional)</span><input class="search-control" name="sv_signal_role" value="${fieldValue("sv_signal_role")}" placeholder="TEMPERATURE_UPPER_SV"/></label>
      <label class="field-group"><span>Process setpoint key (optional)</span><input class="search-control" name="setpoint_key" value="${fieldValue("setpoint_key")}" placeholder="temperature_upper_c"/></label>
      <label class="field-group"><span>Jetflow step code (optional)</span><input class="search-control" name="step_code" value="${fieldValue("step_code")}" placeholder="TEMPERATURE_CONTROL"/></label>
      <label class="field-group"><span>Rule code</span><input class="search-control" name="rule_code" value="${fieldValue("rule_code")}" maxlength="120" placeholder="KL_TEMP_UPPER_TARGET" required/></label>
      <label class="field-group alarm-name-field"><span>Rule name</span><input class="search-control" name="rule_name" value="${fieldValue("rule_name")}" maxlength="160" placeholder="Upper temperature target" required/></label>
      <label class="field-group"><span>Tolerance mode</span><select class="select-control" name="deviation_mode"><option value="ABSOLUTE" ${selectedOption("ABSOLUTE", deviationMode)}>Absolute unit</option><option value="PERCENT" ${selectedOption("PERCENT", deviationMode)}>Percent of SV</option></select></label>
      <label class="field-group"><span>Tolerance below SV</span><input class="search-control" name="tolerance_low" type="text" inputmode="decimal" value="${fieldValue("tolerance_low", 0)}" required/></label>
      <label class="field-group"><span>Tolerance above SV</span><input class="search-control" name="tolerance_high" type="text" inputmode="decimal" value="${fieldValue("tolerance_high", 0)}" required/></label>
      <label class="field-group"><span>Startup grace</span><div class="alarm-input-unit"><input class="search-control" name="startup_grace_seconds" type="number" min="0" max="86400" value="${fieldValue("startup_grace_seconds", 0)}"/><span>sec</span></div></label>
      <label class="field-group"><span>Expected reach time</span><div class="alarm-input-unit"><input class="search-control" name="expected_reach_time_seconds" type="number" min="0" max="604800" value="${fieldValue("expected_reach_time_seconds")}" placeholder="Optional"/><span>sec</span></div></label>
      <label class="field-group"><span>Stable confirmation</span><div class="alarm-input-unit"><input class="search-control" name="stable_confirmation_seconds" type="number" min="0" max="86400" value="${fieldValue("stable_confirmation_seconds", 0)}"/><span>sec</span></div></label>
      <label class="field-group"><span>Deviation delay</span><div class="alarm-input-unit"><input class="search-control" name="deviation_delay_seconds" type="number" min="0" max="86400" value="${fieldValue("deviation_delay_seconds", 0)}"/><span>sec</span></div></label>
      <label class="field-group"><span>Clear confirmation</span><div class="alarm-input-unit"><input class="search-control" name="clear_confirmation_seconds" type="number" min="0" max="86400" value="${fieldValue("clear_confirmation_seconds", 0)}"/><span>sec</span></div></label>
      <label class="field-group"><span>Clear hysteresis</span><input class="search-control" name="hysteresis_value" type="text" inputmode="decimal" value="${fieldValue("hysteresis_value", 0)}"/></label>
      <label class="field-group"><span>Minimum SV change</span><input class="search-control" name="minimum_sv_change" type="text" inputmode="decimal" value="${fieldValue("minimum_sv_change", 0)}"/></label>
      <label class="field-group"><span>SV change confirmation</span><div class="alarm-input-unit"><input class="search-control" name="change_confirmation_seconds" type="number" min="0" max="86400" value="${fieldValue("change_confirmation_seconds", 0)}"/><span>sec</span></div></label>
      <label class="field-group"><span>Severity</span><select class="select-control" name="severity">${["INFO", "WARNING", "CRITICAL"].map((value) => `<option value="${value}" ${selectedOption(value, severity)}>${value}</option>`).join("")}</select></label>
      <label class="field-group"><span>Production impact</span><select class="select-control" name="impact_code">${["PROCESS", "QUALITY", "OUTPUT", "DOWNTIME", "UTILITY", "EQUIPMENT"].map((value) => `<option value="${value}" ${selectedOption(value, impactCode)}>${value}</option>`).join("")}</select></label>
      <label class="field-group alarm-message-field"><span>Alarm message</span><textarea class="search-control" name="alarm_message" maxlength="500">${fieldValue("alarm_message")}</textarea></label>
      <label class="field-group alarm-message-field"><span>Recommendation</span><textarea class="search-control" name="recommendation" maxlength="1000">${fieldValue("recommendation")}</textarea></label>
    </div>
    <div class="deviation-monitor-options"><label><input type="checkbox" name="monitor_reach" ${checked("monitor_reach")}/> Monitor time-to-target</label><label><input type="checkbox" name="monitor_hold" ${checked("monitor_hold")}/> Monitor hold-target</label><label><input type="checkbox" name="pause_on_machine_hold" ${checked("pause_on_machine_hold")}/> Pause timer when machine HOLD</label></div>
    <div class="alarm-rule-form-foot"><span>WARNING/CRITICAL diteruskan ke header alarm; seluruh severity tetap masuk Batch Abnormal Log.</span><div>${editing ? `<button class="button ghost" type="button" data-deviation-rule-cancel>Cancel</button>` : ""}<button class="button primary" type="submit" ${!pvTags.length ? "disabled" : ""}>${editing ? "Update deviation rule" : "Save deviation rule"}</button></div></div>
  </form>` : actualEmpty("Belum ada asset proses aktif.");
  const rows = alarmConfiguration.deviationRules.length ? alarmConfiguration.deviationRules.map((rule) => `<tr>
    <td><strong>${actualText(rule.rule_name)}</strong><small class="mono">${actualText(rule.rule_code)}</small></td>
    <td><strong>${actualText(rule.asset_id || rule.process_type)}</strong><small class="mono">${actualText(rule.pv_tag_code || rule.pv_signal_role)}</small></td>
    <td>${actualText(rule.sv_tag_code || rule.sv_signal_role || rule.setpoint_key)}<small>${actualText(rule.step_code || "Continuous target")}</small></td>
    <td class="mono">-${actualText(rule.tolerance_low)} / +${actualText(rule.tolerance_high)}<small>${actualText(rule.deviation_mode)}</small></td>
    <td class="mono">Reach ${actualText(rule.expected_reach_time_seconds ?? "—")}s<small>Stable ${actualText(rule.stable_confirmation_seconds)}s · Hold ${actualText(rule.deviation_delay_seconds)}s</small></td>
    <td><span class="data-pill ${String(rule.severity).toLowerCase() === "critical" ? "warning" : "neutral"}">${actualText(rule.severity)}</span><small>${actualText(rule.impact_code)}</small></td>
    <td><span class="data-pill ${Number(rule.deviating_count) ? "warning" : "good"}">${Number(rule.deviating_count) ? `${actualText(rule.deviating_count)} DEVIATING` : `${actualText(rule.active_tracker_count)} TRACKERS`}</span></td>
    <td><div class="alarm-rule-row-actions"><button class="button small" data-deviation-rule-edit="${actualText(rule.rule_id)}">Edit</button><button class="button small ${rule.enabled ? "ghost" : "primary"}" data-deviation-rule-toggle="${actualText(rule.rule_id)}" data-rule-enabled="${rule.enabled}">${rule.enabled ? "Disable" : "Enable"}</button></div></td>
  </tr>`).join("") : `<tr><td colspan="8">${actualEmpty("Belum ada process deviation rule.")}</td></tr>`;
  return `<section class="card alarm-rule-configuration process-deviation-configuration" id="process-deviation-configuration">
    <div class="alarm-rule-config-header"><div><span class="eyebrow">BATCH PROCESS DEVIATION</span><h2>PV / SV Target Achievement Rules</h2><p>Konfigurasi reach-time, stable confirmation, hold-target, tolerance, dan revision ketika SV berubah.</p></div><span class="range-badge">${alarmConfiguration.deviationRules.length} RULES</span></div>
    ${form}
    <div class="table-wrap alarm-rule-table-wrap"><table class="data-table alarm-rule-table deviation-rule-table"><thead><tr><th>Rule</th><th>Scope / PV</th><th>SV / Step</th><th>Tolerance</th><th>Timing</th><th>Severity</th><th>Engine State</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table></div>
  </section>`;
}

async function saveDeviationRule(form) {
  const submit = form.querySelector('button[type="submit"]');
  if (submit) submit.disabled = true;
  captureDeviationRuleDraft(form);
  const draft = state.alarmConfig.deviationDraft;
  const numericFields = ["tolerance_low", "tolerance_high", "startup_grace_seconds", "stable_confirmation_seconds", "deviation_delay_seconds", "clear_confirmation_seconds", "hysteresis_value", "minimum_sv_change", "change_confirmation_seconds"];
  const payload = { ...draft };
  for (const field of numericFields) {
    payload[field] = alarmDecimal(draft[field]);
    if (!Number.isFinite(payload[field])) {
      showToast("Nilai belum valid", `${field} harus berupa angka.`);
      if (submit) submit.disabled = false;
      return;
    }
  }
  payload.expected_reach_time_seconds = String(draft.expected_reach_time_seconds || "").trim() === "" ? null : Number(draft.expected_reach_time_seconds);
  payload.sv_tag_code = draft.sv_tag_code || null;
  payload.sv_signal_role = draft.sv_signal_role || null;
  payload.setpoint_key = draft.setpoint_key || null;
  payload.step_code = draft.step_code || null;
  if (!payload.sv_tag_code && !payload.sv_signal_role && !payload.setpoint_key) {
    showToast("SV source required", "Pilih SV tag atau isi SV signal role/process setpoint key.");
    if (submit) submit.disabled = false;
    return;
  }
  const ruleId = form.dataset.ruleId;
  try {
    const response = await fetch(ruleId ? `/api/v1/process-deviation-rules/${encodeURIComponent(ruleId)}` : "/api/v1/process-deviation-rules", {
      method: ruleId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", "X-Operator-Name": "Dashboard Engineer" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Process deviation rule gagal disimpan.");
    state.alarmConfig.editingDeviationRuleId = null;
    state.alarmConfig.deviationDraft = {};
    alarmConfiguration.loaded = false;
    showToast(ruleId ? "Deviation rule updated" : "Deviation rule created", `${payload.rule_name} akan dievaluasi pada process run aktif.`);
    await requestAlarmConfiguration(true);
  } catch (error) {
    showToast("Save failed", error instanceof Error ? error.message : "Process deviation rule gagal disimpan.");
    if (submit) submit.disabled = false;
  }
}

async function toggleDeviationRule(ruleId, enabled) {
  try {
    const response = await fetch(`/api/v1/process-deviation-rules/${encodeURIComponent(ruleId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Operator-Name": "Dashboard Engineer" },
      body: JSON.stringify({ enabled }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Deviation rule status gagal diubah.");
    alarmConfiguration.loaded = false;
    showToast(enabled ? "Deviation rule enabled" : "Deviation rule disabled", "Perubahan disimpan di PostgreSQL.");
    await requestAlarmConfiguration(true);
  } catch (error) {
    showToast("Update failed", error instanceof Error ? error.message : "Deviation rule status gagal diubah.");
  }
}

async function acknowledgeActualAlarm(alarmEventId) {
  try {
    const response = await fetch(`/api/v1/alarm-events/${encodeURIComponent(alarmEventId)}/acknowledge`, { method: "PATCH", headers: { "X-Operator-Name": "Dashboard Operator" } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Acknowledge gagal.");
    showToast("Alarm acknowledged", `${result.alarm?.title || "Alarm"} dicatat oleh Dashboard Operator.`);
    await connectNonJetflowBackend();
  } catch (error) {
    showToast("Acknowledge failed", error instanceof Error ? error.message : "Acknowledge gagal.");
  }
}

function actualAlarmTable(events, emptyLabel) {
  if (!events.length) return actualEmpty(emptyLabel);
  return `<div class="table-wrap active-alarm-table-wrap"><table class="data-table active-alarm-table"><thead><tr><th>Time</th><th>Severity</th><th>Area</th><th>Asset</th><th>Batch</th><th>Alarm condition</th><th>Trigger / Limit</th><th>State</th><th>Action</th></tr></thead><tbody>${events.map((item) => {
    const asset = actualFleet().find((machine) => machine.id === item.asset_id);
    const severity = String(item.severity || "WARNING").toLowerCase();
    const assetLabel = asset ? `<button class="alarm-asset-link" type="button" data-machine-target="${actualText(asset.process)}|${actualText(asset.id)}">${actualText(item.asset_id)}</button>` : actualText(item.asset_id);
    return `<tr class="alarm-condition-row ${severity}"><td class="mono">${actualTime(item.occurred_at)}</td><td><span class="data-pill ${severity === "critical" ? "danger" : severity === "warning" ? "warning" : "neutral"}">${actualText(item.severity)}</span></td><td>${actualText(item.area_code || "—")}</td><td>${assetLabel}</td><td>${actualText(item.batch_no || "—")}</td><td><strong>${actualText(item.title)}</strong><br><small>${actualText(item.detail)}</small>${item.recommendation ? `<small class="alarm-recommendation">Action: ${actualText(item.recommendation)}</small>` : ""}</td><td class="mono">${item.trigger_value == null ? "—" : `${actualText(Number(item.trigger_value).toLocaleString("id-ID", { maximumFractionDigits: 2 }))} / ${actualText(Number(item.threshold_value).toLocaleString("id-ID", { maximumFractionDigits: 2 }))}`}</td><td><span class="data-pill ${item.event_state === "CLEARED" ? "good" : "warning"}">${actualText(item.event_state)}</span></td><td>${item.acknowledged_at ? `<span class="data-pill neutral">ACK</span><small>${actualText(item.acknowledged_by || "Operator")}</small>` : item.event_state !== "CLEARED" ? `<button class="button small" data-alarm-event-ack="${actualText(item.alarm_event_id)}">Acknowledge</button>` : "—"}</td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function actualAlarmsPage() {
  const scopedEvents = backendAlarmEvents.filter((item) => state.alarms.area === "all" || item.area_code === state.alarms.area);
  const scopedActiveEvents = backendActiveAlarmEvents.filter((item) => state.alarms.area === "all" || item.area_code === state.alarms.area);
  const content = actualAlarmTable(scopedEvents, "Belum ada event alarm aktual");
  const activeContent = actualAlarmTable(scopedActiveEvents, "Tidak ada alarm aktif pada scope ini");
  const areaGroups = new Map();
  backendAlarmEvents.forEach((event) => {
    const key = event.area_code || "UNMAPPED";
    const group = areaGroups.get(key) || { key, label: key, value: 0 };
    group.value += 1;
    areaGroups.set(key, group);
  });
  const assetGroups = new Map();
  scopedEvents.forEach((event) => assetGroups.set(event.asset_id, (assetGroups.get(event.asset_id) || 0) + 1));
  const rankedAssets = [...assetGroups].sort((left, right) => right[1] - left[1]);
  const ranking = rankedAssets.length ? `<div class="ranking-list">${rankedAssets.map(([assetId, count], index) => { const asset = actualFleet().find((item) => item.id === assetId); return `<button class="ranking-row" ${asset ? `data-machine-target="${asset.process}|${asset.id}"` : ""}><span class="ranking-number">${index + 1}</span><span class="ranking-copy"><strong>${actualText(assetId)}</strong><small>${actualText(asset?.areaLabel || "Area belum dimapping")}</small><i><b style="width:${count / rankedAssets[0][1] * 100}%"></b></i></span><span class="ranking-value">${count}<small>events</small></span></button>`; }).join("")}</div>` : actualEmpty("Tidak ada alarm pada area terpilih.");
  const active = backendActiveAlarmEvents.length;
  const critical = backendActiveAlarmEvents.filter((item) => String(item.severity).toLowerCase() === "critical").length;
  return `${pageHead("alarms", `<button class="button ghost" data-alarm-config-jump>Configure alarm</button><span class="range-badge">LIVE DATA</span>`)}
    <section class="kpi-grid">${actualMetric("Active alarms", active, "events", "tetap dihitung meskipun sudah ACK")}${actualMetric("Critical active", critical, "events", "popup persisten sampai kondisi clear")}${actualMetric("Affected machines", new Set(backendActiveAlarmEvents.map((item) => item.asset_id)).size, "asset", "mesin dengan alarm aktif")}${actualMetric("Alarm records", backendAlarmEvents.length, "rows", "Recent alarm history")}</section>
    <section id="active-alarm-conditions" class="active-alarm-section">${panel("Active Alarm Conditions", "Kondisi yang masih aktif saat ini. Acknowledge tidak menghapus alarm; event selesai ketika nilai kembali sesuai rule dan hysteresis.", activeContent, `<span class="range-badge ${critical ? "critical" : ""}">${scopedActiveEvents.length} ACTIVE</span>`)}</section>
    <section class="management-analysis-grid">${panel("Alarm Distribution by Area", "Klik segmen untuk memfilter ranking dan log alarm.", actualDonutMarkup([...areaGroups.values()].map((item) => ({ ...item, key: item.key, selected: item.key === state.alarms.area })), "alarm events", "events", "data-alarm-downtime-area"), state.alarms.area !== "all" ? `<button class="button ghost small" data-alarm-downtime-area="all">All areas</button>` : `<span class="data-pill good">ACTUAL</span>`)}${panel(`Top Affected Machines${state.alarms.area !== "all" ? ` · ${actualText(state.alarms.area)}` : ""}`, "Ranking jumlah alarm aktual; durasi downtime ditampilkan setelah event clear/downtime mapping tersedia.", ranking)}</section>
    ${panel("Alarm & Event History", "Event terbaru, termasuk alarm yang sudah clear", content)}
    <div class="alarm-configuration-bottom" id="alarm-configuration-bottom">${alarmRuleConfigPanel()}</div>
  `;
}

function actualHistoricalExplorer() {
  const numericAssetIds = [...new Set(backendTelemetry.filter((item) => Number.isFinite(Number(item.value_number))).map((item) => item.asset_id))];
  const candidates = numericAssetIds.map((assetId) => actualFleet().find((asset) => asset.id === assetId)).filter(Boolean);
  if (!candidates.length) return panel("Historical Trend Explorer", "Historical process values", actualEmpty("Belum ada asset dengan telemetry numerik."));
  if (!candidates.some((asset) => asset.id === actualHistorian.explorerAssetId)) actualHistorian.explorerAssetId = candidates[0].id;
  const machine = candidates.find((asset) => asset.id === actualHistorian.explorerAssetId) || candidates[0];
  const key = actualHistorianKey(machine.id);
  const data = actualHistorian.cache.get(key);
  if (!data && !actualHistorian.loading.has(key)) void loadActualHistorian(machine);
  const rangeButtons = ["1H", "8H", "24H", "7D", "CUSTOM"].map((range) => `<button class="${actualHistorian.range === range ? "active" : ""}" data-actual-trend-range="${range}">${range === "CUSTOM" ? "Custom" : range}</button>`).join("");
  const customRange = actualHistorian.range === "CUSTOM" ? `<div class="chemical-custom-range actual-history-custom"><label class="date-field"><span>Start date & time</span><input type="datetime-local" data-actual-history-date="start" value="${toDateTimeLocal(state.history.start)}" /></label><label class="date-field"><span>End date & time</span><input type="datetime-local" data-actual-history-date="end" value="${toDateTimeLocal(state.history.end)}" /></label><button class="button primary small" data-actual-history-apply="${actualText(machine.id)}">Apply range</button></div>` : "";
  const assetSelect = `<label>Machine<select class="history-select-control" data-history-explorer-asset>${candidates.map((asset) => `<option value="${actualText(asset.id)}" ${asset.id === machine.id ? "selected" : ""}>${actualText(asset.id)} · ${actualText(asset.name)}</option>`).join("")}</select></label>`;
  if (!data) return panel("Historical Trend Explorer", "Loading historical process values", `<div class="actual-historian-toolbar">${assetSelect}<div class="segmented">${rangeButtons}</div></div>${customRange}<div class="actual-historian-loading">Loading ${actualText(actualHistorian.range)} history…</div>`);
  if (data.error) return panel("Historical Trend Explorer", "Historical process values", actualEmpty(data.error), `<div class="segmented">${rangeButtons}</div>`);
  const { parameters, parameter } = selectedActualParameter(machine, data);
  const pvSensor = actualParameterSeries(parameter, "PV");
  const svSensor = actualParameterSeries(parameter, "SV");
  const fallbackSensor = pvSensor || svSensor || parameter?.tags[0];
  const visibleSensors = [pvSensor, svSensor].filter(Boolean).length ? [pvSensor, svSensor].filter(Boolean) : [fallbackSensor].filter(Boolean);
  visibleSensors.forEach((sensor) => { if (!Array.isArray(sensor.points)) void loadActualSensorSeries(machine, sensor.tag_code); });
  const loading = visibleSensors.some((sensor) => !Array.isArray(sensor.points));
  const hasPoints = visibleSensors.some((sensor) => sensor.points?.length);
  const totalPoints = visibleSensors.reduce((sum, sensor) => sum + (sensor.points?.length || 0), 0);
  const pvLatest = pvSensor?.points?.at(-1)?.last_value ?? pvSensor?.points?.at(-1)?.avg_value;
  const svLatest = svSensor?.points?.at(-1)?.last_value ?? svSensor?.points?.at(-1)?.avg_value;
  const unit = pvSensor?.engineering_unit || svSensor?.engineering_unit || fallbackSensor?.engineering_unit || "";
  const deviation = Number.isFinite(Number(pvLatest)) && Number.isFinite(Number(svLatest)) ? Number(pvLatest) - Number(svLatest) : null;
  const parameterSelect = parameter ? `<label>Parameter<select class="history-select-control" data-history-explorer-parameter="${actualText(machine.id)}">${parameters.map((item) => `<option value="${actualText(item.key)}" ${item.key === parameter.key ? "selected" : ""}>${actualText(item.label)}</option>`).join("")}</select></label>` : "";
  const body = `<div class="actual-history-explorer-controls"><div class="actual-historian-toolbar">${assetSelect}${parameterSelect}<span class="data-pill neutral">${loading ? "…" : totalPoints} POINTS</span></div><div class="segmented">${rangeButtons}</div></div>${customRange}
    ${loading ? `<div class="actual-historian-loading">Memuat PV/SV ${actualText(parameter?.label || "parameter")}…</div>` : hasPoints ? `<div class="trend-window-bar"><span id="actual-history-visible-label">${actualText(machine.id)} · ${actualText(parameter?.label)}</span><span>Drag chart atau navigator untuk menggeser waktu</span></div><div class="chart-container tall interactive-chart"><canvas id="actual-history-explorer-chart" class="chart-canvas" tabindex="0" aria-label="Historical PV dan SV ${actualText(parameter?.label)}"></canvas><div class="drag-hint">↔ Drag to explore</div></div><div class="trend-navigator" id="actual-history-navigator" role="slider" tabindex="0" aria-label="Posisi waktu historical aktual" aria-valuemin="0" aria-valuemax="100"><div class="navigator-track"><div class="navigator-selection" id="actual-history-navigator-selection"><span></span><span></span></div></div></div><div class="actual-history-view-actions"><button class="button ghost small" data-actual-history-shift="back">← Earlier</button><button class="button ghost small" data-actual-history-zoom="out">− Zoom</button><button class="button ghost small" data-actual-history-fit>Fit range</button><button class="button ghost small" data-actual-history-zoom="in">+ Zoom</button><button class="button ghost small" data-actual-history-shift="next">Later →</button></div><div class="actual-trend-legend"><span><i class="pv"></i>PV · Actual value</span><span class="${svSensor?.points?.length ? "" : "muted"}"><i class="sv"></i>SV · Setpoint${svSensor?.points?.length ? "" : " (belum ada data)"}</span></div><div class="actual-historian-summary"><span>PV terkini <b>${actualHistorianDisplayValue(pvLatest, unit)}</b></span><span>SV terkini <b>${actualHistorianDisplayValue(svLatest, unit)}</b></span><span>Deviasi <b>${actualHistorianDisplayValue(deviation, unit)}</b></span></div>` : actualEmpty("Parameter terdaftar tetapi belum memiliki data pada time range ini.")}`;
  return panel("Historical Trend Explorer", "Pilih satu mesin dan parameter; pasangan PV/SV ditampilkan otomatis.", body, `<span class="data-pill good">LIVE DATA</span>`);
}

function drawActualHistoryExplorer() {
  if (state.page !== "trends" || !actualHistorian.explorerAssetId) return;
  const machine = actualFleet().find((asset) => asset.id === actualHistorian.explorerAssetId);
  const data = machine ? actualHistorian.cache.get(actualHistorianKey(machine.id)) : null;
  if (!machine || !data || data.error) return;
  const { parameter } = selectedActualParameter(machine, data);
  const trend = alignedActualParameterTrend(parameter);
  if (!trend.timestamps.length) return;
  const visibleCount = Math.max(2, Math.min(trend.timestamps.length, Math.ceil(trend.timestamps.length * actualHistorian.viewFraction)));
  const maxStart = Math.max(0, trend.timestamps.length - visibleCount);
  const startIndex = Math.min(maxStart, Math.max(0, Math.round(actualHistorian.viewStart * maxStart)));
  const endIndex = Math.min(trend.timestamps.length, startIndex + visibleCount);
  const visibleTimestamps = trend.timestamps.slice(startIndex, endIndex);
  const visibleSeries = trend.series.map((series) => ({ ...series, data: series.data.slice(startIndex, endIndex) }));
  const unit = parameter?.tags?.find((tag) => tag.engineering_unit)?.engineering_unit || "";
  drawLineChart("actual-history-explorer-chart", visibleSeries.map((series) => ({ data: series.data, color: series.kind === "SV" ? "#d68b05" : "#078eaa", dash: series.kind === "SV", fill: series.kind === "PV", label: series.kind === "SV" ? "SV · Setpoint" : "PV · Actual", unit })), visibleTimestamps, { labelFormatter: historicalAxisLabel });
  const selection = document.getElementById("actual-history-navigator-selection");
  if (selection) {
    selection.style.left = `${actualHistorian.viewStart * (1 - actualHistorian.viewFraction) * 100}%`;
    selection.style.width = `${actualHistorian.viewFraction * 100}%`;
  }
  const visibleLabel = document.getElementById("actual-history-visible-label");
  if (visibleLabel && visibleTimestamps.length) visibleLabel.textContent = `${machine.id} · ${parameter?.label || "Parameter"} · ${historicalAxisLabel(visibleTimestamps[0], visibleTimestamps.at(-1) - visibleTimestamps[0])} — ${historicalAxisLabel(visibleTimestamps.at(-1), visibleTimestamps.at(-1) - visibleTimestamps[0])}`;
}

function shiftActualHistoryView(delta) {
  actualHistorian.viewStart = Math.max(0, Math.min(1, actualHistorian.viewStart + delta));
  drawActualHistoryExplorer();
}

function zoomActualHistoryView(factor) {
  actualHistorian.viewFraction = Math.max(0.08, Math.min(1, actualHistorian.viewFraction * factor));
  actualHistorian.viewStart = Math.max(0, Math.min(1, actualHistorian.viewStart));
  drawActualHistoryExplorer();
}

function bindActualHistoryExplorerPan() {
  const canvas = document.getElementById("actual-history-explorer-chart");
  const navigator = document.getElementById("actual-history-navigator");
  if (!canvas || canvas.dataset.panBound) return;
  canvas.dataset.panBound = "true";
  let pointerId = null;
  let previousX = 0;
  canvas.addEventListener("pointerdown", (event) => {
    pointerId = event.pointerId;
    previousX = event.clientX;
    canvas.setPointerCapture?.(pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId || actualHistorian.viewFraction >= 1) return;
    const delta = (previousX - event.clientX) / Math.max(1, canvas.getBoundingClientRect().width) / Math.max(0.08, 1 - actualHistorian.viewFraction);
    previousX = event.clientX;
    shiftActualHistoryView(delta);
  });
  const stop = (event) => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    canvas.classList.remove("dragging");
  };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);
  navigator?.addEventListener("pointerdown", (event) => {
    if (actualHistorian.viewFraction >= 1) return;
    const bounds = navigator.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (event.clientX - bounds.left) / Math.max(1, bounds.width)));
    actualHistorian.viewStart = Math.max(0, Math.min(1, (position - actualHistorian.viewFraction / 2) / (1 - actualHistorian.viewFraction)));
    drawActualHistoryExplorer();
  });
}

function actualTrendsPage() {
  if (!backendTelemetry.length) {
    return `${pageHead("trends", `<span class="range-badge">LIVE DATA</span>`)}${panel("Recent telemetry", "Latest process history", actualEmpty("Belum ada telemetry historian"))}`;
  }

  const fleet = actualFleet();
  const enriched = backendTelemetry.map((item) => {
    const asset = fleet.find((a) => a.id === item.asset_id) || {};
    const process = asset.process || (item.asset_id.startsWith("JF") ? "jetflow" : item.asset_id.startsWith("CL") ? "calator" : item.asset_id.startsWith("DR") ? "dryer" : item.asset_id.startsWith("KL") ? "kalender" : item.asset_id.startsWith("DSP") ? "chemical" : "other");
    const area = asset.area || item.asset_id.split("-")[1] || "";
    const areaLabel = asset.areaLabel || area;
    return { ...item, process, area, areaLabel, assetName: asset.name || item.asset_id };
  });

  const distinctProcesses = [...new Set(enriched.map((i) => i.process).filter(Boolean))];
  const isMultiProcess = distinctProcesses.length > 1;

  let processFiltered = enriched;
  if (isMultiProcess && state.historyTable.process !== "all") {
    processFiltered = enriched.filter((i) => i.process === state.historyTable.process);
  }

  const areaMap = new Map();
  processFiltered.forEach((i) => {
    if (i.area && !areaMap.has(i.area)) {
      areaMap.set(i.area, i.areaLabel || i.area);
    }
  });

  let areaFiltered = processFiltered;
  if (state.historyTable.area !== "all") {
    areaFiltered = processFiltered.filter((i) => i.area === state.historyTable.area);
  }

  const distinctAssets = [...new Set(areaFiltered.map((i) => i.asset_id))].sort();

  let assetFiltered = areaFiltered;
  if (state.historyTable.assetId !== "all") {
    assetFiltered = areaFiltered.filter((i) => i.asset_id === state.historyTable.assetId);
  }

  const distinctRoles = [...new Set(assetFiltered.map((i) => i.signal_role).filter(Boolean))].sort();

  let roleFiltered = assetFiltered;
  if (state.historyTable.role !== "all") {
    roleFiltered = assetFiltered.filter((i) => i.signal_role === state.historyTable.role);
  }

  const query = (state.historyTable.search || "").trim().toLowerCase();
  let searchFiltered = roleFiltered;
  if (query) {
    searchFiltered = roleFiltered.filter((i) =>
      String(i.asset_id || "").toLowerCase().includes(query) ||
      String(i.tag_code || "").toLowerCase().includes(query) ||
      String(i.signal_role || "").toLowerCase().includes(query) ||
      String(i.value_number ?? i.value_text ?? "").toLowerCase().includes(query) ||
      String(i.areaLabel || i.area || "").toLowerCase().includes(query)
    );
  }

  const totalFiltered = searchFiltered.length;
  const pageSize = state.historyTable.pageSize || 15;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const currentPage = Math.min(Math.max(1, state.historyTable.page), totalPages);
  state.historyTable.page = currentPage;

  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = searchFiltered.slice(startIndex, startIndex + pageSize);
  const startItem = totalFiltered === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(startIndex + pageSize, totalFiltered);

  const processTabs = isMultiProcess ? `
    <div class="machine-table-process-tabs">
      <button class="mt-tab ${state.historyTable.process === "all" ? "active" : ""}" data-ht-process="all">
        Semua Proses <span class="mt-badge">${enriched.length}</span>
      </button>
      ${distinctProcesses.map((p) => {
        const count = enriched.filter((i) => i.process === p).length;
        const label = processConfig[p]?.singular || p;
        return `<button class="mt-tab ${state.historyTable.process === p ? "active" : ""}" data-ht-process="${p}">
          ${actualText(label)} <span class="mt-badge">${count}</span>
        </button>`;
      }).join("")}
    </div>
  ` : "";

  const areaPills = areaMap.size > 0 ? `
    <div class="machine-table-area-bar">
      <span class="mt-filter-label">Filter Area:</span>
      <div class="machine-table-area-pills">
        <button class="mt-area-pill ${state.historyTable.area === "all" ? "active" : ""}" data-ht-area="all">
          Semua Area <small>(${processFiltered.length})</small>
        </button>
        ${[...areaMap.entries()].map(([code, label]) => {
          const count = processFiltered.filter((i) => i.area === code).length;
          return `<button class="mt-area-pill ${state.historyTable.area === code ? "active" : ""}" data-ht-area="${code}">
            ${actualText(label)} <small>(${count})</small>
          </button>`;
        }).join("")}
      </div>
    </div>
  ` : "";

  const toolbar = `
    <div class="history-table-toolbar">
      <div class="machine-table-search-box">
        <span class="search-icon" aria-hidden="true">🔍</span>
        <input type="search" class="machine-table-search-input" placeholder="Cari tag, asset, role, atau nilai..." value="${actualText(state.historyTable.search)}" data-ht-search />
        ${state.historyTable.search ? `<button class="search-clear-btn" data-ht-clear-search aria-label="Hapus pencarian">×</button>` : ""}
      </div>
      <div class="history-filter-controls">
        <select class="history-select-control" data-ht-asset-select aria-label="Filter Mesin">
          <option value="all">Semua Mesin (${areaFiltered.length} sample)</option>
          ${distinctAssets.map((assetId) => `<option value="${assetId}" ${state.historyTable.assetId === assetId ? "selected" : ""}>${assetId}</option>`).join("")}
        </select>
        <select class="history-select-control" data-ht-role-select aria-label="Filter Sinyal">
          <option value="all">Semua Sinyal / Role</option>
          ${distinctRoles.map((role) => `<option value="${role}" ${state.historyTable.role === role ? "selected" : ""}>${actualText(actualLabel(role))}</option>`).join("")}
        </select>
        <select class="history-select-control" data-ht-pagesize-select aria-label="Jumlah per halaman">
          ${[10, 15, 25, 50].map((sz) => `<option value="${sz}" ${pageSize === sz ? "selected" : ""}>${sz} baris / hal</option>`).join("")}
        </select>
      </div>
    </div>
  `;

  const tableRows = pageItems.length ? pageItems.map((item) => `
    <tr>
      <td class="mono"><strong>${actualTime(item.source_ts)}</strong></td>
      <td>
        <strong class="machine-id-highlight">${actualText(item.asset_id)}</strong>
        <br><small class="area-tag-badge">${actualText(item.areaLabel || item.area)}</small>
      </td>
      <td class="mono font-sm">${actualText(item.tag_code)}</td>
      <td><span class="role-badge">${actualText(item.signal_role)}</span></td>
      <td><strong class="telemetry-val">${actualText(item.value_number ?? item.value_text ?? "—")}</strong> <small class="unit-text">${actualText(item.engineering_unit || "")}</small></td>
      <td><span class="quality-pill ${String(item.quality).toLowerCase() === "good" ? "good" : "stale"}">${actualText(item.quality)}</span></td>
    </tr>
  `).join("") : `<tr><td colspan="6" class="table-empty-row">Tidak ada data telemetry yang sesuai dengan filter yang dipilih.</td></tr>`;

  const paginationFooter = `
    <div class="machine-table-pagination">
      <div class="mt-page-info">
        Menampilkan <strong>${startItem}–${endItem}</strong> dari <strong>${totalFiltered}</strong> telemetry sample
      </div>
      <div class="mt-page-actions">
        <button class="mt-page-btn" data-ht-page="first" ${currentPage <= 1 ? "disabled" : ""} title="Halaman Pertama">«</button>
        <button class="mt-page-btn" data-ht-page="prev" ${currentPage <= 1 ? "disabled" : ""} title="Halaman Sebelumnya">‹ Prev</button>
        <span class="mt-page-current">Halaman <strong>${currentPage}</strong> dari <strong>${totalPages}</strong></span>
        <button class="mt-page-btn" data-ht-page="next" ${currentPage >= totalPages ? "disabled" : ""} title="Halaman Berikutnya">Next ›</button>
        <button class="mt-page-btn" data-ht-page="last" ${currentPage >= totalPages ? "disabled" : ""} title="Halaman Terakhir">»</button>
      </div>
    </div>
  `;

  const distinctTagsCount = new Set(enriched.map((i) => i.tag_code)).size;
  const goodQualityCount = enriched.filter((i) => String(i.quality).toUpperCase() === "GOOD").length;
  const qualityRate = enriched.length ? Math.round((goodQualityCount / enriched.length) * 100) : 100;

  return `
    ${pageHead("trends", `<span class="range-badge">LIVE DATA</span>`)}
    <section class="kpi-grid">
      ${actualMetric("Telemetry Loaded", backendTelemetry.length, "samples", "Recent process history")}
      ${actualMetric("Active Tags Monitored", distinctTagsCount, "tags", "Tag unik terdeteksi")}
      ${actualMetric("Good Quality Rate", `${qualityRate}%`, "valid", `${goodQualityCount} dari ${backendTelemetry.length} GOOD`)}
      ${actualMetric("Latest Ingestion Time", actualTime(backendTelemetry[0]?.source_ts), "WIB", "Waktu sample PLC terkini")}
    </section>
    ${actualHistoricalExplorer()}
    ${panel("Recent Telemetry Historian", "Latest validated process history", `
      <div class="machine-status-container">
        ${processTabs}
        ${areaPills}
        ${toolbar}
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Source Time</th>
                <th>Asset</th>
                <th>Tag Code</th>
                <th>Signal Role</th>
                <th>Value & Unit</th>
                <th>Quality</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        ${paginationFooter}
      </div>
    `)}
  `;
}

function actualHealthPage() {
  const assets = actualFleet();
  return `${pageHead("health", `<span class="range-badge">ACTUAL DATABASE</span>`)}<section class="grid-equal">${panel("Integration health", "Koneksi aktual", `<div class="definition-list"><div><span>Database</span><strong>${actualText(backendConnection.storage || "—")}</strong></div><div><span>REST API</span><strong>${actualText(backendConnection.status)}</strong></div><div><span>WebSocket</span><strong>${actualText(backendConnection.realtime)}</strong></div><div><span>Last sync</span><strong>${actualTime(backendConnection.lastSync)}</strong></div></div>`)}${panel("Actual record coverage", "Record yang sudah tersedia", `<div class="definition-list"><div><span>Assets</span><strong>${assets.length}</strong></div><div><span>Telemetry samples loaded</span><strong>${backendTelemetry.length}</strong></div><div><span>Alarm events loaded</span><strong>${backendAlarmEvents.length}</strong></div><div><span>Chemical transactions loaded</span><strong>${chemicalDispensingLogs.length}</strong></div></div>`)}</section>`;
}

function databaseSnapshotMetrics(machine, limit = 4) {
  return Object.entries(machine.values || {})
    .filter(([key]) => !["source", "note"].includes(key))
    .slice(0, limit)
    .map(([key, value]) => {
      const normalizedKey = key.toUpperCase();
      const tag = backendTelemetry.find((item) => item.asset_id === machine.id && String(item.signal_role || "").replace(/[._]/g, "_") === normalizedKey);
      return { label: actualLabel(key), value, unit: tag?.engineering_unit || "" };
    });
}

function actualMachineSummaryRun(machine, runs = backendProcessRuns) {
  return actualBatchRunFor(machine, runs)
    || runs.filter((run) => run.asset_id === machine.id).sort((left, right) => new Date(right.started_at || 0) - new Date(left.started_at || 0))[0]
    || null;
}

function actualMachineSummaryKey(machine, runs = backendProcessRuns) {
  const run = state.machineSummary.scope === "batch" ? actualMachineSummaryRun(machine, runs) : null;
  const shiftSelection = state.machineSummary.scope === "shift" ? `${state.machineSummary.productionDate}:${state.machineSummary.shiftCode}` : "current";
  return `${machine.id}:${state.machineSummary.scope}:${shiftSelection}:${run?.process_run_id || "latest"}`;
}

async function loadActualMachineSummary(machine, runs = backendProcessRuns) {
  const key = actualMachineSummaryKey(machine, runs);
  const cached = actualMachineSummaries.get(key);
  if (actualMachineSummaryLoading.has(key) || cached && Date.now() - cached.loadedAt < 30_000) return;
  actualMachineSummaryLoading.add(key);
  actualMachineSummaryErrors.delete(key);
  try {
    const run = state.machineSummary.scope === "batch" ? actualMachineSummaryRun(machine, runs) : null;
    const url = new URL(`/api/v1/assets/${encodeURIComponent(machine.id)}/performance-summary`, window.location.origin);
    url.searchParams.set("scope", state.machineSummary.scope);
    if (run?.process_run_id) url.searchParams.set("process_run_id", run.process_run_id);
    if (state.machineSummary.scope === "shift") {
      url.searchParams.set("production_date", state.machineSummary.productionDate);
      url.searchParams.set("shift_code", state.machineSummary.shiftCode);
    }
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      let message = response.status === 404 ? "Belum ada range batch untuk summary mesin ini." : "Performance summary API unavailable.";
      try {
        const errorPayload = await response.json();
        if (errorPayload?.message) message = Array.isArray(errorPayload.message) ? errorPayload.message.join(" ") : errorPayload.message;
      } catch {
        // Gunakan fallback message jika response bukan JSON.
      }
      throw new Error(message);
    }
    actualMachineSummaries.set(key, { data: await response.json(), loadedAt: Date.now() });
  } catch (error) {
    actualMachineSummaryErrors.set(key, error instanceof Error ? error.message : "Performance summary unavailable");
  } finally {
    actualMachineSummaryLoading.delete(key);
    requestHistorianRender();
  }
}

function actualDuration(seconds) {
  const totalMinutes = Math.max(0, Math.round(Number(seconds || 0) / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function actualSummaryNumber(value, decimals = 1) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : "—";
}

function actualPeakLabel(role) {
  return actualSignalLabel(String(role || "Parameter").replace(/_PV$/i, "").replace(/\.PV$/i, "").replace(/\./g, "_"));
}

function machinePerformanceSummary(machine, runs) {
  const key = actualMachineSummaryKey(machine, runs);
  const cached = actualMachineSummaries.get(key);
  const data = cached?.data;
  if (!actualMachineSummaryLoading.has(key) && (!cached || Date.now() - cached.loadedAt >= 30_000)) void loadActualMachineSummary(machine, runs);
  const scopes = [["batch", "Current Batch"], ["shift", "Shift"], ["today", "Today"]];
  const scopeButtons = scopes.map(([scope, label]) => `<button class="${state.machineSummary.scope === scope ? "active" : ""}" data-machine-summary-scope="${scope}">${label}</button>`).join("");
  const shiftOptions = [["A", "Shift A · 07:00–15:00"], ["B", "Shift B · 15:00–23:00"], ["C", "Shift C · 23:00–07:00"]];
  const shiftFilter = state.machineSummary.scope === "shift" ? `<div class="performance-shift-filter"><label><span>Production date</span><input type="date" data-machine-summary-date value="${actualText(state.machineSummary.productionDate)}" max="${jakartaShiftSelection().calendarDate}" /></label><label><span>Shift</span><select data-machine-summary-shift>${shiftOptions.map(([code, label]) => `<option value="${code}" ${state.machineSummary.shiftCode === code ? "selected" : ""}>${label}</option>`).join("")}</select></label></div>` : "";
  const header = `<div class="performance-summary-head"><div><span class="eyebrow">Machine performance summary</span><h2>Operational Summary</h2><p>${actualText(data?.range?.label || "Menghitung runtime, output, peak, dan stability dari PostgreSQL aktual.")}</p></div><div class="performance-summary-controls"><div class="segmented performance-scope-control">${scopeButtons}</div>${shiftFilter}</div></div>`;
  if (!data) {
    const error = actualMachineSummaryErrors.get(key);
    const foot = error || "Loading calculated machine summary…";
    return `<section class="performance-summary-section">${header}<div class="kpi-grid performance-summary-grid">${kpi("Total Runtime", "—", "", "RT", foot)}${kpi("Estimated Output", "—", "", "OUT", foot)}${kpi("Peak Parameter", "—", "", "PK", foot)}${kpi("Process Stability", "—", "", "STB", foot)}</div></section>`;
  }

  const availability = data.runtime.availability_percent == null ? "No complete state coverage" : `${actualSummaryNumber(data.runtime.availability_percent, 1)}% availability`;
  const stateCoverage = data.runtime.state_coverage_percent == null ? "—" : `${actualSummaryNumber(data.runtime.state_coverage_percent, 0)}% state coverage`;
  const runtimeFoot = `${availability} · ${stateCoverage} · ${data.runtime.stop_count} stop event`;
  const outputTitle = data.output?.estimated === false ? "Actual Output" : "Estimated Output";
  const outputValue = data.output ? actualSummaryNumber(data.output.value, 1) : "—";
  const outputUnit = data.output?.unit || "";
  const outputFoot = data.output ? `${data.output.estimated ? "Calculated from speed historian" : "Meter / process output"} · ${actualText(data.output.source)}` : "Output totalizer atau speed historian belum tersedia";
  const peaks = [...(data.peaks || [])].sort((left, right) => String(left.signal_role).localeCompare(String(right.signal_role)));
  const highestPeak = peaks.reduce((current, item) => !current || Number(item.peak_value) > Number(current.peak_value) ? item : current, null);
  const peakValue = highestPeak ? actualSummaryNumber(highestPeak.peak_value, 1) : "—";
  const peakUnit = highestPeak?.engineering_unit || "";
  const peakTitle = data.peak_metric?.title || "Peak Parameter";
  const peakFoot = peaks.length ? `${peaks.map((item) => `${actualPeakLabel(item.signal_role)} ${actualSummaryNumber(item.peak_value, 1)} ${item.engineering_unit || ""}`).join(" · ")} · highest at ${actualTime(highestPeak?.peak_at)}` : "Belum ada parameter snapshot/tag dengan historian pada scope ini";
  const stabilityTitle = data.stability ? "Process Stability" : "Completed Batches";
  const stabilityValue = data.stability ? actualSummaryNumber(data.stability.average_spread, 2) : actualSummaryNumber(data.completed_batches, 0);
  const stabilityUnit = data.stability?.unit || "batch";
  const stabilityFoot = data.stability ? `Avg temperature spread · peak ${actualSummaryNumber(data.stability.maximum_spread, 2)} ${data.stability.unit} · ${data.stability.sensor_count} sensors` : "Completed process run in selected scope";

  return `<section class="performance-summary-section">${header}<div class="kpi-grid performance-summary-grid">${kpi("Total Runtime", actualDuration(data.runtime.seconds), "", "RT", runtimeFoot)}${kpi(outputTitle, outputValue, outputUnit, "OUT", outputFoot)}${kpi(peakTitle, peakValue, peakUnit, "PK", peakFoot)}${kpi(stabilityTitle, stabilityValue, stabilityUnit, "STB", stabilityFoot)}</div></section>`;
}

function databaseMachineReading(machine) {
  const metrics = databaseSnapshotMetrics(machine, 2);
  return metrics.length ? metrics.map((item) => `${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ""}`).join(" · ") : "No live snapshot";
}

function latestActualProcessRuns() {
  const latest = new Map();
  backendProcessRuns.forEach((run) => {
    const key = `${run.asset_id}|${run.batch_no}`;
    const current = latest.get(key);
    const timestamp = new Date(run.updated_at || run.started_at || 0).getTime();
    const currentTimestamp = new Date(current?.updated_at || current?.started_at || 0).getTime();
    if (!current || timestamp >= currentTimestamp) latest.set(key, run);
  });
  return [...latest.values()];
}

function actualDonutMarkup(items, totalLabel, unit = "", attribute = null) {
  const circumference = 402.12;
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
  let used = 0;
  const segments = items.map((item, index) => {
    const length = total ? Number(item.value || 0) / total * circumference : 0;
    const dataAttribute = attribute ? ` ${attribute}="${actualText(item.key)}" tabindex="0"` : "";
    const segment = `<circle class="${item.selected ? "selected" : ""}" cx="80" cy="80" r="64" fill="none" stroke="${managementColors[index % managementColors.length]}" stroke-width="32" stroke-dasharray="${length.toFixed(2)} ${(circumference - length).toFixed(2)}" stroke-dashoffset="${(-used).toFixed(2)}" transform="rotate(-90 80 80)"${dataAttribute}><title>${actualText(item.label)}: ${actualText(item.value)} ${actualText(unit)}</title></circle>`;
    used += length;
    return segment;
  }).join("");
  const legend = items.map((item, index) => `<div class="resource-legend-row static ${item.selected ? "active" : ""}"><i style="background:${managementColors[index % managementColors.length]}"></i><span>${actualText(item.label)}</span><strong>${total ? (Number(item.value || 0) / total * 100).toFixed(1) : "0.0"}%</strong><small>${Number(item.value || 0).toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${actualText(unit)}</small></div>`).join("");
  return `<div class="resource-donut-wrap"><div class="resource-donut"><svg viewBox="0 0 160 160" role="img">${segments}</svg><div><strong>${Number(total).toLocaleString("id-ID", { maximumFractionDigits: 2 })}</strong><small>${actualText(totalLabel)}</small></div></div><div class="resource-legend">${legend}</div></div>`;
}

function productionOutputValue(batch, mode = state.productionOutput.mode) {
  const key = mode === "actual" ? "actual_value" : mode === "estimated" ? "estimated_value" : "effective_value";
  const value = Number(batch?.[key]);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function productionOutputSource(batch, mode = state.productionOutput.mode) {
  if (mode === "actual") return productionOutputValue(batch, mode) ? "ACTUAL" : "NO_DATA";
  if (mode === "estimated") return productionOutputValue(batch, mode) ? "ESTIMATED" : "NO_DATA";
  return batch?.effective_source || "NO_DATA";
}

function productionOutputChartItems(data) {
  const ranked = (data?.batches || [])
    .map((batch) => ({ key: batch.batch_no, label: batch.batch_no, value: productionOutputValue(batch), source: productionOutputSource(batch) }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value);
  if (ranked.length <= 5) return ranked;
  const remainder = ranked.slice(5);
  const sources = new Set(remainder.map((item) => item.source));
  return [...ranked.slice(0, 5), {
    key: "others",
    label: `Others (${remainder.length})`,
    value: remainder.reduce((sum, item) => sum + item.value, 0),
    source: sources.size === 1 ? [...sources][0] : "MIXED",
  }];
}

function productionOutputDonutMarkup(items, unit) {
  const circumference = 402.12;
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
  let used = 0;
  const segments = items.map((item, index) => {
    const length = total ? Number(item.value || 0) / total * circumference : 0;
    const segment = `<circle cx="80" cy="80" r="64" fill="none" stroke="${managementColors[index % managementColors.length]}" stroke-width="32" stroke-dasharray="${length.toFixed(2)} ${(circumference - length).toFixed(2)}" stroke-dashoffset="${(-used).toFixed(2)}" transform="rotate(-90 80 80)"><title>${actualText(item.label)}: ${Number(item.value).toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${actualText(unit)} · ${actualText(item.source)}</title></circle>`;
    used += length;
    return segment;
  }).join("");
  const legend = items.map((item, index) => {
    const sourceTone = item.source === "ACTUAL" ? "actual" : item.source === "ESTIMATED" ? "estimated" : "mixed";
    return `<div class="production-output-legend-row"><i style="background:${managementColors[index % managementColors.length]}"></i><span><strong>${actualText(item.label)}</strong><em class="${sourceTone}">${actualText(item.source)}</em></span><b>${total ? (Number(item.value) / total * 100).toFixed(1) : "0.0"}%</b><small>${Number(item.value).toLocaleString("id-ID", { maximumFractionDigits: 1 })} ${actualText(unit)}</small></div>`;
  }).join("");
  return `<div class="resource-donut-wrap production-output-donut"><div class="resource-donut"><svg viewBox="0 0 160 160" role="img" aria-label="Production output by batch">${segments}</svg><div><strong>${total.toLocaleString("id-ID", { maximumFractionDigits: 1 })}</strong><small>${actualText(unit)} output</small></div></div><div class="resource-legend">${legend}</div></div>`;
}

function productionOutputControls() {
  const config = state.productionOutput;
  const processOptions = [["kalender", "Kalender · Final"], ["dryer", "Dryer"], ["calator", "Calator"], ["jetflow", "Jetflow"]];
  const shiftOptions = [["A", "A · 07–15"], ["B", "B · 15–23"], ["C", "C · 23–07"]];
  return `<div class="production-output-toolbar">
    <div class="segmented production-output-modes" aria-label="Production output source mode">
      ${[["effective", "Effective"], ["actual", "Actual"], ["estimated", "Estimated"]].map(([mode, label]) => `<button type="button" class="segment ${config.mode === mode ? "active" : ""}" data-production-output-mode="${mode}">${label}</button>`).join("")}
    </div>
    <div class="production-output-filters">
      <label><span>Process</span><select data-production-output-process>${processOptions.map(([value, label]) => `<option value="${value}" ${config.process === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
      <label><span>Production date</span><input type="date" data-production-output-date value="${actualText(config.productionDate)}" max="${jakartaShiftSelection().calendarDate}" /></label>
      <label><span>Shift</span><select data-production-output-shift>${shiftOptions.map(([value, label]) => `<option value="${value}" ${config.shiftCode === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
    </div>
  </div>`;
}

function actualProductionOutputPanel() {
  const currentKey = productionOutputRequestKey();
  const data = productionOutputByBatch.key === currentKey ? productionOutputByBatch.data : null;
  const controls = productionOutputControls();
  if (!data) {
    const label = productionOutputByBatch.error || (productionOutputByBatch.loading ? "Menghitung output per batch…" : "Menunggu data output produksi");
    return panel("Production Output by Batch", "Actual diprioritaskan; estimate berasal dari speed historian berkualitas baik", `${controls}${actualEmpty(label)}`, `<span class="data-pill neutral">${state.productionOutput.process.toUpperCase()}</span>`, "production-output-panel");
  }
  const items = productionOutputChartItems(data);
  const summary = data.summary || {};
  const content = items.length
    ? productionOutputDonutMarkup(items, data.unit || "m")
    : actualEmpty(`Belum ada ${state.productionOutput.mode} output pada tanggal dan shift ini.`);
  const coverage = `<div class="production-output-coverage"><span><strong>${summary.batch_count || 0}</strong> registered batch</span><span class="actual"><strong>${summary.actual_batch_count || 0}</strong> actual</span><span class="estimated"><strong>${summary.estimated_batch_count || 0}</strong> estimated fallback</span><span><strong>${summary.no_data_batch_count || 0}</strong> no data</span><small>Effective tidak menjumlahkan actual dan estimate untuk run yang sama.</small></div>`;
  return panel("Production Output by Batch", "Actual diprioritaskan; estimate berasal dari speed historian berkualitas baik", `${controls}${content}${coverage}`, `<span class="data-pill good">SHIFT ${actualText(state.productionOutput.shiftCode)}</span>`, "production-output-panel");
}

function productionOutputMetric() {
  const data = productionOutputByBatch.key === productionOutputRequestKey() ? productionOutputByBatch.data : null;
  if (!data) return { value: "—", unit: "", foot: "Loading selected production scope" };
  const total = (data.batches || []).reduce((sum, batch) => sum + productionOutputValue(batch), 0);
  return {
    value: total.toLocaleString("id-ID", { maximumFractionDigits: 1 }),
    unit: data.unit || "m",
    foot: `${processConfig[state.productionOutput.process].singular} · Shift ${state.productionOutput.shiftCode} · ${state.productionOutput.mode}`,
  };
}

function productionProcessOutputValue(process, mode = state.productionOutput.mode) {
  const key = mode === "actual" ? "actual_value" : mode === "estimated" ? "estimated_value" : "effective_value";
  const value = Number(process?.[key]);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function actualProductionOutputProcessPanel() {
  const data = productionOutputByBatch.key === productionOutputRequestKey() ? productionOutputByBatch.data : null;
  if (!data) return panel("Production Output by Process", "Perbandingan proses mengikuti production date, shift, dan source mode pada chart batch", actualEmpty("Menunggu agregasi output seluruh proses."), `<span class="data-pill neutral">${state.productionOutput.mode.toUpperCase()}</span>`, "production-process-panel");
  const totals = (data.process_totals || []).map((item) => ({ ...item, value: productionProcessOutputValue(item) }));
  const available = totals.filter((item) => item.value > 0).sort((left, right) => right.value - left.value);
  if (!available.length) return panel("Production Output by Process", "Perbandingan proses mengikuti production date, shift, dan source mode pada chart batch", actualEmpty(`Belum ada ${state.productionOutput.mode} output antarproses pada scope ini.`), `<span class="data-pill neutral">${state.productionOutput.mode.toUpperCase()}</span>`, "production-process-panel");
  const highest = available[0];
  const lowest = available[available.length - 1];
  const gap = highest.value - lowest.value;
  const gapPercent = highest.value > 0 ? gap / highest.value * 100 : 0;
  const summary = `<div class="throughput-summary output-process-summary">
    <div><span>Highest process</span><strong>${actualText(processConfig[highest.process_type].singular)} <small>${highest.value.toLocaleString("id-ID", { maximumFractionDigits: 1 })} ${actualText(data.unit || "m")}</small></strong></div>
    <div><span>Lowest with data</span><strong>${actualText(processConfig[lowest.process_type].singular)} <small>${lowest.value.toLocaleString("id-ID", { maximumFractionDigits: 1 })} ${actualText(data.unit || "m")}</small></strong></div>
    <div><span>Process gap</span><strong>${gap.toLocaleString("id-ID", { maximumFractionDigits: 1 })} <small>${actualText(data.unit || "m")} · ${gapPercent.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%</small></strong></div>
  </div>`;
  const note = `<div class="production-process-note"><span>${actualText(state.productionOutput.productionDate)} · Shift ${actualText(state.productionOutput.shiftCode)} · ${actualText(state.productionOutput.mode)}</span><small>Bandingkan gap untuk menemukan bottleneck. Nilai proses tidak dijumlahkan sebagai total plant karena batch yang sama dapat melewati beberapa proses.</small></div>`;
  return panel("Production Output by Process", "Perbandingan proses mengikuti production date, shift, dan source mode pada chart batch", `${summary}<div class="chart-container production-bar-chart"><canvas id="production-output-process-chart" class="chart-canvas"></canvas></div>${note}`, `<span class="data-pill good">SYNCED FILTER</span>`, "production-process-panel");
}

const actualProcessMetricConfig = {
  jetflow: { label: "Water Consumption", unit: "m³", keys: ["penggunaan_air_pv", "water_consumption_m3", "total_water_const"] },
  calator: { label: "Production Output", unit: "m", keys: ["output_total_m"] },
  dryer: { label: "Production Output", unit: "m", keys: ["output_total_m"] },
  kalender: { label: "Production Output", unit: "m", keys: ["output_total_m"] },
  chemical: { label: "Chemical Delivered", unit: "kg", keys: [] },
};

function actualMachineProcessMetric(type, machine) {
  if (type === "chemical") {
    return chemicalDispensingLogs.filter((item) => item.dispenser === machine.id).reduce((sum, item) => {
      const value = Number.parseFloat(String(item.actual).replace(/[^0-9.,-]/g, "").replace(",", "."));
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
  }
  const config = actualProcessMetricConfig[type];
  const key = config.keys.find((candidate) => Number.isFinite(Number(machine.values?.[candidate])));
  return key ? Number(machine.values[key]) : 0;
}

function actualProcessResourcePanels(type) {
  const config = actualProcessMetricConfig[type];
  const selectedArea = state.management.area[type];
  const areaItems = processAreas[type].map((area) => ({
    key: `${type}|${area.code}|actual`,
    code: area.code,
    label: type === "jetflow" ? area.label : `Area ${area.label}`,
    selected: selectedArea === area.code,
    value: fleetFor(type).filter((machine) => machine.area === area.code).reduce((sum, machine) => sum + actualMachineProcessMetric(type, machine), 0),
  }));
  const scopedMachines = fleetFor(type).filter((machine) => !selectedArea || machine.area === selectedArea);
  const ranking = scopedMachines.map((machine) => ({ machine, value: actualMachineProcessMetric(type, machine) })).filter((item) => item.value > 0).sort((left, right) => right.value - left.value);
  const max = ranking[0]?.value || 1;
  const breakdown = panel(`${config.label} by ${type === "jetflow" ? "Lane" : "Area"}`, "Klik segmen untuk memfilter ranking mesin.", actualDonutMarkup(areaItems, config.unit, config.unit, "data-resource-area"), `<span class="data-pill good">LIVE NOW</span>`);
  const rankingContent = ranking.length ? `<div class="ranking-list">${ranking.map((item, index) => `<button class="ranking-row" data-machine-target="${type}|${item.machine.id}"><span class="ranking-number">${index + 1}</span><span class="ranking-copy"><strong>${actualText(item.machine.id)}</strong><small>${actualText(item.machine.areaLabel)} · ${actualText(item.machine.state)}</small><i><b style="width:${item.value / max * 100}%"></b></i></span><span class="ranking-value">${item.value.toLocaleString("id-ID", { maximumFractionDigits: 2 })}<small>${actualText(config.unit)}</small></span></button>`).join("")}</div>` : actualEmpty(`Belum ada ${config.label.toLowerCase()} aktual pada scope ini.`);
  const rankingPanel = panel(`Top ${config.label}${selectedArea ? ` · ${actualText(processAreas[type].find((area) => area.code === selectedArea)?.label || selectedArea)}` : ""}`, selectedArea ? "Ranking area terpilih." : "Ranking seluruh mesin.", rankingContent, selectedArea ? `<button class="button ghost small" data-ranking-reset="${type}">All areas</button>` : `<span class="data-pill neutral">LIVE NOW</span>`);
  return `<section class="management-analysis-grid">${breakdown}${rankingPanel}</section>`;
}

function databaseOverviewPage() {
  const assets = actualFleet();
  const running = assets.filter((asset) => asset.state === "running").length;
  const stopped = assets.filter((asset) => ["idle", "fault", "offline"].includes(asset.state)).length;
  const batches = new Set(assets.map((asset) => asset.batch).filter((batch) => batch && batch !== "—")).size;
  const actualRuns = latestActualProcessRuns();
  const completedRuns = actualRuns.filter((run) => String(run.run_status).toUpperCase() === "COMPLETED").length;
  const outputMetric = productionOutputMetric();
  const stateBreakdown = [
    { key: "running", label: "Running", value: assets.filter((asset) => asset.state === "running").length },
    { key: "idle", label: "Idle", value: assets.filter((asset) => asset.state === "idle").length },
    { key: "warning", label: "Warning", value: assets.filter((asset) => asset.state === "warning").length },
    { key: "fault", label: "Fault", value: assets.filter((asset) => asset.state === "fault").length },
    { key: "offline", label: "Offline", value: assets.filter((asset) => asset.state === "offline").length },
  ].filter((item) => item.value > 0);
  const processFlow = ["jetflow", "calator", "dryer", "kalender"].map((type) => {
    const fleet = fleetFor(type);
    return processNode(processConfig[type].plural, `${fleet.length} asset terdaftar`, type, statusCount(fleet, "running"), statusCount(fleet, "warning"), statusCount(fleet, "fault"));
  }).join("");
  const runs = actualRuns.length
    ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Batch</th><th>Asset</th><th>Recipe</th><th>Status</th><th>Output</th><th>Start</th></tr></thead><tbody>${actualRuns.slice(0, 10).map((run) => `<tr><td class="mono">${actualText(run.batch_no)}</td><td>${actualText(run.asset_id)}</td><td class="mono">${actualText(run.recipe_code)}</td><td>${actualText(run.run_status)}</td><td>${actualText(run.output_quantity ?? "—")} ${actualText(run.output_unit || "")}</td><td class="mono">${actualTime(run.started_at)}</td></tr>`).join("")}</tbody></table></div>`
    : actualEmpty("Belum ada process run aktual");
  return `
    ${pageHead("overview", `<span class="range-badge">LIVE DATA</span>`)}
    <section class="kpi-grid overview-kpi-grid">
      ${actualUtilityKpi(backendUtilities)}
      ${actualMetric("Machine running", running, "asset", "Current operating state")}
      ${actualMetric("Stop / fault / offline", stopped, "asset", "Machines requiring attention")}
      ${actualMetric("Active batches", batches, "batch", "Production currently in process")}
      ${actualMetric("Production output", outputMetric.value, outputMetric.unit, outputMetric.foot)}
      ${actualMetric("Completed batches", completedRuns, "batch", "Completed production runs")}
    </section>
    <section class="grid-equal overview-insight-grid">
      ${panel("Machine Operating Status", "Komposisi kondisi seluruh asset aktual", actualDonutMarkup(stateBreakdown, "machines", "asset"), `<span class="data-pill good">LIVE NOW</span>`)}
      ${actualProductionOutputPanel()}
    </section>
    ${actualProductionOutputProcessPanel()}
    ${panel("Textile process flow", "Jumlah dan kondisi asset yang terdaftar", `<div class="process-flow">${processFlow}</div>`)}
    ${panel("Active process runs", "Recent production activity and output", runs)}
    ${panel("Machine Directory", "Status aktual tiap asset · klik melalui process flow untuk drill-down area dan mesin", actualAssetTable(assets))}
  `;
}

function databaseFleetPage(type) {
  const fleet = fleetFor(type);
  const areas = [...new Map(fleet.map((machine) => [machine.area, machine.areaLabel || machine.area])).entries()];
  const cards = areas.length ? areas.map(([areaCode, areaLabel]) => {
    const machines = fleet.filter((machine) => machine.area === areaCode);
    const running = statusCount(machines, "running");
    const idle = statusCount(machines, "idle");
    const warning = statusCount(machines, "warning");
    const fault = statusCount(machines, "fault");
    const connected = machines.filter((machine) => machine.connected).length;
    const tone = fault ? "fault" : warning ? "warning" : running ? "running" : idle ? "idle" : "offline";
    return `<article class="card area-card" data-area-state="${tone}" data-area-target="${type}|${areaCode}" role="button" tabindex="0">
      <div class="area-card-head"><div><span class="area-code">${actualText(areaCode)}</span><h2>${actualText(areaLabel)}</h2></div>${statusPill(tone)}</div>
      <div class="area-total"><strong>${machines.length}</strong><span>${actualText(processConfig[type].singular)} registered</span></div>
      ${areaStateSummary(running, idle, warning, fault)}
      <div class="area-card-foot"><span>${connected}/${machines.length} connected</span><strong>Open assets →</strong></div>
    </article>`;
  }).join("") : actualEmpty("Belum ada asset untuk proses ini");
  return `
    ${pageHead(type)}
    <section class="fleet-summary card"><div><span class="eyebrow">${actualText(processConfig[type].process)}</span><h2>${actualText(processConfig[type].plural)} Fleet Overview</h2><p>Pilih area untuk membuka asset dan detail sensor/motor aktual.</p></div><div class="fleet-total"><strong>${fleet.length}</strong><span>Total assets</span></div></section>
    <section class="management-kpi-grid live-grid">
      ${actualMetric("Machines running", statusCount(fleet, "running"), "asset", "Operating now")}
      ${actualMetric("Warnings", statusCount(fleet, "warning"), "asset", "Review required")}
      ${actualMetric("Faults", statusCount(fleet, "fault"), "asset", "Immediate attention")}
      ${actualMetric("Active batches", new Set(fleet.map((machine) => machine.batch).filter((batch) => batch && batch !== "—")).size, "batch", "In production")}
    </section>
    ${actualProcessResourcePanels(type)}
    <section class="area-grid">${cards}</section>
  `;
}

function databaseAreaPage(type) {
  const area = state.drill[type].area;
  const machines = fleetFor(type).filter((machine) => machine.area === area);
  const areaLabel = machines[0]?.areaLabel || area;
  const cards = machines.length ? machines.map((machine, index) => `<article class="card fleet-machine-card" data-machine-target="${type}|${machine.id}" data-machine-state="${machine.state}" data-machine-search="${actualText(machine.id).toLowerCase()} ${actualText(machine.name).toLowerCase()}" role="button" tabindex="0">
    <div class="fleet-machine-top"><span class="machine-code ranking-badge">#${index + 1}</span><div><strong>${actualText(machine.id)}</strong><span>${actualText(machine.name)}</span></div>${statusPill(machine.state)}</div>
    <div class="fleet-machine-reading"><span>${actualText(databaseMachineReading(machine))}</span><small>Batch <strong>${actualText(machine.batch)}</strong></small></div>
    ${machineAlarmNote(machine.id, true)}
    <div class="fleet-machine-meta"><span>Progress<strong>${actualText(machine.progress)}%</strong></span><span>Quality<strong>${actualText(machine.quality)}</strong></span><span>Update<strong>${actualTime(machine.sourceTs)}</strong></span></div>
    <div class="fleet-machine-foot">${machineConnectionBadge(machine)}<strong>Machine detail →</strong></div>
  </article>`).join("") : actualEmpty("Belum ada asset di area ini");
  return `
    ${processBreadcrumb(type)}
    ${pageHead(type, `<button class="button" data-process-level="overview" data-process-type="${type}">← All areas</button>`)}
    <section class="fleet-area-head card"><div><span class="area-code">${actualText(area)}</span><div><h2>${actualText(processConfig[type].plural)} ${actualText(areaLabel)}</h2></div></div><div class="area-health"><strong>${machines.length}</strong><span>Machines</span></div></section>
    <section class="fleet-machine-grid" id="fleet-machine-grid">${cards}</section>
  `;
}

function databaseEquipmentPanel(machine) {
  const equipment = backendEquipment.filter((item) => item.assetId === machine.id);
  if (!equipment.length) return panel("Motor & driven equipment", "Belum ada equipment master/snapshot untuk asset ini", actualEmpty("No equipment data"));
  const cards = equipment.map((item) => {
    const current = [item.currentR, item.currentS, item.currentT].filter((value) => Number.isFinite(Number(value)));
    const average = current.length ? (current.reduce((sum, value) => sum + Number(value), 0) / current.length).toFixed(1) : "—";
    return `<article class="motor-card"><div class="motor-card-head"><strong>${actualText(item.name)}</strong><i class="equipment-state ${item.state === "warning" ? "warning" : item.state === "running" ? "" : "offline"}"></i></div><div class="card-reading">${actualText(average)}<small>A avg</small></div><div class="card-caption">${actualText(item.powerKw ?? "—")} kW · ${actualText(item.frequencyHz ?? "—")} Hz · ${actualText(item.state)}</div></article>`;
  }).join("");
  const table = `<div class="table-wrap"><table class="data-table"><thead><tr><th>Motor / Drive</th><th>R</th><th>S</th><th>T</th><th>V RS/ST/TR</th><th>kW</th><th>Hz</th><th>Runtime</th><th>Energy</th><th>Maintenance</th></tr></thead><tbody>${equipment.map((item) => `<tr><td><strong>${actualText(item.name)}</strong><br><small>${actualText(item.code)}</small></td><td>${actualText(item.currentR ?? "—")} A</td><td>${actualText(item.currentS ?? "—")} A</td><td>${actualText(item.currentT ?? "—")} A</td><td>${actualText(item.voltageRS ?? "—")} / ${actualText(item.voltageST ?? "—")} / ${actualText(item.voltageTR ?? "—")} V</td><td>${actualText(item.powerKw ?? "—")}</td><td>${actualText(item.frequencyHz ?? "—")}</td><td>${actualText(item.runtimeHours ?? "—")} h</td><td>${actualText(item.energyKwh ?? "—")} kWh</td><td>${actualTime(item.maintenanceDueAt)}</td></tr>`).join("")}</tbody></table></div>`;
  return `${panel("Motor & driven equipment", "Current R/S/T, voltage, power, runtime, energy, dan maintenance aktual", `<div class="motor-grid">${cards}</div>`)}${panel("Motor diagnostic log", "Electrical and operating condition by drive", table)}`;
}

function actualBatchRunFor(machine, runs = backendProcessRuns) {
  const selected = state.batchInvestigation[machine.process];
  if (!selected || selected.machineId !== machine.id) return null;
  return runs.find((run) => run.process_run_id === selected.processRunId)
    || runs.find((run) => run.batch_no === selected.batch)
    || null;
}

function actualBatchLookupPanel(machine, runs) {
  const selectedRun = actualBatchRunFor(machine, runs);
  const selectedBatch = selectedRun?.batch_no || "";
  const rows = runs.length ? runs.map((run) => {
    const selected = run.process_run_id === selectedRun?.process_run_id;
    const tone = String(run.run_status).toUpperCase() === "COMPLETED" ? "good" : String(run.run_status).toUpperCase() === "HOLD" ? "warning" : "neutral";
    return `<tr class="${selected ? "selected" : ""}">
      <td class="mono"><strong>${actualText(run.batch_no)}</strong></td>
      <td class="mono">${actualText(run.recipe_code || "—")}</td>
      <td class="mono">${actualTime(run.started_at)}</td>
      <td class="mono">${actualTime(run.ended_at)}</td>
      <td><span class="data-pill ${tone}">${actualText(run.run_status)}</span></td>
      <td><button class="batch-load-button ${selected ? "loaded" : ""}" type="button" data-track-process-run="${actualText(run.process_run_id)}" ${selected ? "disabled" : ""}>${selected ? "Loaded" : "Load"}</button></td>
    </tr>`;
  }).join("") : `<tr><td colspan="6">${actualEmpty("Belum ada batch_process_run untuk mesin ini.")}</td></tr>`;
  return `<section class="card batch-investigation-card actual-batch-lookup">
    <div class="batch-investigation-header">
      <div class="batch-investigation-copy"><span class="eyebrow">Batch historian lookup</span><h2>Search Production Batch</h2><p>Load batch untuk mengikat parameter setting, trend telemetry aktual, process step, dan abnormal log pada satu rentang waktu.</p></div>
      <form class="batch-search-form" data-actual-batch-form="${actualText(machine.id)}">
        <label for="actual-batch-search-${actualText(machine.id)}">Batch number</label>
        <div class="batch-search-row"><input class="search-control batch-search-input" id="actual-batch-search-${actualText(machine.id)}" data-actual-batch-input value="${actualText(selectedBatch)}" placeholder="Contoh: BATCH-KL5-20260821-001" autocomplete="off" maxlength="64"/><button class="button primary" type="submit">Load batch</button>${selectedRun ? `<div class="batch-export-actions" aria-label="Export detail batch"><button class="button batch-export-button pdf" type="button" data-actual-batch-export="${actualText(selectedRun.process_run_id)}" data-export-format="pdf">Export PDF</button><button class="button batch-export-button excel" type="button" data-actual-batch-export="${actualText(selectedRun.process_run_id)}" data-export-format="xlsx">Export Excel</button></div><button class="button ghost" type="button" data-actual-batch-clear="${actualText(machine.process)}">Clear</button>` : ""}</div>
      </form>
    </div>
    <div class="batch-recent-head"><span>Recent batches</span><small>${runs.length} record aktual · scroll untuk melihat lainnya</small></div>
    <div class="batch-recent-table-wrap" tabindex="0" aria-label="Recent process runs ${actualText(machine.id)}">
      <table class="batch-recent-table actual-batch-table"><thead><tr><th>Batch No.</th><th>Recipe</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>
    </div>
    ${selectedRun ? `<div class="batch-active-context"><span class="kpi-scope historical">BATCH LOADED</span><strong>${actualText(selectedRun.batch_no)}</strong><small>${actualText(machine.id)} · selected production history</small></div>` : ""}
  </section>`;
}

const actualBatchSettingDictionary = {
  temperature_upper_c: ["SV Temperature Upper", "°C"],
  temperature_lower_c: ["SV Temperature Lower", "°C"],
  loadcell_upper_kg: ["SV Loadcell Upper", "kg"],
  loadcell_lower_kg: ["SV Loadcell Lower", "kg"],
  fabric_width_cm: ["Fabric Width", "cm"],
  overfeed_percent: ["Overfeed", "%"],
  overspeed_expander_percent: ["Overspeed Expander", "%"],
  overspeed_inlet_percent: ["Overspeed Inlet", "%"],
  overspeed_plaiter_percent: ["Overspeed Plaiter", "%"],
  target_output_m: ["Target Output", "m"],
};

function actualBatchSettingMeta(key) {
  if (actualBatchSettingDictionary[key]) return actualBatchSettingDictionary[key];
  const unit = key.endsWith("_kg") ? "kg" : key.endsWith("_cm") ? "cm" : key.endsWith("_c") ? "°C" : key.endsWith("_percent") ? "%" : key.endsWith("_m") ? "m" : "";
  return [actualSignalLabel(key.replace(/_(kg|cm|c|percent|m)$/i, "")), unit];
}

function actualBatchJsonSummary(value) {
  const entries = Object.entries(value || {});
  if (!entries.length) return "—";
  return entries.map(([key, item]) => {
    const [label, unit] = actualBatchSettingMeta(key);
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const itemUnit = item.unit || unit;
      const average = item.avg == null ? "—" : Number(item.avg).toLocaleString("id-ID", { maximumFractionDigits: 2 });
      const minimum = item.min == null ? "—" : Number(item.min).toLocaleString("id-ID", { maximumFractionDigits: 2 });
      const maximum = item.max == null ? "—" : Number(item.max).toLocaleString("id-ID", { maximumFractionDigits: 2 });
      return `${actualText(label)} avg ${average}${itemUnit ? ` ${actualText(itemUnit)}` : ""} (min ${minimum} · max ${maximum})`;
    }
    return `${actualText(label)}: ${actualText(item)}${unit ? ` ${actualText(unit)}` : ""}`;
  }).join(" · ");
}

function actualBatchContextPanel(context) {
  const run = context.run;
  const durationMinutes = run.started_at && run.ended_at ? Math.max(0, Math.round((new Date(run.ended_at) - new Date(run.started_at)) / 60_000)) : null;
  const fields = [
    ["Batch", run.batch_no], ["Customer", run.customer_name || "—"], ["Fabric", run.fabric_type || "—"], ["Gramasi", run.fabric_weight_gsm == null ? "—" : `${Number(run.fabric_weight_gsm).toLocaleString("id-ID", { maximumFractionDigits: 2 })} gsm`],
    ["Target width", run.target_width_cm == null ? "—" : `${Number(run.target_width_cm).toLocaleString("id-ID", { maximumFractionDigits: 2 })} cm`], ["Target output", run.target_output_kg == null ? "—" : `${Number(run.target_output_kg).toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg`],
    ["Recipe", run.recipe_code || "—"], ["Run duration", durationMinutes == null ? "—" : `${durationMinutes} min`], ["Output actual", run.output_quantity == null ? "—" : `${Number(run.output_quantity).toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${run.output_unit || ""}`],
    ["Start", actualTime(run.started_at)], ["End", actualTime(run.ended_at)], ["Delivery target", actualTime(run.delivery_target_at)],
  ];
  return panel("Batch & Production Context", "Identitas produksi dan target dari production_batch + batch_process_run", `<div class="actual-batch-context-grid">${fields.map(([label, value]) => `<div><span>${actualText(label)}</span><strong>${actualText(value)}</strong></div>`).join("")}</div>`);
}

function actualBatchParameterPanel(context) {
  const rows = context.steps.flatMap((step) => Object.entries(step.setpoint_json || {}).map(([key, value]) => {
    const [label, unit] = actualBatchSettingMeta(key);
    return `<tr><td class="mono">${String(step.step_no).padStart(2, "0")}</td><td><strong>${actualText(step.step_name)}</strong></td><td>${actualText(label)}</td><td class="mono"><strong>${actualText(value)}</strong></td><td>${actualText(unit || "—")}</td><td class="mono">${actualTime(step.started_at)} — ${actualTime(step.ended_at)}</td></tr>`;
  }));
  const content = rows.length ? `<div class="parameter-config-wrap actual-batch-parameter-wrap"><table class="parameter-config-table"><thead><tr><th>Step</th><th>Process</th><th>Parameter</th><th>SV / Target</th><th>Unit</th><th>Applied Time</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>` : actualEmpty("Batch ini belum memiliki setpoint_json pada process_step_execution.");
  return panel("Parameter Configuration", "Setting mesin yang direkam per langkah proses; tidak menggunakan nilai tampilan hardcoded.", content, `<span class="range-badge">${rows.length} SETTINGS</span>`);
}

function actualBatchProcessPanel(context) {
  const rows = context.steps.length ? context.steps.map((step) => `<tr><td class="mono">${String(step.step_no).padStart(2, "0")}</td><td><strong>${actualText(step.step_name)}</strong><br><small class="mono">${actualText(step.step_code || "—")}</small></td><td class="mono">${actualTime(step.started_at)}</td><td class="mono">${actualTime(step.ended_at)}</td><td><span class="data-pill ${String(step.status).toUpperCase() === "COMPLETED" ? "good" : "neutral"}">${actualText(step.status)}</span></td><td>${actualBatchJsonSummary(step.setpoint_json)}</td><td>${actualBatchJsonSummary(step.actual_json)}</td></tr>`).join("") : `<tr><td colspan="7">${actualEmpty("Belum ada process step untuk batch ini.")}</td></tr>`;
  return panel("Process Sequence", "Urutan aktual, start/end time, setpoint, dan hasil per step", `<div class="table-wrap actual-batch-process-wrap"><table class="data-table"><thead><tr><th>Step</th><th>Process</th><th>Start</th><th>End</th><th>Status</th><th>Setpoint</th><th>Actual</th></tr></thead><tbody>${rows}</tbody></table></div>`, `<span class="range-badge">${context.steps.length} STEPS</span>`);
}

function actualBatchTargetPanel(context) {
  const targets = context.targets || [];
  if (!targets.length) return "";
  const rows = targets.map((target) => {
    const unit = target.engineering_unit || "";
    const tone = ["STABLE", "COMPLETED"].includes(String(target.target_state).toUpperCase()) ? "good" : ["DEVIATING", "CLEARING"].includes(String(target.target_state).toUpperCase()) ? "warning" : "neutral";
    const timeToTarget = target.time_to_target_seconds == null ? "—" : `${Math.floor(Number(target.time_to_target_seconds) / 60)}m ${Number(target.time_to_target_seconds) % 60}s`;
    return `<tr>
      <td><strong>${actualText(target.parameter_code)}</strong><small>${actualText(target.rule_name || target.rule_code)}</small></td>
      <td class="mono">R${actualText(target.revision_no)}</td>
      <td class="mono"><strong>${actualText(Number(target.sv_value).toLocaleString("id-ID", { maximumFractionDigits: 2 }))}</strong> ${actualText(unit)}<small>-${actualText(target.tolerance_low)} / +${actualText(target.tolerance_high)}</small></td>
      <td class="mono">${actualTime(target.tracking_started_at)}</td>
      <td class="mono">${actualTime(target.first_reached_at)}</td>
      <td class="mono">${actualTime(target.stable_at)}</td>
      <td class="mono">${actualText(timeToTarget)}</td>
      <td><span class="data-pill ${tone}">${actualText(target.target_state)}</span></td>
    </tr>`;
  }).join("");
  return panel("Target Achievement Log", "Pencapaian SV paralel per parameter; fase RAMPING tidak otomatis dianggap abnormal.", `<div class="table-wrap actual-batch-target-wrap"><table class="data-table"><thead><tr><th>Parameter</th><th>Revision</th><th>SV / Tolerance</th><th>Tracking Start</th><th>First Reached</th><th>Stable At</th><th>Time to Target</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>`, `<span class="range-badge">${targets.length} TARGETS</span>`);
}

function actualBatchSetpointChangePanel(context) {
  const changes = context.setpoint_changes || [];
  if (!changes.length) return "";
  const rows = changes.map((item) => `<tr>
    <td class="mono">${actualTime(item.changed_at)}</td>
    <td><strong>${actualText(item.parameter_code)}</strong><small>${actualText(item.step_code || item.step_name || "Run level")}</small></td>
    <td class="mono">${item.old_sv_value == null ? "Initial" : actualText(Number(item.old_sv_value).toLocaleString("id-ID", { maximumFractionDigits: 2 }))}</td>
    <td class="mono"><strong>${actualText(Number(item.new_sv_value).toLocaleString("id-ID", { maximumFractionDigits: 2 }))}</strong> ${actualText(item.engineering_unit || "")}</td>
    <td>${actualText(item.change_source)}</td>
    <td>${actualText(item.changed_by || "System")}</td>
    <td>${actualText(item.change_reason || "—")}</td>
  </tr>`).join("");
  return panel("Setpoint Change Log", "Setiap perubahan SV membuat target revision baru dan tidak menimpa histori sebelumnya.", `<div class="table-wrap actual-batch-setpoint-wrap"><table class="data-table"><thead><tr><th>Changed At</th><th>Parameter</th><th>Old SV</th><th>New SV</th><th>Source</th><th>Changed By</th><th>Reason</th></tr></thead><tbody>${rows}</tbody></table></div>`, `<span class="range-badge">${changes.length} CHANGES</span>`);
}

function actualBatchAlarmPanel(context) {
  const alarms = context.alarms || [];
  const deviations = context.deviations || [];
  const linkedAlarmIds = new Set(deviations.map((item) => item.alarm_event_id).filter(Boolean));
  const staticAlarms = alarms.filter((alarm) => !linkedAlarmIds.has(alarm.alarm_event_id));
  const deviationRows = deviations.map((item) => {
    const unit = item.engineering_unit || "";
    const duration = item.duration_seconds == null ? "Active" : `${Math.floor(Number(item.duration_seconds) / 60)}m ${Number(item.duration_seconds) % 60}s`;
    return `<tr class="alarm-condition-row ${String(item.severity).toLowerCase()}">
      <td class="mono">${actualTime(item.started_at)}<small>${actualTime(item.ended_at)}</small></td>
      <td><span class="data-pill ${String(item.severity).toUpperCase() === "CRITICAL" ? "danger" : "warning"}">${actualText(item.severity)}</span></td>
      <td><strong>${actualText(item.event_class)}</strong><small>${actualText(item.step_code || item.step_name || "Continuous target")}</small></td>
      <td><strong>${actualText(item.parameter_code)}</strong><small class="mono">${actualText(item.pv_tag_code)}</small></td>
      <td class="mono">SV ${actualText(Number(item.sv_value).toLocaleString("id-ID", { maximumFractionDigits: 2 }))} ${actualText(unit)}<small>Trigger ${actualText(Number(item.trigger_pv).toLocaleString("id-ID", { maximumFractionDigits: 2 }))} · Worst ${actualText(Number(item.worst_pv).toLocaleString("id-ID", { maximumFractionDigits: 2 }))}</small></td>
      <td class="mono">${actualText(Number(item.max_abs_deviation).toLocaleString("id-ID", { maximumFractionDigits: 2 }))} ${actualText(unit)}<small>${actualText(duration)}</small></td>
      <td><span class="data-pill ${item.event_state === "CLEARED" ? "good" : "warning"}">${actualText(item.event_state)}</span><small>${actualText(item.impact_code)}</small></td>
    </tr>`;
  });
  const alarmRows = staticAlarms.map((alarm) => `<tr><td class="mono">${actualTime(alarm.occurred_at)}<small>${actualTime(alarm.cleared_at)}</small></td><td><span class="data-pill neutral">${actualText(alarm.severity)}</span></td><td><strong>${actualText(alarm.event_class || "STATIC_THRESHOLD")}</strong><small>${actualText(alarm.title)}</small></td><td class="mono">${actualText(alarm.tag_code || "—")}</td><td>${actualText(alarm.trigger_value ?? "—")}<small>Threshold ${actualText(alarm.threshold_value ?? "—")}</small></td><td>—</td><td><span class="data-pill ${alarm.event_state === "CLEARED" ? "good" : "warning"}">${actualText(alarm.event_state)}</span><small>${alarm.batch_no === context.run.batch_no ? "Batch linked" : "Time correlated"}</small></td></tr>`);
  const rows = [...deviationRows, ...alarmRows];
  const content = rows.length ? rows.join("") : `<tr><td colspan="7">${actualEmpty("Tidak ada abnormal event aktual pada interval batch ini.")}</td></tr>`;
  return panel("Batch Abnormality Log", "Process deviation PV/SV dan alarm threshold yang terhubung ke process run.", `<div class="table-wrap actual-batch-alarm-wrap"><table class="data-table"><thead><tr><th>Start / End</th><th>Severity</th><th>Class / Step</th><th>Parameter</th><th>SV / PV</th><th>Deviation / Duration</th><th>Status / Impact</th></tr></thead><tbody>${content}</tbody></table></div>`, `<span class="range-badge">${rows.length} EVENTS</span>`);
}

function actualBatchWorkspace(machine, runs) {
  const run = actualBatchRunFor(machine, runs);
  if (!run) return `<section class="card batch-analysis-empty"><div class="batch-empty-icon">⌕</div><strong>Trend dan detail batch belum dimuat</strong><span>Pilih Load pada recent batch atau cari nomor batch untuk menampilkan parameter setting, telemetry aktual PV/SV, process sequence, dan abnormal log.</span></section>`;
  const context = actualBatchPrograms.get(run.process_run_id);
  if (!context && !actualBatchProgramLoading.has(run.process_run_id)) void loadActualBatchProcessRun(run.process_run_id);
  if (!context) {
    const error = actualBatchProgramErrors.get(run.process_run_id);
    return panel("Batch Investigation", `${actualText(run.batch_no)} · ${actualText(machine.id)}`, error ? actualEmpty(error) : `<div class="actual-historian-loading">Loading batch context…</div>`, `<span class="range-badge">${error ? "ERROR" : "LOADING"}</span>`, "actual-batch-workspace");
  }
  return `<div class="actual-batch-workspace">${actualBatchContextPanel(context)}${actualBatchParameterPanel(context)}${databaseActualHistorianPanel(machine)}${actualBatchProcessPanel(context)}${actualBatchTargetPanel(context)}${actualBatchSetpointChangePanel(context)}${actualBatchAlarmPanel(context)}</div>`;
}

function databaseMachineDetailPage(type) {
  const machineId = state.drill[type].machine || state.selected[type];
  const machine = fleetFor(type).find((item) => item.id === machineId);
  if (!machine) return databaseFleetPage(type);
  const runs = backendProcessRuns.filter((run) => run.asset_id === machine.id);
  const chemicalTransactions = type === "chemical" ? chemicalDispensingLogs.filter((item) => item.dispenser === machine.id) : [];
  return `
    ${processBreadcrumb(type, machine)}
    ${pageHead(type, `<button class="button" data-process-level="area" data-process-type="${type}">← ${actualText(machine.areaLabel || machine.area)}</button>`)}
    ${machineHero(machine, processConfig[type].code, `${actualText(machine.subtype || "—")} · ${actualText(machine.recipe || "No active recipe")}`)}
    ${type === "kalender" ? kalenderPidPanel(machine) : ""}
    ${machinePerformanceSummary(machine, runs)}
    ${panel("Live sensor measurements", "Latest validated measurements", actualSensorValues([machine]))}
    ${actualBatchLookupPanel(machine, runs)}
    ${actualBatchWorkspace(machine, runs)}
    ${databaseEquipmentPanel(machine)}
    ${type === "chemical" ? panel("Chemical transfer log", "Latest dispensing activity", chemicalTransactions.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Request</th><th>Calator</th><th>Variant</th><th>Target</th><th>Actual</th><th>Status</th></tr></thead><tbody>${chemicalTransactions.map((item) => `<tr><td class="mono">${actualText(item.time)}</td><td class="mono">${actualText(item.request)}</td><td>${actualText(item.calator)}</td><td>${actualText(item.variant)}</td><td>${actualText(item.target)}</td><td>${actualText(item.actual)}</td><td>${actualText(item.status)}</td></tr>`).join("")}</tbody></table></div>` : actualEmpty("No chemical transaction data")) : ""}
  `;
}

function databaseProcessPage(type) {
  const drill = state.drill[type];
  if (!drill.area) return databaseFleetPage(type);
  if (!drill.machine) return databaseAreaPage(type);
  return databaseMachineDetailPage(type);
}

function databaseDashboardPage() {
  if (state.page === "overview") return databaseOverviewPage();
  if (state.page === "chemical") return actualChemicalPage();
  if (state.page === "solar") return actualSolarPage();
  if (["jetflow", "calator", "dryer", "kalender"].includes(state.page)) return databaseProcessPage(state.page);
  if (state.page === "utilities") return actualUtilitiesPage();
  if (state.page === "alarms") return actualAlarmsPage();
  if (state.page === "trends") return actualTrendsPage();
  if (state.page === "health") return actualHealthPage();
  return databaseOverviewPage();
}

function actualDataPage() {
  if (state.page === "overview") return actualOverviewPage();
  if (["jetflow", "calator", "dryer", "kalender"].includes(state.page)) return actualProcessPage(state.page);
  if (state.page === "utilities") return actualUtilitiesPage();
  if (state.page === "chemical") return actualChemicalPage();
  if (state.page === "solar") return actualSolarPage();
  if (state.page === "alarms") return actualAlarmsPage();
  if (state.page === "trends") return actualTrendsPage();
  if (state.page === "health") return actualHealthPage();
  return actualOverviewPage();
}

function updateNavigationCounts() {
  const fleets = { jetflow: jetflows, calator: calators, dryer: dryers, kalender: kalenders, chemical: dispensers };
  Object.entries(fleets).forEach(([page, fleet]) => {
    const count = document.querySelector(`.nav-item[data-page="${page}"] .nav-count`);
    if (count) count.textContent = fleet.length;
  });
  setActiveAlarmCount(backendActiveAlarmEvents.length);
}

function setActiveAlarmCount(count) {
  const value = Math.max(0, Number(count) || 0);
  const navCount = document.getElementById("nav-alarm-count");
  const headerCount = document.getElementById("header-alarm-count");
  if (navCount) navCount.textContent = value;
  if (headerCount) headerCount.textContent = value;
  document.getElementById("alarm-shortcut")?.classList.toggle("has-active-alarm", value > 0);
}

function upsertActiveAlarm(alarm) {
  if (!alarm?.alarm_event_id) return;
  const index = backendActiveAlarmEvents.findIndex((item) => String(item.alarm_event_id) === String(alarm.alarm_event_id));
  if (index >= 0) backendActiveAlarmEvents[index] = { ...backendActiveAlarmEvents[index], ...alarm };
  else backendActiveAlarmEvents.unshift(alarm);
}

function removeActiveAlarm(alarmEventId) {
  if (!alarmEventId) return;
  backendActiveAlarmEvents = backendActiveAlarmEvents.filter((item) => String(item.alarm_event_id) !== String(alarmEventId));
  if (String(alarmPopupUi.selectedAlarmId) === String(alarmEventId)) alarmPopupUi.selectedAlarmId = null;
}

function openActiveAlarmPage() {
  state.alarms.area = "all";
  navigate("alarms");
  window.requestAnimationFrame(() => document.getElementById("active-alarm-conditions")?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function renderPage({ preserveScroll = false, preserveAnchor = null } = {}) {
  deferredRealtimeRender = false;
  realtimeUiRefresh.pending = false;
  if (realtimeUiRefresh.timer) {
    clearTimeout(realtimeUiRefresh.timer);
    realtimeUiRefresh.timer = null;
  }
  const previousScroll = Number.isFinite(window.scrollY) ? window.scrollY : 0;
  const anchorViewportTop = preserveAnchor ? document.querySelector(preserveAnchor)?.getBoundingClientRect().top : null;
  const content = document.getElementById("page-content");
  const hasActualAssets = actualFleet().length > 0;
  if (backendConnection.status === "connected" && processNavigationPages.includes(state.page)) {
    const fleet = fleetFor(state.page);
    const drill = state.drill[state.page];
    if (drill?.machine && !fleet.some((machine) => machine.id === drill.machine)) drill.machine = null;
    if (drill?.area && !fleet.some((machine) => machine.area === drill.area)) drill.area = null;
    if (state.selected[state.page] && !fleet.some((machine) => machine.id === state.selected[state.page])) state.selected[state.page] = fleet[0]?.id || null;
  }
  persistDashboardNavigation();
  content.innerHTML = (backendConnection.status !== "connected" || !hasActualAssets)
    ? databaseIntegrationPage()
    : databaseDashboardPage();
  document.getElementById("breadcrumb-page").textContent = pageMeta[state.page][0];
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.page === state.page));
  bindPageEvents();
  if (backendConnection.status === "connected" && state.page === "overview") void loadProductionOutputByBatch();
  const nextAnchor = preserveAnchor ? document.querySelector(preserveAnchor) : null;
  if (nextAnchor && Number.isFinite(anchorViewportTop)) {
    const anchorDocumentTop = nextAnchor.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, anchorDocumentTop - anchorViewportTop), behavior: "auto" });
  } else {
    window.scrollTo({ top: preserveScroll ? previousScroll : 0, behavior: preserveScroll ? "auto" : "smooth" });
  }
  requestAnimationFrame(() => {
    initPageCharts();
    void activatePidBindingForCurrentView();
  });
}

function loadChemicalTransactionPage() {
  const transactionPanel = document.querySelector(".chemical-transaction-panel");
  transactionPanel?.setAttribute("aria-busy", "true");
  transactionPanel?.querySelectorAll("[data-chemical-page], [data-chemical-page-size]").forEach((control) => {
    control.disabled = true;
  });
  requestChemicalAnalytics({ preserveAnchor: ".chemical-transaction-panel" });
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

async function loadActualBatchProcessRun(processRunId) {
  if (!processRunId || actualBatchPrograms.has(processRunId) || actualBatchProgramLoading.has(processRunId)) return;
  actualBatchProgramLoading.add(processRunId);
  actualBatchProgramErrors.delete(processRunId);
  try {
    const response = await fetch(`/api/v1/batch/process-runs/${encodeURIComponent(processRunId)}/context`, { cache: "no-store" });
    if (!response.ok) throw new Error(response.status === 404 ? "Batch process run tidak ditemukan." : "Batch context API belum tersedia.");
    actualBatchPrograms.set(processRunId, await response.json());
  } catch (error) {
    actualBatchProgramErrors.set(processRunId, error instanceof Error ? error.message : "Batch context unavailable");
  } finally {
    actualBatchProgramLoading.delete(processRunId);
    renderPage({ preserveScroll: true });
  }
}

async function searchActualBatchProcessRun(machineId, batch) {
  try {
    const url = new URL("/api/v1/batch/lookup", window.location.origin);
    url.searchParams.set("asset_id", machineId);
    url.searchParams.set("batch_no", batch);
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json();
    if (payload.run && !backendProcessRuns.some((run) => run.process_run_id === payload.run.process_run_id)) backendProcessRuns.unshift(payload.run);
    return payload.run || null;
  } catch {
    return null;
  }
}

function trackDatabaseProcessRun(processRunId) {
  const run = backendProcessRuns.find((item) => item.process_run_id === processRunId);
  if (!run) return;
  const startedAt = new Date(run.started_at).getTime();
  const endedAt = new Date(run.ended_at || Date.now()).getTime();
  if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt) || startedAt >= endedAt) {
    showToast("Batch range unavailable", `${run.batch_no} belum memiliki start/end time yang valid.`);
    return;
  }
  state.batchInvestigation[run.process_type] = { machineId: run.asset_id, batch: run.batch_no, processRunId: run.process_run_id };
  state.machineSummary.scope = "batch";
  state.history.preset = "CUSTOM";
  state.history.start = startedAt;
  state.history.end = endedAt;
  actualHistorian.range = "CUSTOM";
  actualHistorian.viewStart = 0;
  actualHistorian.viewFraction = 1;
  actualHistorian.cache.delete(actualHistorianKey(run.asset_id));
  void loadActualBatchProcessRun(run.process_run_id);
  showToast("Batch loaded", `${run.batch_no} · ${formatDateTime(startedAt, true)} — ${formatDateTime(endedAt, true)}`);
  renderPage({ preserveScroll: true });
}

async function exportActualBatchProcessRun(processRunId, format, button) {
  if (!processRunId || !["pdf", "xlsx"].includes(format)) return;
  const originalLabel = button?.textContent || "Export";
  if (button) {
    button.disabled = true;
    button.textContent = "Preparing…";
    button.setAttribute("aria-busy", "true");
  }
  try {
    const endpoint = `/api/v1/batch/process-runs/${encodeURIComponent(processRunId)}/export?format=${encodeURIComponent(format)}`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || "Batch export gagal dibuat.");
    }
    const disposition = response.headers.get("content-disposition") || "";
    const headerFilename = disposition.match(/filename="?([^";]+)"?/i)?.[1];
    const fallbackRun = backendProcessRuns.find((run) => run.process_run_id === processRunId);
    const fallbackFilename = `${fallbackRun?.batch_no || "batch"}-process-detail.${format}`;
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = headerFilename || fallbackFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    showToast("Batch export ready", `${fallbackRun?.batch_no || "Batch"} berhasil diekspor ke ${format === "pdf" ? "PDF" : "Excel"}.`);
  } catch (error) {
    showToast("Export failed", error instanceof Error ? error.message : "Batch export gagal dibuat.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalLabel;
      button.removeAttribute("aria-busy");
    }
  }
}

function bindPageEvents() {
  document.querySelectorAll("[data-solar-tab]").forEach((button) => button.addEventListener("click", () => {
    state.solar.tab = button.dataset.solarTab;
    renderPage({ preserveScroll: true });
  }));
  document.querySelectorAll("[data-solar-range]").forEach((button) => button.addEventListener("click", () => {
    state.solar.range = button.dataset.solarRange;
    state.solar.page = 1;
    invalidateSolarFueling();
    if (state.solar.range === "CUSTOM") renderPage({ preserveScroll: true });
    else void loadSolarFueling({ force: true });
  }));
  document.querySelectorAll("[data-solar-date]").forEach((input) => input.addEventListener("change", () => {
    const timestamp = new Date(input.value).getTime();
    if (Number.isFinite(timestamp)) state.solar[input.dataset.solarDate === "from" ? "customFrom" : "customTo"] = timestamp;
  }));
  document.querySelector("[data-solar-apply-range]")?.addEventListener("click", () => {
    if (state.solar.customFrom > state.solar.customTo) [state.solar.customFrom,state.solar.customTo] = [state.solar.customTo,state.solar.customFrom];
    state.solar.page = 1; invalidateSolarFueling(); void loadSolarFueling({ force: true });
  });
  document.querySelector("[data-solar-search-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.solar.search = String(form.get("search") || "").trim();
    state.solar.status = String(form.get("status") || "all");
    state.solar.page = 1; invalidateSolarFueling(); void loadSolarFueling({ force: true });
  });
  document.querySelectorAll("[data-solar-page]").forEach((button) => button.addEventListener("click", () => {
    if (button.disabled) return;
    const total = solarFueling.data?.transactions?.pagination?.total_pages || 1;
    state.solar.page = button.dataset.solarPage === "prev" ? Math.max(1,state.solar.page-1) : Math.min(total,state.solar.page+1);
    invalidateSolarFueling(); void loadSolarFueling({ force: true });
  }));
  document.querySelector("[data-solar-movement-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault(); const button = event.currentTarget.querySelector("button[type='submit']"); button.disabled = true;
    try { const values = Object.fromEntries(new FormData(event.currentTarget)); await submitSolarJson("/api/v1/solar/stock/movements", "POST", values); showToast("Stock movement saved", `${values.direction} ${values.quantity_liters} liter berhasil dicatat.`); }
    catch (error) { showToast("Stock movement failed", error instanceof Error ? error.message : "Data gagal disimpan."); }
    finally { button.disabled = false; }
  });
  document.querySelector("[data-solar-opname-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault(); const button = event.currentTarget.querySelector("button[type='submit']"); button.disabled = true;
    try { const values = Object.fromEntries(new FormData(event.currentTarget)); await submitSolarJson("/api/v1/solar/stock-opnames", "POST", { ...values, cutoff_at: new Date().toISOString() }); showToast("Stock opname recorded", "Perbandingan stok sistem dan stok fisik sudah dihitung."); }
    catch (error) { showToast("Stock opname failed", error instanceof Error ? error.message : "Data gagal disimpan."); }
    finally { button.disabled = false; }
  });
  document.querySelectorAll("[data-solar-opname-action]").forEach((button) => button.addEventListener("click", async () => {
    button.disabled = true;
    try { await submitSolarJson(`/api/v1/solar/stock-opnames/${encodeURIComponent(button.dataset.solarOpnameId)}`, "PATCH", { action: button.dataset.solarOpnameAction }); showToast("Stock opname updated", `Status berhasil diproses: ${button.dataset.solarOpnameAction}.`); }
    catch (error) { showToast("Approval failed", error instanceof Error ? error.message : "Status gagal diperbarui."); }
    finally { button.disabled = false; }
  }));
  document.querySelectorAll("[data-pid-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const panelType = button.dataset.pidToggle;
      if (!(panelType in state.pidPanel)) return;
      const isCollapsed = !state.pidPanel[panelType];
      state.pidPanel[panelType] = isCollapsed;
      persistDashboardNavigation();
      const card = button.closest("[data-pid-panel]");
      const body = card?.querySelector(".kalender-pid-body");
      card?.classList.toggle("is-collapsed", isCollapsed);
      button.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
      const label = button.querySelector("span");
      if (label) label.textContent = isCollapsed ? "Expand P&ID" : "Minimize P&ID";
      if (body) {
        if (isCollapsed) body.setAttribute("aria-hidden", "true");
        else body.removeAttribute("aria-hidden");
      }
    });
  });
  document.querySelectorAll("[data-chemical-unit]").forEach((card) => {
    const openUnit = () => {
      const machine = dispensers.find((item) => item.id === card.dataset.chemicalUnit);
      if (!machine) return;
      state.selected.chemical = machine.id;
      state.drill.chemical = { area: machine.area, machine: machine.id };
      state.chemicalLog.page = 1;
      invalidateChemicalAnalytics();
      renderPage();
    };
    card.addEventListener("click", openUnit);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openUnit();
      }
    });
  });
  document.querySelectorAll("[data-chemical-view='overview']").forEach((button) => {
    button.addEventListener("click", () => {
      state.drill.chemical = { area: null, machine: null };
      state.chemicalLog.page = 1;
      invalidateChemicalAnalytics();
      renderPage();
    });
  });
  document.querySelectorAll("[data-chemical-analytics-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      const key = select.dataset.chemicalAnalyticsFilter;
      state.chemicalLog[key] = select.value;
      if (key === "range" && select.value !== "CUSTOM") state.chemicalLog.anchorEnd = Date.now();
      state.chemicalLog.page = 1;
      invalidateChemicalAnalytics();
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-chemical-analytics-date]").forEach((input) => {
    input.addEventListener("change", () => {
      const value = new Date(input.value).getTime();
      if (Number.isFinite(value)) state.chemicalLog[input.dataset.chemicalAnalyticsDate === "start" ? "customStart" : "customEnd"] = value;
    });
  });
  document.querySelector("[data-chemical-analytics-apply]")?.addEventListener("click", () => {
    if (state.chemicalLog.customEnd < state.chemicalLog.customStart) [state.chemicalLog.customStart, state.chemicalLog.customEnd] = [state.chemicalLog.customEnd, state.chemicalLog.customStart];
    state.chemicalLog.page = 1;
    invalidateChemicalAnalytics();
    renderPage({ preserveScroll: true });
  });
  document.querySelectorAll("[data-chemical-chart-code]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const code = checkbox.dataset.chemicalChartCode;
      const hidden = new Set(state.chemicalLog.chartHidden);
      if (checkbox.checked) hidden.delete(code);
      else hidden.add(code);
      state.chemicalLog.chartHidden = [...hidden];
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-chemical-chart-bulk]").forEach((button) => {
    button.addEventListener("click", () => {
      const codes = chemicalAnalytics.data?.available_chemicals?.map((item) => item.chemical_code) || [];
      state.chemicalLog.chartHidden = button.dataset.chemicalChartBulk === "hide" ? codes : [];
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelector("[data-chemical-page-size]")?.addEventListener("change", (event) => {
    state.chemicalLog.pageSize = Number(event.target.value) || 25;
    state.chemicalLog.page = 1;
    invalidateChemicalAnalytics();
    loadChemicalTransactionPage();
  });
  document.querySelectorAll("[data-chemical-page]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      const totalPages = chemicalAnalytics.data?.pagination?.total_pages || 1;
      state.chemicalLog.page = button.dataset.chemicalPage === "prev" ? Math.max(1, state.chemicalLog.page - 1) : Math.min(totalPages, state.chemicalLog.page + 1);
      invalidateChemicalAnalytics();
      loadChemicalTransactionPage();
    });
  });
  document.querySelectorAll("[data-actual-trend-range]").forEach((button) => {
    button.addEventListener("click", () => {
      actualHistorian.range = button.dataset.actualTrendRange;
      actualHistorian.viewStart = 0;
      actualHistorian.viewFraction = 1;
      if (actualHistorian.range !== "CUSTOM") {
        const range = actualHistorianRange();
        state.history.start = range.from.getTime();
        state.history.end = range.to.getTime();
      }
      renderPage({ preserveScroll: true });
    });
  });
  const releaseDeferredHistorianRender = (select) => {
    if (select.dataset.deferredRenderBound) return;
    select.dataset.deferredRenderBound = "true";
    select.addEventListener("blur", () => {
      window.setTimeout(() => {
        if (!deferredRealtimeRender) return;
        scheduleSafeRealtimeRender();
      }, 0);
    });
  };
  document.querySelectorAll("select, input, textarea").forEach(releaseDeferredHistorianRender);
  document.querySelectorAll("[data-actual-trend-parameter]").forEach((select) => {
    select.addEventListener("change", () => {
      rememberActualParameter(select.dataset.actualTrendParameter, select.value);
      deferredRealtimeRender = false;
      renderPage({ preserveScroll: true });
    });
    releaseDeferredHistorianRender(select);
  });
  document.querySelectorAll("[data-actual-motor-select]").forEach((select) => {
    select.addEventListener("change", () => {
      actualHistorian.selectedEquipment.set(select.dataset.actualMotorSelect, select.value);
      deferredRealtimeRender = false;
      renderPage({ preserveScroll: true });
    });
    releaseDeferredHistorianRender(select);
  });
  document.querySelector("[data-history-explorer-asset]")?.addEventListener("change", (event) => {
    actualHistorian.explorerAssetId = event.target.value;
    actualHistorian.viewStart = 0;
    actualHistorian.viewFraction = 1;
    deferredRealtimeRender = false;
    renderPage({ preserveScroll: true });
  });
  const explorerAssetSelect = document.querySelector("[data-history-explorer-asset]");
  if (explorerAssetSelect) releaseDeferredHistorianRender(explorerAssetSelect);
  document.querySelector("[data-history-explorer-parameter]")?.addEventListener("change", (event) => {
    rememberActualParameter(event.target.dataset.historyExplorerParameter, event.target.value);
    actualHistorian.viewStart = 0;
    actualHistorian.viewFraction = 1;
    deferredRealtimeRender = false;
    renderPage({ preserveScroll: true });
  });
  const explorerParameterSelect = document.querySelector("[data-history-explorer-parameter]");
  if (explorerParameterSelect) releaseDeferredHistorianRender(explorerParameterSelect);
  document.querySelectorAll("[data-actual-history-date]").forEach((input) => {
    const rememberDateValue = () => {
      const value = new Date(input.value).getTime();
      if (!Number.isFinite(value)) return;
      state.history[input.dataset.actualHistoryDate === "start" ? "start" : "end"] = value;
    };
    input.addEventListener("input", rememberDateValue);
    input.addEventListener("change", rememberDateValue);
    input.addEventListener("blur", rememberDateValue);
  });
  document.querySelector("[data-actual-history-apply]")?.addEventListener("click", (event) => {
    const start = new Date(document.querySelector('[data-actual-history-date="start"]')?.value || "").getTime();
    const end = new Date(document.querySelector('[data-actual-history-date="end"]')?.value || "").getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
      showToast("Invalid time range", "Start time harus lebih awal dari end time.");
      return;
    }
    state.history.start = start;
    state.history.end = end;
    actualHistorian.viewStart = 0;
    actualHistorian.viewFraction = 1;
    actualHistorian.cache.delete(actualHistorianKey(event.currentTarget.dataset.actualHistoryApply || actualHistorian.explorerAssetId));
    renderPage({ preserveScroll: true });
  });
  document.querySelectorAll("[data-actual-history-shift]").forEach((button) => button.addEventListener("click", () => shiftActualHistoryView(button.dataset.actualHistoryShift === "back" ? -0.12 : 0.12)));
  document.querySelectorAll("[data-actual-history-zoom]").forEach((button) => button.addEventListener("click", () => zoomActualHistoryView(button.dataset.actualHistoryZoom === "in" ? 0.62 : 1.5)));
  document.querySelector("[data-actual-history-fit]")?.addEventListener("click", () => {
    actualHistorian.viewStart = 0;
    actualHistorian.viewFraction = 1;
    drawActualHistoryExplorer();
  });
  bindActualHistoryExplorerPan();
  document.querySelectorAll("[data-actual-power-area]").forEach((element) => {
    const selectArea = () => {
      state.utility.selectedPowerArea = element.dataset.actualPowerArea;
      renderPage({ preserveScroll: true });
    };
    element.addEventListener("click", selectArea);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectArea(); }
    });
  });
  // Machine Table Controls
  document.querySelectorAll("[data-mt-process]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.machineTable.process = btn.dataset.mtProcess;
      state.machineTable.area = "all";
      state.machineTable.page = 1;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-mt-area]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.machineTable.area = btn.dataset.mtArea;
      state.machineTable.page = 1;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-mt-status]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.machineTable.status = btn.dataset.mtStatus;
      state.machineTable.page = 1;
      renderPage({ preserveScroll: true });
    });
  });

  const searchInput = document.querySelector("[data-mt-search]");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.machineTable.search = e.target.value;
      state.machineTable.page = 1;
      renderPage({ preserveScroll: true });
      const newInput = document.querySelector("[data-mt-search]");
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(newInput.value.length, newInput.value.length);
      }
    });
  }

  document.querySelector("[data-mt-clear-search]")?.addEventListener("click", () => {
    state.machineTable.search = "";
    state.machineTable.page = 1;
    renderPage({ preserveScroll: true });
  });

  document.querySelectorAll("[data-mt-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.mtPage;
      if (action === "first") state.machineTable.page = 1;
      else if (action === "prev") state.machineTable.page = Math.max(1, state.machineTable.page - 1);
      else if (action === "next") state.machineTable.page = state.machineTable.page + 1;
      else if (action === "last") state.machineTable.page = 9999;
      else if (!isNaN(Number(action))) state.machineTable.page = Number(action);
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-machine-row]").forEach((row) => {
    const openMachine = () => {
      const [type, machineId] = row.dataset.machineRow.split("|");
      if (type && machineId) openMachineDetail(type, machineId);
    };
    row.addEventListener("click", openMachine);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMachine();
      }
    });
  });
  document.querySelectorAll("[data-machine-summary-scope]").forEach((button) => {
    button.addEventListener("click", () => {
      state.machineSummary.scope = button.dataset.machineSummaryScope;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-machine-summary-date]").forEach((input) => {
    input.addEventListener("change", () => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input.value)) return;
      state.machineSummary.productionDate = input.value;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-machine-summary-shift]").forEach((select) => {
    select.addEventListener("change", () => {
      if (!["A", "B", "C"].includes(select.value)) return;
      state.machineSummary.shiftCode = select.value;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-actual-batch-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const machineId = form.dataset.actualBatchForm;
      const batch = normalizeBatchNumber(form.querySelector("[data-actual-batch-input]")?.value);
      if (!batch) {
        showToast("Batch number required", "Masukkan nomor batch yang akan dimuat.");
        form.querySelector("[data-actual-batch-input]")?.focus();
        return;
      }
      const submit = form.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;
      const run = backendProcessRuns.find((item) => item.asset_id === machineId && String(item.batch_no).toUpperCase() === batch)
        || await searchActualBatchProcessRun(machineId, batch);
      if (submit) submit.disabled = false;
      if (!run) {
        showToast("Batch tidak ditemukan", `${batch} tidak terdaftar untuk ${machineId}.`);
        form.querySelector("[data-actual-batch-input]")?.focus();
        return;
      }
      trackDatabaseProcessRun(run.process_run_id);
    });
  });
  document.querySelectorAll("[data-actual-batch-clear]").forEach((button) => {
    button.addEventListener("click", () => {
      state.batchInvestigation[button.dataset.actualBatchClear] = { machineId: null, batch: null };
      if (state.machineSummary.scope === "batch") state.machineSummary.scope = "shift";
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-track-process-run]").forEach((button) => {
    button.addEventListener("click", () => trackDatabaseProcessRun(button.dataset.trackProcessRun));
  });
  document.querySelectorAll("[data-actual-batch-export]").forEach((button) => {
    button.addEventListener("click", () => void exportActualBatchProcessRun(button.dataset.actualBatchExport, button.dataset.exportFormat, button));
  });

  // Historical Telemetry Table Controls
  document.querySelectorAll("[data-ht-process]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.historyTable.process = btn.dataset.htProcess;
      state.historyTable.area = "all";
      state.historyTable.assetId = "all";
      state.historyTable.page = 1;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-ht-area]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.historyTable.area = btn.dataset.htArea;
      state.historyTable.assetId = "all";
      state.historyTable.page = 1;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelector("[data-ht-asset-select]")?.addEventListener("change", (e) => {
    state.historyTable.assetId = e.target.value;
    state.historyTable.page = 1;
    renderPage({ preserveScroll: true });
  });

  document.querySelector("[data-ht-role-select]")?.addEventListener("change", (e) => {
    state.historyTable.role = e.target.value;
    state.historyTable.page = 1;
    renderPage({ preserveScroll: true });
  });

  document.querySelector("[data-ht-pagesize-select]")?.addEventListener("change", (e) => {
    state.historyTable.pageSize = Number(e.target.value) || 15;
    state.historyTable.page = 1;
    renderPage({ preserveScroll: true });
  });

  const htSearchInput = document.querySelector("[data-ht-search]");
  if (htSearchInput) {
    htSearchInput.addEventListener("input", (e) => {
      state.historyTable.search = e.target.value;
      state.historyTable.page = 1;
      renderPage({ preserveScroll: true });
      const newInput = document.querySelector("[data-ht-search]");
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(newInput.value.length, newInput.value.length);
      }
    });
  }

  document.querySelector("[data-ht-clear-search]")?.addEventListener("click", () => {
    state.historyTable.search = "";
    state.historyTable.page = 1;
    renderPage({ preserveScroll: true });
  });

  document.querySelectorAll("[data-ht-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.htPage;
      if (action === "first") state.historyTable.page = 1;
      else if (action === "prev") state.historyTable.page = Math.max(1, state.historyTable.page - 1);
      else if (action === "next") state.historyTable.page = state.historyTable.page + 1;
      else if (action === "last") state.historyTable.page = 9999;
      else if (!isNaN(Number(action))) state.historyTable.page = Number(action);
      renderPage({ preserveScroll: true });
    });
  });

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
      openMachineDetail(type, machine);
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
      openMachineDetail(type, machineId);
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
  document.querySelector("[data-alarm-config-jump]")?.addEventListener("click", () => document.getElementById("alarm-rule-configuration")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  document.querySelectorAll("[data-open-active-alarms]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openActiveAlarmPage();
    });
  });
  const alarmRuleForm = document.querySelector("[data-alarm-rule-form]");
  alarmRuleForm?.addEventListener("input", () => captureAlarmRuleDraft(alarmRuleForm));
  alarmRuleForm?.addEventListener("change", () => captureAlarmRuleDraft(alarmRuleForm));
  alarmRuleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveAlarmRule(event.currentTarget);
  });
  document.querySelector("[data-alarm-rule-asset]")?.addEventListener("change", (event) => {
    event.stopPropagation();
    captureAlarmRuleDraft(alarmRuleForm);
    state.alarmConfig.assetId = event.target.value;
    state.alarmConfig.tagCode = null;
    state.alarmConfig.draft = { ...state.alarmConfig.draft, asset_id: event.target.value, tag_code: null };
    void requestAlarmTags(event.target.value);
    renderPage({ preserveScroll: true });
  });
  document.querySelector("[data-alarm-rule-tag]")?.addEventListener("change", (event) => {
    state.alarmConfig.tagCode = event.target.value;
    state.alarmConfig.draft = { ...state.alarmConfig.draft, tag_code: event.target.value };
  });
  document.querySelector("[data-alarm-rule-cancel]")?.addEventListener("click", () => {
    state.alarmConfig.editingRuleId = null;
    state.alarmConfig.draft = {};
    renderPage({ preserveScroll: true });
  });
  document.querySelectorAll("[data-alarm-rule-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const rule = alarmConfiguration.rules.find((item) => item.rule_id === button.dataset.alarmRuleEdit);
      if (!rule) return;
      state.alarmConfig.editingRuleId = rule.rule_id;
      state.alarmConfig.assetId = rule.asset_id;
      state.alarmConfig.tagCode = rule.tag_code;
      state.alarmConfig.draft = {
        rule_name: rule.rule_name,
        asset_id: rule.asset_id,
        tag_code: rule.tag_code,
        rule_type: rule.rule_type,
        severity: rule.severity,
        threshold_value: String(rule.threshold_value),
        hysteresis_value: String(rule.hysteresis_value),
        delay_seconds: String(rule.delay_seconds),
        alarm_message: rule.alarm_message || "",
        recommendation: rule.recommendation || "",
        enabled: Boolean(rule.enabled),
      };
      void requestAlarmTags(rule.asset_id);
      renderPage({ preserveScroll: true });
      document.getElementById("alarm-rule-configuration")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  document.querySelectorAll("[data-alarm-rule-toggle]").forEach((button) => {
    button.addEventListener("click", () => void toggleAlarmRule(button.dataset.alarmRuleToggle, button.dataset.ruleEnabled !== "true"));
  });
  const deviationRuleForm = document.querySelector("[data-deviation-rule-form]");
  deviationRuleForm?.addEventListener("input", () => captureDeviationRuleDraft(deviationRuleForm));
  deviationRuleForm?.addEventListener("change", () => captureDeviationRuleDraft(deviationRuleForm));
  deviationRuleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveDeviationRule(event.currentTarget);
  });
  document.querySelector("[data-deviation-rule-asset]")?.addEventListener("change", (event) => {
    captureDeviationRuleDraft(deviationRuleForm);
    state.alarmConfig.deviationAssetId = event.target.value;
    state.alarmConfig.deviationPvTagCode = null;
    state.alarmConfig.deviationSvTagCode = null;
    state.alarmConfig.deviationDraft = { ...state.alarmConfig.deviationDraft, asset_id: event.target.value, pv_tag_code: null, sv_tag_code: null };
    void requestAlarmTags(event.target.value);
    renderPage({ preserveScroll: true });
  });
  document.querySelector("[data-deviation-pv-tag]")?.addEventListener("change", (event) => {
    state.alarmConfig.deviationPvTagCode = event.target.value;
    state.alarmConfig.deviationDraft = { ...state.alarmConfig.deviationDraft, pv_tag_code: event.target.value };
  });
  document.querySelector("[data-deviation-sv-tag]")?.addEventListener("change", (event) => {
    state.alarmConfig.deviationSvTagCode = event.target.value;
    state.alarmConfig.deviationDraft = { ...state.alarmConfig.deviationDraft, sv_tag_code: event.target.value };
  });
  document.querySelector("[data-deviation-rule-cancel]")?.addEventListener("click", () => {
    state.alarmConfig.editingDeviationRuleId = null;
    state.alarmConfig.deviationDraft = {};
    renderPage({ preserveScroll: true });
  });
  document.querySelectorAll("[data-deviation-rule-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const rule = alarmConfiguration.deviationRules.find((item) => item.rule_id === button.dataset.deviationRuleEdit);
      if (!rule) return;
      state.alarmConfig.editingDeviationRuleId = rule.rule_id;
      state.alarmConfig.deviationAssetId = rule.asset_id;
      state.alarmConfig.deviationPvTagCode = rule.pv_tag_code;
      state.alarmConfig.deviationSvTagCode = rule.sv_tag_code;
      state.alarmConfig.deviationDraft = {
        ...rule,
        expected_reach_time_seconds: rule.expected_reach_time_seconds ?? "",
      };
      void requestAlarmTags(rule.asset_id);
      renderPage({ preserveScroll: true });
      document.getElementById("process-deviation-configuration")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  document.querySelectorAll("[data-deviation-rule-toggle]").forEach((button) => {
    button.addEventListener("click", () => void toggleDeviationRule(button.dataset.deviationRuleToggle, button.dataset.ruleEnabled !== "true"));
  });
  document.querySelectorAll("[data-alarm-event-ack]").forEach((button) => {
    button.addEventListener("click", () => void acknowledgeActualAlarm(button.dataset.alarmEventAck));
  });
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
      openMachineDetail(type, machineId);
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
  if (page === "solar") void loadSolarFueling();
  closeSidebar();
}

function openMachineDetail(type, machineId) {
  const machine = fleetFor(type).find((item) => item.id === machineId);
  if (!machine || !state.drill[type]) return;
  state.page = type;
  state.selected[type] = machineId;
  state.drill[type] = { area: machine.area || null, machine: machineId };
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
  if (backendConnection.status === "connected") {
    setActiveAlarmCount(backendActiveAlarmEvents.length);
    return;
  }
  const count = alarms.filter((a) => !a.ack).length;
  setActiveAlarmCount(count);
}

function showToast(title, detail) {
  const root = document.getElementById("toast-root");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong>${detail}`;
  root.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function alarmPopupId(alarm) {
  return String(alarm?.alarm_event_id || `${alarm?.asset_id || "asset"}-${alarm?.rule_id || alarm?.title || "alarm"}`);
}

function activeAlarmCarouselItems() {
  const priority = { critical: 0, warning: 1, info: 2 };
  return backendActiveAlarmEvents
    .filter((alarm) => alarm.event_state !== "CLEARED")
    .slice()
    .sort((left, right) => {
      const severityOrder = (priority[String(left.severity || "warning").toLowerCase()] ?? 3) - (priority[String(right.severity || "warning").toLowerCase()] ?? 3);
      return severityOrder || new Date(right.occurred_at || 0) - new Date(left.occurred_at || 0);
    });
}

function openAlarmMachineDetail(alarm) {
  const machine = actualFleet().find((item) => item.id === alarm?.asset_id);
  if (machine) {
    openMachineDetail(machine.process, machine.id);
    return;
  }
  showToast("Machine mapping unavailable", `${alarm?.asset_id || "Alarm"} belum terhubung ke master asset dashboard.`);
  openActiveAlarmPage();
}

function shiftActiveAlarmCarousel(direction) {
  const alarms = activeAlarmCarouselItems();
  if (alarms.length < 2) return;
  const currentIndex = Math.max(0, alarms.findIndex((alarm) => alarmPopupId(alarm) === String(alarmPopupUi.selectedAlarmId)));
  const nextIndex = (currentIndex + direction + alarms.length) % alarms.length;
  alarmPopupUi.selectedAlarmId = alarmPopupId(alarms[nextIndex]);
  renderActiveAlarmCarousel();
}

function renderActiveAlarmCarousel(preferredAlarmId = null) {
  const root = document.getElementById("alarm-popup-root");
  if (!root) return;
  const alarms = activeAlarmCarouselItems();
  if (!alarms.length) {
    root.replaceChildren();
    alarmPopupUi.selectedAlarmId = null;
    return;
  }
  if (preferredAlarmId && alarms.some((alarm) => alarmPopupId(alarm) === String(preferredAlarmId))) alarmPopupUi.selectedAlarmId = String(preferredAlarmId);
  let currentIndex = alarms.findIndex((alarm) => alarmPopupId(alarm) === String(alarmPopupUi.selectedAlarmId));
  if (currentIndex < 0) currentIndex = 0;
  const alarm = alarms[currentIndex];
  alarmPopupUi.selectedAlarmId = alarmPopupId(alarm);
  const severity = String(alarm.severity || "WARNING").toLowerCase();
  const severityLabel = severity.toUpperCase();
  root.innerHTML = `<div class="alarm-header-carousel ${actualText(severity)}" role="${severity === "critical" ? "alert" : "status"}">
    <button class="alarm-carousel-main" type="button" data-alarm-carousel-detail title="Open machine ${actualText(alarm.asset_id)}">
      <span class="alarm-carousel-severity">${actualText(severityLabel.slice(0, 1))}</span>
      <span class="alarm-carousel-copy"><small>${actualText(severityLabel)} · ACTIVE</small><strong><b>${actualText(alarm.asset_id || "UNMAPPED")}</b><em>${actualText(alarm.title || "Process alarm")}</em></strong></span>
    </button>
    <span class="alarm-carousel-index">${currentIndex + 1}/${alarms.length}</span>
    <div class="alarm-carousel-navigation" aria-label="Alarm navigation">
      <button type="button" data-alarm-carousel-prev aria-label="Previous active alarm" ${alarms.length < 2 ? "disabled" : ""}>‹</button>
      <button type="button" data-alarm-carousel-next aria-label="Next active alarm" ${alarms.length < 2 ? "disabled" : ""}>›</button>
    </div>
  </div>`;
  root.querySelector("[data-alarm-carousel-detail]")?.addEventListener("click", () => openAlarmMachineDetail(alarm));
  root.querySelector("[data-alarm-carousel-prev]")?.addEventListener("click", () => shiftActiveAlarmCarousel(-1));
  root.querySelector("[data-alarm-carousel-next]")?.addEventListener("click", () => shiftActiveAlarmCarousel(1));
  let touchStartX = null;
  root.ontouchstart = (event) => { touchStartX = event.touches[0]?.clientX ?? null; };
  root.ontouchend = (event) => {
    if (touchStartX == null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    if (Math.abs(delta) > 34) shiftActiveAlarmCarousel(delta < 0 ? 1 : -1);
    touchStartX = null;
  };
}

function syncActiveAlarmPopups() {
  renderActiveAlarmCarousel();
}

function showAlarmPopup(alarm) {
  renderActiveAlarmCarousel(alarmPopupId(alarm));
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
    chemical: drawChemicalConsumptionTrend,
    alarms: () => drawBarChart("alarm-chart", [18, 12, 9, 7, 5, 4], ["Tangle", "Temp", "Speed", "Steam", "Data", "Drive"], ["#d9485c", "#d68b05", "#d68b05", "#d68b05", "#8b999f", "#8b999f"]),
    trends: drawHistoricalTrend,
    health: () => drawLineChart("health-chart", [
      { data: wave(32, 46, 2.2, .06, .2), color: "#078eaa", fill: true },
      { data: wave(32, 23, 3.4, .02, 1.8), color: "#119b70" },
    ], labels),
  };
  charts[state.page]?.();
  if (backendConnection.status === "connected" && backendConnection.dataMode === "ACTUAL_DATABASE" && state.page === "overview") {
    const data = productionOutputByBatch.key === productionOutputRequestKey() ? productionOutputByBatch.data : null;
    const processTotals = (data?.process_totals || []).map((item) => ({ ...item, value: productionProcessOutputValue(item) }));
    if (processTotals.some((item) => item.value > 0)) {
      drawBarChart(
        "production-output-process-chart",
        processTotals.map((item) => item.value),
        processTotals.map((item) => processConfig[item.process_type].singular),
        processTotals.map((_, index) => managementColors[index % managementColors.length]),
        { showValues: true, standard: true, unit: data.unit || "m" },
      );
    }
  }
  if (state.drill[state.page]?.machine && sensorTrendConfig[state.page]) drawSensorComparisonTrends(state.page);
  if (state.motorDrive.selected && state.motorDrive.source === state.page) {
    drawMotorDriveTrend();
    bindMotorDrivePan();
  }
  drawActualMachineHistorian();
  drawActualHistoryExplorer();
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
      { data: series.pv, color: sensor.color, fill: true, label: "PV · Process Value", unit: sensor.unit },
      { data: series.sv, color: sensor.color, dash: true, label: "SV · Set Value", unit: sensor.unit },
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
  drawLineChart("motor-drive-trend", [{ data: values, color: trend.color, fill: true, label: trend.label, unit: trend.unit }], timestamps, {
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

function trendTooltipTimeLabel(value, index, labels, options) {
  if (options.tooltipTimeFormatter) return options.tooltipTimeFormatter(value, index, labels);
  const timestamp = value instanceof Date
    ? value.getTime()
    : typeof value === "number" && value > 100000000000
      ? value
      : typeof value === "string" && /[-T:/]/.test(value)
        ? Date.parse(value)
        : Number.NaN;
  if (Number.isFinite(timestamp)) {
    return new Date(timestamp).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }
  if (options.labelFormatter) return options.labelFormatter(value, index, labels);
  return String(value ?? `Point ${index + 1}`);
}

function readChartTooltipState(canvasId, kind) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(`smm.v2.chart-tooltip.${canvasId}`) || "null");
    return saved?.kind === kind ? saved : null;
  } catch {
    return null;
  }
}

function rememberChartTooltipState(canvasId, kind, index, label) {
  try {
    sessionStorage.setItem(`smm.v2.chart-tooltip.${canvasId}`, JSON.stringify({ kind, index, label }));
  } catch {
    // Dashboard tetap berjalan jika browser membatasi session storage.
  }
}

function clearChartTooltipState(canvasId) {
  try {
    sessionStorage.removeItem(`smm.v2.chart-tooltip.${canvasId}`);
  } catch {
    // Tidak perlu memblokir interaksi chart.
  }
}

function restoredChartTooltipIndex(values, saved) {
  if (!saved || !values.length) return -1;
  const exact = values.findIndex((value) => String(value) === String(saved.label));
  if (exact >= 0) return exact;
  const target = Number(saved.label);
  if (Number.isFinite(target)) {
    return values.reduce((nearest, value, index) => Math.abs(Number(value) - target) < Math.abs(Number(values[nearest]) - target) ? index : nearest, 0);
  }
  return Math.max(0, Math.min(values.length - 1, Number(saved.index) || 0));
}

function bindLineChartTooltip(canvas, series, labels, geometry, options = {}) {
  const parent = canvas.parentElement;
  if (!parent || !labels.length) return;
  canvas._trendTooltipCleanup?.();
  [...parent.children].filter((element) => element.classList?.contains("trend-hover-layer")).forEach((element) => element.remove());
  parent.classList.add("has-trend-hover");
  const layer = document.createElement("div");
  layer.className = "trend-hover-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `<span class="trend-hover-line"></span><span class="trend-hover-points"></span><div class="trend-hover-tooltip"></div>`;
  parent.appendChild(layer);
  const guide = layer.querySelector(".trend-hover-line");
  const pointsRoot = layer.querySelector(".trend-hover-points");
  const tooltip = layer.querySelector(".trend-hover-tooltip");
  const { pad, plotW, plotH, xAt, yAt } = geometry;
  let currentIndex = -1;

  const hide = () => {
    layer.classList.remove("visible");
    currentIndex = -1;
    clearChartTooltipState(canvas.id);
  };
  const showIndex = (index) => {
    const x = canvas.offsetLeft + xAt(index, labels.length);
    guide.style.left = `${x}px`;
    guide.style.top = `${canvas.offsetTop + pad.top}px`;
    guide.style.height = `${plotH}px`;
    const values = series.map((line, seriesIndex) => ({
      label: line.label || `Series ${seriesIndex + 1}`,
      unit: line.unit || options.unit || "",
      color: line.color,
      value: Number(line.data[index]),
    })).filter((item) => Number.isFinite(item.value));
    pointsRoot.innerHTML = values.map((item) => `<i style="left:${x}px;top:${canvas.offsetTop + yAt(item.value)}px;border-color:${actualText(item.color)}"></i>`).join("");
    tooltip.innerHTML = `<strong>${actualText(trendTooltipTimeLabel(labels[index], index, labels, options))}</strong>${values.map((item) => `<span><i style="background:${actualText(item.color)}"></i><em>${actualText(item.label)}</em><b>${item.value.toLocaleString("id-ID", { maximumFractionDigits: options.tooltipDecimals ?? 2 })}${item.unit ? ` ${actualText(item.unit)}` : ""}</b></span>`).join("")}`;
    layer.classList.add("visible");
    const tooltipWidth = tooltip.offsetWidth;
    const parentWidth = parent.clientWidth;
    const preferredLeft = x + 12;
    tooltip.style.left = `${preferredLeft + tooltipWidth <= parentWidth - 8 ? preferredLeft : Math.max(8, x - tooltipWidth - 12)}px`;
    tooltip.style.top = `${Math.max(6, canvas.offsetTop + pad.top + 4)}px`;
    if (currentIndex !== index) rememberChartTooltipState(canvas.id, "line", index, labels[index]);
    currentIndex = index;
  };
  const move = (event) => {
    const canvasRect = canvas.getBoundingClientRect();
    const localX = event.clientX - canvasRect.left;
    const localY = event.clientY - canvasRect.top;
    if (localX < pad.left || localX > canvasRect.width - pad.right || localY < pad.top || localY > canvasRect.height - pad.bottom) {
      hide();
      return;
    }
    const index = Math.max(0, Math.min(labels.length - 1, Math.round(((localX - pad.left) / Math.max(1, plotW)) * (labels.length - 1))));
    showIndex(index);
  };
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerleave", hide);
  canvas.addEventListener("pointercancel", hide);
  canvas._trendTooltipCleanup = () => {
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerleave", hide);
    canvas.removeEventListener("pointercancel", hide);
    layer.remove();
  };
  const restoredIndex = restoredChartTooltipIndex(labels, readChartTooltipState(canvas.id, "line"));
  if (restoredIndex >= 0) showIndex(restoredIndex);
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
    ctx.fillText(formatAxis(value, options.axisDecimals), 2, y + 3);
  }
  series.forEach((line) => {
    ctx.beginPath();
    ctx.lineWidth = line.width || (line.dash ? 1.4 : 2);
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
  if (options.tooltip !== false) bindLineChartTooltip(canvas, series, labels, { pad, plotW, plotH, xAt, yAt }, options);
}

function drawChemicalConsumptionTrend() {
  const canvas = document.getElementById("chemical-consumption-chart");
  const data = chemicalAnalytics.data;
  if (!canvas || !data?.time_series?.length) return;
  const hidden = new Set(state.chemicalLog.chartHidden);
  const available = data.available_chemicals || [];
  const visibleCodes = available.map((item) => item.chemical_code).filter((code) => !hidden.has(code));
  const buckets = [...new Set(data.time_series.map((item) => item.bucket))].sort();
  const values = new Map(data.time_series.map((item) => [`${item.bucket}|${item.chemical_code}`, Number(item.total_kg || 0)]));
  const totals = buckets.map((bucket) => visibleCodes.reduce((sum, code) => sum + (values.get(`${bucket}|${code}`) || 0), 0));
  const rawMax = Math.max(0, ...totals);
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * ratio);
  canvas.height = Math.max(1, rect.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  const width = rect.width;
  const height = rect.height;
  const pad = { top: 22, right: 16, bottom: 38, left: 62 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  ctx.clearRect(0, 0, width, height);
  ctx.font = "9px DM Mono, monospace";
  if (!visibleCodes.length || !rawMax) {
    ctx.fillStyle = "#8b999f";
    ctx.textAlign = "center";
    ctx.fillText(visibleCodes.length ? "No consumption in selected range" : "Select at least one chemical", width / 2, height / 2);
    return;
  }
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(1, rawMax)));
  const max = Math.ceil(rawMax / magnitude) * magnitude;
  const gridLines = 5;
  for (let index = 0; index < gridLines; index += 1) {
    const y = pad.top + plotHeight / (gridLines - 1) * index;
    ctx.strokeStyle = "rgba(19,46,57,.08)";
    ctx.setLineDash(index === gridLines - 1 ? [] : [3, 5]);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#8b999f";
    ctx.textAlign = "right";
    ctx.fillText(formatAxis(max - max / (gridLines - 1) * index), pad.left - 8, y + 3);
  }
  ctx.textAlign = "left";
  ctx.fillText("kg", 5, 12);
  const gap = plotWidth / buckets.length;
  const barWidth = Math.max(2, Math.min(34, gap * .68));
  buckets.forEach((bucket, bucketIndex) => {
    const x = pad.left + gap * bucketIndex + (gap - barWidth) / 2;
    let stackBottom = pad.top + plotHeight;
    visibleCodes.forEach((code) => {
      const value = values.get(`${bucket}|${code}`) || 0;
      if (!value) return;
      const segmentHeight = value / max * plotHeight;
      ctx.fillStyle = chemicalColorFor(data, code);
      ctx.fillRect(x, stackBottom - segmentHeight, barWidth, segmentHeight);
      stackBottom -= segmentHeight;
    });
  });
  const labelCount = Math.min(6, buckets.length);
  const labelIndexes = new Set(Array.from({ length: labelCount }, (_, index) => Math.round((buckets.length - 1) * index / Math.max(1, labelCount - 1))));
  labelIndexes.forEach((bucketIndex) => {
    const bucket = buckets[bucketIndex];
    const label = data.range.granularity === "hour" ? bucket.slice(11, 16) : data.range.granularity === "month" ? bucket.slice(0, 7) : bucket.slice(5, 10);
    ctx.fillStyle = "#8b999f";
    ctx.textAlign = bucketIndex === 0 ? "left" : bucketIndex === buckets.length - 1 ? "right" : "center";
    ctx.fillText(label, pad.left + gap * bucketIndex + gap / 2, height - 8);
  });
  ctx.textAlign = "left";
  const chemicalNames = new Map(available.map((item) => [item.chemical_code, item.chemical_name]));
  bindBarChartTooltip(canvas, buckets.map((bucket, bucketIndex) => ({
    label: bucket,
    total: totals[bucketIndex],
    segments: visibleCodes.map((code) => ({
      label: `${code} · ${chemicalNames.get(code) || "Chemical"}`,
      value: values.get(`${bucket}|${code}`) || 0,
      color: chemicalColorFor(data, code),
      unit: "kg",
    })).filter((item) => item.value > 0),
  })), { pad, plotW: plotWidth, plotH: plotHeight, gap, barW: barWidth, max }, {
    unit: "kg",
    showTotal: true,
    tooltipLabelFormatter: (bucket) => {
      const date = new Date(bucket);
      if (!Number.isFinite(date.getTime())) return bucket;
      if (data.range.granularity === "month") return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      if (data.range.granularity === "hour") return date.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
      return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    },
  });
}

function bindBarChartTooltip(canvas, items, geometry, options = {}) {
  const parent = canvas.parentElement;
  if (!parent || !items.length) return;
  canvas._barTooltipCleanup?.();
  [...parent.children].filter((element) => element.classList?.contains("bar-hover-layer")).forEach((element) => element.remove());
  parent.classList.add("has-trend-hover");
  const layer = document.createElement("div");
  layer.className = "trend-hover-layer bar-hover-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `<span class="bar-hover-highlight"></span><div class="trend-hover-tooltip"></div>`;
  parent.appendChild(layer);
  const highlight = layer.querySelector(".bar-hover-highlight");
  const tooltip = layer.querySelector(".trend-hover-tooltip");
  const { pad, plotW, plotH, gap, barW, max } = geometry;
  let currentIndex = -1;
  const hide = () => {
    layer.classList.remove("visible");
    currentIndex = -1;
    clearChartTooltipState(canvas.id);
  };
  const showIndex = (index) => {
    const item = items[index];
    const x = canvas.offsetLeft + pad.left + gap * index + (gap - barW) / 2;
    const total = Number(item.total || 0);
    const barHeight = Math.max(2, total / Math.max(1, max) * plotH);
    highlight.style.left = `${x}px`;
    highlight.style.top = `${canvas.offsetTop + pad.top + plotH - barHeight}px`;
    highlight.style.width = `${barW}px`;
    highlight.style.height = `${barHeight}px`;
    const segments = (item.segments || []).filter((segment) => Number.isFinite(Number(segment.value)));
    const title = options.tooltipLabelFormatter ? options.tooltipLabelFormatter(item.label, index, items) : trendTooltipTimeLabel(item.label, index, items.map((entry) => entry.label), options);
    const totalRow = options.showTotal && segments.length > 1 ? `<span class="trend-tooltip-total"><i></i><em>Total</em><b>${total.toLocaleString("id-ID", { maximumFractionDigits: options.tooltipDecimals ?? 2 })}${options.unit ? ` ${actualText(options.unit)}` : ""}</b></span>` : "";
    tooltip.innerHTML = `<strong>${actualText(title)}</strong>${totalRow}${segments.map((segment) => `<span><i style="background:${actualText(segment.color || "#078eaa")}"></i><em>${actualText(segment.label)}</em><b>${Number(segment.value).toLocaleString("id-ID", { maximumFractionDigits: options.tooltipDecimals ?? 2 })}${segment.unit ? ` ${actualText(segment.unit)}` : ""}</b></span>`).join("")}`;
    layer.classList.add("visible");
    const tooltipWidth = tooltip.offsetWidth;
    const barCenter = x + barW / 2;
    const preferredLeft = barCenter + 12;
    tooltip.style.left = `${preferredLeft + tooltipWidth <= parent.clientWidth - 8 ? preferredLeft : Math.max(8, barCenter - tooltipWidth - 12)}px`;
    tooltip.style.top = `${Math.max(6, canvas.offsetTop + pad.top + 4)}px`;
    if (currentIndex !== index) rememberChartTooltipState(canvas.id, "bar", index, item.label);
    currentIndex = index;
  };
  const move = (event) => {
    const canvasRect = canvas.getBoundingClientRect();
    const localX = event.clientX - canvasRect.left;
    const localY = event.clientY - canvasRect.top;
    if (localX < pad.left || localX > canvasRect.width - pad.right || localY < pad.top || localY > canvasRect.height - pad.bottom) {
      hide();
      return;
    }
    const index = Math.max(0, Math.min(items.length - 1, Math.floor((localX - pad.left) / Math.max(1, gap))));
    showIndex(index);
  };
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerdown", move);
  canvas.addEventListener("pointerleave", hide);
  canvas.addEventListener("pointercancel", hide);
  canvas._barTooltipCleanup = () => {
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerdown", move);
    canvas.removeEventListener("pointerleave", hide);
    canvas.removeEventListener("pointercancel", hide);
    layer.remove();
  };
  const restoredIndex = restoredChartTooltipIndex(items.map((item) => item.label), readChartTooltipState(canvas.id, "bar"));
  if (restoredIndex >= 0) showIndex(restoredIndex);
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
  if (options.tooltip !== false) bindBarChartTooltip(canvas, data.map((value, index) => ({
    label: labels[index],
    total: value,
    segments: [{ label: options.seriesLabel || "Value", value, color: colors[index] || "#078eaa", unit: options.unit || "" }],
  })), { pad, plotW, plotH, gap, barW, max }, options);
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

function formatAxis(value, maximumFractionDigits) {
  if (Number.isFinite(maximumFractionDigits)) return Number(value).toLocaleString("id-ID", { maximumFractionDigits, minimumFractionDigits: 0 });
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
    { data: visibleValues.map((item) => item.temperature), color: "#078eaa", fill: true, label: "Temperature PV", unit: "°C" },
    { data: visibleValues.map((item) => item.setpoint), color: "#8b999f", dash: true, label: "Temperature SV", unit: "°C" },
    { data: visibleValues.map((item) => item.level), color: "#119b70", label: "Level", unit: "%" },
    { data: visibleValues.map((item) => item.steam), color: "#d68b05", label: "Steam", unit: "%" },
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
  const shift = jakartaShiftSelection(now.getTime());
  const shiftWindows = {
    A: "07:00—15:00",
    B: "15:00—23:00",
    C: "23:00—07:00",
  };
  document.getElementById("header-clock").textContent = now.toLocaleTimeString("id-ID", { hour12: false, timeZone: "Asia/Jakarta" });
  const shiftButton = document.getElementById("shift-button");
  const shiftLabel = document.getElementById("header-shift-label");
  const shiftTime = document.getElementById("header-shift-time");
  if (shiftLabel) shiftLabel.textContent = `Shift ${shift.shiftCode}`;
  if (shiftTime) shiftTime.textContent = shiftWindows[shift.shiftCode];
  if (shiftButton) {
    shiftButton.title = `Current production shift · ${shift.productionDate}`;
    shiftButton.setAttribute("aria-label", `Current production Shift ${shift.shiftCode}, ${shiftWindows[shift.shiftCode]}, production date ${shift.productionDate}`);
  }
}

function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
}

function authenticationInitials(name) {
  const parts = String(name || "DA").trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts.at(-1)[0]}` : parts[0]?.slice(0, 2) || "DA").toUpperCase();
}

function applyAuthenticatedUser(user) {
  authentication.user = user;
  const displayName = user?.displayName || user?.username || "Authorized User";
  const role = String(user?.role || "VIEWER").replaceAll("_", " ");
  const department = user?.department || "Digital Automation";
  const avatar = document.getElementById("session-avatar");
  const name = document.getElementById("session-user-name");
  const roleLabel = document.getElementById("session-user-role");
  const menuName = document.getElementById("session-menu-name");
  const menuDepartment = document.getElementById("session-menu-department");
  if (avatar) avatar.textContent = authenticationInitials(displayName);
  if (name) name.textContent = displayName;
  if (roleLabel) roleLabel.textContent = role;
  if (menuName) menuName.textContent = displayName;
  if (menuDepartment) menuDepartment.textContent = `${department} · ${role}`;
}

function showAuthenticationScreen(message = "") {
  authentication.user = null;
  document.body.classList.add("auth-active");
  document.getElementById("app").hidden = true;
  document.getElementById("auth-screen").hidden = false;
  const menu = document.getElementById("user-session-menu");
  const menuButton = document.getElementById("user-menu-button");
  if (menu) menu.hidden = true;
  if (menuButton) menuButton.setAttribute("aria-expanded", "false");
  const error = document.getElementById("login-error");
  if (error) {
    error.textContent = message;
    error.hidden = !message;
  }
  if (realtimeSocket) {
    realtimeSocket.disconnect();
    realtimeSocket = null;
  }
  window.requestAnimationFrame(() => document.getElementById("login-username")?.focus());
}

function showAuthenticatedDashboard(user) {
  applyAuthenticatedUser(user);
  document.body.classList.remove("auth-active");
  document.getElementById("auth-screen").hidden = true;
  document.getElementById("app").hidden = false;
  if (!authentication.dashboardStarted) {
    authentication.dashboardStarted = true;
    updateAlarmCounts();
    updateClock();
    renderPage();
  } else {
    renderPage({ preserveScroll: true });
  }
  backendConnection.status = "connecting";
  backendConnection.realtime = "connecting";
  void connectNonJetflowBackend();
  connectRealtimeChannel();
  if (!authentication.intervalsStarted) {
    authentication.intervalsStarted = true;
    window.setInterval(updateClock, 1000);
    window.setInterval(updateMachineConnectionIndicators, 1000);
    window.setInterval(updateLiveNumbers, 1800);
  }
}

async function initializeAuthentication() {
  const remembered = window.localStorage.getItem(loginUsernameStorageKey) || "";
  const usernameInput = document.getElementById("login-username");
  if (usernameInput) usernameInput.value = remembered;
  try {
    const response = await fetch("/api/v1/auth/session", { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) throw new Error("No active session");
    const payload = await response.json();
    showAuthenticatedDashboard(payload.user);
  } catch {
    showAuthenticationScreen();
  }
}

document.getElementById("login-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("login-username")?.value.trim() || "";
  const password = document.getElementById("login-password")?.value || "";
  const submit = document.getElementById("login-submit");
  const error = document.getElementById("login-error");
  if (!username || !password) {
    error.textContent = "Masukkan username dan password untuk melanjutkan.";
    error.hidden = false;
    return;
  }
  submit.disabled = true;
  error.hidden = true;
  try {
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error(response.status === 429 ? "Terlalu banyak percobaan login. Coba kembali beberapa menit lagi." : "Username atau password tidak valid.");
    const payload = await response.json();
    if (document.getElementById("login-remember")?.checked) window.localStorage.setItem(loginUsernameStorageKey, username);
    else window.localStorage.removeItem(loginUsernameStorageKey);
    document.getElementById("login-password").value = "";
    showAuthenticatedDashboard(payload.user);
  } catch (loginError) {
    error.textContent = loginError instanceof Error ? loginError.message : "Login gagal. Silakan coba kembali.";
    error.hidden = false;
  } finally {
    submit.disabled = false;
  }
});

document.getElementById("password-visibility")?.addEventListener("click", () => {
  const input = document.getElementById("login-password");
  const button = document.getElementById("password-visibility");
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  button.textContent = show ? "Hide" : "Show";
  button.setAttribute("aria-label", show ? "Hide password" : "Show password");
});

document.getElementById("user-menu-button")?.addEventListener("click", (event) => {
  event.stopPropagation();
  const menu = document.getElementById("user-session-menu");
  const button = document.getElementById("user-menu-button");
  menu.hidden = !menu.hidden;
  button.setAttribute("aria-expanded", String(!menu.hidden));
});

document.getElementById("logout-button")?.addEventListener("click", async () => {
  try {
    await fetch("/api/v1/auth/logout", { method: "POST", credentials: "same-origin" });
  } finally {
    document.getElementById("login-password").value = "";
    showAuthenticationScreen("Anda Telah Keluar Dari Dashboard");
  }
});

document.addEventListener("click", (event) => {
  if (event.target.closest?.(".user-menu-wrap")) return;
  const menu = document.getElementById("user-session-menu");
  const button = document.getElementById("user-menu-button");
  if (menu) menu.hidden = true;
  if (button) button.setAttribute("aria-expanded", "false");
});

document.getElementById("main-nav").addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (button) navigate(button.dataset.page);
});
document.getElementById("alarm-shortcut").addEventListener("click", openActiveAlarmPage);
document.getElementById("menu-button").addEventListener("click", openSidebar);
document.getElementById("sidebar-close").addEventListener("click", closeSidebar);
document.getElementById("sidebar-backdrop").addEventListener("click", closeSidebar);
window.addEventListener("resize", () => requestAnimationFrame(initPageCharts));
document.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-production-output-mode]");
  if (!button) return;
  markRealtimeInteraction();
  state.productionOutput.mode = button.dataset.productionOutputMode;
  renderPage({ preserveAnchor: ".production-output-panel" });
});
document.addEventListener("change", (event) => {
  const control = event.target;
  if (!control?.matches?.("[data-production-output-process], [data-production-output-date], [data-production-output-shift]")) return;
  markRealtimeInteraction();
  if (control.matches("[data-production-output-process]")) state.productionOutput.process = control.value;
  if (control.matches("[data-production-output-date]")) state.productionOutput.productionDate = control.value;
  if (control.matches("[data-production-output-shift]")) state.productionOutput.shiftCode = control.value;
  invalidateProductionOutputByBatch();
  renderPage({ preserveAnchor: ".production-output-panel" });
});
document.addEventListener("pointerdown", (event) => {
  realtimeUiRefresh.activePointers.add(event.pointerId);
  markRealtimeInteraction();
}, true);
document.addEventListener("pointerup", (event) => {
  realtimeUiRefresh.activePointers.delete(event.pointerId);
  markRealtimeInteraction();
  if (realtimeUiRefresh.pending) scheduleSafeRealtimeRender();
}, true);
document.addEventListener("pointercancel", (event) => {
  realtimeUiRefresh.activePointers.delete(event.pointerId);
  markRealtimeInteraction();
}, true);
document.addEventListener("focusin", markRealtimeInteraction, true);
document.addEventListener("focusout", () => {
  markRealtimeInteraction();
  if (realtimeUiRefresh.pending) scheduleSafeRealtimeRender();
}, true);
document.addEventListener("keydown", markRealtimeInteraction, true);
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeSidebar();
  if (state.motorDrive.selected) {
    state.motorDrive.selected = null;
    state.motorDrive.source = null;
    renderPage({ preserveScroll: true });
  }
}, true);
document.addEventListener("wheel", markRealtimeInteraction, { capture: true, passive: true });
document.addEventListener("touchmove", markRealtimeInteraction, { capture: true, passive: true });
document.addEventListener("scroll", markRealtimeInteraction, { capture: true, passive: true });
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && realtimeUiRefresh.pending) scheduleSafeRealtimeRender();
});

void initializeAuthentication();
