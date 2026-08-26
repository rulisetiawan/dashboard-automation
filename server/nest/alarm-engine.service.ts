import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "./database.service.js";
import { RealtimeGateway } from "./realtime.gateway.js";

type EvaluationState = "NORMAL" | "PENDING" | "ACTIVE";

type RuntimeState = {
  ruleId: string;
  evaluationState: EvaluationState;
  pendingSince: Date | null;
  activeAlarmEventId: string | null;
  lastValue: number | null;
  lastQuality: string | null;
  lastEvaluatedTs: Date | null;
};

@Injectable()
export class AlarmEngineService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AlarmEngineService.name);
  private timer?: NodeJS.Timeout;
  private running = false;
  private lastTelemetryId = 0;

  constructor(private readonly database: DatabaseService, private readonly realtime: RealtimeGateway) {}

  async onModuleInit() {
    await this.initializeCursor();
    this.timer = setInterval(() => void this.evaluateNewTelemetry(), 1000);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async initializeCursor() {
    try {
      const stored = await this.database.query("SELECT meta_value FROM backend_meta WHERE meta_key='alarm_engine.last_telemetry_id'");
      if (stored.rows[0]?.meta_value != null) {
        this.lastTelemetryId = Number(stored.rows[0].meta_value) || 0;
        return;
      }
      const latest = await this.database.query("SELECT COALESCE(MAX(id), 0)::bigint AS id FROM telemetry_sample");
      this.lastTelemetryId = Number(latest.rows[0]?.id || 0);
      await this.saveCursor();
    } catch (error) {
      this.logger.error(`Alarm engine initialization failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  private async evaluateNewTelemetry() {
    if (this.running) return;
    this.running = true;
    try {
      const samples = await this.database.query(`
        SELECT
          ts.id, ts.source_ts, ts.value_number, ts.quality,
          r.rule_id, r.rule_name, r.asset_id, r.tag_code, r.rule_type,
          r.threshold_value, r.hysteresis_value, r.delay_seconds, r.severity,
          r.alarm_message, r.recommendation,
          td.signal_role, td.engineering_unit, a.area_code,
          active_run.process_run_id, active_step.step_execution_id,
          COALESCE(active_run.batch_no, CASE WHEN pb.batch_no IS NOT NULL THEN snapshot.batch_no END) AS batch_no
        FROM telemetry_sample ts
        JOIN alarm_rule r ON r.tag_code = ts.tag_code AND r.asset_id = ts.asset_id AND r.enabled = TRUE
        JOIN tag_definition td ON td.tag_code = ts.tag_code
        JOIN asset a ON a.asset_id = ts.asset_id
        LEFT JOIN LATERAL (
          SELECT run.process_run_id, run.batch_no
          FROM batch_process_run run
          WHERE run.asset_id=ts.asset_id
            AND run.started_at IS NOT NULL
            AND run.started_at <= ts.source_ts
            AND COALESCE(run.ended_at, 'infinity'::timestamptz) >= ts.source_ts
            AND run.run_status IN ('RUNNING','HOLD','COMPLETED')
          ORDER BY run.started_at DESC
          LIMIT 1
        ) active_run ON TRUE
        LEFT JOIN LATERAL (
          SELECT step.step_execution_id
          FROM process_step_execution step
          WHERE step.process_run_id=active_run.process_run_id
            AND step.started_at IS NOT NULL
            AND step.started_at <= ts.source_ts
            AND COALESCE(step.ended_at, 'infinity'::timestamptz) >= ts.source_ts
          ORDER BY step.started_at DESC
          LIMIT 1
        ) active_step ON TRUE
        LEFT JOIN asset_snapshot snapshot ON snapshot.asset_id = ts.asset_id
        LEFT JOIN production_batch pb ON pb.batch_no = snapshot.batch_no
        WHERE ts.id > $1 AND ts.value_number IS NOT NULL
        ORDER BY ts.id, r.rule_id
        LIMIT 5000
      `, [this.lastTelemetryId]);
      if (!samples.rows.length) {
        const latest = await this.database.query("SELECT COALESCE(MAX(id), $1)::bigint AS id FROM telemetry_sample", [this.lastTelemetryId]);
        const latestId = Number(latest.rows[0]?.id || this.lastTelemetryId);
        if (latestId > this.lastTelemetryId) {
          this.lastTelemetryId = latestId;
          await this.saveCursor();
        }
        return;
      }

      const ruleIds = [...new Set(samples.rows.map((sample) => String(sample.rule_id)))];
      const storedStates = await this.database.query("SELECT * FROM alarm_rule_state WHERE rule_id = ANY($1::uuid[])", [ruleIds]);
      const states = new Map<string, RuntimeState>(storedStates.rows.map((row) => [String(row.rule_id), {
        ruleId: String(row.rule_id),
        evaluationState: row.evaluation_state as EvaluationState,
        pendingSince: row.pending_since ? new Date(row.pending_since) : null,
        activeAlarmEventId: row.active_alarm_event_id ? String(row.active_alarm_event_id) : null,
        lastValue: row.last_value == null ? null : Number(row.last_value),
        lastQuality: row.last_quality || null,
        lastEvaluatedTs: row.last_evaluated_ts ? new Date(row.last_evaluated_ts) : null,
      }]));

      for (const sample of samples.rows) {
        const ruleId = String(sample.rule_id);
        const sourceTs = new Date(sample.source_ts);
        const value = Number(sample.value_number);
        const state = states.get(ruleId) || {
          ruleId,
          evaluationState: "NORMAL" as EvaluationState,
          pendingSince: null,
          activeAlarmEventId: null,
          lastValue: null,
          lastQuality: null,
          lastEvaluatedTs: null,
        };
        states.set(ruleId, state);
        if (state.lastEvaluatedTs && sourceTs < state.lastEvaluatedTs) continue;
        state.lastValue = value;
        state.lastQuality = sample.quality;
        state.lastEvaluatedTs = sourceTs;
        if (String(sample.quality).toUpperCase() !== "GOOD") continue;

        const breached = this.isBreached(sample.rule_type, value, Number(sample.threshold_value));
        const cleared = this.isCleared(sample.rule_type, value, Number(sample.threshold_value), Number(sample.hysteresis_value || 0));
        if (state.evaluationState === "NORMAL" && breached) {
          if (Number(sample.delay_seconds) <= 0) {
            state.activeAlarmEventId = await this.activateAlarm(sample, value, sourceTs);
            state.evaluationState = "ACTIVE";
            state.pendingSince = null;
          } else {
            state.evaluationState = "PENDING";
            state.pendingSince = sourceTs;
          }
        } else if (state.evaluationState === "PENDING") {
          if (!breached) {
            state.evaluationState = "NORMAL";
            state.pendingSince = null;
          } else if (state.pendingSince && sourceTs.getTime() - state.pendingSince.getTime() >= Number(sample.delay_seconds) * 1000) {
            state.activeAlarmEventId = await this.activateAlarm(sample, value, sourceTs);
            state.evaluationState = "ACTIVE";
            state.pendingSince = null;
          }
        } else if (state.evaluationState === "ACTIVE" && cleared) {
          await this.clearAlarm(state.activeAlarmEventId, sample, value, sourceTs);
          state.evaluationState = "NORMAL";
          state.pendingSince = null;
          state.activeAlarmEventId = null;
        }
      }

      for (const state of states.values()) {
        await this.database.query(`
          INSERT INTO alarm_rule_state (
            rule_id, evaluation_state, pending_since, active_alarm_event_id,
            last_value, last_quality, last_evaluated_ts, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
          ON CONFLICT (rule_id) DO UPDATE SET
            evaluation_state=EXCLUDED.evaluation_state,
            pending_since=EXCLUDED.pending_since,
            active_alarm_event_id=EXCLUDED.active_alarm_event_id,
            last_value=EXCLUDED.last_value,
            last_quality=EXCLUDED.last_quality,
            last_evaluated_ts=EXCLUDED.last_evaluated_ts,
            updated_at=EXCLUDED.updated_at
        `, [state.ruleId, state.evaluationState, state.pendingSince?.toISOString() || null, state.activeAlarmEventId, state.lastValue, state.lastQuality, state.lastEvaluatedTs?.toISOString() || null]);
      }

      this.lastTelemetryId = Math.max(this.lastTelemetryId, ...samples.rows.map((sample) => Number(sample.id)));
      await this.saveCursor();
    } catch (error) {
      this.logger.error(`Alarm evaluation failed: ${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      this.running = false;
    }
  }

  private isBreached(ruleType: string, value: number, threshold: number) {
    return ruleType === "HIGH" || ruleType === "HIGH_HIGH" ? value >= threshold : value <= threshold;
  }

  private isCleared(ruleType: string, value: number, threshold: number, hysteresis: number) {
    return ruleType === "HIGH" || ruleType === "HIGH_HIGH" ? value <= threshold - hysteresis : value >= threshold + hysteresis;
  }

  private async activateAlarm(sample: Record<string, unknown>, value: number, sourceTs: Date) {
    const alarmEventId = randomUUID();
    const unit = sample.engineering_unit ? ` ${sample.engineering_unit}` : "";
    const detail = sample.alarm_message || `${sample.signal_role} ${value}${unit} crossed ${sample.rule_type} threshold ${sample.threshold_value}${unit}.`;
    const inserted = await this.database.query(`
      INSERT INTO alarm_event (
        alarm_event_id, asset_id, tag_code, batch_no, area_code, severity,
        event_state, alarm_code, title, detail, occurred_at, source_ts, created_at,
        rule_id, trigger_value, threshold_value, recommendation,
        process_run_id, step_execution_id, event_class
      ) VALUES ($1,$2,$3,$4,$5,$6,'ACTIVE',$7,$8,$9,$10,$10,NOW(),$11,$12,$13,$14,$15,$16,'STATIC_THRESHOLD')
      ON CONFLICT DO NOTHING
      RETURNING *
    `, [alarmEventId, sample.asset_id, sample.tag_code, sample.batch_no || null, sample.area_code, sample.severity, `RULE_${sample.rule_type}`, sample.rule_name, detail, sourceTs.toISOString(), sample.rule_id, value, sample.threshold_value, sample.recommendation || null, sample.process_run_id || null, sample.step_execution_id || null]);
    const alarm = inserted.rows[0] || (await this.database.query("SELECT * FROM alarm_event WHERE rule_id=$1 AND event_state <> 'CLEARED' ORDER BY occurred_at DESC LIMIT 1", [sample.rule_id])).rows[0];
    if (alarm) this.realtime.publishAlarm("active", alarm);
    return alarm?.alarm_event_id ? String(alarm.alarm_event_id) : alarmEventId;
  }

  private async clearAlarm(alarmEventId: string | null, sample: Record<string, unknown>, value: number, sourceTs: Date) {
    const result = alarmEventId
      ? await this.database.query("UPDATE alarm_event SET event_state='CLEARED', cleared_at=$2, source_ts=$2, detail=COALESCE(detail, '') || $3 WHERE alarm_event_id=$1 RETURNING *", [alarmEventId, sourceTs.toISOString(), ` | Cleared at ${value}${sample.engineering_unit ? ` ${sample.engineering_unit}` : ""}.`])
      : await this.database.query("UPDATE alarm_event SET event_state='CLEARED', cleared_at=$2, source_ts=$2 WHERE rule_id=$1 AND event_state <> 'CLEARED' RETURNING *", [sample.rule_id, sourceTs.toISOString()]);
    if (result.rows[0]) this.realtime.publishAlarm("cleared", result.rows[0]);
  }

  private saveCursor() {
    return this.database.query(`
      INSERT INTO backend_meta (meta_key, meta_value, updated_at)
      VALUES ('alarm_engine.last_telemetry_id', $1, NOW())
      ON CONFLICT (meta_key) DO UPDATE SET meta_value=EXCLUDED.meta_value, updated_at=EXCLUDED.updated_at
    `, [String(this.lastTelemetryId)]);
  }
}
