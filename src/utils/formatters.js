// ============================================================================
// UI Formatters & Markup Helpers
// ============================================================================

function pageHead(page, actions = "") {
  const meta = pageMeta[page] || [page, "", ""];
  return `
    <section class="page-head">
      <div>
        ${meta[1] ? `<div class="eyebrow">${meta[1]}</div>` : ""}
        <h1>${meta[0]}</h1>
        ${meta[2] ? `<p>${meta[2]}</p>` : ""}
      </div>
      <div class="head-actions">${actions}</div>
    </section>
  `;
}

function panel(title, subtitle, content, actions = "", classes = "") {
  return `
    <article class="card panel ${classes}">
      <div class="panel-head">
        <div><h2 class="panel-title">${title}</h2><p class="panel-subtitle">${subtitle}</p></div>
        ${actions ? `<div class="panel-actions">${actions}</div>` : ""}
      </div>
      ${content}
    </article>
  `;
}

function kpi(label, value, unit, icon, foot, tone = "") {
  return `
    <article class="card kpi-card">
      <div class="kpi-top"><span class="kpi-label">${label}</span><span class="kpi-icon ${tone}">${icon}</span></div>
      <div class="kpi-value">${value}<small>${unit}</small></div>
      <div class="kpi-foot">${foot}</div>
    </article>
  `;
}

function activeAlarmsForAsset(assetId) {
  return backendActiveAlarmEvents
    .filter((alarm) => alarm.asset_id === assetId && alarm.event_state !== "CLEARED")
    .sort((left, right) => {
      const priority = { critical: 0, warning: 1, info: 2 };
      const severityOrder = (priority[String(left.severity || "warning").toLowerCase()] ?? 3) - (priority[String(right.severity || "warning").toLowerCase()] ?? 3);
      return severityOrder || new Date(right.occurred_at || 0) - new Date(left.occurred_at || 0);
    });
}

function machineAlarmNote(assetId, compact = false) {
  const events = activeAlarmsForAsset(assetId);
  if (!events.length) return compact ? `<span class="machine-alarm-clear">No active alarm</span>` : "";
  const criticalCount = events.filter((alarm) => String(alarm.severity).toLowerCase() === "critical").length;
  const primary = events[0];
  const tone = criticalCount ? "critical" : "warning";
  const countLabel = criticalCount ? `${criticalCount} critical` : `${events.length} active`;
  const ruleType = String(primary.rule_type || primary.alarm_type || "HIGH").replace(/^RULE_/, "");
  const operator = alarmRuleOperator(ruleType);
  const unit = primary.engineering_unit || "";
  const threshold = primary.threshold_value == null ? Number.NaN : Number(primary.threshold_value);
  const trigger = primary.trigger_value == null ? Number.NaN : Number(primary.trigger_value);
  const thresholdText = Number.isFinite(threshold) ? `${operator} ${threshold.toLocaleString("id-ID", { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ""}` : "—";
  const triggerText = Number.isFinite(trigger) ? `${trigger.toLocaleString("id-ID", { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ""}` : "—";
  if (compact) return `<span class="machine-alarm-compact ${tone}"><span class="machine-alarm-signal" aria-hidden="true"></span><span><strong>${actualText(countLabel)}</strong><small>${actualTime(primary.occurred_at)} · Rule ${actualText(thresholdText)}</small></span></span>`;
  return `<div class="machine-active-alarm-note ${tone}" role="note" aria-label="Active alarm information">
    <span class="machine-alarm-signal" aria-hidden="true"></span>
    <span class="machine-alarm-summary"><strong>${actualText(countLabel)}</strong><small>${actualText(primary.title || "Process alarm")}${events.length > 1 ? ` · +${events.length - 1} alarm lain` : ""}</small></span>
    <dl class="machine-alarm-facts">
      <div><dt>Started</dt><dd>${actualTime(primary.occurred_at)}</dd></div>
      <div><dt>Parameter / Rule</dt><dd>${actualText(primary.signal_role || primary.tag_code || "—")} · ${actualText(ruleType)} ${actualText(thresholdText)}</dd></div>
      <div><dt>Trigger value</dt><dd>${actualText(triggerText)}</dd></div>
    </dl>
  </div>`;
}

function machineHero(machine, code, meta) {
  return `
    <section class="card machine-hero">
      <div class="machine-identity">
        <div class="machine-avatar">${code}</div>
        <div>
          <h2>${machine.name} ${statusPill(machine.state)}</h2>
          <p>${meta}</p>
        </div>
      </div>
      <div class="machine-hero-meta">
        <div class="hero-meta-item"><span>Batch</span><strong>${machine.batch}</strong></div>
        <div class="hero-meta-item"><span>Progress</span><strong>${machine.progress}%</strong></div>
        <div class="hero-meta-item"><span>Last update</span><strong>${machine.sourceTs ? backendTimeLabel(machine.sourceTs) : "NOW · 18ms"}</strong></div>
        ${machineConnectionBadge(machine)}
      </div>
      ${machineAlarmNote(machine.id)}
    </section>
  `;
}

