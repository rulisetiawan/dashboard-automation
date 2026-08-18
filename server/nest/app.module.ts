import { Module } from "@nestjs/common";
import { ApiController } from "./api.controller.js";
import { DatabaseService } from "./database.service.js";

@Module({
  controllers: [ApiController],
  providers: [DatabaseService],
})
export class AppModule {}
