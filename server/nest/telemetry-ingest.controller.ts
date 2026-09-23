import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "./database.service.js";
import { RealtimeGateway } from "./realtime.gateway.js";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type NormalizedSample = {
  assetId: string;
  tagCode: string;
  sourceTs: string;
  valueNumber: number | null;
  valueText: string | null;
  quality: string;
  gatewayId: string | null;
  messageId: string;
};

@Controller("api/v1/telemetry")
export class TelemetryIngestController {
  constructor(
    private readonly database: DatabaseService,
    private readonly realtime: RealtimeGateway,
  ) {}

  private authorize(apiKey?: string) {
    const expected = process.env.INGEST_API_KEY?.trim();
    if (expected && apiKey !== expected) {
      throw new UnauthorizedException("X-API-Key tidak valid.");
    }
  }

  @Post("ingest")
  @HttpCode(HttpStatus.OK)
  async ingestTelemetry(
    @Body() body: unknown,
    @Headers("x-api-key") apiKey?: string,
  ) {
    this.authorize(apiKey);

    const rawSamples: Record<string, any>[] = Array.isArray(body)
      ? body
      : Array.isArray((body as any)?.samples)
        ? (body as any).samples
        : (body && typeof body === "object")
          ? [body as Record<string, any>]
          : [];

    if (!rawSamples.length) {
      throw new BadRequestException("Payload harus berisi minimal satu telemetry sample.");
    }

    if (rawSamples.length > 500) {
      throw new BadRequestException("Maksimal 500 telemetry sample dalam satu batch.");
    }

    const now = new Date().toISOString();
    const normalizedSamples: NormalizedSample[] = [];

    for (let i = 0; i < rawSamples.length; i++) {
      const item = rawSamples[i];
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw new BadRequestException(`Item index ${i} harus berupa JSON object.`);
      }

      const assetId = String(item.asset_id ?? "").trim();
      if (!assetId) throw new BadRequestException(`Item index ${i}: asset_id wajib diisi.`);

      const tagCode = String(item.tag_code ?? "").trim();
      if (!tagCode) throw new BadRequestException(`Item index ${i}: tag_code wajib diisi.`);

      let parsedTs = now;
      if (item.source_ts != null && item.source_ts !== "") {
        const d = new Date(item.source_ts);
        if (Number.isNaN(d.getTime())) {
          throw new BadRequestException(`Item index ${i} (${tagCode}): source_ts harus berupa ISO timestamp yang valid.`);
        }
        parsedTs = d.toISOString();
      }

      let valueNumber: number | null = null;
      let valueText: string | null = null;

      if (item.value_number != null) {
        const num = Number(item.value_number);
        if (!Number.isFinite(num)) {
          throw new BadRequestException(`Item index ${i} (${tagCode}): value_number tidak valid.`);
        }
        valueNumber = num;
      }

      if (item.value_text != null) {
        valueText = String(item.value_text);
      }

      // Fallback jika dikirim field 'value' umum
      if (valueNumber == null && valueText == null && item.value != null) {
        if (typeof item.value === "number") {
          valueNumber = Number.isFinite(item.value) ? item.value : null;
        } else {
          valueText = String(item.value);
        }
      }

      const quality = String(item.quality ?? "GOOD").trim().toUpperCase() || "GOOD";
      const gatewayId = item.gateway_id != null ? String(item.gateway_id).trim() : null;

      let msgId = String(item.message_id ?? "").trim();
      if (!msgId || !uuidPattern.test(msgId)) {
        msgId = randomUUID();
      }

      normalizedSamples.push({
        assetId,
        tagCode,
        sourceTs: parsedTs,
        valueNumber,
        valueText,
        quality,
        gatewayId,
        messageId: msgId,
      });
    }

    // Validasi asset_id dan tag_code di database
    const uniqueAssetIds = [...new Set(normalizedSamples.map((s) => s.assetId))];
    const uniqueTagCodes = [...new Set(normalizedSamples.map((s) => s.tagCode))];

    const [existingAssets, existingTags] = await Promise.all([
      this.database.query<{ asset_id: string }>(
        "SELECT asset_id FROM asset WHERE asset_id = ANY($1::text[])",
        [uniqueAssetIds],
      ),
      this.database.query<{ tag_code: string; asset_id: string }>(
        "SELECT tag_code, asset_id FROM tag_definition WHERE tag_code = ANY($1::text[])",
        [uniqueTagCodes],
      ),
    ]);

    const validAssetSet = new Set(existingAssets.rows.map((r) => r.asset_id));
    const missingAssets = uniqueAssetIds.filter((id) => !validAssetSet.has(id));
    if (missingAssets.length > 0) {
      throw new BadRequestException(`Asset tidak terdaftar: ${missingAssets.join(", ")}`);
    }

    const validTagMap = new Map(existingTags.rows.map((r) => [r.tag_code, r.asset_id]));
    const missingTags = uniqueTagCodes.filter((code) => !validTagMap.has(code));
    if (missingTags.length > 0) {
      throw new BadRequestException(
        `Tag tidak terdaftar dalam tag_definition: ${missingTags.join(", ")}. Daftarkan terlebih dahulu via POST /api/v1/tag-definitions.`,
      );
    }

    // Insert ke telemetry_sample secara batch dalam transaksi
    const insertedTags: string[] = [];
    let insertedCount = 0;

    await this.database.transaction(async (client) => {
      for (const sample of normalizedSamples) {
        const result = await client.query<{ id: string; tag_code: string }>(`
          INSERT INTO telemetry_sample (
            asset_id, tag_code, source_ts, value_number, value_text, quality, gateway_id, message_id, ingested_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, clock_timestamp())
          ON CONFLICT (message_id, tag_code) DO NOTHING
          RETURNING id, tag_code
        `, [
          sample.assetId,
          sample.tagCode,
          sample.sourceTs,
          sample.valueNumber,
          sample.valueText,
          sample.quality,
          sample.gatewayId,
          sample.messageId,
        ]);

        if (result.rows[0]) {
          insertedCount++;
          insertedTags.push(result.rows[0].tag_code);
        }
      }
    });

    // Broadcast ke klien dashboard via Socket.IO realtime
    if (insertedTags.length > 0) {
      const distinctTags = [...new Set(insertedTags)];
      await this.realtime.publishInstrumentTags(distinctTags).catch(() => undefined);
    }

    return {
      status: "success",
      message: "Telemetry samples ingested",
      received: normalizedSamples.length,
      inserted: insertedCount,
      server_time: new Date().toISOString(),
    };
  }
}
