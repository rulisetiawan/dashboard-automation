import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, Post, Query, Req, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { DatabaseService } from "./database.service.js";
import { DashboardUserSession } from "./auth.service.js";
import { RealtimeGateway } from "./realtime.gateway.js";

type DashboardRequest = Request & { dashboardUser?: DashboardUserSession };
const reviewRoles = new Set(["ADMIN", "ENGINEER", "SUPERVISOR"]);
const writeRoles = new Set(["ADMIN", "ENGINEER", "SUPERVISOR", "OPERATOR"]);

function boundedText(value: unknown, field: string, max = 160, required = false) {
  const result = String(value ?? "").trim();
  if (required && !result) throw new BadRequestException(`${field} wajib diisi.`);
  if (result.length > max) throw new BadRequestException(`${field} maksimal ${max} karakter.`);
  return result || null;
}

function positiveNumber(value: unknown, field: string, allowZero = true) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || (!allowZero && number === 0)) throw new BadRequestException(`${field} harus berupa angka ${allowZero ? "nol atau positif" : "positif"}.`);
  return number;
}

function isoTimestamp(value: unknown, field: string, fallback?: Date) {
  const date = value == null || value === "" ? fallback : new Date(String(value));
  if (!date || Number.isNaN(date.getTime())) throw new BadRequestException(`${field} harus berupa timestamp yang valid.`);
  return date.toISOString();
}

function dateRange(from?: string, to?: string) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 30 * 86400000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) throw new BadRequestException("Time range tidak valid.");
  if (end.getTime() - start.getTime() > 366 * 86400000) throw new BadRequestException("Time range maksimal 366 hari.");
  return { from: start.toISOString(), to: end.toISOString() };
}

