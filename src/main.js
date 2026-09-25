// ============================================================================
// Digital Automation Dashboard - Main Entry Point & Router
// ============================================================================

// Import all modules
import "./state.js";
import "./utils/formatters.js";
import "./pages/fleet.js";
import "./pages/overview.js";
import "./pages/asset-status.js";
import "./pages/command-center.js";
import "./pages/utilities.js";
import "./pages/chemical.js";
import "./pages/solar.js";
import "./pages/wwtp.js";
import "./pages/alarms.js";
import "./pages/trends.js";
import "./pages/health.js";
import "./components/modal-machine.js";
import "./pages/roles.js";
import "./pages/users.js";

// Main Router & Lifecycle Events
function renderPage({ preserveScroll = false, preserveAnchor = null } = {}) {
  deferredRealtimeRender = false;
  realtimeUiRefresh.pending = false;
  if (realtimeUiRefresh.timer) {
    clearTimeout(realtimeUiRefresh.timer);
    realtimeUiRefresh.timer = null;
  }
  const previousScroll = Number.isFinite(window.scrollY) ? window.scrollY : 0;
  const anchorViewportTop = preserveAnchor ? document.querySelector(preserveAnchor)?.getBoundingClientRect().top : null;
  const content = document.getElementById("page-content");
  const hasActualAssets = actualFleet().length > 0;
  if (backendConnection.status === "connected" && processNavigationPages.includes(state.page)) {
    const fleet = fleetFor(state.page);
    const drill = state.drill[state.page];
    if (drill?.machine && !fleet.some((machine) => machine.id === drill.machine)) drill.machine = null;
    if (drill?.area && !fleet.some((machine) => machine.area === drill.area)) drill.area = null;
    if (state.selected[state.page] && !fleet.some((machine) => machine.id === state.selected[state.page])) state.selected[state.page] = fleet[0]?.id || null;
  }
  persistDashboardNavigation();
  let pageContentHtml = "";
  if (!isPageAllowed(state.page)) {
    pageContentHtml = accessDeniedPage(state.page);
  } else if (state.page === "command_center") {
    pageContentHtml = actualCommandCenterPage();
  } else if (state.page === "roles") {
    pageContentHtml = rolePermissionPage();
  } else if (state.page === "users") {
    pageContentHtml = userManagementPage();
  } else if (state.page === "wwtp") {
    pageContentHtml = actualWwtpPage();
  } else if (state.page === "solar") {
    pageContentHtml = actualSolarPage();
  } else {
    const isFleetPage = ["overview", "jetflow", "calator", "dryer", "kalender"].includes(state.page);
    pageContentHtml = (isFleetPage && (backendConnection.status !== "connected" || !hasActualAssets))
      ? databaseIntegrationPage()
      : databaseDashboardPage();
  }
  content.innerHTML = pageContentHtml;
  document.getElementById("breadcrumb-page").textContent = pageMeta[state.page]?.[0] || state.page;
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.page === state.page));
  
  // Sinkronisasi badge status Command Center di sidebar
  const ccBadge = document.getElementById("nav-cc-badge");
  if (ccBadge) {
    const isCcOn = state.commandCenter?.enabled ?? true;
    ccBadge.textContent = isCcOn ? "LIVE" : "OFF";
    ccBadge.classList.toggle("live", isCcOn);
    ccBadge.classList.toggle("off", !isCcOn);
  }

  bindPageEvents();
  if (state.page === "asset_status" || state.page === "asset_matrix") {
    if (state.assetMatrix.carousel && !matrixCarouselTimer) {
      startMatrixCarouselTimer();
    }
  } else {
    stopMatrixCarouselTimer();
  }

  if (state.page === "command_center") {
    startCommandCenterTimer();
  } else {
    stopCommandCenterTimer();
  }
  if (backendConnection.status === "connected" && state.page === "overview") void loadProductionOutputByBatch();
  const nextAnchor = preserveAnchor ? document.querySelector(preserveAnchor) : null;
  if (nextAnchor && Number.isFinite(anchorViewportTop)) {
    const anchorDocumentTop = nextAnchor.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, anchorDocumentTop - anchorViewportTop), behavior: "auto" });
  } else {
    window.scrollTo({ top: preserveScroll ? previousScroll : 0, behavior: preserveScroll ? "auto" : "smooth" });
  }
  requestAnimationFrame(() => {
    initPageCharts();
    void activatePidBindingForCurrentView();
  });
}

function loadChemicalTransactionPage() {
  const transactionPanel = document.querySelector(".chemical-transaction-panel");
  transactionPanel?.setAttribute("aria-busy", "true");
  transactionPanel?.querySelectorAll("[data-chemical-page], [data-chemical-page-size]").forEach((control) => {
    control.disabled = true;
  });
  requestChemicalAnalytics({ preserveAnchor: ".chemical-transaction-panel" });
}

function normalizeBatchNumber(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 32);
}

function loadBatchInvestigation(type, machineId, rawBatch) {
  const batch = normalizeBatchNumber(rawBatch);
  if (!batch) {
    showToast("Batch number required", "Masukkan nomor batch sebelum memuat trend dan abnormality log.");
    document.querySelector(`[data-batch-input="${type}"]`)?.focus();
    return;
  }
  state.batchInvestigation[type] = { machineId, batch };
  showToast("Batch historian loaded", `${machineId} · ${batch}`);
  renderPage({ preserveScroll: true });
}

async function loadActualBatchProcessRun(processRunId) {
  if (!processRunId || actualBatchPrograms.has(processRunId) || actualBatchProgramLoading.has(processRunId)) return;
  actualBatchProgramLoading.add(processRunId);
  actualBatchProgramErrors.delete(processRunId);
  try {
    const response = await fetch(`/api/v1/batch/process-runs/${encodeURIComponent(processRunId)}/context`, { cache: "no-store" });
    if (!response.ok) throw new Error(response.status === 404 ? "Batch process run tidak ditemukan." : "Batch context API belum tersedia.");
    actualBatchPrograms.set(processRunId, await response.json());
  } catch (error) {
    actualBatchProgramErrors.set(processRunId, error instanceof Error ? error.message : "Batch context unavailable");
  } finally {
    actualBatchProgramLoading.delete(processRunId);
    renderPage({ preserveScroll: true });
  }
}

async function searchActualBatchProcessRun(machineId, batch) {
  try {
    const url = new URL("/api/v1/batch/lookup", window.location.origin);
    url.searchParams.set("asset_id", machineId);
    url.searchParams.set("batch_no", batch);
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json();
    if (payload.run && !backendProcessRuns.some((run) => run.process_run_id === payload.run.process_run_id)) backendProcessRuns.unshift(payload.run);
    return payload.run || null;
  } catch {
    return null;
  }
}

