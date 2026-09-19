import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";

type ShiftCode = "A" | "B" | "C";

const jakartaOffsetMs = 7 * 60 * 60 * 1000;
const shiftHours: Record<ShiftCode, number> = { A: 7, B: 15, C: 23 };
const productionProcesses = ["jetflow", "calator", "dryer", "kalender", "continuous", "inspecting", "finishing", "setting_dongnam"];
const validProcesses = new Set(productionProcesses);

function jakartaParts(date: Date) {
  const local = new Date(date.getTime() + jakartaOffsetMs);
  return { year: local.getUTCFullYear(), month: local.getUTCMonth(), day: local.getUTCDate(), hour: local.getUTCHours() };
}

function jakartaDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

function currentShift(now: Date) {
  const parts = jakartaParts(now);
  if (parts.hour >= 23) return { productionDate: jakartaDate(parts.year, parts.month, parts.day), shiftCode: "C" as ShiftCode };
  if (parts.hour >= 15) return { productionDate: jakartaDate(parts.year, parts.month, parts.day), shiftCode: "B" as ShiftCode };
  if (parts.hour >= 7) return { productionDate: jakartaDate(parts.year, parts.month, parts.day), shiftCode: "A" as ShiftCode };
  return { productionDate: jakartaDate(parts.year, parts.month, parts.day - 1), shiftCode: "C" as ShiftCode };
}

function parseProductionDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new BadRequestException("production_date harus berformat YYYY-MM-DD.");
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) throw new BadRequestException("production_date tidak valid.");
  return { year, month, day };
}

function productionShiftRange(now: Date, productionDate?: string, rawShiftCode?: string) {
  if (Boolean(productionDate) !== Boolean(rawShiftCode)) throw new BadRequestException("production_date dan shift_code harus dikirim bersama.");
  const current = currentShift(now);
  const selectedDate = productionDate || current.productionDate;
  const shiftCode = String(rawShiftCode || current.shiftCode).toUpperCase() as ShiftCode;
  if (!(shiftCode in shiftHours)) throw new BadRequestException("shift_code harus A, B, atau C.");
  const parts = parseProductionDate(selectedDate);
  const from = new Date(Date.UTC(parts.year, parts.month, parts.day, shiftHours[shiftCode]) - jakartaOffsetMs);
  const shiftEnd = new Date(from.getTime() + 8 * 60 * 60 * 1000);
  if (from > now) throw new BadRequestException("Shift terpilih belum dimulai.");
  const to = now < shiftEnd ? now : shiftEnd;
  return { from, to, production_date: selectedDate, shift_code: shiftCode, timezone: "Asia/Jakarta", complete: now >= shiftEnd };
}

@Controller("api/v1/production")
export class ProductionOutputController {
  constructor(private readonly database: DatabaseService) {}

