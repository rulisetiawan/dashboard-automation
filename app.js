(() => {
  // src/state.js
  function jakartaShiftSelection2(timestamp = Date.now()) {
    const values = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23"
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
  var defaultMachineShift = jakartaShiftSelection2();
  var state2 = {
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
      chemical: "DSP-DPN-01"
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
      chemical: { area: null, machine: null }
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
      isPaused: false
    },
    range: "8H",
    history: {
      preset: "8H",
      start: Date.now() - 8 * 60 * 60 * 1e3,
      end: Date.now(),
      viewStart: 0.72,
      viewFraction: 0.28
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
        chemical: "chemical"
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
        chemical: null
      }
    },
    utility: {
      electricalLevel: "cubical",
      selectedElectrical: "CUB-A",
      machinePowerType: "jetflow",
      selectedPowerArea: "LA",
      selectedPowerMachine: "JF-LA-01"
    },
    sensorTrend: {
      range: "1H",
      enabled: {
        jetflow: ["main_temp", "water_level", "flow_meter"],
        calator: ["overfeed_out", "dancing_roller", "feeding_speed"],
        dryer: ["line_speed", "chamber_1", "chamber_5"],
        kalender: ["temp_upper", "temp_lower", "overfeed"],
        continuous: ["line_speed_pv", "chemical_consumption_kg", "temperature_zone_01_pv", "padder_01_pressure_pv"],
        inspecting: ["line_speed_pv", "output_total_m", "defect_count", "camera_connected"],
        finishing: ["line_speed_pv", "output_total_m", "temperature_zone_01_pv", "process_pressure_pv"],
        setting_dongnam: ["line_speed_pv", "output_total_m", "temperature_zone_01_pv", "fabric_width_pv"],
        chemical: ["transfer_flow", "target_weight", "line_pressure"]
      }
    },
    jetflowProgram: {
      enabled: []
    },
    chemicalLog: {
      range: "30D",
      anchorEnd: Date.now(),
      customStart: Date.now() - 30 * 24 * 60 * 60 * 1e3,
      customEnd: Date.now(),
      variant: "all",
      mode: "all",
      status: "all",
      calator: "all",
      page: 1,
      pageSize: 25,
      chartHidden: []
    },
    solar: {
      tab: "overview",
      range: "30D",
      customFrom: Date.now() - 30 * 864e5,
      customTo: Date.now(),
      search: "",
      status: "all",
      page: 1,
      pageSize: 25
    },
    wwtp: {
      tab: "summary",
      range: "TODAY",
      customFrom: Date.now() - 7 * 864e5,
      customTo: Date.now(),
      search: "",
      page: 1,
      pageSize: 25
    },
    motorDrive: {
      selected: null,
      source: null,
      range: "8H",
      metric: "amp",
      viewStart: 0.72,
      viewFraction: 0.28
    },
    machineSummary: {
      scope: "shift",
      productionDate: defaultMachineShift.productionDate,
      shiftCode: defaultMachineShift.shiftCode
    },
    productionOutput: {
      mode: "effective",
      process: "kalender",
      productionDate: defaultMachineShift.productionDate,
      shiftCode: defaultMachineShift.shiftCode
    },
    pidPanel: {
      kalender: false
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
      chemical: { machineId: null, batch: null }
    },
    alarms: {
      area: "all"
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
      deviationDraft: {}
    },
    machineTable: {
      process: "all",
      area: "all",
      status: "all",
      search: "",
      page: 1,
      pageSize: 8
    },
    historyTable: {
      process: "all",
      area: "all",
      assetId: "all",
      role: "all",
      search: "",
      page: 1,
      pageSize: 15,
      fetchMode: "per_asset"
    }
  };
  var navigationStorageKey = "pt-smm.dashboard.navigation.v2";
  var navigationPages2 = /* @__PURE__ */ new Set(["overview", "asset_status", "asset_matrix", "jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam", "utilities", "chemical", "solar", "wwtp", "alarms", "trends", "health", "roles", "users"]);
  var processNavigationPages2 = ["jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam", "chemical"];
  function getPageFromUrl2() {
    const hash = String(window.location.hash || "").replace(/^#\/?/, "").split("?")[0].trim().toLowerCase();
    if (hash && navigationPages2.has(hash)) return hash;
    const params = new URLSearchParams(window.location.search);
    const pageParam = String(params.get("page") || "").trim().toLowerCase();
    if (pageParam && navigationPages2.has(pageParam)) return pageParam;
    return null;
  }
  function restoreDashboardNavigation() {
    try {
      const urlPage = getPageFromUrl2();
      if (urlPage) {
        state2.page = urlPage;
      }
      const saved = JSON.parse(window.localStorage.getItem(navigationStorageKey) || "null");
      if (!saved || typeof saved !== "object") return;
      if (!urlPage && navigationPages2.has(saved.page)) state2.page = saved.page;
      processNavigationPages2.forEach((type) => {
        if (typeof saved.selected?.[type] === "string") state2.selected[type] = saved.selected[type];
        const savedDrill = saved.drill?.[type];
        if (savedDrill && typeof savedDrill === "object") {
          state2.drill[type] = {
            area: typeof savedDrill.area === "string" ? savedDrill.area : null,
            machine: typeof savedDrill.machine === "string" ? savedDrill.machine : null
          };
        }
        const savedBatch = saved.batchInvestigation?.[type];
        if (savedBatch && typeof savedBatch === "object") {
          state2.batchInvestigation[type] = {
            machineId: typeof savedBatch.machineId === "string" ? savedBatch.machineId : null,
            batch: typeof savedBatch.batch === "string" ? savedBatch.batch : null,
            ...typeof savedBatch.processRunId === "string" ? { processRunId: savedBatch.processRunId } : {}
          };
        }
      });
      if (["batch", "shift", "today"].includes(saved.machineSummaryScope)) state2.machineSummary.scope = saved.machineSummaryScope;
      if (/^\d{4}-\d{2}-\d{2}$/.test(saved.machineSummaryProductionDate || "")) state2.machineSummary.productionDate = saved.machineSummaryProductionDate;
      if (["A", "B", "C"].includes(saved.machineSummaryShiftCode)) state2.machineSummary.shiftCode = saved.machineSummaryShiftCode;
      if (["effective", "actual", "estimated"].includes(saved.productionOutput?.mode)) state2.productionOutput.mode = saved.productionOutput.mode;
      if (["jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam"].includes(saved.productionOutput?.process)) state2.productionOutput.process = saved.productionOutput.process;
      if (/^\d{4}-\d{2}-\d{2}$/.test(saved.productionOutput?.productionDate || "")) state2.productionOutput.productionDate = saved.productionOutput.productionDate;
      if (["A", "B", "C"].includes(saved.productionOutput?.shiftCode)) state2.productionOutput.shiftCode = saved.productionOutput.shiftCode;
      if (typeof saved.pidPanel?.kalender === "boolean") state2.pidPanel.kalender = saved.pidPanel.kalender;
    } catch {
    }
  }
  restoreDashboardNavigation();
  var historianParameterStorageKey = "pt-smm.historian.selected-parameter.v2";
  function loadHistorianParameterPreferences() {
    try {
      const value = JSON.parse(window.localStorage.getItem(historianParameterStorageKey) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch {
      return {};
    }
  }
  var historianParameterPreferences2 = loadHistorianParameterPreferences();
  var jetflowProcessSteps2 = [
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
    "ST To MT Filling"
  ];
  state2.jetflowProgram.enabled = [...jetflowProcessSteps2];

  // src/pages/fleet.js
  var managementConfig = {
    jetflow: {
      currentUtility: { label: "Active Process Stages", value: jetflowProcessSteps.length, unit: "stages" },
      output: { label: "Completed Batches", unit: "batch", rate: 0.12 },
      metrics: {
        water: { label: "Total Water Consumption", short: "Water", unit: "m\xB3", rate: 2.45 },
        energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 34 },
        steam: { label: "Steam Consumption", short: "Steam", unit: "ton", rate: 0.24 }
      }
    },
    calator: {
      currentUtility: { label: "Water Flow Now", value: 42.6, unit: "m\xB3/h" },
      output: { label: "Fabric Output", unit: "m", rate: 310 },
      metrics: {
        water: { label: "Water Consumption", short: "Water", unit: "m\xB3", rate: 1.18 },
        chemical: { label: "Chemical Consumption", short: "Chemical", unit: "kg", rate: 10.8 },
        energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 18 }
      }
    },
    dryer: {
      currentUtility: { label: "Thermal Load Now", value: 4.82, unit: "MWth" },
      output: { label: "Fabric Output", unit: "m", rate: 340 },
      metrics: {
        energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 66 },
        thermal: { label: "Thermal Oil Energy", short: "Thermal", unit: "GJ", rate: 5.8 }
      }
    },
    kalender: {
      currentUtility: { label: "Steam Demand Now", value: 3.18, unit: "ton/h" },
      output: { label: "Fabric Output", unit: "m", rate: 290 },
      metrics: {
        steam: { label: "Steam Consumption", short: "Steam", unit: "ton", rate: 0.16 },
        energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 21 }
      }
    },
    continuous: {
      currentUtility: { label: "Chemical Consumption Now", value: 0, unit: "kg" },
      output: { label: "Fabric Output", unit: "m", rate: 300 },
      metrics: {
        chemical: { label: "Chemical Consumption", short: "Chemical", unit: "kg", rate: 12 },
        output: { label: "Production Output", short: "Output", unit: "m", rate: 300 },
        energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 24 }
      }
    },
    inspecting: {
      currentUtility: { label: "Inspection Speed Now", value: 0, unit: "m/min" },
      output: { label: "Inspected Fabric", unit: "m", rate: 380 },
      metrics: {
        output: { label: "Inspected Output", short: "Output", unit: "m", rate: 380 },
        defect: { label: "Detected Defects", short: "Defect", unit: "count", rate: 0.5 },
        energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 8 }
      }
    },
    finishing: {
      currentUtility: { label: "Line Speed Now", value: 0, unit: "m/min" },
      output: { label: "Fabric Output", unit: "m", rate: 300 },
      metrics: {
        output: { label: "Production Output", short: "Output", unit: "m", rate: 300 },
        energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 18 }
      }
    },
    setting_dongnam: {
      currentUtility: { label: "Line Speed Now", value: 0, unit: "m/min" },
      output: { label: "Fabric Output", unit: "m", rate: 320 },
      metrics: {
        output: { label: "Production Output", short: "Output", unit: "m", rate: 320 },
        energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 28 }
      }
    },
    chemical: {
      currentUtility: { label: "Transfer Flow Now", value: 286, unit: "kg/h" },
      output: { label: "Completed Transfers", unit: "transfer", rate: 1.7 },
      metrics: {
        chemical: { label: "Chemical Delivered", short: "Chemical", unit: "kg", rate: 18 },
        energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 7.5 }
      }
    }
  };
  function createElectricalAsset(spec, index) {
    return {
      ...spec,
      status: spec.status || "running",
      powerFactor: (0.92 + index % 4 * 0.01).toFixed(2),
      load: 61 + index * 7 % 28,
      voltage: 396 + index * 3 % 8,
      peak: Math.round(spec.demand * (1.07 + index % 3 * 0.025)),
      energy: spec.demand * (6.85 + index % 4 * 0.22) / 1e3
    };
  }
  var electricalDistribution2 = {
    cubical: [
      { id: "CUB-A", name: "Electrical Cubical A", demand: 720, location: "Main LV Room A", supply: "Main Incomer \xB7 Transformer 01", downstream: "MDP Jetflow 1, Jetflow 2, Washing" },
      { id: "CUB-B", name: "Electrical Cubical B", demand: 612, location: "Main LV Room B", supply: "Main Incomer \xB7 Transformer 02", downstream: "MDP Dryer, MDP Kalender" },
      { id: "CUB-C", name: "Electrical Cubical C", demand: 508, location: "Utility Power Room", supply: "Main Incomer \xB7 Transformer 03", downstream: "MDP Utility & Auxiliary", status: "warning" }
    ].map(createElectricalAsset),
    mdp: [
      { id: "MDP-JF-1", name: "MDP Jetflow Lane A\u2013C", demand: 408, location: "Dyeing West", supply: "Electrical Cubical A", downstream: "SDP Jetflow Lane A, B, C" },
      { id: "MDP-JF-2", name: "MDP Jetflow Lane D\u2013F", demand: 382, location: "Dyeing East", supply: "Electrical Cubical A", downstream: "SDP Jetflow Lane D, E, F" },
      { id: "MDP-WASH", name: "MDP Calator & Dispensing", demand: 198, location: "Washing Area", supply: "Electrical Cubical A", downstream: "SDP Calator Depan, Belakang, Timur" },
      { id: "MDP-DRY", name: "MDP Dryer", demand: 314, location: "Drying Area", supply: "Electrical Cubical B", downstream: "SDP Dryer Depan, Belakang, Timur" },
      { id: "MDP-KAL", name: "MDP Kalender", demand: 286, location: "Finishing Area", supply: "Electrical Cubical B", downstream: "SDP Kalender Depan, Belakang, Timur" },
      { id: "MDP-UTL", name: "MDP Utility & Auxiliary", demand: 252, location: "Utility Building", supply: "Electrical Cubical C", downstream: "SDP Boiler dan SDP Auxiliary", status: "warning" }
    ].map(createElectricalAsset),
    sdp: [
      { id: "SDP-JF-A", name: "SDP Jetflow Lane A", demand: 120, location: "Lane A", supply: "MDP Jetflow Lane A\u2013C", downstream: "6 Jetflow machines" },
      { id: "SDP-JF-B", name: "SDP Jetflow Lane B", demand: 142, location: "Lane B", supply: "MDP Jetflow Lane A\u2013C", downstream: "18 Jetflow machines" },
      { id: "SDP-JF-C", name: "SDP Jetflow Lane C", demand: 146, location: "Lane C", supply: "MDP Jetflow Lane A\u2013C", downstream: "18 Jetflow machines" },
      { id: "SDP-JF-D", name: "SDP Jetflow Lane D", demand: 136, location: "Lane D", supply: "MDP Jetflow Lane D\u2013F", downstream: "18 Jetflow machines" },
      { id: "SDP-JF-E", name: "SDP Jetflow Lane E", demand: 110, location: "Lane E", supply: "MDP Jetflow Lane D\u2013F", downstream: "13 Jetflow machines" },
      { id: "SDP-JF-F", name: "SDP Jetflow Lane F", demand: 136, location: "Lane F", supply: "MDP Jetflow Lane D\u2013F", downstream: "15 Jetflow machines" },
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
      { id: "SDP-AUX", name: "SDP Auxiliary", demand: 100, location: "Utility Building", supply: "MDP Utility & Auxiliary", downstream: "WWTP, pumps, lighting, auxiliary" }
    ].map(createElectricalAsset)
  };

  // src/components/modal-machine.js
  function updateAlarmCounts() {
    if (backendConnection.status === "connected") {
      setActiveAlarmCount(backendActiveAlarmEvents.length);
      return;
    }
    const count = alarms.filter((a) => !a.ack).length;
    setActiveAlarmCount(count);
  }
  function initPageCharts2() {
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
      jetflow: () => drawLineChart2("jetflow-chart", [
        { data: wave(32, 78, 4, 0.55, 0.2), color: "#078eaa", fill: true },
        { data: wave(32, 79, 0.4, 0.5, 0), color: "#8b999f", dash: true },
        { data: wave(32, 70, 1.8, 0.08, 1.2), color: "#119b70" }
      ], labels),
      calator: () => drawLineChart2("calator-chart", [
        { data: wave(32, 29.1, 0.25, 8e-3, 0.2), color: "#078eaa", fill: true },
        { data: wave(32, 28.8, 0.18, 8e-3, 1.5), color: "#4d8fd0" },
        { data: wave(32, 27.5, 0.12, 3e-3, 2.4), color: "#d68b05" }
      ], labels),
      dryer: () => drawLineChart2("dryer-chart", [
        { data: wave(32, 146, 2.4, 0.1, 0.3), color: "#078eaa", fill: true },
        { data: wave(32, 148, 0.25, 0.05, 0), color: "#8b999f", dash: true },
        { data: wave(32, 140, 3.1, 0.12, 1.8), color: "#d68b05" }
      ], labels),
      kalender: () => drawLineChart2("kalender-chart", [
        { data: wave(32, 126, 1.2, 0.03, 0.3), color: "#078eaa", fill: true },
        { data: wave(32, 123, 1, 0.03, 1.5), color: "#4d8fd0" },
        { data: wave(32, 118, 0.7, 0.01, 2.2), color: "#119b70" }
      ], labels),
      utilities: () => {
        drawLineChart2("utility-chart", [
          { data: wave(32, 1.58, 0.12, 0.014, 0.2), color: "#078eaa", fill: true },
          { data: wave(32, 1.75, 0.02, 9e-3, 0), color: "#d68b05", dash: true }
        ], labels);
        drawElectricalDistributionChart();
        drawMachinePowerAreaChart();
      },
      chemical: drawChemicalConsumptionTrend,
      alarms: () => drawBarChart("alarm-chart", [18, 12, 9, 7, 5, 4], ["Tangle", "Temp", "Speed", "Steam", "Data", "Drive"], ["#d9485c", "#d68b05", "#d68b05", "#d68b05", "#8b999f", "#8b999f"]),
      trends: drawHistoricalTrend,
      health: () => drawLineChart2("health-chart", [
        { data: wave(32, 46, 2.2, 0.06, 0.2), color: "#078eaa", fill: true },
        { data: wave(32, 23, 3.4, 0.02, 1.8), color: "#119b70" }
      ], labels)
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
          { showValues: true, standard: true, unit: data.unit || "m" }
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
      drawLineChart2(`sensor-trend-${type}-${sensor.key}`, [
        { data: series.pv, color: sensor.color, fill: true, label: "PV \xB7 Process Value", unit: sensor.unit },
        { data: series.sv, color: sensor.color, dash: true, label: "SV \xB7 Set Value", unit: sensor.unit }
      ], series.timestamps, {
        topPad: program ? 42 : 18,
        annotations: program ? {
          bands: jetflowProgramSchedule().filter((phase) => selectedProcesses.includes(phase.name)).map((phase) => ({
            start: phase.start,
            end: phase.end,
            label: `S${String(phase.step).padStart(2, "0")} ${phase.name}`,
            color: `${sensor.color}14`,
            textColor: sensor.color
          })),
          markers: program.markers.filter((marker) => selectedProcesses.includes(marker.process)).map((marker) => ({
            position: marker.position,
            label: `${marker.value.toFixed(sensor.decimals)}${sensor.unit}`,
            color: sensor.color
          }))
        } : null,
        labelFormatter: (timestamp) => new Date(timestamp).toLocaleTimeString("id-ID", state.sensorTrend.range === "24H" ? { day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false } : { hour: "2-digit", minute: "2-digit", hour12: false })
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
    drawLineChart2("motor-drive-trend", [{ data: values, color: trend.color, fill: true, label: trend.label, unit: trend.unit }], timestamps, {
      labelFormatter: (timestamp) => new Date(timestamp).toLocaleTimeString("id-ID", state.motorDrive.range === "7D" ? { day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false } : { hour: "2-digit", minute: "2-digit", hour12: false })
    });
    const visibleStart = timestamps[0];
    const visibleEnd = timestamps.at(-1);
    const label = document.getElementById("motor-trend-visible-label");
    if (label && visibleStart && visibleEnd) label.textContent = `${trend.label} \xB7 ${new Date(visibleStart).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })} \u2014 ${new Date(visibleEnd).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })} \xB7 ${trend.unit}`;
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
      shiftMotorDriveTrend(Math.sign(event.deltaX || event.deltaY) * state.motorDrive.viewFraction * 0.08);
    }, { passive: false });
    canvas.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      shiftMotorDriveTrend((event.key === "ArrowLeft" ? -1 : 1) * state.motorDrive.viewFraction * 0.12);
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
      shiftMotorDriveTrend((event.key === "ArrowLeft" ? -1 : 1) * state.motorDrive.viewFraction * 0.12);
    });
  }
  function wave(length, start, amplitude, trend = 0, phase = 0) {
    return Array.from({ length }, (_, i) => start + Math.sin(i * 0.42 + phase) * amplitude + Math.cos(i * 0.17 + phase) * amplitude * 0.28 + i * trend);
  }
  function trendTooltipTimeLabel(value, index, labels, options) {
    if (options.tooltipTimeFormatter) return options.tooltipTimeFormatter(value, index, labels);
    const timestamp = value instanceof Date ? value.getTime() : typeof value === "number" && value > 1e11 ? value : typeof value === "string" && /[-T:/]/.test(value) ? Date.parse(value) : Number.NaN;
    if (Number.isFinite(timestamp)) {
      return new Date(timestamp).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
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
    }
  }
  function clearChartTooltipState(canvasId) {
    try {
      sessionStorage.removeItem(`smm.v2.chart-tooltip.${canvasId}`);
    } catch {
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
        value: Number(line.data[index])
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
      const index = Math.max(0, Math.min(labels.length - 1, Math.round((localX - pad.left) / Math.max(1, plotW) * (labels.length - 1))));
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
  function drawLineChart2(id, series, labels, options = {}) {
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
    min -= spread * 0.14;
    max += spread * 0.14;
    ctx.clearRect(0, 0, width, height);
    ctx.font = "9px DM Mono, monospace";
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const xAt = (i, len) => pad.left + i / Math.max(1, len - 1) * plotW;
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
      const y = pad.top + (height - pad.top - pad.bottom) / 4 * i;
      ctx.beginPath();
      ctx.setLineDash([3, 5]);
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      const value = max - (max - min) / 4 * i;
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
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
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
      const labelY = 15 + index % 3 * 9;
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
    const barWidth = Math.max(2, Math.min(34, gap * 0.68));
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
        label: `${code} \xB7 ${chemicalNames.get(code) || "Chemical"}`,
        value: values.get(`${bucket}|${code}`) || 0,
        color: chemicalColorFor(data, code),
        unit: "kg"
      })).filter((item) => item.value > 0)
    })), { pad, plotW: plotWidth, plotH: plotHeight, gap, barW: barWidth, max }, {
      unit: "kg",
      showTotal: true,
      tooltipLabelFormatter: (bucket) => {
        const date = new Date(bucket);
        if (!Number.isFinite(date.getTime())) return bucket;
        if (data.range.granularity === "month") return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
        if (data.range.granularity === "hour") return date.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
        return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
      }
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
    const pad = options.standard ? { top: 30, right: 14, bottom: 34, left: 54 } : { top: 15, right: 10, bottom: 28, left: 35 };
    const rawMax = Math.max(...data);
    const magnitude = 10 ** Math.floor(Math.log10(Math.max(1, rawMax)));
    const max = options.standard ? Math.ceil(rawMax / magnitude) * magnitude : rawMax * 1.16;
    ctx.clearRect(0, 0, width, height);
    ctx.font = "9px DM Mono, monospace";
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const gap = plotW / data.length;
    const barW = options.standard ? gap * 0.76 : Math.min(42, gap * 0.58);
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
      segments: [{ label: options.seriesLabel || "Value", value, color: colors[index] || "#078eaa", unit: options.unit || "" }]
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
    if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(1) + "K";
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
      const cycle = timestamp / 36e5;
      const step = Math.floor(index / 90) % 2;
      return {
        temperature: 90 + Math.sin(cycle * 1.7) * 3.8 + Math.cos(index * 0.09) * 1.2 + step * 1.7,
        setpoint: 91.5 + Math.sin(cycle * 0.42) * 0.45 + step * 1.35,
        level: 70 + Math.sin(cycle * 1.08 + 1.4) * 2.2 + Math.cos(index * 0.045) * 0.7,
        steam: 66 + Math.sin(cycle * 2.1 + 2.2) * 1.5 + Math.cos(index * 0.15) * 0.5
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
    drawLineChart2("trends-chart", [
      { data: visibleValues.map((item) => item.temperature), color: "#078eaa", fill: true, label: "Temperature PV", unit: "\xB0C" },
      { data: visibleValues.map((item) => item.setpoint), color: "#8b999f", dash: true, label: "Temperature SV", unit: "\xB0C" },
      { data: visibleValues.map((item) => item.level), color: "#119b70", label: "Level", unit: "%" },
      { data: visibleValues.map((item) => item.steam), color: "#d68b05", label: "Steam", unit: "%" }
    ], visibleTimestamps, { labelFormatter: (timestamp) => historicalAxisLabel2(timestamp, visibleSpan) });
    updateHistoricalViewportUI(visibleTimestamps[0], visibleTimestamps.at(-1));
  }
  function historicalAxisLabel2(timestamp, visibleSpan) {
    const date = new Date(timestamp);
    if (visibleSpan <= 24 * 60 * 60 * 1e3) {
      return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    if (visibleSpan <= 7 * 24 * 60 * 60 * 1e3) {
      return date.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
    }
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  }
  function updateHistoricalViewportUI(visibleStart, visibleEnd) {
    const summary = document.getElementById("history-range-summary");
    if (summary) summary.textContent = `JF-02 \xB7 ${formatDateTime(state.history.start)} \u2014 ${formatDateTime(state.history.end)} WIB`;
    const visibleLabel = document.getElementById("history-visible-label");
    if (visibleLabel) visibleLabel.textContent = `Visible: ${formatDateTime(visibleStart, true)} \u2014 ${formatDateTime(visibleEnd, true)} WIB`;
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
  function updateLiveNumbers() {
    document.querySelectorAll("[data-live]").forEach((el) => {
      const base = Number(el.dataset.value);
      const variance = Number(el.dataset.variance || 0.1);
      const decimals = Number(el.dataset.decimals || 1);
      const next = base + (Math.random() - 0.5) * variance * 2;
      el.textContent = next.toFixed(decimals);
    });
  }
  function updateClock() {
    const now = /* @__PURE__ */ new Date();
    const shift = jakartaShiftSelection(now.getTime());
    const shiftWindows = {
      A: "07:00\u201415:00",
      B: "15:00\u201423:00",
      C: "23:00\u201407:00"
    };
    document.getElementById("header-clock").textContent = now.toLocaleTimeString("id-ID", { hour12: false, timeZone: "Asia/Jakarta" });
    const shiftButton = document.getElementById("shift-button");
    const shiftLabel = document.getElementById("header-shift-label");
    const shiftTime = document.getElementById("header-shift-time");
    if (shiftLabel) shiftLabel.textContent = `Shift ${shift.shiftCode}`;
    if (shiftTime) shiftTime.textContent = shiftWindows[shift.shiftCode];
    if (shiftButton) {
      shiftButton.title = `Current production shift \xB7 ${shift.productionDate}`;
      shiftButton.setAttribute("aria-label", `Current production Shift ${shift.shiftCode}, ${shiftWindows[shift.shiftCode]}, production date ${shift.productionDate}`);
    }
  }
  var sidebarStorageKey = "smm-dashboard-sidebar-collapsed";
  function isMobileScreen2() {
    return window.innerWidth <= 680;
  }
  function isSidebarOpen() {
    const app = document.getElementById("app");
    const sidebar = document.getElementById("sidebar");
    if (isMobileScreen2()) {
      return sidebar ? sidebar.classList.contains("open") : false;
    }
    return app ? !app.classList.contains("sidebar-collapsed") : true;
  }
  function updateSidebarToggleAttributes() {
    const open = isSidebarOpen();
    const menuBtn = document.getElementById("menu-button");
    const closeBtn = document.getElementById("sidebar-close");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.title = open ? "Tutup navigasi (Sidebar)" : "Buka navigasi (Sidebar)";
    }
    if (closeBtn) {
      closeBtn.setAttribute("aria-expanded", String(open));
      closeBtn.title = "Tutup navigasi (Sidebar)";
    }
  }
  function openSidebar() {
    const app = document.getElementById("app");
    const sidebar = document.getElementById("sidebar");
    if (isMobileScreen2()) {
      sidebar?.classList.add("open");
    } else {
      app?.classList.remove("sidebar-collapsed");
      window.localStorage.setItem(sidebarStorageKey, "false");
    }
    updateSidebarToggleAttributes();
  }
  function closeSidebar2() {
    const app = document.getElementById("app");
    const sidebar = document.getElementById("sidebar");
    if (isMobileScreen2()) {
      sidebar?.classList.remove("open");
    } else {
      app?.classList.add("sidebar-collapsed");
      window.localStorage.setItem(sidebarStorageKey, "true");
    }
    updateSidebarToggleAttributes();
  }
  function toggleSidebar() {
    if (isSidebarOpen()) {
      closeSidebar2();
    } else {
      openSidebar();
    }
  }
  function initializeSidebarState() {
    const app = document.getElementById("app");
    if (!isMobileScreen2()) {
      const saved = window.localStorage.getItem(sidebarStorageKey);
      if (saved === "true") {
        app?.classList.add("sidebar-collapsed");
      }
    }
    updateSidebarToggleAttributes();
  }
  function authenticationInitials(name) {
    const parts = String(name || "DA").trim().split(/\s+/).filter(Boolean);
    return (parts.length > 1 ? `${parts[0][0]}${parts.at(-1)[0]}` : parts[0]?.slice(0, 2) || "DA").toUpperCase();
  }
  function applyMenuPermissions2(user) {
    if (!user) return;
    const role = String(user.role || "").toUpperCase();
    const isAdmin = role === "ADMIN";
    const allowed = Array.isArray(user.allowedMenus) ? user.allowedMenus : [];
    const adminBtn = document.getElementById("admin-rbac-button");
    if (adminBtn) adminBtn.hidden = !isAdmin;
    const adminUsersBtn = document.getElementById("admin-users-button");
    if (adminUsersBtn) adminUsersBtn.hidden = !isAdmin;
    const nav = document.getElementById("main-nav");
    if (nav) {
      const navItems = nav.querySelectorAll(".nav-item[data-page]");
      navItems.forEach((btn) => {
        const page = btn.dataset.page;
        const canAccess = page === "roles" || page === "users" ? isAdmin : isAdmin || page === "asset_status" || page === "asset_matrix" || allowed.includes(page);
        btn.classList.toggle("hidden", !canAccess);
      });
      const groupLabels = nav.querySelectorAll(".nav-group-label[data-nav-group]");
      groupLabels.forEach((label) => {
        let el = label.nextElementSibling;
        let hasVisibleChild = false;
        while (el && !el.classList.contains("nav-group-label")) {
          if (el.classList.contains("nav-item") && !el.classList.contains("hidden")) {
            hasVisibleChild = true;
            break;
          }
          el = el.nextElementSibling;
        }
        label.classList.toggle("hidden", !hasVisibleChild);
      });
    }
    const urlPage = getPageFromUrl();
    const isUrlAllowed = urlPage && (isAdmin || allowed.includes(urlPage));
    if (isUrlAllowed) {
      state.page = urlPage;
    } else if (!isAdmin && !allowed.includes(state.page)) {
      const firstAllowed = allowed.find((p) => p !== "roles" && p !== "users") || "overview";
      state.page = firstAllowed;
      window.location.hash = `#/${firstAllowed}`;
    }
  }
  function applyAuthenticatedUser2(user) {
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
    if (menuDepartment) menuDepartment.textContent = `${department} \xB7 ${role}`;
    applyMenuPermissions2(user);
  }
  function showAuthenticationScreen2(message = "") {
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
    applyAuthenticatedUser2(user);
    document.body.classList.remove("auth-active");
    document.getElementById("auth-screen").hidden = true;
    document.getElementById("app").hidden = false;
    initializeSidebarState();
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
      window.setInterval(updateClock, 1e3);
      window.setInterval(updateMachineConnectionIndicators, 1e3);
      window.setInterval(updateLiveNumbers, 1800);
      window.setInterval(updateWwtpBackground, 15e3);
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
        body: JSON.stringify({ username, password })
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
      showAuthenticationScreen2("Anda Telah Keluar Dari Dashboard");
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
  document.getElementById("menu-button")?.addEventListener("click", toggleSidebar);
  document.getElementById("sidebar-close")?.addEventListener("click", closeSidebar2);
  document.getElementById("sidebar-backdrop")?.addEventListener("click", closeSidebar2);
  window.addEventListener("resize", () => {
    if (!isMobileScreen2()) {
      document.getElementById("sidebar")?.classList.remove("open");
    }
    updateSidebarToggleAttributes();
    requestAnimationFrame(initPageCharts2);
  });
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
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
      const active = document.activeElement;
      if (active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName)) return;
      event.preventDefault();
      toggleSidebar();
      return;
    }
    if (event.key === "Escape") {
      const userModal = document.getElementById("user-modal");
      if (userModal && !userModal.hidden) {
        closeUserModal();
        return;
      }
      if (isMobileScreen2() && isSidebarOpen()) closeSidebar2();
      if (state.motorDrive.selected) {
        state.motorDrive.selected = null;
        state.motorDrive.source = null;
        renderPage({ preserveScroll: true });
      }
    }
  }, true);
  document.addEventListener("wheel", markRealtimeInteraction, { capture: true, passive: true });
  document.addEventListener("touchmove", markRealtimeInteraction, { capture: true, passive: true });
  document.addEventListener("scroll", markRealtimeInteraction, { capture: true, passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && realtimeUiRefresh.pending) scheduleSafeRealtimeRender();
  });

  // src/pages/users.js
  function closeUserModal2() {
    const modal = document.getElementById("user-modal");
    if (modal) modal.hidden = true;
    const form = document.getElementById("user-modal-form");
    if (form) form.reset();
    const idInput = document.getElementById("user-form-id");
    if (idInput) idInput.value = "";
    const errorEl = document.getElementById("user-modal-error");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.hidden = true;
    }
  }
  async function handleUserFormSubmit(event) {
    event.preventDefault();
    const errorEl = document.getElementById("user-modal-error");
    const reportError = (msg) => {
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.hidden = false;
      }
      showToast("Validasi Gagal", msg);
    };
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.hidden = true;
    }
    const id = document.getElementById("user-form-id")?.value?.trim();
    const username = document.getElementById("user-form-username")?.value?.trim().toLowerCase();
    const displayName = document.getElementById("user-form-display-name")?.value?.trim();
    const email = document.getElementById("user-form-email")?.value?.trim() || null;
    const department = document.getElementById("user-form-department")?.value?.trim() || null;
    const roleCode = document.getElementById("user-form-role")?.value?.trim() || "VIEWER";
    const active = document.getElementById("user-form-active")?.checked !== false;
    const password = document.getElementById("user-form-password")?.value || "";
    if (!displayName) {
      reportError("Nama lengkap wajib diisi.");
      return;
    }
    const submitBtn = document.getElementById("user-modal-submit");
    if (submitBtn) submitBtn.disabled = true;
    try {
      if (!id) {
        if (!username) {
          reportError("Username wajib diisi.");
          return;
        }
        if (username.length < 3) {
          reportError("Username minimal 3 karakter.");
          return;
        }
        if (!/^[a-z0-9_.-]+$/.test(username)) {
          reportError("Username hanya boleh berisi huruf kecil, angka, titik, strip, atau underscore.");
          return;
        }
        if (!password) {
          reportError("Password wajib diisi.");
          return;
        }
        if (password.length < 6) {
          reportError("Password minimal harus 6 karakter.");
          return;
        }
        const res = await fetch("/api/v1/rbac/users", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            password,
            display_name: displayName,
            email,
            department,
            role_code: roleCode,
            active
          })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = Array.isArray(data.message) ? data.message.join(", ") : data.message || data.error || "Gagal membuat pengguna baru.";
          throw new Error(msg);
        }
        showToast("Pengguna Dibuat", data.message || `Pengguna ${username} berhasil dibuat.`);
        closeUserModal2();
        await loadRbacUsers();
      } else {
        if (password && password.length < 6) {
          reportError("Password baru minimal harus 6 karakter.");
          return;
        }
        const body = {
          display_name: displayName,
          email,
          department,
          role_code: roleCode,
          active
        };
        if (password) body.new_password = password;
        const res = await fetch(`/api/v1/rbac/users/${encodeURIComponent(id)}`, {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = Array.isArray(data.message) ? data.message.join(", ") : data.message || data.error || "Gagal memperbarui pengguna.";
          throw new Error(msg);
        }
        showToast("Pengguna Diperbarui", data.message || "Data pengguna berhasil disimpan.");
        closeUserModal2();
        await loadRbacUsers();
        if (authentication.user && String(authentication.user.userId) === String(id)) {
          authentication.user.displayName = displayName;
          authentication.user.department = department;
          authentication.user.role = roleCode;
          const currentRoleObj = rbacState.roles.find((r) => r.role_code === roleCode);
          if (currentRoleObj) authentication.user.allowedMenus = currentRoleObj.menus;
          applyAuthenticatedUser(authentication.user);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      if (errorEl) {
        errorEl.textContent = errorMsg;
        errorEl.hidden = false;
      }
      showToast("Gagal Menyimpan", errorMsg);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }
  document.getElementById("admin-rbac-button")?.addEventListener("click", () => {
    const sessionMenu = document.getElementById("user-session-menu");
    if (sessionMenu) sessionMenu.hidden = true;
    navigate("roles");
  });
  document.getElementById("admin-users-button")?.addEventListener("click", () => {
    const sessionMenu = document.getElementById("user-session-menu");
    if (sessionMenu) sessionMenu.hidden = true;
    navigate("users");
  });
  document.getElementById("user-modal-close")?.addEventListener("click", closeUserModal2);
  document.getElementById("user-modal-cancel")?.addEventListener("click", closeUserModal2);
  document.getElementById("user-modal-form")?.addEventListener("submit", handleUserFormSubmit);
  document.getElementById("user-modal")?.addEventListener("click", (event) => {
    if (event.target === document.getElementById("user-modal")) {
      closeUserModal2();
    }
  });
  window.addEventListener("hashchange", () => {
    const page = getPageFromUrl();
    if (page && page !== state.page) {
      navigate(page, { replaceState: true });
    }
  });
  void initializeAuthentication();
})();
//# sourceMappingURL=app.js.map