function chemicalDispensingPidPanel(machine) {
  const destinations = dispensingSupportedCalators(machine);
  const availableChemicals = chemicalAnalytics.data?.available_chemicals || [];
  const inletSources = [
    { code: "WTR", name: "Process water" },
    ...availableChemicals.slice(0, 7).map((item) => ({ code: item.chemical_code, name: item.chemical_name })),
  ];
  while (inletSources.length < 8) {
    const sequence = inletSources.length;
    inletSources.push({ code: `CH-${String(sequence).padStart(2, "0")}`, name: `Chemical line ${sequence}` });
  }
  const diagramHeight = 760;
  const gradientId = `pid-vessel-${String(machine.id).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  const patternId = `pid-grid-${String(machine.id).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  const arrowId = `pid-arrow-${String(machine.id).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  const valve = (x, y, label, elementCode, flow = "inlet") => {
    const tagX = flow === "transfer" ? x + 27 : x;
    const tagY = flow === "transfer" ? y + 4 : y + 28;
    const tagAnchor = flow === "transfer" ? "start" : "middle";
    return `<g class="pid-valve pid-${flow} pid-state-ready" data-element-code="${elementCode}" role="img" aria-label="${label} valve">
    <title>${label} · live state ready</title>
    <path class="pid-valve-body" d="M ${x - 14} ${y - 10} L ${x} ${y} L ${x - 14} ${y + 10} Z M ${x + 14} ${y - 10} L ${x} ${y} L ${x + 14} ${y + 10} Z"/>
    <line class="pid-valve-stem" x1="${x}" y1="${y}" x2="${x}" y2="${y - 18}"/>
    <rect class="pid-valve-actuator" x="${x - 8}" y="${y - 28}" width="16" height="10" rx="2"/>
    <circle class="pid-status-dot" cx="${x + 21}" cy="${y - 20}" r="4"/>
    <text class="pid-equipment-tag" x="${tagX}" y="${tagY}" text-anchor="${tagAnchor}">${label}</text>
  </g>`;
  };
  const inlets = inletSources.slice(0, 8).map((source, index) => {
    const y = 142 + index * 70;
    const valveCode = `INLET_VALVE_${String(index + 1).padStart(2, "0")}`;
    return `<g class="pid-inlet-line" data-element-code="${valveCode}">
      <rect class="pid-source-card" x="62" y="${y - 24}" width="170" height="48" rx="8"/>
      <rect class="pid-source-index" x="62" y="${y - 24}" width="38" height="48" rx="8"/>
      <text class="pid-source-code" x="81" y="${y + 4}" text-anchor="middle">${String(index + 1).padStart(2, "0")}</text>
      <text class="pid-source-label" x="112" y="${y - 4}">${actualText(source.code)}</text>
      <text class="pid-source-name" x="112" y="${y + 12}">${actualText(source.name)}</text>
      <path class="pid-pipe" d="M232 ${y} H392"/>
      ${valve(306, y, `XV-${String(101 + index)}`, valveCode)}
      <circle class="pid-junction" cx="392" cy="${y}" r="5"/>
    </g>`;
  }).join("");
  const destinationGap = 64;
  const destinationStart = 548 - ((Math.max(destinations.length, 1) - 1) * destinationGap) / 2;
  const destinationYs = destinations.length ? destinations.map((_, index) => destinationStart + index * destinationGap) : [548];
  const branches = destinations.map((calator, index) => {
    const y = destinationYs[index];
    const routeCode = `ROUTE_CL_${String(index + 1).padStart(2, "0")}`;
    return `<g class="pid-destination pid-state-ready" data-element-code="${routeCode}" data-destination-asset="${actualText(calator.id)}">
      <path class="pid-pipe pid-discharge" d="M1060 ${y} H1134"/>
      ${valve(1100, y, `XV-${String(301 + index)}`, routeCode, "route")}
      <circle class="pid-junction" cx="1060" cy="${y}" r="5"/>
      <rect class="pid-destination-card" x="1134" y="${y - 27}" width="242" height="54" rx="9"/>
      <rect class="pid-destination-status" x="1134" y="${y - 27}" width="7" height="54" rx="3"/>
      <text class="pid-destination-id" x="1158" y="${y - 3}">${actualText(calator.id)}</text>
      <text class="pid-destination-name" x="1158" y="${y + 15}">${actualText(calator.name)}</text>
    </g>`;
  }).join("");
  return `<section class="card pid-card">
    <div class="pid-head"><div><span class="eyebrow">LIVE PROCESS SCHEMATIC</span><h2>Chemical Dispensing Skid · ${actualText(machine.id)}</h2><p>Delapan supply line masuk ke common manifold, ditimbang pada Tank 1, ditransfer ke Tank 2, lalu dialirkan melalui distribution header ke Calator area ${actualText(machine.areaLabel)}.</p></div><div class="pid-head-actions chemical-pid-head-actions"><div class="chemical-pid-live-status">${machineConnectionBadge(machine, "controller")}${machineControlModeBadge(machine, true)}</div><div class="pid-legend"><span><i class="pid-legend-dot ready"></i>No live data / binding ready</span><span><i class="pid-legend-valve"></i>Actuated valve</span><span><i class="pid-legend-line"></i>Process pipe</span></div></div></div>
    <div class="pid-scroll" tabindex="0" aria-label="P and ID chemical dispensing ${machine.id}">
      <svg class="chemical-dispensing-pid" viewBox="0 0 1440 ${diagramHeight}" role="img" aria-label="P and ID dispensing chemical: supply rack 8 valve, common manifold, Tank 1 dengan loadcell, transfer valve dan pump, Tank 2, serta distribution header ke Calator">
        <title>Chemical dispensing process schematic ${actualText(machine.id)}</title>
        <defs>
          <linearGradient id="${gradientId}" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#f9fcfc"/><stop offset="100%" stop-color="#e6f1f3"/></linearGradient>
          <pattern id="${patternId}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#dce7e9" stroke-width="1"/></pattern>
          <marker id="${arrowId}" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0,0 L0,8 L9,4 z" class="pid-arrow-head"/></marker>
        </defs>
        <rect class="pid-canvas-grid" x="28" y="28" width="1384" height="704" rx="16" fill="url(#${patternId})"/>
        <g class="pid-zone"><rect x="44" y="54" width="374" height="650" rx="14"/><text class="pid-zone-index" x="66" y="84">01</text><text class="pid-section-label" x="104" y="84">SUPPLY &amp; VALVE RACK</text><text class="pid-section-note" x="66" y="101">8 dedicated inlet lines</text></g>
        <g class="pid-zone"><rect x="438" y="54" width="510" height="650" rx="14"/><text class="pid-zone-index" x="460" y="84">02</text><text class="pid-section-label" x="498" y="84">WEIGHING &amp; TRANSFER</text><text class="pid-section-note" x="460" y="101">Tank 1 → transfer → Tank 2</text></g>
        <g class="pid-zone"><rect x="968" y="54" width="428" height="650" rx="14"/><text class="pid-zone-index" x="990" y="84">03</text><text class="pid-section-label" x="1028" y="84">CALATOR DISTRIBUTION</text><text class="pid-section-note" x="990" y="101">Header and destination routes</text></g>

        ${inlets}
        <g class="pid-manifold" data-element-code="SUPPLY_MANIFOLD">
          <path class="pid-pipe pid-header-pipe" d="M392 142 V632"/>
          <path class="pid-pipe pid-active-pipe" d="M392 184 H520 Q536 184 536 168 V154 H566" marker-end="url(#${arrowId})"/>
          <rect class="pid-line-tag" x="346" y="92" width="92" height="24" rx="12"/><text x="392" y="108" text-anchor="middle">MH-101</text>
          <text class="pid-flow-label" x="438" y="171">COMMON INLET</text>
        </g>

        <g class="pid-vessel" data-element-code="TANK_01" role="img" aria-label="Tank 1 weighing and buffer tank">
          <path class="pid-vessel-shadow" d="M568 139 Q568 116 684 116 Q800 116 800 139 V294 Q800 326 684 326 Q568 326 568 294 Z"/>
          <path class="pid-vessel-shell" d="M568 132 Q568 110 684 110 Q800 110 800 132 V288 Q800 320 684 320 Q568 320 568 288 Z" fill="url(#${gradientId})"/>
          <ellipse class="pid-vessel-top" cx="684" cy="132" rx="116" ry="22"/>
          <path class="pid-vessel-band" d="M568 265 H800"/>
          <rect class="pid-equipment-plate" x="588" y="164" width="192" height="115" rx="12"/>
          <text class="pid-tank-title" x="684" y="188">TANK 1 · TK-101</text>
          <text class="pid-tank-sub" x="684" y="205">WEIGHING / BUFFER</text>
          <g class="pid-live-readout" data-pid-live-readout="WEIGHT_PV" data-quality="UNKNOWN">
            <rect class="pid-live-panel" x="598" y="213" width="172" height="58" rx="10"/>
            <circle class="pid-live-dot" cx="612" cy="228" r="4"/>
            <text class="pid-live-label" x="622" y="231">LC-101 · LIVE WEIGHT</text>
            <text class="pid-live-quality" x="760" y="231" text-anchor="end" data-pid-live-quality="WEIGHT_PV">NO DATA</text>
            <text class="pid-live-value" x="684" y="259" data-pid-live-value="WEIGHT_PV">— kg</text>
          </g>
          <path class="pid-vessel-leg" d="M606 314 V337 M762 314 V337"/>
        </g>
        <g class="pid-loadcells" data-element-code="TANK_01_LOADCELL">
          <rect x="591" y="337" width="30" height="17" rx="3"/><rect x="747" y="337" width="30" height="17" rx="3"/>
          <path class="pid-signal-line" d="M591 346 H526"/>
          <circle class="pid-instrument" cx="501" cy="346" r="25"/><text class="pid-instrument-code" x="501" y="343" text-anchor="middle">WT</text><text class="pid-instrument-no" x="501" y="356" text-anchor="middle">101</text>
        </g>

        <g class="pid-transfer-skid" data-element-code="TRANSFER_LINE">
          <path class="pid-pipe pid-active-pipe" d="M684 320 V458" marker-end="url(#${arrowId})"/>
          ${valve(684, 397, "XV-201", "TRANSFER_VALVE", "transfer")}
          <g class="pid-pump pid-state-ready" data-element-code="TRANSFER_PUMP"><title>P-201 transfer pump · live state ready</title><circle cx="684" cy="432" r="23"/><path d="M675 420 L699 432 L675 444 Z"/><circle class="pid-status-dot" cx="708" cy="413" r="4"/><text class="pid-equipment-tag" x="728" y="436">P-201</text></g>
          <rect class="pid-line-tag" x="744" y="377" width="122" height="24" rx="12"/><text x="805" y="393" text-anchor="middle">TRANSFER SKID</text>
        </g>

        <g class="pid-vessel pid-vessel-secondary" data-element-code="TANK_02" role="img" aria-label="Tank 2 distribution tank">
          <path class="pid-vessel-shadow" d="M578 489 Q578 468 684 468 Q790 468 790 489 V612 Q790 642 684 642 Q578 642 578 612 Z"/>
          <path class="pid-vessel-shell" d="M578 482 Q578 462 684 462 Q790 462 790 482 V606 Q790 636 684 636 Q578 636 578 606 Z" fill="url(#${gradientId})"/>
          <ellipse class="pid-vessel-top" cx="684" cy="482" rx="106" ry="20"/>
          <path class="pid-vessel-band" d="M578 590 H790"/>
          <rect class="pid-equipment-plate" x="608" y="520" width="152" height="65" rx="10"/>
          <text class="pid-tank-title" x="684" y="543">TANK 2 · TK-201</text>
          <text class="pid-tank-sub" x="684" y="562">DISTRIBUTION TANK</text>
          <text class="pid-tank-value" x="684" y="581">ROUTE HEADER READY</text>
          <path class="pid-vessel-leg" d="M618 631 V658 M750 631 V658"/>
          <path class="pid-pipe thin" d="M602 658 H766"/>
        </g>

        <g class="pid-distribution-header" data-element-code="DISTRIBUTION_MANIFOLD">
          <path class="pid-pipe pid-active-pipe pid-discharge" d="M790 548 H1060" marker-end="url(#${arrowId})"/>
          <path class="pid-pipe pid-header-pipe pid-discharge" d="M1060 ${Math.min(548, destinationYs[0])} V${Math.max(548, destinationYs[destinationYs.length - 1])}"/>
          <rect class="pid-line-tag" x="808" y="510" width="142" height="24" rx="12"/><text x="879" y="526" text-anchor="middle">DH-201 · OUTLET</text>
          ${branches || `<text class="pid-empty-note" x="1134" y="553">No Calator destination mapped</text>`}
        </g>
      </svg>
    </div>
    <div class="pid-foot"><span><strong>8</strong> inlet valves · <strong>1</strong> common manifold · <strong>2</strong> tanks · <strong>${destinations.length}</strong> Calator routes</span><small>Setiap group SVG memiliki <span class="mono">data-element-code</span> agar state valve, pump, loadcell, tank, dan route dapat di-binding ke <span class="mono">instrument_state</span>.</small></div>
  </section>`;
}

function kalenderPidPanelLegacy(machine) {
  const assetCode = actualText(machine.id);
  const isCollapsed = Boolean(state.pidPanel.kalender);
  const safeId = String(machine.id).replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const gridId = `kalender-grid-${safeId}`;
  const metalId = `kalender-metal-${safeId}`;
  const steamArrowId = `kalender-steam-arrow-${safeId}`;
  const fabricArrowId = `kalender-fabric-arrow-${safeId}`;
  const valve = (x, y, label, elementCode, orientation = "horizontal") => {
    const transform = orientation === "vertical" ? `translate(${x} ${y}) rotate(90)` : `translate(${x} ${y})`;
    const tagX = orientation === "vertical" ? x + 24 : x;
    const tagY = orientation === "vertical" ? y + 4 : y + 30;
    const anchor = orientation === "vertical" ? "start" : "middle";
    return `<g class="kalender-pid-valve pid-state-binding" data-element-code="${elementCode}" role="img" aria-label="${label}">
      <title>${label} · live state binding ready</title>
      <g transform="${transform}"><path d="M -14 -10 L 0 0 L -14 10 Z M 14 -10 L 0 0 L 14 10 Z"/><line x1="0" y1="0" x2="0" y2="-18"/><rect x="-8" y="-29" width="16" height="11" rx="2"/></g>
      <circle class="kalender-pid-state-dot" cx="${orientation === "vertical" ? x + 19 : x + 21}" cy="${y - 20}" r="4"/>
      <text class="kalender-pid-tag" x="${tagX}" y="${tagY}" text-anchor="${anchor}">${label}</text>
    </g>`;
  };
  const motor = (x, y, label, elementCode) => `<g class="kalender-pid-motor pid-state-binding" data-element-code="${elementCode}" role="img" aria-label="Motor ${label}">
    <title>${label} motor · live state binding ready</title><circle cx="${x}" cy="${y}" r="18"/><text x="${x}" y="${y + 4}" text-anchor="middle">M</text><circle class="kalender-pid-state-dot" cx="${x + 15}" cy="${y - 15}" r="4"/><text class="kalender-pid-motor-label" x="${x}" y="${y + 34}" text-anchor="middle">${label}</text>
  </g>`;
  return `<section class="card pid-card kalender-pid-card ${isCollapsed ? "is-collapsed" : ""}" data-pid-panel="kalender">
    <div class="pid-head"><div><span class="eyebrow">LIVE PROCESS SCHEMATIC</span><h2>Kalender Process P&amp;ID · ${assetCode}</h2><p>Alur kain dari inlet dan expander menuju upper/lower heated roll, cooling belt, dancing roller, conveyor, lalu pelipatan di plaiter table.</p></div><div class="pid-head-actions"><div class="pid-legend kalender-pid-legend"><span><i class="kalender-legend-fabric"></i>Fabric path</span><span><i class="kalender-legend-steam"></i>Steam heating</span><span><i class="pid-legend-dot binding"></i>Live binding ready</span></div><button class="pid-collapse-button" type="button" data-pid-toggle="kalender" aria-expanded="${isCollapsed ? "false" : "true"}" aria-controls="kalender-pid-content-${safeId}"><span>${isCollapsed ? "Expand P&amp;ID" : "Minimize P&amp;ID"}</span><i aria-hidden="true"></i></button></div></div>
    <div class="kalender-pid-body" id="kalender-pid-content-${safeId}" ${isCollapsed ? "aria-hidden=\"true\"" : ""}>
    <div class="pid-scroll kalender-pid-scroll" tabindex="0" aria-label="P and ID process Kalender ${assetCode}">
      <svg class="kalender-process-pid" viewBox="0 0 1600 700" role="img" aria-label="P and ID Kalender: fabric supply, inlet, expander, heated upper lower roll, cooling belt, dancing roller, conveyor, folder, dan plaiter table">
        <title>Kalender process schematic ${assetCode}</title>
        <defs>
          <pattern id="${gridId}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#dce7e9" stroke-width="1"/></pattern>
          <linearGradient id="${metalId}" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="52%" stop-color="#edf4f5"/><stop offset="100%" stop-color="#cbdde1"/></linearGradient>
          <marker id="${steamArrowId}" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0 0L0 8L9 4Z" class="kalender-steam-arrow"/></marker>
          <marker id="${fabricArrowId}" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0 0L0 8L9 4Z" class="kalender-fabric-arrow"/></marker>
        </defs>
        <rect class="kalender-pid-canvas" x="24" y="24" width="1552" height="652" rx="18" fill="url(#${gridId})"/>
        <g class="kalender-pid-zone"><rect x="42" y="48" width="300" height="604" rx="14"/><text class="kalender-zone-index" x="64" y="78">01</text><text class="kalender-zone-title" x="102" y="78">FABRIC INFEED</text><text class="kalender-zone-note" x="64" y="98">Supply, inlet roller and width sensing</text></g>
        <g class="kalender-pid-zone"><rect x="358" y="48" width="650" height="604" rx="14"/><text class="kalender-zone-index" x="380" y="78">02</text><text class="kalender-zone-title" x="418" y="78">EXPANDING · HEATING · PRESSURE</text><text class="kalender-zone-note" x="380" y="98">Open-width alignment and upper/lower heated cylinders</text></g>
        <g class="kalender-pid-zone"><rect x="1024" y="48" width="272" height="604" rx="14"/><text class="kalender-zone-index" x="1046" y="78">03</text><text class="kalender-zone-title" x="1084" y="78">COOLING &amp; TENSION</text><text class="kalender-zone-note" x="1046" y="98">Cooling belt and dancing roller</text></g>
        <g class="kalender-pid-zone"><rect x="1312" y="48" width="246" height="604" rx="14"/><text class="kalender-zone-index" x="1334" y="78">04</text><text class="kalender-zone-title" x="1372" y="78">FOLDING OUTPUT</text><text class="kalender-zone-note" x="1334" y="98">Conveyor, folder and plaiter table</text></g>

        <g class="kalender-steam-system" data-element-code="STEAM_HEATING_HEADER">
          <path class="kalender-utility-pipe" d="M214 132H948" marker-end="url(#${steamArrowId})"/>
          <rect class="kalender-line-tag" x="218" y="104" width="84" height="22" rx="11"/><text x="260" y="119" text-anchor="middle">STEAM</text>
          <path class="kalender-utility-pipe" d="M286 132V177"/>
          ${valve(286, 166, "TCV-401", "HEATING_INLET_VALVE", "vertical")}
          <path class="kalender-utility-pipe" d="M286 177V220" marker-end="url(#${steamArrowId})"/>
          <path class="kalender-utility-pipe" d="M700 132V187"/>
          ${valve(700, 166, "TCV-402", "UPPER_HEATING_VALVE", "vertical")}
          <path class="kalender-utility-pipe" d="M700 187V210" marker-end="url(#${steamArrowId})"/>
          <path class="kalender-utility-pipe" d="M948 132V344Q948 365 926 381" marker-end="url(#${steamArrowId})"/>
          ${valve(948, 166, "TCV-403", "LOWER_HEATING_VALVE", "vertical")}
          <text class="kalender-utility-label" x="286" y="118" text-anchor="middle">INLET HEAT</text><text class="kalender-utility-label" x="700" y="118" text-anchor="middle">UPPER HEAT</text><text class="kalender-utility-label" x="948" y="118" text-anchor="middle">LOWER HEAT</text>
        </g>

        <g class="kalender-fabric-supply" data-element-code="FABRIC_SUPPLY">
          <rect class="kalender-source-rack" x="66" y="492" width="150" height="112" rx="7"/>
          <path class="kalender-source-rack" d="M58 604H224M76 492V472H206V492"/>
          <path class="kalender-fabric-stack" d="M82 576H198M82 562H198M82 548H198M82 534H198M82 520H198"/>
          <text class="kalender-equipment-title" x="76" y="628">FABRIC SUPPLY</text>
        </g>
        <g class="kalender-inlet" data-element-code="INLET_ROLLER">
          <path class="kalender-machine-stand" d="M84 454V214Q84 184 114 184H292V468H326"/>
          <rect class="kalender-machine-frame" x="108" y="202" width="164" height="42" rx="5"/>
          <circle class="kalender-guide-roll" cx="132" cy="184" r="20"/><circle class="kalender-guide-roll" cx="270" cy="184" r="20"/><circle class="kalender-guide-roll" cx="274" cy="458" r="20"/>
          <rect class="kalender-machine-frame" x="118" y="212" width="126" height="20" rx="3"/>
          <text class="kalender-equipment-title" x="112" y="168">INLET / PRE-HEATING</text>${motor(228, 278, "INLET", "INLET_MOTOR")}
        </g>
        <g class="kalender-width-sensor" data-element-code="FABRIC_WIDTH_SENSOR">
          <path class="kalender-signal-line" d="M288 468H368"/><path class="kalender-width-beam" d="M314 446V494M352 432V478"/><circle class="kalender-instrument" cx="340" cy="408" r="22"/><text class="kalender-instrument-code" x="340" y="405" text-anchor="middle">WIT</text><text class="kalender-instrument-no" x="340" y="417" text-anchor="middle">401</text><text class="kalender-sensor-label" x="306" y="386">FABRIC WIDTH · cm</text>
        </g>
        <g class="kalender-expander" data-element-code="EXPANDER_LR">
          <path class="kalender-expander-bed" d="M326 472L518 330"/><path class="kalender-expander-bed kalender-expander-axis" d="M350 469L494 362"/><circle class="kalender-expander-roll" cx="378" cy="434" r="18"/><circle class="kalender-expander-roll" cx="438" cy="389" r="18"/><circle class="kalender-expander-roll" cx="496" cy="346" r="18"/>
          <text class="kalender-equipment-title" x="374" y="330">EXPANDER L / R</text>${motor(392, 530, "EXP L", "EXPANDER_L_MOTOR")}${motor(454, 530, "EXP R", "EXPANDER_R_MOTOR")}
        </g>

        <rect class="kalender-process-frame" x="548" y="174" width="428" height="408" rx="9"/>
        <g class="kalender-roll kalender-upper-roll" data-element-code="UPPER_FELT">
          <circle class="kalender-roll-shadow" cx="718" cy="288" r="86"/><circle class="kalender-heated-roll" cx="718" cy="280" r="86" fill="url(#${metalId})"/><circle class="kalender-roll-hub" cx="718" cy="280" r="26"/><text class="kalender-roll-title" x="718" y="275" text-anchor="middle">UPPER FELT</text><text class="kalender-roll-sub" x="718" y="294" text-anchor="middle">CYLINDER · CR-401</text>${motor(602, 220, "UPPER", "UPPER_FELT_MOTOR")}
        </g>
        <g class="kalender-roll kalender-lower-roll" data-element-code="LOWER_FELT">
          <circle class="kalender-roll-shadow" cx="842" cy="470" r="82"/><circle class="kalender-heated-roll" cx="842" cy="462" r="82" fill="url(#${metalId})"/><circle class="kalender-roll-hub" cx="842" cy="462" r="25"/><text class="kalender-roll-title" x="842" y="457" text-anchor="middle">LOWER FELT</text><text class="kalender-roll-sub" x="842" y="476" text-anchor="middle">CYLINDER · CR-402</text>${motor(760, 605, "LOWER", "LOWER_FELT_MOTOR")}
        </g>
        <g class="kalender-guide-system" data-element-code="GUIDE_ROLLERS">
          <circle class="kalender-guide-roll" cx="572" cy="348" r="18"/><circle class="kalender-guide-roll" cx="618" cy="314" r="18"/><circle class="kalender-guide-roll" cx="632" cy="392" r="18"/><circle class="kalender-guide-roll" cx="650" cy="445" r="18"/><circle class="kalender-guide-roll" cx="936" cy="348" r="18"/>
        </g>
        <g class="kalender-temperature-sensors">
          <g data-element-code="UPPER_TEMPERATURE"><circle class="kalender-instrument" cx="576" cy="260" r="22"/><text class="kalender-instrument-code" x="576" y="257" text-anchor="middle">TT</text><text class="kalender-instrument-no" x="576" y="270" text-anchor="middle">401</text><path class="kalender-signal-line" d="M598 260L632 266"/><text class="kalender-sensor-label" x="552" y="294">TEMP UPPER · °C</text></g>
          <g data-element-code="LOWER_TEMPERATURE"><circle class="kalender-instrument" cx="608" cy="538" r="22"/><text class="kalender-instrument-code" x="608" y="535" text-anchor="middle">TT</text><text class="kalender-instrument-no" x="608" y="548" text-anchor="middle">402</text><path class="kalender-signal-line" d="M630 532L765 494"/><text class="kalender-sensor-label" x="572" y="575">TEMP LOWER · °C</text></g>
        </g>
        <g class="kalender-loadcell kalender-loadcell-upper" data-element-code="LOADCELL_UPPER"><path class="kalender-signal-line" d="M790 302L858 320"/><circle class="kalender-loadcell-roll" cx="805" cy="306" r="13"/><circle class="kalender-instrument" cx="880" cy="326" r="22"/><text class="kalender-instrument-code" x="880" y="323" text-anchor="middle">LC</text><text class="kalender-instrument-no" x="880" y="336" text-anchor="middle">401</text><text class="kalender-sensor-label" x="848" y="362">LOADCELL UPPER · kg</text></g>
        <g class="kalender-loadcell kalender-loadcell-lower" data-element-code="LOADCELL_LOWER"><path class="kalender-signal-line" d="M910 492L930 548"/><circle class="kalender-loadcell-roll" cx="912" cy="492" r="13"/><circle class="kalender-instrument" cx="938" cy="570" r="22"/><text class="kalender-instrument-code" x="938" y="567" text-anchor="middle">LC</text><text class="kalender-instrument-no" x="938" y="580" text-anchor="middle">402</text><text class="kalender-sensor-label" x="888" y="610">LOADCELL LOWER · kg</text></g>

        <g class="kalender-cooling-belt" data-element-code="COOLING_BELT">
          <rect class="kalender-belt-body" x="1044" y="208" width="190" height="66" rx="13"/><circle class="kalender-belt-roll" cx="1070" cy="241" r="18"/><circle class="kalender-belt-roll" cx="1208" cy="241" r="18"/><path class="kalender-belt-line" d="M1070 223H1208M1070 259H1208"/><text class="kalender-equipment-title" x="1090" y="190">COOLING BELT</text>${motor(1138, 314, "COOLING", "COOLING_BELT_MOTOR")}
        </g>
        <g class="kalender-dancing" data-element-code="DANCING_ROLLER"><path class="kalender-dancer-arm" d="M1246 278L1274 344"/><circle class="kalender-guide-roll" cx="1276" cy="350" r="23"/><path class="kalender-signal-line" d="M1276 373V405"/><circle class="kalender-instrument" cx="1276" cy="427" r="22"/><text class="kalender-instrument-code" x="1276" y="424" text-anchor="middle">ZT</text><text class="kalender-instrument-no" x="1276" y="437" text-anchor="middle">401</text><text class="kalender-sensor-label" x="1240" y="466">DANCING · %</text></g>

        <g class="kalender-conveyor" data-element-code="CONVEYOR_BELT">
          <rect class="kalender-belt-body" x="1334" y="208" width="192" height="66" rx="13"/><circle class="kalender-belt-roll" cx="1360" cy="241" r="18"/><circle class="kalender-belt-roll" cx="1498" cy="241" r="18"/><path class="kalender-belt-line" d="M1360 223H1498M1360 259H1498"/><path class="kalender-conveyor-chute" d="M1498 241L1540 340L1518 350L1480 270"/><text class="kalender-equipment-title" x="1390" y="190">CONVEYOR BELT</text>${motor(1370, 314, "CONVEYOR", "CONVEYOR_BELT_MOTOR")}
        </g>
        <g class="kalender-plaiter" data-element-code="PLAITER">
          <path class="kalender-plaiter-arm" d="M1528 346V410L1478 448"/><circle class="kalender-plaiter-pivot" cx="1528" cy="346" r="12"/><rect class="kalender-machine-frame kalender-plaiter-body" x="1338" y="478" width="198" height="126" rx="8"/><path class="kalender-table" d="M1354 478H1520M1354 491H1520"/>
          <path class="kalender-folded-fabric" d="M1370 468Q1390 446 1410 468T1450 468T1490 468T1520 468"/>
          <text class="kalender-equipment-title" x="1360" y="535">PLAITER &amp; OUTPUT TABLE</text>${motor(1380, 574, "PLAIT", "PLAITER_MOTOR")}${motor(1490, 574, "TABLE", "CONVEYOR_TABLE_MOTOR")}
        </g>

        <g class="kalender-fabric-flow" data-element-code="FABRIC_PATH">
          <path class="kalender-fabric-shadow" d="M82 518Q98 490 112 466L112 218Q112 184 138 184H268Q292 184 292 208V430Q292 462 320 470L346 477Q370 482 392 466L510 376Q528 363 548 348H572Q598 348 618 326L640 302Q654 286 654 260C654 214 680 188 718 188C768 188 804 226 804 276C804 310 788 332 764 352L742 370Q724 386 724 416V444C724 494 758 530 812 530C866 530 902 498 902 450C902 410 882 382 852 362L878 374Q910 388 936 356L1010 264Q1028 241 1058 241H1206Q1228 241 1238 268L1260 328Q1266 350 1276 350Q1288 350 1294 328L1312 266Q1320 241 1348 241H1492Q1510 241 1518 261L1540 330L1528 346V410L1478 448V456"/>
          <path class="kalender-fabric-path" d="M82 518Q98 490 112 466L112 218Q112 184 138 184H268Q292 184 292 208V430Q292 462 320 470L346 477Q370 482 392 466L510 376Q528 363 548 348H572Q598 348 618 326L640 302Q654 286 654 260C654 214 680 188 718 188C768 188 804 226 804 276C804 310 788 332 764 352L742 370Q724 386 724 416V444C724 494 758 530 812 530C866 530 902 498 902 450C902 410 882 382 852 362L878 374Q910 388 936 356L1010 264Q1028 241 1058 241H1206Q1228 241 1238 268L1260 328Q1266 350 1276 350Q1288 350 1294 328L1312 266Q1320 241 1348 241H1492Q1510 241 1518 261L1540 330L1528 346V410L1478 448V456" marker-end="url(#${fabricArrowId})"/>
          <rect class="kalender-flow-label" x="58" y="434" width="126" height="26" rx="13"/><text x="121" y="451" text-anchor="middle">FABRIC IN</text>
          <g class="kalender-flow-directions" aria-hidden="true"><path d="M224 184h34" marker-end="url(#${fabricArrowId})"/><path d="M410 448l28-21" marker-end="url(#${fabricArrowId})"/><path d="M972 316l24-30" marker-end="url(#${fabricArrowId})"/><path d="M1120 241h38" marker-end="url(#${fabricArrowId})"/><path d="M1398 241h38" marker-end="url(#${fabricArrowId})"/></g>
        </g>
      </svg>
    </div>
    <div class="pid-foot"><span><strong>4</strong> process zones · <strong>3</strong> heating valves · <strong>2</strong> heated rolls · <strong>2</strong> loadcells · <strong>1</strong> continuous fabric path</span><small>Element code disiapkan untuk live status. Steam pressure, condensate return, fail-safe valve, dan instrument loop final wajib divalidasi dari P&amp;ID engineering mesin aktual.</small></div>
    </div>
  </section>`;
}

function kalenderPidPanel(machine) {
  const assetCode = actualText(machine.id);
  const isCollapsed = Boolean(state.pidPanel.kalender);
  const safeId = String(machine.id).replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const gridId = `kalender-simple-grid-${safeId}`;
  const metalId = `kalender-simple-metal-${safeId}`;
  const steamArrowId = `kalender-simple-steam-${safeId}`;
  const fabricArrowId = `kalender-simple-fabric-${safeId}`;
  const valve = (x, label, elementCode) => `<g class="kalender-pid-valve kalender-simple-valve pid-state-binding" data-element-code="${elementCode}" role="img" aria-label="${label}">
    <title>${label} · live state binding ready</title>
    <path d="M${x - 14} 134L${x} 146L${x - 14} 158ZM${x + 14} 134L${x} 146L${x + 14} 158Z"/><line x1="${x}" y1="146" x2="${x}" y2="126"/><rect x="${x - 8}" y="115" width="16" height="11" rx="2"/>
    <circle class="kalender-pid-state-dot" cx="${x + 20}" cy="120" r="4"/><text class="kalender-pid-tag" x="${x}" y="174" text-anchor="middle">${label}</text>
  </g>`;
  const monitor = (x, y, width, label, elementCode, detail = "LIVE") => `<g class="kalender-monitor-chip pid-state-binding" data-element-code="${elementCode}" role="img" aria-label="${label}">
    <title>${label} · ${detail} · live state binding ready</title><rect x="${x}" y="${y}" width="${width}" height="38" rx="8"/><circle class="kalender-pid-state-dot" cx="${x + 15}" cy="${y + 19}" r="4"/><text class="kalender-monitor-label" x="${x + 28}" y="${y + 16}">${label}</text><text class="kalender-monitor-detail" x="${x + 28}" y="${y + 29}">${detail}</text>
  </g>`;
  return `<section class="card pid-card kalender-pid-card kalender-pid-simple-card ${isCollapsed ? "is-collapsed" : ""}" data-pid-panel="kalender">
    <div class="pid-head"><div><span class="eyebrow">LIVE PROCESS SCHEMATIC</span><h2>Kalender Process Flow · ${assetCode}</h2><p>Alur kain dan titik monitoring utama. Warna indikator mengikuti status aktual dari instrument state.</p></div><div class="pid-head-actions"><div class="pid-legend kalender-pid-legend"><span><i class="kalender-legend-fabric"></i>Fabric flow</span><span><i class="kalender-legend-steam"></i>Steam</span><span><i class="pid-legend-dot binding"></i>Live status</span></div><button class="pid-collapse-button" type="button" data-pid-toggle="kalender" aria-expanded="${isCollapsed ? "false" : "true"}" aria-controls="kalender-pid-content-${safeId}"><span>${isCollapsed ? "Expand P&amp;ID" : "Minimize P&amp;ID"}</span><i aria-hidden="true"></i></button></div></div>
    <div class="kalender-pid-body" id="kalender-pid-content-${safeId}" ${isCollapsed ? "aria-hidden=\"true\"" : ""}>
      <div class="pid-scroll kalender-pid-scroll" tabindex="0" aria-label="Kalender process flow ${assetCode}">
        <svg class="kalender-process-pid kalender-process-pid-simple" viewBox="0 0 1600 650" role="img" aria-label="Simplified Kalender process flow from fabric supply to plaiter output">
          <title>Kalender simplified live process flow ${assetCode}</title>
          <defs>
            <pattern id="${gridId}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#dce7e9" stroke-width="1"/></pattern>
            <linearGradient id="${metalId}" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="55%" stop-color="#edf4f5"/><stop offset="100%" stop-color="#cbdde1"/></linearGradient>
            <marker id="${steamArrowId}" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0 0L0 8L9 4Z" class="kalender-steam-arrow"/></marker>
            <marker id="${fabricArrowId}" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0 0L0 8L9 4Z" class="kalender-fabric-arrow"/></marker>
          </defs>
          <rect class="kalender-pid-canvas" x="24" y="24" width="1552" height="602" rx="18" fill="url(#${gridId})"/>

          <g class="kalender-simple-zone kalender-simple-zone-1"><rect x="42" y="44" width="286" height="580" rx="14"/><text class="kalender-zone-index" x="62" y="73">01</text><text class="kalender-zone-title" x="98" y="73">INFEED</text><text class="kalender-zone-note" x="62" y="93">Supply · inlet · width · expander</text></g>
          <g class="kalender-simple-zone kalender-simple-zone-2"><rect x="344" y="44" width="620" height="580" rx="14"/><text class="kalender-zone-index" x="364" y="73">02</text><text class="kalender-zone-title" x="400" y="73">HEATING &amp; PRESSURE</text><text class="kalender-zone-note" x="364" y="93">Upper/lower felt and steam control</text></g>
          <g class="kalender-simple-zone kalender-simple-zone-3"><rect x="980" y="44" width="278" height="580" rx="14"/><text class="kalender-zone-index" x="1000" y="73">03</text><text class="kalender-zone-title" x="1036" y="73">COOLING &amp; TENSION</text><text class="kalender-zone-note" x="1000" y="93">Cooling belt · dancing roller</text></g>
          <g class="kalender-simple-zone kalender-simple-zone-4"><rect x="1274" y="44" width="284" height="580" rx="14"/><text class="kalender-zone-index" x="1294" y="73">04</text><text class="kalender-zone-title" x="1330" y="73">FOLDING OUTPUT</text><text class="kalender-zone-note" x="1294" y="93">Conveyor · folder · plaiter</text></g>

          <g class="kalender-simple-steam" data-element-code="STEAM_HEATING_HEADER">
            <rect class="kalender-line-tag" x="366" y="112" width="78" height="22" rx="11"/><text x="405" y="127" text-anchor="middle">STEAM</text>
            <path class="kalender-utility-pipe" d="M446 123H918" marker-end="url(#${steamArrowId})"/>
            <path class="kalender-utility-pipe kalender-steam-drop" d="M500 123V176M655 123V176M858 123V176"/>
            ${valve(500, "INLET HEAT", "HEATING_INLET_VALVE")}${valve(655, "UPPER HEAT", "UPPER_HEATING_VALVE")}${valve(858, "LOWER HEAT", "LOWER_HEATING_VALVE")}
          </g>

          <g class="kalender-simple-supply" data-element-code="FABRIC_SUPPLY">
            <rect class="kalender-source-rack" x="62" y="366" width="112" height="102" rx="7"/><path class="kalender-fabric-stack" d="M76 444H160M76 430H160M76 416H160M76 402H160M76 388H160"/><text class="kalender-equipment-title" x="72" y="490">FABRIC SUPPLY</text>
          </g>
          <g class="kalender-simple-inlet" data-element-code="INLET_ROLLER">
            <path class="kalender-machine-stand" d="M94 350V224Q94 202 116 202H252V354"/><rect class="kalender-machine-frame" x="112" y="216" width="118" height="28" rx="4"/><circle class="kalender-guide-roll" cx="116" cy="202" r="17"/><circle class="kalender-guide-roll" cx="248" cy="202" r="17"/><circle class="kalender-guide-roll" cx="248" cy="354" r="17"/><text class="kalender-equipment-title" x="116" y="184">INLET</text>
          </g>
          <g class="kalender-simple-expander" data-element-code="EXPANDER_LR">
            <g transform="translate(276 344) rotate(-27)"><rect class="kalender-expander-bar" x="0" y="-18" width="152" height="18" rx="7"/><rect class="kalender-expander-bar" x="0" y="8" width="152" height="18" rx="7"/><path class="kalender-expander-axis" d="M8 4H144"/></g>
            <circle class="kalender-expander-roll" cx="282" cy="356" r="14"/><circle class="kalender-expander-roll" cx="414" cy="290" r="14"/>
            <text class="kalender-equipment-title" x="282" y="273">EXPANDER L / R</text><text class="kalender-function-label" x="282" y="286">OPEN WIDTH &amp; ALIGNMENT</text>
          </g>

          <rect class="kalender-simple-process-frame" x="420" y="194" width="518" height="290" rx="10"/>
          <g class="kalender-felt-loop kalender-upper-felt-loop" data-element-code="UPPER_FELT">
            <path d="M530 210L710 250L560 330Z"/><circle class="kalender-felt-guide" cx="530" cy="210" r="17"/><circle class="kalender-felt-drive" cx="710" cy="250" r="19"/><path class="kalender-drive-cross" d="M699 239L721 261M721 239L699 261"/><circle class="kalender-felt-guide" cx="560" cy="330" r="17"/>
            <circle class="kalender-roll-shadow" cx="620" cy="271" r="61"/><circle class="kalender-heated-roll" cx="620" cy="266" r="61" fill="url(#${metalId})"/><circle class="kalender-roll-hub" cx="620" cy="266" r="18"/><text class="kalender-roll-title" x="620" y="262" text-anchor="middle">UPPER FELT</text><text class="kalender-roll-sub" x="620" y="278" text-anchor="middle">CR-401</text>
          </g>
          <g class="kalender-felt-loop kalender-lower-felt-loop" data-element-code="LOWER_FELT">
            <path d="M700 395L680 470L865 440Z"/><circle class="kalender-felt-guide" cx="700" cy="395" r="17"/><circle class="kalender-felt-guide" cx="680" cy="470" r="17"/><circle class="kalender-felt-drive" cx="865" cy="440" r="19"/><path class="kalender-drive-cross" d="M854 429L876 451M876 429L854 451"/>
            <circle class="kalender-roll-shadow" cx="770" cy="428" r="57"/><circle class="kalender-heated-roll" cx="770" cy="423" r="57" fill="url(#${metalId})"/><circle class="kalender-roll-hub" cx="770" cy="423" r="17"/><text class="kalender-roll-title" x="770" y="419" text-anchor="middle">LOWER FELT</text><text class="kalender-roll-sub" x="770" y="435" text-anchor="middle">CR-402</text>
          </g>
          <g class="kalender-simple-guides" data-element-code="GUIDE_ROLLERS">
            <circle class="kalender-guide-roll" cx="448" cy="304" r="15"/><text class="kalender-function-label" x="426" y="278">ENTRY GUIDE</text>
            <circle class="kalender-guide-roll" cx="900" cy="306" r="15"/><text class="kalender-function-label" x="874" y="280">EXIT GUIDE</text>
          </g>
          <g class="kalender-loadcell-roller" data-element-code="LOADCELL_UPPER" role="img" aria-label="Loadcell upper roller"><title>Loadcell Upper · small measuring roller after Upper Felt</title><circle class="kalender-loadcell-roll" cx="716" cy="350" r="14"/><circle class="kalender-pid-state-dot" cx="728" cy="338" r="3.5"/><text class="kalender-loadcell-code" x="734" y="354">LC UPPER</text></g>
          <g class="kalender-loadcell-roller" data-element-code="LOADCELL_LOWER" role="img" aria-label="Loadcell lower roller"><title>Loadcell Lower · small measuring roller after Lower Felt</title><circle class="kalender-loadcell-roll" cx="850" cy="374" r="14"/><circle class="kalender-pid-state-dot" cx="862" cy="362" r="3.5"/><text class="kalender-loadcell-code" x="846" y="350" text-anchor="middle">LC LOWER</text></g>

          <g class="kalender-cooling-belt" data-element-code="COOLING_BELT"><rect class="kalender-belt-body" x="1004" y="222" width="190" height="58" rx="12"/><circle class="kalender-belt-roll" cx="1028" cy="251" r="16"/><circle class="kalender-belt-roll" cx="1170" cy="251" r="16"/><path class="kalender-belt-line" d="M1028 235H1170M1028 267H1170"/><text class="kalender-equipment-title" x="1050" y="203">COOLING BELT</text></g>
          <g class="kalender-dancing" data-element-code="DANCING_ROLLER"><path class="kalender-dancer-arm" d="M1190 282L1216 344"/><circle class="kalender-guide-roll" cx="1218" cy="350" r="20"/><text class="kalender-equipment-title" x="1163" y="390">DANCING ROLLER</text></g>

          <g class="kalender-conveyor" data-element-code="CONVEYOR_BELT"><rect class="kalender-belt-body" x="1298" y="222" width="212" height="58" rx="12"/><circle class="kalender-belt-roll" cx="1322" cy="251" r="16"/><circle class="kalender-belt-roll" cx="1486" cy="251" r="16"/><path class="kalender-belt-line" d="M1322 235H1486M1322 267H1486"/><path class="kalender-conveyor-chute" d="M1486 251L1524 342L1506 351L1470 278"/><text class="kalender-equipment-title" x="1362" y="203">CONVEYOR</text></g>
          <g class="kalender-plaiter" data-element-code="PLAITER"><path class="kalender-plaiter-arm" d="M1515 350V401L1474 430"/><circle class="kalender-plaiter-pivot" cx="1515" cy="350" r="10"/><rect class="kalender-machine-frame kalender-plaiter-body" x="1320" y="466" width="212" height="58" rx="7"/><path class="kalender-table" d="M1336 466H1516M1336 477H1516"/><path class="kalender-folded-fabric" d="M1350 456Q1370 436 1390 456T1430 456T1470 456T1510 456"/><text class="kalender-equipment-title" x="1375" y="510">PLAITER TABLE</text></g>

          <g class="kalender-fabric-flow" data-element-code="FABRIC_PATH">
            <path class="kalender-fabric-shadow" d="M80 390Q96 370 105 344V228Q105 202 128 202H238Q260 202 260 224V328Q260 354 282 356L414 290Q432 298 448 304L560 330C544 300 548 258 570 230C592 202 632 192 666 206C704 222 722 256 716 290C712 318 696 338 672 352L696 346Q708 344 716 350L700 395C688 424 696 454 720 472C748 494 790 490 818 466C844 444 854 408 840 382L850 374Q864 368 876 348L900 306L966 252Q982 241 1006 251H1170Q1194 251 1202 278L1210 328Q1214 350 1218 350Q1224 350 1228 328L1240 278Q1248 251 1278 251H1484Q1500 251 1508 270L1524 330L1515 350V401L1474 430V446"/>
            <path class="kalender-fabric-path" d="M80 390Q96 370 105 344V228Q105 202 128 202H238Q260 202 260 224V328Q260 354 282 356L414 290Q432 298 448 304L560 330C544 300 548 258 570 230C592 202 632 192 666 206C704 222 722 256 716 290C712 318 696 338 672 352L696 346Q708 344 716 350L700 395C688 424 696 454 720 472C748 494 790 490 818 466C844 444 854 408 840 382L850 374Q864 368 876 348L900 306L966 252Q982 241 1006 251H1170Q1194 251 1202 278L1210 328Q1214 350 1218 350Q1224 350 1228 328L1240 278Q1248 251 1278 251H1484Q1500 251 1508 270L1524 330L1515 350V401L1474 430V446" marker-end="url(#${fabricArrowId})"/>
            <g class="kalender-flow-directions" aria-hidden="true"><path d="M174 202H216" marker-end="url(#${fabricArrowId})"/><path d="M348 326L378 304" marker-end="url(#${fabricArrowId})"/><path d="M930 276L954 259" marker-end="url(#${fabricArrowId})"/><path d="M1078 251H1122" marker-end="url(#${fabricArrowId})"/><path d="M1378 251H1422" marker-end="url(#${fabricArrowId})"/></g>
          </g>

          <text class="kalender-monitor-heading" x="62" y="524">MONITORED POINTS</text>
          ${monitor(62, 536, 124, "INLET DRIVE", "INLET_MOTOR", "RUN / STOP")}${monitor(194, 536, 116, "FABRIC WIDTH", "FABRIC_WIDTH_SENSOR", "cm")}
          ${monitor(62, 578, 124, "EXPANDER L", "EXPANDER_L_MOTOR", "RUN / STOP")}${monitor(194, 578, 116, "EXPANDER R", "EXPANDER_R_MOTOR", "RUN / STOP")}

          <text class="kalender-monitor-heading" x="364" y="504">MONITORED POINTS</text>
          ${monitor(364, 516, 184, "TEMP UPPER", "UPPER_TEMPERATURE", "PV / SV · °C")}${monitor(556, 516, 184, "LOADCELL UPPER", "LOADCELL_UPPER", "PV / SV · kg")}${monitor(748, 516, 194, "UPPER FELT DRIVE", "UPPER_FELT_MOTOR", "RUN / STOP")}
          ${monitor(364, 558, 184, "TEMP LOWER", "LOWER_TEMPERATURE", "PV / SV · °C")}${monitor(556, 558, 184, "LOADCELL LOWER", "LOADCELL_LOWER", "PV / SV · kg")}${monitor(748, 558, 194, "LOWER FELT DRIVE", "LOWER_FELT_MOTOR", "RUN / STOP")}

          <text class="kalender-monitor-heading" x="1000" y="504">MONITORED POINTS</text>
          ${monitor(1000, 516, 238, "COOLING BELT DRIVE", "COOLING_BELT_MOTOR", "RUN / STOP")}${monitor(1000, 558, 238, "DANCING ROLLER", "DANCING_ROLLER", "POSITION · %")}

          <text class="kalender-monitor-heading" x="1294" y="524">MONITORED POINTS</text>
          ${monitor(1294, 536, 246, "CONVEYOR DRIVE", "CONVEYOR_BELT_MOTOR", "RUN / STOP")}${monitor(1294, 578, 119, "PLAITER", "PLAITER_MOTOR", "RUN / STOP")}${monitor(1421, 578, 119, "TABLE", "CONVEYOR_TABLE_MOTOR", "RUN / STOP")}
        </svg>
      </div>
      <div class="pid-foot"><span><strong>Fabric flow</strong> menunjukkan urutan proses; status strip menunjukkan titik yang dipantau secara live.</span><small>Hijau: running/active · abu-abu: stopped/inactive · merah: fault/alarm · amber: stale. Detail PV/SV tetap tersedia pada live sensor dan historical trend.</small></div>
    </div>
  </section>`;
}

const sensorTrendConfig = {
  jetflow: [
    { key: "main_temp", label: "Main Tank Temperature", tag: "TEMP_MAIN", unit: "°C", sv: 93, variance: 2.4, decimals: 1, color: "#078eaa" },
    { key: "water_level", label: "Water Level", tag: "LEVEL_WATER", unit: "%", sv: 72, variance: 3.8, decimals: 1, color: "#4d8fd0" },
    { key: "flow_meter", label: "Main Flow Meter", tag: "FLOW_MAIN", unit: "m³/h", sv: 125, variance: 7.2, decimals: 1, color: "#119b70" },
    { key: "dosing_temp_1", label: "Dosing Tank 1 Temperature", tag: "TEMP_DOSING_01", unit: "°C", sv: 58, variance: 3.1, decimals: 1, color: "#8267c7" },
    { key: "dosing_temp_2", label: "Dosing Tank 2 Temperature", tag: "TEMP_DOSING_02", unit: "°C", sv: 43, variance: 2.7, decimals: 1, color: "#d68b05" },
    { key: "dosing_level", label: "Dosing Tank Level", tag: "LEVEL_DOSING", unit: "%", sv: 65, variance: 4.2, decimals: 1, color: "#db6d48" },
  ],
  calator: [
    { key: "overfeed_out", label: "Overfeed Out Speed", tag: "SPD_OF_OUT", unit: "m/min", sv: 29.2, variance: 0.9, decimals: 1, color: "#078eaa" },
    { key: "dancing_roller", label: "Dancing Roller", tag: "POS_DANCER", unit: "%", sv: 50, variance: 4.2, decimals: 1, color: "#4d8fd0" },
    { key: "feeding_speed", label: "Feeding Speed", tag: "SPD_FEED", unit: "m/min", sv: 28.4, variance: 0.8, decimals: 1, color: "#119b70" },
    { key: "squeezing_1", label: "Squeezing 1 Speed", tag: "SPD_SQ_01", unit: "m/min", sv: 28.1, variance: 0.75, decimals: 1, color: "#8267c7" },
    { key: "squeezing_2", label: "Squeezing 2 Speed", tag: "SPD_SQ_02", unit: "m/min", sv: 27.9, variance: 0.75, decimals: 1, color: "#d68b05" },
    { key: "folder_speed", label: "Folder Speed", tag: "SPD_FOLDER", unit: "m/min", sv: 27.6, variance: 0.8, decimals: 1, color: "#db6d48" },
    { key: "plaiter_speed", label: "Plaiter Speed", tag: "SPD_PLAITER", unit: "m/min", sv: 27.4, variance: 0.85, decimals: 1, color: "#217d94" },
  ],
  dryer: [
    { key: "line_speed", label: "Line Speed", tag: "SPD_LINE", unit: "m/min", sv: 29, variance: 1.1, decimals: 1, color: "#078eaa" },
    { key: "chamber_1", label: "Chamber 1 Temperature", tag: "TEMP_CH_01", unit: "°C", sv: 148, variance: 4.5, decimals: 1, color: "#4d8fd0" },
    { key: "chamber_3", label: "Chamber 3 Temperature", tag: "TEMP_CH_03", unit: "°C", sv: 150, variance: 4.8, decimals: 1, color: "#119b70" },
    { key: "chamber_5", label: "Chamber 5 Temperature", tag: "TEMP_CH_05", unit: "°C", sv: 148, variance: 6.2, decimals: 1, color: "#d68b05" },
    { key: "chamber_7", label: "Chamber 7 Temperature", tag: "TEMP_CH_07", unit: "°C", sv: 145, variance: 4.4, decimals: 1, color: "#8267c7" },
    { key: "oil_supply", label: "Thermal Oil Supply", tag: "TEMP_OIL_SUP", unit: "°C", sv: 218, variance: 3.6, decimals: 1, color: "#db6d48" },
  ],
  kalender: [
    { key: "temp_upper", label: "Upper Roll Temperature", tag: "TEMP_UPPER", unit: "°C", sv: 127, variance: 3.2, decimals: 1, color: "#078eaa" },
    { key: "temp_lower", label: "Lower Roll Temperature", tag: "TEMP_LOWER", unit: "°C", sv: 127, variance: 3.0, decimals: 1, color: "#4d8fd0" },
    { key: "overfeed", label: "Overfeed", tag: "OVERFEED", unit: "%", sv: 8.5, variance: 0.65, decimals: 1, color: "#119b70" },
    { key: "load_upper", label: "Loadcell Upper", tag: "LOAD_UPPER", unit: "kg", sv: 480, variance: 24, decimals: 1, color: "#8267c7" },
    { key: "load_lower", label: "Loadcell Lower", tag: "LOAD_LOWER", unit: "kg", sv: 475, variance: 24, decimals: 1, color: "#d68b05" },
    { key: "fabric_width", label: "Fabric Width", tag: "WIDTH_FABRIC", unit: "cm", sv: 181, variance: 1.2, decimals: 1, color: "#db6d48" },
  ],
  chemical: [
    { key: "transfer_flow", label: "Transfer Flow", tag: "FLOW_TRANSFER", unit: "kg/min", sv: 42.8, variance: 3.2, decimals: 1, color: "#078eaa" },
    { key: "target_weight", label: "Batch Weight", tag: "WEIGHT_BATCH", unit: "kg", sv: 128, variance: 4.8, decimals: 1, color: "#4d8fd0" },
    { key: "line_pressure", label: "Line Pressure", tag: "PRESS_LINE", unit: "bar", sv: 3.2, variance: 0.28, decimals: 2, color: "#119b70" },
    { key: "tank_level", label: "Source Tank Level", tag: "LEVEL_SOURCE", unit: "%", sv: 70, variance: 5.4, decimals: 1, color: "#8267c7" },
    { key: "pump_speed", label: "Transfer Pump Speed", tag: "SPD_PUMP", unit: "Hz", sv: 32, variance: 2.4, decimals: 1, color: "#d68b05" },
  ],
};

function selectedBatchFor(type, machine) {
  const selection = state.batchInvestigation[type];
  return selection?.machineId === machine.id ? selection.batch : null;
}

function batchSeed(batch) {
  return [...batch].reduce((total, character, index) => total + character.charCodeAt(0) * (index + 1), 0);
}

function recentBatchHistory(machine) {
  const baseEnd = new Date("2026-08-15T06:40:00+07:00").getTime();
  return Array.from({ length: 18 }, (_, index) => {
    const batch = index === 0 && machine.batch && machine.batch !== "—"
      ? machine.batch
      : historicalBatchFor(machine, index + 1);
    const end = baseEnd - index * 97 * 60 * 1000;
    const start = end - (118 + (batchSeed(batch) % 145)) * 60 * 1000;
    const status = index === 0 && machine.batch === batch ? "Running" : index % 7 === 0 ? "Hold" : "Completed";
    const formatTime = (timestamp) => new Date(timestamp).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false,
    });
    return { batch, start: formatTime(start), end: status === "Running" ? "Now" : formatTime(end), status };
  });
}

function batchInvestigationPanel(type, machine) {
  const selectedBatch = selectedBatchFor(type, machine);
  const recentBatches = recentBatchHistory(machine);
  return `<section class="card batch-investigation-card">
    <div class="batch-investigation-header">
      <div class="batch-investigation-copy"><span class="eyebrow">Batch historian lookup</span><h2>Search Production Batch</h2><p>Masukkan nomor batch untuk memuat trend sensor SV/PV dan abnormality log khusus batch tersebut.</p></div>
      <form class="batch-search-form" data-batch-form="${type}|${machine.id}">
        <label for="batch-search-${type}">Batch number</label>
        <div class="batch-search-row"><input class="search-control batch-search-input" id="batch-search-${type}" data-batch-input="${type}" value="${selectedBatch || ""}" placeholder="Contoh: DB-260814-032" autocomplete="off" maxlength="32"/><button class="button primary" type="submit">Search batch</button>${selectedBatch ? `<button class="button ghost" type="button" data-batch-clear="${type}|${machine.id}">Clear</button>` : ""}</div>
      </form>
    </div>
    <div class="batch-recent-head"><span>Recent batches</span><small>${recentBatches.length} records · scroll untuk melihat lainnya</small></div>
    <div class="batch-recent-table-wrap" tabindex="0" aria-label="Recent batch history ${machine.id}">
      <table class="batch-recent-table"><thead><tr><th>Batch No.</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr></thead><tbody>${recentBatches.map((item) => {
        const tone = item.status === "Completed" ? "good" : item.status === "Hold" ? "warning" : "neutral";
        const isSelected = selectedBatch === item.batch;
        return `<tr class="${isSelected ? "selected" : ""}"><td class="mono"><strong>${item.batch}</strong></td><td class="mono">${item.start}</td><td class="mono">${item.end}</td><td><span class="data-pill ${tone}">${item.status}</span></td><td><button class="batch-load-button ${isSelected ? "loaded" : ""}" type="button" data-batch-suggestion="${type}|${machine.id}|${item.batch}" ${isSelected ? "disabled" : ""}>${isSelected ? "Loaded" : "Load"}</button></td></tr>`;
      }).join("")}</tbody></table>
      </div>
    ${selectedBatch ? `<div class="batch-active-context"><span class="kpi-scope historical">BATCH LOADED</span><strong>${selectedBatch}</strong><small>${machine.id} · trend dan log menggunakan scope batch yang sama</small></div>` : ""}
  </section>`;
}

function batchTrendWorkspace(type, machine) {
  const selectedBatch = selectedBatchFor(type, machine);
  if (selectedBatch) return sensorTrendPanel(type, machine);
  return `<section class="card batch-analysis-empty"><div class="batch-empty-icon">⌕</div><strong>Trend dan log belum dimuat</strong><span>Cari nomor batch di atas untuk menampilkan perbandingan SV/PV dan seluruh abnormal event pada batch tersebut.</span></section>`;
}

function batchAbnormalLog(type, machine) {
  return selectedBatchFor(type, machine) ? abnormalProcessLog(type, machine) : "";
}

function sensorTrendSeries(type, sensor, batch) {
  const count = { "1H": 36, "8H": 48, "24H": 60 }[state.sensorTrend.range] || 36;
  const span = { "1H": 60, "8H": 8 * 60, "24H": 24 * 60 }[state.sensorTrend.range] * 60 * 1000;
  const typePhase = ["jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam", "chemical"].indexOf(type) * 0.43;
  const seed = batchSeed(batch);
  const keyPhase = sensor.key.length * 0.17 + seed % 19 * 0.07;
  const batchEnd = new Date("2026-08-14T14:00:00+07:00").getTime() - seed % 96 * 30 * 60 * 1000;
  const timestamps = Array.from({ length: count }, (_, index) => batchEnd - span + span * index / (count - 1));
  if (type === "jetflow") {
    const program = jetflowProgramForSensor(sensor);
    const sv = timestamps.map((_, index) => {
      const position = index / Math.max(1, count - 1);
      return program.markers.reduce((target, marker) => position >= marker.position ? marker.value : target, program.initial);
    });
    let actual = program.initial - sensor.variance * .18;
    const pv = sv.map((target, index) => {
      const response = index === 0 ? .14 : .2;
      actual += (target - actual) * response;
      actual += Math.sin(index * .54 + keyPhase) * sensor.variance * .08 + Math.cos(index * .21 + keyPhase) * sensor.variance * .035;
      return actual;
    });
    return { timestamps, sv, pv };
  }
  const sv = timestamps.map((_, index) => sensor.sv + (index > count * 0.68 ? sensor.variance * 0.08 : 0));
  const pv = sv.map((target, index) => target + Math.sin(index * 0.44 + typePhase + keyPhase) * sensor.variance * 0.52 + Math.cos(index * 0.17 + keyPhase) * sensor.variance * 0.18);
  return { timestamps, sv, pv };
}

function programTimeLabel(timestamp) {
  return new Date(timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function jetflowTrendProgramOverlay(sensor, series) {
  const program = jetflowProgramForSensor(sensor);
  const enabledProcesses = state.jetflowProgram.enabled;
  const selectedPhases = jetflowProgramSchedule().filter((phase) => enabledProcesses.includes(phase.name));
  const selectedMarkers = program.markers.filter((marker) => enabledProcesses.includes(marker.process));
  const timeAt = (position) => series.timestamps[Math.round(position * (series.timestamps.length - 1))];
  const phases = selectedPhases.map((phase) => `<span class="jetflow-program-phase"><b>Step ${String(phase.step).padStart(2, "0")}</b><strong>${phase.name}</strong><small>${programTimeLabel(timeAt(phase.start))}–${programTimeLabel(timeAt(phase.end))}</small></span>`).join("");
  const markers = selectedMarkers.map((marker) => `<span class="jetflow-sv-marker"><b>${programTimeLabel(timeAt(marker.position))}</b><strong>SV → ${marker.value.toFixed(sensor.decimals)} ${sensor.unit}</strong><small>Step ${String(marker.step).padStart(2, "0")} · ${marker.process}</small></span>`).join("");
  return `<div class="jetflow-program-overlay" aria-label="Program proses dan perubahan SV untuk ${sensor.label}">
    <div class="jetflow-overlay-heading"><span>Selected program overlay</span><small>Process yang dicentang tampil pada seluruh trend sensor.</small></div>
    <div class="jetflow-program-phases">${phases || `<span class="jetflow-overlay-empty">Tidak ada process dipilih.</span>`}</div>
    <div class="jetflow-sv-markers">${markers || `<span class="jetflow-overlay-empty">Tidak ada perubahan SV pada sensor ini di process terpilih.</span>`}</div>
  </div>`;
}

function sensorTrendPanel(type, machine) {
  const sensors = sensorTrendConfig[type] || [];
  const enabled = state.sensorTrend.enabled[type] || [];
  const selectedBatch = selectedBatchFor(type, machine);
  const toggles = sensors.map((sensor) => `<label class="sensor-toggle ${enabled.includes(sensor.key) ? "active" : ""}"><input type="checkbox" data-sensor-toggle="${type}|${sensor.key}" ${enabled.includes(sensor.key) ? "checked" : ""}/><i style="--sensor-color:${sensor.color}"></i><span>${sensor.label}<small>${sensor.tag}</small></span></label>`).join("");
  const processToggles = type === "jetflow" ? jetflowProcessSteps.map((process, index) => `<label class="process-toggle ${state.jetflowProgram.enabled.includes(process) ? "active" : ""}"><input type="checkbox" data-jetflow-process-toggle="${process}" ${state.jetflowProgram.enabled.includes(process) ? "checked" : ""}/><span>Step ${String(index + 1).padStart(2, "0")}</span><strong>${process}</strong></label>`).join("") : "";
  const rows = sensors.filter((sensor) => enabled.includes(sensor.key)).map((sensor) => {
    const series = sensorTrendSeries(type, sensor, selectedBatch);
    const pv = series.pv.at(-1);
    const sv = series.sv.at(-1);
    const delta = pv - sv;
    const programOverlay = type === "jetflow" ? jetflowTrendProgramOverlay(sensor, series) : "";
    return `<article class="sensor-trend-row">
      <div class="sensor-trend-row-head"><div><i style="background:${sensor.color}"></i><span><strong>${sensor.label}</strong><small>${sensor.tag} · ${sensor.unit}</small></span></div><div class="sensor-trend-readings"><span>PV<strong>${pv.toFixed(sensor.decimals)} ${sensor.unit}</strong></span><span>SV<strong>${sv.toFixed(sensor.decimals)} ${sensor.unit}</strong></span><span>Δ<strong class="${Math.abs(delta) > sensor.variance * .55 ? "warning" : ""}">${delta >= 0 ? "+" : ""}${delta.toFixed(sensor.decimals)} ${sensor.unit}</strong></span></div></div>
      <div class="sensor-line-legend"><span><i style="background:${sensor.color}"></i>PV · Process Value</span><span><i style="border-color:${sensor.color}"></i>SV · Set Value</span></div>
      ${programOverlay}
      <canvas class="sensor-trend-canvas" id="sensor-trend-${type}-${sensor.key}" aria-label="Trend PV dan SV ${sensor.label}"></canvas>
    </article>`;
  }).join("");
  const ranges = ["1H", "8H", "24H"].map((range) => `<button class="segment ${state.sensorTrend.range === range ? "active" : ""}" data-sensor-range="${range}">${range}</button>`).join("");
  return `<section class="card sensor-comparison-panel">
    <div class="sensor-comparison-head"><div><span class="eyebrow">Machine sensor historian</span><h2>Sensor SV / PV Comparison</h2><p>${machine.id} · batch ${selectedBatch} · setiap sensor menggunakan skala engineering unit masing-masing.</p></div><div class="sensor-comparison-actions"><span class="data-pill neutral">${selectedBatch}</span><div class="sensor-line-key"><span><i></i>PV solid</span><span><i></i>SV dashed</span></div><div class="segmented">${ranges}</div></div></div>
    <div class="sensor-toggle-toolbar"><div class="sensor-toggle-list">${toggles}</div><div class="sensor-bulk-actions"><button class="button ghost small" data-sensor-bulk="${type}|on">All On</button><button class="button ghost small" data-sensor-bulk="${type}|off">All Off</button></div></div>
    ${type === "jetflow" ? `<div class="process-filter-toolbar"><div class="process-filter-head"><div><strong>Process program filter</strong><small>Pilih process yang ingin ditampilkan pada semua trend sensor.</small></div><div class="sensor-bulk-actions"><button class="button ghost small" data-jetflow-process-bulk="on">All On</button><button class="button ghost small" data-jetflow-process-bulk="off">All Off</button></div></div><div class="process-toggle-list">${processToggles}</div></div>` : ""}
    <div class="sensor-trend-stack">${rows || `<div class="sensor-trend-empty"><strong>Semua sensor dalam kondisi OFF</strong><span>Aktifkan sensor melalui checkbox untuk menampilkan perbandingan trend SV dan PV.</span></div>`}</div>
  </section>`;
}

function selector(items, page) {
  return `
    <select class="select-control" data-machine-select="${page}" aria-label="Pilih mesin">
      ${items.map((m) => `<option value="${m.id}" ${state.selected[page] === m.id ? "selected" : ""}>${m.name}</option>`).join("")}
    </select>
    <button class="button" data-page-target="trends">⌗ Historical</button>
  `;
}

function productionOutputDataset() {
  const datasets = {
    "1H": {
      labels: ["13:05", "13:10", "13:15", "13:20", "13:25", "13:30", "13:35", "13:40", "13:45", "13:50", "13:55", "14:00"],
      values: [142, 158, 166, 171, 182, 175, 188, 194, 201, 196, 209, 216],
      interval: "5 min",
      scope: "Last 1 hour",
      water: 166,
      runtime: 108,
      downtime: 5.4,
      energy: 3.4,
      completedBatches: 4,
    },
    "8H": {
      labels: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00"],
      values: [1960, 2140, 2260, 2380, 2250, 2470, 2580, 2380],
      interval: "hour",
      scope: "Current 8-hour shift",
      water: 1284,
      runtime: 852,
      downtime: 42.6,
      energy: 26.8,
      completedBatches: 31,
    },
    "24H": {
      labels: ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"],
      values: [2940, 2780, 3020, 3240, 3580, 3860, 4010, 4160, 3950, 4210, 4090, 3840],
      interval: "2 hours",
      scope: "Last 24 hours",
      water: 3160,
      runtime: 2498,
      downtime: 126,
      energy: 78.9,
      completedBatches: 88,
    },
    "7D": {
      labels: ["08 Agu", "09 Agu", "10 Agu", "11 Agu", "12 Agu", "13 Agu", "14 Agu"],
      values: [41820, 43680, 42940, 45210, 44780, 46120, 45560],
      interval: "day",
      scope: "Last 7 days",
      water: 22480,
      runtime: 17540,
      downtime: 864,
      energy: 552,
      completedBatches: 612,
    },
  };
  const selected = datasets[state.range] || datasets["8H"];
  const total = selected.values.reduce((sum, value) => sum + value, 0);
  return {
    ...selected,
    total,
    average: total / selected.values.length,
    peak: Math.max(...selected.values),
  };
}

function formatProductionOutput(value) {
  return Number(value).toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function overviewMachineRecords() {
  return Object.keys(processConfig).filter((type) => type !== "chemical").flatMap((type) => fleetFor(type).map((machine) => {
    const seed = [...machine.id].reduce((total, character) => total + character.charCodeAt(0), 0);
    const condition = machine.state === "running" ? "running"
      : machine.state === "warning" ? "problem"
        : machine.state === "fault" ? "fault"
          : seed % 3 === 0 ? "maintenance" : "stopped";
    return { ...machine, type, condition, operating: machine.state === "running" || machine.state === "warning" };
  }));
}

function overviewConditionPill(condition) {
  const labels = { running: "Running", problem: "Problem", fault: "Fault", maintenance: "Maintenance", stopped: "Stopped" };
  const tones = { running: "good", problem: "warning", fault: "danger", maintenance: "neutral", stopped: "neutral" };
  return `<span class="data-pill ${tones[condition]}">${labels[condition]}</span>`;
}

function overviewMachineStatusTable(records, emptyLabel) {
  if (!records.length) return `<div class="empty-state"><strong>${emptyLabel}</strong><span>Tidak ada mesin pada kategori ini.</span></div>`;
  return `<div class="overview-machine-table-wrap"><table class="overview-machine-table"><thead><tr><th>Machine</th><th>Process</th><th>Area / Lane</th><th>Batch</th><th>Condition</th></tr></thead><tbody>${records.map((machine) => `<tr data-machine-target="${machine.type}|${machine.id}" tabindex="0"><td><strong>${machine.id}</strong><small>${machine.name}</small></td><td>${processConfig[machine.type].singular}</td><td>${machine.areaLabel}</td><td class="mono">${machine.batch}</td><td>${overviewConditionPill(machine.condition)}</td></tr>`).join("")}</tbody></table></div>`;
}

function plantManagementSummary(productionOutput, records) {
  const operating = records.filter((machine) => machine.operating);
  const normalRunning = records.filter((machine) => machine.condition === "running").length;
  const problems = records.filter((machine) => machine.condition === "problem").length;
  const faults = records.filter((machine) => machine.condition === "fault").length;
  const maintenance = records.filter((machine) => machine.condition === "maintenance").length;
  const stopped = records.filter((machine) => machine.condition === "stopped").length;
  const attention = records.length - normalRunning;
  const activeBatches = new Set(operating.filter((machine) => machine.batch !== "—").map((machine) => machine.batch)).size;
  const rangeHours = { "1H": 1, "8H": 8, "24H": 24, "7D": 168 }[state.range] || 8;
  const steamConsumption = rangeHours * 11.8;
  const thermalOilConsumption = rangeHours * 105.2;
  return `
    <div class="plant-summary-head"><div><span class="eyebrow">Plant management summary</span><h2>Plant Operations Summary</h2><p>Status live operasi serta ringkasan output, konsumsi, dan completed batch berdasarkan selected time range.</p></div><div class="plant-summary-actions"><span class="quality-pill good">Simulated data</span>${rangeButtons()}</div></div>
    <section class="plant-answer-grid">
      <article class="card plant-answer-card live-answer"><div class="plant-answer-top"><span class="kpi-scope live">LIVE NOW</span><span>01</span></div><h3>Machine Operating Status</h3><div class="plant-answer-value"><strong>${operating.length}</strong><small>/ ${records.length} mesin</small></div><div class="plant-answer-breakdown"><span>${normalRunning} normal</span><span class="warning">${problems} dengan warning</span></div><p>Daftar lengkap tersedia tepat di bawah.</p></article>
      <article class="card plant-answer-card danger-answer"><div class="plant-answer-top"><span class="kpi-scope live">LIVE NOW</span><span>02</span></div><h3>Machine Attention Status</h3><div class="plant-answer-value"><strong>${attention}</strong><small>perlu diketahui</small></div><div class="plant-answer-breakdown compact"><span>${stopped} stop</span><span>${maintenance} maintenance</span><span class="warning">${problems} problem</span><span class="danger">${faults} fault</span></div><p>Warning dapat terjadi saat mesin masih running.</p></article>
      <article class="card plant-answer-card"><div class="plant-answer-top"><span class="kpi-scope historical">SELECTED RANGE</span><span>03</span></div><h3>Total Production Output</h3><div class="plant-answer-value"><strong>${formatProductionOutput(productionOutput.total)}</strong><small>m good fabric</small></div><div class="plant-answer-breakdown"><span>Avg ${formatProductionOutput(productionOutput.average)} m / ${productionOutput.interval}</span><span>Peak ${formatProductionOutput(productionOutput.peak)} m</span></div><p>${state.range} · ${productionOutput.scope}</p></article>
      <article class="card plant-answer-card utility-live-answer"><div class="plant-answer-top"><span class="kpi-scope live">LIVE NOW</span><span>04</span></div><h3>Current Utility Usage</h3><div class="plant-answer-value"><strong>3</strong><small>normal · 1 watch</small></div><div class="plant-utility-mini"><span><b>${liveValue(1.84, "MW", .02, 2)}</b>Electrical</span><span><b>${liveValue(184, "m³/h", 1, 0)}</b>Water</span><span class="warning"><b>${liveValue(12.8, "t/h", .09, 1)}</b>Steam · 7.8 bar</span><span><b>${liveValue(218.4, "°C", .2, 1)}</b>Thermal oil</span></div></article>
      <article class="card plant-answer-card utility-total-answer"><div class="plant-answer-top"><span class="kpi-scope historical">SELECTED RANGE</span><span>05</span></div><h3>Total Utility Consumption</h3><div class="plant-utility-total-grid"><span><b>${formatManagementValue(productionOutput.energy, "MWh")} MWh</b>Electrical energy</span><span><b>${formatProductionOutput(productionOutput.water)} m³</b>Water</span><span><b>${formatManagementValue(steamConsumption, "ton")} ton</b>Steam</span><span><b>${formatManagementValue(thermalOilConsumption, "GJ")} GJ</b>Thermal oil</span></div><p>${state.range} · seluruh total mengikuti periode yang sama.</p></article>
      <article class="card plant-answer-card live-answer"><div class="plant-answer-top"><span class="kpi-scope live">LIVE NOW</span><span>06</span></div><h3>Batches In Process</h3><div class="plant-answer-value"><strong>${activeBatches}</strong><small>batch aktif</small></div><div class="plant-answer-breakdown"><span>${operating.length} active process runs</span></div><p>Dihitung sebagai batch number unik pada mesin aktif.</p></article>
      <article class="card plant-answer-card"><div class="plant-answer-top"><span class="kpi-scope historical">SELECTED RANGE</span><span>07</span></div><h3>Completed Batches</h3><div class="plant-answer-value"><strong>${productionOutput.completedBatches}</strong><small>batch selesai</small></div><div class="plant-answer-breakdown"><span>${state.range} · ${productionOutput.scope}</span></div><p>Completion mengikuti boundary batch historian.</p></article>
    </section>
  `;
}
