import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";

/** Refreshes small, query-oriented summaries. Raw sensor data is never modified. */
@Injectable()
export class HistorianAggregationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HistorianAggregationService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(private readonly database: DatabaseService) {}

  async onModuleInit() {
    await this.refreshRollingWindow();
    this.timer = setInterval(() => void this.refreshRollingWindow(), 5 * 60_000);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async refreshRollingWindow() {
    if (this.running) return;
    this.running = true;
    try {
      const to = new Date();
      const from = new Date(to.getTime() - 48 * 60 * 60_000);
      await this.database.query("SELECT refresh_telemetry_rollups($1::timestamptz, $2::timestamptz)", [from.toISOString(), to.toISOString()]);
      await this.database.query("SELECT refresh_utility_rollups($1::timestamptz, $2::timestamptz)", [from.toISOString(), to.toISOString()]);
      await this.database.query("SELECT refresh_machine_state_rollups($1::timestamptz, $2::timestamptz)", [from.toISOString(), to.toISOString()]);
    } catch (error) {
      this.logger.error(`Historian rollup gagal: ${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      this.running = false;
    }
  }
}
