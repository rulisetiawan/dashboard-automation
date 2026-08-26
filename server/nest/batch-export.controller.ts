import { BadRequestException, Controller, Get, NotFoundException, Param, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { DatabaseService } from "./database.service.js";

type ExportFormat = "pdf" | "xlsx";

const jakartaDateTime = (value: unknown) => {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

const plainJson = (value: unknown) => {
  if (!value || (typeof value === "object" && !Object.keys(value as object).length)) return "-";
  return typeof value === "string" ? value : JSON.stringify(value);
};

const safeFilename = (value: unknown) => String(value || "batch").replace(/[^A-Za-z0-9_-]+/g, "-").slice(0, 80);

const settingUnit = (key: string) => {
  const normalized = String(key || "").toLowerCase();
  if (normalized.endsWith("_kg")) return "kg";
  if (normalized.endsWith("_cm")) return "cm";
  if (normalized.endsWith("_percent")) return "%";
  if (normalized.endsWith("_c")) return "°C";
  if (normalized.endsWith("_m")) return "m";
  return "";
};

const metricText = (value: unknown) => {
  if (value == null || value === "") return "-";
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "-";
};

@Controller("api/v1/batch")
export class BatchExportController {
  constructor(private readonly database: DatabaseService) {}

  @Get("process-runs/:processRunId/export")
  async exportProcessRun(
    @Param("processRunId") processRunId: string,
    @Query("format") requestedFormat: string | undefined,
    @Res() response: Response,
  ) {
    const format = String(requestedFormat || "xlsx").toLowerCase() as ExportFormat;
    if (!(["pdf", "xlsx"] as string[]).includes(format)) throw new BadRequestException("format harus pdf atau xlsx");

    const data = await this.loadExportData(processRunId);
    const filename = `${safeFilename(data.run.batch_no)}-${safeFilename(data.run.asset_id)}-process-detail.${format}`;

    if (format === "xlsx") {
      const buffer = await this.buildWorkbook(data);
      response.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      response.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      response.setHeader("Content-Length", buffer.length);
      response.end(buffer);
      return;
    }

    const buffer = await this.buildPdf(data);
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    response.setHeader("Content-Length", buffer.length);
    response.end(buffer);
  }

  private async loadExportData(processRunId: string) {
    const runResult = await this.database.query(`
      SELECT
        r.*,
        a.display_name AS asset_name,
        a.area_name,
        b.customer_name,
        b.fabric_type,
        b.fabric_weight_gsm,
        b.target_width_cm,
        b.target_output_kg,
        b.delivery_target_at,
        b.batch_status
      FROM batch_process_run r
      JOIN production_batch b ON b.batch_no = r.batch_no
      JOIN asset a ON a.asset_id = r.asset_id
      WHERE r.process_run_id = $1
    `, [processRunId]);
    const run = runResult.rows[0];
    if (!run) throw new NotFoundException("process run not found");

    const rangeStart = run.started_at || run.created_at;
    const rangeEnd = run.ended_at || new Date().toISOString();
    const [steps, transitions, alarms, stateEvents, telemetrySummary, telemetryRows, targets, setpointChanges, deviations] = await Promise.all([
      this.database.query("SELECT * FROM process_step_execution WHERE process_run_id = $1 ORDER BY step_no", [processRunId]),
      this.database.query("SELECT * FROM process_transition_event WHERE process_run_id = $1 ORDER BY source_ts", [processRunId]),
      this.database.query(`
        SELECT * FROM alarm_event
        WHERE batch_no = $2
           OR (asset_id = $1 AND occurred_at >= $3 AND occurred_at <= $4)
        ORDER BY occurred_at
      `, [run.asset_id, run.batch_no, rangeStart, rangeEnd]),
      this.database.query(`
        SELECT * FROM machine_state_event
        WHERE asset_id = $1
          AND started_at <= $3
          AND COALESCE(ended_at, $3::timestamptz) >= $2
        ORDER BY started_at
      `, [run.asset_id, rangeStart, rangeEnd]),
      this.database.query(`
        SELECT
          ts.tag_code,
          td.signal_role,
          td.engineering_unit,
          COUNT(*)::int AS sample_count,
          COUNT(*) FILTER (WHERE ts.quality = 'GOOD')::int AS good_count,
          MIN(ts.value_number) AS min_value,
          AVG(ts.value_number) AS avg_value,
          MAX(ts.value_number) AS max_value,
          (ARRAY_AGG(ts.value_number ORDER BY ts.source_ts DESC) FILTER (WHERE ts.value_number IS NOT NULL))[1] AS last_value,
          MAX(ts.source_ts) AS last_source_ts
        FROM telemetry_sample ts
        JOIN tag_definition td ON td.tag_code = ts.tag_code
        WHERE ts.asset_id = $1 AND ts.source_ts >= $2 AND ts.source_ts <= $3
        GROUP BY ts.tag_code, td.signal_role, td.engineering_unit
        ORDER BY td.signal_role, ts.tag_code
      `, [run.asset_id, rangeStart, rangeEnd]),
      this.database.query(`
        SELECT
          ts.source_ts,
          ts.tag_code,
          td.signal_role,
          td.engineering_unit,
          ts.value_number,
          ts.value_text,
          ts.quality,
          ts.gateway_id,
          ts.message_id
        FROM telemetry_sample ts
        JOIN tag_definition td ON td.tag_code = ts.tag_code
        WHERE ts.asset_id = $1 AND ts.source_ts >= $2 AND ts.source_ts <= $3
        ORDER BY ts.source_ts, ts.tag_code
        LIMIT 200000
      `, [run.asset_id, rangeStart, rangeEnd]),
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
      run,
      steps: steps.rows,
      transitions: transitions.rows,
      alarms: alarms.rows,
      stateEvents: stateEvents.rows,
      telemetrySummary: telemetrySummary.rows,
      telemetryRows: telemetryRows.rows,
      targets: targets.rows,
      setpointChanges: setpointChanges.rows,
      deviations: deviations.rows,
      rangeStart,
      rangeEnd,
    };
  }

  private styleWorksheet(worksheet: ExcelJS.Worksheet) {
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    const header = worksheet.getRow(1);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF078BA5" } };
    header.alignment = { vertical: "middle" };
    header.height = 23;
    worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: Math.max(1, worksheet.columnCount) } };
    worksheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        maxLength = Math.max(maxLength, String(cell.value ?? "").length);
      });
      column.width = Math.min(42, maxLength + 2);
    });
  }

  private async buildWorkbook(data: Awaited<ReturnType<BatchExportController["loadExportData"]>>) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PT.SMM Digital Automation Dashboard";
    workbook.created = new Date();
    workbook.properties.date1904 = false;

    const summary = workbook.addWorksheet("Batch Summary");
    summary.addRow(["Field", "Value"]);
    [
      ["Batch Number", data.run.batch_no], ["Asset", data.run.asset_id], ["Machine", data.run.asset_name], ["Area", data.run.area_name],
      ["Process", data.run.process_type], ["Recipe", data.run.recipe_code], ["Run Status", data.run.run_status], ["Batch Status", data.run.batch_status],
      ["Customer", data.run.customer_name], ["Fabric Type", data.run.fabric_type], ["Gramasi (gsm)", data.run.fabric_weight_gsm],
      ["Target Width (cm)", data.run.target_width_cm], ["Target Output (kg)", data.run.target_output_kg],
      ["Actual Output", data.run.output_quantity], ["Output Unit", data.run.output_unit], ["Start", jakartaDateTime(data.rangeStart)],
      ["End", jakartaDateTime(data.rangeEnd)], ["Delivery Target", jakartaDateTime(data.run.delivery_target_at)], ["Exported At", jakartaDateTime(new Date())],
    ].forEach((row) => summary.addRow(row));
    this.styleWorksheet(summary);

    const settings = workbook.addWorksheet("Parameter Settings");
    settings.addRow(["Step", "Process", "Parameter", "SV / Target", "Unit", "Start", "End", "Status"]);
    data.steps.forEach((step) => {
      const entries = Object.entries(step.setpoint_json || {});
      (entries.length ? entries : [["-", "-"]]).forEach(([key, value]) => settings.addRow([
        step.step_no, step.step_name, key, typeof value === "object" ? JSON.stringify(value) : value, settingUnit(key), jakartaDateTime(step.started_at), jakartaDateTime(step.ended_at), step.status,
      ]));
    });
    this.styleWorksheet(settings);

    const sequence = workbook.addWorksheet("Process Sequence");
    sequence.addRow(["Step", "Step Code", "Process", "Start", "End", "Status", "Setpoint", "Actual"]);
    data.steps.forEach((step) => sequence.addRow([step.step_no, step.step_code, step.step_name, jakartaDateTime(step.started_at), jakartaDateTime(step.ended_at), step.status, plainJson(step.setpoint_json), plainJson(step.actual_json)]));
    this.styleWorksheet(sequence);

    const sensors = workbook.addWorksheet("Sensor Summary");
    sensors.addRow(["Tag Code", "Signal Role", "Unit", "Samples", "Good", "Min", "Average", "Max", "Last", "Last Source Time"]);
    data.telemetrySummary.forEach((item) => sensors.addRow([item.tag_code, item.signal_role, item.engineering_unit, item.sample_count, item.good_count, item.min_value, item.avg_value, item.max_value, item.last_value, jakartaDateTime(item.last_source_ts)]));
    this.styleWorksheet(sensors);

    const telemetry = workbook.addWorksheet("Telemetry Data");
    telemetry.addRow(["Source Time", "Tag Code", "Signal Role", "Value Number", "Value Text", "Unit", "Quality", "Gateway", "Message ID"]);
    data.telemetryRows.forEach((item) => telemetry.addRow([jakartaDateTime(item.source_ts), item.tag_code, item.signal_role, item.value_number, item.value_text, item.engineering_unit, item.quality, item.gateway_id, item.message_id]));
    this.styleWorksheet(telemetry);

    const states = workbook.addWorksheet("Machine State");
    states.addRow(["State", "Start", "End", "Duration (min)", "Reason", "Quality"]);
    data.stateEvents.forEach((event) => {
      const start = Math.max(new Date(event.started_at).getTime(), new Date(data.rangeStart).getTime());
      const end = Math.min(new Date(event.ended_at || data.rangeEnd).getTime(), new Date(data.rangeEnd).getTime());
      states.addRow([event.machine_state, jakartaDateTime(event.started_at), jakartaDateTime(event.ended_at || data.rangeEnd), Math.max(0, (end - start) / 60000), event.reason_code, event.quality]);
    });
    this.styleWorksheet(states);

    const transitions = workbook.addWorksheet("Transitions");
    transitions.addRow(["Time", "Type", "Status", "Reason", "Source Signal", "Requested By", "Detail"]);
    data.transitions.forEach((item) => transitions.addRow([jakartaDateTime(item.source_ts), item.transition_type, item.transition_status, item.reason_code, item.source_signal, item.requested_by, plainJson(item.detail_json)]));
    this.styleWorksheet(transitions);

    const targets = workbook.addWorksheet("Target Achievement");
    targets.addRow(["Parameter", "Revision", "Step", "SV", "Tolerance Low", "Tolerance High", "Unit", "Tracking Start", "First Reached", "Stable At", "Time to Target (s)", "State", "Worst PV", "End", "End Reason"]);
    data.targets.forEach((item) => targets.addRow([item.parameter_code, item.revision_no, item.step_code || item.step_name, item.sv_value, item.tolerance_low, item.tolerance_high, item.engineering_unit, jakartaDateTime(item.tracking_started_at), jakartaDateTime(item.first_reached_at), jakartaDateTime(item.stable_at), item.time_to_target_seconds, item.target_state, item.worst_pv, jakartaDateTime(item.ended_at), item.end_reason]));
    this.styleWorksheet(targets);

    const setpointChanges = workbook.addWorksheet("Setpoint Changes");
    setpointChanges.addRow(["Time", "Parameter", "Step", "Old SV", "New SV", "Unit", "Source", "Changed By", "Reason", "Message ID"]);
    data.setpointChanges.forEach((item) => setpointChanges.addRow([jakartaDateTime(item.changed_at), item.parameter_code, item.step_code || item.step_name, item.old_sv_value, item.new_sv_value, item.engineering_unit, item.change_source, item.changed_by, item.change_reason, item.source_message_id]));
    this.styleWorksheet(setpointChanges);

    const deviations = workbook.addWorksheet("Process Deviations");
    deviations.addRow(["Start", "End", "Duration (s)", "Class", "Severity", "State", "Step", "Parameter", "SV", "Trigger PV", "Worst PV", "Tolerance Low", "Tolerance High", "Max Abs Deviation", "Max Deviation %", "Impact", "End Reason", "Acknowledged By"]);
    data.deviations.forEach((item) => deviations.addRow([jakartaDateTime(item.started_at), jakartaDateTime(item.ended_at), item.duration_seconds, item.event_class, item.severity, item.event_state, item.step_code || item.step_name, item.parameter_code, item.sv_value, item.trigger_pv, item.worst_pv, item.tolerance_low, item.tolerance_high, item.max_abs_deviation, item.max_deviation_percent, item.impact_code, item.end_reason, item.acknowledged_by]));
    this.styleWorksheet(deviations);

    const alarms = workbook.addWorksheet("Abnormality Log");
    alarms.addRow(["Occurred At", "Cleared At", "Severity", "Event State", "Alarm Code", "Title", "Detail", "Tag Code", "Batch", "Acknowledged By"]);
    data.alarms.forEach((item) => alarms.addRow([jakartaDateTime(item.occurred_at), jakartaDateTime(item.cleared_at), item.severity, item.event_state, item.alarm_code, item.title, item.detail, item.tag_code, item.batch_no, item.acknowledged_by]));
    this.styleWorksheet(alarms);

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private buildPdf(data: Awaited<ReturnType<BatchExportController["loadExportData"]>>) {
    return new Promise<Buffer>((resolve, reject) => {
      const document = new PDFDocument({ size: "A4", margin: 42, info: { Title: `${data.run.batch_no} Process Detail`, Author: "PT.SMM Digital Automation Dashboard" } });
      const chunks: Buffer[] = [];
      document.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      document.on("end", () => resolve(Buffer.concat(chunks)));
      document.on("error", reject);

      const section = (title: string) => {
        document.moveDown(0.8).font("Helvetica-Bold").fontSize(12).fillColor("#087f98").text(title);
        document.moveDown(0.25).strokeColor("#d6e1e4").moveTo(document.x, document.y).lineTo(553, document.y).stroke().moveDown(0.5);
      };
      const line = (label: string, value: unknown) => {
        document.font("Helvetica-Bold").fontSize(8.5).fillColor("#526a74").text(`${label}: `, { continued: true });
        document.font("Helvetica").fillColor("#162830").text(value == null || value === "" ? "-" : String(value));
      };

      document.font("Helvetica-Bold").fontSize(17).fillColor("#142830").text("PT.SMM Batch Process Detail");
      document.font("Helvetica").fontSize(9).fillColor("#70858e").text("Digital Automation Dashboard - PostgreSQL actual data");
      document.moveDown(0.7);
      line("Batch", data.run.batch_no);
      line("Machine", `${data.run.asset_id} - ${data.run.asset_name}`);
      line("Area / Process", `${data.run.area_name || "-"} / ${data.run.process_type}`);
      line("Customer / Fabric", `${data.run.customer_name || "-"} / ${data.run.fabric_type || "-"}`);
      line("Recipe", data.run.recipe_code);
      line("Status", `${data.run.run_status} / ${data.run.batch_status}`);
      line("Start - End", `${jakartaDateTime(data.rangeStart)} - ${jakartaDateTime(data.rangeEnd)}`);
      line("Target / Actual output", `${data.run.target_output_kg ?? "-"} kg / ${data.run.output_quantity ?? "-"} ${data.run.output_unit || ""}`);

      section(`Process Sequence (${data.steps.length} steps)`);
      if (!data.steps.length) document.font("Helvetica").fontSize(8.5).fillColor("#70858e").text("No process step data.");
      data.steps.forEach((step) => {
        document.font("Helvetica-Bold").fontSize(8.5).fillColor("#162830").text(`${String(step.step_no).padStart(2, "0")}  ${step.step_name}  [${step.status}]`);
        document.font("Helvetica").fontSize(7.5).fillColor("#617780").text(`${jakartaDateTime(step.started_at)} - ${jakartaDateTime(step.ended_at)} | SV: ${plainJson(step.setpoint_json)} | Actual: ${plainJson(step.actual_json)}`);
        document.moveDown(0.3);
      });

      section(`Sensor Summary (${data.telemetrySummary.length} tags)`);
      if (!data.telemetrySummary.length) document.font("Helvetica").fontSize(8.5).fillColor("#70858e").text("No telemetry in batch interval.");
      data.telemetrySummary.forEach((item) => {
        const unit = item.engineering_unit || "";
        document.font("Helvetica-Bold").fontSize(8).fillColor("#162830").text(`${item.signal_role} (${item.tag_code})`);
        document.font("Helvetica").fontSize(7.5).fillColor("#617780").text(`Min ${metricText(item.min_value)} ${unit} | Avg ${metricText(item.avg_value)} ${unit} | Max ${metricText(item.max_value)} ${unit} | Last ${metricText(item.last_value)} ${unit} | ${item.sample_count} samples`);
        document.moveDown(0.25);
      });

      section(`Machine State (${data.stateEvents.length} events)`);
      if (!data.stateEvents.length) document.font("Helvetica").fontSize(8.5).fillColor("#70858e").text("No machine state event in batch interval.");
      data.stateEvents.forEach((event) => document.font("Helvetica").fontSize(8).fillColor("#162830").text(`${String(event.machine_state).toUpperCase()} | ${jakartaDateTime(event.started_at)} - ${jakartaDateTime(event.ended_at || data.rangeEnd)} | ${event.reason_code || "-"}`));

      section(`Process Transitions (${data.transitions.length})`);
      if (!data.transitions.length) document.font("Helvetica").fontSize(8.5).fillColor("#70858e").text("No transition event.");
      data.transitions.forEach((item) => document.font("Helvetica").fontSize(8).fillColor("#162830").text(`${jakartaDateTime(item.source_ts)} | ${item.transition_type} | ${item.transition_status} | ${item.reason_code || "-"}`));

      section(`Target Achievement (${data.targets.length} revisions)`);
      if (!data.targets.length) document.font("Helvetica").fontSize(8.5).fillColor("#70858e").text("No target achievement data.");
      data.targets.forEach((item) => {
        document.font("Helvetica-Bold").fontSize(8).fillColor("#162830").text(`${item.parameter_code} · revision ${item.revision_no} · ${item.target_state}`);
        document.font("Helvetica").fontSize(7.5).fillColor("#617780").text(`SV ${metricText(item.sv_value)} ${item.engineering_unit || ""} | first reached ${jakartaDateTime(item.first_reached_at)} | stable ${jakartaDateTime(item.stable_at)} | time to target ${item.time_to_target_seconds ?? "-"} sec`);
        document.moveDown(0.25);
      });

      section(`Setpoint Changes (${data.setpointChanges.length})`);
      if (!data.setpointChanges.length) document.font("Helvetica").fontSize(8.5).fillColor("#70858e").text("No setpoint revision.");
      data.setpointChanges.forEach((item) => document.font("Helvetica").fontSize(8).fillColor("#162830").text(`${jakartaDateTime(item.changed_at)} | ${item.parameter_code} | ${item.old_sv_value ?? "-"} → ${item.new_sv_value} ${item.engineering_unit || ""} | ${item.change_source}`));

      section(`Process Deviations (${data.deviations.length})`);
      if (!data.deviations.length) document.font("Helvetica").fontSize(8.5).fillColor("#15966f").text("No PV/SV deviation event.");
      data.deviations.forEach((item) => {
        document.font("Helvetica-Bold").fontSize(8).fillColor(item.severity === "CRITICAL" ? "#bc3a3a" : "#b77515").text(`${jakartaDateTime(item.started_at)} | ${item.event_class} | ${item.parameter_code}`);
        document.font("Helvetica").fontSize(7.5).fillColor("#617780").text(`SV ${metricText(item.sv_value)} | Trigger PV ${metricText(item.trigger_pv)} | Worst PV ${metricText(item.worst_pv)} | Deviation ${metricText(item.max_abs_deviation)} | ${item.event_state}`);
        document.moveDown(0.25);
      });

      section(`Abnormality Log (${data.alarms.length} events)`);
      if (!data.alarms.length) document.font("Helvetica").fontSize(8.5).fillColor("#15966f").text("No abnormal event in batch interval.");
      data.alarms.forEach((alarm) => {
        document.font("Helvetica-Bold").fontSize(8).fillColor(alarm.severity === "CRITICAL" ? "#bc3a3a" : "#b77515").text(`${jakartaDateTime(alarm.occurred_at)} | ${alarm.severity} | ${alarm.title}`);
        document.font("Helvetica").fontSize(7.5).fillColor("#617780").text(`${alarm.detail || "-"} | ${alarm.tag_code || "-"} | ${alarm.event_state}`);
        document.moveDown(0.25);
      });

      document.moveDown(1).font("Helvetica").fontSize(7).fillColor("#8a9ba2").text(`Exported ${jakartaDateTime(new Date())}. Excel export contains detailed telemetry rows (maximum 200,000 rows).`);
      document.end();
    });
  }
}
