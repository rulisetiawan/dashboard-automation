import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";

type SummaryScope = "batch" | "shift" | "today";
type ShiftCode = "A" | "B" | "C";
type SummaryRange = {
  from: Date;
  to: Date;
  label: string;
  production_date?: string;
  shift_code?: ShiftCode;
  timezone?: string;
  complete?: boolean;
};

const jakartaOffsetMs = 7 * 60 * 60 * 1000;
const shiftDefinitions: Record<ShiftCode, { startHour: number; endHour: number }> = {
  A: { startHour: 7, endHour: 15 },
  B: { startHour: 15, endHour: 23 },
  C: { startHour: 23, endHour: 7 },
};

function jakartaParts(date: Date) {
  const local = new Date(date.getTime() + jakartaOffsetMs);
  return {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth(),
    day: local.getUTCDate(),
    hour: local.getUTCHours(),
  };
}

function jakartaTime(year: number, month: number, day: number, hour: number) {
  return new Date(Date.UTC(year, month, day, hour) - jakartaOffsetMs);
}

function todayRange(now: Date) {
  const parts = jakartaParts(now);
  return { from: jakartaTime(parts.year, parts.month, parts.day, 0), to: now, label: "Today · 00.00–now" };
}

function dateKey(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

function parseProductionDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new BadRequestException("production_date harus berformat YYYY-MM-DD.");
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month, day));
  if (candidate.getUTCFullYear() !== year || candidate.getUTCMonth() !== month || candidate.getUTCDate() !== day) {
    throw new BadRequestException("production_date tidak valid.");
  }
  return { year, month, day };
}

function currentShiftSelection(now: Date) {
  const parts = jakartaParts(now);
  if (parts.hour >= 23) return { productionDate: dateKey(parts.year, parts.month, parts.day), shiftCode: "C" as ShiftCode };
  if (parts.hour >= 15) return { productionDate: dateKey(parts.year, parts.month, parts.day), shiftCode: "B" as ShiftCode };
  if (parts.hour >= 7) return { productionDate: dateKey(parts.year, parts.month, parts.day), shiftCode: "A" as ShiftCode };
  return { productionDate: dateKey(parts.year, parts.month, parts.day - 1), shiftCode: "C" as ShiftCode };
}

function shiftRange(now: Date, requestedProductionDate?: string, requestedShiftCode?: string): SummaryRange {
  if (Boolean(requestedProductionDate) !== Boolean(requestedShiftCode)) {
    throw new BadRequestException("production_date dan shift_code harus dikirim bersama.");
  }
  const current = currentShiftSelection(now);
  const productionDate = requestedProductionDate || current.productionDate;
  const shiftCode = String(requestedShiftCode || current.shiftCode).toUpperCase() as ShiftCode;
  const definition = shiftDefinitions[shiftCode];
  if (!definition) throw new BadRequestException("shift_code harus A, B, atau C.");
  const parts = parseProductionDate(productionDate);
  const from = jakartaTime(parts.year, parts.month, parts.day, definition.startHour);
  const shiftEnd = new Date(from.getTime() + 8 * 60 * 60 * 1000);
  if (from > now) throw new BadRequestException("Shift terpilih belum dimulai.");
  const to = now < shiftEnd ? now : shiftEnd;
  return {
    from,
    to,
    label: `Shift ${shiftCode} · ${String(definition.startHour).padStart(2, "0")}.00–${String(definition.endHour).padStart(2, "0")}.00 WIB · Production date ${productionDate}`,
    production_date: productionDate,
    shift_code: shiftCode,
    timezone: "Asia/Jakarta",
    complete: now >= shiftEnd,
  };
}

function peakFamily(signalRole: string) {
  const role = signalRole.toUpperCase();
  if (role.includes("TEMPERATURE") || role.includes("TEMP")) return "temperature";
  if (role.includes("SPEED")) return "speed";
  if (role.includes("DANCER") || role.includes("POSITION")) return "position";
  if (role.includes("LOADCELL") || role.includes("LOAD")) return "loadcell";
  if (role.includes("LEVEL")) return "level";
  if (role.includes("FLOW")) return "flow";
  if (role.includes("WIDTH")) return "width";
  return "parameter";
}

