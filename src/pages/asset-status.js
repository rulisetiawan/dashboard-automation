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
  const procIcon = processIcons[asset.process] || "◉";
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
          <i class="matrix-type-icon">${procIcon}</i>
          <strong class="matrix-tile-id">${actualText(asset.id)}</strong>
        </span>
        <span class="matrix-status-dot ${effectiveState}" title="${actualText(statusInfo.label)}"></span>
      </div>
      <div class="matrix-tile-name" title="${actualText(asset.name)}">${actualText(asset.name)}</div>
      <div class="matrix-tile-footer">
        <span class="matrix-status-tag ${effectiveState}">
          <i class="matrix-status-symbol" aria-hidden="true">${statusInfo.icon}</i>
          <span class="matrix-status-label">${actualText(statusInfo.label)}</span>
        </span>
        ${isRunning && progressVal > 0 ? `<span class="matrix-progress-pill">${progressVal}%</span>` : ""}
      </div>
      ${isFault ? `<span class="matrix-alarm-glow" aria-hidden="true"></span>` : ""}
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

  const kpiSummary = `
    <section class="matrix-kpi-bar" aria-label="Status Summary and Quick Filter">
      <button class="matrix-kpi-pill all ${currentStatus === "all" ? "active" : ""}" data-matrix-status="all" type="button" title="Tampilkan Semua Status">
        <span class="matrix-kpi-icon">⊞</span>
        <span class="matrix-kpi-copy">
          <span class="matrix-kpi-label">Semua Asset</span>
          <strong class="matrix-kpi-val">${totalCount}</strong>
        </span>
      </button>
      <button class="matrix-kpi-pill running ${currentStatus === "running" ? "active" : ""}" data-matrix-status="running" type="button" title="Filter Mesin Running">
        <span class="matrix-kpi-icon">●</span>
        <span class="matrix-kpi-copy">
          <span class="matrix-kpi-label">Running</span>
          <strong class="matrix-kpi-val">${runningCount}</strong>
        </span>
      </button>
      <button class="matrix-kpi-pill idle ${currentStatus === "idle" ? "active" : ""}" data-matrix-status="idle" type="button" title="Filter Mesin Idle">
        <span class="matrix-kpi-icon">⏸</span>
        <span class="matrix-kpi-copy">
          <span class="matrix-kpi-label">Idle</span>
          <strong class="matrix-kpi-val">${idleCount}</strong>
        </span>
      </button>
      <button class="matrix-kpi-pill fault ${currentStatus === "fault" ? "active" : ""}" data-matrix-status="fault" type="button" title="Filter Mesin Rusak / Alarm">
        <span class="matrix-kpi-icon">▲</span>
        <span class="matrix-kpi-copy">
          <span class="matrix-kpi-label">Rusak / Fault</span>
          <strong class="matrix-kpi-val">${faultCount}</strong>
        </span>
      </button>
      <button class="matrix-kpi-pill warning ${currentStatus === "warning" ? "active" : ""}" data-matrix-status="warning" type="button" title="Filter Mesin Warning">
        <span class="matrix-kpi-icon">◆</span>
        <span class="matrix-kpi-copy">
          <span class="matrix-kpi-label">Warning</span>
          <strong class="matrix-kpi-val">${warningCount}</strong>
        </span>
      </button>
      <button class="matrix-kpi-pill offline ${currentStatus === "offline" ? "active" : ""}" data-matrix-status="offline" type="button" title="Filter Mesin Offline">
        <span class="matrix-kpi-icon">✕</span>
        <span class="matrix-kpi-copy">
          <span class="matrix-kpi-label">Offline</span>
          <strong class="matrix-kpi-val">${offlineCount}</strong>
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
              <span>📺 Layar Besar</span>
            </button>
            <button class="button compact ${currentDensity === "normal" ? "primary" : "ghost"}" data-matrix-density="normal" type="button" title="Tampilan Standar / Normal">
              <span>◻ Standar</span>
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
            const icon = processIcons[proc] || "◉";
            return `
              <button class="matrix-proc-tab ${currentProcess === proc ? "active" : ""}" data-matrix-process="${proc}" type="button">
                <i>${icon}</i> <span>${actualText(label)}</span> <span class="matrix-proc-count">${count}</span>
              </button>
            `;
          }).join("")}
        </div>
      ` : ""}

      <div class="matrix-legend-bar">
        <div class="matrix-legend-group">
          <span class="matrix-legend-title">Ikon Lini:</span>
          <span class="matrix-legend-item"><i>◉</i> Jetflow</span>
          <span class="matrix-legend-item"><i>≈</i> Calator</span>
          <span class="matrix-legend-item"><i>≋</i> Dryer</span>
          <span class="matrix-legend-item"><i>⊜</i> Kalender</span>
          <span class="matrix-legend-item"><i>↝</i> Continuous</span>
          <span class="matrix-legend-item"><i>⌕</i> Inspecting</span>
          <span class="matrix-legend-item"><i>◇</i> Finishing</span>
          <span class="matrix-legend-item"><i>≍</i> Dongnam</span>
          <span class="matrix-legend-item"><i>🧪</i> Chemical</span>
        </div>
        <div class="matrix-legend-group">
          <span class="matrix-legend-title">Status:</span>
          <span class="matrix-legend-color running"><i>●</i> Running</span>
          <span class="matrix-legend-color idle"><i>⏸</i> Idle</span>
          <span class="matrix-legend-color fault"><i>▲</i> Rusak / Fault</span>
          <span class="matrix-legend-color warning"><i>◆</i> Warning</span>
          <span class="matrix-legend-color offline"><i>✕</i> Offline</span>
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
          ? `${processIcons[currentProcess] || "◉"} ${processConfig[currentProcess]?.singular || currentProcess}`
          : "Semua Mesin Pabrik (Matriks Penuh)");
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
  } else {
    gridContent = distinctProcesses.map((proc) => {
      const procAssets = filteredAssets.filter((a) => a.process === proc);
      if (!procAssets.length) return "";
      const procLabel = processConfig[proc]?.singular || proc;
      const procIcon = processIcons[proc] || "◉";
      const procRunning = procAssets.filter((a) => assetEffectiveState(a) === "running").length;
      const procIdle = procAssets.filter((a) => assetEffectiveState(a) === "idle").length;
      const procFault = procAssets.filter((a) => assetEffectiveState(a) === "fault").length;

      return `
        <section class="matrix-section card">
          <div class="matrix-section-head">
            <div class="matrix-section-title">
              <span class="matrix-section-icon">${procIcon}</span>
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
          <div class="matrix-grid-wrap">
            ${procAssets.map(assetMatrixTile).join("")}
          </div>
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
