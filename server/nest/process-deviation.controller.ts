import { BadRequestException, Body, Controller, Get, Headers, NotFoundException, Param, Patch, Post, Query } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "./database.service.js";
import { RealtimeGateway } from "./realtime.gateway.js";

const severities = new Set(["INFO", "WARNING", "CRITICAL"]);
const impacts = new Set(["PROCESS", "QUALITY", "OUTPUT", "DOWNTIME", "UTILITY", "EQUIPMENT"]);
const deviationModes = new Set(["ABSOLUTE", "PERCENT"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const textValue = (value: unknown, maxLength: number, required = false) => {
  const text = String(value ?? "").trim().slice(0, maxLength);
  if (required && !text) throw new BadRequestException("Field wajib belum diisi.");
  return text || null;
};

const numberValue = (value: unknown, field: string, fallback?: number, maximum = Number.POSITIVE_INFINITY) => {
  if ((value == null || value === "") && fallback != null) return fallback;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > maximum) throw new BadRequestException(`${field} harus berupa angka 0–${Number.isFinite(maximum) ? maximum : "∞"}.`);
  return number;
};

const booleanValue = (value: unknown, fallback: boolean) => {
  if (value == null) return fallback;
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
};

@Controller("api/v1")
export class ProcessDeviationController {
  constructor(private readonly database: DatabaseService, private readonly realtime: RealtimeGateway) {}

  @Get("process-deviation-rules")
  async rules(@Query("asset_id") assetId?: string, @Query("process_type") processType?: string) {
    const result = await this.database.query(`
      SELECT r.*, a.display_name AS asset_name,
             pvt.engineering_unit AS pv_unit, pvt.signal_role AS resolved_pv_role,
             svt.engineering_unit AS sv_unit, svt.signal_role AS resolved_sv_role,
             COUNT(s.state_id)::int AS active_tracker_count,
             COUNT(s.state_id) FILTER (WHERE s.evaluation_state IN ('DEVIATING','CLEARING'))::int AS deviating_count
      FROM process_deviation_rule r
      LEFT JOIN asset a ON a.asset_id=r.asset_id
      LEFT JOIN tag_definition pvt ON pvt.tag_code=r.pv_tag_code
      LEFT JOIN tag_definition svt ON svt.tag_code=r.sv_tag_code
      LEFT JOIN process_deviation_rule_state s ON s.rule_id=r.rule_id
      WHERE ($1::text IS NULL OR r.asset_id=$1 OR (r.asset_id IS NULL AND LOWER(r.process_type)=LOWER((SELECT process_type FROM asset WHERE asset_id=$1))))
        AND ($2::text IS NULL OR LOWER(r.process_type)=LOWER($2))
      GROUP BY r.rule_id, a.display_name, pvt.engineering_unit, pvt.signal_role, svt.engineering_unit, svt.signal_role
      ORDER BY r.enabled DESC, COALESCE(r.asset_id,r.process_type), r.rule_name
    `, [assetId || null, processType || null]);
    return { data_mode: "ACTUAL_DATABASE", rules: result.rows };
  }

  @Get("process-deviation-rules/tags")
  async tags(@Query("asset_id") assetId?: string) {
    if (!assetId) throw new BadRequestException("asset_id wajib diisi.");
    const result = await this.database.query(`
      SELECT tag_code, asset_id, signal_role, engineering_unit, source_status
      FROM tag_definition
      WHERE asset_id=$1 AND active=TRUE
      ORDER BY signal_role, tag_code
    `, [assetId]);
    return { data_mode: "ACTUAL_DATABASE", asset_id: assetId, tags: result.rows };
  }

  @Post("process-deviation-rules")
  async createRule(@Body() body: Record<string, unknown>, @Headers("x-operator-name") operator?: string) {
    const rule = await this.normalizeRule(body);
    const actor = textValue(operator, 80) || "Dashboard Engineer";
    const ruleId = randomUUID();
    const now = new Date().toISOString();
    const result = await this.database.query(`
      INSERT INTO process_deviation_rule (
        rule_id, rule_code, rule_name, asset_id, process_type, step_code,
        pv_tag_code, pv_signal_role, sv_tag_code, sv_signal_role, setpoint_key,
        deviation_mode, tolerance_low, tolerance_high, startup_grace_seconds,
        expected_reach_time_seconds, stable_confirmation_seconds,
        deviation_delay_seconds, clear_confirmation_seconds, hysteresis_value,
        minimum_sv_change, change_confirmation_seconds, monitor_reach, monitor_hold,
        pause_on_machine_hold, severity, impact_code, alarm_message, recommendation,
        enabled, calculation_version, created_by, updated_by, created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$32,$33,$33
      ) RETURNING *
    `, [ruleId, ...this.ruleValues(rule), actor, now]);
    await this.database.query(`
      INSERT INTO process_deviation_rule_audit(rule_id,action,actor,before_json,after_json,occurred_at)
      VALUES ($1,'CREATE',$2,NULL,$3::jsonb,$4)
    `, [ruleId, actor, JSON.stringify(result.rows[0]), now]);
    this.realtime.publishDataRefresh(["process_deviation_rule"]);
    return { data_mode: "ACTUAL_DATABASE", rule: result.rows[0] };
  }

  @Patch("process-deviation-rules/:ruleId")
  async updateRule(@Param("ruleId") ruleId: string, @Body() body: Record<string, unknown>, @Headers("x-operator-name") operator?: string) {
    if (!uuidPattern.test(ruleId)) throw new BadRequestException("ruleId harus UUID valid.");
    const currentResult = await this.database.query("SELECT * FROM process_deviation_rule WHERE rule_id=$1", [ruleId]);
    const current = currentResult.rows[0];
    if (!current) throw new NotFoundException("process deviation rule not found");
    const rule = await this.normalizeRule({ ...current, ...body });
    const actor = textValue(operator, 80) || "Dashboard Engineer";
    const now = new Date().toISOString();
    const result = await this.database.query(`
      UPDATE process_deviation_rule SET
        rule_code=$2, rule_name=$3, asset_id=$4, process_type=$5, step_code=$6,
        pv_tag_code=$7, pv_signal_role=$8, sv_tag_code=$9, sv_signal_role=$10,
        setpoint_key=$11, deviation_mode=$12, tolerance_low=$13,
        tolerance_high=$14, startup_grace_seconds=$15,
        expected_reach_time_seconds=$16, stable_confirmation_seconds=$17,
        deviation_delay_seconds=$18, clear_confirmation_seconds=$19,
        hysteresis_value=$20, minimum_sv_change=$21,
        change_confirmation_seconds=$22, monitor_reach=$23, monitor_hold=$24,
        pause_on_machine_hold=$25, severity=$26, impact_code=$27,
        alarm_message=$28, recommendation=$29, enabled=$30,
        calculation_version=$31, updated_by=$32, updated_at=$33
      WHERE rule_id=$1 RETURNING *
    `, [ruleId, ...this.ruleValues(rule), actor, now]);

    if (!rule.enabled && current.enabled) await this.resetActiveTrackers(ruleId, actor, now, "RULE_DISABLED");
    else if (rule.enabled && current.enabled && Object.keys(body).some((key) => key !== "enabled")) await this.resetActiveTrackers(ruleId, actor, now, "RULE_UPDATED");
    await this.database.query(`
      INSERT INTO process_deviation_rule_audit(rule_id,action,actor,before_json,after_json,occurred_at)
      VALUES ($1,'UPDATE',$2,$3::jsonb,$4::jsonb,$5)
    `, [ruleId, actor, JSON.stringify(current), JSON.stringify(result.rows[0]), now]);
    this.realtime.publishDataRefresh(["process_deviation_rule", "process_target_execution", "process_deviation_event", "alarm_event"]);
    return { data_mode: "ACTUAL_DATABASE", rule: result.rows[0] };
  }

  @Get("batch/process-runs/:processRunId/target-achievements")
  async targetAchievements(@Param("processRunId") processRunId: string) {
    this.assertUuid(processRunId, "processRunId");
    await this.assertRun(processRunId);
    const result = await this.database.query(`
      SELECT t.*, r.rule_code, r.rule_name, r.severity, r.impact_code,
             pv.engineering_unit, s.step_no, s.step_code, s.step_name
      FROM process_target_execution t
      JOIN process_deviation_rule r ON r.rule_id=t.rule_id
      LEFT JOIN tag_definition pv ON pv.tag_code=t.pv_tag_code
      LEFT JOIN process_step_execution s ON s.step_execution_id=t.step_execution_id
      WHERE t.process_run_id=$1
      ORDER BY t.tracking_started_at, t.parameter_code, t.revision_no
    `, [processRunId]);
    return { data_mode: "ACTUAL_DATABASE", process_run_id: processRunId, targets: result.rows };
  }

  @Get("batch/process-runs/:processRunId/setpoint-changes")
  async setpointChanges(@Param("processRunId") processRunId: string) {
    this.assertUuid(processRunId, "processRunId");
    await this.assertRun(processRunId);
    const result = await this.database.query(`
      SELECT c.*, r.rule_code, r.rule_name, s.step_no, s.step_code, s.step_name
      FROM process_setpoint_change_event c
      JOIN process_deviation_rule r ON r.rule_id=c.rule_id
      LEFT JOIN process_step_execution s ON s.step_execution_id=c.step_execution_id
      WHERE c.process_run_id=$1
      ORDER BY c.changed_at, c.parameter_code
    `, [processRunId]);
    return { data_mode: "ACTUAL_DATABASE", process_run_id: processRunId, changes: result.rows };
  }

  @Get("batch/process-runs/:processRunId/abnormalities")
  async abnormalities(@Param("processRunId") processRunId: string, @Query("severity") severity?: string, @Query("state") eventState?: string, @Query("event_class") eventClass?: string, @Query("page") pageInput?: string, @Query("page_size") pageSizeInput?: string) {
    this.assertUuid(processRunId, "processRunId");
    await this.assertRun(processRunId);
    const page = Math.max(1, Number.parseInt(pageInput || "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(pageSizeInput || "25", 10) || 25));
    const severities = this.csvFilter(severity);
    const states = this.csvFilter(eventState);
    const classes = this.csvFilter(eventClass);
    const result = await this.database.query(`
      SELECT d.*, r.rule_code, r.rule_name, r.alarm_message, r.recommendation,
             pv.signal_role AS parameter_code, pv.engineering_unit,
             s.step_no, s.step_code, s.step_name,
             COUNT(*) OVER()::int AS total_count
      FROM process_deviation_event d
      JOIN process_deviation_rule r ON r.rule_id=d.rule_id
      JOIN tag_definition pv ON pv.tag_code=d.pv_tag_code
      LEFT JOIN process_step_execution s ON s.step_execution_id=d.step_execution_id
      WHERE d.process_run_id=$1
        AND ($2::text[] IS NULL OR d.severity=ANY($2))
        AND ($3::text[] IS NULL OR d.event_state=ANY($3))
        AND ($4::text[] IS NULL OR d.event_class=ANY($4))
      ORDER BY d.started_at DESC
      LIMIT $5 OFFSET $6
    `, [processRunId, severities, states, classes, pageSize, (page - 1) * pageSize]);
    return {
      data_mode: "ACTUAL_DATABASE",
      process_run_id: processRunId,
      page,
      page_size: pageSize,
      total: Number(result.rows[0]?.total_count || 0),
      items: result.rows.map(({ total_count, ...row }) => row),
    };
  }

  @Patch("batch/process-deviations/:deviationEventId/acknowledge")
  async acknowledge(@Param("deviationEventId") deviationEventId: string, @Headers("x-operator-name") operator?: string) {
    this.assertUuid(deviationEventId, "deviationEventId");
    const actor = textValue(operator, 80) || "Dashboard Operator";
    const result = await this.database.query(`
      UPDATE process_deviation_event
      SET acknowledged_at=COALESCE(acknowledged_at,NOW()),
          acknowledged_by=COALESCE(acknowledged_by,$2), updated_at=NOW()
      WHERE deviation_event_id=$1 RETURNING *
    `, [deviationEventId, actor]);
    if (!result.rows[0]) throw new NotFoundException("process deviation event not found");
    if (result.rows[0].alarm_event_id) {
      await this.database.query(`
        UPDATE alarm_event SET acknowledged_at=COALESCE(acknowledged_at,NOW()),
          acknowledged_by=COALESCE(acknowledged_by,$2)
        WHERE alarm_event_id=$1
      `, [result.rows[0].alarm_event_id, actor]);
    }
    this.realtime.publishDataRefresh(["process_deviation_event", "alarm_event"]);
    return { data_mode: "ACTUAL_DATABASE", deviation: result.rows[0] };
  }

  private async normalizeRule(body: Record<string, unknown>) {
    const assetId = textValue(body.asset_id, 80)?.toUpperCase() || null;
    let processType = textValue(body.process_type, 40)?.toLowerCase() || null;
    if (assetId) {
      const asset = await this.database.query("SELECT asset_id, process_type FROM asset WHERE asset_id=$1 AND active=TRUE", [assetId]);
      if (!asset.rows[0]) throw new BadRequestException("Asset tidak ditemukan atau tidak aktif.");
      processType = processType || asset.rows[0].process_type;
      if (processType !== asset.rows[0].process_type) throw new BadRequestException("process_type tidak sesuai dengan master asset.");
    }
    if (!assetId && !processType) throw new BadRequestException("asset_id atau process_type wajib diisi.");

    const pvTagCode = textValue(body.pv_tag_code, 240);
    const svTagCode = textValue(body.sv_tag_code, 240);
    const pvSignalRole = textValue(body.pv_signal_role, 160);
    const svSignalRole = textValue(body.sv_signal_role, 160);
    const setpointKey = textValue(body.setpoint_key, 160);
    if (!pvTagCode && !pvSignalRole) throw new BadRequestException("PV tag atau PV signal role wajib diisi.");
    if (!svTagCode && !svSignalRole && !setpointKey) throw new BadRequestException("SV tag, SV signal role, atau setpoint key wajib diisi.");
    if (!assetId && (pvTagCode || svTagCode)) throw new BadRequestException("Template process_type harus memakai signal role, bukan tag_code asset tertentu.");
    if (assetId) await this.validateTags(assetId, [pvTagCode, svTagCode].filter(Boolean) as string[]);

    const mode = String(body.deviation_mode || "ABSOLUTE").toUpperCase();
    if (!deviationModes.has(mode)) throw new BadRequestException("deviation_mode harus ABSOLUTE atau PERCENT.");
    const severity = String(body.severity || "WARNING").toUpperCase();
    if (!severities.has(severity)) throw new BadRequestException("Severity tidak didukung.");
    const impact = String(body.impact_code || "PROCESS").toUpperCase();
    if (!impacts.has(impact)) throw new BadRequestException("impact_code tidak didukung.");
    const ruleCode = String(textValue(body.rule_code, 120, true)).toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9._-]*$/.test(ruleCode)) throw new BadRequestException("rule_code hanya boleh huruf, angka, titik, underscore, dan dash.");

    return {
      ruleCode,
      ruleName: textValue(body.rule_name, 160, true),
      assetId,
      processType,
      stepCode: textValue(body.step_code, 120)?.toUpperCase() || null,
      pvTagCode,
      pvSignalRole,
      svTagCode,
      svSignalRole,
      setpointKey,
      deviationMode: mode,
      toleranceLow: numberValue(body.tolerance_low, "tolerance_low", 0),
      toleranceHigh: numberValue(body.tolerance_high, "tolerance_high", 0),
      startupGraceSeconds: Math.round(numberValue(body.startup_grace_seconds, "startup_grace_seconds", 0, 86400)),
      expectedReachTimeSeconds: body.expected_reach_time_seconds == null || body.expected_reach_time_seconds === "" ? null : Math.round(numberValue(body.expected_reach_time_seconds, "expected_reach_time_seconds", undefined, 604800)),
      stableConfirmationSeconds: Math.round(numberValue(body.stable_confirmation_seconds, "stable_confirmation_seconds", 0, 86400)),
      deviationDelaySeconds: Math.round(numberValue(body.deviation_delay_seconds, "deviation_delay_seconds", 0, 86400)),
      clearConfirmationSeconds: Math.round(numberValue(body.clear_confirmation_seconds, "clear_confirmation_seconds", 0, 86400)),
      hysteresisValue: numberValue(body.hysteresis_value, "hysteresis_value", 0),
      minimumSvChange: numberValue(body.minimum_sv_change, "minimum_sv_change", 0),
      changeConfirmationSeconds: Math.round(numberValue(body.change_confirmation_seconds, "change_confirmation_seconds", 0, 86400)),
      monitorReach: booleanValue(body.monitor_reach, true),
      monitorHold: booleanValue(body.monitor_hold, true),
      pauseOnMachineHold: booleanValue(body.pause_on_machine_hold, true),
      severity,
      impactCode: impact,
      alarmMessage: textValue(body.alarm_message, 500),
      recommendation: textValue(body.recommendation, 1000),
      enabled: booleanValue(body.enabled, true),
      calculationVersion: textValue(body.calculation_version, 40) || "1.0",
    };
  }

  private ruleValues(rule: Record<string, any>) {
    return [rule.ruleCode, rule.ruleName, rule.assetId, rule.processType, rule.stepCode, rule.pvTagCode, rule.pvSignalRole, rule.svTagCode, rule.svSignalRole, rule.setpointKey, rule.deviationMode, rule.toleranceLow, rule.toleranceHigh, rule.startupGraceSeconds, rule.expectedReachTimeSeconds, rule.stableConfirmationSeconds, rule.deviationDelaySeconds, rule.clearConfirmationSeconds, rule.hysteresisValue, rule.minimumSvChange, rule.changeConfirmationSeconds, rule.monitorReach, rule.monitorHold, rule.pauseOnMachineHold, rule.severity, rule.impactCode, rule.alarmMessage, rule.recommendation, rule.enabled, rule.calculationVersion];
  }

  private async validateTags(assetId: string, tagCodes: string[]) {
    if (!tagCodes.length) return;
    const result = await this.database.query("SELECT tag_code FROM tag_definition WHERE asset_id=$1 AND active=TRUE AND tag_code=ANY($2::text[])", [assetId, tagCodes]);
    if (result.rowCount !== new Set(tagCodes).size) throw new BadRequestException("PV/SV tag harus aktif dan dimiliki asset yang dipilih.");
  }

  private async resetActiveTrackers(ruleId: string, actor: string, now: string, reason: "RULE_DISABLED" | "RULE_UPDATED") {
    await this.database.transaction(async (client) => {
      const active = await client.query(`
        SELECT s.state_id, s.target_execution_id, s.active_deviation_event_id,
               d.alarm_event_id
        FROM process_deviation_rule_state s
        LEFT JOIN process_deviation_event d ON d.deviation_event_id=s.active_deviation_event_id
        WHERE s.rule_id=$1 FOR UPDATE OF s
      `, [ruleId]);
      for (const item of active.rows) {
        if (item.active_deviation_event_id) {
          await client.query(`UPDATE process_deviation_event SET event_state='CLOSED', ended_at=$2, duration_seconds=GREATEST(0,EXTRACT(EPOCH FROM ($2::timestamptz-started_at))::int), end_reason=$3, detail_json=detail_json || $4::jsonb, updated_at=NOW() WHERE deviation_event_id=$1 AND event_state='ACTIVE'`, [item.active_deviation_event_id, now, reason, JSON.stringify({ changed_by: actor })]);
        }
        if (item.alarm_event_id) await client.query("UPDATE alarm_event SET event_state='CLEARED', cleared_at=$2, source_ts=$2, detail=COALESCE(detail,'') || $3 WHERE alarm_event_id=$1 AND event_state <> 'CLEARED'", [item.alarm_event_id, now, ` | Closed: ${reason}.`]);
        await client.query("UPDATE process_target_execution SET target_state='CANCELLED', ended_at=$2, end_reason=$3, updated_at=NOW() WHERE target_execution_id=$1", [item.target_execution_id, now, reason]);
      }
      await client.query("DELETE FROM process_deviation_rule_state WHERE rule_id=$1", [ruleId]);
    });
  }

  private async assertRun(processRunId: string) {
    const result = await this.database.query("SELECT process_run_id FROM batch_process_run WHERE process_run_id=$1", [processRunId]);
    if (!result.rows[0]) throw new NotFoundException("process run not found");
  }

  private assertUuid(value: string, field: string) {
    if (!uuidPattern.test(String(value || "").trim())) throw new BadRequestException(`${field} harus UUID valid.`);
  }

  private csvFilter(value?: string) {
    const values = String(value || "").split(",").map((item) => item.trim().toUpperCase()).filter(Boolean);
    return values.length ? values : null;
  }
}
