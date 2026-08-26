import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "./database.service.js";
import { RealtimeGateway } from "./realtime.gateway.js";

type TrackerState = "WAITING" | "RAMPING" | "STABILIZING" | "STABLE" | "PENDING" | "DEVIATING" | "CLEARING" | "PAUSED";

@Injectable()
export class ProcessDeviationEngineService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProcessDeviationEngineService.name);
  private timer?: NodeJS.Timeout;
  private running = false;
  private lastTelemetryId = 0;
  private lastFinalizationAt = 0;

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
      const stored = await this.database.query("SELECT meta_value FROM backend_meta WHERE meta_key='process_deviation_engine.last_telemetry_id'");
      if (stored.rows[0]?.meta_value != null) {
        this.lastTelemetryId = Number(stored.rows[0].meta_value) || 0;
        return;
      }
      const latest = await this.database.query("SELECT COALESCE(MAX(id), 0)::bigint AS id FROM telemetry_sample");
      this.lastTelemetryId = Number(latest.rows[0]?.id || 0);
      await this.saveCursor();
    } catch (error) {
      this.logger.error(`Process deviation engine initialization failed: ${this.errorMessage(error)}`);
    }
  }

  private async evaluateNewTelemetry() {
    if (this.running) return;
    this.running = true;
    let changed = false;
    try {
      const samples = await this.database.query(`
        SELECT ts.id, ts.asset_id, ts.tag_code, ts.source_ts, ts.value_number,
               ts.quality, ts.gateway_id, ts.message_id, td.signal_role,
               td.engineering_unit, a.process_type, a.area_code
        FROM telemetry_sample ts
        JOIN tag_definition td ON td.tag_code = ts.tag_code
        JOIN asset a ON a.asset_id = ts.asset_id AND a.active = TRUE
        WHERE ts.id > $1 AND ts.value_number IS NOT NULL
        ORDER BY ts.id
        LIMIT 2000
      `, [this.lastTelemetryId]);

      for (const sample of samples.rows) {
        const sampleChanged = await this.evaluateSample(sample);
        changed = changed || sampleChanged;
      }

      if (samples.rows.length) {
        this.lastTelemetryId = Math.max(this.lastTelemetryId, ...samples.rows.map((sample) => Number(sample.id)));
        await this.saveCursor();
      } else {
        const latest = await this.database.query("SELECT COALESCE(MAX(id), $1)::bigint AS id FROM telemetry_sample", [this.lastTelemetryId]);
        const latestId = Number(latest.rows[0]?.id || this.lastTelemetryId);
        if (latestId > this.lastTelemetryId) {
          this.lastTelemetryId = latestId;
          await this.saveCursor();
        }
      }

      if (Date.now() - this.lastFinalizationAt >= 5000) {
        changed = (await this.finalizeEndedRuns()) || changed;
        this.lastFinalizationAt = Date.now();
      }
      if (changed) this.realtime.publishDataRefresh(["process_target_execution", "process_deviation_event", "process_setpoint_change_event", "alarm_event"]);
    } catch (error) {
      this.logger.error(`Process deviation evaluation failed: ${this.errorMessage(error)}`);
    } finally {
      this.running = false;
    }
  }

  private async evaluateSample(sample: Record<string, any>) {
    const sourceTs = new Date(sample.source_ts);
    if (Number.isNaN(sourceTs.getTime())) return false;
    const value = Number(sample.value_number);
    if (!Number.isFinite(value)) return false;

    const rules = await this.database.query(`
      SELECT r.*
      FROM process_deviation_rule r
      WHERE r.enabled = TRUE
        AND (r.asset_id IS NULL OR r.asset_id = $1)
        AND (r.process_type IS NULL OR LOWER(r.process_type) = LOWER($2))
        AND (
          r.pv_tag_code = $3 OR r.sv_tag_code = $3
          OR (r.pv_tag_code IS NULL AND UPPER(r.pv_signal_role) = UPPER($4))
          OR (r.sv_tag_code IS NULL AND UPPER(r.sv_signal_role) = UPPER($4))
        )
      ORDER BY CASE WHEN r.asset_id IS NOT NULL THEN 0 ELSE 1 END, r.updated_at DESC
    `, [sample.asset_id, sample.process_type, sample.tag_code, sample.signal_role]);
    if (!rules.rows.length) return false;

    const run = await this.findProcessRun(sample.asset_id, sourceTs);
    if (!run) return false;
    let changed = false;
    for (const rule of rules.rows) {
      const step = await this.findProcessStep(run.process_run_id, rule.step_code, sourceTs);
      if (rule.step_code && !step) continue;
      changed = (await this.evaluateRuleSample(sample, rule, run, step, sourceTs, value)) || changed;
    }
    return changed;
  }

  private async findProcessRun(assetId: string, sourceTs: Date) {
    const result = await this.database.query(`
      SELECT r.*, a.area_code
      FROM batch_process_run r
      JOIN asset a ON a.asset_id=r.asset_id
      WHERE r.asset_id = $1
        AND r.started_at IS NOT NULL
        AND r.started_at <= $2
        AND COALESCE(r.ended_at, 'infinity'::timestamptz) >= $2
        AND r.run_status IN ('RUNNING', 'HOLD', 'COMPLETED')
      ORDER BY r.started_at DESC
      LIMIT 1
    `, [assetId, sourceTs.toISOString()]);
    return result.rows[0] || null;
  }

  private async findProcessStep(processRunId: string, stepCode: string | null, sourceTs: Date) {
    if (!stepCode) return null;
    const result = await this.database.query(`
      SELECT *
      FROM process_step_execution
      WHERE process_run_id = $1
        AND UPPER(COALESCE(step_code, step_name)) = UPPER($2)
        AND started_at IS NOT NULL
        AND started_at <= $3
        AND COALESCE(ended_at, 'infinity'::timestamptz) >= $3
      ORDER BY started_at DESC
      LIMIT 1
    `, [processRunId, stepCode, sourceTs.toISOString()]);
    return result.rows[0] || null;
  }

  private async evaluateRuleSample(sample: Record<string, any>, rule: Record<string, any>, run: Record<string, any>, step: Record<string, any> | null, sourceTs: Date, sampleValue: number) {
    const pvTag = await this.resolveTag(sample.asset_id, rule.pv_tag_code, rule.pv_signal_role);
    if (!pvTag) return false;
    const svTag = await this.resolveTag(sample.asset_id, rule.sv_tag_code, rule.sv_signal_role);
    const pvSample = sample.tag_code === pvTag.tag_code
      ? { ...sample, value_number: sampleValue }
      : await this.latestSample(pvTag.tag_code, sourceTs);
    if (!pvSample?.value_number && Number(pvSample?.value_number) !== 0) return false;

    const sv = await this.resolveSetpoint(rule, step, svTag, sourceTs);
    if (!sv || !Number.isFinite(Number(sv.value))) return false;

    return this.database.transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`deviation|${rule.rule_id}|${run.process_run_id}|${pvTag.tag_code}`]);
      const stateResult = await client.query(`
        SELECT s.*, t.revision_no, t.first_reached_at, t.stable_at, t.worst_pv
        FROM process_deviation_rule_state s
        JOIN process_target_execution t ON t.target_execution_id = s.target_execution_id
        WHERE s.rule_id = $1 AND s.process_run_id = $2 AND s.pv_tag_code = $3
        FOR UPDATE
      `, [rule.rule_id, run.process_run_id, pvTag.tag_code]);
      let state = stateResult.rows[0] || null;
      const pv = Number(pvSample.value_number);
      const quality = String(pvSample.quality || "GOOD").toUpperCase();
      const trackingStart = new Date(step?.started_at || run.started_at || sourceTs).toISOString();

      if (!state) {
        state = await this.createTracker(client, rule, run, step, pvTag, svTag, sv, pv, quality, sourceTs, trackingStart, 1);
        return true;
      }
      if (state.last_evaluated_ts && sourceTs < new Date(state.last_evaluated_ts)) return false;

      const svChanged = Math.abs(Number(sv.value) - Number(state.sv_value)) >= Number(rule.minimum_sv_change || 0)
        && Number(sv.value) !== Number(state.sv_value);
      if (svChanged) {
        const candidateMatches = state.candidate_sv_value != null && Number(state.candidate_sv_value) === Number(sv.value);
        const candidateSince = candidateMatches && state.candidate_sv_since ? new Date(state.candidate_sv_since) : sourceTs;
        const confirmed = sourceTs.getTime() - candidateSince.getTime() >= Number(rule.change_confirmation_seconds || 0) * 1000;
        if (!confirmed) {
          await client.query(`
            UPDATE process_deviation_rule_state
            SET candidate_sv_value=$2, candidate_sv_since=$3, last_pv=$4, last_quality=$5,
                last_evaluated_ts=$6, updated_at=NOW()
            WHERE state_id=$1
          `, [state.state_id, sv.value, candidateSince.toISOString(), pv, quality, sourceTs.toISOString()]);
          return true;
        }
        state = await this.applySetpointChange(client, state, rule, run, step, pvTag, svTag, sv, pv, quality, sourceTs);
      } else if (state.candidate_sv_value != null) {
        await client.query("UPDATE process_deviation_rule_state SET candidate_sv_value=NULL, candidate_sv_since=NULL, updated_at=NOW() WHERE state_id=$1", [state.state_id]);
        state.candidate_sv_value = null;
        state.candidate_sv_since = null;
      }

      if (String(run.run_status).toUpperCase() === "HOLD" && rule.pause_on_machine_hold) {
        if (state.evaluation_state !== "PAUSED") {
          await this.updateState(client, state, {
            evaluation_state: "PAUSED",
            state_before_pause: state.evaluation_state,
            paused_since: sourceTs.toISOString(),
            last_pv: pv,
            last_quality: quality,
            last_evaluated_ts: sourceTs.toISOString(),
          });
          await this.updateTarget(client, state.target_execution_id, "PAUSED", pv, sourceTs);
          return true;
        }
        await this.updateState(client, state, { last_pv: pv, last_quality: quality, last_evaluated_ts: sourceTs.toISOString() });
        return false;
      }

      if (state.evaluation_state === "PAUSED") {
        const pausedSeconds = state.paused_since ? Math.max(0, Math.round((sourceTs.getTime() - new Date(state.paused_since).getTime()) / 1000)) : 0;
        state.total_paused_seconds = Number(state.total_paused_seconds || 0) + pausedSeconds;
        state.evaluation_state = state.state_before_pause || "RAMPING";
        state.state_before_pause = null;
        state.paused_since = null;
        await client.query("UPDATE process_target_execution SET total_paused_seconds=$2, updated_at=NOW() WHERE target_execution_id=$1", [state.target_execution_id, state.total_paused_seconds]);
      }

      await this.advanceTracker(client, state, rule, run, step, pvTag, svTag, Number(sv.value), pv, quality, sourceTs);
      return true;
    });
  }

  private async resolveTag(assetId: string, tagCode: string | null, signalRole: string | null) {
    if (tagCode) {
      const result = await this.database.query("SELECT * FROM tag_definition WHERE tag_code=$1 AND asset_id=$2 AND active=TRUE", [tagCode, assetId]);
      return result.rows[0] || null;
    }
    if (!signalRole) return null;
    const result = await this.database.query(`
      SELECT * FROM tag_definition
      WHERE asset_id=$1 AND active=TRUE AND UPPER(signal_role)=UPPER($2)
      ORDER BY tag_code LIMIT 1
    `, [assetId, signalRole]);
    return result.rows[0] || null;
  }

  private async latestSample(tagCode: string, sourceTs: Date) {
    const result = await this.database.query(`
      SELECT * FROM telemetry_sample
      WHERE tag_code=$1 AND source_ts <= $2 AND value_number IS NOT NULL
      ORDER BY source_ts DESC, id DESC LIMIT 1
    `, [tagCode, sourceTs.toISOString()]);
    return result.rows[0] || null;
  }

  private async resolveSetpoint(rule: Record<string, any>, step: Record<string, any> | null, svTag: Record<string, any> | null, sourceTs: Date) {
    if (svTag) {
      const sample = await this.latestSample(svTag.tag_code, sourceTs);
      if (sample && String(sample.quality || "GOOD").toUpperCase() === "GOOD" && Number.isFinite(Number(sample.value_number))) {
        return { value: Number(sample.value_number), source: "PLC_TELEMETRY", sample, unit: svTag.engineering_unit || null };
      }
    }
    const key = rule.setpoint_key;
    const value = key && step?.setpoint_json ? step.setpoint_json[key] : null;
    if (value != null && Number.isFinite(Number(value))) {
      return { value: Number(value), source: "PROCESS_STEP", sample: null, unit: null };
    }
    return null;
  }

  private async createTracker(client: any, rule: Record<string, any>, run: Record<string, any>, step: Record<string, any> | null, pvTag: Record<string, any>, svTag: Record<string, any> | null, sv: Record<string, any>, pv: number, quality: string, sourceTs: Date, trackingStart: string, revision: number) {
    const targetExecutionId = randomUUID();
    const stateId = randomUUID();
    const parameterCode = pvTag.signal_role || pvTag.tag_code;
    const config = this.configSnapshot(rule);
    await client.query(`
      INSERT INTO process_target_execution (
        target_execution_id, rule_id, process_run_id, step_execution_id, asset_id,
        batch_no, parameter_code, pv_tag_code, sv_tag_code, revision_no, sv_value,
        tolerance_low, tolerance_high, target_state, tracking_started_at, worst_pv,
        last_pv, last_source_ts, config_snapshot, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'RAMPING',$14,$15,$15,$16,$17::jsonb,NOW(),NOW())
    `, [targetExecutionId, rule.rule_id, run.process_run_id, step?.step_execution_id || null, run.asset_id, run.batch_no, parameterCode, pvTag.tag_code, svTag?.tag_code || null, revision, sv.value, rule.tolerance_low, rule.tolerance_high, trackingStart, pv, sourceTs.toISOString(), JSON.stringify(config)]);
    await client.query(`
      INSERT INTO process_deviation_rule_state (
        state_id, rule_id, process_run_id, step_execution_id, target_execution_id,
        asset_id, batch_no, pv_tag_code, sv_tag_code, evaluation_state,
        tracking_started_at, sv_value, last_pv, last_quality, last_evaluated_ts, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'RAMPING',$10,$11,$12,$13,$14,NOW())
    `, [stateId, rule.rule_id, run.process_run_id, step?.step_execution_id || null, targetExecutionId, run.asset_id, run.batch_no, pvTag.tag_code, svTag?.tag_code || null, trackingStart, sv.value, pv, quality, sourceTs.toISOString()]);
    await this.insertSetpointChange(client, {
      rule, run, step, targetExecutionId, parameterCode, svTag, oldValue: null,
      newValue: Number(sv.value), sv, sourceTs, reason: "Initial target for process run",
    });
    return {
      state_id: stateId, rule_id: rule.rule_id, process_run_id: run.process_run_id,
      step_execution_id: step?.step_execution_id || null, target_execution_id: targetExecutionId,
      asset_id: run.asset_id, batch_no: run.batch_no, pv_tag_code: pvTag.tag_code,
      sv_tag_code: svTag?.tag_code || null, evaluation_state: "RAMPING" as TrackerState,
      tracking_started_at: trackingStart, sv_value: Number(sv.value), last_pv: pv,
      last_quality: quality, last_evaluated_ts: sourceTs.toISOString(), revision_no: revision,
    };
  }

  private async applySetpointChange(client: any, state: Record<string, any>, rule: Record<string, any>, run: Record<string, any>, step: Record<string, any> | null, pvTag: Record<string, any>, svTag: Record<string, any> | null, sv: Record<string, any>, pv: number, quality: string, sourceTs: Date) {
    await this.closeActiveDeviation(client, state, sourceTs, "TARGET_CHANGED");
    await client.query(`
      UPDATE process_target_execution
      SET target_state='SUPERSEDED', ended_at=$2, end_reason='TARGET_CHANGED', last_pv=$3,
          last_source_ts=$2, updated_at=NOW()
      WHERE target_execution_id=$1
    `, [state.target_execution_id, sourceTs.toISOString(), pv]);
    await client.query("DELETE FROM process_deviation_rule_state WHERE state_id=$1", [state.state_id]);
    const next = await this.createTracker(client, rule, run, step, pvTag, svTag, sv, pv, quality, sourceTs, sourceTs.toISOString(), Number(state.revision_no || 1) + 1);
    await client.query(`
      UPDATE process_setpoint_change_event
      SET old_sv_value=$2, change_reason='SV changed during active process run'
      WHERE setpoint_change_id=(
        SELECT setpoint_change_id FROM process_setpoint_change_event
        WHERE target_execution_id=$1 ORDER BY changed_at DESC LIMIT 1
      )
    `, [next.target_execution_id, state.sv_value]);
    return next;
  }

  private async advanceTracker(client: any, state: Record<string, any>, rule: Record<string, any>, run: Record<string, any>, step: Record<string, any> | null, pvTag: Record<string, any>, svTag: Record<string, any> | null, sv: number, pv: number, quality: string, sourceTs: Date) {
    const currentState = state.evaluation_state as TrackerState;
    const within = this.isWithin(rule, sv, pv, currentState === "DEVIATING" || currentState === "CLEARING");
    const elapsed = (from: unknown, subtractPause = false) => from ? Math.max(0, sourceTs.getTime() - new Date(String(from)).getTime() - (subtractPause ? Number(state.total_paused_seconds || 0) * 1000 : 0)) : 0;
    let nextState: TrackerState = currentState;
    let withinSince = state.within_since || null;
    let outsideSince = state.outside_since || null;
    let activeDeviationId = state.active_deviation_event_id || null;
    const targetUpdates: Record<string, unknown> = {};

    if (quality !== "GOOD") {
      await this.updateState(client, state, { last_pv: pv, last_quality: quality, last_evaluated_ts: sourceTs.toISOString() });
      await this.updateTarget(client, state.target_execution_id, currentState, pv, sourceTs);
      return;
    }

    if (currentState === "RAMPING" || currentState === "WAITING") {
      if (within) {
        nextState = "STABILIZING";
        withinSince = sourceTs.toISOString();
        targetUpdates.first_reached_at = sourceTs.toISOString();
      } else if (rule.monitor_reach && rule.expected_reach_time_seconds != null) {
        const deadlineSeconds = Number(rule.startup_grace_seconds || 0) + Number(rule.expected_reach_time_seconds);
        if (elapsed(state.tracking_started_at, true) >= deadlineSeconds * 1000) {
          activeDeviationId = await this.activateDeviation(client, state, rule, run, step, pvTag, svTag, "TIME_TO_TARGET", sv, pv, sourceTs);
          nextState = "DEVIATING";
          outsideSince = sourceTs.toISOString();
          targetUpdates.lost_target_at = sourceTs.toISOString();
        }
      }
    } else if (currentState === "STABILIZING") {
      if (!within) {
        nextState = "RAMPING";
        withinSince = null;
      } else if (elapsed(withinSince) >= Number(rule.stable_confirmation_seconds || 0) * 1000) {
        nextState = "STABLE";
        targetUpdates.stable_at = sourceTs.toISOString();
        targetUpdates.time_to_target_seconds = Math.max(0, Math.round(elapsed(state.tracking_started_at, true) / 1000));
        outsideSince = null;
      }
    } else if (currentState === "STABLE") {
      if (!within && rule.monitor_hold) {
        nextState = "PENDING";
        outsideSince = sourceTs.toISOString();
      }
    } else if (currentState === "PENDING") {
      if (within) {
        nextState = "STABLE";
        outsideSince = null;
      } else if (elapsed(outsideSince) >= Number(rule.deviation_delay_seconds || 0) * 1000) {
        activeDeviationId = await this.activateDeviation(client, state, rule, run, step, pvTag, svTag, "HOLD_TARGET", sv, pv, sourceTs);
        nextState = "DEVIATING";
        targetUpdates.lost_target_at = outsideSince || sourceTs.toISOString();
      }
    } else if (currentState === "DEVIATING") {
      await this.updateDeviationWorst(client, activeDeviationId, rule, sv, pv, sourceTs);
      if (within) {
        nextState = "CLEARING";
        withinSince = sourceTs.toISOString();
      }
    } else if (currentState === "CLEARING") {
      if (!within) {
        nextState = "DEVIATING";
        withinSince = null;
        await this.updateDeviationWorst(client, activeDeviationId, rule, sv, pv, sourceTs);
      } else if (elapsed(withinSince) >= Number(rule.clear_confirmation_seconds || 0) * 1000) {
        await this.closeActiveDeviation(client, { ...state, active_deviation_event_id: activeDeviationId }, sourceTs, "VALUE_RESTORED");
        activeDeviationId = null;
        nextState = "STABLE";
        outsideSince = null;
        targetUpdates.restored_at = sourceTs.toISOString();
        if (!state.first_reached_at) {
          targetUpdates.first_reached_at = withinSince || sourceTs.toISOString();
          targetUpdates.stable_at = sourceTs.toISOString();
          targetUpdates.time_to_target_seconds = Math.max(0, Math.round(elapsed(state.tracking_started_at, true) / 1000));
        }
      }
    }

    await this.updateState(client, state, {
      evaluation_state: nextState,
      state_before_pause: null,
      paused_since: null,
      within_since: withinSince,
      outside_since: outsideSince,
      active_deviation_event_id: activeDeviationId,
      last_pv: pv,
      last_quality: quality,
      last_evaluated_ts: sourceTs.toISOString(),
    });
    await this.updateTarget(client, state.target_execution_id, nextState, pv, sourceTs, targetUpdates);
  }

  private isWithin(rule: Record<string, any>, sv: number, pv: number, clearing: boolean) {
    const mode = String(rule.deviation_mode || "ABSOLUTE");
    const scale = mode === "PERCENT" ? Math.abs(sv) / 100 : 1;
    let lowTolerance = Number(rule.tolerance_low || 0) * scale;
    let highTolerance = Number(rule.tolerance_high || 0) * scale;
    if (clearing) {
      lowTolerance = Math.max(0, lowTolerance - Number(rule.hysteresis_value || 0) * scale);
      highTolerance = Math.max(0, highTolerance - Number(rule.hysteresis_value || 0) * scale);
    }
    return pv >= sv - lowTolerance && pv <= sv + highTolerance;
  }

  private deviationValues(rule: Record<string, any>, sv: number, pv: number) {
    const delta = pv - sv;
    const abs = Math.abs(delta);
    const percent = sv === 0 ? null : (delta / Math.abs(sv)) * 100;
    return { delta, abs, percent };
  }

  private async activateDeviation(client: any, state: Record<string, any>, rule: Record<string, any>, run: Record<string, any>, step: Record<string, any> | null, pvTag: Record<string, any>, svTag: Record<string, any> | null, eventClass: "TIME_TO_TARGET" | "HOLD_TARGET", sv: number, pv: number, sourceTs: Date) {
    if (state.active_deviation_event_id) return state.active_deviation_event_id;
    const deviationEventId = randomUUID();
    const values = this.deviationValues(rule, sv, pv);
    let alarmEventId: string | null = null;
    if (["WARNING", "CRITICAL"].includes(String(rule.severity).toUpperCase())) {
      alarmEventId = randomUUID();
      const title = rule.alarm_message || `${rule.rule_name} · ${eventClass}`;
      await client.query(`
        INSERT INTO alarm_event (
          alarm_event_id, asset_id, tag_code, batch_no, area_code, severity,
          event_state, alarm_code, title, detail, occurred_at, source_ts, created_at,
          trigger_value, threshold_value, recommendation, process_run_id,
          step_execution_id, event_class
        ) VALUES ($1,$2,$3,$4,$5,$6,'ACTIVE',$7,$8,$9,$10,$10,NOW(),$11,$12,$13,$14,$15,'PROCESS_DEVIATION')
      `, [alarmEventId, run.asset_id, pvTag.tag_code, run.batch_no, run.area_code || null, rule.severity, rule.rule_code, title, `${eventClass}: PV ${pv} terhadap SV ${sv}.`, sourceTs.toISOString(), pv, sv, rule.recommendation || null, run.process_run_id, step?.step_execution_id || null]);
    }
    await client.query(`
      INSERT INTO process_deviation_event (
        deviation_event_id, process_run_id, step_execution_id, target_execution_id,
        asset_id, batch_no, rule_id, event_class, severity, event_state, pv_tag_code,
        sv_tag_code, sv_value, trigger_pv, worst_pv, tolerance_low, tolerance_high,
        max_abs_deviation, max_deviation_percent, started_at, impact_code, detail_json,
        alarm_event_id, calculation_version, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'ACTIVE',$10,$11,$12,$13,$13,$14,$15,$16,$17,$18,$19,$20::jsonb,$21,$22,NOW(),NOW())
    `, [deviationEventId, run.process_run_id, step?.step_execution_id || null, state.target_execution_id, run.asset_id, run.batch_no, rule.rule_id, eventClass, rule.severity, pvTag.tag_code, svTag?.tag_code || null, sv, pv, rule.tolerance_low, rule.tolerance_high, values.abs, values.percent, sourceTs.toISOString(), rule.impact_code, JSON.stringify({ rule_code: rule.rule_code, parameter_code: pvTag.signal_role, recommendation: rule.recommendation || null }), alarmEventId, rule.calculation_version]);
    return deviationEventId;
  }

  private async updateDeviationWorst(client: any, deviationEventId: string | null, rule: Record<string, any>, sv: number, pv: number, sourceTs: Date) {
    if (!deviationEventId) return;
    const values = this.deviationValues(rule, sv, pv);
    await client.query(`
      UPDATE process_deviation_event
      SET worst_pv = CASE WHEN $3 > max_abs_deviation THEN $2 ELSE worst_pv END,
          max_abs_deviation = GREATEST(max_abs_deviation, $3),
          max_deviation_percent = CASE
            WHEN $4::double precision IS NULL THEN max_deviation_percent
            WHEN max_deviation_percent IS NULL OR ABS($4) > ABS(max_deviation_percent) THEN $4
            ELSE max_deviation_percent
          END,
          duration_seconds=GREATEST(0, EXTRACT(EPOCH FROM ($5::timestamptz-started_at))::int),
          updated_at=NOW()
      WHERE deviation_event_id=$1 AND event_state='ACTIVE'
    `, [deviationEventId, pv, values.abs, values.percent, sourceTs.toISOString()]);
  }

  private async closeActiveDeviation(client: any, state: Record<string, any>, sourceTs: Date, reason: string) {
    const deviationEventId = state.active_deviation_event_id;
    if (!deviationEventId) return;
    const closed = await client.query(`
      UPDATE process_deviation_event
      SET event_state=CASE WHEN $3='VALUE_RESTORED' THEN 'CLEARED' ELSE 'CLOSED' END,
          ended_at=$2, duration_seconds=GREATEST(0, EXTRACT(EPOCH FROM ($2::timestamptz-started_at))::int),
          end_reason=$3, updated_at=NOW()
      WHERE deviation_event_id=$1 AND event_state='ACTIVE'
      RETURNING alarm_event_id
    `, [deviationEventId, sourceTs.toISOString(), reason]);
    const alarmEventId = closed.rows[0]?.alarm_event_id;
    if (alarmEventId) {
      await client.query(`
        UPDATE alarm_event
        SET event_state='CLEARED', cleared_at=$2, source_ts=$2,
            detail=COALESCE(detail,'') || $3
        WHERE alarm_event_id=$1 AND event_state <> 'CLEARED'
      `, [alarmEventId, sourceTs.toISOString(), ` | Closed: ${reason}.`]);
    }
  }

  private async insertSetpointChange(client: any, input: Record<string, any>) {
    const sample = input.sv.sample;
    await client.query(`
      INSERT INTO process_setpoint_change_event (
        setpoint_change_id, process_run_id, step_execution_id, target_execution_id,
        rule_id, batch_no, asset_id, parameter_code, sv_tag_code, old_sv_value,
        new_sv_value, engineering_unit, changed_at, change_source, changed_by,
        change_reason, source_message_id, source_ts, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$13,NOW())
      ON CONFLICT DO NOTHING
    `, [randomUUID(), input.run.process_run_id, input.step?.step_execution_id || null, input.targetExecutionId, input.rule.rule_id, input.run.batch_no, input.run.asset_id, input.parameterCode, input.svTag?.tag_code || null, input.oldValue, input.newValue, input.sv.unit || input.svTag?.engineering_unit || null, input.sourceTs.toISOString(), input.sv.source, sample?.gateway_id || input.sv.source, input.reason, sample?.message_id || null]);
  }

  private async updateState(client: any, state: Record<string, any>, changes: Record<string, unknown>) {
    const merged = {
      evaluation_state: state.evaluation_state,
      state_before_pause: state.state_before_pause || null,
      within_since: state.within_since || null,
      outside_since: state.outside_since || null,
      paused_since: state.paused_since || null,
      total_paused_seconds: Number(state.total_paused_seconds || 0),
      active_deviation_event_id: state.active_deviation_event_id || null,
      candidate_sv_value: state.candidate_sv_value ?? null,
      candidate_sv_since: state.candidate_sv_since || null,
      last_pv: state.last_pv ?? null,
      last_quality: state.last_quality || null,
      last_evaluated_ts: state.last_evaluated_ts || null,
      ...changes,
    };
    await client.query(`
      UPDATE process_deviation_rule_state SET
        evaluation_state=$2, state_before_pause=$3, within_since=$4, outside_since=$5,
        paused_since=$6, active_deviation_event_id=$7, candidate_sv_value=$8,
        candidate_sv_since=$9, last_pv=$10, last_quality=$11, last_evaluated_ts=$12,
        total_paused_seconds=$13,
        updated_at=NOW()
      WHERE state_id=$1
    `, [state.state_id, merged.evaluation_state, merged.state_before_pause, merged.within_since, merged.outside_since, merged.paused_since, merged.active_deviation_event_id, merged.candidate_sv_value, merged.candidate_sv_since, merged.last_pv, merged.last_quality, merged.last_evaluated_ts, merged.total_paused_seconds]);
    Object.assign(state, merged);
  }

  private async updateTarget(client: any, targetExecutionId: string, state: string, pv: number, sourceTs: Date, extra: Record<string, unknown> = {}) {
    await client.query(`
      UPDATE process_target_execution SET
        target_state=$2,
        first_reached_at=COALESCE(first_reached_at,$3),
        stable_at=COALESCE(stable_at,$4),
        lost_target_at=COALESCE($5,lost_target_at),
        restored_at=COALESCE($6,restored_at),
        time_to_target_seconds=COALESCE(time_to_target_seconds,$7),
        worst_pv=CASE
          WHEN worst_pv IS NULL THEN $8
          WHEN ABS($8-sv_value) > ABS(worst_pv-sv_value) THEN $8
          ELSE worst_pv
        END,
        last_pv=$8, last_source_ts=$9, updated_at=NOW()
      WHERE target_execution_id=$1
    `, [targetExecutionId, state, extra.first_reached_at || null, extra.stable_at || null, extra.lost_target_at || null, extra.restored_at || null, extra.time_to_target_seconds ?? null, pv, sourceTs.toISOString()]);
  }

  private configSnapshot(rule: Record<string, any>) {
    return {
      rule_code: rule.rule_code,
      deviation_mode: rule.deviation_mode,
      tolerance_low: Number(rule.tolerance_low),
      tolerance_high: Number(rule.tolerance_high),
      startup_grace_seconds: Number(rule.startup_grace_seconds),
      expected_reach_time_seconds: rule.expected_reach_time_seconds == null ? null : Number(rule.expected_reach_time_seconds),
      stable_confirmation_seconds: Number(rule.stable_confirmation_seconds),
      deviation_delay_seconds: Number(rule.deviation_delay_seconds),
      clear_confirmation_seconds: Number(rule.clear_confirmation_seconds),
      hysteresis_value: Number(rule.hysteresis_value),
      calculation_version: rule.calculation_version,
    };
  }

  private async finalizeEndedRuns() {
    const result = await this.database.query(`
      WITH ended AS (
        SELECT s.state_id, s.target_execution_id, s.active_deviation_event_id,
               COALESCE(r.ended_at, r.updated_at) AS closed_at, r.run_status
        FROM process_deviation_rule_state s
        JOIN batch_process_run r ON r.process_run_id=s.process_run_id
        WHERE r.run_status IN ('COMPLETED','CANCELLED','FAILED')
      ), close_deviation AS (
        UPDATE process_deviation_event d
        SET event_state='CLOSED', ended_at=e.closed_at,
            duration_seconds=GREATEST(0, EXTRACT(EPOCH FROM (e.closed_at-d.started_at))::int),
            end_reason='PROCESS_RUN_' || e.run_status, updated_at=NOW()
        FROM ended e
        WHERE d.deviation_event_id=e.active_deviation_event_id AND d.event_state='ACTIVE'
        RETURNING d.alarm_event_id, d.ended_at, d.end_reason
      ), close_alarm AS (
        UPDATE alarm_event a
        SET event_state='CLEARED', cleared_at=c.ended_at, source_ts=c.ended_at,
            detail=COALESCE(a.detail,'') || ' | Closed: ' || c.end_reason || '.'
        FROM close_deviation c
        WHERE a.alarm_event_id=c.alarm_event_id AND a.event_state <> 'CLEARED'
        RETURNING a.alarm_event_id
      ), close_target AS (
        UPDATE process_target_execution t
        SET target_state=CASE WHEN e.run_status='COMPLETED' THEN 'COMPLETED' ELSE 'CANCELLED' END,
            ended_at=e.closed_at, end_reason='PROCESS_RUN_' || e.run_status, updated_at=NOW()
        FROM ended e
        WHERE t.target_execution_id=e.target_execution_id
        RETURNING t.target_execution_id
      )
      DELETE FROM process_deviation_rule_state s
      USING ended e
      WHERE s.state_id=e.state_id
      RETURNING s.state_id
    `);
    return Boolean(result.rowCount);
  }

  private saveCursor() {
    return this.database.query(`
      INSERT INTO backend_meta (meta_key, meta_value, updated_at)
      VALUES ('process_deviation_engine.last_telemetry_id', $1, NOW())
      ON CONFLICT (meta_key) DO UPDATE SET meta_value=EXCLUDED.meta_value, updated_at=EXCLUDED.updated_at
    `, [String(this.lastTelemetryId)]);
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : "unknown error";
  }
}
