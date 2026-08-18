import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";

const validProcesses = new Set(["jetflow", "calator", "dryer", "kalender", "chemical"]);
const assetProjection = "SELECT a.*, s.machine_state, s.batch_no, s.progress_percent, s.connected, s.source_ts, s.quality FROM asset a LEFT JOIN asset_snapshot s ON s.asset_id = a.asset_id";
const actualDataMode = "ACTUAL_DATABASE";

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
}
