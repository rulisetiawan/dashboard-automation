// ============================================================================
// Page: Asset Status — Modern B2B SaaS Standards (Linear / Vercel / Shadcn UI)
// Ultra-clean, minimalis, flat design, NO dot matrix, with rich tooltips.
// ============================================================================

const matrixCarouselSlides = [
  { id: "all", title: "Semua Mesin Pabrik", badge: "159 Unit Asset", filter: () => true },
  { id: "jetflow", title: "Lini Celup Jetflow", badge: "88 Unit Mesin", filter: (a) => a.process === "jetflow" },
  { id: "calator_dryer", title: "Lini Persiapan & Pengeringan", badge: "24 Unit Mesin", filter: (a) => a.process === "calator" || a.process === "dryer" },
  { id: "kalender", title: "Lini Finishing Kalender", badge: "21 Unit Mesin", filter: (a) => a.process === "kalender" },
  { id: "finishing_chemical", title: "Finishing & Chemical", badge: "26 Unit Mesin", filter: (a) => ["continuous", "inspecting", "finishing", "setting_dongnam", "chemical"].includes(a.process) },
];

let matrixCarouselTimer = null;

function stopMatrixCarouselTimer() {
  if (matrixCarouselTimer) {
    clearInterval(matrixCarouselTimer);
    matrixCarouselTimer = null;
  }
}

function startMatrixCarouselTimer() {
  stopMatrixCarouselTimer();
  if (!state.assetMatrix.carousel) return;
  if (state.page !== "asset_status" && state.page !== "asset_matrix") return;

  matrixCarouselTimer = setInterval(() => {
    if (state.page !== "asset_status" && state.page !== "asset_matrix") {
      stopMatrixCarouselTimer();
      return;
    }
    if (!state.assetMatrix.carousel) {
      stopMatrixCarouselTimer();
      return;
    }
    if (state.assetMatrix.isPaused) return;

    state.assetMatrix.remainingSeconds -= 1;
    if (state.assetMatrix.remainingSeconds <= 0) {
      state.assetMatrix.remainingSeconds = 30;
      state.assetMatrix.slideIndex = (state.assetMatrix.slideIndex + 1) % matrixCarouselSlides.length;
      renderPage({ preserveScroll: false });
    } else {
      updateMatrixCarouselUI();
    }
  }, 1000);
}

function updateMatrixCarouselUI() {
  const bar = document.querySelector(".matrix-carousel-progress-fill");
  const countEl = document.querySelector(".matrix-carousel-countdown");
  if (bar) {
    const pct = Math.max(0, Math.min(100, (state.assetMatrix.remainingSeconds / 30) * 100));
    bar.style.width = `${pct}%`;
  }
  if (countEl) {
    countEl.textContent = `${state.assetMatrix.remainingSeconds}s`;
  }
}

// Fallback tile helper for compatibility
function assetMatrixTile(asset) {
  const effectiveState = assetEffectiveState(asset);
  return `
    <div class="matrix-tile ${effectiveState}" data-machine-row="${asset.process || 'jetflow'}|${asset.id}" role="button" tabindex="0" data-tooltip="Mesin ${actualText(asset.id)}: Status ${effectiveState}">
      <div class="matrix-tile-header">
        <strong class="matrix-tile-id">${actualText(asset.id)}</strong>
        <span class="b2b-status-dot ${effectiveState}"></span>
      </div>
      <div class="matrix-tile-name">${actualText(asset.name)}</div>
    </div>
  `;
}

function getAssetLineGroup(asset) {
  const id = String(asset.id || "").toUpperCase().trim();
  const name = String(asset.name || "").trim();

  if (asset.process === "jetflow" || id.startsWith("JF-")) {
    const laneMatch = id.match(/^JF-L([A-F])-(\d+)/i) || name.match(/Lane\s+([A-F])/i);
    if (laneMatch) {
      const code = laneMatch[1].toUpperCase();
      return { key: `lane_${code}`, label: `Lane ${code}`, sortOrder: code.charCodeAt(0) };
    }
  }

  if (asset.process === "continuous" || id.startsWith("CT-")) {
    return { key: "continuous", label: "Continuous Line", sortOrder: 10 };
  }

  return { key: "general", label: "General Line", sortOrder: 99 };
}

