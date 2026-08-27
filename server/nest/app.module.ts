import { Module } from "@nestjs/common";
import { ApiController } from "./api.controller.js";
import { BatchIngestionExceptionFilter } from "./batch-ingestion-exception.filter.js";
import { AlarmController } from "./alarm.controller.js";
import { AlarmEngineService } from "./alarm-engine.service.js";
import { BatchController } from "./batch.controller.js";
import { BatchExportController } from "./batch-export.controller.js";
import { ChemicalController } from "./chemical.controller.js";
import { DatabaseService } from "./database.service.js";
import { HistorianAggregationService } from "./historian-aggregation.service.js";
import { LiveValueIngestionController } from "./live-value-ingestion.controller.js";
import { PerformanceController } from "./performance.controller.js";
import { ProcessDeviationEngineService } from "./process-deviation-engine.service.js";
import { ProcessDeviationController } from "./process-deviation.controller.js";
import { RealtimeGateway } from "./realtime.gateway.js";

@Module({
  controllers: [ApiController, AlarmController, BatchController, BatchExportController, ChemicalController, LiveValueIngestionController, PerformanceController, ProcessDeviationController],
  providers: [DatabaseService, HistorianAggregationService, RealtimeGateway, AlarmEngineService, ProcessDeviationEngineService, BatchIngestionExceptionFilter],
})
export class AppModule {}
