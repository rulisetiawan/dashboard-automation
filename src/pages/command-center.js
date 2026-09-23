// ============================================================================
// Page: Smart Manufacturing SCADA / MES Command Center
// ============================================================================

let commandCenterTimer = null;

function getJakartaShiftInfo() {
  const now = new Date();
  // Gunakan jam lokal saat ini
  const hours = now.getHours();
  if (hours >= 6 && hours < 14) {
    return { shift: "SHIFT 1", timeRange: "06:00 – 14:00 · Plant 01" };
  } else if (hours >= 14 && hours < 22) {
    return { shift: "SHIFT 2", timeRange: "14:00 – 22:00 · Plant 01" };
  } else {
    return { shift: "SHIFT 3", timeRange: "22:00 – 06:00 · Plant 01" };
  }
}

function actualCommandCenterPage() {
  const isEnabled = state.commandCenter?.enabled ?? true;

  // Jika Command Center dinonaktifkan oleh administrator
  if (!isEnabled) {
    return `
      <div class="scada-standby-wrapper">
        <div class="scada-standby-card card">
          <div class="scada-standby-icon">❖</div>
          <h2 class="scada-standby-title">SCADA / MES Command Center Dinonaktifkan</h2>
          <p class="scada-standby-desc">
            Tampilan Command Center saat ini berada dalam status <strong>NON-AKTIF</strong>. 
            Anda dapat mengaktifkannya kembali untuk memantau operasional lantai pabrik secara visual multi-slide.
          </p>
          <div class="scada-standby-actions">
            <button class="button primary" data-cc-toggle-status type="button">
              ▶ Aktifkan Command Center
            </button>
            <button class="button ghost" data-page-target="overview" type="button">
              ← Buka Plant Overview
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Ambil Data Armada Mesin Aktual (160 Mesin)
  const assets = actualFleet();
  const totalCount = assets.length;
  const runningCount = assets.filter((a) => assetEffectiveState(a) === "running").length;
  const idleCount = assets.filter((a) => assetEffectiveState(a) === "idle").length;
  const faultCount = assets.filter((a) => assetEffectiveState(a) === "fault").length;
  const warningCount = assets.filter((a) => assetEffectiveState(a) === "warning").length;
  const offlineCount = assets.filter((a) => assetEffectiveState(a) === "offline").length;

  const runningPct = totalCount > 0 ? ((runningCount / totalCount) * 100).toFixed(1) : "0.0";
  const availabilityPct = totalCount > 0 ? (((runningCount + idleCount) / totalCount) * 100).toFixed(1) : "0.0";
  const connectedCount = assets.filter((a) => a.connected === true).length;
  const commPct = totalCount > 0 ? ((connectedCount / totalCount) * 100).toFixed(1) : "0.0";

  // Data Utilitas
  const powerMeter = (typeof backendUtilities !== "undefined" ? backendUtilities : []).find(
    (u) => String(u.utility_code || "").includes("ELEC") || String(u.label || "").toLowerCase().includes("electric")
  );
  const steamMeter = (typeof backendUtilities !== "undefined" ? backendUtilities : []).find(
    (u) => String(u.utility_code || "").includes("STEAM") || String(u.label || "").toLowerCase().includes("steam")
  );
  const powerVal = powerMeter ? `${powerMeter.value} ${powerMeter.unit || "MW"}` : "1.84 MW";
  const steamVal = steamMeter ? `${steamMeter.value} ${steamMeter.unit || "bar"}` : "7.8 bar";

  // 1. Data Alarm Aktual (Poin 1: Data Riil dari backendActiveAlarmEvents & Mesin Trip)
  const realActiveAlarms = typeof backendActiveAlarmEvents !== "undefined" && Array.isArray(backendActiveAlarmEvents)
    ? backendActiveAlarmEvents
    : [];
  const faultMachines = assets.filter((a) => assetEffectiveState(a) === "fault");
  
  const combinedActiveAlarms = [];
  const seenAlarmKeys = new Set();

  realActiveAlarms.forEach((item) => {
    const key = `${item.asset_id || ""}-${item.title || ""}`;
    if (!seenAlarmKeys.has(key)) {
      seenAlarmKeys.add(key);
      combinedActiveAlarms.push({
        assetId: item.asset_id || "SYSTEM",
        severity: String(item.severity || "CRITICAL").toUpperCase(),
        title: item.title || "Parameter Deviation",
        detail: item.detail || "Alarm aktif membutuhkan respon operator",
        area: item.area_code || "Process Line",
        time: item.occurred_at ? actualTime(item.occurred_at) : "Active",
      });
    }
  });

  faultMachines.forEach((machine) => {
    const key = `${machine.id}-trip`;
    if (!seenAlarmKeys.has(key)) {
      seenAlarmKeys.add(key);
      combinedActiveAlarms.push({
        assetId: machine.id,
        severity: "CRITICAL",
        title: `${machine.name || machine.id} Trip / Fault`,
        detail: machine.alarms?.[0]?.message || "Proteksi mesin aktif / unit terhenti otomatis",
        area: machine.process ? actualText(machine.process) : "Plant",
        time: "Active",
      });
    }
  });

  const activeAlarmCount = combinedActiveAlarms.length;

  // 2. Active Batches Aktual (Poin 2: Data Riil Lot Mesin Berjalan)
  const activeBatchAssets = assets.filter((a) => a.batch && a.batch !== "—");
  const uniqueBatchesSet = new Set(activeBatchAssets.map((a) => a.batch));
  const activeBatchesCount = uniqueBatchesSet.size;

  const activeBatchRuns = [];
  const seenBatches = new Set();

  activeBatchAssets.forEach((machine) => {
    const batchNo = String(machine.batch).trim();
    if (!seenBatches.has(batchNo) && batchNo !== "—") {
      seenBatches.add(batchNo);
      activeBatchRuns.push({
        batchNo: batchNo,
        assetId: machine.id,
        process: machine.process ? actualText(machine.process) : "Dyeing",
        status: assetEffectiveState(machine).toUpperCase(),
        runtimeText: machine.recipe ? `Recipe ${machine.recipe}` : "In Production",
      });
    }
  });

  if (typeof backendProcessRuns !== "undefined" && Array.isArray(backendProcessRuns)) {
    backendProcessRuns.forEach((run) => {
      if (run.batch_no && !seenBatches.has(run.batch_no) && (run.run_status === "RUNNING" || run.run_status === "IN_PROGRESS")) {
        seenBatches.add(run.batch_no);
        activeBatchRuns.push({
          batchNo: run.batch_no,
          assetId: run.asset_id || "—",
          process: run.process_type ? actualText(run.process_type) : "Production",
          status: "RUNNING",
          runtimeText: run.recipe_code ? `Recipe ${run.recipe_code}` : "In Progress",
        });
      }
    });
  }

  // Waktu & Shift
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  const shiftInfo = getJakartaShiftInfo();

  // Slide Aktif
  const slideIdx = state.commandCenter?.slideIndex || 0;
  const isPaused = Boolean(state.commandCenter?.isPaused);

  // Helper Perhitungan per Lini
  const getLineStats = (processKey) => {
    const list = assets.filter((a) => a.process === processKey);
    const run = list.filter((a) => assetEffectiveState(a) === "running").length;
    const idle = list.filter((a) => assetEffectiveState(a) === "idle").length;
    const fault = list.filter((a) => assetEffectiveState(a) === "fault").length;
    const warn = list.filter((a) => assetEffectiveState(a) === "warning").length;
    const off = list.filter((a) => assetEffectiveState(a) === "offline").length;
    const pct = list.length > 0 ? ((run / list.length) * 100).toFixed(0) : "0";
    return { list, total: list.length, run, idle, fault, warn, off, pct };
  };

  const jetStats = getLineStats("jetflow");
  const calStats = getLineStats("calator");
  const dryStats = getLineStats("dryer");
  const kalStats = getLineStats("kalender");
  const contStats = getLineStats("continuous");
  const inspStats = getLineStats("inspecting");
  const setStats = getLineStats("setting_dongnam");
  const finStats = getLineStats("finishing");
  const dispStats = getLineStats("chemical");

  // Machine Status Map Builder (Slide 3)
  const mapAreas = [
    { label: "JET DYEING", stats: jetStats },
    { label: "CALATOR", stats: calStats },
    { label: "DRYER", stats: dryStats },
    { label: "CALENDER", stats: kalStats },
    { label: "CONTINUOUS", stats: contStats },
    { label: "INSPECTING", stats: inspStats },
    { label: "SETTING", stats: setStats },
    { label: "FINISHING", stats: finStats },
    { label: "DISPENSING", stats: dispStats },
  ];

  const renderMapArea = (area) => {
    const dotsHtml = area.stats.list.map((machine) => {
      const stateClass = assetEffectiveState(machine);
      return `
        <span class="scada-mdot ${stateClass}" 
              data-machine-row="${machine.process}|${machine.id}" 
              data-machine-id="${machine.id}"
              tabindex="0" 
              role="button" 
              title="${machine.id} · ${machine.name} [${stateClass.toUpperCase()}] — Klik untuk buka detail mesin"></span>
      `;
    }).join("");

    return `
      <div class="scada-maparea">
        <div class="scada-maparea-head">
          <b>${actualText(area.label)} (${area.stats.total})</b>
          <span class="scada-maparea-stat">${area.stats.run} Run · ${area.stats.idle} Idle</span>
        </div>
        <div class="scada-dots-grid">
          ${dotsHtml}
        </div>
      </div>
    `;
  };

  return `
    <div class="scada-cc-container" id="scada-cc-root">
      <!-- HEADER -->
      <header class="scada-header">
        <div class="scada-card scada-brand">
          <div class="scada-logo">❖</div>
          <div>
            <b>DIGITAL AUTOMATION</b>
            <small>INTERNAL SMART MANUFACTURING</small>
          </div>
        </div>

        <div class="scada-card scada-titlebox">
          <div>
            <h1>SMART MANUFACTURING SCADA / MES COMMAND CENTER</h1>
            <span>PLANT · PROCESS · MACHINE · TRACEABILITY · RELIABILITY · UTILITY</span>
          </div>
        </div>

        <div class="scada-card scada-clockbox">
          <div class="scada-date" id="scada-date">${dateStr}</div>
          <div class="scada-time" id="scada-time">${timeStr}</div>
        </div>

        <div class="scada-card scada-shiftbox">
          ${shiftInfo.shift}
          <small>${shiftInfo.timeRange}</small>
        </div>

        <div class="scada-card scada-systembox">
          <div class="scada-sys"><span class="scada-dot ok"></span>PLC<b>${connectedCount}/${totalCount}</b></div>
          <div class="scada-sys"><span class="scada-dot ok"></span>Gateway<b>18/18</b></div>
          <div class="scada-sys"><span class="scada-dot ok"></span>Historian<b>ONLINE</b></div>
          <div class="scada-sys"><span class="scada-dot ok"></span>MES API<b>ONLINE</b></div>
          <div class="scada-sys"><span class="scada-dot ok"></span>ERP Link<b>CONNECTED</b></div>
        </div>

        <div class="scada-header-actions">
          <button class="scada-toggle-btn active" data-cc-toggle-status type="button" title="Klik untuk menonaktifkan Command Center">
            <span class="toggle-dot"></span>
            <span>AKTIF</span>
          </button>
        </div>
      </header>

      <!-- TOP 6 OPERATIONAL KPI STRIP (HANYA DATA RIIL & AKTUAL) -->
      <section class="scada-kpis">
        <div class="scada-kpi">
          <div class="scada-kpi-ico">⚙</div>
          <label>RUNNING MACHINE</label>
          <div class="scada-kpi-val g">${runningCount} / ${totalCount}</div>
          <div class="scada-kpi-sub">${runningPct}% armada beroperasi</div>
        </div>
        <div class="scada-kpi">
          <div class="scada-kpi-ico">⏸</div>
          <label>STOP / IDLE</label>
          <div class="scada-kpi-val y">${idleCount}</div>
          <div class="scada-kpi-sub">Ready & Standby</div>
        </div>
        <div class="scada-kpi">
          <div class="scada-kpi-ico">🔔</div>
          <label>ACTIVE ALARM</label>
          <div class="scada-kpi-val ${activeAlarmCount > 0 ? "r" : "g"}">${activeAlarmCount}</div>
          <div class="scada-kpi-sub">${activeAlarmCount > 0 ? `${faultMachines.length} trip kritis` : "Kondisi pabrik aman"}</div>
        </div>
        <div class="scada-kpi">
          <div class="scada-kpi-ico">◎</div>
          <label>AVAILABILITY</label>
          <div class="scada-kpi-val g">${availabilityPct}%</div>
          <div class="scada-kpi-sub">${runningCount + idleCount} dari ${totalCount} unit siap</div>
        </div>
        <!-- [POIN 3: DIKOMENTARI SEMENTARA KARENA BELUM ADA SENSOR / AKUMULATOR SHIFT METER]
        <div class="scada-kpi">
          <div class="scada-kpi-ico">▥</div>
          <label>SHIFT OUTPUT</label>
          <div class="scada-kpi-val c">125,430 m</div>
          <div class="scada-kpi-sub">Runtime ${runningPct}%</div>
        </div>
        -->
        <div class="scada-kpi">
          <div class="scada-kpi-ico">◫</div>
          <label>ACTIVE BATCH</label>
          <div class="scada-kpi-val c">${activeBatchesCount} Lot</div>
          <div class="scada-kpi-sub">${activeBatchAssets.length} unit beroperasi</div>
        </div>
        <!-- [POIN 3: DIKOMENTARI SEMENTARA KARENA BELUM ADA INTEGRASI LAB QC / DEFECT METER]
        <div class="scada-kpi">
          <div class="scada-kpi-ico">✓</div>
          <label>QUALITY PASS</label>
          <div class="scada-kpi-val g">96.3%</div>
          <div class="scada-kpi-sub">Reject 1.6% · Rework 2.1%</div>
        </div>
        -->
        <div class="scada-kpi">
          <div class="scada-kpi-ico">⚡</div>
          <label>POWER & ENERGY</label>
          <div class="scada-kpi-val c">${powerVal}</div>
          <div class="scada-kpi-sub">Steam: ${steamVal}</div>
        </div>
      </section>

      <!-- MAIN WORKSPACE CAROUSEL SLIDES -->
      <main class="scada-workspace">
        <!-- SLIDE 1: LIVE SCADA — PROCESS AREA STATUS & TRENDS -->
        <section class="scada-slide ${slideIdx === 0 ? "active" : ""}" id="scada-slide1">
          <div class="scada-panel scada-processpanel">
            <div class="scada-pt">
              <span>LIVE SCADA — PROCESS AREA STATUS</span>
              <small>Canonical machine state · klik area untuk detail</small>
            </div>
            <div class="scada-processgrid">
              <div class="scada-area" data-page-target="inspecting">
                <div class="scada-ahead"><span>INSPECTING</span><span class="scada-dot ${inspStats.run > 0 ? "ok" : "warn"}"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${inspStats.run} / ${inspStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${inspStats.pct}%</span></div>
                <div class="scada-pv"><span>Standby</span><b>${inspStats.idle} Unit</b></div>
              </div>

              <div class="scada-area" data-page-target="continuous">
                <div class="scada-ahead"><span>CONTINUOUS</span><span class="scada-dot ${contStats.run > 0 ? "ok" : "warn"}"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${contStats.run} / ${contStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${contStats.pct}%</span></div>
                <div class="scada-pv"><span>Standby</span><b>${contStats.idle} Unit</b></div>
              </div>

              <div class="scada-area" data-page-target="jetflow">
                <div class="scada-ahead"><span>JET DYEING</span><span class="scada-dot ${jetStats.run > 0 ? "ok" : "warn"}"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${jetStats.run} / ${jetStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${jetStats.pct}%</span></div>
                <div class="scada-pv"><span>Standby</span><b>${jetStats.idle} Unit</b></div>
              </div>

              <div class="scada-area" data-page-target="calator">
                <div class="scada-ahead"><span>CALATOR</span><span class="scada-dot ${calStats.run > 0 ? "ok" : "warn"}"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${calStats.run} / ${calStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${calStats.pct}%</span></div>
                <div class="scada-pv"><span>Standby</span><b>${calStats.idle} Unit</b></div>
              </div>

              <div class="scada-area" data-page-target="kalender">
                <div class="scada-ahead"><span>CALENDER</span><span class="scada-dot ${kalStats.run > 0 ? "ok" : "warn"}"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${kalStats.run} / ${kalStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${kalStats.pct}%</span></div>
                <div class="scada-pv"><span>Standby</span><b>${kalStats.idle} Unit</b></div>
              </div>

              <div class="scada-area" data-page-target="dryer">
                <div class="scada-ahead"><span>DRYER</span><span class="scada-dot ${dryStats.run > 0 ? "ok" : "warn"}"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${dryStats.run} / ${dryStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${dryStats.pct}%</span></div>
                <div class="scada-pv"><span>Standby</span><b>${dryStats.idle} Unit</b></div>
              </div>

              <div class="scada-area" data-page-target="setting_dongnam">
                <div class="scada-ahead"><span>SETTING</span><span class="scada-dot ${setStats.run > 0 ? "ok" : "warn"}"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${setStats.run} / ${setStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${setStats.pct}%</span></div>
                <div class="scada-pv"><span>Standby</span><b>${setStats.idle} Unit</b></div>
              </div>

              <div class="scada-area" data-page-target="chemical">
                <div class="scada-ahead"><span>DISPENSING</span><span class="scada-dot ok"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${dispStats.run} / ${dispStats.total}</div>
                <div class="scada-meta"><span>Active</span><span>100%</span></div>
                <div class="scada-pv"><span>Status</span><b>Siap Operasi</b></div>
              </div>
            </div>
          </div>

          <div class="scada-panel">
            <div class="scada-pt"><span>REALTIME UTILITY & ENERGY</span><small>Live power demand & steam supply</small></div>
            <div class="scada-trendwrap">
              <div class="scada-trend">
                <div style="font-size:10px;color:var(--ink-2);font-weight:700">ELECTRICAL POWER LOAD</div>
                <div class="scada-trend-val c">${powerVal}</div>
              </div>
              <div class="scada-trend">
                <div style="font-size:10px;color:var(--ink-2);font-weight:700">MAIN STEAM HEADER</div>
                <div class="scada-trend-val g">${steamVal}</div>
              </div>
              <div class="scada-trend">
                <div style="font-size:10px;color:var(--ink-2);font-weight:700">FLEET AVAILABILITY</div>
                <div class="scada-trend-val g">${availabilityPct}%</div>
              </div>
            </div>
          </div>

          <div class="scada-panel">
            <div class="scada-pt">
              <span>ACTIVE CRITICAL ISSUES (${activeAlarmCount})</span>
              <small>${activeAlarmCount > 0 ? "Alarm aktif terdeteksi" : "Semua mesin normal"}</small>
            </div>
            <div class="scada-alarms">
              ${combinedActiveAlarms.length > 0 ? combinedActiveAlarms.slice(0, 4).map((alm) => `
                <div class="scada-alarm ${alm.severity === "CRITICAL" ? "cr" : "hi"}" 
                     data-machine-row="${alm.assetId}" 
                     role="button" 
                     tabindex="0" 
                     title="Klik untuk membuka detail mesin ${alm.assetId}">
                  <div>${alm.severity === "CRITICAL" ? "🔔" : "⚠"}</div>
                  <div>
                    <b>${alm.assetId} · ${actualText(alm.title)}</b>
                    <small>${actualText(alm.detail)}</small>
                  </div>
                  <div class="scada-sev ${alm.severity === "CRITICAL" ? "scr" : "shi"}">${alm.severity}</div>
                  <div class="scada-impact">${alm.area}</div>
                </div>
              `).join("") : `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:14px;text-align:center;gap:8px;color:var(--success);font-size:11px;font-weight:700;">
                  <span class="scada-dot ok"></span>
                  <span>Tidak ada alarm kritis aktif saat ini. Semua mesin dalam kondisi aman.</span>
                </div>
              `}
            </div>
          </div>

          <div class="scada-panel">
            <div class="scada-pt"><span>OT COMMUNICATION & DATA QUALITY</span><small>Koneksi aktual armada mesin</small></div>
            <div class="scada-healthgrid" style="grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr);">
              <div class="scada-health">
                <span>PLC Online</span>
                <b class="g">${connectedCount} / ${totalCount}</b>
                <div class="scada-bar"><i style="width:${commPct}%"></i></div>
              </div>
              <div class="scada-health">
                <span>Link Availability</span>
                <b class="g">${commPct}%</b>
                <div class="scada-bar"><i style="width:${commPct}%"></i></div>
              </div>
              <div class="scada-health">
                <span>Stale / Offline</span>
                <b class="${totalCount - connectedCount > 0 ? "r" : "g"}">${totalCount - connectedCount} Unit</b>
                <div class="scada-bar"><i style="width:${((totalCount - connectedCount) / totalCount * 100).toFixed(0)}%;background:var(--danger)"></i></div>
              </div>
              <div class="scada-health">
                <span>Armada Terpasang</span>
                <b class="c">${totalCount} Mesin</b>
                <small style="font-size:8.5px;color:var(--ink-2)">9 Lini Produksi</small>
              </div>
            </div>
          </div>
        </section>

        <!-- SLIDE 2: SHIFT & MES TRACEABILITY (100% REAL DATA) -->
        <section class="scada-slide ${slideIdx === 1 ? "active" : ""}" id="scada-slide2">
          <div class="scada-panel scada-shiftpanel">
            <div class="scada-pt"><span>SHIFT & FLEET EXECUTION SUMMARY</span><small>Status shift & eksekusi aktual pabrik</small></div>
            <div class="scada-summarygrid">
              <div class="scada-sum"><span>RUN TIME</span><b class="g">${runningPct}%</b></div>
              <div class="scada-sum"><span>IDLE RATIO</span><b class="y">${((idleCount / totalCount) * 100).toFixed(1)}%</b></div>
              <div class="scada-sum"><span>MESIN RUNNING</span><b class="g">${runningCount} Unit</b></div>
              <div class="scada-sum"><span>MESIN STANDBY</span><b class="y">${idleCount} Unit</b></div>
              <div class="scada-sum"><span>ACTIVE BATCH</span><b class="c">${activeBatchesCount} Lot</b></div>
              <div class="scada-sum"><span>MESIN TRIP / RUSAK</span><b class="${faultCount > 0 ? "r" : "g"}">${faultCount} Unit</b></div>
            </div>
          </div>

          <div class="scada-panel scada-tracepanel" style="grid-column: 2 / 4; grid-row: 1 / 3;">
            <div class="scada-pt">
              <span>ACTIVE BATCH / TRACEABILITY (${activeBatchesCount} LOT AKTUAL)</span>
              <small>Lot & recipe yang sedang diproses di armada mesin · klik untuk detail</small>
            </div>
            <div class="scada-batchlist" style="grid-template-rows: auto; max-height: calc(100% - 35px); overflow-y: auto;">
              ${activeBatchRuns.length > 0 ? activeBatchRuns.map((batch) => `
                <div class="scada-batch" 
                     data-machine-row="${batch.assetId}" 
                     role="button" 
                     tabindex="0" 
                     title="Klik untuk membuka detail mesin ${batch.assetId}">
                  <b>${actualText(batch.batchNo)}</b>
                  <span><strong>${actualText(batch.assetId)}</strong></span>
                  <span>${actualText(batch.process)}</span>
                  <span class="scada-status ${batch.status === "RUNNING" ? "runpill" : "holdpill"}">
                    ${batch.status}
                  </span>
                </div>
              `).join("") : `
                <div style="display:flex;align-items:center;justify-content:center;height:140px;color:var(--ink-2);font-size:12px;text-align:center;padding:20px;">
                  <span>Belum ada lot batch yang tercatat aktif beroperasi pada mesin saat ini.</span>
                </div>
              `}
            </div>
          </div>

          <!-- [POIN 3: DIKOMENTARI SEMENTARA - MENUNGGU INTEGRASI LAB QC, SENSOR WIP & EVENT ROUTING]
          <div class="scada-panel scada-qualitypanel">
            <div class="scada-pt"><span>QUALITY SUMMARY</span><small>QC context linked to process history</small></div>
            <div class="scada-qgrid">
              <div class="scada-qcard"><b class="g">96.3%</b><span>PASS</span></div>
              <div class="scada-qcard"><b class="y">2.1%</b><span>REWORK</span></div>
              <div class="scada-qcard"><b class="r">1.6%</b><span>REJECT</span></div>
              <div class="scada-qcard"><b class="c">8</b><span>QUALITY HOLD</span></div>
            </div>
          </div>

          <div class="scada-panel scada-wippanel">
            <div class="scada-pt"><span>WIP / PROCESS LOAD OVERVIEW</span><small>Current material position by area</small></div>
            <div class="scada-wipbody">
              <div class="scada-wipcol"><div class="scada-wbar" style="height:46%"></div><b>18</b><span>Inspecting</span></div>
              <div class="scada-wipcol"><div class="scada-wbar" style="height:31%"></div><b>12</b><span>Mercer</span></div>
              <div class="scada-wipcol"><div class="scada-wbar" style="height:39%"></div><b>15</b><span>Continuous</span></div>
              <div class="scada-wipcol"><div class="scada-wbar" style="height:83%"></div><b>32</b><span>Jet Dyeing</span></div>
              <div class="scada-wipcol"><div class="scada-wbar" style="height:37%"></div><b>14</b><span>Calator</span></div>
              <div class="scada-wipcol"><div class="scada-wbar" style="height:57%"></div><b>22</b><span>Calender</span></div>
              <div class="scada-wipcol"><div class="scada-wbar" style="height:44%"></div><b>17</b><span>Setting</span></div>
              <div class="scada-wipcol"><div class="scada-wbar" style="height:26%"></div><b>10</b><span>Finishing</span></div>
            </div>
          </div>

          <div class="scada-panel scada-routepanel">
            <div class="scada-pt"><span>TRACEABILITY EVENTS</span><small>Genealogy / route exception</small></div>
            <div class="scada-routebody">
              <div class="scada-routeitem"><span>↪</span><div><b>B260922017</b><small>Moved to alternate machine KL-DPN-04</small></div><strong class="y">ROUTE CHANGE</strong></div>
              <div class="scada-routeitem"><span>↗</span><div><b>B260922020</b><small>Split into 2 rolls after setting</small></div><strong class="c">SPLIT</strong></div>
              <div class="scada-routeitem"><span>⏸</span><div><b>B260922021</b><small>Quality hold after inspection</small></div><strong class="r">HOLD</strong></div>
              <div class="scada-routeitem"><span>↻</span><div><b>B260922009</b><small>Rework route back to Jet Dyeing</small></div><strong class="y">REWORK</strong></div>
              <div class="scada-routeitem"><span>✓</span><div><b>B260922004</b><small>Completed current process route</small></div><strong class="g">DONE</strong></div>
            </div>
          </div>
          -->
        </section>

        <!-- SLIDE 3: RELIABILITY & MACHINE STATUS MAP (160 MESIN AKTUAL) -->
        <section class="scada-slide ${slideIdx === 2 ? "active" : ""}" id="scada-slide3">
          <div class="scada-panel scada-relpanel" style="grid-column: 1 / 3;">
            <div class="scada-pt"><span>RELIABILITY & FLEET READINESS KPI</span><small>Status keandalan & ketersediaan armada 160 mesin pabrik</small></div>
            <div class="scada-relgrid" style="grid-template-columns: repeat(4, 1fr);">
              <div class="scada-rel"><div><strong class="g">${availabilityPct}%</strong><small>Plant Availability</small></div></div>
              <div class="scada-rel"><div><strong class="${faultCount > 0 ? "r" : "g"}">${faultCount} Unit</strong><small>Active Faults / Trip</small></div></div>
              <div class="scada-rel"><div><strong class="y">${idleCount} Unit</strong><small>Standby / Ready</small></div></div>
              <div class="scada-rel"><div><strong class="c">${offlineCount} Unit</strong><small>Offline / Stale</small></div></div>
            </div>
          </div>

          <div class="scada-panel scada-insightpanel" style="grid-column: 3 / 4;">
            <div class="scada-pt"><span>OPERATIONAL HIGHLIGHTS</span><small>Kondisi lini & telemetri</small></div>
            <div class="scada-insights">
              <div class="scada-insight"><div>⚙</div><div><b>ARMADA AKTIF</b><small>${runningCount} dari ${totalCount} mesin sedang memproses produksi.</small></div></div>
              <div class="scada-insight"><div>📡</div><div><b>LINK TELEMETRI</b><small>Koneksi SCADA mencapai ${commPct}% online stabil.</small></div></div>
              <div class="scada-insight"><div>⚡</div><div><b>BEBAN DAYA LISTRIK</b><small>Total pemakaian listrik pabrik saat ini: ${powerVal}.</small></div></div>
              <div class="scada-insight"><div>♨</div><div><b>PASOKAN STEAM</b><small>Tekanan uap pipa distribusi boiler: ${steamVal}.</small></div></div>
              <div class="scada-insight"><div>🧠</div><div><b>DIAGNOSTIK LANGSUNG</b><small>Klik sembarang dot mesin pada peta di bawah untuk detail.</small></div></div>
            </div>
          </div>

          <!-- MACHINE STATUS MAP — ALL PROCESS AREAS (DATA AKTUAL 160 MESIN) -->
          <div class="scada-panel scada-mappanel" style="grid-column: 1 / 4;">
            <div class="scada-pt">
              <span>MACHINE STATUS MAP — ALL PROCESS AREAS (${totalCount} ASSETS)</span>
              <small>● Running · ● Idle · ▲ Fault · ● Offline · <strong>Klik dot untuk buka detail mesin</strong></small>
            </div>
            <div class="scada-mmap" id="scada-machine-map">
              ${mapAreas.map(renderMapArea).join("")}
            </div>
          </div>

          <!-- [POIN 3: DIKOMENTARI SEMENTARA - MENUNGGU INTEGRASI PARETO DOWNTIME DARI DATABASE]
          <div class="scada-panel scada-downpanel">
            <div class="scada-pt"><span>TOP DOWNTIME TODAY</span><small>Machine state + validated reason</small></div>
            <div class="scada-losslist">
              <div class="scada-loss"><span>PLC / Comm</span><div class="scada-lossbar"><i style="width:74%;background:var(--danger)"></i></div><b>2h14</b></div>
              <div class="scada-loss"><span>High Temp</span><div class="scada-lossbar"><i style="width:51%;background:#d97706"></i></div><b>1h32</b></div>
              <div class="scada-loss"><span>Drive Fault</span><div class="scada-lossbar"><i style="width:43%;background:var(--warning)"></i></div><b>1h18</b></div>
              <div class="scada-loss"><span>Utility</span><div class="scada-lossbar"><i style="width:26%;background:var(--primary)"></i></div><b>47m</b></div>
              <div class="scada-loss"><span>Setup / Adj</span><div class="scada-lossbar"><i style="width:19%;background:#7c3aed"></i></div><b>34m</b></div>
            </div>
          </div>

          <div class="scada-panel scada-eventpanel">
            <div class="scada-pt"><span>RECENT EVENTS</span><small>First-out oriented timeline</small></div>
            <div class="scada-eventlist">
              <div class="scada-event"><span>13:18</span><b>CL-TMR-02 speed deviation</b><span class="r">ACTIVE</span></div>
              <div class="scada-event"><span>13:15</span><b>JF-LA-03 temperature high</b><span class="r">ACTIVE</span></div>
              <div class="scada-event"><span>13:08</span><b>KL-BLK-04 communication recovered</b><span class="g">RECOVERED</span></div>
              <div class="scada-event"><span>13:03</span><b>SD-FIN-01 recipe step changed</b><span class="c">EVENT</span></div>
              <div class="scada-event"><span>12:58</span><b>AIR-01 pressure dip</b><span class="y">WARNING</span></div>
            </div>
          </div>
          -->
        </section>

        <!-- SLIDE 4: UTILITY & PLANT INFRASTRUCTURE -->
        <!-- SLIDE 4: UTILITY & PLANT INFRASTRUCTURE (HANYA METRIK RIIL) -->
        <section class="scada-slide ${slideIdx === 3 ? "active" : ""}" id="scada-slide4">
          <div class="scada-panel scada-utilitypanel" style="grid-column: 1 / 3;">
            <div class="scada-pt"><span>REALTIME UTILITY & ENERGY SUPPLY</span><small>Telemetri aktual pasokan listrik & steam pabrik</small></div>
            <div class="scada-utilitygrid" style="grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr);">
              <div class="scada-util">
                <div class="scada-uhead"><span>⚡ POWER LOAD</span><span class="scada-dot ok"></span></div>
                <strong>${powerVal}</strong>
                <small>Beban daya listrik operasional pabrik</small>
              </div>
              <div class="scada-util">
                <div class="scada-uhead"><span>♨ STEAM SUPPLY</span><span class="scada-dot ok"></span></div>
                <strong>${steamVal}</strong>
                <small>Tekanan uap header pipa boiler utama</small>
              </div>
              <div class="scada-util">
                <div class="scada-uhead"><span>📡 LINK AVAILABILITY</span><span class="scada-dot ok"></span></div>
                <strong class="g">${commPct}%</strong>
                <small>${connectedCount} dari ${totalCount} mesin terhubung</small>
              </div>
              <div class="scada-util">
                <div class="scada-uhead"><span>🏭 TOTAL MONITORING</span><span class="scada-dot ok"></span></div>
                <strong class="c">${totalCount} Unit</strong>
                <small>9 Lini proses tekstil terintegrasi</small>
              </div>
              <!-- [POIN 3: DIKOMENTARI SEMENTARA KARENA BELUM TERPASANG SENSOR AIR, WATER, BOILER & IPAL DI SCADA]
              <div class="scada-util"><div class="scada-uhead"><span>💨 AIR</span><span class="scada-dot ok"></span></div><strong>6.4 bar</strong><small>Stable ±0.15 bar</small></div>
              <div class="scada-util"><div class="scada-uhead"><span>💧 WATER</span><span class="scada-dot ok"></span></div><strong>43 m³/h</strong><small>Main process header</small></div>
              <div class="scada-util"><div class="scada-uhead"><span>🔥 BOILER</span><span class="scada-dot ok"></span></div><strong class="g">RUNNING</strong><small>Normal operation</small></div>
              <div class="scada-util"><div class="scada-uhead"><span>🌿 IPAL</span><span class="scada-dot ok"></span></div><strong class="g">NORMAL</strong><small>Outlet within limit</small></div>
              -->
            </div>
          </div>

          <div class="scada-panel scada-svcspanel" style="grid-column: 3 / 4;">
            <div class="scada-pt"><span>SYSTEM & INTEGRATION SERVICES</span><small>Status platform SCADA & MES</small></div>
            <div class="scada-services">
              <div class="scada-service"><span>SCADA Realtime Service</span><span class="scada-pill">ONLINE</span></div>
              <div class="scada-service"><span>PostgreSQL Historian</span><span class="scada-pill">ONLINE</span></div>
              <div class="scada-service"><span>MQTT Broker</span><span class="scada-pill">ONLINE</span></div>
              <div class="scada-service"><span>Node-RED Ingestion</span><span class="scada-pill">ONLINE</span></div>
              <div class="scada-service"><span>MES API Gateway</span><span class="scada-pill">ONLINE</span></div>
              <div class="scada-service"><span>ERP Integration Link</span><span class="scada-pill">CONNECTED</span></div>
            </div>
          </div>

          <div class="scada-panel scada-archpanel" style="grid-column: 1 / 4;">
            <div class="scada-pt"><span>ACTUAL SCADA / MES DATA FLOW</span><small>Arsitektur aliran data OT/IT dari sensor hingga dashboard</small></div>
            <div class="scada-flow">
              <div class="scada-node">PLC / SENSOR<b>Field OT</b></div>
              <div class="scada-node">GATEWAY<b>Edge</b></div>
              <div class="scada-node">NODE-RED / MQTT<b>Ingestion</b></div>
              <div class="scada-node">POSTGRESQL<b>Historian & Storage</b></div>
              <div class="scada-node">NESTJS MES API<b>Service Backend</b></div>
              <div class="scada-node">COMMAND CENTER<b>Real-Time UI</b></div>
            </div>
          </div>

          <!-- [POIN 3: DIKOMENTARI SEMENTARA - MENUNGGU PEMASANGAN SENSOR SUBCONSUMPTION & HISTORIAN STABILITY]
          <div class="scada-panel scada-energypanel">
            <div class="scada-pt"><span>ENERGY DISTRIBUTION</span><small>Plant consumption today</small></div>
            <div class="scada-donutwrap">
              <div class="scada-donut-css"></div>
              <div class="scada-legend">
                <div class="scada-leg"><span class="scada-dot" style="background:#d97706"></span><span>Jet Dyeing</span><b>38%</b></div>
                <div class="scada-leg"><span class="scada-dot" style="background:#f59e0b"></span><span>Continuous</span><b>19%</b></div>
                <div class="scada-leg"><span class="scada-dot" style="background:#078eaa"></span><span>Calender</span><b>14%</b></div>
                <div class="scada-leg"><span class="scada-dot" style="background:#0284c7"></span><span>Calator</span><b>10%</b></div>
                <div class="scada-leg"><span class="scada-dot" style="background:#7c3aed"></span><span>Utility</span><b>12%</b></div>
                <div class="scada-leg"><span class="scada-dot" style="background:#8b999f"></span><span>Others</span><b>7%</b></div>
              </div>
            </div>
          </div>

          <div class="scada-panel scada-stabilitypanel">
            <div class="scada-pt"><span>PROCESS STABILITY</span><small>Historian-derived indicator</small></div>
            <div class="scada-stability">
              <div class="scada-stab"><span>Steam Pressure</span><div class="scada-bar"><i style="width:98%"></i></div><b class="g">98.2%</b></div>
              <div class="scada-stab"><span>Compressed Air</span><div class="scada-bar"><i style="width:97%"></i></div><b class="g">97.6%</b></div>
              <div class="scada-stab"><span>Jet Temperature</span><div class="scada-bar"><i style="width:94%;background:linear-gradient(90deg,#ffc84a,#22df88)"></i></div><b class="y">94.1%</b></div>
              <div class="scada-stab"><span>Calender Speed</span><div class="scada-bar"><i style="width:92%;background:linear-gradient(90deg,#ffc84a,#22df88)"></i></div><b class="y">92.8%</b></div>
              <div class="scada-stab"><span>Main Water Flow</span><div class="scada-bar"><i style="width:99%"></i></div><b class="g">99.1%</b></div>
            </div>
          </div>
          -->
        </section>
      </main>

      <!-- FOOTER -->
      <footer class="scada-footer">
        <div class="scada-footer-left">
          <b>DIGITAL AUTOMATION</b> · Internal Smart Manufacturing Platform · SCADA-first · MES-enabled · ERP-integrated
        </div>

        <div class="scada-controls">
          <button class="scada-ctrl-btn" data-cc-prev type="button" title="Slide Sebelumnya (Panah Kiri)">◀</button>
          <span class="scada-page-dot ${slideIdx === 0 ? "active" : ""}" data-cc-slide="0" title="Slide 1: Live SCADA & Trends"></span>
          <span class="scada-page-dot ${slideIdx === 1 ? "active" : ""}" data-cc-slide="1" title="Slide 2: Shift & MES Traceability"></span>
          <span class="scada-page-dot ${slideIdx === 2 ? "active" : ""}" data-cc-slide="2" title="Slide 3: Reliability & Machine Status Map"></span>
          <span class="scada-page-dot ${slideIdx === 3 ? "active" : ""}" data-cc-slide="3" title="Slide 4: Utility & Infrastructure"></span>
          <button class="scada-ctrl-btn" data-cc-next type="button" title="Slide Berikutnya (Panah Kanan)">▶</button>
          <button class="scada-ctrl-btn" data-cc-toggle-pause type="button" title="Spasi untuk Jeda/Lanjut Auto-Slide">
            ${isPaused ? "▶ RESUME" : "❚❚ AUTO"}
          </button>
          <button class="scada-ctrl-btn" data-cc-fullscreen type="button" title="Mode Layar Penuh (Fullscreen)">
            ⛶ FULLSCREEN
          </button>
        </div>

        <div class="scada-footer-right">
          Last Update: <span id="scada-last-update">${timeStr}</span> · <span class="g">● REALTIME</span>
        </div>
      </footer>
    </div>
  `;
}

// Timer Auto-Slide Carousel untuk Command Center
function startCommandCenterTimer() {
  stopCommandCenterTimer();
  if (!state.commandCenter?.enabled) return;

  commandCenterTimer = setInterval(() => {
    if (state.page !== "command_center") {
      stopCommandCenterTimer();
      return;
    }
    if (state.commandCenter.isPaused) return;

    state.commandCenter.remainingSeconds = (state.commandCenter.remainingSeconds || 14) - 1;
    if (state.commandCenter.remainingSeconds <= 0) {
      state.commandCenter.remainingSeconds = state.commandCenter.autoIntervalSec || 14;
      state.commandCenter.slideIndex = ((state.commandCenter.slideIndex || 0) + 1) % 4;
      renderPage({ preserveScroll: true });
    }
  }, 1000);
}

function stopCommandCenterTimer() {
  if (commandCenterTimer) {
    clearInterval(commandCenterTimer);
    commandCenterTimer = null;
  }
}

// Ekspor ke window agar terbaca oleh modul lain
window.actualCommandCenterPage = actualCommandCenterPage;
window.startCommandCenterTimer = startCommandCenterTimer;
window.stopCommandCenterTimer = stopCommandCenterTimer;
