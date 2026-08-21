import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";

const validModes = new Set(["Automatic", "Manual", "Emergency"]);
const pageSizes = new Set([25, 50, 100]);

function dateRange(from?: string, to?: string) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 30 * 24 * 60 * 60_000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    throw new BadRequestException("from dan to harus berupa ISO date yang valid.");
  }
  return { start, end };
}

function filterClause(
  start: Date,
  end: Date,
  dispenserId?: string,
  mode?: string,
  chemicalCode?: string,
) {
  const values: unknown[] = [start.toISOString(), end.toISOString()];
  const conditions = ["occurred_at >= $1", "occurred_at <= $2"];
  if (dispenserId && dispenserId !== "all") {
    values.push(dispenserId);
    conditions.push(`dispenser_id = $${values.length}`);
  }
  if (mode && mode !== "all") {
    if (!validModes.has(mode)) throw new BadRequestException("mode harus Automatic, Manual, atau Emergency.");
    values.push(mode);
    conditions.push(`mode = $${values.length}`);
  }
  if (chemicalCode && chemicalCode !== "all") {
    values.push(chemicalCode);
    conditions.push(`chemical_code = $${values.length}`);
  }
  return { sql: conditions.join(" AND "), values };
}

function granularityFor(start: Date, end: Date) {
  const hours = (end.getTime() - start.getTime()) / 3_600_000;
  if (hours <= 48) return "hour";
  if (hours <= 24 * 120) return "day";
  if (hours <= 24 * 730) return "week";
  return "month";
}

@Controller("api/v1/chemical")
export class ChemicalController {
  constructor(private readonly database: DatabaseService) {}

