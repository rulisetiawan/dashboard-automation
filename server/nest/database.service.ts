import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool, QueryResultRow } from "pg";

const projectRoot = resolve(process.cwd());
const migrationDirectory = resolve(projectRoot, "postgres", "migrations");

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    const required = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];
    if (!databaseUrl && required.some((field) => !process.env[field])) {
      throw new Error("Isi DATABASE_URL atau seluruh DB_HOST, DB_PORT, DB_NAME, DB_USER, dan DB_PASSWORD pada .env.");
    }
    this.pool = new Pool({
      ...(databaseUrl
        ? { connectionString: databaseUrl }
        : { host: process.env.DB_HOST, port: Number(process.env.DB_PORT), database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD }),
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }

  async onModuleInit() {
    try {
      await this.pool.query("SELECT 1 AS connected");
      const migrationFiles = (await readdir(migrationDirectory)).filter((file) => file.endsWith(".sql")).sort();
      for (const file of migrationFiles) {
        await this.pool.query(await readFile(resolve(migrationDirectory, file), "utf8"));
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown database error";
      throw new Error(`Koneksi PostgreSQL native gagal: ${detail}`);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]) {
    return this.pool.query<T>(text, values);
  }
}
