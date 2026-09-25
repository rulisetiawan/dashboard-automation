// ============================================================================
// Page: Plant Overview & Live Operations (Modern B2B SaaS Standards)
// ============================================================================

function actualOverviewPage() {
  const assets = actualFleet();
  const total = assets.length || 159;
  const running = assets.filter((asset) => asset.state === "running").length;
  const stopped = assets.filter((asset) => ["idle", "fault", "offline"].includes(asset.state)).length;
  const idle = assets.filter((asset) => asset.state === "idle").length;
  const batches = new Set(assets.map((asset) => asset.batch).filter((batch) => batch && batch !== "—")).size;
  const faults = assets.filter((asset) => asset.state === "fault").length;
  const utilPct = total > 0 ? ((running / total) * 100).toFixed(1) : "0.0";

  const utilities = backendUtilities.length
    ? `<div class="b2b-table-container"><table class="b2b-data-table"><thead><tr><th>Nama Utilitas</th><th>Nilai Terkini</th><th>Waktu Sumber</th><th>Kualitas Link</th></tr></thead><tbody>${backendUtilities.map((item) => `<tr><td style="font-weight: 600; color: var(--ink);">${actualText(item.label)}</td><td class="b2b-mono-cell" style="font-weight: 700; color: var(--primary);">${actualText(item.value)} ${actualText(item.unit)}</td><td class="b2b-mono-cell">${actualTime(item.source_ts)}</td><td><span class="b2b-status-pill running"><span class="b2b-status-dot"></span>${actualText(item.quality)}</span></td></tr>`).join("")}</tbody></table></div>`
    : actualEmpty("Belum ada snapshot utilitas");

  return `
    ${pageHead("overview", `<span class="range-badge">LIVE · ${total} ASSETS</span>`)}

    <div class="b2b-dashboard-shell">
      <!-- Top KPI Metrics Strip -->
      <section class="b2b-kpi-grid" aria-label="Ringkasan Plant Overview">
        <div class="b2b-kpi-card">
          <span class="b2b-kpi-label">Utilisasi Operasional Pabrik</span>
          <div class="b2b-kpi-val">${utilPct}<small>%</small></div>
          <div class="b2b-kpi-foot">
            <span class="b2b-trend-pill positive">↑ Normal</span>
            <span>${running} dari ${total} unit beroperasi</span>
          </div>
        </div>

        <div class="b2b-kpi-card">
          <span class="b2b-kpi-label">Armada Mesin Berjalan</span>
          <div class="b2b-kpi-val">${running}<small>/ ${total}</small></div>
          <div class="b2b-kpi-foot">
            <span class="b2b-trend-pill positive">Running</span>
            <span>${idle} unit dalam status standby</span>
          </div>
        </div>

        <div class="b2b-kpi-card">
          <span class="b2b-kpi-label">Batch Aktif Dalam Proses</span>
          <div class="b2b-kpi-val">${batches}<small>Lot</small></div>
          <div class="b2b-kpi-foot">
            <span class="b2b-trend-pill neutral">${batches} Batch</span>
            <span>Proses pewarnaan & finishing</span>
          </div>
        </div>

        <div class="b2b-kpi-card">
          <span class="b2b-kpi-label">Mesin Memerlukan Perhatian</span>
          <div class="b2b-kpi-val ${faults > 0 ? 'text-danger' : ''}">${stopped}<small>Unit</small></div>
          <div class="b2b-kpi-foot">
            <span class="b2b-trend-pill ${faults > 0 ? 'danger' : 'idle'}">
              ${faults > 0 ? `${faults} Fault` : 'Standby'}
            </span>
            <span>${faults > 0 ? `${faults} unit mengalami alarm` : 'Tidak ada fault kritis'}</span>
          </div>
        </div>
      </section>

      <!-- Machine Directory & Utility -->
      ${panel("Katalog Status Armada Mesin", "Monitoring operasional terkini seluruh lini proses pabrik", actualAssetTable(assets))}
      ${panel("Konsumsi Pasokan Energi & Utilitas", "Snapshot pembacaan meter daya, steam boiler, dan pasokan air", utilities)}
    </div>
  `;
}
