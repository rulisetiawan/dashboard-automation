import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
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
import { ProductionOutputController } from "./production-output.controller.js";
import { RealtimeGateway } from "./realtime.gateway.js";
import { AuthController } from "./auth.controller.js";
import { DashboardAuthMiddleware } from "./auth.middleware.js";
import { AuthService } from "./auth.service.js";
import { SolarFuelingController } from "./solar-fueling.controller.js";
import { AiAssistantController } from "./ai-assistant.controller.js";
import { AiAssistantService } from "./ai-assistant.service.js";

@Module({
  controllers: [
    AuthController,
    ApiController,
    AlarmController,
    BatchController,
    BatchExportController,
    ChemicalController,
    LiveValueIngestionController,
    PerformanceController,
    ProcessDeviationController,
    ProductionOutputController,
    SolarFuelingController,
    AiAssistantController,
  ],
  providers: [
    DatabaseService,
    AuthService,
    DashboardAuthMiddleware,
    HistorianAggregationService,
    RealtimeGateway,
    AlarmEngineService,
    ProcessDeviationEngineService,
    BatchIngestionExceptionFilter,
    AiAssistantService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DashboardAuthMiddleware).exclude(
      { path: "api/v1/auth/{*path}", method: RequestMethod.ALL },
      { path: "api/v1/ingestion/{*path}", method: RequestMethod.POST },
      { path: "api/v1/batch/production-batches", method: RequestMethod.POST },
      { path: "api/v1/batch/process-runs", method: RequestMethod.POST },
      { path: "api/v1/ai-status", method: RequestMethod.ALL },
      { path: "api/v1/ai-assist", method: RequestMethod.ALL },
    ).forRoutes({ path: "api/v1/{*path}", method: RequestMethod.ALL });
  }
}
