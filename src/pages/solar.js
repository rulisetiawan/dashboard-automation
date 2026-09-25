// ============================================================================
// Page: Solar Fueling Operations
// ============================================================================

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

function solarNumber(value, decimals = 1) {
  return Number(value || 0).toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function solarStatusPill(status) {
  const value = String(status || "UNKNOWN").toUpperCase();
  const tone = ["COMPLETED", "VERIFIED", "POSTED"].includes(value) ? "good" : ["FAILED", "REJECTED", "MANUAL_REVIEW"].includes(value) ? "bad" : ["PARTIAL", "SUBMITTED", "DISPENSING"].includes(value) ? "warning" : "neutral";
  return `<span class="data-pill ${tone}">${actualText(value.replaceAll("_", " "))}</span>`;
}

function solarRangeToolbar() {
  const buttons = [["TODAY","Today"],["7D","7 days"],["30D","30 days"],["90D","90 days"],["ALL","All history"],["CUSTOM","Custom"]].map(([value,label]) => `<button class="button small ${state.solar.range === value ? "primary" : "ghost"}" data-solar-range="${value}">${label}</button>`).join("");
  const rangeLabel = state.solar.range === "TODAY" ? `Today · 00:00—${actualTime(solarRange().to)}` : state.solar.range === "ALL" ? "All available history" : state.solar.range === "CUSTOM" ? `${actualTime(solarRange().from)} — ${actualTime(solarRange().to)}` : `${state.solar.range} rolling window`;
  return `<section class="card solar-toolbar"><div><span class="eyebrow">ANALYSIS RANGE</span><strong>${actualText(rangeLabel)}</strong></div><div class="solar-range-actions">${buttons}</div>${state.solar.range === "CUSTOM" ? `<div class="solar-custom-range"><label>From<input type="datetime-local" data-solar-date="from" value="${toDateTimeLocal(state.solar.customFrom)}"></label><label>To<input type="datetime-local" data-solar-date="to" value="${toDateTimeLocal(state.solar.customTo)}"></label><button class="button primary small" data-solar-apply-range>Apply</button></div>` : ""}</section>`;
}

function solarTransactionTable(data, compact = false) {
  const rows = (data?.transactions || []).map((item) => {
    const requested = Number(item.requested_liters || 0), final = ["COMPLETED","PARTIAL"].includes(String(item.transaction_status || "").toUpperCase());
    const metered = final && item.metered_liters != null ? Number(item.metered_liters) : null, variance = metered == null ? null : metered-requested;
    const totalizer = final && item.machine_totalizer_liters != null ? Number(item.machine_totalizer_liters) : null;
    return `<tr data-tooltip="QR ${actualText(item.qr_code)} · ${actualText(item.consumer_label || item.consumer_id || 'Consumer')}: ${metered == null ? `${solarNumber(requested)} L (Req)` : `${solarNumber(metered)} L`} (${actualText(item.transaction_status)})"><td><strong>${actualTime(item.fueling_completed_at || item.qr_created_at || item.fueling_started_at || item.source_updated_at || item.ingested_at)}</strong><small>${actualText(item.source_system)}</small></td><td><strong class="mono">${actualText(item.qr_code)}</strong><small>${actualText(item.consumer_label || item.consumer_id || "Consumer belum dimapping")}</small></td><td><strong>${actualText(item.requester_name || "—")}</strong><small>${actualText(item.processed_by || item.qr_created_by || "—")}</small></td><td class="mono">${solarNumber(requested)} L</td><td class="mono"><strong>${metered == null ? "—" : `${solarNumber(metered)} L`}</strong></td><td class="mono ${variance != null && Math.abs(variance) > Math.max(1,requested*.02) ? "solar-variance-bad" : ""}">${variance == null ? "—" : `${variance >= 0 ? "+" : ""}${solarNumber(variance)} L`}</td><td class="mono">${totalizer == null ? "—" : `${solarNumber(totalizer)} L`}</td><td>${solarStatusPill(item.transaction_status)}</td></tr>`;
  }).join("");
  return `<div class="table-wrap solar-table-wrap"><table class="data-table solar-table"><thead><tr>
    <th>Activity time <span class="b2b-tooltip-trigger" data-tooltip="Waktu penyelesaian pengisian solar atau pembuatan QR">ⓘ</span></th>
    <th>QR / Consumer <span class="b2b-tooltip-trigger" data-tooltip="Kode QR otorisasi dan unit mesin/kendaraan penerima">ⓘ</span></th>
    <th>Requester / Operator <span class="b2b-tooltip-trigger" data-tooltip="Nama penanggung jawab permintaan dan operator dispenser">ⓘ</span></th>
    <th>Requested <span class="b2b-tooltip-trigger" data-tooltip="Volume solar yang diajukan dalam tiket permintaan">ⓘ</span></th>
    <th>Flow meter <span class="b2b-tooltip-trigger" data-tooltip="Volume aktual yang tercatat oleh flow meter digital">ⓘ</span></th>
    <th>Variance <span class="b2b-tooltip-trigger" data-tooltip="Selisih antara volume permintaan dengan volume realisasi">ⓘ</span></th>
    <th>Totalizer <span class="b2b-tooltip-trigger" data-tooltip="Angka kumulatif meter mekanik dispenser solar">ⓘ</span></th>
    <th>Status <span class="b2b-tooltip-trigger" data-tooltip="Status verifikasi transaksi pengisian">ⓘ</span></th>
  </tr></thead><tbody>${rows || `<tr><td colspan="8">${compact ? "Belum ada transaksi terbaru." : "Tidak ada transaksi sesuai filter."}</td></tr>`}</tbody></table></div>`;
}

function solarNiceMaximum(value) {
  const numeric = Math.max(1,Number(value) || 0), magnitude = 10 ** Math.floor(Math.log10(numeric)), normalized = numeric/magnitude;
  return (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;
}

function solarBucketLabel(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", state.solar.range === "TODAY" ? { timeZone:"Asia/Jakarta",hour:"2-digit",minute:"2-digit",hourCycle:"h23" } : { timeZone:"Asia/Jakarta",day:"2-digit",month:"short" }).format(parsed);
}

function solarComparisonCard(index,title,leftLabel,leftValue,rightLabel,rightValue,difference,reference,detail) {
  const available = difference != null && reference != null && Number.isFinite(Number(difference)) && Number.isFinite(Number(reference));
  const liters = available ? Number(difference) : null, percent = available && Number(reference) !== 0 ? liters/Math.abs(Number(reference))*100 : null;
  const tone = liters == null ? "neutral" : Math.abs(liters) <= Math.max(1,Math.abs(Number(reference))*0.02) ? "good" : "bad";
  const signedLiters = liters == null ? "N/A" : `${liters >= 0 ? "+" : ""}${solarNumber(liters)} L`;
  const signedPercent = percent == null ? "N/A" : `${percent >= 0 ? "+" : ""}${solarNumber(percent,2)}%`;
  return `<article class="card solar-recon-card"><header><span>${actualText(index)}</span><h3>${actualText(title)}</h3></header><div class="solar-compare-values"><div><small>${actualText(leftLabel)}</small><strong>${actualText(leftValue)}</strong></div><div><small>${actualText(rightLabel)}</small><strong>${actualText(rightValue)}</strong></div></div><div class="solar-compare-difference ${tone}"><span>Selisih</span><strong>${signedLiters}</strong><em>${signedPercent}</em></div><p>${actualText(detail)}</p></article>`;
}

function solarQrStatusCard(label,value,detail,tone) {
  return `<article class="card solar-status-card ${tone}"><span></span><div><small>${actualText(label)}</small><strong>${solarNumber(value,0)}</strong><p>${actualText(detail)}</p></div></article>`;
}

function solarOverview(data) {
  const overview = data.overview || {}, summary = overview.summary || {}, trend = overview.time_series || [], users = overview.user_ranking || [];
  const maximum = solarNiceMaximum(Math.max(0,...trend.map((item) => Number(item.metered_liters || 0))));
  const bars = trend.map((item) => { const value = Number(item.metered_liters || 0), requested = Number(item.requested_liters || 0), gap = value-requested, period = actualTime(item.bucket); return `<div class="solar-trend-column" tabindex="0" role="img" aria-label="${actualText(`${period}, actual ${solarNumber(value)} liter, requested ${solarNumber(requested)} liter, gap ${gap>=0?"+":""}${solarNumber(gap)} liter`)}" data-solar-trend-period="${actualText(period)}" data-solar-trend-actual="${actualText(`${solarNumber(value)} L`)}" data-solar-trend-requested="${actualText(`${solarNumber(requested)} L`)}" data-solar-trend-gap="${actualText(`${gap>=0?"+":""}${solarNumber(gap)} L`)}"><i style="height:${Math.max(2,value/maximum*100)}%"></i><span>${actualText(solarBucketLabel(item.bucket))}</span></div>`; }).join("");
  const yTicks = [1,.75,.5,.25,0].map((ratio) => `<span>${solarNumber(maximum*ratio,0)} L</span>`).join("");
  const gridLines = [1,.75,.5,.25,0].map(() => "<i></i>").join("");
  const consumptionChart = `<div class="solar-bar-chart"><div class="solar-y-axis">${yTicks}</div><div class="solar-plot"><div class="solar-grid-lines">${gridLines}</div><div class="solar-trend">${bars}</div></div></div>`;
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
    ${actualMetric("Metering Match", match, "", "Flow-meter sum and totalizer delta")}
    ${actualMetric("Stock Accuracy", accuracy, "", "Latest physical stock opname")}
    ${actualMetric("Need Review", solarNumber(summary.review_count,0), "items", "Variance, partial, failed, manual review")}
  </section>
  <section class="solar-status-grid" aria-label="QR status summary">
    ${solarQrStatusCard("QR Pending",summary.pending_qr_count,"Created, ready, or dispensing","pending")}
    ${solarQrStatusCard("Completed",summary.completed_transactions,"Completed and partial","completed")}
    ${solarQrStatusCard("Cancelled",summary.cancelled_qr_count,"Cancelled QR","cancelled")}
    ${solarQrStatusCard("Not Match",summary.not_match_count,"Actual gap above 2%","mismatch")}
    ${solarQrStatusCard("Failed / Review",summary.failed_review_count,"Failed or manual review","review")}
  </section>
  <section class="solar-reconciliation-grid">
    ${solarComparisonCard("01 · DISPENSING","Request & Actual","Requested",`${solarNumber(summary.requested_liters)} L`,"Flow meter actual",`${solarNumber(summary.metered_liters)} L`,Number(summary.metered_liters)-Number(summary.requested_liters),Number(summary.requested_liters),"Actual dikurangi request QR pada range terpilih.")}
    ${solarComparisonCard("02 · TOTALIZER","Transaction Sum & Totalizer Delta","Backend flow-meter sum",`${solarNumber(summary.metered_liters)} L`,"Totalizer delta",summary.machine_delta_liters == null?"N/A":`${solarNumber(summary.machine_delta_liters)} L`,summary.machine_delta_liters == null?null:Number(summary.machine_delta_liters)-Number(summary.metered_liters),Number(summary.metered_liters),summary.first_totalizer_liters==null||summary.latest_totalizer_liters==null?"Minimal dua sampel totalizer diperlukan.":`Akhir ${solarNumber(summary.latest_totalizer_liters)} L dikurangi awal ${solarNumber(summary.first_totalizer_liters)} L.${summary.totalizer_reset_count?` ${summary.totalizer_reset_count} reset terdeteksi.`:""}`)}
    ${solarComparisonCard("03 · INVENTORY","System Stock & Level Sensor","Calculated system stock",`${solarNumber(summary.system_stock_liters)} L`,"Live level sensor",summary.live_stock_liters == null?"N/A":`${solarNumber(summary.live_stock_liters)} L`,summary.live_stock_liters == null?null:Number(summary.live_stock_liters)-Number(summary.system_stock_liters),Number(summary.system_stock_liters),"Sensor dikurangi calculated stock; opname fisik menjadi validasi final.")}
  </section>
  <section class="solar-analysis-grid">${panel("Consumption Trend", "Actual flow-meter output per interval · nilai sumbu Y dalam liter", trend.length ? consumptionChart : actualEmpty("Belum ada transaksi pada range ini"), `<span class="data-pill good">FLOW METER</span>`, "solar-trend-panel")}${panel("Top Requesters", "Total konsumsi berdasarkan user", userRows ? `<div class="solar-user-list">${userRows}</div>` : actualEmpty("Belum ada data requester"))}</section>
  ${panel("Recent Fueling Transactions", "QR, volume requested, actual flow meter, dan totalizer", solarTransactionTable(data.transactions, true), `<button class="button small" data-solar-tab="transactions">Open full log →</button>`)}`;
}

function solarTransactions(data) {
  const transactionData = data.transactions || {}, page = transactionData.pagination || { page:1,total_pages:1,total_rows:0 };
  return `<section class="card solar-filter-card"><form data-solar-search-form><label>Search QR or user<input type="search" name="search" value="${actualText(state.solar.search)}" placeholder="QR code, requester, operator…"></label><label>Status<select name="status"><option value="all">All status</option>${["QR_CREATED","READY","DISPENSING","COMPLETED","PARTIAL","FAILED","MANUAL_REVIEW","CANCELLED"].map((value) => `<option value="${value}" ${state.solar.status===value?"selected":""}>${value.replaceAll("_"," ")}</option>`).join("")}</select></label><button class="button primary" type="submit">Search log</button></form></section>${panel("Fueling Transaction Log", "Server-side search dan pagination · tidak menggeser posisi halaman saat auto-update", `${solarTransactionTable(transactionData)}<div class="solar-pagination"><span><strong>${solarNumber(page.total_rows,0)}</strong> records</span><div><button class="button small" data-solar-page="prev" ${page.page<=1?"disabled":""}>← Previous</button><span>Page ${page.page} / ${page.total_pages}</span><button class="button small" data-solar-page="next" ${page.page>=page.total_pages?"disabled":""}>Next →</button></div></div>`, `<span class="data-pill ${backendConnection.realtime === "connected" ? "good" : "warning"}">${backendConnection.realtime === "connected" ? "LIVE AUTO-UPDATE" : "AUTO-UPDATE PAUSED"}</span>`, "solar-log-panel")}`;
}

function solarMovements(data) {
  const rows = (data.movements?.movements || []).map((item) => `<tr><td>${actualTime(item.occurred_at)}</td><td>${solarStatusPill(item.movement_type)}</td><td><strong>${actualText(item.direction)}</strong></td><td class="mono"><strong>${solarNumber(item.quantity_liters)} L</strong></td><td class="mono">${actualText(item.reference_code)}</td><td>${actualText(item.created_by)}</td><td>${actualText(item.notes)}</td></tr>`).join("");
  return `<section class="solar-operation-grid">${panel("Register Stock Movement", "Catat penerimaan, adjustment, atau transfer selain fueling", `<form class="solar-entry-form" data-solar-movement-form><label>Movement<select name="movement_type"><option value="RECEIPT">Receipt</option><option value="ADJUSTMENT">Adjustment</option><option value="TRANSFER">Transfer</option></select></label><label>Direction<select name="direction"><option value="IN">IN</option><option value="OUT">OUT</option></select></label><label>Quantity (L)<input type="number" name="quantity_liters" min="0.001" step="0.001" required></label><label>Reference<input name="reference_code" maxlength="160" placeholder="Delivery note / adjustment"></label><label class="wide">Notes<textarea name="notes" rows="2"></textarea></label><button class="button primary" type="submit">Save movement</button></form>`)}${panel("Stock Control Rule", "Fueling OUT berasal dari transaksi flow meter dan tidak diduplikasi", `<div class="solar-stock-rule"><strong>System Stock</strong><span>Opening stock + receipts − metered fueling ± adjustments</span><small>Semua perubahan manual tercatat bersama user yang melakukan input.</small></div>`)}</section>${panel("Stock Movement Log", "Non-fueling inventory movement", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Type</th><th>Direction</th><th>Quantity</th><th>Reference</th><th>Created by</th><th>Notes</th></tr></thead><tbody>${rows || `<tr><td colspan="7">Belum ada stock movement.</td></tr>`}</tbody></table></div>`)}`;
}

function solarOpnames(data) {
  const rows = (data.opnames?.opnames || []).map((item) => `<tr><td><strong class="mono">${actualText(item.opname_number)}</strong><small>${actualTime(item.cutoff_at)}</small></td><td class="mono">${solarNumber(item.system_stock_liters)} L</td><td class="mono"><strong>${solarNumber(item.physical_stock_liters)} L</strong></td><td class="mono ${Math.abs(Number(item.variance_liters||0))>1?"solar-variance-bad":""}">${Number(item.variance_liters)>=0?"+":""}${solarNumber(item.variance_liters)} L</td><td>${item.accuracy_percent==null?"N/A":`${solarNumber(item.accuracy_percent,2)}%`}</td><td>${solarStatusPill(item.status)}</td><td>${actualText(item.measured_by)}</td><td>${["SUBMITTED","VERIFIED"].includes(item.status) ? `<div class="solar-row-actions">${item.status==="SUBMITTED"?`<button class="button small" data-solar-opname-action="VERIFY" data-solar-opname-id="${actualText(item.opname_id)}">Verify</button>`:""}${item.status==="VERIFIED"?`<button class="button primary small" data-solar-opname-action="POST" data-solar-opname-id="${actualText(item.opname_id)}">Post</button>`:""}<button class="button ghost small" data-solar-opname-action="REJECT" data-solar-opname-id="${actualText(item.opname_id)}">Reject</button></div>` : "—"}</td></tr>`).join("");
  return `<section class="solar-operation-grid">${panel("New Stock Opname", "Bandingkan stok sistem dengan hasil pengukuran fisik", `<form class="solar-entry-form" data-solar-opname-form><label>Physical stock (L)<input type="number" name="physical_stock_liters" min="0" step="0.001" required></label><label>Measurement method<select name="measurement_method"><option value="DIPSTICK">Dipstick</option><option value="TANK_GAUGE">Tank gauge</option><option value="FLOWMETER_RECONCILIATION">Flowmeter reconciliation</option></select></label><label>Status<select name="status"><option value="SUBMITTED">Submit for verification</option><option value="DRAFT">Save draft</option></select></label><label class="wide">Notes<textarea name="notes" rows="2" placeholder="Kondisi tank, waktu ukur, atau catatan selisih"></textarea></label><button class="button primary" type="submit">Record opname</button></form>`)}${panel("Approval Workflow", "Pemisahan input dan validasi menjaga audit trail", `<div class="solar-workflow"><span>DRAFT</span><i>→</i><span>SUBMITTED</span><i>→</i><span>VERIFIED</span><i>→</i><span>POSTED</span></div><p class="solar-workflow-note">Supervisor, Engineer, atau Admin dapat memverifikasi dan mem-posting hasil opname.</p>`)}</section>${panel("Stock Opname History", "System stock, physical stock, variance, dan accuracy", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Opname</th><th>System</th><th>Physical</th><th>Variance</th><th>Accuracy</th><th>Status</th><th>Measured by</th><th>Action</th></tr></thead><tbody>${rows || `<tr><td colspan="8">Belum ada stock opname.</td></tr>`}</tbody></table></div>`)}`;
}

function bindSolarTrendTooltips() {
  const bars = document.querySelectorAll("[data-solar-trend-period]");
  let tooltip = document.querySelector("[data-solar-trend-tooltip]");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "solar-trend-tooltip";
    tooltip.dataset.solarTrendTooltip = "true";
    tooltip.setAttribute("role", "tooltip");
    document.body.appendChild(tooltip);
  }
  tooltip.classList.remove("visible");
  if (!bars.length) return;
  const position = (x,y) => {
    const left = Math.min(window.innerWidth-tooltip.offsetWidth-12,Math.max(12,x+14));
    const top = Math.min(window.innerHeight-tooltip.offsetHeight-12,Math.max(12,y-tooltip.offsetHeight-14));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };
  const show = (bar,x,y) => {
    tooltip.textContent = `${bar.dataset.solarTrendPeriod}\nActual      ${bar.dataset.solarTrendActual}\nRequested   ${bar.dataset.solarTrendRequested}\nGap         ${bar.dataset.solarTrendGap}`;
    tooltip.classList.add("visible");
    position(x,y);
  };
  const hide = () => tooltip.classList.remove("visible");
  bars.forEach((bar) => {
    bar.addEventListener("pointerenter", (event) => show(bar,event.clientX,event.clientY));
    bar.addEventListener("pointermove", (event) => position(event.clientX,event.clientY));
    bar.addEventListener("pointerleave", hide);
    bar.addEventListener("focus", () => { const rect=bar.getBoundingClientRect(); show(bar,rect.left+rect.width/2,rect.top); });
    bar.addEventListener("blur", hide);
  });
}
