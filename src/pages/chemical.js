// ============================================================================
// Page: Chemical Processing & Dispensing
// ============================================================================

function actualChemicalPage() {
  const preserveTransactionAnchor = chemicalAnalytics.data ? ".chemical-transaction-panel" : null;
  requestChemicalAnalytics({ preserveAnchor: preserveTransactionAnchor });
  const query = chemicalAnalyticsQuery();
  const fresh = chemicalAnalytics.dataKey === query.key;
  const machine = dispensers.find((item) => item.id === state.drill.chemical.machine) || null;
  const actions = machine ? `<button class="button" data-chemical-view="overview">← All dispensing units</button><span class="range-badge">LIVE DATA</span>` : `<span class="range-badge">LIVE DATA</span>`;
  const header = `${machine ? `<div class="process-breadcrumb"><button data-chemical-view="overview">Chemical Processing</button><span>›</span><strong>${actualText(machine.id)}</strong></div>` : ""}${pageHead("chemical", actions)}`;
  if (chemicalAnalytics.error && !chemicalAnalytics.data) return `${header}${chemicalFilterPanel(chemicalAnalytics.data, machine)}${panel("Chemical analytics unavailable", "Data transaksi tetap aman di PostgreSQL", actualEmpty(chemicalAnalytics.error))}`;
  if (!fresh && !chemicalAnalytics.data) return `${header}${chemicalFilterPanel(chemicalAnalytics.data, machine)}${panel("Loading Chemical Consumption", "Menghitung agregasi dan transaksi sesuai filter", `<div class="actual-historian-loading">Loading consumption, mode, emergency, dan transaction page…</div>`)}`;
  const data = chemicalAnalytics.data;
  const summary = data.summary || {};
  return `${header}
    ${machine ? chemicalUnitHeader(machine, data) : ""}
    ${chemicalFilterPanel(data, machine)}
    <section class="chemical-kpi-grid">${actualMetric("Total Consumption", chemicalNumber(summary.total_kg, 2), "kg", "actual_kg · selected range")}${actualMetric("Transactions", chemicalNumber(summary.transaction_count, 0), "rows", "Automatic + Manual + Emergency")}${actualMetric("Average Weight", chemicalNumber(summary.average_kg, 2), "kg", "average completed weighing")}${actualMetric("Maximum Weight", chemicalNumber(summary.maximum_kg, 2), "kg", "highest weighing in range")}${actualMetric("Emergency Events", chemicalNumber(summary.emergency_count, 0), "events", "emergency source records")}</section>
    ${machine ? chemicalDispensingPidPanel(machine) : chemicalUnitOverview(data)}
    ${chemicalModeSummary(data)}
    ${chemicalConsumptionChartPanel(data)}
    ${chemicalVariantSummaryPanel(data)}
    ${chemicalTransactionPanel(data)}
  `;
}
