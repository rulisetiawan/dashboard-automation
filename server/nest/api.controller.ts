import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";

const validProcesses = new Set(["jetflow", "calator", "dryer", "kalender", "chemical"]);
const assetProjection = `
  SELECT
    a.*,
    s.machine_state,
    COALESCE(active_run.batch_no, s.batch_no) AS batch_no,
    COALESCE(active_run.progress_percent, s.progress_percent) AS progress_percent,
    s.connected,
    s.source_ts,
    s.quality,
    s.values_json,
    communication.online AS communication_online,
    communication.effective_quality AS communication_quality,
    communication.heartbeat_tag_code,
    communication.heartbeat_value,
    communication.stale_after_seconds AS heartbeat_stale_after_seconds,
    communication.source_ts AS heartbeat_source_ts
  FROM asset a
  LEFT JOIN asset_snapshot s ON s.asset_id = a.asset_id
  LEFT JOIN asset_communication_state communication ON communication.asset_id = a.asset_id
  LEFT JOIN LATERAL (
    SELECT run.batch_no, run.progress_percent
    FROM batch_process_run run
    WHERE run.asset_id = a.asset_id
      AND run.run_status IN ('RUNNING', 'HOLD')
    ORDER BY run.source_updated_at DESC NULLS LAST, run.updated_at DESC, run.started_at DESC NULLS LAST
    LIMIT 1
  ) active_run ON TRUE
`;
const equipmentProjection = "SELECT e.*, s.equipment_state, s.current_r_a, s.current_s_a, s.current_t_a, s.voltage_rs_v, s.voltage_st_v, s.voltage_tr_v, s.active_power_kw, s.drive_frequency_hz, s.runtime_hours, s.energy_kwh, s.maintenance_due_at, s.source_ts, s.quality, s.values_json FROM equipment e LEFT JOIN equipment_snapshot s ON s.equipment_id = e.equipment_id";
const actualDataMode = "ACTUAL_DATABASE";
const aggregateTables: Record<string, string> = {
  "1m": "telemetry_cagg_1m",
  "15m": "telemetry_cagg_15m",
  daily: "telemetry_cagg_daily",
};
const equipmentAggregateTables: Record<string, string> = {
  "1m": "equipment_telemetry_aggregate_1m",
  "15m": "equipment_telemetry_aggregate_15m",
  daily: "equipment_telemetry_aggregate_daily",
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
    connected: row.communication_online === true,
    connectionStatus: row.communication_quality || "NOT_CONNECTED",
    heartbeatTagCode: row.heartbeat_tag_code || null,
    heartbeatValue: row.heartbeat_value ?? null,
    heartbeatStaleAfterSeconds: Number(row.heartbeat_stale_after_seconds || 30),
    heartbeatSourceTs: row.heartbeat_source_ts || null,
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

function instrumentStateRow(row: Record<string, any>) {
  return {
    tagCode: row.tag_code,
    assetId: row.asset_id,
    process: row.process_type,
    area: row.area_code,
    areaLabel: row.area_name,
    assetName: row.asset_name,
    elementCode: row.element_code,
    parameterCode: row.parameter_code,
    signalRole: row.signal_role,
    engineeringUnit: row.engineering_unit,
    value: row.value_number == null ? row.value_text : Number(row.value_number),
    valueNumber: row.value_number == null ? null : Number(row.value_number),
    valueText: row.value_text,
    booleanValue: row.boolean_value,
    rawQuality: row.raw_quality,
    quality: row.effective_quality,
    semanticState: row.semantic_state,
    staleAfterSeconds: Number(row.stale_after_seconds),
    sourceTs: row.source_ts,
    ingestedAt: row.ingested_at,
    updatedAt: row.updated_at,
    freshnessMode: row.freshness_mode,
    communicationQuality: row.communication_quality,
    heartbeatSourceTs: row.heartbeat_source_ts,
  };
}

@Controller("api/v1")
export class ApiController {
  constructor(private readonly database: DatabaseService) {}

  @Get("integration/status")
  async status() {
    const [result, timescale] = await Promise.all([
      this.database.query("SELECT process_type, COUNT(*)::int AS asset_count FROM asset WHERE active = TRUE GROUP BY process_type ORDER BY process_type"),
      this.database.query("SELECT extversion FROM pg_extension WHERE extname = 'timescaledb'"),
    ]);
    return {
      data_mode: actualDataMode,
      storage: timescale.rows[0] ? "TIMESCALEDB_LOCAL" : "POSTGRESQL_NATIVE_LOCAL",
      timescaledb_version: timescale.rows[0]?.extversion || null,
      framework: "NESTJS",
      scope: "ALL_PROCESSES",
      processes: result.rows,
      gateway_ingestion: true,
      live_value_ingestion: true,
      batch_api_ingestion: true,
      server_time: new Date().toISOString(),
    };
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

  @Get("assets/:assetId/instrument-states")
  async instrumentStates(
    @Param("assetId") assetId: string,
    @Query("element") element?: string,
    @Query("changed_after") changedAfter?: string,
  ) {
    const asset = await this.database.query("SELECT asset_id FROM asset WHERE asset_id = $1 AND active = TRUE", [assetId]);
    if (!asset.rows[0]) throw new NotFoundException("asset not found");

    const values: unknown[] = [assetId];
    const clauses = ["asset_id = $1", "active = TRUE"];
    if (element) {
      values.push(element.toUpperCase());
      clauses.push(`element_code = $${values.length}`);
    }
    if (changedAfter) {
      const parsed = new Date(changedAfter);
      if (Number.isNaN(parsed.getTime())) throw new BadRequestException("changed_after harus berupa ISO date yang valid.");
      values.push(parsed.toISOString());
      clauses.push(`updated_at > $${values.length}::timestamptz`);
    }

    const result = await this.database.query(
      `SELECT * FROM instrument_state WHERE ${clauses.join(" AND ")} ORDER BY element_code, parameter_code, tag_code`,
      values,
    );
    const snapshotVersion = result.rows.reduce<Date | null>((latest, row) => {
      const updatedAt = new Date(row.updated_at);
      return !latest || updatedAt > latest ? updatedAt : latest;
    }, null);

    return {
      data_mode: actualDataMode,
      asset_id: assetId,
      snapshot_version: snapshotVersion?.toISOString() || null,
      states: result.rows.map(instrumentStateRow),
    };
  }

  @Get("assets/:assetId/communication")
  async assetCommunication(@Param("assetId") assetId: string) {
    const result = await this.database.query(
      `SELECT * FROM asset_communication_state WHERE asset_id = $1`,
      [assetId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException("asset not found");
    return {
      data_mode: actualDataMode,
      asset_id: row.asset_id,
      heartbeat_tag_code: row.heartbeat_tag_code,
      heartbeat_value: row.heartbeat_value,
      online: row.online,
      raw_quality: row.raw_quality,
      quality: row.effective_quality,
      stale_after_seconds: Number(row.stale_after_seconds),
      source_ts: row.source_ts,
      ingested_at: row.ingested_at,
      updated_at: row.updated_at,
    };
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
  async recentTelemetry(
    @Query("limit") rawLimit?: string,
    @Query("per_asset") rawPerAsset?: string,
    @Query("asset_id") filterAssetId?: string,
  ) {
    const limit = Math.min(Math.max(Number(rawLimit) || 100, 1), 2000);
    const perAsset = rawPerAsset === "true" || rawPerAsset === "1";

    let result;
    if (perAsset) {
      // Fetch the N most recent samples per distinct asset to ensure all machines appear
      result = await this.database.query(`
        SELECT t.asset_id, t.tag_code, d.signal_role, d.engineering_unit, t.source_ts, t.value_number, t.value_text, t.quality
        FROM telemetry_sample t
        JOIN tag_definition d ON d.tag_code = t.tag_code
        WHERE (t.asset_id, t.source_ts) IN (
          SELECT asset_id, MAX(source_ts)
          FROM telemetry_sample
          GROUP BY asset_id, tag_code
          ORDER BY asset_id, MAX(source_ts) DESC
        )
        ORDER BY t.source_ts DESC
        LIMIT $1
      `, [limit]);
    } else if (filterAssetId) {
      result = await this.database.query(`
        SELECT t.asset_id, t.tag_code, d.signal_role, d.engineering_unit, t.source_ts, t.value_number, t.value_text, t.quality
        FROM telemetry_sample t
        JOIN tag_definition d ON d.tag_code = t.tag_code
        WHERE t.asset_id = $2
        ORDER BY t.source_ts DESC
        LIMIT $1
      `, [limit, filterAssetId]);
    } else {
      result = await this.database.query(`
        SELECT t.asset_id, t.tag_code, d.signal_role, d.engineering_unit, t.source_ts, t.value_number, t.value_text, t.quality
        FROM telemetry_sample t
        JOIN tag_definition d ON d.tag_code = t.tag_code
        ORDER BY t.source_ts DESC
        LIMIT $1
      `, [limit]);
    }
    return { data_mode: actualDataMode, samples: result.rows };
  }

  @Get("telemetry/aggregate")
  async telemetryAggregate(@Query("asset_id") assetId?: string, @Query("tag_code") tagCode?: string, @Query("granularity") granularity = "15m", @Query("from") from?: string, @Query("to") to?: string) {
    if (!assetId || !tagCode) throw new BadRequestException("asset_id dan tag_code wajib diisi.");
    const table = aggregateTables[granularity];
    if (!table) throw new BadRequestException("granularity harus 1m, 15m, atau daily.");
    const [rangeFrom, rangeTo] = queryRange(from, to, granularity === "daily" ? 31 * 24 : 24);
    const result = await this.database.query(`SELECT bucket_start, sample_count, good_sample_count, bad_sample_count, min_value, max_value, avg_value, first_value, last_value, delta_value, last_source_ts, NULL::timestamptz AS refreshed_at FROM ${table} WHERE asset_id = $1 AND tag_code = $2 AND bucket_start >= $3 AND bucket_start <= $4 ORDER BY bucket_start`, [assetId, tagCode, rangeFrom, rangeTo]);
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

  @Get("equipment/:equipmentId/trend")
  async equipmentTrend(@Param("equipmentId") equipmentId: string, @Query("granularity") granularity = "15m", @Query("from") from?: string, @Query("to") to?: string) {
    const table = equipmentAggregateTables[granularity];
    if (!table) throw new BadRequestException("granularity harus 1m, 15m, atau daily.");
    const [rangeFrom, rangeTo] = queryRange(from, to, granularity === "daily" ? 31 * 24 : 24);
    const result = await this.database.query(`SELECT bucket_start, sample_count, current_r_avg_a, current_s_avg_a, current_t_avg_a, current_r_min_a, current_r_max_a, current_s_min_a, current_s_max_a, current_t_min_a, current_t_max_a, active_power_avg_kw, drive_frequency_avg_hz, energy_delta_kwh, last_source_ts, refreshed_at FROM ${table} WHERE equipment_id = $1 AND bucket_start >= $2 AND bucket_start <= $3 ORDER BY bucket_start`, [equipmentId, rangeFrom, rangeTo]);
    return { data_mode: actualDataMode, equipment_id: equipmentId, granularity, from: rangeFrom, to: rangeTo, points: result.rows };
  }

  @Get("batch/process-runs")
  async processRuns(@Query("asset_id") assetId?: string) {
    const result = assetId
      ? await this.database.query("SELECT * FROM batch_process_run WHERE asset_id = $1 ORDER BY started_at DESC NULLS LAST LIMIT 100", [assetId])
      : await this.database.query("SELECT * FROM batch_process_run ORDER BY started_at DESC NULLS LAST LIMIT 250");
    return { data_mode: actualDataMode, runs: result.rows };
  }

  @Get("batch/process-runs/:processRunId/program")
  async processProgram(@Param("processRunId") processRunId: string) {
    const run = await this.database.query("SELECT r.*, p.program_code, p.version_no, p.version_status FROM batch_process_run r LEFT JOIN process_program_version p ON p.program_version_id = r.program_version_id WHERE r.process_run_id = $1", [processRunId]);
    if (!run.rows[0]) throw new NotFoundException("process run not found");
    const steps = await this.database.query("SELECT e.*, s.sequence_no AS program_sequence_no, s.step_code AS program_step_code, s.completion_rule, s.expected_duration_seconds FROM process_step_execution e LEFT JOIN process_program_step s ON s.program_step_id = e.program_step_id WHERE e.process_run_id = $1 ORDER BY e.step_no", [processRunId]);
    const transitions = await this.database.query("SELECT * FROM process_transition_event WHERE process_run_id = $1 ORDER BY source_ts", [processRunId]);
    return { data_mode: actualDataMode, run: run.rows[0], steps: steps.rows, transitions: transitions.rows };
  }

  @Get("alarms/recent")
  async recentAlarms(@Query("limit") rawLimit?: string) {
    const limit = Math.min(Math.max(Number(rawLimit) || 100, 1), 500);
    const alarmSelect = `
      SELECT
        ae.*,
        COALESCE(ar.rule_type, 'HIGH') AS rule_type,
        td.signal_role,
        td.engineering_unit
      FROM alarm_event ae
      LEFT JOIN alarm_rule ar ON ar.rule_id = ae.rule_id
      LEFT JOIN tag_definition td ON td.tag_code = ae.tag_code
    `;
    const [recent, active] = await Promise.all([
      this.database.query(`${alarmSelect} ORDER BY ae.occurred_at DESC LIMIT $1`, [limit]),
      this.database.query(`${alarmSelect}
        WHERE COALESCE(ae.event_state, 'ACTIVE') <> 'CLEARED'
        ORDER BY
          CASE UPPER(COALESCE(ae.severity, 'WARNING')) WHEN 'CRITICAL' THEN 0 WHEN 'WARNING' THEN 1 ELSE 2 END,
          ae.occurred_at DESC
      `),
    ]);
    return {
      data_mode: actualDataMode,
      alarms: recent.rows,
      active_alarms: active.rows,
      active_count: active.rowCount,
    };
  }
}
