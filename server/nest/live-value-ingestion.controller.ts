import { BadRequestException, Body, Controller, Headers, Post, UnauthorizedException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "./database.service.js";
import { RealtimeGateway } from "./realtime.gateway.js";

const allowedQualities = new Set(["GOOD", "BAD", "STALE", "NOT_CONNECTED"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type NormalizedLiveValue = {
  assetId: string;
  tagCode: string;
  valueNumber: number | null;
  valueText: string | null;
  quality: string;
  sourceTs: string;
  gatewayId: string;
  messageId: string;
};

function boundedText(value: unknown, field: string, maximum: number, fallback?: string) {
  const text = String(value ?? fallback ?? "").trim();
  if (!text) throw new BadRequestException(`${field} wajib diisi.`);
  if (text.length > maximum) throw new BadRequestException(`${field} maksimal ${maximum} karakter.`);
  return text;
}

function timestamp(value: unknown, fallback: string) {
  const parsed = new Date(value == null || value === "" ? fallback : String(value));
  if (Number.isNaN(parsed.getTime())) throw new BadRequestException("source_ts harus berupa ISO-8601 timestamp yang valid.");
  if (parsed.getTime() > Date.now() + 5 * 60_000) throw new BadRequestException("source_ts tidak boleh lebih dari 5 menit di masa depan.");
  return parsed.toISOString();
}

function messageId(value: unknown) {
  if (value == null || value === "") return randomUUID();
  const normalized = String(value).trim();
  if (!uuidPattern.test(normalized)) throw new BadRequestException("message_id harus berupa UUID yang valid.");
  return normalized;
}

function normalizeValue(raw: Record<string, any>, envelope: Record<string, any>, fallbackTs: string): NormalizedLiveValue {
  const assetId = boundedText(raw.asset_id ?? envelope.asset_id, "asset_id", 80).toUpperCase();
  if (!/^[A-Z0-9-]{3,80}$/.test(assetId)) throw new BadRequestException("asset_id hanya boleh memakai huruf, angka, dan dash.");
  const tagCode = boundedText(raw.tag_code ?? envelope.tag_code, "tag_code", 240).toUpperCase();
  const gatewayId = boundedText(raw.gateway_id ?? envelope.gateway_id, "gateway_id", 80, "EXTERNAL_LIVE_API");
  const quality = boundedText(raw.quality ?? envelope.quality, "quality", 24, "GOOD").toUpperCase();
  if (!allowedQualities.has(quality)) throw new BadRequestException(`quality tidak valid. Pilihan: ${[...allowedQualities].join(", ")}.`);

  let numberValue = raw.value_number;
  let textValue = raw.value_text;
  if (numberValue == null && textValue == null && raw.value != null) {
    if (typeof raw.value === "number") numberValue = raw.value;
    else textValue = String(raw.value);
  }
  if (numberValue != null && textValue != null) throw new BadRequestException(`Tag ${tagCode} hanya boleh memiliki value_number atau value_text.`);
  if (numberValue == null && textValue == null) throw new BadRequestException(`Tag ${tagCode} wajib memiliki value_number atau value_text.`);

  const parsedNumber = numberValue == null ? null : Number(numberValue);
  if (parsedNumber != null && !Number.isFinite(parsedNumber)) throw new BadRequestException(`value_number untuk ${tagCode} harus berupa angka finite.`);
  const parsedText = textValue == null ? null : String(textValue).trim();
  if (parsedText != null && !parsedText) throw new BadRequestException(`value_text untuk ${tagCode} tidak boleh kosong.`);
  if (parsedText != null && parsedText.length > 500) throw new BadRequestException(`value_text untuk ${tagCode} maksimal 500 karakter.`);

  return {
    assetId,
    tagCode,
    valueNumber: parsedNumber,
    valueText: parsedText,
    quality,
    sourceTs: timestamp(raw.source_ts ?? envelope.source_ts, fallbackTs),
    gatewayId,
    messageId: messageId(raw.message_id ?? envelope.message_id),
  };
}

@Controller("api/v1/ingestion")
export class LiveValueIngestionController {
  constructor(private readonly database: DatabaseService, private readonly realtime: RealtimeGateway) {}

  private authorize(apiKey?: string) {
    const expected = process.env.INGEST_API_KEY?.trim();
    if (expected && apiKey !== expected) throw new UnauthorizedException("X-API-Key tidak valid.");
  }

  @Post("live-values")
  async ingest(@Body() body: Record<string, any>, @Headers("x-api-key") apiKey?: string) {
    this.authorize(apiKey);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new BadRequestException("Payload harus berupa JSON object.");

    const rawValues = Array.isArray(body.values) ? body.values : [body];
    if (!rawValues.length) throw new BadRequestException("values minimal berisi satu nilai.");
    if (rawValues.length > 200) throw new BadRequestException("Maksimal 200 nilai dalam satu request.");
    if (rawValues.some((value) => !value || typeof value !== "object" || Array.isArray(value))) {
      throw new BadRequestException("Setiap item values harus berupa JSON object.");
    }

    const receivedAt = new Date().toISOString();
    const values = rawValues.map((value) => normalizeValue(value, body, receivedAt));
    const duplicateTags = values.filter((value, index) => values.findIndex((candidate) => candidate.tagCode === value.tagCode) !== index);
    if (duplicateTags.length) throw new BadRequestException(`Tag duplikat dalam request: ${[...new Set(duplicateTags.map((value) => value.tagCode))].join(", ")}.`);

    const results = await this.database.transaction(async (client) => {
      const definitions = await client.query(`
        SELECT definition.tag_code, definition.asset_id
        FROM tag_definition definition
        JOIN asset ON asset.asset_id = definition.asset_id
        WHERE definition.tag_code = ANY($1::text[])
          AND definition.active = TRUE
          AND asset.active = TRUE
      `, [values.map((value) => value.tagCode)]);
      const definitionByTag = new Map(definitions.rows.map((row) => [row.tag_code, row]));
      const missing = values.filter((value) => !definitionByTag.has(value.tagCode)).map((value) => value.tagCode);
      if (missing.length) throw new BadRequestException(`Tag tidak terdaftar atau tidak aktif: ${missing.join(", ")}.`);
      const mismatched = values.filter((value) => definitionByTag.get(value.tagCode)?.asset_id !== value.assetId);
      if (mismatched.length) throw new BadRequestException(`Tag tidak sesuai asset: ${mismatched.map((value) => `${value.tagCode} ≠ ${value.assetId}`).join(", ")}.`);

      const operations: Record<string, any>[] = [];
      for (const value of values) {
        const upsert = await client.query(`
          INSERT INTO tag_latest (
            tag_code, asset_id, value_number, value_text, quality, source_ts,
            ingested_at, gateway_id, message_id, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,clock_timestamp())
          ON CONFLICT (tag_code) DO UPDATE SET
            asset_id = EXCLUDED.asset_id,
            value_number = EXCLUDED.value_number,
            value_text = EXCLUDED.value_text,
            quality = EXCLUDED.quality,
            source_ts = EXCLUDED.source_ts,
            ingested_at = EXCLUDED.ingested_at,
            gateway_id = EXCLUDED.gateway_id,
            message_id = EXCLUDED.message_id,
            updated_at = clock_timestamp()
          WHERE EXCLUDED.source_ts > tag_latest.source_ts
             OR (EXCLUDED.source_ts = tag_latest.source_ts AND EXCLUDED.message_id IS DISTINCT FROM tag_latest.message_id)
          RETURNING tag_code, asset_id, value_number, value_text, quality, source_ts, gateway_id, message_id, updated_at
        `, [
          value.tagCode, value.assetId, value.valueNumber, value.valueText, value.quality,
          value.sourceTs, receivedAt, value.gatewayId, value.messageId,
        ]);
        operations.push({
          tag_code: value.tagCode,
          asset_id: value.assetId,
          operation: upsert.rows[0] ? "APPLIED" : "IGNORED_STALE_OR_DUPLICATE",
          ...(upsert.rows[0] || { source_ts: value.sourceTs, message_id: value.messageId }),
        });
      }
      return operations;
    });

    const appliedTags = results.filter((result) => result.operation === "APPLIED").map((result) => result.tag_code);
    if (appliedTags.length) await this.realtime.publishInstrumentTags(appliedTags);
    return {
      data_mode: "ACTUAL_DATABASE",
      storage: "TAG_LATEST_ONLY",
      received: values.length,
      applied: appliedTags.length,
      ignored: values.length - appliedTags.length,
      results,
      server_time: new Date().toISOString(),
    };
  }
}
