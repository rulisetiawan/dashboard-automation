import { Module } from "@nestjs/common";
import { ApiController } from "./api.controller.js";
import { DatabaseService } from "./database.service.js";
import { RealtimeGateway } from "./realtime.gateway.js";

@Module({
  controllers: [ApiController],
  providers: [DatabaseService, RealtimeGateway],
})
export class AppModule {}