function trackDatabaseProcessRun(processRunId) {
  const run = backendProcessRuns.find((item) => item.process_run_id === processRunId);
  if (!run) return;
  const startedAt = new Date(run.started_at).getTime();
  const endedAt = new Date(run.ended_at || Date.now()).getTime();
  if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt) || startedAt >= endedAt) {
    showToast("Batch range unavailable", `${run.batch_no} belum memiliki start/end time yang valid.`);
    return;
  }
  state.batchInvestigation[run.process_type] = { machineId: run.asset_id, batch: run.batch_no, processRunId: run.process_run_id };
  state.machineSummary.scope = "batch";
  state.history.preset = "CUSTOM";
  state.history.start = startedAt;
  state.history.end = endedAt;
  actualHistorian.range = "CUSTOM";
  actualHistorian.viewStart = 0;
  actualHistorian.viewFraction = 1;
  actualHistorian.cache.delete(actualHistorianKey(run.asset_id));
  void loadActualBatchProcessRun(run.process_run_id);
  showToast("Batch loaded", `${run.batch_no} · ${formatDateTime(startedAt, true)} — ${formatDateTime(endedAt, true)}`);
  renderPage({ preserveScroll: true });
}

async function exportActualBatchProcessRun(processRunId, format, button) {
  if (!processRunId || !["pdf", "xlsx"].includes(format)) return;
  const originalLabel = button?.textContent || "Export";
  if (button) {
    button.disabled = true;
    button.textContent = "Preparing…";
    button.setAttribute("aria-busy", "true");
  }
  try {
    const endpoint = `/api/v1/batch/process-runs/${encodeURIComponent(processRunId)}/export?format=${encodeURIComponent(format)}`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || "Batch export gagal dibuat.");
    }
    const disposition = response.headers.get("content-disposition") || "";
    const headerFilename = disposition.match(/filename="?([^";]+)"?/i)?.[1];
    const fallbackRun = backendProcessRuns.find((run) => run.process_run_id === processRunId);
    const fallbackFilename = `${fallbackRun?.batch_no || "batch"}-process-detail.${format}`;
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = headerFilename || fallbackFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    showToast("Batch export ready", `${fallbackRun?.batch_no || "Batch"} berhasil diekspor ke ${format === "pdf" ? "PDF" : "Excel"}.`);
  } catch (error) {
    showToast("Export failed", error instanceof Error ? error.message : "Batch export gagal dibuat.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalLabel;
      button.removeAttribute("aria-busy");
    }
  }
}

let globalB2bTooltipEl = null;

function bindGlobalTooltips() {
  if (!globalB2bTooltipEl) {
    globalB2bTooltipEl = document.createElement("div");
    globalB2bTooltipEl.className = "b2b-floating-tooltip";
    globalB2bTooltipEl.setAttribute("role", "tooltip");
    globalB2bTooltipEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(globalB2bTooltipEl);
  }

  // Convert static title attributes on tooltip elements to data-tooltip to avoid default browser popups
  document.querySelectorAll("[title]").forEach((el) => {
    if (!el.dataset.tooltip) {
      el.dataset.tooltip = el.getAttribute("title");
      el.removeAttribute("title");
    }
  });

  const positionTooltip = (x, y) => {
    if (!globalB2bTooltipEl) return;
    const padding = 12;
    const tipWidth = globalB2bTooltipEl.offsetWidth;
    const tipHeight = globalB2bTooltipEl.offsetHeight;

    let left = x - (tipWidth / 2);
    let top = y - tipHeight - 10;

    // Flip below if too close to top
    if (top < padding) {
      top = y + 18;
    }
    // Prevent overflow left/right
    if (left < padding) left = padding;
    if (left + tipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tipWidth - padding;
    }

    globalB2bTooltipEl.style.left = `${left}px`;
    globalB2bTooltipEl.style.top = `${top}px`;
  };

  const showTooltip = (el, x, y) => {
    const text = el.dataset.tooltip || el.dataset.tip;
    if (!text) return;
    globalB2bTooltipEl.textContent = text;
    globalB2bTooltipEl.classList.add("visible");
    globalB2bTooltipEl.setAttribute("aria-hidden", "false");
    positionTooltip(x, y);
  };

  const hideTooltip = () => {
    if (globalB2bTooltipEl) {
      globalB2bTooltipEl.classList.remove("visible");
      globalB2bTooltipEl.setAttribute("aria-hidden", "true");
    }
  };

  document.querySelectorAll("[data-tooltip], [data-tip], .b2b-tooltip-trigger").forEach((el) => {
    el.addEventListener("pointerenter", (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX || (rect.left + rect.width / 2);
      const y = rect.top;
      showTooltip(el, x, y);
    });
    el.addEventListener("pointermove", (event) => {
      positionTooltip(event.clientX, event.clientY);
    });
    el.addEventListener("pointerleave", hideTooltip);
    el.addEventListener("focus", () => {
      const rect = el.getBoundingClientRect();
      showTooltip(el, rect.left + rect.width / 2, rect.top);
    });
    el.addEventListener("blur", hideTooltip);
  });
}

