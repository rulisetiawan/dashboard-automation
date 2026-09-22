// ============================================================================
// Component: Machine Detail Modal & Diagnostics
// ============================================================================

function openMachineDetail(type, machineId) {
  const machine = fleetFor(type).find((item) => item.id === machineId);
  if (!machine || !state.drill[type]) return;
  state.page = type;
  state.selected[type] = machineId;
  state.drill[type] = { area: machine.area || null, machine: machineId };
  renderPage();
  if (isMobileScreen()) closeSidebar();
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
    renderPage({ preserveScroll: true });
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

const sidebarStorageKey = "smm-dashboard-sidebar-collapsed";

function isMobileScreen() {
  return window.innerWidth <= 680;
}

function isSidebarOpen() {
  const app = document.getElementById("app");
  const sidebar = document.getElementById("sidebar");
  if (isMobileScreen()) {
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
  if (isMobileScreen()) {
    sidebar?.classList.add("open");
  } else {
    app?.classList.remove("sidebar-collapsed");
    window.localStorage.setItem(sidebarStorageKey, "false");
  }
  updateSidebarToggleAttributes();
}

function closeSidebar() {
  const app = document.getElementById("app");
  const sidebar = document.getElementById("sidebar");
  if (isMobileScreen()) {
    sidebar?.classList.remove("open");
  } else {
    app?.classList.add("sidebar-collapsed");
    window.localStorage.setItem(sidebarStorageKey, "true");
  }
  updateSidebarToggleAttributes();
}

function toggleSidebar() {
  if (isSidebarOpen()) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function initializeSidebarState() {
  const app = document.getElementById("app");
  if (!isMobileScreen()) {
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

function applyMenuPermissions(user) {
  if (!user) return;
  const role = String(user.role || "").toUpperCase();
  const isAdmin = role === "ADMIN";
  const allowed = Array.isArray(user.allowedMenus) ? user.allowedMenus : [];

  const adminBtn = document.getElementById("admin-rbac-button");
  if (adminBtn) adminBtn.hidden = !isAdmin;
  const adminUsersBtn = document.getElementById("admin-users-button");
  if (adminUsersBtn) adminUsersBtn.hidden = !isAdmin;

  // Filter main navigation buttons
  const nav = document.getElementById("main-nav");
  if (nav) {
    const navItems = nav.querySelectorAll(".nav-item[data-page]");
    navItems.forEach((btn) => {
      const page = btn.dataset.page;
      const canAccess = (page === "roles" || page === "users")
        ? isAdmin
        : (isAdmin || page === "command_center" || page === "asset_status" || page === "asset_matrix" || allowed.includes(page));
      btn.classList.toggle("hidden", !canAccess);
    });

    // Filter group headers (Operations, Resources, Intelligence, Administration)
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

  // Pastikan page yang dipilih diizinkan untuk role ini
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
  applyMenuPermissions(user);
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
    window.setInterval(updateClock, 1000);
    window.setInterval(updateMachineConnectionIndicators, 1000);
    window.setInterval(updateLiveNumbers, 1800);
    window.setInterval(updateWwtpBackground, 15000);
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
document.getElementById("menu-button")?.addEventListener("click", toggleSidebar);
document.getElementById("sidebar-close")?.addEventListener("click", closeSidebar);
document.getElementById("sidebar-backdrop")?.addEventListener("click", closeSidebar);
window.addEventListener("resize", () => {
  if (!isMobileScreen()) {
    document.getElementById("sidebar")?.classList.remove("open");
  }
  updateSidebarToggleAttributes();
  requestAnimationFrame(initPageCharts);
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
    if (isMobileScreen() && isSidebarOpen()) closeSidebar();
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

/* ── Utility: Escape HTML ── */
function escapeHtml(value) {
  if (value == null) return "";
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[char] || char));
}

/* ── 403 Access Denied View ── */