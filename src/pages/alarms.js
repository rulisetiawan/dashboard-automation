// ============================================================================
// Page: Alarms & Events Management
// ============================================================================

function actualAlarmTable(events, emptyLabel) {
  if (!events.length) return actualEmpty(emptyLabel);
  return `<div class="table-wrap active-alarm-table-wrap"><table class="data-table active-alarm-table"><thead><tr><th>Time</th><th>Severity</th><th>Area</th><th>Asset</th><th>Batch</th><th>Alarm condition</th><th>Trigger / Limit</th><th>State</th><th>Action</th></tr></thead><tbody>${events.map((item) => {
    const asset = actualFleet().find((machine) => machine.id === item.asset_id);
    const severity = String(item.severity || "WARNING").toLowerCase();
    const assetLabel = asset ? `<button class="alarm-asset-link" type="button" data-machine-target="${actualText(asset.process)}|${actualText(asset.id)}">${actualText(item.asset_id)}</button>` : actualText(item.asset_id);
    return `<tr class="alarm-condition-row ${severity}"><td class="mono">${actualTime(item.occurred_at)}</td><td><span class="data-pill ${severity === "critical" ? "danger" : severity === "warning" ? "warning" : "neutral"}">${actualText(item.severity)}</span></td><td>${actualText(item.area_code || "—")}</td><td>${assetLabel}</td><td>${actualText(item.batch_no || "—")}</td><td><strong>${actualText(item.title)}</strong><br><small>${actualText(item.detail)}</small>${item.recommendation ? `<small class="alarm-recommendation">Action: ${actualText(item.recommendation)}</small>` : ""}</td><td class="mono">${item.trigger_value == null ? "—" : `${actualText(Number(item.trigger_value).toLocaleString("id-ID", { maximumFractionDigits: 2 }))} / ${actualText(Number(item.threshold_value).toLocaleString("id-ID", { maximumFractionDigits: 2 }))}`}</td><td><span class="data-pill ${item.event_state === "CLEARED" ? "good" : "warning"}">${actualText(item.event_state)}</span></td><td>${item.acknowledged_at ? `<span class="data-pill neutral">ACK</span><small>${actualText(item.acknowledged_by || "Operator")}</small>` : item.event_state !== "CLEARED" ? `<button class="button small" data-alarm-event-ack="${actualText(item.alarm_event_id)}">Acknowledge</button>` : "—"}</td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function actualAlarmsPage() {
  const scopedEvents = backendAlarmEvents.filter((item) => state.alarms.area === "all" || item.area_code === state.alarms.area);
  const scopedActiveEvents = backendActiveAlarmEvents.filter((item) => state.alarms.area === "all" || item.area_code === state.alarms.area);
  const content = actualAlarmTable(scopedEvents, "Belum ada event alarm aktual");
  const activeContent = actualAlarmTable(scopedActiveEvents, "Tidak ada alarm aktif pada scope ini");
  const areaGroups = new Map();
  backendAlarmEvents.forEach((event) => {
    const key = event.area_code || "UNMAPPED";
    const group = areaGroups.get(key) || { key, label: key, value: 0 };
    group.value += 1;
    areaGroups.set(key, group);
  });
  const assetGroups = new Map();
  scopedEvents.forEach((event) => assetGroups.set(event.asset_id, (assetGroups.get(event.asset_id) || 0) + 1));
  const rankedAssets = [...assetGroups].sort((left, right) => right[1] - left[1]);
  const ranking = rankedAssets.length ? `<div class="ranking-list">${rankedAssets.map(([assetId, count], index) => { const asset = actualFleet().find((item) => item.id === assetId); return `<button class="ranking-row" ${asset ? `data-machine-target="${asset.process}|${asset.id}"` : ""}><span class="ranking-number">${index + 1}</span><span class="ranking-copy"><strong>${actualText(assetId)}</strong><small>${actualText(asset?.areaLabel || "Area belum dimapping")}</small><i><b style="width:${count / rankedAssets[0][1] * 100}%"></b></i></span><span class="ranking-value">${count}<small>events</small></span></button>`; }).join("")}</div>` : actualEmpty("Tidak ada alarm pada area terpilih.");
  const active = backendActiveAlarmEvents.length;
  const critical = backendActiveAlarmEvents.filter((item) => String(item.severity).toLowerCase() === "critical").length;
  return `${pageHead("alarms", `<button class="button ghost" data-alarm-config-jump>Configure alarm</button><span class="range-badge">LIVE DATA</span>`)}
    <section class="kpi-grid">${actualMetric("Active alarms", active, "events", "tetap dihitung meskipun sudah ACK")}${actualMetric("Critical active", critical, "events", "popup persisten sampai kondisi clear")}${actualMetric("Affected machines", new Set(backendActiveAlarmEvents.map((item) => item.asset_id)).size, "asset", "mesin dengan alarm aktif")}${actualMetric("Alarm records", backendAlarmEvents.length, "rows", "Recent alarm history")}</section>
    <section id="active-alarm-conditions" class="active-alarm-section">${panel("Active Alarm Conditions", "Kondisi yang masih aktif saat ini. Acknowledge tidak menghapus alarm; event selesai ketika nilai kembali sesuai rule dan hysteresis.", activeContent, `<span class="range-badge ${critical ? "critical" : ""}">${scopedActiveEvents.length} ACTIVE</span>`)}</section>
    <section class="management-analysis-grid">${panel("Alarm Distribution by Area", "Klik segmen untuk memfilter ranking dan log alarm.", actualDonutMarkup([...areaGroups.values()].map((item) => ({ ...item, key: item.key, selected: item.key === state.alarms.area })), "alarm events", "events", "data-alarm-downtime-area"), state.alarms.area !== "all" ? `<button class="button ghost small" data-alarm-downtime-area="all">All areas</button>` : `<span class="data-pill good">ACTUAL</span>`)}${panel(`Top Affected Machines${state.alarms.area !== "all" ? ` · ${actualText(state.alarms.area)}` : ""}`, "Ranking jumlah alarm aktual; durasi downtime ditampilkan setelah event clear/downtime mapping tersedia.", ranking)}</section>
    ${panel("Alarm & Event History", "Event terbaru, termasuk alarm yang sudah clear", content)}
    <div class="alarm-configuration-bottom" id="alarm-configuration-bottom">${alarmRuleConfigPanel()}</div>
  `;
}