function bindPageEvents() {
  bindGlobalTooltips();
  bindSolarTrendTooltips();
  document.querySelectorAll("[data-solar-tab]").forEach((button) => button.addEventListener("click", () => {
    state.solar.tab = button.dataset.solarTab;
    renderPage({ preserveScroll: true });
  }));
  document.querySelectorAll("[data-solar-range]").forEach((button) => button.addEventListener("click", () => {
    state.solar.range = button.dataset.solarRange;
    state.solar.page = 1;
    invalidateSolarFueling();
    renderPage({ preserveScroll: true });
    if (state.solar.range !== "CUSTOM") {
      void loadSolarFueling({ force: true });
    }
  }));
  document.querySelectorAll("[data-solar-date]").forEach((input) => {
    const syncTime = () => {
      const timestamp = new Date(input.value).getTime();
      if (Number.isFinite(timestamp)) state.solar[input.dataset.solarDate === "from" ? "customFrom" : "customTo"] = timestamp;
    };
    input.addEventListener("input", syncTime);
    input.addEventListener("change", syncTime);
    input.addEventListener("blur", syncTime);
  });
  document.querySelectorAll("[data-solar-apply-range]").forEach((button) => button.addEventListener("click", () => {
    const fromInput = document.querySelector('[data-solar-date="from"]');
    const toInput = document.querySelector('[data-solar-date="to"]');
    const fromTime = fromInput && fromInput.value ? new Date(fromInput.value).getTime() : state.solar.customFrom;
    const toTime = toInput && toInput.value ? new Date(toInput.value).getTime() : state.solar.customTo;
    if (Number.isFinite(fromTime) && Number.isFinite(toTime)) {
      state.solar.customFrom = Math.min(fromTime, toTime);
      state.solar.customTo = Math.max(fromTime, toTime);
    }
    state.solar.page = 1;
    invalidateSolarFueling();
    renderPage({ preserveScroll: true });
    void loadSolarFueling({ force: true });
  }));
  document.querySelector("[data-solar-search-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.solar.search = String(form.get("search") || "").trim();
    state.solar.status = String(form.get("status") || "all");
    state.solar.page = 1; invalidateSolarFueling(); void loadSolarFueling({ force: true });
  });
  document.querySelectorAll("[data-solar-page]").forEach((button) => button.addEventListener("click", () => {
    if (button.disabled) return;
    const total = solarFueling.data?.transactions?.pagination?.total_pages || 1;
    state.solar.page = button.dataset.solarPage === "prev" ? Math.max(1,state.solar.page-1) : Math.min(total,state.solar.page+1);
    invalidateSolarFueling(); void loadSolarFueling({ force: true });
  }));
  document.querySelector("[data-solar-movement-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault(); const button = event.currentTarget.querySelector("button[type='submit']"); button.disabled = true;
    try { const values = Object.fromEntries(new FormData(event.currentTarget)); await submitSolarJson("/api/v1/solar/stock/movements", "POST", values); showToast("Stock movement saved", `${values.direction} ${values.quantity_liters} liter berhasil dicatat.`); }
    catch (error) { showToast("Stock movement failed", error instanceof Error ? error.message : "Data gagal disimpan."); }
    finally { button.disabled = false; }
  });
  document.querySelector("[data-solar-opname-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault(); const button = event.currentTarget.querySelector("button[type='submit']"); button.disabled = true;
    try { const values = Object.fromEntries(new FormData(event.currentTarget)); await submitSolarJson("/api/v1/solar/stock-opnames", "POST", { ...values, cutoff_at: new Date().toISOString() }); showToast("Stock opname recorded", "Perbandingan stok sistem dan stok fisik sudah dihitung."); }
    catch (error) { showToast("Stock opname failed", error instanceof Error ? error.message : "Data gagal disimpan."); }
    finally { button.disabled = false; }
  });
  document.querySelectorAll("[data-solar-opname-action]").forEach((button) => button.addEventListener("click", async () => {
    button.disabled = true;
    try { await submitSolarJson(`/api/v1/solar/stock-opnames/${encodeURIComponent(button.dataset.solarOpnameId)}`, "PATCH", { action: button.dataset.solarOpnameAction }); showToast("Stock opname updated", `Status berhasil diproses: ${button.dataset.solarOpnameAction}.`); }
    catch (error) { showToast("Approval failed", error instanceof Error ? error.message : "Status gagal diperbarui."); }
    finally { button.disabled = false; }
  }));
  document.querySelectorAll("[data-wwtp-tab]").forEach((button) => button.addEventListener("click", () => {
    state.wwtp.tab = button.dataset.wwtpTab;
    invalidateWwtp();
    renderPage({ preserveScroll: true });
  }));
  document.querySelectorAll("[data-wwtp-range]").forEach((button) => button.addEventListener("click", () => {
    state.wwtp.range = button.dataset.wwtpRange;
    invalidateWwtp();
    renderPage({ preserveScroll: true });
    if (state.wwtp.range !== "CUSTOM") {
      void loadWwtpData({ force: true });
    }
  }));
  document.querySelectorAll("[data-wwtp-date]").forEach((input) => {
    const syncTime = () => {
      const timestamp = new Date(input.value).getTime();
      if (Number.isFinite(timestamp)) state.wwtp[input.dataset.wwtpDate === "from" ? "customFrom" : "customTo"] = timestamp;
    };
    input.addEventListener("input", syncTime);
    input.addEventListener("change", syncTime);
    input.addEventListener("blur", syncTime);
  });
  document.querySelectorAll("[data-wwtp-apply-range]").forEach((button) => button.addEventListener("click", () => {
    const fromInput = document.querySelector('[data-wwtp-date="from"]');
    const toInput = document.querySelector('[data-wwtp-date="to"]');
    const fromTime = fromInput && fromInput.value ? new Date(fromInput.value).getTime() : state.wwtp.customFrom;
    const toTime = toInput && toInput.value ? new Date(toInput.value).getTime() : state.wwtp.customTo;

    if (!Number.isFinite(fromTime) || !Number.isFinite(toTime)) {
      showToast("Rentang waktu belum lengkap", "Pilih tanggal dari dan sampai terlebih dahulu.");
      return;
    }
    if (fromTime >= toTime) {
      showToast("Rentang waktu tidak valid", "Tanggal 'Sampai' harus lebih besar dari tanggal 'Dari'.");
      return;
    }
    state.wwtp.range = "CUSTOM";
    state.wwtp.customFrom = fromTime;
    state.wwtp.customTo = toTime;
    invalidateWwtp();
    renderPage({ preserveScroll: true });
    void loadWwtpData({ force: true });
  }));
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
  document.querySelectorAll("[data-pid-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const panelType = button.dataset.pidToggle;
      if (!(panelType in state.pidPanel)) return;
      const isCollapsed = !state.pidPanel[panelType];
      state.pidPanel[panelType] = isCollapsed;
      persistDashboardNavigation();
      const card = button.closest("[data-pid-panel]");
      const body = card?.querySelector(".kalender-pid-body");
      card?.classList.toggle("is-collapsed", isCollapsed);
      button.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
      const label = button.querySelector("span");
      if (label) label.textContent = isCollapsed ? "Expand P&ID" : "Minimize P&ID";
      if (body) {
        if (isCollapsed) body.setAttribute("aria-hidden", "true");
        else body.removeAttribute("aria-hidden");
      }
    });
  });
  document.querySelectorAll("[data-parameter-toggle='continuous']").forEach((button) => {
    button.addEventListener("click", () => {
      state.continuousParametersExpanded = !state.continuousParametersExpanded;
      persistDashboardNavigation();
      renderPage({ preserveScroll: true, preserveAnchor: ".finishing-monitoring-scope" });
    });
  });
  document.querySelectorAll("[data-sensor-toggle='continuous']").forEach((button) => {
    button.addEventListener("click", () => {
      state.continuousSensorExpanded = !state.continuousSensorExpanded;
      persistDashboardNavigation();
      renderPage({ preserveScroll: true, preserveAnchor: ".sensor-filter-toolbar" });
    });
  });
  document.querySelectorAll("[data-chemical-unit]").forEach((card) => {
    const openUnit = () => {
      const machine = dispensers.find((item) => item.id === card.dataset.chemicalUnit);
      if (!machine) return;
      state.selected.chemical = machine.id;
      state.drill.chemical = { area: machine.area, machine: machine.id };
      state.chemicalLog.page = 1;
      invalidateChemicalAnalytics();
      renderPage();
    };
    card.addEventListener("click", openUnit);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openUnit();
      }
    });
  });
  document.querySelectorAll("[data-chemical-view='overview']").forEach((button) => {
    button.addEventListener("click", () => {
      state.drill.chemical = { area: null, machine: null };
      state.chemicalLog.page = 1;
      invalidateChemicalAnalytics();
      renderPage();
    });
  });
  document.querySelectorAll("[data-chemical-analytics-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      const key = select.dataset.chemicalAnalyticsFilter;
      state.chemicalLog[key] = select.value;
      if (key === "range" && select.value !== "CUSTOM") state.chemicalLog.anchorEnd = Date.now();
      state.chemicalLog.page = 1;
      invalidateChemicalAnalytics();
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-chemical-analytics-date]").forEach((input) => {
    const syncTime = () => {
      const value = new Date(input.value).getTime();
      if (Number.isFinite(value)) state.chemicalLog[input.dataset.chemicalAnalyticsDate === "start" ? "customStart" : "customEnd"] = value;
    };
    input.addEventListener("input", syncTime);
    input.addEventListener("change", syncTime);
    input.addEventListener("blur", syncTime);
  });
  document.querySelectorAll("[data-chemical-analytics-apply]").forEach((button) => button.addEventListener("click", () => {
    const startInput = document.querySelector('[data-chemical-analytics-date="start"]');
    const endInput = document.querySelector('[data-chemical-analytics-date="end"]');
    const startVal = startInput && startInput.value ? new Date(startInput.value).getTime() : state.chemicalLog.customStart;
    const endVal = endInput && endInput.value ? new Date(endInput.value).getTime() : state.chemicalLog.customEnd;
    if (Number.isFinite(startVal) && Number.isFinite(endVal)) {
      state.chemicalLog.customStart = Math.min(startVal, endVal);
      state.chemicalLog.customEnd = Math.max(startVal, endVal);
    }
    state.chemicalLog.page = 1;
    invalidateChemicalAnalytics();
    renderPage({ preserveScroll: true });
  }));
  document.querySelectorAll("[data-chemical-chart-code]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const code = checkbox.dataset.chemicalChartCode;
      const hidden = new Set(state.chemicalLog.chartHidden);
      if (checkbox.checked) hidden.delete(code);
      else hidden.add(code);
      state.chemicalLog.chartHidden = [...hidden];
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-chemical-chart-bulk]").forEach((button) => {
    button.addEventListener("click", () => {
      const codes = chemicalAnalytics.data?.available_chemicals?.map((item) => item.chemical_code) || [];
      state.chemicalLog.chartHidden = button.dataset.chemicalChartBulk === "hide" ? codes : [];
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelector("[data-chemical-page-size]")?.addEventListener("change", (event) => {
    state.chemicalLog.pageSize = Number(event.target.value) || 25;
    state.chemicalLog.page = 1;
    invalidateChemicalAnalytics();
    loadChemicalTransactionPage();
  });
  document.querySelectorAll("[data-chemical-page]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      const totalPages = chemicalAnalytics.data?.pagination?.total_pages || 1;
      state.chemicalLog.page = button.dataset.chemicalPage === "prev" ? Math.max(1, state.chemicalLog.page - 1) : Math.min(totalPages, state.chemicalLog.page + 1);
      invalidateChemicalAnalytics();
      loadChemicalTransactionPage();
    });
  });
  document.querySelectorAll("[data-actual-trend-range]").forEach((button) => {
    button.addEventListener("click", () => {
      actualHistorian.range = button.dataset.actualTrendRange;
      actualHistorian.viewStart = 0;
      actualHistorian.viewFraction = 1;
      if (actualHistorian.range !== "CUSTOM") {
        const range = actualHistorianRange();
        state.history.start = range.from.getTime();
        state.history.end = range.to.getTime();
      }
      renderPage({ preserveScroll: true });
    });
  });
  const releaseDeferredHistorianRender = (select) => {
    if (select.dataset.deferredRenderBound) return;
    select.dataset.deferredRenderBound = "true";
    select.addEventListener("blur", () => {
      window.setTimeout(() => {
        if (!deferredRealtimeRender) return;
        scheduleSafeRealtimeRender();
      }, 0);
    });
  };
  document.querySelectorAll("select, input, textarea").forEach(releaseDeferredHistorianRender);
  document.querySelectorAll("[data-actual-trend-parameter]").forEach((select) => {
    select.addEventListener("change", () => {
      rememberActualParameter(select.dataset.actualTrendParameter, select.value);
      deferredRealtimeRender = false;
      renderPage({ preserveScroll: true });
    });
    releaseDeferredHistorianRender(select);
  });
  document.querySelectorAll("[data-actual-motor-select]").forEach((select) => {
    select.addEventListener("change", () => {
      actualHistorian.selectedEquipment.set(select.dataset.actualMotorSelect, select.value);
      deferredRealtimeRender = false;
      renderPage({ preserveScroll: true });
    });
    releaseDeferredHistorianRender(select);
  });
  document.querySelector("[data-history-explorer-asset]")?.addEventListener("change", (event) => {
    actualHistorian.explorerAssetId = event.target.value;
    actualHistorian.viewStart = 0;
    actualHistorian.viewFraction = 1;
    deferredRealtimeRender = false;
    renderPage({ preserveScroll: true });
  });
  const explorerAssetSelect = document.querySelector("[data-history-explorer-asset]");
  if (explorerAssetSelect) releaseDeferredHistorianRender(explorerAssetSelect);
  document.querySelector("[data-history-explorer-parameter]")?.addEventListener("change", (event) => {
    rememberActualParameter(event.target.dataset.historyExplorerParameter, event.target.value);
    actualHistorian.viewStart = 0;
    actualHistorian.viewFraction = 1;
    deferredRealtimeRender = false;
    renderPage({ preserveScroll: true });
  });
  const explorerParameterSelect = document.querySelector("[data-history-explorer-parameter]");
  if (explorerParameterSelect) releaseDeferredHistorianRender(explorerParameterSelect);
  document.querySelectorAll("[data-actual-history-date]").forEach((input) => {
    const rememberDateValue = () => {
      const value = new Date(input.value).getTime();
      if (!Number.isFinite(value)) return;
      state.history[input.dataset.actualHistoryDate === "start" ? "start" : "end"] = value;
    };
    input.addEventListener("input", rememberDateValue);
    input.addEventListener("change", rememberDateValue);
    input.addEventListener("blur", rememberDateValue);
  });
  document.querySelectorAll("[data-actual-history-apply]").forEach((button) => button.addEventListener("click", (event) => {
    const start = new Date(document.querySelector('[data-actual-history-date="start"]')?.value || "").getTime();
    const end = new Date(document.querySelector('[data-actual-history-date="end"]')?.value || "").getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
      showToast("Invalid time range", "Start time harus lebih awal dari end time.");
      return;
    }
    state.history.start = start;
    state.history.end = end;
    actualHistorian.viewStart = 0;
    actualHistorian.viewFraction = 1;
    actualHistorian.cache.delete(actualHistorianKey(event.currentTarget.dataset.actualHistoryApply || actualHistorian.explorerAssetId));
    renderPage({ preserveScroll: true });
  }));
  document.querySelectorAll("[data-actual-history-shift]").forEach((button) => button.addEventListener("click", () => shiftActualHistoryView(button.dataset.actualHistoryShift === "back" ? -0.12 : 0.12)));
  document.querySelectorAll("[data-actual-history-zoom]").forEach((button) => button.addEventListener("click", () => zoomActualHistoryView(button.dataset.actualHistoryZoom === "in" ? 0.62 : 1.5)));
  document.querySelector("[data-actual-history-fit]")?.addEventListener("click", () => {
    actualHistorian.viewStart = 0;
    actualHistorian.viewFraction = 1;
    drawActualHistoryExplorer();
  });
  bindActualHistoryExplorerPan();
  document.querySelectorAll("[data-actual-power-area]").forEach((element) => {
    const selectArea = () => {
      state.utility.selectedPowerArea = element.dataset.actualPowerArea;
      renderPage({ preserveScroll: true });
    };
    element.addEventListener("click", selectArea);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectArea(); }
    });
  });
  // Machine Table Controls
  document.querySelectorAll("[data-mt-process]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.machineTable.process = btn.dataset.mtProcess;
      state.machineTable.area = "all";
      state.machineTable.page = 1;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-mt-area]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.machineTable.area = btn.dataset.mtArea;
      state.machineTable.page = 1;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-mt-status]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.machineTable.status = btn.dataset.mtStatus;
      state.machineTable.page = 1;
      renderPage({ preserveScroll: true });
    });
  });

  const searchInput = document.querySelector("[data-mt-search]");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.machineTable.search = e.target.value;
      state.machineTable.page = 1;
      renderPage({ preserveScroll: true });
      const newInput = document.querySelector("[data-mt-search]");
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(newInput.value.length, newInput.value.length);
      }
    });
  }

  document.querySelector("[data-mt-clear-search]")?.addEventListener("click", () => {
    state.machineTable.search = "";
    state.machineTable.page = 1;
    renderPage({ preserveScroll: true });
  });

  document.querySelectorAll("[data-mt-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.mtPage;
      if (action === "first") state.machineTable.page = 1;
      else if (action === "prev") state.machineTable.page = Math.max(1, state.machineTable.page - 1);
      else if (action === "next") state.machineTable.page = state.machineTable.page + 1;
      else if (action === "last") state.machineTable.page = 9999;
      else if (!isNaN(Number(action))) state.machineTable.page = Number(action);
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-matrix-status]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetMatrix.status = button.dataset.matrixStatus;
      state.assetMatrix.page = 1;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-matrix-process]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetMatrix.process = button.dataset.matrixProcess;
      state.assetMatrix.page = 1;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-matrix-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.matrixPage;
      if (action === "prev") {
        state.assetMatrix.page = Math.max(1, (state.assetMatrix.page || 1) - 1);
      } else if (action === "next") {
        state.assetMatrix.page = (state.assetMatrix.page || 1) + 1;
      } else if (!isNaN(Number(action))) {
        state.assetMatrix.page = Number(action);
      }
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-matrix-density]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetMatrix.density = button.dataset.matrixDensity;
      renderPage({ preserveScroll: true, preserveAnchor: ".matrix-toolbar-card" });
    });
  });

  document.querySelectorAll("[data-matrix-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetMatrix.viewMode = button.dataset.matrixView;
      renderPage({ preserveScroll: true, preserveAnchor: ".matrix-toolbar-card" });
    });
  });

  // Matrix Carousel Controls
  document.querySelectorAll("[data-matrix-carousel-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetMatrix.carousel = !state.assetMatrix.carousel;
      state.assetMatrix.remainingSeconds = 30;
      state.assetMatrix.isPaused = false;
      if (state.assetMatrix.carousel) {
        startMatrixCarouselTimer();
      } else {
        stopMatrixCarouselTimer();
      }
      renderPage({ preserveScroll: false });
    });
  });

  document.querySelectorAll("[data-matrix-carousel-stop]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetMatrix.carousel = false;
      stopMatrixCarouselTimer();
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-matrix-carousel-prev]").forEach((button) => {
    button.addEventListener("click", () => {
      const len = matrixCarouselSlides.length;
      state.assetMatrix.slideIndex = (state.assetMatrix.slideIndex - 1 + len) % len;
      state.assetMatrix.remainingSeconds = 30;
      renderPage({ preserveScroll: false });
    });
  });

  document.querySelectorAll("[data-matrix-carousel-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const len = matrixCarouselSlides.length;
      state.assetMatrix.slideIndex = (state.assetMatrix.slideIndex + 1) % len;
      state.assetMatrix.remainingSeconds = 30;
      renderPage({ preserveScroll: false });
    });
  });

  document.querySelectorAll("[data-matrix-carousel-toggle-pause]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetMatrix.isPaused = !state.assetMatrix.isPaused;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-matrix-slide-to]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetMatrix.slideIndex = Number(button.dataset.matrixSlideTo) || 0;
      state.assetMatrix.remainingSeconds = 30;
      renderPage({ preserveScroll: false });
    });
  });

  // --- Command Center Controls & Actions ---
  document.querySelectorAll("[data-cc-toggle-status]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.commandCenter.enabled = !state.commandCenter.enabled;
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("smm_cc_enabled", String(state.commandCenter.enabled));
      }
      showToast(
        state.commandCenter.enabled ? "Command Center Aktif" : "Command Center Dinonaktifkan",
        state.commandCenter.enabled ? "Tampilan visual SCADA / MES aktif" : "Dashboard beralih ke mode standby"
      );
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-cc-prev]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.commandCenter.slideIndex = ((state.commandCenter.slideIndex || 0) + 3) % 4;
      state.commandCenter.remainingSeconds = state.commandCenter.autoIntervalSec || 14;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-cc-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.commandCenter.slideIndex = ((state.commandCenter.slideIndex || 0) + 1) % 4;
      state.commandCenter.remainingSeconds = state.commandCenter.autoIntervalSec || 14;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-cc-slide]").forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset.ccSlide);
      if (!isNaN(idx)) {
        state.commandCenter.slideIndex = idx;
        state.commandCenter.remainingSeconds = state.commandCenter.autoIntervalSec || 14;
        renderPage({ preserveScroll: true });
      }
    });
  });

  document.querySelectorAll("[data-cc-toggle-pause]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.commandCenter.isPaused = !state.commandCenter.isPaused;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-cc-fullscreen]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        const root = document.getElementById("scada-cc-root") || document.documentElement;
        if (!document.fullscreenElement) {
          await root.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen toggle failed", err);
      }
    });
  });

  const matrixSearch = document.querySelector("[data-matrix-search]");
  if (matrixSearch) {
    matrixSearch.addEventListener("input", (event) => {
      state.assetMatrix.search = event.target.value;
      scheduleMatrixSearchRender();
    });
  }

  document.querySelector("[data-matrix-clear-search]")?.addEventListener("click", () => {
    state.assetMatrix.search = "";
    renderPage({ preserveScroll: true, preserveAnchor: ".matrix-toolbar-card" });
  });

  document.querySelector("[data-matrix-reset-filters]")?.addEventListener("click", () => {
    state.assetMatrix.status = "all";
    state.assetMatrix.process = "all";
    state.assetMatrix.search = "";
    renderPage({ preserveScroll: true });
  });

  document.querySelectorAll("[data-machine-row]").forEach((row) => {
    const openMachine = () => {
      const [type, machineId] = row.dataset.machineRow.split("|");
      if (type && machineId) openMachineDetail(type, machineId);
    };
    row.addEventListener("click", openMachine);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMachine();
      }
    });
  });
  document.querySelectorAll("[data-machine-summary-scope]").forEach((button) => {
    button.addEventListener("click", () => {
      state.machineSummary.scope = button.dataset.machineSummaryScope;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-machine-summary-date]").forEach((input) => {
    input.addEventListener("change", () => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input.value)) return;
      state.machineSummary.productionDate = input.value;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-machine-summary-shift]").forEach((select) => {
    select.addEventListener("change", () => {
      if (!["A", "B", "C"].includes(select.value)) return;
      state.machineSummary.shiftCode = select.value;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-actual-batch-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const machineId = form.dataset.actualBatchForm;
      const batch = normalizeBatchNumber(form.querySelector("[data-actual-batch-input]")?.value);
      if (!batch) {
        showToast("Batch number required", "Masukkan nomor batch yang akan dimuat.");
        form.querySelector("[data-actual-batch-input]")?.focus();
        return;
      }
      const submit = form.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;
      const run = backendProcessRuns.find((item) => item.asset_id === machineId && String(item.batch_no).toUpperCase() === batch)
        || await searchActualBatchProcessRun(machineId, batch);
      if (submit) submit.disabled = false;
      if (!run) {
        showToast("Batch tidak ditemukan", `${batch} tidak terdaftar untuk ${machineId}.`);
        form.querySelector("[data-actual-batch-input]")?.focus();
        return;
      }
      trackDatabaseProcessRun(run.process_run_id);
    });
  });
  document.querySelectorAll("[data-actual-batch-clear]").forEach((button) => {
    button.addEventListener("click", () => {
      state.batchInvestigation[button.dataset.actualBatchClear] = { machineId: null, batch: null };
      if (state.machineSummary.scope === "batch") state.machineSummary.scope = "shift";
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-track-process-run]").forEach((button) => {
    button.addEventListener("click", () => trackDatabaseProcessRun(button.dataset.trackProcessRun));
  });
  document.querySelectorAll("[data-actual-batch-export]").forEach((button) => {
    button.addEventListener("click", () => void exportActualBatchProcessRun(button.dataset.actualBatchExport, button.dataset.exportFormat, button));
  });

  // Historical Telemetry Table Controls
  document.querySelectorAll("[data-ht-process]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.historyTable.process = btn.dataset.htProcess;
      state.historyTable.area = "all";
      state.historyTable.assetId = "all";
      state.historyTable.page = 1;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-ht-area]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.historyTable.area = btn.dataset.htArea;
      state.historyTable.assetId = "all";
      state.historyTable.page = 1;
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelector("[data-ht-asset-select]")?.addEventListener("change", (e) => {
    state.historyTable.assetId = e.target.value;
    state.historyTable.page = 1;
    renderPage({ preserveScroll: true });
  });

  document.querySelector("[data-ht-role-select]")?.addEventListener("change", (e) => {
    state.historyTable.role = e.target.value;
    state.historyTable.page = 1;
    renderPage({ preserveScroll: true });
  });

  document.querySelector("[data-ht-pagesize-select]")?.addEventListener("change", (e) => {
    state.historyTable.pageSize = Number(e.target.value) || 15;
    state.historyTable.page = 1;
    renderPage({ preserveScroll: true });
  });

  const htSearchInput = document.querySelector("[data-ht-search]");
  if (htSearchInput) {
    htSearchInput.addEventListener("input", (e) => {
      state.historyTable.search = e.target.value;
      state.historyTable.page = 1;
      renderPage({ preserveScroll: true });
      const newInput = document.querySelector("[data-ht-search]");
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(newInput.value.length, newInput.value.length);
      }
    });
  }

  document.querySelector("[data-ht-clear-search]")?.addEventListener("click", () => {
    state.historyTable.search = "";
    state.historyTable.page = 1;
    renderPage({ preserveScroll: true });
  });

  document.querySelectorAll("[data-ht-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.htPage;
      if (action === "first") state.historyTable.page = 1;
      else if (action === "prev") state.historyTable.page = Math.max(1, state.historyTable.page - 1);
      else if (action === "next") state.historyTable.page = state.historyTable.page + 1;
      else if (action === "last") state.historyTable.page = 9999;
      else if (!isNaN(Number(action))) state.historyTable.page = Number(action);
      renderPage({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-page-target]").forEach((el) => {
    el.addEventListener("click", () => navigate(el.dataset.pageTarget));
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") navigate(el.dataset.pageTarget);
    });
  });
  document.querySelectorAll("[data-machine-select]").forEach((select) => {
    select.addEventListener("change", () => {
      state.selected[select.dataset.machineSelect] = select.value;
      if (state.drill[select.dataset.machineSelect]) state.drill[select.dataset.machineSelect].machine = select.value;
      if (select.dataset.machineSelect === "chemical") state.chemicalLog.calator = "all";
      renderPage();
    });
  });
  document.querySelectorAll("[data-batch-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const [type, machineId] = form.dataset.batchForm.split("|");
      loadBatchInvestigation(type, machineId, form.querySelector("[data-batch-input]")?.value);
    });
  });
  document.querySelectorAll("[data-batch-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      const [type, machineId, batch] = button.dataset.batchSuggestion.split("|");
      loadBatchInvestigation(type, machineId, batch);
    });
  });
  document.querySelectorAll("[data-batch-clear]").forEach((button) => {
    button.addEventListener("click", () => {
      const [type] = button.dataset.batchClear.split("|");
      state.batchInvestigation[type] = { machineId: null, batch: null };
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-area-target]").forEach((card) => {
    const openArea = () => {
      const [type, area] = card.dataset.areaTarget.split("|");
      state.drill[type] = { area, machine: null };
      renderPage();
    };
    card.addEventListener("click", openArea);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openArea(); }
    });
  });
  document.querySelectorAll("[data-machine-target]").forEach((card) => {
    const openMachine = () => {
      const [type, machine] = card.dataset.machineTarget.split("|");
      openMachineDetail(type, machine);
    };
    card.addEventListener("click", openMachine);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openMachine(); }
    });
  });
  document.querySelectorAll("[data-management-metric]").forEach((button) => {
    button.addEventListener("click", () => {
      const [type, metric] = button.dataset.managementMetric.split("|");
      state.management.metric[type] = metric;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-resource-area]").forEach((button) => {
    const openResourceArea = () => {
      const [type, area, metric] = button.dataset.resourceArea.split("|");
      state.management.metric[type] = metric;
      state.management.area[type] = area;
      renderPage({ preserveScroll: true });
    };
    button.addEventListener("click", openResourceArea);
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openResourceArea(); }
    });
  });
  document.querySelectorAll("[data-ranking-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      state.management.area[button.dataset.rankingReset] = null;
      renderPage({ preserveScroll: true });
    });
  });
  document.getElementById("electrical-level-select")?.addEventListener("change", (event) => {
    state.utility.electricalLevel = event.target.value;
    state.utility.selectedElectrical = electricalDistribution[event.target.value][0].id;
    renderPage({ preserveScroll: true });
  });
  document.getElementById("electrical-asset-select")?.addEventListener("change", (event) => {
    state.utility.selectedElectrical = event.target.value;
    renderPage({ preserveScroll: true });
  });
  document.querySelectorAll("[data-electrical-asset]").forEach((button) => {
    button.addEventListener("click", () => {
      state.utility.selectedElectrical = button.dataset.electricalAsset;
      renderPage({ preserveScroll: true });
    });
  });
  document.getElementById("machine-power-type-select")?.addEventListener("change", (event) => {
    const type = event.target.value;
    const firstArea = processAreas[type][0];
    const firstMachine = fleetFor(type).find((machine) => machine.area === firstArea.code);
    state.utility.machinePowerType = type;
    state.utility.selectedPowerArea = firstArea.code;
    state.utility.selectedPowerMachine = firstMachine?.id || null;
    renderPage({ preserveScroll: true });
  });
  document.querySelectorAll("[data-machine-power-area]").forEach((button) => {
    button.addEventListener("click", () => {
      const area = button.dataset.machinePowerArea;
      const firstMachine = fleetFor(state.utility.machinePowerType).find((machine) => machine.area === area);
      state.utility.selectedPowerArea = area;
      state.utility.selectedPowerMachine = firstMachine?.id || null;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-machine-power-meter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.utility.selectedPowerMachine = button.dataset.machinePowerMeter;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-open-power-machine]").forEach((button) => {
    button.addEventListener("click", () => {
      const [type, machineId] = button.dataset.openPowerMachine.split("|");
      openMachineDetail(type, machineId);
    });
  });
  document.querySelectorAll("[data-process-level]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.processType;
      if (button.dataset.processLevel === "overview") state.drill[type] = { area: null, machine: null };
      else state.drill[type].machine = null;
      renderPage();
    });
  });
  document.querySelectorAll("[data-range]").forEach((button) => {
    button.addEventListener("click", () => {
      state.range = button.dataset.range;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-sensor-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const [type, key] = checkbox.dataset.sensorToggle.split("|");
      const enabled = state.sensorTrend.enabled[type];
      if (checkbox.checked && !enabled.includes(key)) enabled.push(key);
      if (!checkbox.checked) state.sensorTrend.enabled[type] = enabled.filter((item) => item !== key);
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-sensor-bulk]").forEach((button) => {
    button.addEventListener("click", () => {
      const [type, action] = button.dataset.sensorBulk.split("|");
      state.sensorTrend.enabled[type] = action === "on" ? sensorTrendConfig[type].map((sensor) => sensor.key) : [];
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-jetflow-process-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const process = checkbox.dataset.jetflowProcessToggle;
      const enabled = state.jetflowProgram.enabled;
      if (checkbox.checked && !enabled.includes(process)) enabled.push(process);
      if (!checkbox.checked) state.jetflowProgram.enabled = enabled.filter((item) => item !== process);
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-jetflow-process-bulk]").forEach((button) => {
    button.addEventListener("click", () => {
      state.jetflowProgram.enabled = button.dataset.jetflowProcessBulk === "on" ? [...jetflowProcessSteps] : [];
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-sensor-range]").forEach((button) => {
    button.addEventListener("click", () => {
      state.sensorTrend.range = button.dataset.sensorRange;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-chemical-log-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      state.chemicalLog[select.dataset.chemicalLogFilter] = select.value;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-chemical-custom-date]").forEach((input) => {
    const syncTime = () => {
      const value = new Date(input.value).getTime();
      if (Number.isFinite(value)) state.chemicalLog[input.dataset.chemicalCustomDate === "start" ? "customStart" : "customEnd"] = value;
    };
    input.addEventListener("input", syncTime);
    input.addEventListener("change", syncTime);
    input.addEventListener("blur", syncTime);
  });
  document.querySelectorAll("[data-chemical-custom-apply]").forEach((button) => {
    button.addEventListener("click", () => {
      const startInput = document.querySelector('[data-chemical-custom-date="start"]');
      const endInput = document.querySelector('[data-chemical-custom-date="end"]');
      const startVal = startInput && startInput.value ? new Date(startInput.value).getTime() : state.chemicalLog.customStart;
      const endVal = endInput && endInput.value ? new Date(endInput.value).getTime() : state.chemicalLog.customEnd;
      if (Number.isFinite(startVal) && Number.isFinite(endVal)) {
        state.chemicalLog.customStart = Math.min(startVal, endVal);
        state.chemicalLog.customEnd = Math.max(startVal, endVal);
      }
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-dispensing-calator-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.chemicalLog.calator = button.dataset.dispensingCalatorFilter;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-dispensing-calator-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      state.chemicalLog.calator = "all";
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-motor-drive-target]").forEach((card) => {
    const openMotorDrive = () => {
      state.motorDrive.selected = card.dataset.motorDriveTarget;
      state.motorDrive.source = card.dataset.motorDriveSource || "kalender";
      renderPage({ preserveScroll: true });
    };
    card.addEventListener("click", openMotorDrive);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openMotorDrive(); }
    });
  });
  document.querySelectorAll("[data-motor-drive-range]").forEach((button) => {
    button.addEventListener("click", () => {
      state.motorDrive.range = button.dataset.motorDriveRange;
      state.motorDrive.viewFraction = .28;
      state.motorDrive.viewStart = .72;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-motor-drive-metric]").forEach((button) => {
    button.addEventListener("click", () => {
      state.motorDrive.metric = button.dataset.motorDriveMetric;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-motor-drive-close]").forEach((button) => {
    button.addEventListener("click", () => {
      state.motorDrive.selected = null;
      state.motorDrive.source = null;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-motor-drive-backdrop]").forEach((backdrop) => {
    backdrop.addEventListener("click", (event) => {
      if (event.target !== backdrop) return;
      state.motorDrive.selected = null;
      state.motorDrive.source = null;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-motor-log-export]").forEach((button) => {
    button.addEventListener("click", exportMotorHistoricalLog);
  });
  document.querySelectorAll("[data-history-range]").forEach((button) => {
    button.addEventListener("click", () => selectHistoryRange(button.dataset.historyRange));
  });
  const applyHistory = document.getElementById("apply-history-range");
  if (applyHistory) applyHistory.addEventListener("click", applyCustomHistoryRange);
  document.getElementById("trend-zoom-in")?.addEventListener("click", () => zoomHistoricalTrend(0.68));
  document.getElementById("trend-zoom-out")?.addEventListener("click", () => zoomHistoricalTrend(1.45));
  document.getElementById("trend-fit")?.addEventListener("click", fitHistoricalTrend);
  if (state.page === "trends") bindHistoricalPan();
  document.querySelectorAll("[data-ack-id]").forEach((button) => {
    button.addEventListener("click", () => acknowledgeAlarm(Number(button.dataset.ackId)));
  });
  const ackAll = document.getElementById("ack-all");
  if (ackAll) ackAll.addEventListener("click", acknowledgeAll);
  const alarmSearch = document.getElementById("alarm-search");
  const alarmSeverity = document.getElementById("alarm-severity");
  const alarmArea = document.getElementById("alarm-area-filter");
  document.querySelector("[data-alarm-config-jump]")?.addEventListener("click", () => document.getElementById("alarm-rule-configuration")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  document.querySelectorAll("[data-open-active-alarms]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openActiveAlarmPage();
    });
  });
  const alarmRuleForm = document.querySelector("[data-alarm-rule-form]");
  alarmRuleForm?.addEventListener("input", () => captureAlarmRuleDraft(alarmRuleForm));
  alarmRuleForm?.addEventListener("change", () => captureAlarmRuleDraft(alarmRuleForm));
  alarmRuleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveAlarmRule(event.currentTarget);
  });
  document.querySelector("[data-alarm-rule-asset]")?.addEventListener("change", (event) => {
    event.stopPropagation();
    captureAlarmRuleDraft(alarmRuleForm);
    state.alarmConfig.assetId = event.target.value;
    state.alarmConfig.tagCode = null;
    state.alarmConfig.draft = { ...state.alarmConfig.draft, asset_id: event.target.value, tag_code: null };
    void requestAlarmTags(event.target.value);
    renderPage({ preserveScroll: true });
  });
  document.querySelector("[data-alarm-rule-tag]")?.addEventListener("change", (event) => {
    state.alarmConfig.tagCode = event.target.value;
    state.alarmConfig.draft = { ...state.alarmConfig.draft, tag_code: event.target.value };
  });
  document.querySelector("[data-alarm-rule-cancel]")?.addEventListener("click", () => {
    state.alarmConfig.editingRuleId = null;
    state.alarmConfig.draft = {};
    renderPage({ preserveScroll: true });
  });
  document.querySelectorAll("[data-alarm-rule-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const rule = alarmConfiguration.rules.find((item) => item.rule_id === button.dataset.alarmRuleEdit);
      if (!rule) return;
      state.alarmConfig.editingRuleId = rule.rule_id;
      state.alarmConfig.assetId = rule.asset_id;
      state.alarmConfig.tagCode = rule.tag_code;
      state.alarmConfig.draft = {
        rule_name: rule.rule_name,
        asset_id: rule.asset_id,
        tag_code: rule.tag_code,
        rule_type: rule.rule_type,
        severity: rule.severity,
        threshold_value: String(rule.threshold_value),
        hysteresis_value: String(rule.hysteresis_value),
        delay_seconds: String(rule.delay_seconds),
        alarm_message: rule.alarm_message || "",
        recommendation: rule.recommendation || "",
        enabled: Boolean(rule.enabled),
      };
      void requestAlarmTags(rule.asset_id);
      renderPage({ preserveScroll: true });
      document.getElementById("alarm-rule-configuration")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  document.querySelectorAll("[data-alarm-rule-toggle]").forEach((button) => {
    button.addEventListener("click", () => void toggleAlarmRule(button.dataset.alarmRuleToggle, button.dataset.ruleEnabled !== "true"));
  });
  const deviationRuleForm = document.querySelector("[data-deviation-rule-form]");
  deviationRuleForm?.addEventListener("input", () => captureDeviationRuleDraft(deviationRuleForm));
  deviationRuleForm?.addEventListener("change", () => captureDeviationRuleDraft(deviationRuleForm));
  deviationRuleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveDeviationRule(event.currentTarget);
  });
  document.querySelector("[data-deviation-rule-asset]")?.addEventListener("change", (event) => {
    captureDeviationRuleDraft(deviationRuleForm);
    state.alarmConfig.deviationAssetId = event.target.value;
    state.alarmConfig.deviationPvTagCode = null;
    state.alarmConfig.deviationSvTagCode = null;
    state.alarmConfig.deviationDraft = { ...state.alarmConfig.deviationDraft, asset_id: event.target.value, pv_tag_code: null, sv_tag_code: null };
    void requestAlarmTags(event.target.value);
    renderPage({ preserveScroll: true });
  });
  document.querySelector("[data-deviation-pv-tag]")?.addEventListener("change", (event) => {
    state.alarmConfig.deviationPvTagCode = event.target.value;
    state.alarmConfig.deviationDraft = { ...state.alarmConfig.deviationDraft, pv_tag_code: event.target.value };
  });
  document.querySelector("[data-deviation-sv-tag]")?.addEventListener("change", (event) => {
    state.alarmConfig.deviationSvTagCode = event.target.value;
    state.alarmConfig.deviationDraft = { ...state.alarmConfig.deviationDraft, sv_tag_code: event.target.value };
  });
  document.querySelector("[data-deviation-rule-cancel]")?.addEventListener("click", () => {
    state.alarmConfig.editingDeviationRuleId = null;
    state.alarmConfig.deviationDraft = {};
    renderPage({ preserveScroll: true });
  });
  document.querySelectorAll("[data-deviation-rule-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const rule = alarmConfiguration.deviationRules.find((item) => item.rule_id === button.dataset.deviationRuleEdit);
      if (!rule) return;
      state.alarmConfig.editingDeviationRuleId = rule.rule_id;
      state.alarmConfig.deviationAssetId = rule.asset_id;
      state.alarmConfig.deviationPvTagCode = rule.pv_tag_code;
      state.alarmConfig.deviationSvTagCode = rule.sv_tag_code;
      state.alarmConfig.deviationDraft = {
        ...rule,
        expected_reach_time_seconds: rule.expected_reach_time_seconds ?? "",
      };
      void requestAlarmTags(rule.asset_id);
      renderPage({ preserveScroll: true });
      document.getElementById("process-deviation-configuration")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  document.querySelectorAll("[data-deviation-rule-toggle]").forEach((button) => {
    button.addEventListener("click", () => void toggleDeviationRule(button.dataset.deviationRuleToggle, button.dataset.ruleEnabled !== "true"));
  });
  document.querySelectorAll("[data-alarm-event-ack]").forEach((button) => {
    button.addEventListener("click", () => void acknowledgeActualAlarm(button.dataset.alarmEventAck));
  });
  if (alarmSearch) alarmSearch.addEventListener("input", filterAlarms);
  if (alarmSeverity) alarmSeverity.addEventListener("change", filterAlarms);
  if (alarmArea) alarmArea.addEventListener("change", (event) => {
    state.alarms.area = event.target.value;
    renderPage({ preserveScroll: true });
  });
  document.querySelectorAll("[data-alarm-downtime-area]").forEach((button) => {
    button.addEventListener("click", () => {
      state.alarms.area = button.dataset.alarmDowntimeArea;
      renderPage({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-alarm-machine]").forEach((row) => {
    const openMachine = () => {
      const [type, machineId] = row.dataset.alarmMachine.split("|");
      openMachineDetail(type, machineId);
    };
    row.addEventListener("click", openMachine);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openMachine(); }
    });
  });
  const fleetSearch = document.getElementById("fleet-search");
  const fleetState = document.getElementById("fleet-state-filter");
  if (fleetSearch) fleetSearch.addEventListener("input", filterFleetMachines);
  if (state.page === "roles") bindRolePermissionPageEvents();
  if (state.page === "users") bindUserManagementPageEvents();
}

function isPageAllowed(page) {
  if (!authentication.user) return true;
  const role = String(authentication.user.role || "").toUpperCase();
  if (role === "ADMIN" || role === "ADMINISTRATOR") return true;
  if (page === "roles" || page === "users") return false;
  if (page === "asset_status" || page === "asset_matrix" || page === "command_center") return true;
  const allowed = Array.isArray(authentication.user.allowedMenus) ? authentication.user.allowedMenus : [];
  return allowed.includes(page);
}

function navigate(page, { replaceState = false } = {}) {
  const targetPage = navigationPages.has(page) ? page : "overview";
  state.page = targetPage;
  const targetHash = `#/${targetPage}`;
  if (window.location.hash !== targetHash) {
    if (replaceState) {
      window.history.replaceState(null, "", targetHash);
    } else {
      window.history.pushState(null, "", targetHash);
    }
  }
  if (state.drill[targetPage]) state.drill[targetPage] = { area: null, machine: null };
  renderPage();
  if (targetPage === "solar") void loadSolarFueling();
  if (targetPage === "roles") void loadRbacData();
  if (targetPage === "wwtp") void loadWwtpData();
  if (targetPage === "users") {
    void loadRbacUsers();
    void loadRbacData();
  }
  if (isMobileScreen()) closeSidebar();
}
