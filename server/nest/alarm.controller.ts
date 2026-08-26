import { BadRequestException, Body, Controller, Get, Headers, NotFoundException, Param, Patch, Post, Query } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "./database.service.js";

const ruleTypes = new Set(["HIGH", "HIGH_HIGH", "LOW", "LOW_LOW"]);
const severities = new Set(["INFO", "WARNING", "CRITICAL"]);

const textValue = (value: unknown, maxLength: number, required = false) => {
  const text = String(value ?? "").trim().slice(0, maxLength);
  if (required && !text) throw new BadRequestException("Field wajib belum diisi.");
  return text || null;
};

const numberValue = (value: unknown, field: string, minimum?: number, maximum?: number) => {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new BadRequestException(`${field} harus berupa angka.`);
  if (minimum != null && number < minimum) throw new BadRequestException(`${field} minimum ${minimum}.`);
  if (maximum != null && number > maximum) throw new BadRequestException(`${field} maksimum ${maximum}.`);
  return number;
};

const booleanValue = (value: unknown, fallback: boolean) => {
  if (value == null) return fallback;
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
};

@Controller("api/v1")
export class AlarmController {
  constructor(private readonly database: DatabaseService) {}

  @Get("alarm-rules")
  async rules(@Query("asset_id") assetId?: string) {
    const result = await this.database.query(`
      SELECT
        r.*,
        a.display_name AS asset_name,
        a.process_type,
        a.area_code,
        td.signal_role,
        td.engineering_unit,
        s.evaluation_state,
        s.pending_since,
        s.active_alarm_event_id,
        s.last_value,
        s.last_quality,
        s.last_evaluated_ts
      FROM alarm_rule r
      JOIN asset a ON a.asset_id = r.asset_id
      JOIN tag_definition td ON td.tag_code = r.tag_code
      LEFT JOIN alarm_rule_state s ON s.rule_id = r.rule_id
      WHERE ($1::text IS NULL OR r.asset_id = $1)
      ORDER BY r.enabled DESC, a.process_type, r.asset_id, r.rule_name
    `, [assetId || null]);
    return { data_mode: "ACTUAL_DATABASE", rules: result.rows };
  }

  @Get("alarm-rules/tags")
  async tags(@Query("asset_id") assetId?: string) {
    if (!assetId) throw new BadRequestException("asset_id wajib diisi agar tag tidak dimuat massal.");
    const result = await this.database.query(`
      SELECT td.tag_code, td.asset_id, td.signal_role, td.engineering_unit, td.source_status
      FROM tag_definition td
      WHERE td.asset_id = $1 AND td.active = TRUE
      ORDER BY td.signal_role, td.tag_code
    `, [assetId]);
    return { data_mode: "ACTUAL_DATABASE", asset_id: assetId, tags: result.rows };
  }

  @Post("alarm-rules")
  async createRule(@Body() body: Record<string, unknown>, @Headers("x-operator-name") operator?: string) {
    const rule = await this.normalizedRule(body);
    const actor = textValue(operator, 80) || "Dashboard Engineer";
    const ruleId = randomUUID();
    const now = new Date().toISOString();
    const result = await this.database.query(`
      INSERT INTO alarm_rule (
        rule_id, rule_name, asset_id, tag_code, rule_type, threshold_value,
        hysteresis_value, delay_seconds, severity, alarm_message, recommendation,
        enabled, created_by, updated_by, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$13,$14,$14)
      RETURNING *
    `, [ruleId, rule.ruleName, rule.assetId, rule.tagCode, rule.ruleType, rule.thresholdValue, rule.hysteresisValue, rule.delaySeconds, rule.severity, rule.alarmMessage, rule.recommendation, rule.enabled, actor, now]);
    await this.database.query("INSERT INTO alarm_rule_audit (rule_id, action, actor, before_json, after_json, occurred_at) VALUES ($1,'CREATE',$2,NULL,$3::jsonb,$4)", [ruleId, actor, JSON.stringify(result.rows[0]), now]);
    return { data_mode: "ACTUAL_DATABASE", rule: result.rows[0] };
  }

