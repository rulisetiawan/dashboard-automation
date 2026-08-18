import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";

const validProcesses = new Set(["jetflow", "calator", "dryer", "kalender", "chemical"]);
const assetProjection = "SELECT a.*, s.machine_state, s.batch_no, s.progress_percent, s.connected, s.source_ts, s.quality, s.values_json FROM asset a LEFT JOIN asset_snapshot s ON s.asset_id = a.asset_id";
const equipmentProjection = "SELECT e.*, s.equipment_state, s.current_r_a, s.current_s_a, s.current_t_a, s.voltage_rs_v, s.voltage_st_v, s.voltage_tr_v, s.active_power_kw, s.drive_frequency_hz, s.runtime_hours, s.energy_kwh, s.maintenance_due_at, s.source_ts, s.quality, s.values_json FROM equipment e LEFT JOIN equipment_snapshot s ON s.equipment_id = e.equipment_id";
const actualDataMode = "ACTUAL_DATABASE";
const aggregateTables: Record<string, string> = {
  "1m": "telemetry_aggregate_1m",
  "15m": "telemetry_aggregate_15m",
  daily: "telemetry_aggregate_daily",
};

function queryRange(from?: string, to?: string, defaultHours = 24) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - defaultHours * 60 * 60_000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) throw new BadRequestException("from dan to harus berupa ISO date yang valid.");
  return [start.toISOString(), end.toISOString()];
}

function assetRow(row: Record<string, any>) {
  return {
    id: row.asset_id,
    name: row.display_name,
    process: row.process_type,
    area: row.area_code,
    areaLabel: row.area_name,
    subtype: row.subtype,
    ...(row.config_json || {}),
    state: row.machine_state || "offline",
    batch: row.batch_no || "—",
    progress: Number(row.progress_percent || 0),
    connected: row.connected || false,
    sourceTs: row.source_ts || null,
    quality: row.quality || "NO_DATA",
    values: row.values_json || {},
  };
}

function equipmentRow(row: Record<string, any>) {
  return {
    id: row.equipment_id,
    assetId: row.asset_id,
    type: row.equipment_type,
    code: row.equipment_code,
    name: row.display_name,
    category: row.category,
    ...(row.config_json || {}),
    state: row.equipment_state || "offline",
    currentR: row.current_r_a,
    currentS: row.current_s_a,
    currentT: row.current_t_a,
    voltageRS: row.voltage_rs_v,
    voltageST: row.voltage_st_v,
    voltageTR: row.voltage_tr_v,
    powerKw: row.active_power_kw,
    frequencyHz: row.drive_frequency_hz,
    runtimeHours: row.runtime_hours,
    energyKwh: row.energy_kwh,
    maintenanceDueAt: row.maintenance_due_at,
    sourceTs: row.source_ts || null,
    quality: row.quality || "NO_DATA",
    values: row.values_json || {},
  };
}

@Controller("api/v1")
export class ApiController {
  constructor(private readonly database: DatabaseService) {}

  @Get("integration/status")
  async status() {
    const result = await this.database.query("SELECT process_type, COUNT(*)::int AS asset_count FROM asset WHERE active = TRUE GROUP BY process_type ORDER BY process_type");
    return { data_mode: actualDataMode, storage: "POSTGRESQL_NATIVE_LOCAL", framework: "NESTJS", scope: "ALL_PROCESSES", processes: result.rows, gateway_ingestion: false, server_time: new Date().toISOString() };
  }

  @Get("assets")
  async assets(@Query("process") process?: string, @Query("area") area?: string) {
    if (!process || !validProcesses.has(process)) throw new BadRequestException("process must be jetflow, calator, dryer, kalender, or chemical");
    const result = area
      ? await this.database.query(`${assetProjection} WHERE a.process_type = $1 AND a.area_code = $2 AND a.active = TRUE ORDER BY a.asset_id`, [process, area])
      : await this.database.query(`${assetProjection} WHERE a.process_type = $1 AND a.active = TRUE ORDER BY a.asset_id`, [process]);
    return { data_mode: actualDataMode, assets: result.rows.map(assetRow) };
  }

  @Get("assets/:assetId/snapshot")
  async snapshot(@Param("assetId") assetId: string) {
    const asset = await this.database.query(`${assetProjection} WHERE a.asset_id = $1`, [assetId]);
    if (!asset.rows[0]) throw new NotFoundException("asset not found");
    const tags = await this.database.query("SELECT tag_code, signal_role, engineering_unit, source_status FROM tag_definition WHERE asset_id = $1 AND active = TRUE ORDER BY tag_code", [assetId]);
    return { data_mode: actualDataMode, asset: assetRow(asset.rows[0]), tags: tags.rows };
  }

  @Get("dispensing/transactions")
  async dispensingTransactions(@Query("asset_id") assetId?: string) {
    const result = assetId
      ? await this.database.query("SELECT * FROM chemical_transaction WHERE dispenser_id = $1 ORDER BY occurred_at DESC LIMIT 250", [assetId])
      : await this.database.query("SELECT * FROM chemical_transaction ORDER BY occurred_at DESC LIMIT 250");
    return { data_mode: actualDataMode, transactions: result.rows };
  }

