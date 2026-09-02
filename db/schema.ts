// Baseline schema D1 untuk integrasi read-only non-Jetflow.
// Migration deployable tercatat pada drizzle/0000_non_jetflow_backend.sql.
export const nonJetflowTables = [
  "asset",
  "asset_snapshot",
  "tag_definition",
  "telemetry_sample",
  "chemical_transaction",
  "utility_snapshot",
  "solar_fueling_transaction",
  "solar_stock_config",
  "solar_stock_movement",
  "solar_stock_opname",
  "solar_audit_event",
] as const;
