// ============================================================================
// Page: Process Fleet (Jetflow, Calator, Dryer, Kalender, Finishing, etc.)
// ============================================================================

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
  return {
    jetflow: jetflows,
    calator: calators,
    dryer: dryers,
    kalender: kalenders,
    continuous: continuousMachines,
    inspecting: inspectingMachines,
    finishing: finishingMachines,
    setting_dongnam: settingDongnamMachines,
    chemical: dispensers,
  }[type] || [];
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
  continuous: {
    currentUtility: { label: "Line Speed Now", value: 20, unit: "m/min" },
    output: { label: "Fabric Output", unit: "m", rate: 300 },
    metrics: {
      speed: { label: "Line Speed", short: "Speed", unit: "m/min", rate: 20 },
      steamer: { label: "Steamer Temp", short: "Steamer", unit: "°C", rate: 96 },
      water: { label: "Water Total", short: "Water", unit: "L", rate: 1000 },
      output: { label: "Fabric Output", short: "Output", unit: "m", rate: 300 },
    },
  },
  inspecting: {
    currentUtility: { label: "Inspection Speed Now", value: 0, unit: "m/min" },
    output: { label: "Inspected Fabric", unit: "m", rate: 380 },
    metrics: {
      output: { label: "Inspected Output", short: "Output", unit: "m", rate: 380 },
      defect: { label: "Detected Defects", short: "Defect", unit: "count", rate: 0.5 },
      energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 8 },
    },
  },
  finishing: {
    currentUtility: { label: "Line Speed Now", value: 0, unit: "m/min" },
    output: { label: "Fabric Output", unit: "m", rate: 300 },
    metrics: {
      output: { label: "Production Output", short: "Output", unit: "m", rate: 300 },
      energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 18 },
    },
  },
  setting_dongnam: {
    currentUtility: { label: "Line Speed Now", value: 0, unit: "m/min" },
    output: { label: "Fabric Output", unit: "m", rate: 320 },
    metrics: {
      output: { label: "Production Output", short: "Output", unit: "m", rate: 320 },
      energy: { label: "Energy Consumption", short: "Energy", unit: "kWh", rate: 28 },
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
  const tooltipText = foot ? `${label}: ${foot}` : label;
  return `<article class="card kpi-card" data-tooltip="${actualText(tooltipText)}"><div class="kpi-top"><span class="kpi-label">${actualText(label)}</span>${foot ? `<span class="b2b-tooltip-trigger" data-tooltip="${actualText(foot)}">ⓘ</span>` : ""}<span class="quality-pill good">ACTUAL</span></div><div class="kpi-value">${actualText(value)}<small>${actualText(unit)}</small></div><div class="kpi-foot">${actualText(foot)}</div></article>`;
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
  return [
    ...jetflows,
    ...calators,
    ...dryers,
    ...kalenders,
    ...continuousMachines,
    ...inspectingMachines,
    ...finishingMachines,
    ...settingDongnamMachines,
    ...dispensers,
  ];
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
    <tr class="clickable-row" data-machine-row="${asset.process || 'jetflow'}|${asset.id}" data-tooltip="${actualText(asset.id)} · ${actualText(asset.name)} · Status: ${actualText(asset.state)} · Batch: ${actualText(asset.batch)}" role="button" tabindex="0" aria-label="Buka detail mesin ${actualText(asset.id)}">
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
        ${asset.process === "continuous" || String(asset.id).startsWith("CT-")
          ? `<span class="mono"><strong>${asset.values?.line_speed_pv != null ? `${Number(asset.values.line_speed_pv).toFixed(0)} m/min` : (asset.values?.batch_length_m != null ? `${Number(asset.values.batch_length_m).toLocaleString("id-ID")} m` : "Continuous")}</strong></span>`
          : `<div class="machine-progress-wrap">
              <div class="machine-progress-bar"><span style="width: ${Math.min(100, Math.max(0, asset.progress))}%"></span></div>
              <small>${actualText(asset.progress)}%</small>
            </div>`}
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
              <th>Asset <span class="b2b-tooltip-trigger" data-tooltip="Kode pengenal unik dan deskripsi mesin">ⓘ</span></th>
              <th>Area <span class="b2b-tooltip-trigger" data-tooltip="Area penempatan operasional di pabrik">ⓘ</span></th>
              <th>Status <span class="b2b-tooltip-trigger" data-tooltip="Status operasional mesin saat ini (Running, Idle, Warning, Fault)">ⓘ</span></th>
              <th>Controller <span class="b2b-tooltip-trigger" data-tooltip="Konektivitas PLC / Controller ke broker SCADA">ⓘ</span></th>
              <th>Active alarm <span class="b2b-tooltip-trigger" data-tooltip="Kondisi alarm aktif yang membutuhkan perhatian">ⓘ</span></th>
              <th>Batch <span class="b2b-tooltip-trigger" data-tooltip="Nomor pesanan batch produksi yang sedang diproses">ⓘ</span></th>
              <th>Progress <span class="b2b-tooltip-trigger" data-tooltip="Kemajuan siklus batch atau kecepatan lini continuous">ⓘ</span></th>
              <th>Source time <span class="b2b-tooltip-trigger" data-tooltip="Waktu pencatatan data terakhir dari PLC">ⓘ</span></th>
              <th>Quality <span class="b2b-tooltip-trigger" data-tooltip="Kualitas dan integritas sinyal telemetry">ⓘ</span></th>
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
    let unit = tag?.engineering_unit || "";
    if (!unit) {
      const k = key.toLowerCase();
      if (k.includes("temp") || k.includes("recovery")) unit = "°C";
      else if (k.includes("speed")) unit = k.includes("drive") ? "RPM" : "m/min";
      else if (k.includes("flow")) unit = "L/h";
      else if (k.includes("liters") || k.includes("water")) unit = "L";
      else if (k.includes("length")) unit = "m";
      else if (k.includes("mass") || k.includes("weight")) unit = "kg";
      else if (k.includes("pct") || k.includes("percent")) unit = "%";
      else if (k.includes("minutes")) unit = "min";
      else if (k.includes("hours")) unit = "h";
      else if (k.includes("pressure")) unit = "bar";
    }
    return `<article class="actual-sensor-card">
      <div class="actual-sensor-card-top"><span class="actual-sensor-asset">${actualText(asset.id)}</span><span class="quality-pill ${String(asset.quality).toLowerCase() === "good" ? "good" : "stale"}">${actualText(asset.quality)}</span></div>
      <span class="actual-sensor-label">${actualText(actualLabel(key))}</span>
      <strong class="actual-sensor-value">${actualText(actualMeasuredValue(value))}<small>${actualText(unit)}</small></strong>
      <span class="actual-sensor-time">Updated ${actualTime(asset.sourceTs)}</span>
    </article>`;
  }).join("")}</div>`;
}

function actualMeasuredValue(value, maximumFractionDigits = 2) {
  if (typeof value === "boolean" || value == null || String(value).trim() === "") return value;
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits })
    : value;
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

function assetEffectiveState(asset) {
  const alarms = activeAlarmsForAsset(asset.id);
  const hasCriticalAlarm = alarms.some((a) => String(a.severity).toLowerCase() === "critical");
  if (asset.state === "fault" || hasCriticalAlarm) return "fault";
  if (asset.state === "warning" || alarms.length > 0) return "warning";
  if (asset.state === "running") return "running";
  if (asset.state === "idle") return "idle";
  if (asset.state === "offline" || !asset.connected) return "offline";
  return asset.state || "offline";
}

const matrixStatusMeta = {
  running: { label: "Running", icon: "●", tone: "running" },
  idle: { label: "Idle", icon: "⏸", tone: "idle" },
  fault: { label: "Rusak / Fault", icon: "▲", tone: "fault" },
  warning: { label: "Warning", icon: "◆", tone: "warning" },
  offline: { label: "Offline", icon: "✕", tone: "offline" },
};

let matrixSearchTimer = null;
function scheduleMatrixSearchRender() {
  if (matrixSearchTimer) clearTimeout(matrixSearchTimer);
  matrixSearchTimer = setTimeout(() => {
    renderPage({ preserveScroll: true, preserveAnchor: ".matrix-toolbar-card" });
  }, 220);
}


function actualProcessPage(type) {
  const assets = fleetFor(type);
  return `${pageHead(type, `<span class="range-badge">LIVE DATA</span>`)}
    ${panel(`${processConfig[type].plural} registered`, "Current machine status", actualAssetTable(assets))}
    ${panel("Live sensor measurements", "Latest validated measurements", actualSensorValues(assets))}
  `;
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
  const processOptions = [
    ["kalender", "Kalender"],
    ["continuous", "Continuous"],
    ["inspecting", "Inspecting"],
    ["finishing", "Finishing"],
    ["setting_dongnam", "Setting Dongnam · Final"],
    ["dryer", "Dryer"],
    ["calator", "Calator"],
    ["jetflow", "Jetflow"],
  ];
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
  continuous: { label: "Chemical Consumption", unit: "kg", keys: ["chemical_consumption_kg", "chemical_consumption_total_kg"] },
  inspecting: { label: "Inspected Output", unit: "m", keys: ["output_total_m"] },
  finishing: { label: "Production Output", unit: "m", keys: ["output_total_m"] },
  setting_dongnam: { label: "Production Output", unit: "m", keys: ["output_total_m"] },
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

const finishingMonitoringScopes = {
  continuous: [
    ["PW", "Pre-Wash & Washing Boxes", "PW 1–3 & PW2 1–6 (Multi-stage temperature profiles & heating control)"],
    ["ST", "Steamer & Heat Recovery", "Ruang penguapan (Steamer 96°C, Cerobong 95°C, Heat Recovery 1–4)"],
    ["DS", "Chemical Dosing & Flow", "Stasiun 1–3 dengan Pompa 1–5 (Setpoint, ml/kg, Speed, Totalizer) & Flowmeter 1–6"],
    ["OP", "Line Control & MES", "Speed 20 m/min, Batch LOT, Odometer kain, OBA, dan Dancer roll R1–R15"],
  ],
  inspecting: [
    ["SP", "Inspection speed", "Kecepatan buka dan inspeksi kain"],
    ["RT", "Runtime & output", "Waktu operasi dan panjang kain diperiksa"],
    ["QC", "Fabric quality", "Jumlah, panjang, tipe, dan posisi defect"],
    ["AI", "Camera readiness", "Status kamera dan inspeksi otomatis terencana"],
  ],
  finishing: [
    ["SP", "Line speed", "Kecepatan proses aktual"],
    ["RT", "Runtime", "Akumulasi waktu operasi mesin"],
    ["OUT", "Production output", "Total panjang kain hasil proses"],
    ["TP", "Process condition", "Temperature zone dan pressure proses"],
  ],
  setting_dongnam: [
    ["SP", "Line speed", "Kecepatan setting kain"],
    ["OUT", "Production output", "Total hasil kain dalam meter"],
    ["TP", "Temperature zones", "Monitoring temperatur Zone 01–04"],
    ["FB", "Fabric condition", "Lebar kain dan overfeed aktual"],
  ],
};

function finishingMonitoringScope(type) {
  const items = finishingMonitoringScopes[type];
  if (!items) return "";
  const fleet = fleetFor(type);
  const connectedCount = fleet.filter((m) => m.connected).length;
  const isStreaming = connectedCount > 0;
  return `<section class="card finishing-monitoring-scope">
    <div class="finishing-monitoring-head">
      <div>
        <span class="eyebrow">Monitoring scope</span>
        <h2>Parameter Utama</h2>
        <p>${isStreaming ? "Data telemetri streaming aktif dari PLC & MES gateway. Nilai parameter diperbarui secara realtime." : "Tag sudah didaftarkan dan akan menampilkan nilai aktual setelah mapping PLC, meter, atau kamera selesai."}</p>
      </div>
      <span class="data-pill ${isStreaming ? "good" : "neutral"}">${isStreaming ? `LIVE STREAMING · ${connectedCount}/${fleet.length} CONNECTED` : "PENDING MAPPING"}</span>
    </div>
    <div class="finishing-monitoring-grid">${items.map(([icon, title, detail]) => `<article><span>${actualText(icon)}</span><div><strong>${actualText(title)}</strong><small>${actualText(detail)}</small></div></article>`).join("")}</div>
  </section>`;
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
  const processFlow = ["jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam"].map((type) => {
    const fleet = fleetFor(type);
    return processNode(processConfig[type].plural, `${fleet.length} asset terdaftar`, type, statusCount(fleet, "running"), statusCount(fleet, "warning"), statusCount(fleet, "fault"));
  }).join("");
  const runs = actualRuns.length
    ? `<div class="table-wrap"><table class="data-table"><thead><tr>
        <th>Batch <span class="b2b-tooltip-trigger" data-tooltip="Nomor identifikasi unik batch pesanan produksi">ⓘ</span></th>
        <th>Asset <span class="b2b-tooltip-trigger" data-tooltip="Kode mesin yang memproses pesanan">ⓘ</span></th>
        <th>Recipe <span class="b2b-tooltip-trigger" data-tooltip="Formula proses / program mesin yang berjalan">ⓘ</span></th>
        <th>Status <span class="b2b-tooltip-trigger" data-tooltip="Kondisi siklus eksekusi run">ⓘ</span></th>
        <th>Output <span class="b2b-tooltip-trigger" data-tooltip="Kuantitas hasil keluaran yang dicatat">ⓘ</span></th>
        <th>Start <span class="b2b-tooltip-trigger" data-tooltip="Waktu awal batch mulai diproses">ⓘ</span></th>
      </tr></thead><tbody>${actualRuns.slice(0, 10).map((run) => `<tr data-tooltip="Batch ${actualText(run.batch_no)} di ${actualText(run.asset_id)} (${actualText(run.run_status)})"><td class="mono"><strong>${actualText(run.batch_no)}</strong></td><td>${actualText(run.asset_id)}</td><td class="mono">${actualText(run.recipe_code)}</td><td><span class="status-pill ${String(run.run_status).toLowerCase() === 'completed' ? 'running' : 'idle'}">${actualText(run.run_status)}</span></td><td>${actualText(run.output_quantity ?? "—")} ${actualText(run.output_unit || "")}</td><td class="mono">${actualTime(run.started_at)}</td></tr>`).join("")}</tbody></table></div>`
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
    ${finishingMonitoringScope(type)}
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
    <div class="fleet-machine-meta">
      ${machine.process === "continuous" || String(machine.id).startsWith("CT-")
        ? `<span>Speed<strong>${machine.values?.line_speed_pv != null ? `${Number(machine.values.line_speed_pv).toFixed(0)} m/min` : "—"}</strong></span>`
        : `<span>Progress<strong>${actualText(machine.progress)}%</strong></span>`}
      <span>Quality<strong>${actualText(machine.quality)}</strong></span>
      <span>Update<strong>${actualTime(machine.sourceTs)}</strong></span>
    </div>
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
    ${type === "continuous" ? continuousPidPanel(machine) : ""}
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
  if (!isPageAllowed(state.page)) return accessDeniedPage(state.page);
  if (state.page === "roles") return rolePermissionPage();
  if (state.page === "users") return userManagementPage();
  if (state.page === "overview") return databaseOverviewPage();
  if (state.page === "asset_status" || state.page === "asset_matrix") return actualAssetMatrixPage();
  if (state.page === "chemical") return actualChemicalPage();
  if (state.page === "solar") return actualSolarPage();
  if (state.page === "wwtp") return actualWwtpPage();
  if (["jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam"].includes(state.page)) return databaseProcessPage(state.page);
  if (state.page === "utilities") return actualUtilitiesPage();
  if (state.page === "alarms") return actualAlarmsPage();
  if (state.page === "trends") return actualTrendsPage();
  if (state.page === "health") return actualHealthPage();
  return databaseOverviewPage();
}

function actualDataPage() {
  if (!isPageAllowed(state.page)) return accessDeniedPage(state.page);
  if (state.page === "roles") return rolePermissionPage();
  if (state.page === "users") return userManagementPage();
  if (state.page === "overview") return actualOverviewPage();
  if (state.page === "asset_status" || state.page === "asset_matrix") return actualAssetMatrixPage();
  if (["jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam"].includes(state.page)) return actualProcessPage(state.page);
  if (state.page === "utilities") return actualUtilitiesPage();
  if (state.page === "chemical") return actualChemicalPage();
  if (state.page === "solar") return actualSolarPage();
  if (state.page === "wwtp") return actualWwtpPage();
  if (state.page === "alarms") return actualAlarmsPage();
  if (state.page === "trends") return actualTrendsPage();
  if (state.page === "health") return actualHealthPage();
  return actualOverviewPage();
}

function updateNavigationCounts() {
  const fleets = {
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
  Object.entries(fleets).forEach(([page, fleet]) => {
    const count = document.querySelector(`.nav-item[data-page="${page}"] .nav-count`);
    if (count) count.textContent = fleet.length;
  });
  const statusCount = document.getElementById("nav-asset-status-count") || document.getElementById("nav-asset-matrix-count");
  if (statusCount) statusCount.textContent = actualFleet().length;
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
