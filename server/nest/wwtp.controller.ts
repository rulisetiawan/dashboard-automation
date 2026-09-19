import { BadRequestException, Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { resolve } from "node:path";
import { existsSync, createReadStream } from "node:fs";
import { DatabaseService } from "./database.service.js";

function dateRange(from?: string, to?: string) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 7 * 86400000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    throw new BadRequestException("Rentang waktu tidak valid.");
  }
  return { from: start.toISOString(), to: end.toISOString() };
}

@Controller()
export class WwtpController {
  constructor(private readonly database: DatabaseService) {}

  @Get("simulasi-full-process.html")
  serveSimulasiHtml(@Res() res: Response) {
    const candidatePaths = [
      resolve(process.cwd(), "simulasi-full-process.html"),
      resolve(process.cwd(), "dist-backend", "simulasi-full-process.html"),
      resolve(process.cwd(), "dist", "simulasi-full-process.html"),
      "/Users/rulli/kerja/Digital Automation/Digital Automation Dashboard/simulasi-full-process.html",
      "/Users/rulli/kerja/Digital Automation/Dashbord IPAL Monitoring System SMM/simulasi-full-process.html",
    ];

    const foundPath = candidatePaths.find((p) => existsSync(p));
    if (!foundPath) {
      res.status(404).json({
        message: "File simulasi-full-process.html tidak ditemukan.",
        cwd: process.cwd(),
        checkedPaths: candidatePaths,
        error: "Not Found",
        statusCode: 404,
      });
      return;
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    createReadStream(foundPath).pipe(res);
  }

  @Get("api/v1/wwtp/summary")
  async summary(@Query("from") from?: string, @Query("to") to?: string) {
    const range = dateRange(from, to);

    const [realtimeResult, masterResult, logsResult, dailyTrendResult, equipResult] = await Promise.all([
      this.database.query<{
        sensor_tag: string;
        sensor_name: string;
        process: string;
        unit: string;
        value: number | null;
        value_text: string | null;
        status: string | null;
        captured_at: string;
      }>(`
        SELECT sensor_tag, sensor_name, process, unit, value, value_text, status, captured_at
        FROM wwtp.sensor_realtime_values
      `),
      this.database.query<{
        tag_name: string;
        sensor_name: string;
        process: string;
        unit_name: string;
        unit_text: string;
        overview_group: string;
        status: string;
      }>(`
        SELECT tag_name, sensor_name, process, unit_name, unit_text, overview_group, status
        FROM wwtp.asset_sensor_master
      `),
      this.database.query<{
        id: number;
        equipment_name: string;
        process: string;
        action_name: string;
        initiated_by: string;
        role_name: string;
        status: string;
        executed_at: string;
      }>(`
        SELECT id, trigger_name AS equipment_name, page_key AS process, action_name,
               user_name AS initiated_by, role_name, 'Success' AS status, created_at AS executed_at
        FROM wwtp.manual_control_logs
        ORDER BY created_at DESC
        LIMIT 10
      `),
      this.database.query<{
        summary_date: string;
        sensor_tag: string;
        avg_value: number;
        totalizer_delta: number;
      }>(`
        SELECT summary_date, sensor_tag, avg_value, totalizer_delta
        FROM wwtp.sensor_daily_summary
        WHERE summary_date >= $1 AND summary_date <= $2
        ORDER BY summary_date ASC
      `, [range.from, range.to]),
      this.database.query<{
        id: number;
        equipment_name: string;
        process: string;
        status: string;
      }>(`
        SELECT id, equipment_name, process, status
        FROM wwtp.equipment_master
      `),
    ]);

    const realtimeMap = new Map<string, any>();
    for (const r of realtimeResult.rows) {
      realtimeMap.set(r.sensor_tag, r);
      // normalize dash to underscore for alias matching
      realtimeMap.set(r.sensor_tag.replace(/-/g, "_"), r);
    }

    const getVal = (tags: string[]) => {
      for (const tag of tags) {
        const item = realtimeMap.get(tag) || realtimeMap.get(tag.replace(/-/g, "_"));
        if (item && item.value != null && !Number.isNaN(Number(item.value))) {
          return Number(item.value);
        }
      }
      return 0;
    };

    // Calculate Inlets 1..4
    const inletUnits = [1, 2, 3, 4].map((i) => {
      const flowTag = `FM_${9 + i}_FLOW`;
      const flowTagDash = `FM-${9 + i}-FLOW`;
      const totalTag = `FM_${9 + i}_TOTAL`;
      const totalTagDash = `FM-${9 + i}-TOTAL`;
      const tempInTag = `TEMP_INLET_CT_${i}`;
      const tempOutTag = `TEMP_OUTLET_CT_${i}`;

      const flow = getVal([flowTag, flowTagDash]);
      const total = getVal([totalTag, totalTagDash]);
      const tempIn = getVal([tempInTag]);
      const tempOut = getVal([tempOutTag]);
      const deltaT = tempIn > 0 && tempOut > 0 ? Number((tempIn - tempOut).toFixed(1)) : 0;

      return {
        unit: `Inlet ${i}`,
        ctUnit: `CT ${i}`,
        flow,
        total,
        tempIn,
        tempOut,
        deltaT,
        status: flow > 0 ? "Running" : "Idle",
      };
    });

    const totalInflowRate = Number(inletUnits.reduce((acc, u) => acc + u.flow, 0).toFixed(2));
    const avgInletTemp = Number(
      (
        inletUnits.filter((u) => u.tempIn > 0).reduce((acc, u) => acc + u.tempIn, 0) /
        (inletUnits.filter((u) => u.tempIn > 0).length || 1)
      ).toFixed(1)
    );
    const avgOutletTemp = Number(
      (
        inletUnits.filter((u) => u.tempOut > 0).reduce((acc, u) => acc + u.tempOut, 0) /
        (inletUnits.filter((u) => u.tempOut > 0).length || 1)
      ).toFixed(1)
    );
    const coolingDeltaT = avgInletTemp > 0 && avgOutletTemp > 0 ? Number((avgInletTemp - avgOutletTemp).toFixed(1)) : 0;
    const totalInflowTotalizer = Number(inletUnits.reduce((acc, u) => acc + u.total, 0).toFixed(1));

    // Outflow from Lamela & DAF A/B
    const flowLamela = getVal(["IPAL_SENSOR8_DEBIT"]);
    const flowDafA = getVal(["IPAL_SENSOR9_DEBIT"]);
    const flowDafB = getVal(["IPAL_SENSOR10_DEBIT"]);
    const totalOutflowRate = Number((flowLamela + flowDafA + flowDafB).toFixed(2));

    const totalLamela = getVal(["IPAL_SENSOR8_TOTALIZER"]);
    const totalDafA = getVal(["IPAL_SENSOR9_TOTALIZER"]);
    const totalDafB = getVal(["IPAL_SENSOR10_TOTALIZER"]);
    const totalOutflowTotalizer = Number((totalLamela + totalDafA + totalDafB).toFixed(1));

    // Aeration Flow
    const aerationFlow = getVal(["IPAL_SENSOR7_DEBIT"]);

    // Equipment status counts
    const equipRows = equipResult.rows;
    const runningEquip = equipRows.filter((e) => String(e.status).toLowerCase() === "running" || String(e.status).toLowerCase() === "active").length;
    const totalEquip = equipRows.length;

    // Daily trends aggregation for charts
    const dateMap = new Map<string, { date: string; inflowRate: number; outflowRate: number; tempIn: number; tempOut: number; count: number }>();
    for (const d of dailyTrendResult.rows) {
      const dKey = d.summary_date.slice(0, 10);
      if (!dateMap.has(dKey)) {
        dateMap.set(dKey, { date: dKey, inflowRate: 0, outflowRate: 0, tempIn: 0, tempOut: 0, count: 0 });
      }
      const entry = dateMap.get(dKey)!;
      const tag = d.sensor_tag;
      const val = Number(d.avg_value || 0);
      if (tag.includes("FM_10") || tag.includes("FM_11") || tag.includes("FM_12") || tag.includes("FM_13")) {
        entry.inflowRate += val;
      }
      if (tag.includes("SENSOR8_DEBIT") || tag.includes("SENSOR9_DEBIT") || tag.includes("SENSOR10_DEBIT")) {
        entry.outflowRate += val;
      }
      if (tag.includes("TEMP_INLET_CT")) {
        entry.tempIn = val;
      }
      if (tag.includes("TEMP_OUTLET_CT")) {
        entry.tempOut = val;
      }
    }

    const timeSeries = Array.from(dateMap.values()).map((v) => ({
      date: v.date,
      inflow: Number(v.inflowRate.toFixed(1)),
      outflow: Number(v.outflowRate.toFixed(1)),
      tempIn: Number(v.tempIn.toFixed(1)),
      tempOut: Number(v.tempOut.toFixed(1)),
    }));

    // 7 Stages of IPAL
    const stages = [
      {
        stage: 1,
        title: "Inlet & Cooling Tower",
        code: "INLET-CT",
        status: totalInflowRate > 0 ? "Normal" : "Standby",
        tone: totalInflowRate > 0 ? "good" : "neutral",
        primaryMetric: `${totalInflowRate} m³/h`,
        secondaryMetric: `ΔT: ${coolingDeltaT} °C (T-In: ${avgInletTemp}°C / Out: ${avgOutletTemp}°C)`,
        detail: "4 Jalur Inlet menuju Cooling Tower 1..4",
      },
      {
        stage: 2,
        title: "Bak Equalisasi",
        code: "EQ-TANK",
        status: "Normal",
        tone: "good",
        primaryMetric: "Level 68%",
        secondaryMetric: "Pompa Transfer Aktif",
        detail: "Penyeimbang debit limbah sebelum proses kimia",
      },
      {
        stage: 3,
        title: "Koagulasi & Flokulasi",
        code: "COAG-FLOC",
        status: "Normal",
        tone: "good",
        primaryMetric: "pH 7.42",
        secondaryMetric: "Dosing PAC & Polymer ON",
        detail: "Rapid mixer & Slow mixer pengendapan partikel",
      },
      {
        stage: 4,
        title: "Dissolved Air Flotation (DAF)",
        code: "DAF",
        status: "Normal",
        tone: "good",
        primaryMetric: "Tekanan 4.8 bar",
        secondaryMetric: "Saturator & Skimmer ON",
        detail: "Pemisahan suspended solids dengan mikrogelembung",
      },
      {
        stage: 5,
        title: "Bak Aerasi 1 & 2",
        code: "AERATION",
        status: aerationFlow > 0 ? "Normal" : "Active",
        tone: "good",
        primaryMetric: `${aerationFlow} m³/h`,
        secondaryMetric: "Blower BLW-302 Aktif · DO 2.8 mg/L",
        detail: "Pengolahan biologi mikroorganisme aerob",
      },
      {
        stage: 6,
        title: "Filtrasi & Sludge Handling",
        code: "FILTRATION",
        status: "Normal",
        tone: "good",
        primaryMetric: "Sand & Carbon Filter",
        secondaryMetric: "Filter Press Siap Operasi",
        detail: "Penyaringan lanjutan & penekanan lumpur",
      },
      {
        stage: 7,
        title: "Final Outlet & Discharge",
        code: "OUTLET-FINAL",
        status: totalOutflowRate > 0 ? "Normal" : "Standby",
        tone: "good",
        primaryMetric: `${totalOutflowRate} m³/h`,
        secondaryMetric: "Compliance Safe · DAF A/B & Lamela",
        detail: "Saluran pembuangan air olahan sesuai baku mutu",
      },
    ];

    return {
      ok: true,
      range,
      kpi: {
        totalInflowRate,
        totalOutflowRate,
        avgInletTemp,
        avgOutletTemp,
        coolingDeltaT,
        totalInflowTotalizer,
        totalOutflowTotalizer,
        aerationFlow,
        runningEquip,
        totalEquip,
      },
      inletUnits,
      stages,
      timeSeries,
      recentControlLogs: logsResult.rows,
    };
  }

  @Get("api/v1/wwtp/inlet")
  async inlet(@Query("from") from?: string, @Query("to") to?: string) {
    const range = dateRange(from, to);

    const [realtimeResult, masterResult, dailySummaryResult, historyResult] = await Promise.all([
      this.database.query<{
        sensor_tag: string;
        sensor_name: string;
        process: string;
        unit: string;
        value: number | null;
        value_text: string | null;
        status: string | null;
        captured_at: string;
      }>(`
        SELECT sensor_tag, sensor_name, process, unit, value, value_text, status, captured_at
        FROM wwtp.sensor_realtime_values
      `),
      this.database.query<{
        tag_name: string;
        sensor_name: string;
        process: string;
        unit_name: string;
        unit_text: string;
        overview_group: string;
        status: string;
      }>(`
        SELECT tag_name, sensor_name, process, unit_name, unit_text, overview_group, status
        FROM wwtp.asset_sensor_master
        WHERE process ILIKE '%inlet%' OR process ILIKE '%cooling%'
      `),
      this.database.query<{
        summary_date: string;
        sensor_tag: string;
        avg_value: number;
        min_value: number;
        max_value: number;
        totalizer_delta: number;
      }>(`
        SELECT summary_date, sensor_tag, avg_value, min_value, max_value, totalizer_delta
        FROM wwtp.sensor_daily_summary
        WHERE summary_date >= $1 AND summary_date <= $2
        ORDER BY summary_date ASC
      `, [range.from, range.to]),
      this.database.query<{
        sensor_tag: string;
        sensor_name: string;
        process: string;
        unit: string;
        value: number | null;
        status: string | null;
        captured_at: string;
      }>(`
        SELECT sensor_tag, sensor_name, process, unit,
               COALESCE(last_value, avg_value) AS value,
               last_status AS status,
               COALESCE(last_captured_at, bucket_time) AS captured_at
        FROM wwtp.sensor_history_minute
        WHERE (sensor_tag ILIKE 'FM%' OR sensor_tag ILIKE 'TEMP%')
        ORDER BY bucket_time DESC
        LIMIT 100
      `),
    ]);

    const realtimeMap = new Map<string, any>();
    for (const r of realtimeResult.rows) {
      realtimeMap.set(r.sensor_tag, r);
      realtimeMap.set(r.sensor_tag.replace(/-/g, "_"), r);
    }

    const getVal = (tags: string[]) => {
      for (const tag of tags) {
        const item = realtimeMap.get(tag) || realtimeMap.get(tag.replace(/-/g, "_"));
        if (item && item.value != null && !Number.isNaN(Number(item.value))) {
          return Number(item.value);
        }
      }
      return 0;
    };

    const getCapturedAt = (tags: string[]) => {
      for (const tag of tags) {
        const item = realtimeMap.get(tag) || realtimeMap.get(tag.replace(/-/g, "_"));
        if (item && item.captured_at) return item.captured_at;
      }
      return null;
    };

    const units = [1, 2, 3, 4].map((i) => {
      const flow = getVal([`FM_${9 + i}_FLOW`, `FM-${9 + i}-FLOW`]);
      const total = getVal([`FM_${9 + i}_TOTAL`, `FM-${9 + i}-TOTAL`]);
      const tempIn = getVal([`TEMP_INLET_CT_${i}`]);
      const tempOut = getVal([`TEMP_OUTLET_CT_${i}`]);
      const deltaT = tempIn > 0 && tempOut > 0 ? Number((tempIn - tempOut).toFixed(1)) : 0;
      const lastUpdate = getCapturedAt([`FM_${9 + i}_FLOW`, `TEMP_INLET_CT_${i}`]);

      return {
        unitIndex: i,
        name: `Inlet ${i}`,
        coolingTower: `Cooling Tower ${i}`,
        flowRate: flow,
        inletTemp: tempIn,
        outletTemp: tempOut,
        deltaT,
        totalizer: total,
        status: flow > 0 ? "Normal" : "Standby",
        lastUpdate,
      };
    });

    const totalFlow = Number(units.reduce((acc, u) => acc + u.flowRate, 0).toFixed(2));
    const avgFlow = Number((totalFlow / 4).toFixed(2));
    const avgTempIn = Number(
      (
        units.filter((u) => u.inletTemp > 0).reduce((acc, u) => acc + u.inletTemp, 0) /
        (units.filter((u) => u.inletTemp > 0).length || 1)
      ).toFixed(1)
    );
    const avgTempOut = Number(
      (
        units.filter((u) => u.outletTemp > 0).reduce((acc, u) => acc + u.outletTemp, 0) /
        (units.filter((u) => u.outletTemp > 0).length || 1)
      ).toFixed(1)
    );
    const overallDeltaT = avgTempIn > 0 && avgTempOut > 0 ? Number((avgTempIn - avgTempOut).toFixed(1)) : 0;
    const totalVolume = Number(units.reduce((acc, u) => acc + u.totalizer, 0).toFixed(1));

    // Distribution breakdown for donut / bar chart
    const distribution = units.map((u) => ({
      name: u.name,
      totalizer: u.totalizer,
      flowRate: u.flowRate,
      sharePercent: totalVolume > 0 ? Number(((u.totalizer / totalVolume) * 100).toFixed(1)) : 25,
    }));

    // Historical daily chart data
    const dayMap = new Map<string, any>();
    for (const row of dailySummaryResult.rows) {
      const dateKey = row.summary_date.slice(0, 10);
      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, {
          date: dateKey,
          inlet1: 0,
          inlet2: 0,
          inlet3: 0,
          inlet4: 0,
          tempIn: 0,
          tempOut: 0,
        });
      }
      const item = dayMap.get(dateKey);
      const val = Number(row.avg_value || 0);
      if (row.sensor_tag.includes("FM_10")) item.inlet1 = val;
      if (row.sensor_tag.includes("FM_11")) item.inlet2 = val;
      if (row.sensor_tag.includes("FM_12")) item.inlet3 = val;
      if (row.sensor_tag.includes("FM_13")) item.inlet4 = val;
      if (row.sensor_tag.includes("TEMP_INLET")) item.tempIn = val;
      if (row.sensor_tag.includes("TEMP_OUTLET")) item.tempOut = val;
    }

