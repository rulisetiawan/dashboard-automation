import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";

@Controller("api/v1/batch")
export class BatchController {
  constructor(private readonly database: DatabaseService) {}

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

    const [steps, transitions, alarms] = await Promise.all([
      this.database.query("SELECT * FROM process_step_execution WHERE process_run_id = $1 ORDER BY step_no", [processRunId]),
      this.database.query("SELECT * FROM process_transition_event WHERE process_run_id = $1 ORDER BY source_ts", [processRunId]),
      this.database.query(`
        SELECT *
        FROM alarm_event
        WHERE batch_no = $2
          OR (
            asset_id = $1
            AND occurred_at >= $3
            AND occurred_at <= COALESCE($4, NOW())
          )
        ORDER BY occurred_at
      `, [run.rows[0].asset_id, run.rows[0].batch_no, run.rows[0].started_at, run.rows[0].ended_at]),
    ]);

    return {
      data_mode: "ACTUAL_DATABASE",
      run: run.rows[0],
      steps: steps.rows,
      transitions: transitions.rows,
      alarms: alarms.rows,
    };
  }
}