function peakTitle(family: string) {
  return ({ temperature: "Peak Temperature", speed: "Peak Speed", position: "Peak Position", loadcell: "Peak Loadcell", level: "Peak Level", flow: "Peak Flow", width: "Peak Fabric Width", parameter: "Peak Parameter" } as Record<string, string>)[family] || "Peak Parameter";
}

@Controller("api/v1/assets")
export class PerformanceController {
  constructor(private readonly database: DatabaseService) {}

  @Get(":assetId/performance-summary")
  async summary(
    @Param("assetId") assetId: string,
    @Query("scope") rawScope = "shift",
    @Query("process_run_id") processRunId?: string,
    @Query("production_date") productionDate?: string,
    @Query("shift_code") shiftCode?: string,
  ) {
    const scope = rawScope.toLowerCase() as SummaryScope;
    if (!["batch", "shift", "today"].includes(scope)) throw new BadRequestException("scope harus batch, shift, atau today.");

    const asset = await this.database.query("SELECT asset_id, process_type FROM asset WHERE asset_id = $1 AND active = TRUE", [assetId]);
    if (!asset.rows[0]) throw new NotFoundException("asset not found");

    const now = new Date();
    let range: SummaryRange;
    let selectedRun: Record<string, any> | null = null;
    if (scope === "batch") {
      const run = processRunId
        ? await this.database.query("SELECT * FROM batch_process_run WHERE process_run_id = $1 AND asset_id = $2", [processRunId, assetId])
        : await this.database.query("SELECT * FROM batch_process_run WHERE asset_id = $1 ORDER BY started_at DESC NULLS LAST LIMIT 1", [assetId]);
      selectedRun = run.rows[0] || null;
      if (!selectedRun?.started_at) throw new NotFoundException("batch range not found for asset");
      range = {
        from: new Date(selectedRun.started_at),
        to: new Date(selectedRun.ended_at || now),
        label: `Current batch · ${selectedRun.batch_no}`,
      };
    } else {
      range = scope === "today" ? todayRange(now) : shiftRange(now, productionDate, shiftCode);
    }

    const [stateSummary, completedBatches, totalizerOutput, speedOutput, peakSensors, temperatureSpread] = await Promise.all([
      this.database.query(`
        SELECT
          COALESCE(SUM(EXTRACT(EPOCH FROM LEAST(COALESCE(ended_at, $3::timestamptz), $3::timestamptz) - GREATEST(started_at, $2::timestamptz))) FILTER (WHERE LOWER(machine_state) = 'running'), 0)::double precision AS runtime_seconds,
          COALESCE(SUM(EXTRACT(EPOCH FROM LEAST(COALESCE(ended_at, $3::timestamptz), $3::timestamptz) - GREATEST(started_at, $2::timestamptz))), 0)::double precision AS observed_seconds,
          COUNT(*) FILTER (WHERE LOWER(machine_state) IN ('stop', 'stopped', 'fault', 'maintenance'))::int AS stop_count
        FROM machine_state_event
        WHERE asset_id = $1
          AND started_at < $3
          AND COALESCE(ended_at, $3) > $2
      `, [assetId, range.from, range.to]),
      this.database.query(`
        SELECT COUNT(*)::int AS completed_count
        FROM batch_process_run
        WHERE asset_id = $1
          AND UPPER(run_status) = 'COMPLETED'
          AND ended_at >= $2
          AND ended_at <= $3
      `, [assetId, range.from, range.to]),
      this.database.query(`
        SELECT d.tag_code, d.signal_role, d.engineering_unit,
          MAX(s.value_number) - MIN(s.value_number) AS output_value,
          COUNT(s.value_number)::int AS sample_count
        FROM tag_definition d
        JOIN telemetry_sample s ON s.tag_code = d.tag_code AND s.asset_id = d.asset_id
        WHERE d.asset_id = $1
          AND d.active = TRUE
          AND UPPER(d.signal_role) LIKE '%OUTPUT%TOTAL%'
          AND s.source_ts >= $2 AND s.source_ts <= $3
          AND s.value_number IS NOT NULL
        GROUP BY d.tag_code, d.signal_role, d.engineering_unit
        ORDER BY sample_count DESC
        LIMIT 1
      `, [assetId, range.from, range.to]),
      this.database.query(`
        SELECT d.tag_code, d.signal_role, d.engineering_unit,
          SUM(a.avg_value) AS output_value,
          COUNT(*)::int AS bucket_count
        FROM tag_definition d
        JOIN telemetry_cagg_1m a ON a.tag_code = d.tag_code AND a.asset_id = d.asset_id
        WHERE d.asset_id = $1
          AND d.active = TRUE
          AND UPPER(d.signal_role) LIKE '%SPEED%PV%'
          AND COALESCE(d.engineering_unit, '') IN ('m/min', 'm/minute')
          AND a.bucket_start >= date_trunc('minute', $2::timestamptz)
          AND a.bucket_start <= date_trunc('minute', $3::timestamptz)
        GROUP BY d.tag_code, d.signal_role, d.engineering_unit
        ORDER BY
          CASE
            WHEN UPPER(d.signal_role) LIKE '%MAIN%SPEED%' THEN 1
            WHEN UPPER(d.signal_role) LIKE '%LINE%SPEED%' THEN 2
            WHEN UPPER(d.signal_role) LIKE '%UPPER_FELT%SPEED%' THEN 3
            WHEN UPPER(d.signal_role) LIKE '%FEEDING%SPEED%' THEN 4
            ELSE 5
          END,
          bucket_count DESC
        LIMIT 1
      `, [assetId, range.from, range.to]),
      this.database.query(`
        WITH snapshot_keys AS (
          SELECT regexp_replace(UPPER(key), '[^A-Z0-9]+', '_', 'g') AS normalized_key
          FROM asset_snapshot snapshot,
          LATERAL jsonb_object_keys(snapshot.values_json) AS keys(key)
          WHERE snapshot.asset_id = $1
        ), ranked AS (
          SELECT
            d.tag_code,
            d.signal_role,
            d.engineering_unit,
            s.value_number AS peak_value,
            s.source_ts AS peak_at,
            COUNT(*) OVER (PARTITION BY d.tag_code)::int AS sample_count,
            EXISTS (
              SELECT 1 FROM snapshot_keys k
              WHERE k.normalized_key = regexp_replace(UPPER(d.signal_role), '[^A-Z0-9]+', '_', 'g')
            ) AS snapshot_match,
            ROW_NUMBER() OVER (PARTITION BY d.tag_code ORDER BY s.value_number DESC, s.source_ts) AS peak_rank
          FROM tag_definition d
          JOIN telemetry_sample s ON s.tag_code = d.tag_code AND s.asset_id = d.asset_id
          WHERE d.asset_id = $1
            AND d.active = TRUE
            AND UPPER(d.signal_role) LIKE '%PV%'
            AND d.engineering_unit IS NOT NULL
            AND s.source_ts >= $2 AND s.source_ts <= $3
            AND s.value_number IS NOT NULL
        )
        SELECT tag_code, signal_role, engineering_unit, peak_value, peak_at, sample_count, snapshot_match
        FROM ranked
        WHERE peak_rank = 1
        ORDER BY
          snapshot_match DESC,
          CASE
            WHEN UPPER(signal_role) LIKE '%TEMPERATURE%PV%' OR UPPER(signal_role) LIKE '%TEMP%PV%' THEN 1
            WHEN UPPER(signal_role) LIKE '%OVERFEED%PV%' THEN 2
            WHEN UPPER(signal_role) LIKE '%DANCER%PV%' OR UPPER(signal_role) LIKE '%POSITION%PV%' THEN 3
            WHEN UPPER(signal_role) LIKE '%SPEED%PV%' THEN 4
            WHEN UPPER(signal_role) LIKE '%LOADCELL%PV%' THEN 5
            WHEN UPPER(signal_role) LIKE '%LEVEL%PV%' THEN 6
            WHEN UPPER(signal_role) LIKE '%FLOW%PV%' THEN 7
            ELSE 8
          END,
          sample_count DESC,
          signal_role
        LIMIT 16
      `, [assetId, range.from, range.to]),
      this.database.query(`
        WITH temperature_by_bucket AS (
          SELECT a.bucket_start,
            MAX(a.avg_value) - MIN(a.avg_value) AS spread_value,
            COUNT(DISTINCT a.tag_code)::int AS sensor_count
          FROM telemetry_cagg_1m a
          JOIN tag_definition d ON d.tag_code = a.tag_code
          WHERE a.asset_id = $1
            AND d.active = TRUE
            AND UPPER(d.signal_role) LIKE '%TEMPERATURE%PV%'
            AND a.bucket_start >= date_trunc('minute', $2::timestamptz)
            AND a.bucket_start <= date_trunc('minute', $3::timestamptz)
          GROUP BY a.bucket_start
        )
        SELECT AVG(spread_value) AS average_spread,
          MAX(spread_value) AS maximum_spread,
          COUNT(*) FILTER (WHERE sensor_count >= 2)::int AS bucket_count,
          MAX(sensor_count)::int AS sensor_count
        FROM temperature_by_bucket
        WHERE sensor_count >= 2
      `, [assetId, range.from, range.to]),
    ]);

    const state = stateSummary.rows[0];
    const runtimeSeconds = Number(state.runtime_seconds || 0);
    const observedSeconds = Number(state.observed_seconds || 0);
    const scopeSeconds = Math.max(0, (range.to.getTime() - range.from.getTime()) / 1000);
    const availabilityPercent = observedSeconds > 0 ? runtimeSeconds / observedSeconds * 100 : null;
    const stateCoveragePercent = scopeSeconds > 0 ? Math.min(100, observedSeconds / scopeSeconds * 100) : null;
    const totalizer = totalizerOutput.rows[0];
    const speedEstimate = speedOutput.rows[0];
    const runOutput = scope === "batch" && selectedRun?.output_quantity != null ? {
      value: Number(selectedRun.output_quantity), unit: selectedRun.output_unit || "", source: "batch_process_run", estimated: false,
    } : null;
    const output = runOutput || (totalizer && Number(totalizer.sample_count) > 1 ? {
      value: Number(totalizer.output_value), unit: totalizer.engineering_unit || "", source: totalizer.tag_code, estimated: false,
    } : speedEstimate ? {
      value: Number(speedEstimate.output_value), unit: "m", source: speedEstimate.tag_code, estimated: true,
    } : null);

    const primaryPeak = peakSensors.rows[0] || null;
    const selectedPeakFamily = primaryPeak ? peakFamily(primaryPeak.signal_role) : null;
    const selectedPeaks = primaryPeak
      ? peakSensors.rows.filter((item) => peakFamily(item.signal_role) === selectedPeakFamily && item.engineering_unit === primaryPeak.engineering_unit).slice(0, 6)
      : [];

    return {
      data_mode: "ACTUAL_DATABASE",
      asset_id: assetId,
      process_type: asset.rows[0].process_type,
      scope,
      range,
      runtime: {
        seconds: runtimeSeconds,
        observed_seconds: observedSeconds,
        scope_seconds: scopeSeconds,
        stop_count: Number(state.stop_count || 0),
        availability_percent: availabilityPercent,
        state_coverage_percent: stateCoveragePercent,
      },
      output,
      peak_metric: primaryPeak ? {
        family: selectedPeakFamily,
        title: peakTitle(selectedPeakFamily || "parameter"),
        source: primaryPeak.snapshot_match ? "snapshot_tag" : "registered_tag",
        items: selectedPeaks,
      } : null,
      peaks: selectedPeaks,
      stability: temperatureSpread.rows[0]?.bucket_count ? {
        metric: "temperature_spread",
        average_spread: Number(temperatureSpread.rows[0].average_spread),
        maximum_spread: Number(temperatureSpread.rows[0].maximum_spread),
        unit: "°C",
        bucket_count: Number(temperatureSpread.rows[0].bucket_count),
        sensor_count: Number(temperatureSpread.rows[0].sensor_count),
      } : null,
      completed_batches: Number(completedBatches.rows[0]?.completed_count || 0),
    };
  }
}
