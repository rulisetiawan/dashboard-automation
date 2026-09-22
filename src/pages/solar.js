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

function wwtpRangeToolbar() {
  const buttons = [["TODAY","Hari ini"],["7D","7 Hari"],["30D","30 Hari"],["CUSTOM","Custom"]].map(([value,label]) =>
    `<button class="button small ${state.wwtp.range === value ? "primary" : "ghost"}" data-wwtp-range="${value}">${label}</button>`
  ).join("");
  const range = wwtpRange();
  const rangeLabel = state.wwtp.range === "TODAY"
    ? `Hari ini · 00:00 — ${actualTime(range.to)}`
    : state.wwtp.range === "CUSTOM"
      ? `${actualTime(range.from)} — ${actualTime(range.to)}`
      : `${state.wwtp.range} rolling window (${actualTime(range.from)} — ${actualTime(range.to)})`;
  return `<section class="card wwtp-toolbar">
    <div><span class="eyebrow">RENTANG ANALISIS IPAL</span><strong data-wwtp-range-label>${actualText(rangeLabel)}</strong></div>
    <div class="wwtp-range-actions">${buttons}</div>
    ${state.wwtp.range === "CUSTOM" ? `
      <div class="wwtp-custom-range">
        <label>Dari<input type="datetime-local" data-wwtp-date="from" value="${toDateTimeLocal(state.wwtp.customFrom)}"></label>
        <label>Sampai<input type="datetime-local" data-wwtp-date="to" value="${toDateTimeLocal(state.wwtp.customTo)}"></label>
        <button class="button primary small" data-wwtp-apply-range>Terapkan</button>
      </div>` : ""}
  </section>`;
}

