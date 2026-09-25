// ============================================================================
// Page: Plant Utilities & Power Demand
// ============================================================================

function actualUtilitiesPage() {
  const content = backendUtilities.length
    ? `<div class="table-wrap"><table class="data-table"><thead><tr>
        <th>Code <span class="b2b-tooltip-trigger" data-tooltip="Kode register pengenal meter utilitas">ⓘ</span></th>
        <th>Meter / Utility <span class="b2b-tooltip-trigger" data-tooltip="Deskripsi jenis utilitas (Air, Listrik, Steam, Thermal Oil)">ⓘ</span></th>
        <th>Value <span class="b2b-tooltip-trigger" data-tooltip="Nilai pembacaan sensor aktual beserta satuan">ⓘ</span></th>
        <th>Source timestamp <span class="b2b-tooltip-trigger" data-tooltip="Waktu timestamp penerimaan data dari meter/PLC">ⓘ</span></th>
        <th>Quality <span class="b2b-tooltip-trigger" data-tooltip="Status integritas pembacaan data sensor">ⓘ</span></th>
      </tr></thead><tbody>${backendUtilities.map((item) => {
        const qTone = String(item.quality || '').toLowerCase() === 'good' ? 'good' : 'stale';
        return `<tr data-tooltip="${actualText(item.label)}: ${actualText(item.value)} ${actualText(item.unit)} (${actualText(item.quality)})">
          <td class="mono"><strong>${actualText(item.utility_code)}</strong></td>
          <td>${actualText(item.label)}</td>
          <td><strong>${actualText(item.value)} <small class="text-muted">${actualText(item.unit)}</small></strong></td>
          <td class="mono">${actualTime(item.source_ts)}</td>
          <td><span class="quality-pill ${qTone}">${actualText(item.quality)}</span></td>
        </tr>`;
      }).join("")}</tbody></table></div>`
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
    return `<tr data-tooltip="${actualText(item.chemical_code)} · ${actualText(item.chemical_name)}: ${chemicalNumber(item.total_kg, 2)} kg (${chemicalNumber(share, 1)}%)"><td><span class="chemical-rank-dot" style="background:${color}"></span><strong>${actualText(item.chemical_code)}</strong></td><td>${actualText(item.chemical_name)}</td><td class="mono"><strong>${chemicalNumber(item.total_kg, 2)} kg</strong></td><td class="mono">${chemicalNumber(item.transaction_count, 0)}</td><td class="mono">${chemicalNumber(item.average_kg, 2)} kg</td><td class="mono">${chemicalNumber(item.minimum_kg, 2)} / ${chemicalNumber(item.maximum_kg, 2)} kg</td><td><div class="chemical-share"><i><b style="width:${Math.min(100, share)}%;background:${color}"></b></i><span>${chemicalNumber(share, 1)}%</span></div></td></tr>`;
  }).join("");
  const content = rows ? `<div class="chemical-summary-wrap"><table class="data-table chemical-summary-table"><thead><tr>
    <th>Code <span class="b2b-tooltip-trigger" data-tooltip="Kode pengenal unik bahan kimia">ⓘ</span></th>
    <th>Chemical <span class="b2b-tooltip-trigger" data-tooltip="Nama lengkap bahan kimia / zat warna">ⓘ</span></th>
    <th>Total <span class="b2b-tooltip-trigger" data-tooltip="Akumulasi berat konsumsi pada rentang waktu terpilih">ⓘ</span></th>
    <th>Transactions <span class="b2b-tooltip-trigger" data-tooltip="Frekuensi transaksi penimbangan">ⓘ</span></th>
    <th>Average <span class="b2b-tooltip-trigger" data-tooltip="Rata-rata berat per transaksi">ⓘ</span></th>
    <th>Min / Max <span class="b2b-tooltip-trigger" data-tooltip="Nilai penimbangan terkecil dan terbesar">ⓘ</span></th>
    <th>Share <span class="b2b-tooltip-trigger" data-tooltip="Persentase kontribusi terhadap total konsumsi">ⓘ</span></th>
  </tr></thead><tbody>${rows}</tbody></table></div>` : actualEmpty("Tidak ada konsumsi chemical pada range terpilih");
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
    return `<tr data-tooltip="Batch ${actualText(item.source_row_id || item.request_code)}: ${actualText(item.chemical_name)} (${item.actual_kg == null ? "—" : `${chemicalNumber(item.actual_kg, 3)} kg`})"><td class="chemical-time-cell"><strong>${actualTime(item.started_at || item.occurred_at)}</strong><small>End ${actualTime(item.ended_at)}</small><small>${chemicalDuration(item.duration_seconds)}</small></td><td><strong class="mono">${actualText(item.source_row_id || item.request_code)}</strong><small>${actualText(item.source_file || item.source_system)}</small></td><td><strong>${actualText(item.chemical_code)}</strong><small>${actualText(item.chemical_name)}</small></td><td class="mono"><strong>${item.actual_kg == null ? "—" : `${chemicalNumber(item.actual_kg, 3)} kg`}</strong></td><td><span class="data-pill ${modeTone}">${actualText(item.mode)}</span></td><td class="chemical-emergency-cell">${detail}</td><td>${actualText(item.calator_id || "Belum teridentifikasi")}</td><td><span class="data-pill ${item.status === "Completed" ? "good" : "warning"}">${actualText(item.status)}</span></td></tr>`;
  }).join("");
  const pagination = data.pagination || { page: 1, total_pages: 1, total_rows: 0, page_size: state.chemicalLog.pageSize };
  const first = pagination.total_rows ? (pagination.page - 1) * pagination.page_size + 1 : 0;
  const last = Math.min(pagination.total_rows, pagination.page * pagination.page_size);
  const content = `<div class="chemical-log-table-wrap"><table class="data-table chemical-transaction-table"><thead><tr>
    <th>Time <span class="b2b-tooltip-trigger" data-tooltip="Waktu mulai dan selesai transaksi dispensing">ⓘ</span></th>
    <th>Source ID <span class="b2b-tooltip-trigger" data-tooltip="Nomor tiket atau identifikasi request penimbangan">ⓘ</span></th>
    <th>Chemical <span class="b2b-tooltip-trigger" data-tooltip="Kode dan nama bahan kimia yang dikeluarkan">ⓘ</span></th>
    <th>Actual <span class="b2b-tooltip-trigger" data-tooltip="Berat riil yang ditimbang oleh unit dispensing">ⓘ</span></th>
    <th>Mode <span class="b2b-tooltip-trigger" data-tooltip="Metode eksekusi (Automatic, Manual, Emergency)">ⓘ</span></th>
    <th>Process / Emergency Detail <span class="b2b-tooltip-trigger" data-tooltip="Tahapan proses atau rincian kondisi darurat">ⓘ</span></th>
    <th>Calator Destination <span class="b2b-tooltip-trigger" data-tooltip="Mesin Calator tujuan bahan kimia ini">ⓘ</span></th>
    <th>Status <span class="b2b-tooltip-trigger" data-tooltip="Status penyelesaian transaksi penimbangan">ⓘ</span></th>
  </tr></thead><tbody>${rows || `<tr><td colspan="8" class="dispensing-empty-row">Tidak ada transaksi sesuai filter.</td></tr>`}</tbody></table></div><div class="chemical-pagination"><div><strong>${chemicalNumber(first, 0)}–${chemicalNumber(last, 0)}</strong><span>dari ${chemicalNumber(pagination.total_rows, 0)} transaksi</span></div><label>Rows<select class="select-control" data-chemical-page-size><option value="25" ${pagination.page_size === 25 ? "selected" : ""}>25</option><option value="50" ${pagination.page_size === 50 ? "selected" : ""}>50</option><option value="100" ${pagination.page_size === 100 ? "selected" : ""}>100</option></select></label><div class="chemical-page-actions"><button class="button small" data-chemical-page="prev" ${pagination.page <= 1 ? "disabled" : ""}>← Previous</button><span>Page <strong>${pagination.page}</strong> / ${pagination.total_pages}</span><button class="button small" data-chemical-page="next" ${pagination.page >= pagination.total_pages ? "disabled" : ""}>Next →</button></div></div>`;
  const autoUpdateConnected = backendConnection.realtime === "connected";
  const autoUpdateBadge = `<span class="data-pill ${autoUpdateConnected ? "good" : "warning"}">${autoUpdateConnected ? "LIVE AUTO-UPDATE" : "AUTO-UPDATE PAUSED"}</span>`;
  return panel("Chemical Transaction Log", "Automatic, Manual, dan Emergency · transaksi baru dimuat otomatis", content, autoUpdateBadge, "chemical-transaction-panel");
}

function chemicalUnitHeader(machine, data) {
  const supported = dispensingSupportedCalators(machine);
  return `<section class="card chemical-unit-hero"><div><span class="eyebrow">CHEMICAL DISPENSING UNIT</span><h1>${actualText(machine.name)}</h1><p>${actualText(machine.id)} · Area ${actualText(machine.areaLabel)} · mendukung ${supported.length} Calator</p></div><div class="chemical-supported-list"><span>Supported Calators</span><strong>${supported.map((item) => actualText(item.id)).join(" · ") || "Belum dimapping"}</strong><small>Destination transaksi tetap “Belum teridentifikasi” sampai calator_id tersedia dari sumber.</small></div><div class="chemical-unit-live">${machineConnectionBadge(machine, "controller")}${machineControlModeBadge(machine)}<div class="chemical-unit-live-reading"><span>Machine state</span>${statusPill(machine.state || "offline")}</div><div class="chemical-unit-live-reading"><span>Last transaction</span><strong>${actualTime(data.summary?.last_transaction_at)}</strong></div></div></section>`;
}
