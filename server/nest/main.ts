import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import express from "express";
import { resolve } from "node:path";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["error", "warn", "log"] });
  app.enableCors();
  app.use(express.static(resolve(process.cwd()), { dotfiles: "deny", index: "index.html" }));
  const port = Number(process.env.PORT || 8787);
  await app.listen(port, "0.0.0.0");
  console.log(`PT.SMM NestJS + PostgreSQL dashboard running at http://localhost:${port}`);
}

void bootstrap();
