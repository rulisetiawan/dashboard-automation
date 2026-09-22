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

  // Data Alarm Aktual
  const activeAlarmsList = typeof backendAlarms !== "undefined" && Array.isArray(backendAlarms) ? backendAlarms : [];
  const activeAlarmCount = faultCount + activeAlarmsList.length;

  // Active Batches
  const activeBatchAssets = assets.filter((a) => a.batch && a.batch !== "—");
  const activeBatchesCount = new Set(activeBatchAssets.map((a) => a.batch)).size || 14;

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

      <!-- TOP 8 KPI STRIP -->
      <section class="scada-kpis">
        <div class="scada-kpi">
          <div class="scada-kpi-ico">⚙</div>
          <label>RUNNING MACHINE</label>
          <div class="scada-kpi-val g">${runningCount} / ${totalCount}</div>
          <div class="scada-kpi-sub">${runningPct}% plant machine</div>
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
          <div class="scada-kpi-val ${faultCount > 0 ? "r" : "g"}">${activeAlarmCount}</div>
          <div class="scada-kpi-sub">${faultCount} critical fault · aman</div>
        </div>
        <div class="scada-kpi">
          <div class="scada-kpi-ico">◎</div>
          <label>AVAILABILITY</label>
          <div class="scada-kpi-val g">${availabilityPct}%</div>
          <div class="scada-kpi-sub">MTBF 52.3 h · MTTR 18.4 m</div>
        </div>
        <div class="scada-kpi">
          <div class="scada-kpi-ico">▥</div>
          <label>SHIFT OUTPUT</label>
          <div class="scada-kpi-val c">125,430 m</div>
          <div class="scada-kpi-sub">Runtime ${runningPct}%</div>
        </div>
        <div class="scada-kpi">
          <div class="scada-kpi-ico">◫</div>
          <label>ACTIVE BATCH</label>
          <div class="scada-kpi-val c">${activeBatchesCount} Lot</div>
          <div class="scada-kpi-sub">${activeBatchAssets.length} unit beroperasi</div>
        </div>
        <div class="scada-kpi">
          <div class="scada-kpi-ico">✓</div>
          <label>QUALITY PASS</label>
          <div class="scada-kpi-val g">96.3%</div>
          <div class="scada-kpi-sub">Reject 1.6% · Rework 2.1%</div>
        </div>
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
                <div class="scada-ahead"><span>INSPECTING</span><span class="scada-dot ok"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${inspStats.run} / ${inspStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${inspStats.pct}%</span></div>
                <div class="scada-pv"><span>Speed</span><b>62.4 m/min</b></div>
              </div>

              <div class="scada-area" data-page-target="continuous">
                <div class="scada-ahead"><span>CONTINUOUS</span><span class="scada-dot ok"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${contStats.run} / ${contStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${contStats.pct}%</span></div>
                <div class="scada-pv"><span>Padder</span><b>1.24 kN</b></div>
              </div>

              <div class="scada-area" data-page-target="jetflow">
                <div class="scada-ahead"><span>JET DYEING</span><span class="scada-dot ${jetStats.run > 0 ? "ok" : "warn"}"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${jetStats.run} / ${jetStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${jetStats.pct}%</span></div>
                <div class="scada-pv"><span>Avg Temp</span><b class="y">128.4 °C</b></div>
              </div>

              <div class="scada-area" data-page-target="calator">
                <div class="scada-ahead"><span>CALATOR</span><span class="scada-dot ok"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${calStats.run} / ${calStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${calStats.pct}%</span></div>
                <div class="scada-pv"><span>Squeeze</span><b>7.2 bar</b></div>
              </div>

              <div class="scada-area" data-page-target="kalender">
                <div class="scada-ahead"><span>CALENDER</span><span class="scada-dot ok"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${kalStats.run} / ${kalStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${kalStats.pct}%</span></div>
                <div class="scada-pv"><span>Line Speed</span><b>38.2 m/min</b></div>
              </div>

              <div class="scada-area" data-page-target="dryer">
                <div class="scada-ahead"><span>DRYER</span><span class="scada-dot ok"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${dryStats.run} / ${dryStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${dryStats.pct}%</span></div>
                <div class="scada-pv"><span>Chamber</span><b>142.0 °C</b></div>
              </div>

              <div class="scada-area" data-page-target="setting_dongnam">
                <div class="scada-ahead"><span>SETTING</span><span class="scada-dot ok"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${setStats.run} / ${setStats.total}</div>
                <div class="scada-meta"><span>Running</span><span>${setStats.pct}%</span></div>
                <div class="scada-pv"><span>Zone Temp</span><b>185.6 °C</b></div>
              </div>

              <div class="scada-area" data-page-target="chemical">
                <div class="scada-ahead"><span>DISPENSING</span><span class="scada-dot ok"></span></div>
                <div class="scada-machine-art"></div>
                <div class="scada-run">${dispStats.run} / ${dispStats.total}</div>
                <div class="scada-meta"><span>Active</span><span>100%</span></div>
                <div class="scada-pv"><span>Dispensed</span><b>4,280 L</b></div>
              </div>
            </div>
          </div>

          <div class="scada-panel">
            <div class="scada-pt"><span>REALTIME PROCESS TREND</span><small>Historian · last 6 hours</small></div>
            <div class="scada-trendwrap">
              <div class="scada-trend">
                <svg class="scada-chart-svg" viewBox="0 0 600 100" preserveAspectRatio="none">
                  <polyline fill="none" stroke="var(--primary)" stroke-width="2.8" points="0,75 50,70 100,68 150,60 200,56 250,52 300,48 350,45 400,43 450,41 500,43 550,40 600,42"/>
                  <line x1="0" y1="85" x2="600" y2="85" stroke="rgba(7,142,170,0.18)"/>
                </svg>
                <div class="scada-trend-val c">38.2<br><small>m/min</small></div>
              </div>
              <div class="scada-trend">
                <svg class="scada-chart-svg" viewBox="0 0 600 100" preserveAspectRatio="none">
                  <polyline fill="none" stroke="var(--danger)" stroke-width="2.8" points="0,72 50,68 100,64 150,60 200,56 250,54 300,52 350,49 400,48 450,46 500,45 550,42 600,41"/>
                  <line x1="0" y1="85" x2="600" y2="85" stroke="rgba(217,72,92,0.18)"/>
                </svg>
                <div class="scada-trend-val r">128.4<br><small>°C</small></div>
              </div>
              <div class="scada-trend">
                <svg class="scada-chart-svg" viewBox="0 0 600 100" preserveAspectRatio="none">
                  <polyline fill="none" stroke="var(--success)" stroke-width="2.8" points="0,60 60,59 120,57 180,55 240,56 300,54 360,55 420,52 480,53 540,51 600,51"/>
                  <line x1="0" y1="85" x2="600" y2="85" stroke="rgba(17,155,112,0.18)"/>
                </svg>
                <div class="scada-trend-val g">${powerVal}</div>
              </div>
            </div>
          </div>

          <div class="scada-panel">
            <div class="scada-pt"><span>ACTIVE CRITICAL ISSUES</span><small>Alarm lifecycle & process impact</small></div>
            <div class="scada-alarms">
              <div class="scada-alarm cr">
                <div>🔔</div>
                <div><b>CL-TMR-02</b><small>Upper Felt Speed Deviation</small></div>
                <div class="scada-sev scr">CRITICAL</div>
                <div class="scada-impact">Production</div>
              </div>
              <div class="scada-alarm hi">
                <div>🌡</div>
                <div><b>JF-LA-03</b><small>Temperature High Deviation</small></div>
                <div class="scada-sev shi">HIGH</div>
                <div class="scada-impact">Quality</div>
              </div>
              <div class="scada-alarm hi">
                <div>🔗</div>
                <div><b>KL-BLK-04</b><small>PLC Communication Timeout</small></div>
                <div class="scada-sev shi">HIGH</div>
                <div class="scada-impact">Data</div>
              </div>
              <div class="scada-alarm md">
                <div>💨</div>
                <div><b>AIR-01</b><small>Compressed Air Low Margin</small></div>
                <div class="scada-sev smd">MEDIUM</div>
                <div class="scada-impact">Utility</div>
              </div>
            </div>
          </div>

          <div class="scada-panel">
            <div class="scada-pt"><span>OT COMMUNICATION & DATA QUALITY</span><small>Heartbeat + tag quality</small></div>
            <div class="scada-healthgrid">
              <div class="scada-health"><span>PLC Online</span><b class="g">${connectedCount} / ${totalCount}</b><div class="scada-bar"><i style="width:${commPct}%"></i></div></div>
              <div class="scada-health"><span>Gateway Online</span><b class="g">18 / 18</b><div class="scada-bar"><i style="width:100%"></i></div></div>
              <div class="scada-health"><span>GOOD Tags</span><b class="g">2,742</b><div class="scada-bar"><i style="width:97.9%"></i></div></div>
              <div class="scada-health"><span>STALE / BAD</span><b class="r">${totalCount - connectedCount}</b><div class="scada-bar"><i style="width:14%;background:var(--red)"></i></div></div>
              <div class="scada-health"><span>Ingest Rate</span><b class="c">2,742/s</b><span>Telemetry</span></div>
              <div class="scada-health"><span>Current Latency</span><b class="g">1.2 s</b><span>Realtime sync</span></div>
            </div>
          </div>
        </section>

        <!-- SLIDE 2: SHIFT & MES TRACEABILITY -->
        <section class="scada-slide ${slideIdx === 1 ? "active" : ""}" id="scada-slide2">
          <div class="scada-panel scada-shiftpanel">
            <div class="scada-pt"><span>SHIFT / PRODUCTION SUMMARY</span><small>MES context from machine execution</small></div>
            <div class="scada-summarygrid">
              <div class="scada-sum"><span>RUN TIME</span><b class="g">${runningPct}%</b></div>
              <div class="scada-sum"><span>STOP TIME</span><b class="r">4.2%</b></div>
              <div class="scada-sum"><span>IDLE TIME</span><b class="y">${(100 - Number(runningPct) - 4.2).toFixed(1)}%</b></div>
              <div class="scada-sum"><span>SHIFT OUTPUT</span><b class="c">125,430 m</b></div>
              <div class="scada-sum"><span>ACTIVE BATCH</span><b class="c">${activeBatchesCount}</b></div>
              <div class="scada-sum"><span>PROCESS DEVIATION</span><b class="y">${warningCount}</b></div>
            </div>
          </div>

          <div class="scada-panel scada-tracepanel">
            <div class="scada-pt"><span>ACTIVE BATCH / TRACEABILITY</span><small>Order context · MES execution</small></div>
            <div class="scada-batchlist">
              <div class="scada-batch"><b>B260922014</b><span>JF-LB-04</span><span>Dyeing</span><span class="scada-status runpill">RUNNING</span></div>
              <div class="scada-batch"><b>B260922011</b><span>CL-TMR-02</span><span>Calator</span><span class="scada-status delaypill">DELAYED</span></div>
              <div class="scada-batch"><b>B260922019</b><span>KL-DPN-03</span><span>Kalender</span><span class="scada-status runpill">RUNNING</span></div>
              <div class="scada-batch"><b>B260922021</b><span>INSP-FIN-02</span><span>Inspecting</span><span class="scada-status holdpill">HOLD</span></div>
              <div class="scada-batch"><b>B260922006</b><span>CT-FIN-01</span><span>Continuous</span><span class="scada-status runpill">RUNNING</span></div>
            </div>
          </div>

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
              <div class="scada-wipcol"><div class="scada-wbar" style="height:83%;background:linear-gradient(180deg,#ffb14b,#ff8e42)"></div><b>32</b><span>Jet Dyeing</span></div>
              <div class="scada-wipcol"><div class="scada-wbar" style="height:37%"></div><b>14</b><span>Calator</span></div>
              <div class="scada-wipcol"><div class="scada-wbar" style="height:57%;background:linear-gradient(180deg,#ffce5d,#f2a73d)"></div><b>22</b><span>Calender</span></div>
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
        </section>

        <!-- SLIDE 3: RELIABILITY & MACHINE STATUS MAP (160 MESIN AKTUAL) -->
        <section class="scada-slide ${slideIdx === 2 ? "active" : ""}" id="scada-slide3">
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

          <div class="scada-panel scada-relpanel">
            <div class="scada-pt"><span>RELIABILITY KPI</span><small>Engineering / maintenance</small></div>
            <div class="scada-relgrid">
              <div class="scada-rel"><div><strong class="g">${availabilityPct}%</strong><small>Availability</small></div></div>
              <div class="scada-rel"><div><strong class="c">52.3 h</strong><small>MTBF</small></div></div>
              <div class="scada-rel"><div><strong class="y">18.4 m</strong><small>MTTR</small></div></div>
              <div class="scada-rel"><div><strong class="${faultCount > 0 ? "r" : "g"}">${faultCount}</strong><small>Active Failures</small></div></div>
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

          <!-- MACHINE STATUS MAP — ALL PROCESS AREAS (DATA AKTUAL 160 MESIN) -->
          <div class="scada-panel scada-mappanel">
            <div class="scada-pt">
              <span>MACHINE STATUS MAP — ALL PROCESS AREAS (${totalCount} ASSETS)</span>
              <small>● Running · ● Idle · ▲ Fault · ● Offline · <strong>Klik dot untuk buka detail mesin</strong></small>
            </div>
            <div class="scada-mmap" id="scada-machine-map">
              ${mapAreas.map(renderMapArea).join("")}
            </div>
          </div>

          <div class="scada-panel scada-insightpanel">
            <div class="scada-pt"><span>SMART OPERATIONAL SUMMARY</span><small>Rules now · AI-ready later</small></div>
            <div class="scada-insights">
              <div class="scada-insight"><div>⚠</div><div><b>JET DYEING</b><small>Suhu optimal stabil pada 82% unit beroperasi.</small></div></div>
              <div class="scada-insight"><div>🔧</div><div><b>CALATOR</b><small>2 unit running, 17 standby siap lot pemrosesan berikutnya.</small></div></div>
              <div class="scada-insight"><div>📡</div><div><b>OT NETWORK</b><small>Link SCADA online ${commPct}%, konektivitas stabil.</small></div></div>
              <div class="scada-insight"><div>🏭</div><div><b>AREA PERFORMANCE</b><small>Kalender mencatatkan 3 unit running aktif shift ini.</small></div></div>
              <div class="scada-insight"><div>🧠</div><div><b>DIAGNOSTIC READY</b><small>Klik sembarang dot mesin pada peta untuk inspeksi telemetri.</small></div></div>
            </div>
          </div>
        </section>

        <!-- SLIDE 4: UTILITY & PLANT INFRASTRUCTURE -->
        <section class="scada-slide ${slideIdx === 3 ? "active" : ""}" id="scada-slide4">
          <div class="scada-panel scada-utilitypanel">
            <div class="scada-pt"><span>UTILITY & PLANT INFRASTRUCTURE</span><small>Realtime physical utility performance</small></div>
            <div class="scada-utilitygrid">
              <div class="scada-util"><div class="scada-uhead"><span>⚡ POWER</span><span class="scada-dot ok"></span></div><strong>${powerVal}</strong><small>PF 0.94 · Peak 2.87 MW</small></div>
              <div class="scada-util"><div class="scada-uhead"><span>♨ STEAM</span><span class="scada-dot ok"></span></div><strong>${steamVal}</strong><small>Pipa utama ±0.2 bar</small></div>
              <div class="scada-util"><div class="scada-uhead"><span>💨 AIR</span><span class="scada-dot ok"></span></div><strong>6.4 bar</strong><small>Stable ±0.15 bar</small></div>
              <div class="scada-util"><div class="scada-uhead"><span>💧 WATER</span><span class="scada-dot ok"></span></div><strong>43 m³/h</strong><small>Main process header</small></div>
              <div class="scada-util"><div class="scada-uhead"><span>🔥 BOILER</span><span class="scada-dot ok"></span></div><strong class="g">RUNNING</strong><small>Normal operation</small></div>
              <div class="scada-util"><div class="scada-uhead"><span>🌿 IPAL</span><span class="scada-dot ok"></span></div><strong class="g">NORMAL</strong><small>Outlet within limit</small></div>
            </div>
          </div>

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

          <div class="scada-panel scada-archpanel">
            <div class="scada-pt"><span>ACTUAL SCADA / MES DATA FLOW</span><small>Digital Automation technical ownership</small></div>
            <div class="scada-flow">
              <div class="scada-node">PLC / SENSOR<b>Field OT</b></div>
              <div class="scada-node">GATEWAY<b>Edge</b></div>
              <div class="scada-node">NODE-RED / MQTT<b>Ingestion</b></div>
              <div class="scada-node">POSTGRESQL<b>Snapshot + Historian</b></div>
              <div class="scada-node">MES API / SSE<b>Service</b></div>
              <div class="scada-node">SCADA UI<b>Command Center</b></div>
            </div>
          </div>

          <div class="scada-panel scada-datapanel">
            <div class="scada-pt"><span>DATA PLATFORM SUMMARY</span><small>Snapshot + telemetry + quality</small></div>
            <div class="scada-datagrid">
              <div class="scada-data"><span>ACTIVE TAGS</span><b class="g">2,742</b><span>GOOD quality</span></div>
              <div class="scada-data"><span>INGEST RATE</span><b class="c">2,742/s</b><span>Realtime telemetry</span></div>
              <div class="scada-data"><span>STALE / BAD</span><b class="r">${totalCount - connectedCount}</b><span>Requires sync</span></div>
              <div class="scada-data"><span>AVG LATENCY</span><b class="g">1.2 s</b><span>Realtime update</span></div>
            </div>
          </div>

          <div class="scada-panel scada-svcspanel">
            <div class="scada-pt"><span>SYSTEM & INTEGRATION SERVICES</span><small>SCADA remains operable if ERP is offline</small></div>
            <div class="scada-services">
              <div class="scada-service"><span>SCADA Realtime Service</span><span class="scada-pill">ONLINE</span></div>
              <div class="scada-service"><span>PostgreSQL Historian</span><span class="scada-pill">ONLINE</span></div>
              <div class="scada-service"><span>MQTT Broker</span><span class="scada-pill">ONLINE</span></div>
              <div class="scada-service"><span>Node-RED Ingestion</span><span class="scada-pill">ONLINE</span></div>
              <div class="scada-service"><span>MES API</span><span class="scada-pill">ONLINE</span></div>
              <div class="scada-service"><span>ERP Integration API</span><span class="scada-pill">CONNECTED</span></div>
            </div>
          </div>
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