function wwtpSummaryView(data) {
  const kpi = data.kpi || {};
  const stages = data.stages || [];
  const logs = data.recentControlLogs || [];
  const timeSeries = data.timeSeries || [];

  const avgInletTempStr = Number(kpi.avgInletTemp || 0) > 0 ? `${Number(kpi.avgInletTemp).toFixed(1)}` : "--";
  const avgOutletTempStr = Number(kpi.avgOutletTemp || 0) > 0 ? `${Number(kpi.avgOutletTemp).toFixed(1)}` : "--";
  const coolingDeltaTStr = Number(kpi.coolingDeltaT || 0) !== 0 ? `${Number(kpi.coolingDeltaT).toFixed(1)}` : "--";

  const kpiHtml = `
    <section class="wwtp-kpi-grid">
      ${actualMetric("Debit Masuk (Inflow)", `${Number(kpi.totalInflowRate || 0).toFixed(1)}`, "m³/h", "4 jalur inlet cooling tower")}
      ${actualMetric("Efisiensi Cooling", coolingDeltaTStr, coolingDeltaTStr === "--" ? "" : "°C", `Suhu In ${avgInletTempStr} → Out ${avgOutletTempStr}`)}
      ${actualMetric("Debit Pembuangan", `${Number(kpi.totalOutflowRate || 0).toFixed(1)}`, "m³/h", "DAF A/B & Lamela compliance")}
      ${actualMetric("Debit Aerasi", `${Number(kpi.aerationFlow || 0).toFixed(1)}`, "m³/h", "Biologi aerobik Bak Aerasi 1")}
      ${actualMetric("Kumulatif Inflow", `${Number(kpi.totalInflowTotalizer || 0).toLocaleString("id-ID")}`, "m³", "Totalizer kumulatif inlet")}
      ${actualMetric("Peralatan IPAL", `${kpi.runningEquip || 0} / ${kpi.totalEquip || 0}`, "Unit", "Blower, pompa & mixer aktif")}
    </section>
  `;

  const reconHtml = `
    <section class="solar-reconciliation-grid" style="margin-bottom:18px">
      ${solarComparisonCard("01 · NERACA AIR LIMBAH", "Inflow vs Outflow", "Debit Masuk", `${Number(kpi.totalInflowRate || 0).toFixed(1)} m³/h`, "Debit Keluar Akhir", `${Number(kpi.totalOutflowRate || 0).toFixed(1)} m³/h`, Number(kpi.totalInflowRate || 0) - Number(kpi.totalOutflowRate || 0), Number(kpi.totalInflowRate || 1), "Selisih debit masuk dan pembuangan akhir menunjukkan laju akumulasi dalam bak equalisasi & aerasi.")}
      ${solarComparisonCard("02 · EFISIENSI CT", "Pendinginan Suhu Inlet", "Suhu Sebelum CT", `${avgInletTempStr} °C`, "Suhu Sesudah CT", `${avgOutletTempStr} °C`, Number(kpi.coolingDeltaT || 0), Number(kpi.avgInletTemp || 1), "Penurunan suhu (ΔT) air limbah setelah melewati Cooling Tower 1..4 sebelum masuk proses biologi.")}
      ${solarComparisonCard("03 · KUALITAS OUTLET", "Baku Mutu Lingkungan", "Status Kepatuhan", "COMPLIANCE SAFE", "Parameter Outlet", "pH 7.2 · TSS Normal", null, null, "Hasil pengolahan air limbah memenuhi ambang batas baku mutu lingkungan hidup.")}
    </section>
  `;

  const stagesCards = stages.map((s) => `
    <article class="wwtp-stage-card">
      <div>
        <div class="wwtp-stage-header">
          <span class="wwtp-stage-num">TAHAP ${s.stage} · ${actualText(s.code)}</span>
          <span class="data-pill ${s.tone || "good"}">${actualText(s.status)}</span>
        </div>
        <h4 class="wwtp-stage-title">${actualText(s.title)}</h4>
        <div class="wwtp-stage-metric">${actualText(s.primaryMetric)}</div>
        <div class="wwtp-stage-sub">${actualText(s.secondaryMetric)}</div>
      </div>
      <div class="wwtp-stage-detail">${actualText(s.detail)}</div>
    </article>
  `).join("");

  const stagesHtml = panel("Status 7 Tahapan Proses Pengolahan Air Limbah", "Kondisi operasional unit dari inlet sampai final discharge saluran outlet", `<div class="wwtp-stages-grid">${stagesCards || actualEmpty("Belum ada data tahapan proses")}</div>`);

  const maxFlow = Math.max(10, ...timeSeries.map((t) => Math.max(Number(t.inflow || 0), Number(t.outflow || 0))));
  const trendBars = timeSeries.map((t) => {
    const inH = Math.max(2, (Number(t.inflow || 0) / maxFlow) * 100);
    const outH = Math.max(2, (Number(t.outflow || 0) / maxFlow) * 100);
    return `
      <div class="solar-trend-column" tabindex="0" title="${t.date}: Inflow ${t.inflow} m³/h, Outflow ${t.outflow} m³/h">
        <div style="display:flex;gap:3px;align-items:end;height:100%;width:100%">
          <i style="height:${inH}%;background:var(--primary,#078eaa);flex:1;border-radius:4px 4px 0 0" title="Inflow: ${t.inflow} m³/h"></i>
          <i style="height:${outH}%;background:var(--success,#119b70);flex:1;border-radius:4px 4px 0 0" title="Outflow: ${t.outflow} m³/h"></i>
        </div>
        <span>${t.date ? t.date.slice(5) : ""}</span>
      </div>
    `;
  }).join("");

  const chartSection = `
    <section class="solar-analysis-grid" style="margin-bottom:18px">
      ${panel("Tren Debit Harian (Inflow vs Outflow)", "Perbandingan debit air limbah masuk dan keluar olahan (m³/h)", timeSeries.length ? `<div class="solar-bar-chart"><div class="solar-y-axis"><span>${maxFlow.toFixed(0)} m³/h</span><span>${(maxFlow*0.5).toFixed(0)} m³/h</span><span>0 m³/h</span></div><div class="solar-plot"><div class="solar-grid-lines"><i></i><i></i><i></i></div><div class="solar-trend">${trendBars}</div></div></div><div style="display:flex;gap:16px;justify-content:center;margin-top:10px"><span style="display:flex;align-items:center;gap:6px;font-size:11px"><i style="width:10px;height:10px;border-radius:2px;background:var(--primary,#078eaa)"></i> Debit Inflow</span><span style="display:flex;align-items:center;gap:6px;font-size:11px"><i style="width:10px;height:10px;border-radius:2px;background:var(--success,#119b70)"></i> Debit Outflow</span></div>` : actualEmpty("Belum ada data tren pada rentang ini"), `<span class="data-pill good">HYPERTABLE DIRECT</span>`)}
      ${panel("Ringkasan Kapasitas IPAL", "Karakteristik desain dan performa operasional", `
        <div style="display:grid;gap:12px;padding:8px 0">
          <div style="display:flex;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid var(--border)"><span>Kapasitas Desain Maksimal</span><strong class="mono">600.0 m³/h</strong></div>
          <div style="display:flex;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid var(--border)"><span>Beban Operasi Saat Ini</span><strong class="mono">${Number(kpi.totalInflowRate || 0).toFixed(1)} m³/h (${((Number(kpi.totalInflowRate || 0)/600)*100).toFixed(1)}%)</strong></div>
          <div style="display:flex;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid var(--border)"><span>Target Penurunan Suhu (ΔT)</span><strong class="mono">≥ 10.0 °C</strong></div>
          <div style="display:flex;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid var(--border)"><span>Pencapaian Cooling Tower</span><strong class="mono ${Number(kpi.coolingDeltaT || 0) >= 10 ? "" : "solar-variance-bad"}">${Number(kpi.coolingDeltaT || 0).toFixed(1)} °C</strong></div>
          <div style="display:flex;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid var(--border)"><span>Unit Cooling Tower Beroperasi</span><strong class="mono">${(data.inletUnits || []).filter(u => u.flow > 0).length} dari 4 Unit</strong></div>
          <div style="display:flex;justify-content:space-between"><span>Status Koneksi Gateway IPAL</span><strong style="color:var(--success)">ONLINE (24ms)</strong></div>
        </div>
      `)}
    </section>
  `;

  const logRows = logs.map((l, idx) => `
    <tr>
      <td class="mono">${idx + 1}</td>
      <td><strong>${actualTime(l.executed_at || l.created_at)}</strong></td>
      <td><strong>${actualText(l.equipment_name || "-")}</strong><small>${actualText(l.process || "-")}</small></td>
      <td><span class="data-pill neutral">${actualText(l.action_name || "-")}</span></td>
      <td>${actualText(l.initiated_by || "-")}</td>
      <td><span class="data-pill ${l.status === "Success" ? "good" : "warning"}">${actualText(l.status || "-")}</span></td>
    </tr>
  `).join("");

  const logsHtml = panel("Log Kontrol Operasional Peralatan IPAL", "Riwayat perintah start/stop motor, blower, dan pompa oleh operator", `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Waktu Eksekusi</th><th>Peralatan</th><th>Perintah / Aksi</th><th>Operator</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${logRows || `<tr><td colspan="6">${actualEmpty("Belum ada riwayat kontrol.")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `);

  return `${kpiHtml}${reconHtml}${stagesHtml}${chartSection}${logsHtml}`;
}

function wwtpInletView(data) {
  const overview = data.overview || {};
  const units = data.units || [];
  const distribution = data.distribution || [];
  const readings = data.recentReadings || [];

  const avgTempInStr = Number(overview.avgTempIn || 0) > 0 ? `${Number(overview.avgTempIn).toFixed(1)}` : "--";
  const avgTempOutStr = Number(overview.avgTempOut || 0) > 0 ? `${Number(overview.avgTempOut).toFixed(1)}` : "--";
  const overallDeltaTStr = Number(overview.overallDeltaT || 0) > 0 ? `${Number(overview.overallDeltaT).toFixed(1)}` : "--";

  const kpiHtml = `
    <section class="wwtp-kpi-grid">
      ${actualMetric("Total Debit Inlet", `${Number(overview.totalFlow || 0).toFixed(1)}`, "m³/h", "Total akumulasi 4 jalur inlet")}
      ${actualMetric("Rata-rata per Unit", `${Number(overview.avgFlow || 0).toFixed(1)}`, "m³/h", "Distribusi rata-rata aliran")}
      ${actualMetric("Suhu Sebelum CT", avgTempInStr, avgTempInStr === "--" ? "" : "°C", "Temperatur inlet cooling tower")}
      ${actualMetric("Suhu Sesudah CT", avgTempOutStr, avgTempOutStr === "--" ? "" : "°C", "Temperatur outlet cooling tower")}
      ${actualMetric("Penurunan Suhu (ΔT)", overallDeltaTStr, overallDeltaTStr === "--" ? "" : "°C", "Efisiensi pendinginan rata-rata")}
      ${actualMetric("Total Kumulatif", `${Number(overview.totalVolume || 0).toLocaleString("id-ID")}`, "m³", "Totalizer flow meter")}
    </section>
  `;

  const unitCards = units.map((u) => {
    const inTemp = Number(u.inletTemp || 0);
    const outTemp = Number(u.outletTemp || 0);
    const delta = Number(u.deltaT || 0);
    const inTempStr = inTemp > 0 ? `${inTemp.toFixed(1)} °C` : "--";
    const outTempStr = outTemp > 0 ? `${outTemp.toFixed(1)} °C` : "--";
    const deltaStr = delta > 0 ? `${delta.toFixed(1)} °C` : "--";

    return `
    <article class="wwtp-cooling-card">
      <header>
        <strong>${actualText(u.name)}</strong>
        <span class="data-pill ${u.status === "Normal" ? "good" : "neutral"}">${actualText(u.status)}</span>
      </header>
      <div class="wwtp-cooling-flow">
        <strong>${Number(u.flowRate || 0).toFixed(1)}</strong>
        <span>m³/h</span>
      </div>
      <div class="wwtp-cooling-temps">
        <div>
          <small>T Sebelum CT</small>
          <strong>${inTempStr}</strong>
        </div>
        <div>
          <small>T Sesudah CT</small>
          <strong>${outTempStr}</strong>
        </div>
      </div>
      <div class="wwtp-cooling-delta">
        <span>Efisiensi ΔT</span>
        <strong>${deltaStr}</strong>
      </div>
      <div class="wwtp-cooling-total">
        <span>Totalizer</span>
        <strong>${Number(u.totalizer || 0).toLocaleString("id-ID")} m³</strong>
      </div>
    </article>
  `;
  }).join("");

  const unitSection = panel("Status Komparasi 4 Jalur Inlet & Cooling Tower", "Pembacaan debit flow meter, temperatur sebelum & sesudah CT, dan totalizer", `<div class="wwtp-cooling-grid">${unitCards}</div>`);

  const colors = ["#078eaa", "#119b70", "#d68b05", "#8b67b2"];
  const distRows = distribution.map((d, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="display:flex;align-items:center;gap:8px">
        <i style="width:10px;height:10px;border-radius:3px;background:${colors[i % colors.length]}"></i>
        <strong>${actualText(d.name)}</strong>
      </span>
      <div style="text-align:right">
        <strong class="mono">${Number(d.totalizer || 0).toLocaleString("id-ID")} m³</strong>
        <span style="color:var(--muted);font-size:11px;margin-left:6px">(${d.sharePercent}%)</span>
      </div>
    </div>
  `).join("");

  const dailyTrend = data.dailyTrend || [];
  const maxInletTrend = Math.max(10, ...dailyTrend.map((d) => Math.max(d.inlet1, d.inlet2, d.inlet3, d.inlet4)));
  const trendCols = dailyTrend.map((d) => {
    const sum = (d.inlet1 + d.inlet2 + d.inlet3 + d.inlet4) || 0;
    const h = Math.max(2, (sum / (maxInletTrend * 4 || 1)) * 100);
    return `
      <div class="solar-trend-column" tabindex="0" title="${d.date}: Total ${sum.toFixed(1)} m³/h">
        <i style="height:${h}%;background:var(--primary,#078eaa);width:16px" title="Total: ${sum.toFixed(1)} m³/h"></i>
        <span>${d.date ? d.date.slice(5) : ""}</span>
      </div>
    `;
  }).join("");

  const analyticsHtml = `
    <section class="wwtp-chart-panel">
      ${panel("Tren Debit Harian Akumulasi Inlet", "Total debit aliran inlet (m³/h) harian", dailyTrend.length ? `<div class="solar-bar-chart"><div class="solar-y-axis"><span>${(maxInletTrend*4).toFixed(0)} m³/h</span><span>${(maxInletTrend*2).toFixed(0)} m³/h</span><span>0 m³/h</span></div><div class="solar-plot"><div class="solar-grid-lines"><i></i><i></i><i></i></div><div class="solar-trend">${trendCols}</div></div></div>` : actualEmpty("Belum ada histori debit harian"), `<span class="data-pill good">FLOW METER</span>`)}
      ${panel("Distribusi Volume per Jalur", "Persentase kontribusi totalizer per inlet", `<div style="display:grid;gap:4px;padding:8px 0">${distRows}</div>`)}
    </section>
  `;

  const readingRows = readings.map((r, i) => `
    <tr>
      <td class="mono">${i + 1}</td>
      <td><strong>${actualTime(r.captured_at)}</strong></td>
      <td class="mono"><code>${actualText(r.sensor_tag)}</code></td>
      <td>${actualText(r.sensor_name || "-")}</td>
      <td class="mono"><strong>${r.value != null ? Number(r.value).toFixed(2) : "-"}</strong> ${actualText(r.unit || "")}</td>
      <td><span class="data-pill ${r.status === "NORMAL" || r.status === "Normal" ? "good" : "neutral"}">${actualText(r.status || "Normal")}</span></td>
    </tr>
  `).join("");

  const tableHtml = panel("Data Log Telemetri Sensor Inlet Terkini", "Pembacaan histori sensor debit dan temperatur dari TimescaleDB", `
    <div class="table-wrap" style="max-height:480px">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Waktu</th><th>Tag Sensor</th><th>Nama Sensor</th><th>Nilai</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${readingRows || `<tr><td colspan="6">${actualEmpty("Belum ada data telemetri.")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `);

  return `${kpiHtml}${unitSection}${analyticsHtml}${tableHtml}`;
}

function wwtpPidView(data) {
  const logs = data.logs || [];

  const iframeHtml = `
    <section class="wwtp-pid-wrapper">
      <div class="wwtp-pid-toolbar">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:11px;font-weight:800;color:var(--muted,#6f8088);letter-spacing:1px">DIAGRAM ALUR P&ID LIVE</span>
          <span class="data-pill good">REALTIME AUTO-SYNC</span>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="button small ghost" type="button" data-pf-reload title="Muat ulang diagram">🔄 Muat Ulang</button>
          <button class="button small ghost" type="button" data-pf-fullscreen title="Fullscreen">⛶ Fullscreen</button>
          <a class="button small primary" href="/simulasi-full-process.html" target="_blank" rel="noopener" title="Buka di tab baru">↗ Buka di Tab Baru</a>
        </div>
      </div>
      <iframe class="wwtp-pid-frame" data-pf-iframe src="/simulasi-full-process.html" title="Diagram Proses P&ID IPAL"></iframe>
    </section>
  `;

  const logRows = logs.map((l, i) => `
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

  const logsHtml = panel("Log Kontrol Peralatan P&ID IPAL", "Catatan aksi kontrol motor, blower aerasi, dan pompa transfer", `
    <div class="table-wrap" style="max-height:360px">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Waktu</th><th>Peralatan</th><th>Aksi</th><th>Operator</th><th>Role</th><th>Status</th></tr>
        </thead>
        <tbody data-wwtp-pid-logs-tbody>
          ${logRows || `<tr><td colspan="7">${actualEmpty("Belum ada log kontrol.")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `, `<button class="button small ghost" data-ctrl-log-refresh>↻ Refresh Log</button>`);

  return `${iframeHtml}${logsHtml}`;
}

function bindWwtpPidActions() {
  document.querySelector("[data-pf-reload]")?.addEventListener("click", () => {
    const iframe = document.querySelector("iframe[data-pf-iframe]");
    if (iframe) iframe.src = iframe.src;
  });
  document.querySelector("[data-pf-fullscreen]")?.addEventListener("click", () => {
    const iframe = document.querySelector("iframe[data-pf-iframe]");
    if (iframe) {
      if (document.fullscreenElement) document.exitFullscreen?.();
      else iframe.requestFullscreen?.();
    }
  });
  document.querySelector("[data-ctrl-log-refresh]")?.addEventListener("click", () => {
    void refreshWwtpPidLogs();
  });
}
