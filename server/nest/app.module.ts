import { Module } from "@nestjs/common";
import { ApiController } from "./api.controller.js";
import { BatchController } from "./batch.controller.js";
import { ChemicalController } from "./chemical.controller.js";
import { DatabaseService } from "./database.service.js";
import { HistorianAggregationService } from "./historian-aggregation.service.js";
import { PerformanceController } from "./performance.controller.js";
import { RealtimeGateway } from "./realtime.gateway.js";

@Module({
  controllers: [ApiController, BatchController, ChemicalController, PerformanceController],
  providers: [DatabaseService, HistorianAggregationService, RealtimeGateway],
})
export class AppModule {}
