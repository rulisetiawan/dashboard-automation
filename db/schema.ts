// Baseline schema D1 untuk integrasi read-only non-Jetflow.
// Migration deployable tercatat pada drizzle/0000_non_jetflow_backend.sql.
export const nonJetflowTables = [
  "asset",
  "asset_snapshot",
  "tag_definition",
  "telemetry_sample",
  "chemical_transaction",
  "utility_snapshot",
] as const;
