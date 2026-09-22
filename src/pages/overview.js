// ============================================================================
// Page: Plant Overview & Live Operations
// ============================================================================

function actualOverviewPage() {
  const assets = actualFleet();
  const running = assets.filter((asset) => asset.state === "running").length;
  const stopped = assets.filter((asset) => ["idle", "fault", "offline"].includes(asset.state)).length;
  const batches = new Set(assets.map((asset) => asset.batch).filter((batch) => batch && batch !== "—")).size;
  const faults = assets.filter((asset) => asset.state === "fault").length;
  const utilities = backendUtilities.length
    ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Utility</th><th>Value</th><th>Source time</th><th>Quality</th></tr></thead><tbody>${backendUtilities.map((item) => `<tr><td>${actualText(item.label)}</td><td><strong>${actualText(item.value)} ${actualText(item.unit)}</strong></td><td class="mono">${actualTime(item.source_ts)}</td><td>${actualText(item.quality)}</td></tr>`).join("")}</tbody></table></div>`
    : actualEmpty("Belum ada snapshot utilitas");
  return `${pageHead("overview", `<span class="range-badge">LIVE DATA</span>`)}
    <section class="kpi-grid">
      ${actualMetric("Registered machines", assets.length, "asset", "asset + snapshot aktual")}
      ${actualMetric("Machine running", running, "asset", "machine_state = running")}
      ${actualMetric("Stop / fault / offline", stopped, "asset", `${faults} fault`) }
      ${actualMetric("Active batches", batches, "batch", "batch pada snapshot mesin")}
    </section>
    ${panel("Machine status", "Current operating condition", actualAssetTable(assets))}
    ${panel("Current utility usage", "Latest utility readings", utilities)}
  `;
}