  @Get("analytics")
  async analytics(
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("dispenser_id") dispenserId?: string,
    @Query("chemical_code") chemicalCode?: string,
    @Query("mode") mode?: string,
    @Query("page") rawPage?: string,
    @Query("page_size") rawPageSize?: string,
  ) {
    const { start, end } = dateRange(from, to);
    const page = Math.max(1, Number.parseInt(rawPage || "1", 10) || 1);
    const requestedPageSize = Number.parseInt(rawPageSize || "25", 10) || 25;
    const pageSize = pageSizes.has(requestedPageSize) ? requestedPageSize : 25;
    const offset = (page - 1) * pageSize;
    const selected = filterClause(start, end, dispenserId, mode, chemicalCode);
    const scope = filterClause(start, end, dispenserId, mode);
    const granularity = granularityFor(start, end);

    const [summary, units, variants, availableChemicals, timeSeries, total, transactions] = await Promise.all([
      this.database.query(`
        SELECT
          COUNT(*)::int AS transaction_count,
          COUNT(*) FILTER (WHERE mode = 'Automatic')::int AS automatic_count,
          COUNT(*) FILTER (WHERE mode = 'Manual')::int AS manual_count,
          COUNT(*) FILTER (WHERE mode = 'Emergency')::int AS emergency_count,
          COALESCE(SUM(actual_kg), 0) AS total_kg,
          AVG(actual_kg) AS average_kg,
          MIN(actual_kg) AS minimum_kg,
          MAX(actual_kg) AS maximum_kg,
          MAX(occurred_at) AS last_transaction_at
        FROM chemical_transaction
        WHERE ${selected.sql}
      `, selected.values),
      this.database.query(`
        WITH filtered AS (
          SELECT * FROM chemical_transaction WHERE ${selected.sql}
        ), unit_totals AS (
          SELECT dispenser_id,
            COUNT(*)::int AS transaction_count,
            COUNT(*) FILTER (WHERE mode = 'Automatic')::int AS automatic_count,
            COUNT(*) FILTER (WHERE mode = 'Manual')::int AS manual_count,
            COUNT(*) FILTER (WHERE mode = 'Emergency')::int AS emergency_count,
            COALESCE(SUM(actual_kg), 0) AS total_kg,
            MAX(occurred_at) AS last_transaction_at
          FROM filtered GROUP BY dispenser_id
        ), chemical_totals AS (
          SELECT dispenser_id, chemical_code,
            (ARRAY_AGG(chemical_name ORDER BY occurred_at DESC))[1] AS chemical_name,
            COALESCE(SUM(actual_kg), 0) AS total_kg
          FROM filtered WHERE actual_kg IS NOT NULL
          GROUP BY dispenser_id, chemical_code
        ), ranked AS (
          SELECT *, ROW_NUMBER() OVER (PARTITION BY dispenser_id ORDER BY total_kg DESC) AS rank
          FROM chemical_totals
        )
        SELECT u.*, r.chemical_code AS top_chemical_code,
          r.chemical_name AS top_chemical_name, r.total_kg AS top_chemical_kg
        FROM unit_totals u
        LEFT JOIN ranked r ON r.dispenser_id = u.dispenser_id AND r.rank = 1
        ORDER BY u.dispenser_id
      `, selected.values),
      this.database.query(`
        SELECT chemical_code,
          (ARRAY_AGG(chemical_name ORDER BY occurred_at DESC))[1] AS chemical_name,
          COUNT(*)::int AS transaction_count,
          COALESCE(SUM(actual_kg), 0) AS total_kg,
          AVG(actual_kg) AS average_kg,
          MIN(actual_kg) AS minimum_kg,
          MAX(actual_kg) AS maximum_kg
        FROM chemical_transaction
        WHERE ${selected.sql} AND actual_kg IS NOT NULL
        GROUP BY chemical_code
        ORDER BY total_kg DESC
      `, selected.values),
      this.database.query(`
        SELECT chemical_code,
          (ARRAY_AGG(chemical_name ORDER BY occurred_at DESC))[1] AS chemical_name
        FROM chemical_transaction
        WHERE ${scope.sql} AND actual_kg IS NOT NULL
        GROUP BY chemical_code
        ORDER BY chemical_code
      `, scope.values),
      this.database.query(`
        SELECT TO_CHAR(DATE_TRUNC('${granularity}', occurred_at AT TIME ZONE 'Asia/Jakarta'), 'YYYY-MM-DD"T"HH24:MI:SS') AS bucket,
          chemical_code, COALESCE(SUM(actual_kg), 0) AS total_kg, COUNT(*)::int AS transaction_count
        FROM chemical_transaction
        WHERE ${selected.sql} AND actual_kg IS NOT NULL
        GROUP BY bucket, chemical_code
        ORDER BY bucket, chemical_code
      `, selected.values),
      this.database.query(`SELECT COUNT(*)::int AS count FROM chemical_transaction WHERE ${selected.sql}`, selected.values),
      this.database.query(`
        SELECT transaction_id, request_code, dispenser_id, calator_id, chemical_code, chemical_name,
          target_kg, actual_kg, mode, status, operator_name, stage, occurred_at,
          started_at, ended_at, source_system, source_file, source_row_id,
          raw_payload->>'emergency_state' AS emergency_state,
          raw_payload->>'auto_state' AS auto_state,
          CASE WHEN ended_at IS NOT NULL AND started_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (ended_at - started_at))::int ELSE NULL END AS duration_seconds
        FROM chemical_transaction
        WHERE ${selected.sql}
        ORDER BY occurred_at DESC, transaction_id DESC
        LIMIT $${selected.values.length + 1} OFFSET $${selected.values.length + 2}
      `, [...selected.values, pageSize, offset]),
    ]);

    const rowCount = Number(total.rows[0]?.count || 0);
    return {
      data_mode: "ACTUAL_DATABASE",
      range: { from: start.toISOString(), to: end.toISOString(), granularity },
      filters: { dispenser_id: dispenserId || "all", chemical_code: chemicalCode || "all", mode: mode || "all" },
      summary: summary.rows[0],
      units: units.rows,
      variants: variants.rows,
      available_chemicals: availableChemicals.rows,
      time_series: timeSeries.rows,
      transactions: transactions.rows,
      pagination: {
        page,
        page_size: pageSize,
        total_rows: rowCount,
        total_pages: Math.max(1, Math.ceil(rowCount / pageSize)),
      },
    };
  }
}