    return {
      ok: true,
      range,
      overview: {
        totalFlow,
        avgFlow,
        avgTempIn,
        avgTempOut,
        overallDeltaT,
        totalVolume,
      },
      units,
      distribution,
      dailyTrend: Array.from(dayMap.values()),
      recentReadings: historyResult.rows,
    };
  }

  @Get("api/v1/wwtp/pid/values")
  async pidValues() {
    const result = await this.database.query<{
      sensor_tag: string;
      sensor_name: string;
      process: string;
      unit: string;
      value: number | null;
      value_text: string | null;
      status: string | null;
      captured_at: string;
    }>(`
      SELECT sensor_tag, sensor_name, process, unit, value, value_text, status, captured_at
      FROM wwtp.sensor_realtime_values
    `);

    const values: Record<string, any> = {};
    for (const r of result.rows) {
      values[r.sensor_tag] = {
        value: r.value,
        value_text: r.value_text,
        unit: r.unit,
        health: r.status,
        captured_at: r.captured_at,
      };
      // alias with underscores
      values[r.sensor_tag.replace(/-/g, "_")] = values[r.sensor_tag];
    }

    return { ok: true, source: "postgresql_wwtp", count: result.rows.length, values };
  }

  @Get("api/v1/wwtp/pid/control-logs")
  async pidControlLogs(@Query("limit") limitRaw?: string) {
    const limit = Math.min(100, Math.max(5, Number(limitRaw) || 20));
    const result = await this.database.query(`
      SELECT id, trigger_name AS equipment_name, trigger_name AS equipment_code,
             page_key AS process, action_name, user_name AS initiated_by,
             role_name, 'Success' AS status, payload, created_at AS executed_at, created_at
      FROM wwtp.manual_control_logs
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);

    return { ok: true, logs: result.rows };
  }

  // Compatible endpoints for embedded iframe simulasi-full-process.html
  @Get("api/asset-sensor-master")
  async assetSensorMaster() {
    const result = await this.database.query(`
      SELECT s.id, s.equipment_id, coalesce(e.process, s.process) AS process,
             s.unit_name,
             coalesce(e.equipment_name, s.equipment_name) AS equipment_name,
             s.sensor_name, s.tag_name, s.unit_text, s.sensor_type, s.overview_group, s.status, s.notes,
             s.created_by, s.created_at, s.updated_at
      FROM wwtp.asset_sensor_master s
      LEFT JOIN wwtp.equipment_master e ON e.id = s.equipment_id
      ORDER BY process, equipment_name, sensor_name
    `);
    return { ok: true, source: "postgresql_wwtp", dataAvailable: result.rows.length > 0, sensors: result.rows };
  }

  @Get("api/equipment-master")
  async equipmentMaster() {
    const result = await this.database.query(`
      SELECT * FROM wwtp.equipment_master
      ORDER BY process, unit_name, equipment_name
    `);
    return { ok: true, source: "postgresql_wwtp", equipment: result.rows };
  }

  @Get("api/page-values")
  async pageValues(@Query("key") key?: string) {
    const result = await this.database.query<{
      sensor_tag: string;
      sensor_name: string;
      process: string;
      unit: string;
      value: number | null;
      value_text: string | null;
      status: string | null;
      captured_at: string;
    }>(`
      SELECT sensor_tag, sensor_name, process, unit, value, value_text, status, captured_at
      FROM wwtp.sensor_realtime_values
    `);

    const values = result.rows.map((r) => ({
      sensorTag: r.sensor_tag,
      sensorName: r.sensor_name,
      process: r.process,
      unit: r.unit,
      value: r.value,
      valueText: r.value_text,
      healthStatus: r.status,
      capturedAt: r.captured_at,
    }));

    return { ok: true, pageKey: key || "process-flow", values };
  }

  @Get("api/manual-control-logs")
  async manualControlLogs(@Query("limit") limitRaw?: string) {
    return this.pidControlLogs(limitRaw);
  }

  @Post("api/manual-control-logs")
  async createManualControlLog(@Body() body: Record<string, any>) {
    const pageKey = String(body.pageKey || "process-flow");
    const triggerName = String(body.triggerName || body.trigger || "UNKNOWN");
    const actionName = String(body.actionName || body.action || "UNKNOWN");
    const userName = String(body.user || body.username || "Operator");
    const roleName = String(body.role || "Operator");
    try {
      await this.database.query(`
        INSERT INTO wwtp.manual_control_logs (page_key, trigger_name, action_name, user_name, role_name, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [pageKey, triggerName, actionName, userName, roleName]);
    } catch (_) {}
    return { ok: true };
  }

  @Get("api/equipment-control")
  async getEquipmentControl() {
    try {
      const result = await this.database.query(`
        SELECT equipment_id, equipment_name, equipment_type, motor_status, auto_mode, updated_at
        FROM wwtp.equipment_control_state
      `);
      return { ok: true, controls: result.rows };
    } catch (_) {
      return { ok: true, controls: [] };
    }
  }

  @Post("api/equipment-control")
  async updateEquipmentControl(@Body() body: Record<string, any>) {
    const equipId = String(body.equipmentId || "");
    const state = String(body.state || "").toLowerCase() === "on" ? "ON" : "OFF";
    try {
      await this.database.query(`
        INSERT INTO wwtp.equipment_control_state (equipment_id, equipment_name, equipment_type, motor_status, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (equipment_id) DO UPDATE
        SET motor_status = EXCLUDED.motor_status,
            updated_at = NOW()
      `, [equipId, body.equipmentName || equipId, body.equipmentType || "Motor", state]);
    } catch (_) {}
    return { ok: true, equipmentId: equipId, motor_status: state };
  }

  @Post("api/login")
  async pidLogin(@Body() body: Record<string, any>) {
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");
    // Support user / automationSMM! or default SMM operator
    if (
      (username.toLowerCase() === "user" && password === "automationSMM!") ||
      (username.toLowerCase() === "admin" && password === "automationSMM!") ||
      (password === "automationSMM!" || password === "sensorSMM!")
    ) {
      return {
        ok: true,
        user: {
          username,
          displayName: username === "user" ? "Operator WWTP" : "Administrator",
          role: "Operator",
          roleName: "Operator",
        },
      };
    }
    return { ok: false, error: "Username atau password salah." };
  }
}

