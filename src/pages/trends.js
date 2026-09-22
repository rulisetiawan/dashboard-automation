// ============================================================================
// Page: Historical Trends & Explorer Graph
// ============================================================================

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
