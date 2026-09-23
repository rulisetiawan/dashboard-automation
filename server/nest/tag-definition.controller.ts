import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { DatabaseService } from "./database.service.js";

@Controller("api/v1/tag-definitions")
export class TagDefinitionController {
  constructor(private readonly database: DatabaseService) {}

  private authorize(apiKey?: string) {
    const expected = process.env.INGEST_API_KEY?.trim();
    if (expected && apiKey !== expected) {
      throw new UnauthorizedException("X-API-Key tidak valid.");
    }
  }

  @Get()
  async getTagDefinitions(
    @Query("asset_id") assetId?: string,
    @Query("active") active?: string,
  ) {
    const clauses: string[] = [];
    const values: unknown[] = [];

    const isActive = active == null || active === "" || active === "true" || active === "1";
    const filterAll = active === "all";

    if (!filterAll) {
      values.push(isActive);
      clauses.push(`active = $${values.length}`);
    }

    if (assetId && assetId.trim()) {
      values.push(assetId.trim());
      clauses.push(`asset_id = $${values.length}`);
    }

    const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await this.database.query(`
      SELECT tag_code, asset_id, signal_role, engineering_unit, source_status, active
      FROM tag_definition
      ${whereClause}
      ORDER BY tag_code ASC
    `, values);

    return result.rows.map((row) => ({
      tag_code: row.tag_code,
      asset_id: row.asset_id,
      signal_role: row.signal_role,
      engineering_unit: row.engineering_unit ?? "",
      source_status: row.source_status,
      active: row.active,
    }));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTagDefinition(
    @Body() body: Record<string, any>,
    @Headers("x-api-key") apiKey?: string,
  ) {
    this.authorize(apiKey);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new BadRequestException("Request body harus berupa JSON object.");
    }

    const tagCode = String(body.tag_code ?? "").trim();
    if (!tagCode) throw new BadRequestException("tag_code wajib diisi.");
    if (tagCode.length > 240) throw new BadRequestException("tag_code maksimal 240 karakter.");

    const assetId = String(body.asset_id ?? "").trim();
    if (!assetId) throw new BadRequestException("asset_id wajib diisi.");
    if (assetId.length > 80) throw new BadRequestException("asset_id maksimal 80 karakter.");

    // Verifikasi asset_id ada di tabel asset
    const assetCheck = await this.database.query("SELECT asset_id FROM asset WHERE asset_id = $1", [assetId]);
    if (!assetCheck.rows[0]) {
      throw new BadRequestException(`Asset '${assetId}' tidak ditemukan di tabel asset.`);
    }

    const signalRole = String(body.signal_role ?? "MEASUREMENT").trim().toUpperCase();
    const engineeringUnit = body.engineering_unit == null ? "" : String(body.engineering_unit).trim();
    const sourceStatus = String(body.source_status ?? "MAPPED").trim().toUpperCase();
    const active = body.active === undefined ? true : Boolean(body.active);

    await this.database.query(`
      INSERT INTO tag_definition (tag_code, asset_id, signal_role, engineering_unit, source_status, active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, clock_timestamp())
      ON CONFLICT (tag_code) DO UPDATE SET
        asset_id = EXCLUDED.asset_id,
        signal_role = EXCLUDED.signal_role,
        engineering_unit = EXCLUDED.engineering_unit,
        source_status = EXCLUDED.source_status,
        active = EXCLUDED.active
    `, [tagCode, assetId, signalRole, engineeringUnit, sourceStatus, active]);

    return {
      status: "success",
      message: "Tag definition created",
      tag_code: tagCode,
    };
  }
}