  @Get("utilities/snapshot")
  async utilities() {
    const result = await this.database.query("SELECT * FROM utility_snapshot ORDER BY utility_code");
    return { data_mode: actualDataMode, utilities: result.rows };
  }

  @Get("telemetry/recent")
  async recentTelemetry(@Query("limit") rawLimit?: string) {
    const limit = Math.min(Math.max(Number(rawLimit) || 100, 1), 500);
    const result = await this.database.query(`
      SELECT t.asset_id, t.tag_code, d.signal_role, d.engineering_unit, t.source_ts, t.value_number, t.value_text, t.quality
      FROM telemetry_sample t
      JOIN tag_definition d ON d.tag_code = t.tag_code
      ORDER BY t.source_ts DESC
      LIMIT $1
    `, [limit]);
    return { data_mode: actualDataMode, samples: result.rows };
  }

  @Get("telemetry/aggregate")
  async telemetryAggregate(@Query("asset_id") assetId?: string, @Query("tag_code") tagCode?: string, @Query("granularity") granularity = "15m", @Query("from") from?: string, @Query("to") to?: string) {
    if (!assetId || !tagCode) throw new BadRequestException("asset_id dan tag_code wajib diisi.");
    const table = aggregateTables[granularity];
    if (!table) throw new BadRequestException("granularity harus 1m, 15m, atau daily.");
    const [rangeFrom, rangeTo] = queryRange(from, to, granularity === "daily" ? 31 * 24 : 24);
    const result = await this.database.query(`SELECT bucket_start, sample_count, good_sample_count, bad_sample_count, min_value, max_value, avg_value, first_value, last_value, delta_value, last_source_ts, refreshed_at FROM ${table} WHERE asset_id = $1 AND tag_code = $2 AND bucket_start >= $3 AND bucket_start <= $4 ORDER BY bucket_start`, [assetId, tagCode, rangeFrom, rangeTo]);
    return { data_mode: actualDataMode, granularity, from: rangeFrom, to: rangeTo, points: result.rows };
  }

  @Get("utilities/aggregate")
  async utilitiesAggregate(@Query("utility_code") utilityCode?: string, @Query("from") from?: string, @Query("to") to?: string) {
    if (!utilityCode) throw new BadRequestException("utility_code wajib diisi.");
    const [rangeFrom, rangeTo] = queryRange(from, to, 31 * 24);
    const result = await this.database.query("SELECT * FROM utility_aggregate_daily WHERE utility_code = $1 AND bucket_start >= $2 AND bucket_start <= $3 ORDER BY bucket_start", [utilityCode, rangeFrom, rangeTo]);
    return { data_mode: actualDataMode, from: rangeFrom, to: rangeTo, points: result.rows };
  }

  @Get("machine-states/aggregate")
  async machineStatesAggregate(@Query("asset_id") assetId?: string, @Query("from") from?: string, @Query("to") to?: string) {
    if (!assetId) throw new BadRequestException("asset_id wajib diisi.");
    const [rangeFrom, rangeTo] = queryRange(from, to, 31 * 24);
    const result = await this.database.query("SELECT * FROM machine_state_aggregate_daily WHERE asset_id = $1 AND bucket_start >= $2 AND bucket_start <= $3 ORDER BY bucket_start, machine_state", [assetId, rangeFrom, rangeTo]);
    return { data_mode: actualDataMode, from: rangeFrom, to: rangeTo, points: result.rows };
  }

  @Get("equipment")
  async equipment(@Query("asset_id") assetId?: string) {
    const result = assetId
      ? await this.database.query(`${equipmentProjection} WHERE e.asset_id = $1 AND e.active = TRUE ORDER BY e.equipment_code`, [assetId])
      : await this.database.query(`${equipmentProjection} WHERE e.active = TRUE ORDER BY e.asset_id, e.equipment_code`);
    return { data_mode: actualDataMode, equipment: result.rows.map(equipmentRow) };
  }

  @Get("batch/process-runs")
  async processRuns(@Query("asset_id") assetId?: string) {
    const result = assetId
      ? await this.database.query("SELECT * FROM batch_process_run WHERE asset_id = $1 ORDER BY started_at DESC NULLS LAST LIMIT 100", [assetId])
      : await this.database.query("SELECT * FROM batch_process_run ORDER BY started_at DESC NULLS LAST LIMIT 250");
    return { data_mode: actualDataMode, runs: result.rows };
  }

  @Get("alarms/recent")
  async recentAlarms(@Query("limit") rawLimit?: string) {
    const limit = Math.min(Math.max(Number(rawLimit) || 100, 1), 500);
    const result = await this.database.query("SELECT * FROM alarm_event ORDER BY occurred_at DESC LIMIT $1", [limit]);
    return { data_mode: actualDataMode, alarms: result.rows };
  }
}