function renderLineSubGroup(lineKey, lineLabel, groupAssets) {
  return `
    <div class="b2b-line-group" data-line-key="${lineKey}">
      <div class="b2b-line-header">
        <strong>${actualText(lineLabel)}</strong>
        <span>${groupAssets.length} Mesin</span>
      </div>
    </div>
  `;
}

// ============================================================================
// Main Modern B2B SaaS Asset Status Page (NO DOT MATRIX!)
// ============================================================================
function actualAssetMatrixPage() {
  const assets = actualFleet();
  if (!assets.length) return actualEmpty("Belum ada data asset snapshot aktual.");

  const totalCount = assets.length;
  const runningCount = assets.filter((a) => assetEffectiveState(a) === "running").length;
  const idleCount = assets.filter((a) => assetEffectiveState(a) === "idle").length;
  const faultCount = assets.filter((a) => assetEffectiveState(a) === "fault").length;
  const warningCount = assets.filter((a) => assetEffectiveState(a) === "warning").length;
  const offlineCount = assets.filter((a) => assetEffectiveState(a) === "offline").length;

  const currentStatus = state.assetMatrix.status || "all";
  const currentProcess = state.assetMatrix.process || "all";
  const currentSearch = (state.assetMatrix.search || "").trim().toLowerCase();

  // Active batches calculation
  const activeBatchAssets = assets.filter((a) => a.batch && a.batch !== "—");
  const activeBatchesCount = new Set(activeBatchAssets.map((a) => a.batch)).size;
  const activeUtilizationPct = totalCount > 0 ? ((runningCount / totalCount) * 100).toFixed(1) : "0.0";

  // Filter assets
  let filteredAssets = assets;

  if (currentProcess !== "all") {
    if (currentProcess === "calator_dryer") {
      filteredAssets = filteredAssets.filter((a) => a.process === "calator" || a.process === "dryer");
    } else if (currentProcess === "finishing_all") {
      filteredAssets = filteredAssets.filter((a) => ["continuous", "inspecting", "finishing", "setting_dongnam"].includes(a.process));
    } else {
      filteredAssets = filteredAssets.filter((a) => a.process === currentProcess);
    }
  }

  if (currentStatus !== "all") {
    filteredAssets = filteredAssets.filter((a) => assetEffectiveState(a) === currentStatus);
  }

  if (currentSearch) {
    filteredAssets = filteredAssets.filter((a) =>
      String(a.id || "").toLowerCase().includes(currentSearch) ||
      String(a.name || "").toLowerCase().includes(currentSearch) ||
      String(a.batch || "").toLowerCase().includes(currentSearch) ||
      String(a.areaLabel || a.area || "").toLowerCase().includes(currentSearch)
    );
  }

  // Distribution percentages for fleet progress bar
  const pRunPct = totalCount > 0 ? ((runningCount / totalCount) * 100).toFixed(1) : "0";
  const pIdlePct = totalCount > 0 ? ((idleCount / totalCount) * 100).toFixed(1) : "0";
  const pWarnPct = totalCount > 0 ? ((warningCount / totalCount) * 100).toFixed(1) : "0";
  const pFaultPct = totalCount > 0 ? ((faultCount / totalCount) * 100).toFixed(1) : "0";
  const pOffPct = totalCount > 0 ? ((offlineCount / totalCount) * 100).toFixed(1) : "0";

  // Pagination for clean table
  const page = state.assetMatrix.page || 1;
  const pageSize = 15;
  const totalFiltered = filteredAssets.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  state.assetMatrix.page = currentPage;

  const startIndex = (currentPage - 1) * pageSize;
  const pageAssets = filteredAssets.slice(startIndex, startIndex + pageSize);

  // Status mapping for mini status pills
  const statusMeta = {
    running: { label: "Running", class: "running", desc: "Mesin aktif beroperasi dalam siklus proses" },
    idle: { label: "Standby", class: "idle", desc: "Mesin siap pakai, menunggu input order batch baru" },
    warning: { label: "Warning", class: "warning", desc: "Parameter telemetri mendekati batas ambang toleransi" },
    fault: { label: "Fault Alert", class: "fault", desc: "Trip atau anomali kritis memerlukan intervensi teknisi" },
    offline: { label: "Offline", class: "offline", desc: "Koneksi gateway terputus atau pemeliharaan terjadwal" }
  };

  // Distinct process categories for process tabs
  const processTabs = [
    { id: "all", label: "Semua Lini", count: totalCount, tip: "Tampilkan seluruh 159 mesin pabrik" },
    { id: "jetflow", label: "Jetflow Dyeing", count: assets.filter((a) => a.process === "jetflow").length, tip: "Mesin pewarnaan kain suhu tinggi (JF-01 s/d JF-88)" },
    { id: "calator_dryer", label: "Calator & Dryer", count: assets.filter((a) => a.process === "calator" || a.process === "dryer").length, tip: "Lini pembuka rajut (Calator) dan pengeringan (Dryer)" },
    { id: "kalender", label: "Kalender Pres", count: assets.filter((a) => a.process === "kalender").length, tip: "21 unit mesin pres pemadatan kain" },
    { id: "finishing_all", label: "Finishing Line", count: assets.filter((a) => ["continuous", "inspecting", "finishing", "setting_dongnam"].includes(a.process)).length, tip: "Lini akhir: Continuous, Inspecting, Stenter Setting" },
    { id: "chemical", label: "Chemical Kitchen", count: assets.filter((a) => a.process === "chemical").length, tip: "Dispenser otomatis dapur kimia & zat warna" }
  ].filter((tab) => tab.id === "all" || tab.count > 0);

  // Clean table rows markup (with data-machine-row to open native modal on click)
  const tableRows = pageAssets.length ? pageAssets.map((asset) => {
    const effective = assetEffectiveState(asset);
    const st = statusMeta[effective] || { label: effective, class: "neutral", desc: "Status mesin" };
    const progressVal = Math.round(Number(asset.progress) || 0);
    const batchLabel = asset.batch && asset.batch !== "—" ? asset.batch : "—";
    const areaText = asset.areaLabel || asset.area || "Lini Pabrik";
    const tempVal = asset.temperature !== undefined && asset.temperature !== null ? `${Number(asset.temperature).toFixed(1)}°` : "—";
    const pressureVal = asset.pressure !== undefined && asset.pressure !== null ? `${Number(asset.pressure).toFixed(1)}` : "—";
    const speedVal = asset.speed !== undefined && asset.speed !== null ? `${Math.round(asset.speed)}` : (asset.flow_rate !== undefined ? `${asset.flow_rate}` : "—");

    const rowTooltip = `Mesin: ${asset.id} (${asset.name})\nArea: ${areaText}\nStatus: ${st.label} — ${st.desc}\nBatch: ${batchLabel}\nProgress: ${progressVal}%\nKlik untuk inspeksi detail PLC`;

    return `
      <tr class="b2b-table-row" data-machine-row="${asset.process || 'jetflow'}|${asset.id}" tabindex="0" role="button" data-tooltip="${actualText(rowTooltip)}">
        <td>
          <span class="b2b-id-pill" data-tooltip="ID Tag SCADA: ${actualText(asset.id)}">${actualText(asset.id)}</span>
        </td>
        <td>
          <div class="b2b-asset-name">${actualText(asset.name)}</div>
          <div class="b2b-asset-sub">${actualText(areaText)}</div>
        </td>
        <td>
          <div class="b2b-batch-mono">${actualText(batchLabel)}</div>
          <div class="b2b-asset-sub">${actualText(asset.recipe || "Proses Standar")}</div>
        </td>
        <td>
          <span class="b2b-status-pill ${st.class}" data-tooltip="${actualText(st.label)}: ${actualText(st.desc)}">
            <span class="b2b-status-dot"></span>
            <span>${st.label}</span>
          </span>
        </td>
        <td class="b2b-mono-cell" data-tooltip="Sensor Suhu PV aktual dalam bejana">${tempVal}</td>
        <td class="b2b-mono-cell" data-tooltip="Tekanan sirkulasi uap/cairan">${pressureVal}</td>
        <td class="b2b-mono-cell" data-tooltip="Kecepatan sirkulasi kain (m/min) / laju alir">${speedVal}</td>
        <td>
          <div class="b2b-progress-cell" data-tooltip="Siklus batch: ${progressVal}% selesai">
            <div class="b2b-progress-track">
              <div class="b2b-progress-fill" style="width: ${progressVal}%;"></div>
            </div>
            <span class="b2b-progress-num">${progressVal}%</span>
          </div>
        </td>
        <td style="text-align: right;">
          <button type="button" class="b2b-inspect-btn" tabindex="-1" data-tooltip="Buka panel diagnostik & kontrol mesin ${asset.id}">
            Inspect →
          </button>
        </td>
      </tr>
    `;
  }).join("") : `
    <tr>
      <td colspan="9" class="b2b-empty-cell">
        Tidak ada asset yang cocok dengan kriteria pencarian atau filter yang dipilih.
      </td>
    </tr>
  `;

  return `
    ${pageHead(state.page === "asset_matrix" ? "asset_matrix" : "asset_status", `<span class="range-badge">LIVE · ${totalCount} ASSETS</span>`)}

    <div class="b2b-dashboard-shell">
      
      <!-- 1. TOP KPI METRICS (Large bold numbers, muted uppercase labels, generous whitespace 20px-24px, rich tooltips) -->
      <section class="b2b-kpi-grid" aria-label="KPI Ringkasan Armada">
        <div class="b2b-kpi-card" data-tooltip="Rasio unit running terhadap total kapasitas armada (159 unit). Diperbarui real-time dari SCADA PLC.">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="b2b-kpi-label">Utilisasi Operasional Pabrik</span>
            <span class="b2b-tooltip-trigger" data-tooltip="Rasio unit running terhadap total kapasitas armada (159 unit). Diperbarui real-time dari SCADA PLC.">ⓘ</span>
          </div>
          <div class="b2b-kpi-val">${activeUtilizationPct}<small>%</small></div>
          <div class="b2b-kpi-foot">
            <span class="b2b-trend-pill positive">↑ Normal</span>
            <span>${runningCount} dari ${totalCount} unit beroperasi</span>
          </div>
        </div>

        <div class="b2b-kpi-card" data-tooltip="Jumlah mesin yang sedang aktif menjalankan proses dyeing, pres, pengeringan, atau finishing.">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="b2b-kpi-label">Armada Mesin Berjalan</span>
            <span class="b2b-tooltip-trigger" data-tooltip="Jumlah mesin yang sedang aktif menjalankan proses dyeing, pres, pengeringan, atau finishing.">ⓘ</span>
          </div>
          <div class="b2b-kpi-val">${runningCount}<small>/ ${totalCount}</small></div>
          <div class="b2b-kpi-foot">
            <span class="b2b-trend-pill ${idleCount > 0 ? 'idle' : 'neutral'}">${idleCount} Standby</span>
            <span>siap input batch baru</span>
          </div>
        </div>

        <div class="b2b-kpi-card" data-tooltip="Jumlah lot order/batch kain yang sedang aktif diproses pada bejana dan lini finishing.">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="b2b-kpi-label">Batch Aktif Dalam Proses</span>
            <span class="b2b-tooltip-trigger" data-tooltip="Jumlah lot order/batch kain yang sedang aktif diproses pada bejana dan lini finishing.">ⓘ</span>
          </div>
          <div class="b2b-kpi-val">${activeBatchesCount}<small>Lot</small></div>
          <div class="b2b-kpi-foot">
            <span class="b2b-trend-pill neutral">${activeBatchAssets.length} Mesin</span>
            <span>sedang memproses kain</span>
          </div>
        </div>

        <div class="b2b-kpi-card" data-tooltip="Total unit mesin yang mengalami trip, fault listrik/mekanis, atau alarm sensor melebihi batas batas toleransi.">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="b2b-kpi-label">Alarm & Status Rusak</span>
            <span class="b2b-tooltip-trigger" data-tooltip="Total unit mesin yang mengalami trip, fault listrik/mekanis, atau alarm sensor aktif.">ⓘ</span>
          </div>
          <div class="b2b-kpi-val ${faultCount > 0 ? 'text-danger' : ''}">${faultCount}<small>Unit</small></div>
          <div class="b2b-kpi-foot">
            <span class="b2b-trend-pill ${faultCount > 0 ? 'danger' : 'positive'}">
              ${faultCount > 0 ? `${faultCount} Perlu Aksi` : 'Normal'}
            </span>
            <span>${warningCount} warning sensor</span>
          </div>
        </div>
      </section>

      <!-- 2. FLEET AVAILABILITY MULTI-SEGMENT PROGRESS BAR (NO DOT MATRIX!) -->
      <section class="b2b-section-card">
        <div class="b2b-progress-section">
          <div class="b2b-progress-head">
            <div>
              <h3 class="b2b-section-title">Distribusi Ketersediaan Armada</h3>
              <p class="b2b-section-sub">Proporsi kondisi 159 mesin tekstil yang terhubung dengan gateway SCADA</p>
            </div>
            <div class="b2b-efficiency-badge" data-tooltip="Persentase ketersediaan mesin siap operasi vs total kapasitas terpasang">
              <strong>${activeUtilizationPct}%</strong> Efisiensi Operasi <span class="b2b-tooltip-trigger">ⓘ</span>
            </div>
          </div>

          <!-- Multi-segment stacked progress bar with rich tooltips -->
          <div class="b2b-stacked-bar">
            ${Number(pRunPct) > 0 ? `<div class="b2b-seg running" style="width: ${pRunPct}%;" data-tooltip="Running: ${runningCount} unit (${pRunPct}%) — Beroperasi normal memproses batch"></div>` : ""}
            ${Number(pIdlePct) > 0 ? `<div class="b2b-seg idle" style="width: ${pIdlePct}%;" data-tooltip="Standby: ${idleCount} unit (${pIdlePct}%) — Mesin siap input lot baru"></div>` : ""}
            ${Number(pWarnPct) > 0 ? `<div class="b2b-seg warning" style="width: ${pWarnPct}%;" data-tooltip="Warning: ${warningCount} unit (${pWarnPct}%) — Deviasi suhu/tekanan terdeteksi"></div>` : ""}
            ${Number(pFaultPct) > 0 ? `<div class="b2b-seg fault" style="width: ${pFaultPct}%;" data-tooltip="Fault: ${faultCount} unit (${pFaultPct}%) — Perlu tindakan perbaikan segera"></div>` : ""}
            ${Number(pOffPct) > 0 ? `<div class="b2b-seg offline" style="width: ${pOffPct}%;" data-tooltip="Offline: ${offlineCount} unit (${pOffPct}%) — Gateway offline / maintenance"></div>` : ""}
          </div>

          <!-- Clean status pill counts (click to filter, with tooltips) -->
          <div class="b2b-dist-legend">
            <button type="button" class="b2b-legend-pill ${currentStatus === 'all' ? 'active' : ''}" data-matrix-status="all" data-tooltip="Tampilkan semua status (${totalCount} unit)">
              <span class="b2b-status-dot neutral"></span>
              <span>Semua</span>
              <strong>${totalCount}</strong>
            </button>
            <button type="button" class="b2b-legend-pill ${currentStatus === 'running' ? 'active' : ''}" data-matrix-status="running" data-tooltip="Filter hanya mesin Running (${runningCount} unit)">
              <span class="b2b-status-dot running"></span>
              <span>Running</span>
              <strong class="text-running">${runningCount}</strong>
            </button>
            <button type="button" class="b2b-legend-pill ${currentStatus === 'idle' ? 'active' : ''}" data-matrix-status="idle" data-tooltip="Filter hanya mesin Standby (${idleCount} unit)">
              <span class="b2b-status-dot idle"></span>
              <span>Standby</span>
              <strong class="text-idle">${idleCount}</strong>
            </button>
            ${warningCount > 0 ? `
              <button type="button" class="b2b-legend-pill ${currentStatus === 'warning' ? 'active' : ''}" data-matrix-status="warning" data-tooltip="Filter mesin dengan peringatan warning (${warningCount} unit)">
                <span class="b2b-status-dot warning"></span>
                <span>Warning</span>
                <strong class="text-warning">${warningCount}</strong>
              </button>
            ` : ""}
            ${faultCount > 0 ? `
              <button type="button" class="b2b-legend-pill ${currentStatus === 'fault' ? 'active' : ''}" data-matrix-status="fault" data-tooltip="Filter mesin mengalami kerusakan/fault (${faultCount} unit)">
                <span class="b2b-status-dot fault"></span>
                <span>Rusak / Fault</span>
                <strong class="text-fault">${faultCount}</strong>
              </button>
            ` : ""}
            <button type="button" class="b2b-legend-pill ${currentStatus === 'offline' ? 'active' : ''}" data-matrix-status="offline" data-tooltip="Filter mesin offline (${offlineCount} unit)">
              <span class="b2b-status-dot offline"></span>
              <span>Offline</span>
              <strong>${offlineCount}</strong>
            </button>
          </div>
        </div>

        <!-- 3. PROCESS TABS & FILTER TOOLBAR -->
        <div class="b2b-table-toolbar">
          <div class="b2b-tabs-wrap">
            ${processTabs.map((t) => `
              <button type="button" class="b2b-tab-btn ${currentProcess === t.id ? 'active' : ''}" data-matrix-process="${t.id}" data-tooltip="${t.tip}">
                ${actualText(t.label)} <span class="b2b-tab-count">${t.count}</span>
              </button>
            `).join("")}
          </div>

          <div class="b2b-search-wrap">
            <span class="b2b-search-icon" aria-hidden="true">🔍</span>
            <input type="search" class="b2b-search-input" placeholder="Cari kode mesin, batch, atau area..." value="${actualText(state.assetMatrix.search)}" data-matrix-search data-tooltip="Ketik kode mesin (cth: JF-01), batch kain, atau nama area" />
            ${state.assetMatrix.search ? `<button type="button" class="b2b-search-clear" data-matrix-clear-search aria-label="Hapus pencarian" data-tooltip="Bersihkan kata kunci">×</button>` : ""}
          </div>
        </div>

        <!-- 4. CLEAN FILTERABLE DATA TABLE WITH COLUMN TOOLTIPS -->
        <div class="b2b-table-container">
          <table class="b2b-data-table">
            <thead>
              <tr>
                <th data-tooltip="Identifikasi unik mesin pada jaringan komunikasi gateway PLC">Kode Unit <span class="b2b-tooltip-trigger">ⓘ</span></th>
                <th data-tooltip="Nama mesin dan lokasi area atau lane kerja">Nama Mesin & Area</th>
                <th data-tooltip="Nomor lot order kain dan formula resep proses yang sedang aktif">Batch / Resep Aktif</th>
                <th data-tooltip="Kondisi operasional mesin terkini: Running, Standby, Warning, atau Fault">Status Operasi</th>
                <th data-tooltip="Pembacaan suhu bejana PV (°C) dari sensor PT100">Suhu (°C)</th>
                <th data-tooltip="Tekanan uap steam atau sirkulasi cairan (Bar)">Tekanan (Bar)</th>
                <th data-tooltip="Kecepatan kain (m/min) atau laju sirkulasi cairan (L/min)">Speed / Flow</th>
                <th data-tooltip="Persentase estimasi penyelesaian siklus batch kerja saat ini">Progress Siklus</th>
                <th style="text-align: right;" data-tooltip="Buka panel diagnostik mendalam untuk mesin ini">Detail</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>

        <!-- 5. TABLE PAGINATION & METRIC FOOTER -->
        <div class="b2b-table-footer">
          <div class="b2b-pagination-info">
            Menampilkan <strong>${totalFiltered === 0 ? 0 : startIndex + 1}–${Math.min(startIndex + pageSize, totalFiltered)}</strong> dari <strong>${totalFiltered}</strong> unit mesin
            ${currentProcess !== "all" || currentStatus !== "all" || currentSearch ? `<button type="button" class="b2b-reset-btn" data-matrix-reset-filters data-tooltip="Kembalikan semua filter ke kondisi awal">Reset Filter</button>` : ""}
          </div>

          ${totalPages > 1 ? `
            <div class="b2b-pagination-controls">
              <button type="button" class="b2b-page-btn" data-matrix-page="prev" ${currentPage <= 1 ? "disabled" : ""} data-tooltip="Halaman sebelumnya">❮ Prev</button>
              <span class="b2b-page-indicator" data-tooltip="Halaman ${currentPage} dari ${totalPages}">${currentPage} / ${totalPages}</span>
              <button type="button" class="b2b-page-btn" data-matrix-page="next" ${currentPage >= totalPages ? "disabled" : ""} data-tooltip="Halaman berikutnya">Next ❯</button>
            </div>
          ` : ""}
        </div>

      </section>

    </div>
  `;
}
