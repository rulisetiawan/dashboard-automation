// ============================================================================
// Page: Asset Status (Snapshot Matrix & 30s Auto-Slide Carousel)
// ============================================================================

const matrixCarouselSlides = [
  {
    id: "all",
    title: "Semua Mesin Pabrik",
    badge: "159 Unit Asset",
    subtitle: "Monitoring seluruh lini celup, persiapan, pengeringan, finishing, dan chemical",
    filter: (a) => true,
    preferredView: "compact",
  },
  {
    id: "jetflow",
    title: "Lini Celup Jetflow",
    badge: "88 Unit Mesin",
    subtitle: "Mesin pewarnaan kain dan dyeing process (JF-01 s/d JF-88)",
    filter: (a) => a.process === "jetflow",
    preferredView: "grouped",
  },
  {
    id: "calator_dryer",
    title: "Lini Persiapan & Pengeringan",
    badge: "24 Unit Mesin",
    subtitle: "18 Unit Calator Pembuka Kain + 6 Unit Dryer Pengering",
    filter: (a) => a.process === "calator" || a.process === "dryer",
    preferredView: "grouped",
  },
  {
    id: "kalender",
    title: "Lini Finishing Kalender",
    badge: "21 Unit Mesin",
    subtitle: "21 Unit Mesin Kalender Pres dan Pemadatan Kain",
    filter: (a) => a.process === "kalender",
    preferredView: "grouped",
  },
  {
    id: "finishing_chemical",
    title: "Finishing Line & Chemical",
    badge: "26 Unit Mesin",
    subtitle: "Continuous, Inspecting, Finishing, Dongnam Setting, & Dapur Kimia",
    filter: (a) => ["continuous", "inspecting", "finishing", "setting_dongnam", "chemical"].includes(a.process),
    preferredView: "grouped",
  },
  {
    id: "alerts",
    title: "Fokus Mesin Rusak & Perhatian Khusus",
    badge: "Alarm / Fault Alert",
    subtitle: "Mesin dengan status Rusak (Fault), Warning, atau Berhenti (Idle)",
    filter: (a) => ["fault", "warning"].includes(assetEffectiveState(a)),
    fallbackFilter: (a) => ["fault", "warning", "idle", "offline"].includes(assetEffectiveState(a)),
    preferredView: "compact",
  },
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

function assetMatrixTile(asset) {
  const effectiveState = assetEffectiveState(asset);
  const statusInfo = matrixStatusMeta[effectiveState] || { label: effectiveState, icon: "●", tone: "neutral" };
  const procLabel = processConfig[asset.process]?.singular || asset.process;
  const isRunning = effectiveState === "running";
  const isFault = effectiveState === "fault";
  const progressVal = Math.round(Number(asset.progress) || 0);
  const batchLabel = asset.batch && asset.batch !== "—" ? asset.batch : null;

  const tooltipText = `Mesin: ${asset.id} (${asset.name})\nTipe: ${procLabel}\nArea: ${asset.areaLabel || asset.area || "—"}\nStatus: ${statusInfo.label.toUpperCase()}\nBatch: ${batchLabel || "Tidak ada batch"}\nProgress: ${progressVal}%\nKualitas: ${asset.quality || "GOOD"}\nUpdate: ${actualTime(asset.sourceTs)}`;

  return `
    <div class="matrix-tile ${effectiveState}"
         data-machine-row="${asset.process || 'jetflow'}|${asset.id}"
         data-matrix-asset="${asset.id}"
         role="button"
         tabindex="0"
         title="${actualText(tooltipText)}"
         aria-label="Mesin ${actualText(asset.id)} ${actualText(asset.name)}, status ${statusInfo.label}">
      <div class="matrix-tile-header">
        <span class="matrix-tile-code">
          <strong class="matrix-tile-id">${actualText(asset.id)}</strong>
        </span>
        <span class="matrix-status-dot ${effectiveState}" title="${actualText(statusInfo.label)}"></span>
      </div>
      <div class="matrix-tile-name" title="${actualText(asset.name)}">${actualText(asset.name)}</div>
      <div class="matrix-tile-footer">
        <span class="matrix-status-tag ${effectiveState}">
          <span class="matrix-status-label">${actualText(statusInfo.label)}</span>
        </span>
        ${isRunning && progressVal > 0 ? `<span class="matrix-progress-pill">${progressVal}%</span>` : ""}
      </div>
      ${isFault ? `<span class="matrix-alarm-glow" aria-hidden="true"></span>` : ""}
    </div>
  `;
}

function getAssetLineGroup(asset) {
  const id = String(asset.id || "").toUpperCase().trim();
  const name = String(asset.name || "").trim();
  const areaLabel = String(asset.areaLabel || "").trim();

  // 1. Jetflow: cek Lane A s/d Lane F
  if (asset.process === "jetflow" || id.startsWith("JF-")) {
    const laneMatch = id.match(/^JF-L([A-F])-(\d+)/i) || name.match(/Lane\s+([A-F])/i);
    if (laneMatch) {
      const code = laneMatch[1].toUpperCase();
      return { key: `lane_${code}`, label: `Lane ${code}`, sortOrder: code.charCodeAt(0) };
    }
  }

  // 2. Continuous Finishing: CT-FIN-01 s/d 04
  if (asset.process === "continuous" || id.startsWith("CT-")) {
    return { key: "continuous", label: "Continuous Finishing Line", sortOrder: 10 };
  }

  // 3. Fabric Inspecting: INSP-FIN-01 s/d 12
  if (asset.process === "inspecting" || id.startsWith("INSP-")) {
    return { key: "inspecting", label: "Fabric Inspection Line", sortOrder: 20 };
  }

  // 4. Setting Dongnam: SD-FIN-01 s/d 04
  if (asset.process === "setting_dongnam" || id.startsWith("SD-")) {
    return { key: "setting_dongnam", label: "Setting Dongnam Line", sortOrder: 30 };
  }

  // 5. Finishing Final: FIN-FIN-01
  if (asset.process === "finishing" || id.startsWith("FIN-")) {
    return { key: "finishing", label: "Final Finishing Line", sortOrder: 40 };
  }

  // 6. Calator, Dryer, Kalender, Chemical: Cek Line/Area Depan, Belakang, Timur
  if (id.includes("-DPN-") || name.toLowerCase().includes("depan") || areaLabel.toLowerCase().includes("depan")) {
    return { key: "depan", label: "Line Area Depan", sortOrder: 1 };
  }
  if (id.includes("-BLK-") || name.toLowerCase().includes("belakang") || areaLabel.toLowerCase().includes("belakang")) {
    return { key: "belakang", label: "Line Area Belakang", sortOrder: 2 };
  }
  if (id.includes("-TMR-") || name.toLowerCase().includes("timur") || areaLabel.toLowerCase().includes("timur")) {
    return { key: "timur", label: "Line Area Timur", sortOrder: 3 };
  }

  // Fallback: gunakan areaLabel jika ada
  if (areaLabel && areaLabel !== "—") {
    return { key: `area_${areaLabel.toLowerCase().replace(/\s+/g, "_")}`, label: `Line ${areaLabel}`, sortOrder: 50 };
  }

  return { key: "general", label: "General Line", sortOrder: 99 };
}

function renderLineSubGroup(lineKey, lineLabel, groupAssets) {
  const lineRunning = groupAssets.filter((a) => assetEffectiveState(a) === "running").length;
  const lineIdle = groupAssets.filter((a) => assetEffectiveState(a) === "idle").length;
  const lineFault = groupAssets.filter((a) => assetEffectiveState(a) === "fault").length;

  return `
    <div class="matrix-line-group" data-line-key="${lineKey}">
      <div class="matrix-line-header">
        <div class="matrix-line-title">
          <span class="matrix-line-badge">${actualText(lineLabel)}</span>
          <span class="matrix-line-count">${groupAssets.length} Mesin</span>
        </div>
        <div class="matrix-line-stats">
          <span class="matrix-line-stat running">● ${lineRunning} Run</span>
          <span class="matrix-line-stat idle">⏸ ${lineIdle} Idle</span>
          ${lineFault > 0 ? `<span class="matrix-line-stat fault">▲ ${lineFault} Rusak</span>` : ""}
        </div>
      </div>
      <div class="matrix-grid-wrap">
        ${groupAssets.map(assetMatrixTile).join("")}
      </div>
    </div>
  `;
}

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
  const isCarousel = Boolean(state.assetMatrix.carousel);
  const currentDensity = state.assetMatrix.density || "compact";

  let currentViewMode = state.assetMatrix.viewMode || "grouped";
  let activeSlide = null;

  let filteredAssets = assets;

  // Apply carousel filtering if carousel is enabled
  if (isCarousel) {
    const slideIdx = Math.max(0, Math.min(matrixCarouselSlides.length - 1, state.assetMatrix.slideIndex || 0));
    activeSlide = matrixCarouselSlides[slideIdx];
    let slideMatches = assets.filter(activeSlide.filter);
    if (!slideMatches.length && activeSlide.fallbackFilter) {
      slideMatches = assets.filter(activeSlide.fallbackFilter);
    }
    filteredAssets = slideMatches.length ? slideMatches : assets;
    if (activeSlide.preferredView) {
      currentViewMode = activeSlide.preferredView;
    }
  }

  // Apply quick status filter
  if (currentStatus !== "all") {
    filteredAssets = filteredAssets.filter((a) => assetEffectiveState(a) === currentStatus);
  }
  // Apply manual process filter (only if not currently overridden by single-process carousel slide)
  if (!isCarousel && currentProcess !== "all") {
    filteredAssets = filteredAssets.filter((a) => a.process === currentProcess);
  }
  // Apply search query
  if (currentSearch) {
    filteredAssets = filteredAssets.filter((a) =>
      String(a.id || "").toLowerCase().includes(currentSearch) ||
      String(a.name || "").toLowerCase().includes(currentSearch) ||
      String(a.batch || "").toLowerCase().includes(currentSearch) ||
      String(a.areaLabel || a.area || "").toLowerCase().includes(currentSearch)
    );
  }

  const distinctProcesses = [...new Set(filteredAssets.map((a) => a.process).filter(Boolean))];

  // 1. Utilisasi Pabrik
  const activeUtilizationPct = totalCount > 0 ? ((runningCount / totalCount) * 100).toFixed(1) : "0.0";
  
  // 2. Active Batches
  const activeBatchAssets = assets.filter((a) => a.batch && a.batch !== "—");
  const activeBatchesCount = new Set(activeBatchAssets.map((a) => a.batch)).size;

  // 3. IoT Communication & Data Link Health
  const connectedCount = assets.filter((a) => a.connected === true).length;
  const commPct = totalCount > 0 ? ((connectedCount / totalCount) * 100).toFixed(1) : "0.0";

  // 4. Finishing Stage Watchlist (Progress >= 85% & running)
  const finishingWatchlist = assets
    .filter((a) => assetEffectiveState(a) === "running" && Number(a.progress) >= 85)
    .sort((a, b) => Number(b.progress) - Number(a.progress))
    .slice(0, 4);

  // 5. Critical Fault Machines (Rusak / Alarm)
  const faultMachines = assets
    .filter((a) => assetEffectiveState(a) === "fault")
    .slice(0, 4);

  // 6. Batch Progress Distribution (Tahapan Kerja)
  const prepProgressCount = activeBatchAssets.filter((a) => Number(a.progress) < 25).length;
  const midProgressCount = activeBatchAssets.filter((a) => Number(a.progress) >= 25 && Number(a.progress) < 80).length;
  const nearDoneCount = activeBatchAssets.filter((a) => Number(a.progress) >= 80).length;

  // 7. Utility Supply Snapshot
  const powerMeter = (typeof backendUtilities !== "undefined" ? backendUtilities : []).find((u) => String(u.utility_code || "").includes("ELEC") || String(u.label || "").toLowerCase().includes("electric") || String(u.label || "").toLowerCase().includes("power"));
  const steamMeter = (typeof backendUtilities !== "undefined" ? backendUtilities : []).find((u) => String(u.utility_code || "").includes("STEAM") || String(u.label || "").toLowerCase().includes("steam"));
  const powerVal = powerMeter ? `${powerMeter.value} ${powerMeter.unit || "MW"}` : "1.84 MW";
  const steamVal = steamMeter ? `${steamMeter.value} ${steamMeter.unit || "bar"}` : "7.8 bar";

  // Carousel Banner Markup
  const carouselBanner = isCarousel ? `
    <div class="matrix-carousel-banner card" role="region" aria-label="Auto-Slide Carousel 30 Detik">
      <div class="matrix-carousel-track">
        <div class="matrix-carousel-progress-fill" style="width: ${Math.max(0, Math.min(100, (state.assetMatrix.remainingSeconds / 30) * 100))}%;"></div>
      </div>
      <div class="matrix-carousel-header">
        <div class="matrix-carousel-info">
          <div class="matrix-carousel-slide-badge">
            <span class="carousel-pulse-dot ${state.assetMatrix.isPaused ? "paused" : "running"}"></span>
            <span>SLIDE ${(state.assetMatrix.slideIndex || 0) + 1} DARI ${matrixCarouselSlides.length}</span>
            <span class="matrix-carousel-tag">${actualText(activeSlide.badge)}</span>
          </div>
          <h2 class="matrix-carousel-title">${actualText(activeSlide.title)}</h2>
          <p class="matrix-carousel-sub">${actualText(activeSlide.subtitle)} · <strong>${filteredAssets.length} mesin pada slide ini</strong></p>
        </div>
        <div class="matrix-carousel-controls">
          <div class="matrix-carousel-timer-badge" title="Waktu tersisa sebelum slide berikutnya berganti otomatis (30s)">
            <span class="timer-icon">⏱</span>
            <strong class="matrix-carousel-countdown">${state.assetMatrix.remainingSeconds}s</strong>
          </div>
          <div class="matrix-carousel-actions">
            <button class="button compact ghost" data-matrix-carousel-prev type="button" title="Slide Sebelumnya">❮ Prev</button>
            <button class="button compact ${state.assetMatrix.isPaused ? "primary" : "ghost"}" data-matrix-carousel-toggle-pause type="button" title="${state.assetMatrix.isPaused ? "Lanjutkan Putaran" : "Jeda Sementara"}">
              ${state.assetMatrix.isPaused ? "▶ Lanjut" : "⏸ Jeda"}
            </button>
            <button class="button compact ghost" data-matrix-carousel-next type="button" title="Slide Berikutnya">Next ❯</button>
            <button class="button compact danger-ghost" data-matrix-carousel-stop type="button" title="Matikan Auto-Slide 30 Detik">✕ Matikan</button>
          </div>
        </div>
      </div>
      <div class="matrix-carousel-dots">
        ${matrixCarouselSlides.map((slide, idx) => `
          <button class="matrix-dot-btn ${idx === (state.assetMatrix.slideIndex || 0) ? "active" : ""}" data-matrix-slide-to="${idx}" type="button" title="${actualText(slide.title)}">
            <span class="matrix-dot-num">${idx + 1}</span>
            <span class="matrix-dot-label">${actualText(slide.title.replace(/\s*\(.*\)/, ""))}</span>
          </button>
        `).join("")}
      </div>
    </div>
  ` : "";

  // --- Opsi C: Hub Operasional Terpadu (3 Panel Compact) ---
  // Panel 1: Perhitungan Donut Chart SVG (Status Distribusi Pabrik)
  const C = 251.33; // Keliling lingkaran radius 40 (2 * PI * 40)
  const pRunLen = totalCount > 0 ? (runningCount / totalCount) * C : 0;
  const pIdleLen = totalCount > 0 ? (idleCount / totalCount) * C : 0;
  const pWarnLen = totalCount > 0 ? (warningCount / totalCount) * C : 0;
  const pOffLen = totalCount > 0 ? (offlineCount / totalCount) * C : 0;
  const pFaultLen = totalCount > 0 ? (faultCount / totalCount) * C : 0;

  let curOffset = 0;
  const segRun = { len: pRunLen, off: curOffset }; curOffset += pRunLen;
  const segIdle = { len: pIdleLen, off: curOffset }; curOffset += pIdleLen;
  const segWarn = { len: pWarnLen, off: curOffset }; curOffset += pWarnLen;
  const segOff = { len: pOffLen, off: curOffset }; curOffset += pOffLen;
  const segFault = { len: pFaultLen, off: curOffset };

  const readyPct = totalCount > 0 ? (((runningCount + idleCount) / totalCount) * 100).toFixed(1) : "0.0";

  // Panel 2: Leaderboard Kesiapan Tiap Lini Mesin
  const sortedProcessData = distinctProcesses.map((proc) => {
    const pAssets = assets.filter((a) => a.process === proc);
    const pLabel = processConfig[proc]?.singular || proc;
    const pRun = pAssets.filter((a) => assetEffectiveState(a) === "running").length;
    const pIdle = pAssets.filter((a) => assetEffectiveState(a) === "idle").length;
    const pFault = pAssets.filter((a) => assetEffectiveState(a) === "fault").length;
    const pOff = pAssets.length - pRun - pIdle - pFault;
    const runPct = pAssets.length > 0 ? ((pRun / pAssets.length) * 100).toFixed(0) : "0";
    return {
      proc,
      label: pLabel,
      total: pAssets.length,
      run: pRun,
      idle: pIdle,
      fault: pFault,
      off: pOff,
      runPct: Number(runPct),
    };
  }).sort((a, b) => b.run - a.run || b.total - a.total);

  const hubLineRows = sortedProcessData.map((item) => {
    const isRunning = item.run > 0;
    return `
      <div class="hub-line-item ${isRunning ? "active" : ""}" data-matrix-process="${item.proc}" role="button" tabindex="0" title="Klik untuk filter ${item.label}">
        <div class="hub-line-info">
          <span class="hub-line-name">${actualText(item.label)}</span>
          <span class="hub-line-sub">${item.total} Mesin</span>
        </div>
        <div class="hub-line-bar-track">
          ${item.run > 0 ? `<div class="hub-line-bar-seg running" style="width: ${item.runPct}%" title="${item.run} Run"></div>` : ""}
          ${item.idle > 0 ? `<div class="hub-line-bar-seg idle" style="width: ${((item.idle / item.total) * 100).toFixed(0)}%" title="${item.idle} Idle"></div>` : ""}
          ${item.fault > 0 ? `<div class="hub-line-bar-seg fault" style="width: ${((item.fault / item.total) * 100).toFixed(0)}%" title="${item.fault} Rusak"></div>` : ""}
          ${item.off > 0 ? `<div class="hub-line-bar-seg offline" style="width: ${((item.off / item.total) * 100).toFixed(0)}%" title="${item.off} Offline"></div>` : ""}
        </div>
        <div class="hub-line-badge-wrap">
          ${isRunning 
            ? `<span class="hub-line-pill run">${item.run}/${item.total} Run</span>`
            : `<span class="hub-line-pill idle">${item.total} Standby</span>`}
        </div>
      </div>
    `;
  }).join("");

  const kpiSummary = `
    <!-- Top Analytical Cards Grid -->
    <section class="matrix-analytics-grid" aria-label="Ringkasan Operasional Pabrik">
      <!-- Card 1: Kapasitas & Utilisasi Pabrik -->
      <div class="matrix-stat-card card">
        <div class="stat-card-head">
          <span class="stat-card-title">Utilisasi Aktif Pabrik</span>
          <span class="data-pill good">${runningCount}/${totalCount} Unit</span>
        </div>
        <div class="stat-card-body">
          <div class="stat-big-val">${activeUtilizationPct}<small>%</small></div>
          <div class="stat-sub-text">Mesin beroperasi normal saat ini</div>
        </div>
        <div class="stat-progress-track">
          <div class="stat-progress-fill running" style="width: ${activeUtilizationPct}%;"></div>
        </div>
      </div>

      <!-- Card 2: Batch Berjalan (Sementara di-comment sampai data batch aktif tersedia)
      <div class="matrix-stat-card card">
        <div class="stat-card-head">
          <span class="stat-card-title">Batch Berjalan</span>
          <span class="data-pill neutral">${activeBatchAssets.length} Mesin Berisi</span>
        </div>
        <div class="stat-card-body">
          <div class="stat-big-val">${activeBatchesCount} <small>Lot</small></div>
          <div class="stat-sub-text">${nearDoneCount} lot hampir selesai (≥80%)</div>
        </div>
        <div class="stat-badge-group">
          <span class="stage-tag">&lt;25%: <strong>${prepProgressCount}</strong></span>
          <span class="stage-tag">Mid: <strong>${midProgressCount}</strong></span>
          <span class="stage-tag done">≥80%: <strong>${nearDoneCount}</strong></span>
        </div>
      </div>
      -->

      <!-- Card 3: Status Perhatian Khusus / Fault Alarm -->
      <div class="matrix-stat-card card ${faultCount > 0 ? 'border-alert' : ''}">
        <div class="stat-card-head">
          <span class="stat-card-title">Alarm & Rusak</span>
          <span class="data-pill ${faultCount > 0 ? 'danger' : 'good'}">${faultCount > 0 ? 'Perlu Respon' : 'Aman'}</span>
        </div>
        <div class="stat-card-body">
          <div class="stat-big-val ${faultCount > 0 ? 'text-danger' : 'text-good'}">${faultCount} <small>Unit</small></div>
          <div class="stat-sub-text">${faultCount > 0 ? 'Mesin mengalami fault / alarm aktif' : 'Tidak ada mesin rusak saat ini'}</div>
        </div>
        <div class="stat-quick-list">
          ${faultMachines.length > 0 
            ? faultMachines.map((m) => `<span class="quick-chip fault" data-machine-row="${m.process}|${m.id}">${actualText(m.id)}</span>`).join("")
            : `<span class="quick-chip-empty">Semua mesin berjalan tanpa kendala</span>`}
        </div>
      </div>

      <!-- Card 4: Konektivitas IoT / Data Link Health -->
      <div class="matrix-stat-card card">
        <div class="stat-card-head">
          <span class="stat-card-title">Koneksi IoT & SCADA</span>
          <span class="data-pill neutral">${connectedCount}/${totalCount}</span>
        </div>
        <div class="stat-card-body">
          <div class="stat-big-val">${commPct}<small>%</small></div>
          <div class="stat-sub-text">${totalCount - connectedCount} unit data stale / offline</div>
        </div>
        <div class="stat-supply-info">
          <span>Listrik: <strong>${powerVal}</strong></span>
          <span>Steam: <strong>${steamVal}</strong></span>
        </div>
      </div>
    </section>

    <!-- Mid Section: Opsi C - Hub Operasional Terpadu (3 Panel Compact) -->
    <section class="matrix-hub-grid" aria-label="Hub Operasional Terpadu Pabrik">
      <!-- Panel 1: Donut Distribusi Status Pabrik -->
      <div class="matrix-panel-card card">
        <div class="panel-card-head">
          <div class="panel-card-title">
            <strong>Distribusi Status Pabrik</strong>
            <small>Proporsi kondisi 160 mesin saat ini</small>
          </div>
          <span class="data-pill good">${readyPct}% Ready</span>
        </div>
        <div class="hub-donut-body">
          <div class="hub-donut-chart-wrap">
            <svg viewBox="0 0 108 108" width="96" height="96" class="hub-donut-svg">
              <circle cx="54" cy="54" r="40" fill="none" stroke="var(--surface-3)" stroke-width="13" />
              ${segRun.len > 0 ? `<circle cx="54" cy="54" r="40" fill="none" stroke="var(--success)" stroke-width="13" stroke-dasharray="${segRun.len.toFixed(2)} ${(C - segRun.len).toFixed(2)}" stroke-dashoffset="${(-segRun.off).toFixed(2)}" transform="rotate(-90 54 54)" />` : ""}
              ${segIdle.len > 0 ? `<circle cx="54" cy="54" r="40" fill="none" stroke="#f59e0b" stroke-width="13" stroke-dasharray="${segIdle.len.toFixed(2)} ${(C - segIdle.len).toFixed(2)}" stroke-dashoffset="${(-segIdle.off).toFixed(2)}" transform="rotate(-90 54 54)" />` : ""}
              ${segWarn.len > 0 ? `<circle cx="54" cy="54" r="40" fill="none" stroke="#f97316" stroke-width="13" stroke-dasharray="${segWarn.len.toFixed(2)} ${(C - segWarn.len).toFixed(2)}" stroke-dashoffset="${(-segWarn.off).toFixed(2)}" transform="rotate(-90 54 54)" />` : ""}
              ${segOff.len > 0 ? `<circle cx="54" cy="54" r="40" fill="none" stroke="#64748b" stroke-width="13" stroke-dasharray="${segOff.len.toFixed(2)} ${(C - segOff.len).toFixed(2)}" stroke-dashoffset="${(-segOff.off).toFixed(2)}" transform="rotate(-90 54 54)" />` : ""}
              ${segFault.len > 0 ? `<circle cx="54" cy="54" r="40" fill="none" stroke="var(--danger)" stroke-width="13" stroke-dasharray="${segFault.len.toFixed(2)} ${(C - segFault.len).toFixed(2)}" stroke-dashoffset="${(-segFault.off).toFixed(2)}" transform="rotate(-90 54 54)" />` : ""}
            </svg>
            <div class="hub-donut-center">
              <span class="donut-center-total">${totalCount}</span>
              <span class="donut-center-label">Unit</span>
            </div>
          </div>
          <div class="hub-donut-legend">
            <div class="hub-legend-item" data-matrix-status="running" role="button" tabindex="0" title="Filter Mesin Running">
              <span class="legend-swatch running"></span>
              <span class="legend-text">Running</span>
              <strong class="legend-val text-good">${runningCount}</strong>
            </div>
            <div class="hub-legend-item" data-matrix-status="idle" role="button" tabindex="0" title="Filter Mesin Standby/Idle">
              <span class="legend-swatch idle"></span>
              <span class="legend-text">Standby</span>
              <strong class="legend-val text-idle">${idleCount}</strong>
            </div>
            <div class="hub-legend-item" data-matrix-status="warning" role="button" tabindex="0" title="Filter Mesin Warning">
              <span class="legend-swatch warning"></span>
              <span class="legend-text">Warning</span>
              <strong class="legend-val text-warning">${warningCount}</strong>
            </div>
            <div class="hub-legend-item" data-matrix-status="offline" role="button" tabindex="0" title="Filter Mesin Offline">
              <span class="legend-swatch offline"></span>
              <span class="legend-text">Offline</span>
              <strong class="legend-val">${offlineCount}</strong>
            </div>
            ${faultCount > 0 ? `
            <div class="hub-legend-item" data-matrix-status="fault" role="button" tabindex="0" title="Filter Mesin Rusak">
              <span class="legend-swatch fault"></span>
              <span class="legend-text">Rusak</span>
              <strong class="legend-val text-danger">${faultCount}</strong>
            </div>` : ""}
          </div>
        </div>
      </div>

      <!-- Panel 2: Leaderboard Kesiapan Tiap Lini Mesin -->
      <div class="matrix-panel-card card">
        <div class="panel-card-head">
          <div class="panel-card-title">
            <strong>Kesiapan Tiap Lini Mesin</strong>
            <small>Aktivitas lini proses (klik untuk filter)</small>
          </div>
          <span class="data-pill neutral">${sortedProcessData.length} Lini</span>
        </div>
        <div class="hub-lines-scroll">
          ${hubLineRows}
        </div>
      </div>

      <!-- Panel 3: Pasokan Energi & Utilitas Pabrik -->
      <div class="matrix-panel-card card">
        <div class="panel-card-head">
          <div class="panel-card-title">
            <strong>Pasokan Energi & Utilitas</strong>
            <small>Kondisi real-time sumber daya pabrik</small>
          </div>
          <span class="data-pill good">SCADA Link OK</span>
        </div>
        <div class="hub-utility-grid">
          <div class="hub-util-tile">
            <span class="util-tile-label">Daya Listrik Pabrik</span>
            <div class="util-tile-val">${powerVal}</div>
            <div class="util-tile-sub">${runningCount > 0 ? `Beban aktif ~${(parseFloat(powerVal) / runningCount).toFixed(2)} MW/unit` : "Beban standby & fasilitas"}</div>
          </div>
          <div class="hub-util-tile">
            <span class="util-tile-label">Tekanan Steam Boiler</span>
            <div class="util-tile-val">${steamVal}</div>
            <div class="util-tile-sub">Distribusi pipa utama (7-8 bar)</div>
          </div>
          <div class="hub-util-tile">
            <span class="util-tile-label">Link SCADA Online</span>
            <div class="hub-util-tile-val">${connectedCount} <small>/ ${totalCount}</small></div>
            <div class="hub-util-tile-sub">${commPct}% telemetry aktif terhubung</div>
          </div>
          <div class="hub-util-tile">
            <span class="util-tile-label">Index Kesiapan Unit</span>
            <div class="hub-util-tile-val text-good">${readyPct}%</div>
            <div class="hub-util-tile-sub">${runningCount + idleCount} unit siap proses produksi</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Status Filter Bar (Teks Bersih Tanpa Ikon Aneh) -->
    <section class="matrix-kpi-bar" aria-label="Status Filter Bar">
      <button class="matrix-kpi-pill all ${currentStatus === "all" ? "active" : ""}" data-matrix-status="all" type="button" title="Tampilkan Semua Status">
        <span class="matrix-kpi-copy">
          <span class="matrix-kpi-label">SEMUA ASSET</span>
          <span class="matrix-kpi-val">${totalCount}</span>
        </span>
      </button>
      <button class="matrix-kpi-pill running ${currentStatus === "running" ? "active" : ""}" data-matrix-status="running" type="button" title="Filter Mesin Running">
        <span class="matrix-kpi-copy">
          <span class="matrix-kpi-label">RUNNING</span>
          <span class="matrix-kpi-val text-good">${runningCount}</span>
        </span>
      </button>
      <button class="matrix-kpi-pill idle ${currentStatus === "idle" ? "active" : ""}" data-matrix-status="idle" type="button" title="Filter Mesin Idle">
        <span class="matrix-kpi-copy">
          <span class="matrix-kpi-label">IDLE</span>
          <span class="matrix-kpi-val text-idle">${idleCount}</span>
        </span>
      </button>
      <button class="matrix-kpi-pill fault ${currentStatus === "fault" ? "active" : ""}" data-matrix-status="fault" type="button" title="Filter Mesin Rusak / Alarm">
        <span class="matrix-kpi-copy">
          <span class="matrix-kpi-label">RUSAK / FAULT</span>
          <span class="matrix-kpi-val text-danger">${faultCount}</span>
        </span>
      </button>
      <button class="matrix-kpi-pill warning ${currentStatus === "warning" ? "active" : ""}" data-matrix-status="warning" type="button" title="Filter Mesin Warning">
        <span class="matrix-kpi-copy">
          <span class="matrix-kpi-label">WARNING</span>
          <span class="matrix-kpi-val text-warning">${warningCount}</span>
        </span>
      </button>
      <button class="matrix-kpi-pill offline ${currentStatus === "offline" ? "active" : ""}" data-matrix-status="offline" type="button" title="Filter Mesin Offline">
        <span class="matrix-kpi-copy">
          <span class="matrix-kpi-label">OFFLINE</span>
          <span class="matrix-kpi-val">${offlineCount}</span>
        </span>
      </button>
    </section>
  `;

  const toolbar = `
    <div class="matrix-toolbar-card card">
      <div class="matrix-toolbar-top">
        <div class="matrix-search-wrap">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input type="search" class="matrix-search-input" placeholder="Cari kode atau nama mesin (contoh: JF-01, Calator, dll)..." value="${actualText(state.assetMatrix.search)}" data-matrix-search />
          ${state.assetMatrix.search ? `<button class="search-clear-btn" data-matrix-clear-search aria-label="Hapus pencarian">×</button>` : ""}
        </div>

        <div class="matrix-toolbar-actions">
          <!-- Density Switcher for Large Screen / TV -->
          <div class="matrix-density-toggles" role="group" aria-label="Pilihan Kerapatan Layar">
            <button class="button compact ${currentDensity === "compact" ? "primary" : "ghost"}" data-matrix-density="compact" type="button" title="Tampilan Ringkas (Mini Kotak): Dirancang pas untuk layar besar/TV tanpa scroll berlebih">
              <svg class="ui-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1.5px; margin-right: 4px;">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span>Layar Besar</span>
            </button>
            <button class="button compact ${currentDensity === "normal" ? "primary" : "ghost"}" data-matrix-density="normal" type="button" title="Tampilan Standar / Normal">
              <svg class="ui-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1.5px; margin-right: 4px;">
                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
              </svg>
              <span>Standar</span>
            </button>
          </div>

          <!-- View Mode Toggles -->
          <div class="matrix-view-toggles">
            <button class="button compact ${currentViewMode === "grouped" ? "primary" : "ghost"}" data-matrix-view="grouped" type="button" title="Kelompokkan per Lini Mesin">
              <span>▦ Per Lini</span>
            </button>
            <button class="button compact ${currentViewMode === "compact" ? "primary" : "ghost"}" data-matrix-view="compact" type="button" title="Tampilkan Semua Matriks Sekaligus">
              <span>⊞ Penuh</span>
            </button>
          </div>

          <!-- Carousel Auto-Slide Trigger -->
          <div class="matrix-carousel-btn-wrap">
            <button class="button compact ${isCarousel ? "primary active-carousel-btn" : "ghost"}" data-matrix-carousel-toggle type="button" title="${isCarousel ? "Hentikan putaran slide 30s" : "Putar otomatis per slide setiap 30 detik untuk monitor TV"}">
              <span>${isCarousel ? "⏹ Stop 30s" : "▶ Auto-Slide 30s"}</span>
            </button>
          </div>
        </div>
      </div>

      ${!isCarousel ? `
        <div class="matrix-process-tabs">
          <button class="matrix-proc-tab ${currentProcess === "all" ? "active" : ""}" data-matrix-process="all" type="button">
            Semua Lini <span class="matrix-proc-count">${assets.length}</span>
          </button>
          ${[...new Set(assets.map((a) => a.process).filter(Boolean))].map((proc) => {
            const count = assets.filter((a) => a.process === proc).length;
            const label = processConfig[proc]?.singular || proc;
            return `
              <button class="matrix-proc-tab ${currentProcess === proc ? "active" : ""}" data-matrix-process="${proc}" type="button">
                <span>${actualText(label)}</span> <span class="matrix-proc-count">${count}</span>
              </button>
            `;
          }).join("")}
        </div>
      ` : ""}

      <div class="matrix-legend-bar">
        <div class="matrix-legend-group">
          <span class="matrix-legend-title">Status:</span>
          <span class="matrix-legend-color running">Running</span>
          <span class="matrix-legend-color idle">Idle</span>
          <span class="matrix-legend-color fault">Rusak / Fault</span>
          <span class="matrix-legend-color warning">Warning</span>
          <span class="matrix-legend-color offline">Offline</span>
        </div>
      </div>
    </div>
  `;

  let gridContent = "";
  if (!filteredAssets.length) {
    gridContent = `
      <div class="matrix-empty-state card">
        <span class="matrix-empty-icon">🔍</span>
        <h3>Tidak ada asset yang sesuai</h3>
        <p>Tidak ditemukan asset dengan filter status "${actualText(currentStatus)}" atau pencarian "${actualText(state.assetMatrix.search)}".</p>
        <button class="button ghost" data-matrix-reset-filters type="button">Reset Filter</button>
      </div>
    `;
  } else if (currentViewMode === "compact" || (currentProcess !== "all" && !isCarousel)) {
    const sectionTitle = isCarousel
      ? activeSlide.title
      : (currentProcess !== "all"
          ? (processConfig[currentProcess]?.singular || currentProcess)
          : "Semua Mesin Pabrik (Matriks Penuh)");

    // Jika filter process tunggal dipilih (misal Jetflow), tetap kelompokkan per Line / Lane di dalamnya
    if (currentProcess !== "all" && !isCarousel) {
      const lineMap = new Map();
      filteredAssets.forEach((asset) => {
        const group = getAssetLineGroup(asset);
        if (!lineMap.has(group.key)) {
          lineMap.set(group.key, { label: group.label, sortOrder: group.sortOrder, assets: [] });
        }
        lineMap.get(group.key).assets.push(asset);
      });
      const sortedLineGroups = [...lineMap.entries()].sort((a, b) => a[1].sortOrder - b[1].sortOrder || a[1].label.localeCompare(b[1].label));

      gridContent = `
        <section class="matrix-section card">
          <div class="matrix-section-head">
            <div class="matrix-section-title">
              <h3>${actualText(sectionTitle)}</h3>
            </div>
            <span class="data-pill neutral">${filteredAssets.length} Mesin Ditampilkan</span>
          </div>
          <div class="matrix-lines-container">
            ${sortedLineGroups.map(([lineKey, g]) => renderLineSubGroup(lineKey, g.label, g.assets)).join("")}
          </div>
        </section>
      `;
    } else {
      gridContent = `
        <section class="matrix-section card">
          <div class="matrix-section-head">
            <div class="matrix-section-title">
              <h3>${actualText(sectionTitle)}</h3>
            </div>
            <span class="data-pill neutral">${filteredAssets.length} Mesin Ditampilkan</span>
          </div>
          <div class="matrix-grid-wrap">
            ${filteredAssets.map(assetMatrixTile).join("")}
          </div>
        </section>
      `;
    }
  } else {
    gridContent = distinctProcesses.map((proc) => {
      const procAssets = filteredAssets.filter((a) => a.process === proc);
      if (!procAssets.length) return "";
      const procLabel = processConfig[proc]?.singular || proc;
      const procRunning = procAssets.filter((a) => assetEffectiveState(a) === "running").length;
      const procIdle = procAssets.filter((a) => assetEffectiveState(a) === "idle").length;
      const procFault = procAssets.filter((a) => assetEffectiveState(a) === "fault").length;

      // Kelompokkan mesin dalam proses ini berdasarkan Line (Lane A-F, Line Depan/Belakang/Timur, dsb)
      const lineMap = new Map();
      procAssets.forEach((asset) => {
        const group = getAssetLineGroup(asset);
        if (!lineMap.has(group.key)) {
          lineMap.set(group.key, { label: group.label, sortOrder: group.sortOrder, assets: [] });
        }
        lineMap.get(group.key).assets.push(asset);
      });
      const sortedLineGroups = [...lineMap.entries()].sort((a, b) => a[1].sortOrder - b[1].sortOrder || a[1].label.localeCompare(b[1].label));

      // Jika hanya ada 1 sub-group dan namanya sama dengan jenis proses, langsung tampilkan grid tanpa sub-header ganda
      const hasMultipleLines = sortedLineGroups.length > 1;

      return `
        <section class="matrix-section card">
          <div class="matrix-section-head">
            <div class="matrix-section-title">
              <h3>${actualText(procLabel)}</h3>
              <small>${processConfig[proc]?.process || ""}</small>
            </div>
            <div class="matrix-section-stats">
              <span class="matrix-mini-pill running">● ${procRunning} Running</span>
              <span class="matrix-mini-pill idle">⏸ ${procIdle} Idle</span>
              ${procFault > 0 ? `<span class="matrix-mini-pill fault">▲ ${procFault} Rusak</span>` : ""}
              <span class="matrix-mini-pill total">${procAssets.length} Unit</span>
            </div>
          </div>
          ${hasMultipleLines ? `
            <div class="matrix-lines-container">
              ${sortedLineGroups.map(([lineKey, g]) => renderLineSubGroup(lineKey, g.label, g.assets)).join("")}
            </div>
          ` : `
            <div class="matrix-grid-wrap">
              ${procAssets.map(assetMatrixTile).join("")}
            </div>
          `}
        </section>
      `;
    }).filter(Boolean).join("");
  }

  return `
    ${pageHead(state.page === "asset_matrix" ? "asset_matrix" : "asset_status", `<span class="range-badge">LIVE STATUS · ${totalCount} ASSETS</span>`)}
    <div class="asset-matrix-container ${currentDensity === "compact" ? "density-compact" : "density-normal"}">
      ${carouselBanner}
      ${kpiSummary}
      ${toolbar}
      <div class="matrix-content-area">
        ${gridContent}
      </div>
    </div>
  `;
}
