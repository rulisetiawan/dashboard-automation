// ============================================================================
// State & Configuration Module
// ============================================================================

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
    continuous: "CT-FIN-01",
    inspecting: "INSP-FIN-01",
    finishing: "FIN-FIN-01",
    setting_dongnam: "SD-FIN-01",
    chemical: "DSP-DPN-01",
  },
  drill: {
    jetflow: { area: null, machine: null },
    calator: { area: null, machine: null },
    dryer: { area: null, machine: null },
    kalender: { area: null, machine: null },
    continuous: { area: null, machine: null },
    inspecting: { area: null, machine: null },
    finishing: { area: null, machine: null },
    setting_dongnam: { area: null, machine: null },
    chemical: { area: null, machine: null },
  },
  assetMatrix: {
    status: "all",
    process: "all",
    search: "",
    viewMode: "grouped",
    density: "compact",
    carousel: false,
    slideIndex: 0,
    remainingSeconds: 30,
    isPaused: false,
  },
  commandCenter: {
    enabled: typeof localStorage !== "undefined" ? localStorage.getItem("smm_cc_enabled") !== "false" : true,
    slideIndex: 0,
    remainingSeconds: 14,
    autoIntervalSec: 14,
    isPaused: false,
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
      continuous: "chemical",
      inspecting: "output",
      finishing: "output",
      setting_dongnam: "output",
      chemical: "chemical",
    },
    area: {
      jetflow: null,
      calator: null,
      dryer: null,
      kalender: null,
      continuous: null,
      inspecting: null,
      finishing: null,
      setting_dongnam: null,
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
      continuous: ["line_speed_pv", "steamer_temp", "prewash_1_temp", "wash2_1_temp", "heat_recovery_1", "water_total_liters"],
      inspecting: ["line_speed_pv", "output_total_m", "defect_count", "camera_connected"],
      finishing: ["line_speed_pv", "output_total_m", "temperature_zone_01_pv", "process_pressure_pv"],
      setting_dongnam: ["line_speed_pv", "output_total_m", "temperature_zone_01_pv", "fabric_width_pv"],
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
  wwtp: {
    tab: "summary",
    range: "TODAY",
    customFrom: Date.now() - 7 * 86400000,
    customTo: Date.now(),
    search: "",
    page: 1,
    pageSize: 25,
    equipmentStage: "all",
    equipmentStatus: "all",
    equipmentViewMode: "grid",
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
    continuous: false,
  },
  batchInvestigation: {
    jetflow: { machineId: null, batch: null },
    calator: { machineId: null, batch: null },
    dryer: { machineId: null, batch: null },
    kalender: { machineId: null, batch: null },
    continuous: { machineId: null, batch: null },
    inspecting: { machineId: null, batch: null },
    finishing: { machineId: null, batch: null },
    setting_dongnam: { machineId: null, batch: null },
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
const navigationPages = new Set(["command_center", "overview", "asset_status", "asset_matrix", "jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam", "utilities", "chemical", "solar", "wwtp", "alarms", "trends", "health", "roles", "users"]);
const processNavigationPages = ["jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam", "chemical"];

function getPageFromUrl() {
  const hash = String(window.location.hash || "").replace(/^#\/?/, "").split("?")[0].trim().toLowerCase();
  if (hash && navigationPages.has(hash)) return hash;
  const params = new URLSearchParams(window.location.search);
  const pageParam = String(params.get("page") || "").trim().toLowerCase();
  if (pageParam && navigationPages.has(pageParam)) return pageParam;
  return null;
}

function restoreDashboardNavigation() {
  try {
    const urlPage = getPageFromUrl();
    if (urlPage) {
      state.page = urlPage;
    }
    const saved = JSON.parse(window.localStorage.getItem(navigationStorageKey) || "null");
    if (!saved || typeof saved !== "object") return;
    if (!urlPage && navigationPages.has(saved.page)) state.page = saved.page;
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
    if (["jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam"].includes(saved.productionOutput?.process)) state.productionOutput.process = saved.productionOutput.process;
    if (/^\d{4}-\d{2}-\d{2}$/.test(saved.productionOutput?.productionDate || "")) state.productionOutput.productionDate = saved.productionOutput.productionDate;
    if (["A", "B", "C"].includes(saved.productionOutput?.shiftCode)) state.productionOutput.shiftCode = saved.productionOutput.shiftCode;
    if (typeof saved.pidPanel?.kalender === "boolean") state.pidPanel.kalender = saved.pidPanel.kalender;
    if (typeof saved.pidPanel?.continuous === "boolean") state.pidPanel.continuous = saved.pidPanel.continuous;
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
const wwtpData = { key: null, data: null, loading: false, error: null, requestId: 0 };
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
  command_center: ["Command Center", "SCADA / MES Control", "Smart Manufacturing SCADA / MES Command Center."],
  overview: ["Plant Overview", "Live Operations", "Seluruh proses, mesin, utilitas, dan exception dalam satu tampilan."],
  asset_status: ["Asset Status", "Status Monitor", ""],
  asset_matrix: ["Asset Status", "Status Monitor", ""],
  jetflow: ["Jetflow", "Dyeing Process", "Monitoring batch, tank, dosing, winch, pump, steam, dan alarm."],
  calator: ["Calator", "Washing Process", "Multi-speed, Overfeed Out, dancing roller, chemical, dan output."],
  dryer: ["Dryer", "Drying Process", "Speed, multi-chamber temperature, thermal oil, dan output."],
  kalender: ["Kalender", "Finishing Process", "Upper-lower balance, overfeed, width, motor, dan quality context."],
  continuous: ["Continuous", "Continuous Finishing", "Pre-wash & washing stages, steamer chamber, heat recovery, dosing pumps, dan line speed."],
  inspecting: ["Inspecting", "Fabric Inspection", "Speed, runtime, output, kualitas kain, defect, dan kesiapan integrasi kamera."],
  finishing: ["Finishing", "Finishing Process", "Speed, runtime, output, temperature, dan process pressure mesin Finishing."],
  setting_dongnam: ["Setting Dongnam", "Fabric Setting", "Speed, output, temperature zone, width, overfeed, dan runtime."],
  utilities: ["Plant Utilities", "Resource Monitoring", "Electrical, water, steam, dan thermal oil supply-to-consumer."],
  chemical: ["Chemical Processing", "Dispensing Consumption", "Konsumsi per chemical, transaksi Automatic/Manual/Emergency, dan analisis per unit."],
  solar: ["Solar Fueling", "Fuel Operations", "Distribusi solar, validasi flow meter dan totalizer, serta kesesuaian stok aktual."],
  wwtp: ["WWTP (IPAL)", "Wastewater Treatment", "Monitoring inlet cooling tower, P&ID flow diagram, dan summary operasional IPAL."],
  alarms: ["Alarms & Events", "Exception Center", "Alarm aktif, acknowledgement, equipment event, dan impact context."],
  trends: ["Historical Trends", "Investigation Workspace", "Bandingkan actual, setpoint, machine state, dan alarm dalam satu timeline."],
  health: ["Data Health", "Collector & Tag Quality", "Koneksi PLC, gateway, meter, stale tag, dan historian health."],
  roles: ["Role & Permission", "Access Control", "Pengaturan hak akses menu dashboard per role dan penugasan role pengguna."],
  users: ["User Management", "Account Administration", "Manajemen data akun, penambahan pengguna, reset password, dan status akses."],
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
  continuous: [{ code: "FIN", label: "Finishing", count: 4 }],
  inspecting: [{ code: "FIN", label: "Finishing", count: 12 }],
  finishing: [{ code: "FIN", label: "Finishing", count: 1 }],
  setting_dongnam: [{ code: "FIN", label: "Finishing", count: 4 }],
  chemical: [{ code: "DPN", label: "Depan", count: 1 }, { code: "BLK", label: "Belakang", count: 2 }, { code: "TMR", label: "Timur", count: 2 }],
};

const processConfig = {
  jetflow: { code: "JF", singular: "Jetflow", plural: "Jetflow", process: "Pencelupan", areas: "6 lanes" },
  calator: { code: "CL", singular: "Calator", plural: "Calator", process: "Pencucian", areas: "3 areas" },
  dryer: { code: "DR", singular: "Dryer", plural: "Dryer", process: "Pengeringan", areas: "3 areas" },
  kalender: { code: "KL", singular: "Kalender", plural: "Kalender", process: "Finishing", areas: "3 areas" },
  continuous: { code: "CT", singular: "Continuous", plural: "Continuous", process: "Continuous finishing", areas: "1 area" },
  inspecting: { code: "INSP", singular: "Inspecting", plural: "Inspecting", process: "Fabric inspection", areas: "1 area" },
  finishing: { code: "FIN", singular: "Finishing", plural: "Finishing", process: "Final finishing", areas: "1 area" },
  setting_dongnam: { code: "SD", singular: "Setting Dongnam", plural: "Setting Dongnam", process: "Fabric setting", areas: "1 area" },
  chemical: { code: "DSP", singular: "Dispensing", plural: "Dispensing Calator", process: "Chemical transfer", areas: "3 areas" },
};

const processIcons = {
  jetflow: "◉",
  calator: "≈",
  dryer: "≋",
  kalender: "⊜",
  continuous: "↝",
  inspecting: "⌕",
  finishing: "◇",
  setting_dongnam: "≍",
  chemical: "🧪",
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
const continuousMachines = [];
const inspectingMachines = [];
const finishingMachines = [];
const settingDongnamMachines = [];
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

const backendProcesses = ["jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam", "chemical"];

async function fetchJson(url, label) {
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 401 && !String(url).includes("/auth/")) showAuthenticationScreen("Session Anda telah berakhir. Silakan masuk kembali.");
  if (!response.ok) throw new Error(`${label} unavailable (${response.status})`);
  return response.json();
}

function solarRange() {
  const end = state.solar.range === "CUSTOM" ? new Date(state.solar.customTo) : new Date();
  const durations = { "7D": 7 * 86400000, "30D": 30 * 86400000, "90D": 90 * 86400000, "ALL": 5 * 365 * 86400000 };
  let start;
  if (state.solar.range === "CUSTOM") start = new Date(state.solar.customFrom);
  else if (state.solar.range === "TODAY") {
    const dateParts = new Intl.DateTimeFormat("en-CA", { timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit" }).formatToParts(end);
    const part = Object.fromEntries(dateParts.filter((item) => item.type !== "literal").map((item) => [item.type,item.value]));
    start = new Date(`${part.year}-${part.month}-${part.day}T00:00:00+07:00`);
  } else start = new Date(end.getTime() - (durations[state.solar.range] || durations["30D"]));
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

function wwtpRange() {
  const durations = { "7D": 7 * 86400000, "30D": 30 * 86400000, "90D": 90 * 86400000 };
  const end = state.wwtp.range === "CUSTOM" ? new Date(state.wwtp.customTo) : new Date();
  let start;
  if (state.wwtp.range === "CUSTOM") start = new Date(state.wwtp.customFrom);
  else if (state.wwtp.range === "TODAY") {
    const dateParts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(end);
    const part = Object.fromEntries(dateParts.filter((item) => item.type !== "literal").map((item) => [item.type, item.value]));
    start = new Date(`${part.year}-${part.month}-${part.day}T00:00:00+07:00`);
  } else start = new Date(end.getTime() - (durations[state.wwtp.range] || durations["7D"]));
  return { from: start.toISOString(), to: end.toISOString() };
}

function wwtpRequestKey() {
  const range = wwtpRange();
  return `${state.wwtp.tab}|${range.from}|${range.to}|${state.wwtp.page}`;
}

async function loadWwtpData({ force = false, preserveScroll = true, background = false } = {}) {
  const key = wwtpRequestKey();
  if (wwtpData.loading || (!force && wwtpData.key === key && wwtpData.data)) return;
  const requestId = ++wwtpData.requestId;
  wwtpData.loading = true;
  wwtpData.error = null;
  if (!wwtpData.data && !background && state.page === "wwtp") renderPage({ preserveScroll });
  try {
    const range = wwtpRange();
    const common = new URLSearchParams({ from: range.from, to: range.to });
    let result;
    if (state.wwtp.tab === "summary") {
      result = await fetchJson(`/api/v1/wwtp/summary?${common}`, "WWTP summary API");
    } else if (state.wwtp.tab === "inlet") {
      result = await fetchJson(`/api/v1/wwtp/inlet?${common}`, "WWTP inlet API");
    } else if (state.wwtp.tab === "equipment") {
      result = await fetchJson(`/api/v1/wwtp/equipment`, "WWTP equipment API");
    } else if (state.wwtp.tab === "pid") {
      const [values, logs] = await Promise.all([
        fetchJson(`/api/v1/wwtp/pid/values`, "WWTP PID values API"),
        fetchJson(`/api/v1/wwtp/pid/control-logs`, "WWTP PID control logs API"),
      ]);
      result = { values: values.values, logs: logs.logs };
    }
    if (requestId !== wwtpData.requestId) return;
    wwtpData.key = key;
    wwtpData.data = result;
  } catch (error) {
    if (requestId !== wwtpData.requestId) return;
    wwtpData.error = error instanceof Error ? error.message : "Data WWTP tidak tersedia";
  } finally {
    if (requestId !== wwtpData.requestId) return;
    wwtpData.loading = false;
    if (state.page === "wwtp") renderWwtpView({ preserveScroll });
  }
}

function updateWwtpPidLogsInPlace(logs) {
  const tbody = document.querySelector("[data-wwtp-pid-logs-tbody]");
  if (!tbody) return;
  const logRows = (logs || []).map((l, i) => `
    <tr>
      <td class="mono">${i + 1}</td>
      <td><strong>${actualTime(l.executed_at || l.created_at)}</strong></td>
      <td><strong>${actualText(l.equipment_name || "-")}</strong><small class="mono">${actualText(l.equipment_code || "")}</small></td>
      <td><span class="data-pill neutral">${actualText(l.action_name || "-")}</span></td>
      <td>${actualText(l.initiated_by || "-")}</td>
      <td>${actualText(l.role_name || "-")}</td>
      <td><span class="data-pill ${l.status === "Success" ? "good" : "warning"}">${actualText(l.status || "-")}</span></td>
    </tr>
  `).join("");
  tbody.innerHTML = logRows || `<tr><td colspan="7">${actualEmpty("Belum ada log kontrol.")}</td></tr>`;
}

async function refreshWwtpPidLogs() {
  const btn = document.querySelector("[data-ctrl-log-refresh]");
  if (btn) btn.disabled = true;
  try {
    const logsData = await fetchJson("/api/v1/wwtp/pid/control-logs", "WWTP PID control logs API");
    if (wwtpData.data && state.wwtp.tab === "pid") {
      wwtpData.data.logs = logsData.logs || [];
    }
    updateWwtpPidLogsInPlace(logsData.logs || []);
  } catch (err) {
    console.warn("Failed to refresh PID logs", err);
  } finally {
    if (btn) btn.disabled = false;
  }
}

function renderWwtpView({ preserveScroll = true } = {}) {
  const container = document.getElementById("wwtp-tab-body");
  if (!container || !wwtpData.data) {
    renderPage({ preserveScroll });
    return;
  }
  const data = wwtpData.data || {};
  if (state.wwtp.tab === "pid") {
    const existingIframe = document.querySelector("iframe[data-pf-iframe]");
    if (existingIframe) {
      updateWwtpPidLogsInPlace(data.logs || []);
      return;
    }
    container.innerHTML = wwtpPidView(data);
    bindWwtpPidActions();
    return;
  }
  if (state.wwtp.tab === "inlet") {
    container.innerHTML = wwtpInletView(data);
  } else if (state.wwtp.tab === "equipment") {
    container.innerHTML = wwtpEquipmentView(data);
    bindWwtpEquipmentActions();
  } else {
    container.innerHTML = wwtpSummaryView(data);
  }

  // Synchronize toolbar label and active button state
  const range = wwtpRange();
  const rangeLabel = state.wwtp.range === "TODAY"
    ? `Hari ini · 00:00 — ${actualTime(range.to)}`
    : state.wwtp.range === "CUSTOM"
      ? `${actualTime(range.from)} — ${actualTime(range.to)}`
      : `${state.wwtp.range} rolling window (${actualTime(range.from)} — ${actualTime(range.to)})`;
  const labelEl = document.querySelector("[data-wwtp-range-label]");
  if (labelEl) labelEl.textContent = rangeLabel;

  document.querySelectorAll("[data-wwtp-range]").forEach((btn) => {
    btn.className = `button small ${state.wwtp.range === btn.dataset.wwtpRange ? "primary" : "ghost"}`;
  });
}

function updateWwtpBackground() {
  if (state.page !== "wwtp" || wwtpData.loading || document.hidden) return;
  if (state.wwtp.tab === "pid") {
    void refreshWwtpPidLogs();
    return;
  }
  void loadWwtpData({ force: true, background: true });
}

function invalidateWwtp() {
  wwtpData.key = null;
  wwtpData.requestId += 1;
  wwtpData.loading = false;
  wwtpData.data = null;
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
  const targetFleet = {
    jetflow: jetflows,
    calator: calators,
    dryer: dryers,
    kalender: kalenders,
    continuous: continuousMachines,
    inspecting: inspectingMachines,
    finishing: finishingMachines,
    setting_dongnam: settingDongnamMachines,
    chemical: dispensers,
  };
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
  if (state.page === "wwtp" || state.page === "roles" || state.page === "users") return false;
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
  if (state.page === "asset_status" || state.page === "asset_matrix") return matches("asset", "batch", "alarm");
  if (["jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam"].includes(state.page)) return matches("asset", "batch", "alarm", "equipment");
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
    backendConnection.status = "connected";
    backendConnection.storage = status.storage;
    backendConnection.dataMode = status.data_mode;
    backendConnection.lastSync = status.server_time;

    const user = authentication.user;
    const role = String(user?.role || "").toUpperCase();
    const isAdmin = role === "ADMIN" || role === "ADMINISTRATOR";
    const allowed = Array.isArray(user?.allowedMenus) ? user.allowedMenus : [];
    const prodMenus = ["overview", "jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam", "utilities", "trends", "health"];
    const canAccessProd = isAdmin || prodMenus.some((m) => allowed.includes(m));
    const canAccessChemical = isAdmin || allowed.includes("chemical");
    const canAccessAlarms = isAdmin || allowed.includes("alarms");

    if (canAccessProd || canAccessChemical || canAccessAlarms) {
      const fetchMode = state.historyTable.fetchMode || "per_asset";
      const telemetryUrl = fetchMode === "per_asset"
        ? "/api/v1/telemetry/recent?per_asset=true&limit=2000"
        : "/api/v1/telemetry/recent?limit=500";
      const [, chemicalPayload, utilityPayload, telemetryPayload, alarmPayload, equipmentPayload, processRunPayload] = await Promise.allSettled([
        canAccessProd || canAccessChemical ? refreshAssetFleets() : Promise.resolve(),
        canAccessChemical ? fetchJson("/api/v1/dispensing/transactions", "Chemical transaction API") : Promise.resolve({ transactions: [] }),
        canAccessProd ? fetchJson("/api/v1/utilities/snapshot", "Utility API") : Promise.resolve({ utilities: [] }),
        canAccessProd ? fetchJson(telemetryUrl, "Telemetry API") : Promise.resolve({ samples: [] }),
        canAccessAlarms ? fetchJson("/api/v1/alarms/recent?limit=100", "Alarm API") : Promise.resolve({ alarms: [], active_alarms: [] }),
        canAccessProd ? fetchJson("/api/v1/equipment", "Equipment API") : Promise.resolve({ equipment: [] }),
        canAccessProd ? fetchJson("/api/v1/batch/process-runs", "Batch process API") : Promise.resolve({ runs: [] }),
      ]);
      if (chemicalPayload.status === "fulfilled" && chemicalPayload.value?.transactions) {
        hydrateChemicalTransactions(chemicalPayload.value.transactions);
      }
      if (utilityPayload.status === "fulfilled" && utilityPayload.value?.utilities) {
        backendUtilities = utilityPayload.value.utilities;
      }
      if (telemetryPayload.status === "fulfilled" && telemetryPayload.value?.samples) {
        backendTelemetry = telemetryPayload.value.samples;
      }
      if (alarmPayload.status === "fulfilled") {
        backendAlarmEvents = alarmPayload.value?.alarms || [];
        backendActiveAlarmEvents = alarmPayload.value?.active_alarms || backendAlarmEvents.filter((item) => item.event_state !== "CLEARED");
      }
      if (equipmentPayload.status === "fulfilled" && equipmentPayload.value?.equipment) {
        backendEquipment = equipmentPayload.value.equipment;
      }
      if (processRunPayload.status === "fulfilled" && processRunPayload.value?.runs) {
        backendProcessRuns = processRunPayload.value.runs;
      }
      if (canAccessProd) void loadProductionOutputByBatch();
      updateNavigationCounts();
      syncActiveAlarmPopups();
    }
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
