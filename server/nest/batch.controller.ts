import { BadRequestException, Body, ConflictException, Controller, Get, Headers, NotFoundException, Param, Post, Query, UnauthorizedException, UseFilters } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "./database.service.js";
import { RealtimeGateway } from "./realtime.gateway.js";
import { BatchIngestionExceptionFilter } from "./batch-ingestion-exception.filter.js";

const batchStatuses = new Set(["PLANNED", "IN_PROCESS", "HOLD", "COMPLETED", "CANCELLED"]);
const runStatuses = new Set(["PLANNED", "RUNNING", "HOLD", "COMPLETED", "CANCELLED", "FAILED"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requiredText(body: Record<string, any>, key: string, maxLength = 120) {
  const value = String(body?.[key] ?? "").trim();
  if (!value) throw new BadRequestException(`${key} wajib diisi.`);
  if (value.length > maxLength) throw new BadRequestException(`${key} maksimal ${maxLength} karakter.`);
  return value;
}

function optionalText(body: Record<string, any>, key: string, maxLength = 200) {
  if (body?.[key] == null || body[key] === "") return null;
  const value = String(body[key]).trim();
  if (value.length > maxLength) throw new BadRequestException(`${key} maksimal ${maxLength} karakter.`);
  return value || null;
}

function optionalNumber(body: Record<string, any>, key: string, minimum = 0, maximum = Number.POSITIVE_INFINITY) {
  if (body?.[key] == null || body[key] === "") return null;
  const value = Number(body[key]);
  if (!Number.isFinite(value) || value < minimum || value > maximum) throw new BadRequestException(`${key} harus berupa angka ${minimum}–${Number.isFinite(maximum) ? maximum : "∞"}.`);
  return value;
}

function optionalDate(body: Record<string, any>, key: string) {
  if (body?.[key] == null || body[key] === "") return null;
  const value = new Date(body[key]);
  if (Number.isNaN(value.getTime())) throw new BadRequestException(`${key} harus berupa ISO-8601 timestamp yang valid.`);
  return value.toISOString();
}

function enumValue(body: Record<string, any>, key: string, allowed: Set<string>) {
  if (body?.[key] == null || body[key] === "") return null;
  const value = String(body[key]).trim().toUpperCase();
  if (!allowed.has(value)) throw new BadRequestException(`${key} tidak valid. Pilihan: ${[...allowed].join(", ")}.`);
  return value;
}

function metadataValue(body: Record<string, any>) {
  const metadata = body?.metadata;
  if (metadata == null) return {};
  if (typeof metadata !== "object" || Array.isArray(metadata)) throw new BadRequestException("metadata harus berupa JSON object.");
  return metadata;
}

@Controller("api/v1/batch")
@UseFilters(BatchIngestionExceptionFilter)
export class BatchController {
  constructor(private readonly database: DatabaseService, private readonly realtime: RealtimeGateway) {}

  private authorize(apiKey?: string) {
    const expected = process.env.INGEST_API_KEY?.trim();
    if (expected && apiKey !== expected) throw new UnauthorizedException("X-API-Key tidak valid.");
  }

  @Post("production-batches")
  async upsertProductionBatch(@Body() body: Record<string, any>, @Headers("x-api-key") apiKey?: string) {
    this.authorize(apiKey);
    const batchNo = requiredText(body, "batch_no", 64).toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9._\/-]*$/.test(batchNo)) throw new BadRequestException("batch_no hanya boleh memakai huruf, angka, titik, underscore, slash, dan dash.");
    const status = enumValue(body, "batch_status", batchStatuses);
    const sourceSystem = (optionalText(body, "source_system", 80) || "EXTERNAL_API").toUpperCase();
    const sourceUpdatedAt = optionalDate(body, "source_updated_at") || new Date().toISOString();
    const now = new Date().toISOString();
    const values = [
      batchNo,
      optionalText(body, "customer_name", 160),
      optionalText(body, "fabric_type", 160),
      optionalNumber(body, "fabric_weight_gsm"),
      optionalNumber(body, "target_width_cm"),
      optionalNumber(body, "target_output_kg"),
      optionalDate(body, "delivery_target_at"),
      status,
      sourceSystem,
      optionalText(body, "external_reference", 160),
      sourceUpdatedAt,
      JSON.stringify(metadataValue(body)),
      now,
    ];
    const result = await this.database.query(`
      INSERT INTO production_batch (
        batch_no, customer_name, fabric_type, fabric_weight_gsm, target_width_cm,
        target_output_kg, delivery_target_at, batch_status, source_system,
        external_reference, source_updated_at, payload_json, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8,'PLANNED'),$9,$10,$11,$12::jsonb,$13,$13)
      ON CONFLICT (batch_no) DO UPDATE SET
        customer_name = COALESCE(EXCLUDED.customer_name, production_batch.customer_name),
        fabric_type = COALESCE(EXCLUDED.fabric_type, production_batch.fabric_type),
        fabric_weight_gsm = COALESCE(EXCLUDED.fabric_weight_gsm, production_batch.fabric_weight_gsm),
        target_width_cm = COALESCE(EXCLUDED.target_width_cm, production_batch.target_width_cm),
        target_output_kg = COALESCE(EXCLUDED.target_output_kg, production_batch.target_output_kg),
        delivery_target_at = COALESCE(EXCLUDED.delivery_target_at, production_batch.delivery_target_at),
        batch_status = COALESCE($8, production_batch.batch_status),
        source_system = EXCLUDED.source_system,
        external_reference = COALESCE(EXCLUDED.external_reference, production_batch.external_reference),
        source_updated_at = EXCLUDED.source_updated_at,
        payload_json = production_batch.payload_json || EXCLUDED.payload_json,
        updated_at = EXCLUDED.updated_at
      WHERE production_batch.source_updated_at IS NULL OR EXCLUDED.source_updated_at >= production_batch.source_updated_at
      RETURNING *, (xmax = 0) AS inserted
    `, values);
    const row = result.rows[0] || (await this.database.query("SELECT * FROM production_batch WHERE batch_no = $1", [batchNo])).rows[0];
    const operation = result.rows[0] ? (row.inserted ? "CREATED" : "UPDATED") : "IGNORED_STALE";
    if (operation !== "IGNORED_STALE") this.realtime.publishDataRefresh(["production_batch"]);
    return { data_mode: "ACTUAL_DATABASE", operation, batch: row };
  }

  @Post("process-runs")
  async upsertProcessRun(@Body() body: Record<string, any>, @Headers("x-api-key") apiKey?: string, @Headers("idempotency-key") idempotencyKey?: string) {
    this.authorize(apiKey);
    const batchNo = requiredText(body, "batch_no", 64).toUpperCase();
    const assetId = requiredText(body, "asset_id", 80).toUpperCase();
    const sourceSystem = (optionalText(body, "source_system", 80) || "EXTERNAL_API").toUpperCase();
    const externalRunId = optionalText(body, "external_run_id", 160) || optionalText(body, "message_id", 160) || (idempotencyKey ? String(idempotencyKey).trim().slice(0, 160) : null);
    const providedRunId = optionalText(body, "process_run_id", 36);
    if (!externalRunId && !providedRunId) throw new BadRequestException("external_run_id, message_id, process_run_id, atau header Idempotency-Key wajib diisi.");
    if (providedRunId && !uuidPattern.test(providedRunId)) throw new BadRequestException("process_run_id harus berupa UUID yang valid.");
    const status = enumValue(body, "run_status", runStatuses);
    const startedAt = optionalDate(body, "started_at");
    const endedAt = optionalDate(body, "ended_at");
    if (startedAt && endedAt && new Date(endedAt) < new Date(startedAt)) throw new BadRequestException("ended_at tidak boleh lebih awal dari started_at.");
    const progress = optionalNumber(body, "progress_percent", 0, 100);
    const sourceUpdatedAt = optionalDate(body, "source_updated_at") || new Date().toISOString();
    const now = new Date().toISOString();

    const transactionResult = await this.database.transaction(async (client) => {
      const [batch, asset] = await Promise.all([
        client.query("SELECT batch_no FROM production_batch WHERE batch_no = $1", [batchNo]),
        client.query("SELECT asset_id, process_type FROM asset WHERE asset_id = $1 AND active = TRUE", [assetId]),
      ]);
      if (!batch.rows[0]) throw new NotFoundException(`production_batch ${batchNo} belum terdaftar. POST production batch terlebih dahulu.`);
      if (!asset.rows[0]) throw new NotFoundException(`asset ${assetId} tidak ditemukan atau tidak aktif.`);
      const processType = asset.rows[0].process_type;
      const requestedProcess = optionalText(body, "process_type", 40)?.toLowerCase();
      if (requestedProcess && requestedProcess !== processType) throw new BadRequestException(`process_type harus ${processType} sesuai master asset ${assetId}.`);

      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${sourceSystem}|${externalRunId || providedRunId}`]);
      const existing = await client.query(`
        SELECT process_run_id
        FROM batch_process_run
        WHERE ($1::text IS NOT NULL AND source_system = $2 AND external_run_id = $1)
           OR ($3::uuid IS NOT NULL AND process_run_id = $3::uuid)
        LIMIT 2
      `, [externalRunId, sourceSystem, providedRunId]);
      if (existing.rowCount > 1) throw new ConflictException("external_run_id dan process_run_id menunjuk dua process run yang berbeda.");
      const processRunId = existing.rows[0]?.process_run_id || providedRunId || randomUUID();

      if (["RUNNING", "HOLD"].includes(status || "PLANNED")) {
        const active = await client.query(`
          SELECT process_run_id, batch_no
          FROM batch_process_run
          WHERE asset_id = $1 AND run_status IN ('RUNNING','HOLD') AND process_run_id <> $2
          LIMIT 1
        `, [assetId, processRunId]);
        if (active.rows[0]) throw new ConflictException(`Asset ${assetId} masih memiliki active run ${active.rows[0].process_run_id} untuk batch ${active.rows[0].batch_no}.`);
      }

      const upsert = await client.query(`
        INSERT INTO batch_process_run (
          process_run_id, batch_no, asset_id, process_type, recipe_code, run_status,
          started_at, ended_at, output_quantity, output_unit, source_system,
          external_run_id, source_updated_at, payload_json, progress_percent, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,COALESCE($6,'PLANNED'),$7,$8,$9,$10,$11,$12,$13,$14::jsonb,
          COALESCE($15::numeric, CASE WHEN COALESCE($6,'PLANNED') = 'COMPLETED' THEN 100::numeric END),$16,$16)
        ON CONFLICT (process_run_id) DO UPDATE SET
          batch_no = EXCLUDED.batch_no,
          asset_id = EXCLUDED.asset_id,
          process_type = EXCLUDED.process_type,
          recipe_code = COALESCE(EXCLUDED.recipe_code, batch_process_run.recipe_code),
          run_status = COALESCE($6, batch_process_run.run_status),
          started_at = COALESCE(EXCLUDED.started_at, batch_process_run.started_at),
          ended_at = COALESCE(EXCLUDED.ended_at, batch_process_run.ended_at),
          output_quantity = COALESCE(EXCLUDED.output_quantity, batch_process_run.output_quantity),
          output_unit = COALESCE(EXCLUDED.output_unit, batch_process_run.output_unit),
          source_system = EXCLUDED.source_system,
          external_run_id = COALESCE(EXCLUDED.external_run_id, batch_process_run.external_run_id),
          source_updated_at = EXCLUDED.source_updated_at,
          payload_json = batch_process_run.payload_json || EXCLUDED.payload_json,
          progress_percent = COALESCE(
            EXCLUDED.progress_percent,
            CASE WHEN COALESCE($6, batch_process_run.run_status) = 'COMPLETED' THEN 100::numeric END,
            batch_process_run.progress_percent
          ),
          updated_at = EXCLUDED.updated_at
        WHERE batch_process_run.source_updated_at IS NULL OR EXCLUDED.source_updated_at >= batch_process_run.source_updated_at
        RETURNING *, (xmax = 0) AS inserted
      `, [
        processRunId, batchNo, assetId, processType, optionalText(body, "recipe_code", 120), status,
        startedAt, endedAt, optionalNumber(body, "output_quantity"), optionalText(body, "output_unit", 24),
        sourceSystem, externalRunId, sourceUpdatedAt, JSON.stringify(metadataValue(body)), progress, now,
      ]);
      const run = upsert.rows[0] || (await client.query("SELECT * FROM batch_process_run WHERE process_run_id = $1", [processRunId])).rows[0];
      const operation = upsert.rows[0] ? (run.inserted ? "CREATED" : "UPDATED") : "IGNORED_STALE";

      if (operation !== "IGNORED_STALE" && ["RUNNING", "HOLD"].includes(run.run_status)) {
        await client.query(`
          INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, values_json, updated_at)
          VALUES ($1,$2,$3,COALESCE($4::numeric,0::numeric),TRUE,$5,'GOOD','{}'::jsonb,$6)
          ON CONFLICT (asset_id) DO UPDATE SET
            batch_no = EXCLUDED.batch_no,
            progress_percent = CASE WHEN $4::numeric IS NULL THEN asset_snapshot.progress_percent ELSE EXCLUDED.progress_percent END,
            updated_at = EXCLUDED.updated_at
        `, [assetId, run.run_status === "HOLD" ? "warning" : "running", batchNo, run.progress_percent, sourceUpdatedAt, now]);
      } else if (operation !== "IGNORED_STALE" && ["COMPLETED", "CANCELLED", "FAILED"].includes(run.run_status)) {
        await client.query(`
          UPDATE asset_snapshot
          SET batch_no = NULL,
              progress_percent = CASE WHEN $3 = 'COMPLETED' THEN 100 ELSE progress_percent END,
              updated_at = $4
          WHERE asset_id = $1 AND batch_no = $2
        `, [assetId, batchNo, run.run_status, now]);
      }
      return { operation, run };
    });
    if (transactionResult.operation !== "IGNORED_STALE") this.realtime.publishDataRefresh(["production_batch", "batch_process_run", "asset_snapshot"]);
    return { data_mode: "ACTUAL_DATABASE", ...transactionResult };
  }

  @Get("lookup")
  async lookup(@Query("asset_id") assetId?: string, @Query("batch_no") batchNo?: string) {
    if (!assetId || !batchNo) throw new BadRequestException("asset_id dan batch_no wajib diisi.");
    const result = await this.database.query(`
      SELECT *
      FROM batch_process_run
      WHERE asset_id = $1 AND UPPER(batch_no) = UPPER($2)
      ORDER BY started_at DESC NULLS LAST
      LIMIT 1
    `, [assetId, batchNo]);
    if (!result.rows[0]) throw new NotFoundException("batch process run not found");
    return { data_mode: "ACTUAL_DATABASE", run: result.rows[0] };
  }

  @Get("process-runs/:processRunId/context")
  async processRunContext(@Param("processRunId") processRunId: string) {
    const run = await this.database.query(`
      SELECT
        r.*,
        b.customer_name,
        b.fabric_type,
        b.fabric_weight_gsm,
        b.target_width_cm,
        b.target_output_kg,
        b.delivery_target_at,
        b.batch_status
      FROM batch_process_run r
      JOIN production_batch b ON b.batch_no = r.batch_no
      WHERE r.process_run_id = $1
    `, [processRunId]);
    if (!run.rows[0]) throw new NotFoundException("process run not found");

    const [steps, transitions, alarms, targets, setpointChanges, deviations] = await Promise.all([
      this.database.query("SELECT * FROM process_step_execution WHERE process_run_id = $1 ORDER BY step_no", [processRunId]),
      this.database.query("SELECT * FROM process_transition_event WHERE process_run_id = $1 ORDER BY source_ts", [processRunId]),
      this.database.query(`
        SELECT *
        FROM alarm_event
        WHERE process_run_id = $5
          OR batch_no = $2
          OR (
            asset_id = $1
            AND occurred_at >= $3
            AND occurred_at <= COALESCE($4, NOW())
          )
        ORDER BY occurred_at
      `, [run.rows[0].asset_id, run.rows[0].batch_no, run.rows[0].started_at, run.rows[0].ended_at, processRunId]),
      this.database.query(`
        SELECT t.*, r.rule_code, r.rule_name, r.severity, r.impact_code,
               td.engineering_unit, s.step_no, s.step_code, s.step_name
        FROM process_target_execution t
        JOIN process_deviation_rule r ON r.rule_id=t.rule_id
        LEFT JOIN tag_definition td ON td.tag_code=t.pv_tag_code
        LEFT JOIN process_step_execution s ON s.step_execution_id=t.step_execution_id
        WHERE t.process_run_id=$1
        ORDER BY t.tracking_started_at, t.parameter_code, t.revision_no
      `, [processRunId]),
      this.database.query(`
        SELECT c.*, r.rule_code, r.rule_name, s.step_no, s.step_code, s.step_name
        FROM process_setpoint_change_event c
        JOIN process_deviation_rule r ON r.rule_id=c.rule_id
        LEFT JOIN process_step_execution s ON s.step_execution_id=c.step_execution_id
        WHERE c.process_run_id=$1
        ORDER BY c.changed_at, c.parameter_code
      `, [processRunId]),
      this.database.query(`
        SELECT d.*, r.rule_code, r.rule_name, r.alarm_message, r.recommendation,
               td.signal_role AS parameter_code, td.engineering_unit,
               s.step_no, s.step_code, s.step_name
        FROM process_deviation_event d
        JOIN process_deviation_rule r ON r.rule_id=d.rule_id
        JOIN tag_definition td ON td.tag_code=d.pv_tag_code
        LEFT JOIN process_step_execution s ON s.step_execution_id=d.step_execution_id
        WHERE d.process_run_id=$1
        ORDER BY d.started_at
      `, [processRunId]),
    ]);

    return {
      data_mode: "ACTUAL_DATABASE",
      run: run.rows[0],
      steps: steps.rows,
      transitions: transitions.rows,
      alarms: alarms.rows,
      targets: targets.rows,
      setpoint_changes: setpointChanges.rows,
      deviations: deviations.rows,
    };
  }
}