  @Get("output-by-batch")
  async outputByBatch(
    @Query("production_date") productionDate?: string,
    @Query("shift_code") shiftCode?: string,
    @Query("process_type") rawProcessType = "kalender",
  ) {
    const processType = rawProcessType.toLowerCase();
    if (!validProcesses.has(processType)) throw new BadRequestException(`process_type harus salah satu dari: ${productionProcesses.join(", ")}.`);
    const range = productionShiftRange(new Date(), productionDate, shiftCode);
    const result = await this.database.query(`
      WITH ranked_runs AS (
        SELECT
          r.*,
          ROW_NUMBER() OVER (
            PARTITION BY r.asset_id, r.batch_no
            ORDER BY r.source_updated_at DESC NULLS LAST, r.updated_at DESC, r.started_at DESC NULLS LAST
          ) AS latest_rank
        FROM batch_process_run r
        WHERE LOWER(r.process_type) = ANY($3::text[])
      ), scoped_runs AS (
        SELECT
          r.process_run_id,
          r.batch_no,
          r.asset_id,
          LOWER(r.process_type) AS process_type,
          r.run_status,
          CASE WHEN r.started_at >= $1::timestamptz THEN r.output_quantity END AS output_quantity,
          r.output_unit,
          r.started_at,
          r.ended_at,
          GREATEST(r.started_at, $1::timestamptz) AS range_start,
          LEAST(COALESCE(r.ended_at, $2::timestamptz), $2::timestamptz) AS range_end
        FROM ranked_runs r
        WHERE r.latest_rank = 1
          AND r.started_at IS NOT NULL
          AND r.started_at < $2::timestamptz
          AND COALESCE(r.ended_at, $2::timestamptz) > $1::timestamptz
      ), totalizer_candidates AS (
        SELECT
          run.process_run_id,
          definition.tag_code,
          MAX(sample.value_number) - MIN(sample.value_number) AS actual_output,
          COUNT(*)::int AS sample_count,
          ROW_NUMBER() OVER (
            PARTITION BY run.process_run_id
            ORDER BY COUNT(*) DESC, definition.tag_code
          ) AS candidate_rank
        FROM scoped_runs run
        JOIN tag_definition definition
          ON definition.asset_id = run.asset_id
         AND definition.active = TRUE
         AND UPPER(definition.signal_role) LIKE '%OUTPUT%TOTAL%'
         AND LOWER(COALESCE(definition.engineering_unit, 'm')) IN ('m', 'meter', 'metre')
        JOIN telemetry_sample sample
          ON sample.asset_id = definition.asset_id
         AND sample.tag_code = definition.tag_code
         AND sample.source_ts >= run.range_start
         AND sample.source_ts <= run.range_end
         AND sample.quality = 'GOOD'
         AND sample.value_number IS NOT NULL
        GROUP BY run.process_run_id, definition.tag_code
      ), speed_candidates AS (
        SELECT
          run.process_run_id,
          definition.tag_code,
          SUM(aggregate.avg_value) FILTER (
            WHERE aggregate.good_sample_count > 0
              AND aggregate.bad_sample_count = 0
              AND aggregate.avg_value > 0
          ) AS estimated_output,
          COUNT(*) FILTER (
            WHERE aggregate.good_sample_count > 0
              AND aggregate.bad_sample_count = 0
              AND aggregate.avg_value > 0
          )::int AS good_bucket_count,
          COUNT(*)::int AS bucket_count,
          ROW_NUMBER() OVER (
            PARTITION BY run.process_run_id
            ORDER BY
              CASE
                WHEN UPPER(definition.signal_role) LIKE '%MAIN%SPEED%' THEN 1
                WHEN UPPER(definition.signal_role) LIKE '%LINE%SPEED%' THEN 2
                WHEN UPPER(definition.signal_role) LIKE '%UPPER_FELT%SPEED%' THEN 3
                WHEN UPPER(definition.signal_role) LIKE '%FEEDING%SPEED%' THEN 4
                ELSE 5
              END,
              COUNT(*) DESC,
              definition.tag_code
          ) AS candidate_rank
        FROM scoped_runs run
        JOIN tag_definition definition
          ON definition.asset_id = run.asset_id
         AND definition.active = TRUE
         AND UPPER(definition.signal_role) LIKE '%SPEED%PV%'
         AND LOWER(COALESCE(definition.engineering_unit, '')) IN ('m/min', 'm/minute')
        JOIN telemetry_cagg_1m aggregate
          ON aggregate.asset_id = definition.asset_id
         AND aggregate.tag_code = definition.tag_code
         AND aggregate.bucket_start >= date_trunc('minute', run.range_start)
         AND aggregate.bucket_start <= date_trunc('minute', run.range_end)
        GROUP BY run.process_run_id, definition.tag_code, definition.signal_role
      )
      SELECT
        run.*,
        totalizer.tag_code AS totalizer_tag_code,
        CASE WHEN totalizer.sample_count > 1 THEN totalizer.actual_output END AS totalizer_output,
        speed.tag_code AS speed_tag_code,
        CASE WHEN speed.good_bucket_count > 0 THEN speed.estimated_output END AS estimated_output,
        COALESCE(speed.good_bucket_count, 0)::int AS good_bucket_count,
        COALESCE(speed.bucket_count, 0)::int AS bucket_count
      FROM scoped_runs run
      LEFT JOIN totalizer_candidates totalizer
        ON totalizer.process_run_id = run.process_run_id
       AND totalizer.candidate_rank = 1
      LEFT JOIN speed_candidates speed
        ON speed.process_run_id = run.process_run_id
       AND speed.candidate_rank = 1
      ORDER BY run.process_type, run.started_at DESC, run.batch_no
    `, [range.from, range.to, productionProcesses]);

    const grouped = new Map<string, any>();
    for (const row of result.rows) {
      const runOutputQuantity = row.output_quantity != null ? Number(row.output_quantity) : null;
      const runTotalizerOutput = row.totalizer_output != null ? Number(row.totalizer_output) : null;
      const runActual = Number.isFinite(runOutputQuantity) && Number(runOutputQuantity) > 0 ? runOutputQuantity
        : Number.isFinite(runTotalizerOutput) && Number(runTotalizerOutput) > 0 ? runTotalizerOutput
          : null;
      const runActualSource = runActual === runOutputQuantity ? "batch_process_run" : runActual === runTotalizerOutput ? row.totalizer_tag_code : null;
      const estimatedCandidate = row.estimated_output != null ? Number(row.estimated_output) : null;
      const runEstimated = Number.isFinite(estimatedCandidate) && Number(estimatedCandidate) > 0 ? estimatedCandidate : null;
      const runEffective = runActual ?? runEstimated;
      const sourceType = runActual != null ? "ACTUAL" : runEstimated != null ? "ESTIMATED" : "NO_DATA";
      const groupKey = `${row.process_type}|${row.batch_no}`;
      const batch = grouped.get(groupKey) || {
        batch_no: row.batch_no,
        process_type: row.process_type,
        actual_value: 0,
        estimated_value: 0,
        effective_value: 0,
        actual_run_count: 0,
        estimated_run_count: 0,
        no_data_run_count: 0,
        run_count: 0,
        sources: new Set<string>(),
        assets: new Set<string>(),
      };
      batch.run_count += 1;
      batch.assets.add(row.asset_id);
      if (runActual != null) {
        batch.actual_value += runActual;
        batch.actual_run_count += 1;
        batch.sources.add(runActualSource);
      }
      if (runEstimated != null) batch.estimated_value += runEstimated;
      if (runEffective != null) batch.effective_value += runEffective;
      if (sourceType === "ESTIMATED") {
        batch.estimated_run_count += 1;
        batch.sources.add(row.speed_tag_code);
      }
      if (sourceType === "NO_DATA") batch.no_data_run_count += 1;
      grouped.set(groupKey, batch);
    }

    const allBatches = [...grouped.values()].map((batch) => ({
      ...batch,
      actual_value: batch.actual_run_count ? batch.actual_value : null,
      estimated_value: batch.estimated_value > 0 ? batch.estimated_value : null,
      effective_value: batch.effective_value > 0 ? batch.effective_value : null,
      effective_source: batch.actual_run_count && batch.estimated_run_count ? "MIXED" : batch.actual_run_count ? "ACTUAL" : batch.estimated_run_count ? "ESTIMATED" : "NO_DATA",
      sources: [...batch.sources].filter(Boolean),
      assets: [...batch.assets],
    })).sort((left, right) => Number(right.effective_value || 0) - Number(left.effective_value || 0));
    const batches = allBatches.filter((batch) => batch.process_type === processType);
    const processTotals = productionProcesses.map((type) => {
      const processBatches = allBatches.filter((batch) => batch.process_type === type);
      return {
        process_type: type,
        batch_count: processBatches.length,
        actual_value: processBatches.reduce((sum, batch) => sum + Number(batch.actual_value || 0), 0),
        estimated_value: processBatches.reduce((sum, batch) => sum + Number(batch.estimated_value || 0), 0),
        effective_value: processBatches.reduce((sum, batch) => sum + Number(batch.effective_value || 0), 0),
        actual_batch_count: processBatches.filter((batch) => batch.actual_run_count > 0).length,
        estimated_batch_count: processBatches.filter((batch) => batch.effective_source === "ESTIMATED" || batch.effective_source === "MIXED").length,
        no_data_batch_count: processBatches.filter((batch) => batch.effective_source === "NO_DATA").length,
      };
    });

    return {
      data_mode: "ACTUAL_DATABASE",
      process_type: processType,
      range,
      unit: "m",
      batches,
      process_totals: processTotals,
      summary: {
        batch_count: batches.length,
        actual_batch_count: batches.filter((batch) => batch.actual_run_count > 0).length,
        estimated_batch_count: batches.filter((batch) => batch.effective_source === "ESTIMATED" || batch.effective_source === "MIXED").length,
        no_data_batch_count: batches.filter((batch) => batch.effective_source === "NO_DATA").length,
      },
    };
  }
}
