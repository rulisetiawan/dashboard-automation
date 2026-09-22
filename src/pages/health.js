// ============================================================================
// Page: Data Health & Telemetry Quality
// ============================================================================

function actualHealthPage() {
  const assets = actualFleet();
  return `${pageHead("health", `<span class="range-badge">ACTUAL DATABASE</span>`)}<section class="grid-equal">${panel("Integration health", "Koneksi aktual", `<div class="definition-list"><div><span>Database</span><strong>${actualText(backendConnection.storage || "—")}</strong></div><div><span>REST API</span><strong>${actualText(backendConnection.status)}</strong></div><div><span>WebSocket</span><strong>${actualText(backendConnection.realtime)}</strong></div><div><span>Last sync</span><strong>${actualTime(backendConnection.lastSync)}</strong></div></div>`)}${panel("Actual record coverage", "Record yang sudah tersedia", `<div class="definition-list"><div><span>Assets</span><strong>${assets.length}</strong></div><div><span>Telemetry samples loaded</span><strong>${backendTelemetry.length}</strong></div><div><span>Alarm events loaded</span><strong>${backendAlarmEvents.length}</strong></div><div><span>Chemical transactions loaded</span><strong>${chemicalDispensingLogs.length}</strong></div></div>`)}</section>`;
}

function databaseSnapshotMetrics(machine, limit = 4) {
  return Object.entries(machine.values || {})
    .filter(([key]) => !["source", "note"].includes(key))
    .slice(0, limit)
    .map(([key, value]) => {
      const normalizedKey = key.toUpperCase();
      const tag = backendTelemetry.find((item) => item.asset_id === machine.id && String(item.signal_role || "").replace(/[._]/g, "_") === normalizedKey);
      return { label: actualLabel(key), value: actualMeasuredValue(value), unit: tag?.engineering_unit || "" };
    });
}