function pagination(pageRaw?: string, sizeRaw?: string) {
  const page = Math.max(1, Math.floor(Number(pageRaw) || 1));
  const pageSize = Math.min(100, Math.max(10, Math.floor(Number(sizeRaw) || 25)));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function requireRole(request: DashboardRequest, allowed: Set<string>) {
  const user = request.dashboardUser;
  if (!user || !allowed.has(String(user.role).toUpperCase())) throw new UnauthorizedException("Role Anda tidak memiliki izin untuk aksi ini.");
  return user;
}

function normalizeSourceStatus(value: unknown, completedAt: string | null) {
  const source = String(value || "").trim().toUpperCase().replace(/[ -]+/g, "_");
  const aliases: Record<string, string> = { ACTIVE: "DISPENSING", AKTIF: "READY", TERPAKAI: "COMPLETED", TIDAK_AKTIF: "CANCELLED", DONE: "COMPLETED", SUCCESS: "COMPLETED", FINISHED: "COMPLETED", ERROR: "FAILED", VOID: "CANCELLED" };
  const normalized = aliases[source] || source || (completedAt ? "COMPLETED" : "QR_CREATED");
  return ["QR_CREATED","READY","DISPENSING","COMPLETED","PARTIAL","FAILED","CANCELLED","EXPIRED","MANUAL_REVIEW"].includes(normalized) ? normalized : "MANUAL_REVIEW";
}

@Controller("api/v1")
export class SolarFuelingController {
  constructor(private readonly database: DatabaseService, private readonly realtime: RealtimeGateway) {}

  private stockAtSql(alias = "$1") {
    return `
      SELECT config.tank_id,
             COALESCE(
               (SELECT transaction.calculated_stock_liters
                FROM solar_fueling_transaction transaction
                WHERE transaction.calculated_stock_liters IS NOT NULL
                  AND COALESCE(transaction.fueling_completed_at,transaction.source_updated_at,transaction.qr_created_at) <= ${alias}
                ORDER BY COALESCE(transaction.fueling_completed_at,transaction.source_updated_at,transaction.qr_created_at) DESC,transaction.source_id DESC LIMIT 1),
               config.opening_stock_liters
               + COALESCE((SELECT SUM(CASE WHEN movement.direction = 'IN' THEN movement.quantity_liters ELSE -movement.quantity_liters END)
                           FROM solar_stock_movement movement WHERE movement.tank_id = config.tank_id AND movement.occurred_at >= config.opening_at AND movement.occurred_at <= ${alias}), 0)
               - COALESCE((SELECT SUM(transaction.metered_liters)
                           FROM solar_fueling_transaction transaction
                           WHERE transaction.movement_direction = 'OUT' AND transaction.transaction_status IN ('COMPLETED','PARTIAL')
                             AND transaction.fueling_completed_at >= config.opening_at AND transaction.fueling_completed_at <= ${alias}), 0)
             ) AS system_stock_liters
      FROM solar_stock_config config WHERE config.tank_id = 'SOLAR-MAIN'`;
  }

  @Get("solar/overview")
  async overview(@Query("from") from?: string, @Query("to") to?: string) {
    const range = dateRange(from, to);
    const [summary, totalizer, stock, latestOpname, trend, users, exceptions, latestLevel, levelTrend] = await Promise.all([
      this.database.query(`
        SELECT COUNT(*) FILTER (WHERE transaction_status IN ('COMPLETED','PARTIAL'))::int AS completed_transactions,
               COALESCE(SUM(metered_liters) FILTER (WHERE transaction_status IN ('COMPLETED','PARTIAL')), 0) AS metered_liters,
               COALESCE(SUM(requested_liters) FILTER (WHERE transaction_status IN ('COMPLETED','PARTIAL')), 0) AS requested_liters,
               COALESCE(AVG(CASE WHEN requested_liters > 0 AND transaction_status IN ('COMPLETED','PARTIAL') THEN metered_liters / requested_liters * 100 END), 0) AS fulfillment_percent,
               COUNT(*) FILTER (WHERE transaction_status = 'MANUAL_REVIEW' OR (requested_liters > 0 AND metered_liters IS NOT NULL AND ABS(metered_liters-requested_liters)/requested_liters > 0.02))::int AS review_count
        FROM solar_fueling_transaction WHERE COALESCE(fueling_completed_at, qr_created_at, ingested_at) >= $1 AND COALESCE(fueling_completed_at, qr_created_at, ingested_at) < $2
      `, [range.from, range.to]),
      this.database.query(`
        WITH ordered AS (
          SELECT machine_totalizer_liters, fueling_completed_at,
                 LAG(machine_totalizer_liters) OVER (ORDER BY fueling_completed_at) AS previous_totalizer
          FROM solar_fueling_transaction
          WHERE transaction_status IN ('COMPLETED','PARTIAL') AND fueling_completed_at >= $1 AND fueling_completed_at < $2 AND machine_totalizer_liters IS NOT NULL
        )
        SELECT COALESCE(SUM(CASE WHEN previous_totalizer IS NOT NULL AND machine_totalizer_liters >= previous_totalizer THEN machine_totalizer_liters-previous_totalizer ELSE 0 END),0) AS machine_delta_liters,
               MAX(machine_totalizer_liters) AS latest_totalizer_liters,
               COUNT(*) FILTER (WHERE previous_totalizer IS NOT NULL AND machine_totalizer_liters < previous_totalizer)::int AS reset_count
        FROM ordered
      `, [range.from, range.to]),
      this.database.query(this.stockAtSql("$1"), [range.to]),
      this.database.query("SELECT * FROM solar_stock_opname WHERE tank_id = 'SOLAR-MAIN' ORDER BY cutoff_at DESC LIMIT 1"),
      this.database.query(`
        SELECT date_trunc(CASE WHEN $2::timestamptz-$1::timestamptz <= interval '2 days' THEN 'hour' ELSE 'day' END, fueling_completed_at) AS bucket,
               SUM(metered_liters) AS metered_liters, SUM(requested_liters) AS requested_liters
        FROM solar_fueling_transaction WHERE transaction_status IN ('COMPLETED','PARTIAL') AND fueling_completed_at >= $1 AND fueling_completed_at < $2
        GROUP BY 1 ORDER BY 1
      `, [range.from, range.to]),
      this.database.query(`
        SELECT COALESCE(NULLIF(requester_name,''), NULLIF(processed_by,''), 'Unknown') AS user_name, COUNT(*)::int AS transactions, SUM(metered_liters) AS liters
        FROM solar_fueling_transaction WHERE transaction_status IN ('COMPLETED','PARTIAL') AND fueling_completed_at >= $1 AND fueling_completed_at < $2
        GROUP BY 1 ORDER BY liters DESC NULLS LAST LIMIT 8
      `, [range.from, range.to]),
      this.database.query(`
        SELECT transaction_id, qr_code, requested_liters, metered_liters, transaction_status, fueling_completed_at,
               CASE WHEN requested_liters > 0 AND metered_liters IS NOT NULL THEN (metered_liters-requested_liters) ELSE NULL END AS variance_liters
        FROM solar_fueling_transaction
        WHERE COALESCE(fueling_completed_at, qr_created_at, ingested_at) >= $1 AND COALESCE(fueling_completed_at, qr_created_at, ingested_at) < $2
          AND (transaction_status IN ('FAILED','PARTIAL','MANUAL_REVIEW') OR (requested_liters > 0 AND metered_liters IS NOT NULL AND ABS(metered_liters-requested_liters)/requested_liters > 0.02))
        ORDER BY COALESCE(fueling_completed_at, qr_created_at, ingested_at) DESC LIMIT 10
      `, [range.from, range.to]),
      this.database.query(`
        SELECT sample.stock_liters,
               CASE WHEN sample.quality = 'GOOD' AND sample.source_ts < clock_timestamp()-interval '3 minutes' THEN 'STALE' ELSE sample.quality END AS quality,
               CASE WHEN sample.quality = 'GOOD' AND sample.source_ts < clock_timestamp()-interval '3 minutes' THEN 'Tidak ada pembaruan sensor lebih dari 3 menit' ELSE sample.quality_reason END AS quality_reason,
               sample.source_ts,
               CASE WHEN config.capacity_liters > 0 THEN sample.stock_liters / config.capacity_liters * 100 END AS level_percent
        FROM solar_level_sample sample
        JOIN solar_stock_config config ON config.tank_id = sample.tank_id
        WHERE sample.tank_id = 'SOLAR-MAIN'
        ORDER BY sample.source_ts DESC, sample.source_id DESC
        LIMIT 1
      `),
      this.database.query(`
        SELECT date_trunc(CASE WHEN $2::timestamptz-$1::timestamptz <= interval '2 days' THEN 'hour' ELSE 'day' END, source_ts) AS bucket,
               AVG(stock_liters) AS average_stock_liters, MIN(stock_liters) AS minimum_stock_liters, MAX(stock_liters) AS maximum_stock_liters
        FROM solar_level_sample
        WHERE tank_id = 'SOLAR-MAIN' AND quality = 'GOOD' AND source_ts >= $1 AND source_ts < $2
        GROUP BY 1 ORDER BY 1
      `, [range.from, range.to]),
    ]);
    const values: any = summary.rows[0] || {};
    const totals: any = totalizer.rows[0] || {};
    const metered = Number(values.metered_liters || 0);
    const machineDelta = Number(totals.machine_delta_liters || 0);
    return {
      data_mode: "ACTUAL_DATABASE", range,
      summary: {
        ...values,
        system_stock_liters: Number(stock.rows[0]?.system_stock_liters || 0),
        latest_totalizer_liters: totals.latest_totalizer_liters == null ? null : Number(totals.latest_totalizer_liters),
        machine_delta_liters: machineDelta,
        totalizer_variance_liters: machineDelta - metered,
        metering_match_percent: machineDelta > 0 ? Math.max(0, 100 - Math.abs(machineDelta-metered)/machineDelta*100) : null,
        totalizer_reset_count: Number(totals.reset_count || 0),
        stock_accuracy_percent: latestOpname.rows[0]?.accuracy_percent == null ? null : Number(latestOpname.rows[0].accuracy_percent),
        live_stock_liters: latestLevel.rows[0]?.stock_liters == null ? null : Number(latestLevel.rows[0].stock_liters),
        live_level_percent: latestLevel.rows[0]?.level_percent == null ? null : Number(latestLevel.rows[0].level_percent),
        live_level_quality: latestLevel.rows[0]?.quality || "NO_DATA",
        live_level_quality_reason: latestLevel.rows[0]?.quality_reason || null,
        live_level_source_ts: latestLevel.rows[0]?.source_ts || null,
      },
      latest_opname: latestOpname.rows[0] || null,
      time_series: trend.rows,
      level_time_series: levelTrend.rows,
      user_ranking: users.rows,
      exceptions: exceptions.rows,
    };
  }

  @Get("solar/transactions")
  async transactions(@Query("from") from?: string, @Query("to") to?: string, @Query("search") search = "", @Query("status") status = "all", @Query("page") pageRaw?: string, @Query("page_size") sizeRaw?: string) {
    const range = dateRange(from, to);
    const { page, pageSize, offset } = pagination(pageRaw, sizeRaw);
    const normalizedSearch = `%${String(search).trim()}%`;
    const values = [range.from, range.to, normalizedSearch, status.toUpperCase(), pageSize, offset];
    const where = `event_at >= $1 AND event_at < $2 AND ($3 = '%%' OR qr_code ILIKE $3 OR COALESCE(requester_name,'') ILIKE $3 OR COALESCE(qr_created_by,'') ILIKE $3 OR COALESCE(processed_by,'') ILIKE $3 OR COALESCE(consumer_label,'') ILIKE $3) AND ($4 = 'ALL' OR transaction_status = $4)`;
    const rows = await this.database.query(`
      WITH ordered AS (
        SELECT transaction.*, COALESCE(fueling_completed_at, qr_created_at, ingested_at) AS event_at,
               LAG(machine_totalizer_liters) OVER (ORDER BY fueling_completed_at) AS previous_totalizer_liters
        FROM solar_fueling_transaction transaction
      )
      SELECT *, CASE WHEN previous_totalizer_liters IS NOT NULL AND machine_totalizer_liters >= previous_totalizer_liters THEN machine_totalizer_liters-previous_totalizer_liters END AS machine_delta_liters
      FROM ordered WHERE ${where} ORDER BY event_at DESC LIMIT $5 OFFSET $6
    `, values);
    const count = await this.database.query(`
      SELECT COUNT(*)::int AS total FROM (SELECT *, COALESCE(fueling_completed_at, qr_created_at, ingested_at) AS event_at FROM solar_fueling_transaction) transaction WHERE ${where}
    `, values.slice(0, 4));
    const total = Number(count.rows[0]?.total || 0);
    return { data_mode: "ACTUAL_DATABASE", range, transactions: rows.rows, pagination: { page, page_size: pageSize, total_rows: total, total_pages: Math.max(1, Math.ceil(total/pageSize)) } };
  }

  @Get("solar/stock/movements")
  async movements(@Query("from") from?: string, @Query("to") to?: string, @Query("page") pageRaw?: string, @Query("page_size") sizeRaw?: string) {
    const range = dateRange(from, to); const { page, pageSize, offset } = pagination(pageRaw, sizeRaw);
    const [rows, count] = await Promise.all([
      this.database.query("SELECT * FROM solar_stock_movement WHERE occurred_at >= $1 AND occurred_at < $2 ORDER BY occurred_at DESC LIMIT $3 OFFSET $4", [range.from, range.to, pageSize, offset]),
      this.database.query("SELECT COUNT(*)::int AS total FROM solar_stock_movement WHERE occurred_at >= $1 AND occurred_at < $2", [range.from, range.to]),
    ]);
    const total = Number(count.rows[0]?.total || 0);
    return { data_mode: "ACTUAL_DATABASE", movements: rows.rows, pagination: { page, page_size: pageSize, total_rows: total, total_pages: Math.max(1, Math.ceil(total/pageSize)) } };
  }

  @Get("solar/stock-opnames")
  async opnames(@Query("from") from?: string, @Query("to") to?: string, @Query("page") pageRaw?: string, @Query("page_size") sizeRaw?: string) {
    const range = dateRange(from, to); const { page, pageSize, offset } = pagination(pageRaw, sizeRaw);
    const [rows, count] = await Promise.all([
      this.database.query("SELECT * FROM solar_stock_opname WHERE cutoff_at >= $1 AND cutoff_at < $2 ORDER BY cutoff_at DESC LIMIT $3 OFFSET $4", [range.from, range.to, pageSize, offset]),
      this.database.query("SELECT COUNT(*)::int AS total FROM solar_stock_opname WHERE cutoff_at >= $1 AND cutoff_at < $2", [range.from, range.to]),
    ]);
    const total = Number(count.rows[0]?.total || 0);
    return { data_mode: "ACTUAL_DATABASE", opnames: rows.rows, pagination: { page, page_size: pageSize, total_rows: total, total_pages: Math.max(1, Math.ceil(total/pageSize)) } };
  }

  @Post("solar/stock/movements")
  async createMovement(@Req() request: DashboardRequest, @Body() body: Record<string, any>) {
    const user = requireRole(request, writeRoles);
    const direction = String(body.direction || "IN").toUpperCase();
    const movementType = String(body.movement_type || "RECEIPT").toUpperCase();
    if (!["IN","OUT"].includes(direction) || !["RECEIPT","ADJUSTMENT","TRANSFER"].includes(movementType)) throw new BadRequestException("Jenis stock movement tidak valid.");
    const row = await this.database.query(`INSERT INTO solar_stock_movement (tank_id,movement_type,direction,quantity_liters,occurred_at,reference_code,notes,created_by) VALUES ('SOLAR-MAIN',$1,$2,$3,$4,$5,$6,$7) RETURNING *`, [movementType, direction, positiveNumber(body.quantity_liters,"quantity_liters",false), isoTimestamp(body.occurred_at,"occurred_at",new Date()), boundedText(body.reference_code,"reference_code"), boundedText(body.notes,"notes",2000), user.displayName]);
    this.realtime.publishDataRefresh(["solar_stock_movement"]);
    return { data_mode: "ACTUAL_DATABASE", movement: row.rows[0] };
  }

  @Post("solar/stock-opnames")
  async createOpname(@Req() request: DashboardRequest, @Body() body: Record<string, any>) {
    const user = requireRole(request, writeRoles);
    const cutoffAt = isoTimestamp(body.cutoff_at, "cutoff_at", new Date());
    const physical = positiveNumber(body.physical_stock_liters, "physical_stock_liters");
    const desired = String(body.status || "DRAFT").toUpperCase();
    if (!["DRAFT","SUBMITTED"].includes(desired)) throw new BadRequestException("Status awal harus DRAFT atau SUBMITTED.");
    const result = await this.database.transaction(async (client) => {
      const stock = await client.query(this.stockAtSql("$1"), [cutoffAt]);
      const system = Number(stock.rows[0]?.system_stock_liters || 0);
      const variance = physical-system;
      const accuracy = system > 0 ? Math.max(0, 100-Math.abs(variance)/system*100) : null;
      const number = `OPN-${new Date(cutoffAt).toISOString().slice(0,10).replaceAll("-","")}-${String(Date.now()).slice(-6)}`;
      const inserted = await client.query(`INSERT INTO solar_stock_opname (opname_number,tank_id,cutoff_at,system_stock_liters,physical_stock_liters,variance_liters,accuracy_percent,measurement_method,measured_by,status,notes) VALUES ($1,'SOLAR-MAIN',$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, [number,cutoffAt,system,physical,variance,accuracy,boundedText(body.measurement_method,"measurement_method",80,true),user.displayName,desired,boundedText(body.notes,"notes",2000)]);
      await client.query("INSERT INTO solar_audit_event (entity_type,entity_id,action,actor,after_data) VALUES ('STOCK_OPNAME',$1,$2,$3,$4)", [inserted.rows[0].opname_id, desired === "SUBMITTED" ? "CREATE_AND_SUBMIT" : "CREATE_DRAFT", user.displayName, inserted.rows[0]]);
      return inserted.rows[0];
    });
    this.realtime.publishDataRefresh(["solar_stock_opname"]);
    return { data_mode: "ACTUAL_DATABASE", opname: result };
  }

  @Patch("solar/stock-opnames/:id")
  async updateOpname(@Req() request: DashboardRequest, @Param("id") id: string, @Body() body: Record<string, any>) {
    const user = requireRole(request, reviewRoles);
    const action = String(body.action || "").toUpperCase();
    const targets: Record<string,string> = { VERIFY: "VERIFIED", POST: "POSTED", REJECT: "REJECTED" };
    if (!targets[action]) throw new BadRequestException("Action harus VERIFY, POST, atau REJECT.");
    const updated = await this.database.transaction(async (client) => {
      const before = await client.query("SELECT * FROM solar_stock_opname WHERE opname_id=$1 FOR UPDATE", [id]);
      if (!before.rows[0]) throw new BadRequestException("Stock opname tidak ditemukan.");
      const row = await client.query(`UPDATE solar_stock_opname SET status=$2, verified_by=$3, verified_at=CASE WHEN $2 IN ('VERIFIED','POSTED') THEN COALESCE(verified_at,clock_timestamp()) ELSE verified_at END, posted_at=CASE WHEN $2='POSTED' THEN clock_timestamp() ELSE posted_at END, updated_at=clock_timestamp() WHERE opname_id=$1 RETURNING *`, [id, targets[action], user.displayName]);
      await client.query("INSERT INTO solar_audit_event (entity_type,entity_id,action,actor,before_data,after_data) VALUES ('STOCK_OPNAME',$1,$2,$3,$4,$5)", [id,action,user.displayName,before.rows[0],row.rows[0]]);
      return row.rows[0];
    });
    this.realtime.publishDataRefresh(["solar_stock_opname"]);
    return { data_mode: "ACTUAL_DATABASE", opname: updated };
  }

  @Post("ingestion/solar-fueling")
  async ingest(@Body() body: Record<string, any>, @Headers("x-api-key") apiKey?: string) {
    const expected = process.env.INGEST_API_KEY?.trim();
    if (expected && apiKey !== expected) throw new UnauthorizedException("X-API-Key tidak valid.");
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new BadRequestException("Payload harus berupa JSON object.");
    const sourceSystem = String(body.source_system || "SOLAR_MACHINE").trim().toUpperCase();
    const items = Array.isArray(body.transactions) ? body.transactions : [body];
    if (!items.length || items.length > 200) throw new BadRequestException("transactions harus berisi 1 sampai 200 item.");
    const result = await this.database.transaction(async (client) => {
      const operations = [];
      for (const raw of items) {
        const completedAt = raw.date_activated ? isoTimestamp(raw.date_activated,"date_activated") : null;
        const sourceId = raw.id == null || raw.id === "" ? null : Math.trunc(positiveNumber(raw.id,"id"));
        const totalizerIn = raw.total_solar_IN == null ? null : positiveNumber(raw.total_solar_IN,"total_solar_IN");
        const totalizerOut = raw.total_solar_out == null ? null : positiveNumber(raw.total_solar_out,"total_solar_out");
        const calculatedStock = raw.calculated_volume == null ? null : positiveNumber(raw.calculated_volume,"calculated_volume");
        const values = [sourceSystem,sourceId,boundedText(raw.code,"code",160,true),positiveNumber(raw.jumlah,"jumlah"),raw.actual_solar == null ? null : positiveNumber(raw.actual_solar,"actual_solar"),totalizerOut ?? totalizerIn,totalizerIn,totalizerOut,calculatedStock,normalizeSourceStatus(raw.status,completedAt),raw.date_created ? isoTimestamp(raw.date_created,"date_created") : null,completedAt,boundedText(raw.nama_pemesan,"nama_pemesan"),boundedText(raw.nama_pembuat,"nama_pembuat"),boundedText(raw.process_by,"process_by"),boundedText(raw.consumer_id,"consumer_id",120),boundedText(raw.consumer_label,"consumer_label",200),boundedText(raw.keterangan,"keterangan",2000),raw.process_at ? isoTimestamp(raw.process_at,"process_at") : null,JSON.stringify(raw)];
        const upsert = await client.query(`
          INSERT INTO solar_fueling_transaction (source_system,source_id,qr_code,requested_liters,metered_liters,calculated_liters,machine_totalizer_liters,source_totalizer_in_liters,source_totalizer_out_liters,calculated_stock_liters,transaction_status,qr_created_at,fueling_completed_at,requester_name,qr_created_by,processed_by,consumer_id,consumer_label,notes,source_updated_at,raw_payload)
          VALUES ($1,$2,$3,$4,$5,NULL,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20::jsonb)
          ON CONFLICT (source_system,source_id) DO UPDATE SET qr_code=EXCLUDED.qr_code,requested_liters=EXCLUDED.requested_liters,metered_liters=EXCLUDED.metered_liters,calculated_liters=EXCLUDED.calculated_liters,machine_totalizer_liters=EXCLUDED.machine_totalizer_liters,source_totalizer_in_liters=EXCLUDED.source_totalizer_in_liters,source_totalizer_out_liters=EXCLUDED.source_totalizer_out_liters,calculated_stock_liters=EXCLUDED.calculated_stock_liters,transaction_status=EXCLUDED.transaction_status,qr_created_at=EXCLUDED.qr_created_at,fueling_completed_at=EXCLUDED.fueling_completed_at,requester_name=EXCLUDED.requester_name,qr_created_by=EXCLUDED.qr_created_by,processed_by=EXCLUDED.processed_by,consumer_id=EXCLUDED.consumer_id,consumer_label=EXCLUDED.consumer_label,notes=EXCLUDED.notes,source_updated_at=EXCLUDED.source_updated_at,raw_payload=EXCLUDED.raw_payload,updated_at=clock_timestamp()
          RETURNING transaction_id,source_id,qr_code,transaction_status
        `, values);
        operations.push(upsert.rows[0]);
      }
      return operations;
    });
    this.realtime.publishDataRefresh(["solar_fueling_transaction"]);
    return { data_mode: "ACTUAL_DATABASE", storage: "SOLAR_FUELING_TRANSACTION", received: items.length, applied: result.length, transactions: result, server_time: new Date().toISOString() };
  }

  @Post("ingestion/solar-levels")
  async ingestLevels(@Body() body: Record<string, any>, @Headers("x-api-key") apiKey?: string) {
    const expected = process.env.INGEST_API_KEY?.trim();
    if (expected && apiKey !== expected) throw new UnauthorizedException("X-API-Key tidak valid.");
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new BadRequestException("Payload harus berupa JSON object.");
    const sourceSystem = String(body.source_system || "SOLAR_LEVEL_SENSOR").trim().toUpperCase();
    const samples = Array.isArray(body.samples) ? body.samples : [body];
    if (!samples.length || samples.length > 1000) throw new BadRequestException("samples harus berisi 1 sampai 1000 item.");
    const rows = await this.database.transaction(async (client) => {
      const applied = [];
      for (const raw of samples) {
        const stock = Number(raw.stock_liters ?? raw.stock ?? raw.value);
        if (!Number.isFinite(stock)) throw new BadRequestException("stock_liters harus berupa angka finite.");
        const sourceId = Math.trunc(positiveNumber(raw.source_id ?? raw.id, "source_id"));
        const sourceTs = isoTimestamp(raw.source_ts ?? raw.update_at ?? raw.created_at, "source_ts", new Date());
        const good = stock >= 0 && stock <= 100000;
        const result = await client.query(`
          INSERT INTO solar_level_sample (source_system,source_id,tank_id,stock_liters,quality,quality_reason,source_ts,source_created_at)
          VALUES ($1,$2,'SOLAR-MAIN',$3,$4,$5,$6,$7)
          ON CONFLICT (source_system,source_id) DO UPDATE SET stock_liters=EXCLUDED.stock_liters,quality=EXCLUDED.quality,quality_reason=EXCLUDED.quality_reason,source_ts=EXCLUDED.source_ts,source_created_at=EXCLUDED.source_created_at,updated_at=clock_timestamp()
          RETURNING level_sample_id,source_id,stock_liters,quality,source_ts
        `, [sourceSystem,sourceId,stock,good ? "GOOD" : "BAD",good ? null : "Nilai di luar sanity range 0–100000 liter",sourceTs,raw.created_at ? isoTimestamp(raw.created_at,"created_at") : sourceTs]);
        applied.push(result.rows[0]);
      }
      return applied;
    });
    this.realtime.publishDataRefresh(["solar_level_sample"]);
    return { data_mode:"ACTUAL_DATABASE",storage:"SOLAR_LEVEL_SAMPLE",received:samples.length,applied:rows.length,samples:rows,server_time:new Date().toISOString() };
  }
}