  @Patch("alarm-rules/:ruleId")
  async updateRule(@Param("ruleId") ruleId: string, @Body() body: Record<string, unknown>, @Headers("x-operator-name") operator?: string) {
    const currentResult = await this.database.query("SELECT * FROM alarm_rule WHERE rule_id = $1", [ruleId]);
    const current = currentResult.rows[0];
    if (!current) throw new NotFoundException("alarm rule not found");
    const rule = await this.normalizedRule({
      rule_name: body.rule_name ?? current.rule_name,
      asset_id: body.asset_id ?? current.asset_id,
      tag_code: body.tag_code ?? current.tag_code,
      rule_type: body.rule_type ?? current.rule_type,
      threshold_value: body.threshold_value ?? current.threshold_value,
      hysteresis_value: body.hysteresis_value ?? current.hysteresis_value,
      delay_seconds: body.delay_seconds ?? current.delay_seconds,
      severity: body.severity ?? current.severity,
      alarm_message: body.alarm_message ?? current.alarm_message,
      recommendation: body.recommendation ?? current.recommendation,
      enabled: body.enabled ?? current.enabled,
    });
    const actor = textValue(operator, 80) || "Dashboard Engineer";
    const now = new Date().toISOString();
    const result = await this.database.query(`
      UPDATE alarm_rule SET
        rule_name=$2, asset_id=$3, tag_code=$4, rule_type=$5, threshold_value=$6,
        hysteresis_value=$7, delay_seconds=$8, severity=$9, alarm_message=$10,
        recommendation=$11, enabled=$12, updated_by=$13, updated_at=$14
      WHERE rule_id=$1
      RETURNING *
    `, [ruleId, rule.ruleName, rule.assetId, rule.tagCode, rule.ruleType, rule.thresholdValue, rule.hysteresisValue, rule.delaySeconds, rule.severity, rule.alarmMessage, rule.recommendation, rule.enabled, actor, now]);
    if (!rule.enabled) {
      await this.database.query(`
        UPDATE alarm_event
        SET event_state='CLEARED', cleared_at=$2, detail=COALESCE(detail, '') || ' | Cleared because rule was disabled.'
        WHERE rule_id=$1 AND event_state <> 'CLEARED'
      `, [ruleId, now]);
      await this.database.query(`
        INSERT INTO alarm_rule_state (rule_id, evaluation_state, pending_since, active_alarm_event_id, updated_at)
        VALUES ($1,'NORMAL',NULL,NULL,$2)
        ON CONFLICT (rule_id) DO UPDATE SET evaluation_state='NORMAL', pending_since=NULL, active_alarm_event_id=NULL, updated_at=EXCLUDED.updated_at
      `, [ruleId, now]);
    }
    await this.database.query("INSERT INTO alarm_rule_audit (rule_id, action, actor, before_json, after_json, occurred_at) VALUES ($1,'UPDATE',$2,$3::jsonb,$4::jsonb,$5)", [ruleId, actor, JSON.stringify(current), JSON.stringify(result.rows[0]), now]);
    return { data_mode: "ACTUAL_DATABASE", rule: result.rows[0] };
  }

  @Patch("alarm-events/:alarmEventId/acknowledge")
  async acknowledge(@Param("alarmEventId") alarmEventId: string, @Headers("x-operator-name") operator?: string) {
    const actor = textValue(operator, 80) || "Dashboard Operator";
    const result = await this.database.query(`
      UPDATE alarm_event
      SET acknowledged_at = COALESCE(acknowledged_at, NOW()), acknowledged_by = COALESCE(acknowledged_by, $2)
      WHERE alarm_event_id = $1
      RETURNING *
    `, [alarmEventId, actor]);
    if (!result.rows[0]) throw new NotFoundException("alarm event not found");
    return { data_mode: "ACTUAL_DATABASE", alarm: result.rows[0] };
  }

  private async normalizedRule(body: Record<string, unknown>) {
    const assetId = textValue(body.asset_id, 80, true)!;
    const tagCode = textValue(body.tag_code, 240, true)!;
    const tagResult = await this.database.query(`
      SELECT td.tag_code
      FROM tag_definition td
      JOIN asset a ON a.asset_id = td.asset_id
      WHERE td.tag_code=$1 AND td.asset_id=$2 AND td.active=TRUE AND a.active=TRUE
    `, [tagCode, assetId]);
    if (!tagResult.rows[0]) throw new BadRequestException("Tag tidak aktif atau bukan milik asset yang dipilih.");
    const ruleType = String(body.rule_type || "").toUpperCase();
    if (!ruleTypes.has(ruleType)) throw new BadRequestException("Rule type tidak didukung.");
    const severity = String(body.severity || "").toUpperCase();
    if (!severities.has(severity)) throw new BadRequestException("Severity tidak didukung.");
    return {
      ruleName: textValue(body.rule_name, 160, true)!,
      assetId,
      tagCode,
      ruleType,
      thresholdValue: numberValue(body.threshold_value, "Threshold"),
      hysteresisValue: numberValue(body.hysteresis_value ?? 0, "Hysteresis", 0),
      delaySeconds: Math.round(numberValue(body.delay_seconds ?? 0, "Delay", 0, 86400)),
      severity,
      alarmMessage: textValue(body.alarm_message, 500),
      recommendation: textValue(body.recommendation, 1000),
      enabled: booleanValue(body.enabled, true),
    };
  }
}
