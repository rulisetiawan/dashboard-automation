import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool, PoolClient, QueryResultRow } from "pg";

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
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migration (
          file_name TEXT PRIMARY KEY,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
        )
      `);
      const migrationFiles = (await readdir(migrationDirectory)).filter((file) => file.endsWith(".sql")).sort();
      const client = await this.pool.connect();
      try {
        await client.query("SELECT pg_advisory_lock(hashtext('pt_smm_schema_migration'))");
        const applied = await client.query<{ file_name: string }>("SELECT file_name FROM schema_migration");
        const appliedFiles = new Set(applied.rows.map((row) => row.file_name));
        for (const file of migrationFiles) {
          if (appliedFiles.has(file)) continue;
          await client.query("BEGIN");
          try {
            await client.query(await readFile(resolve(migrationDirectory, file), "utf8"));
            await client.query("INSERT INTO schema_migration (file_name) VALUES ($1)", [file]);
            await client.query("COMMIT");
          } catch (error) {
            await client.query("ROLLBACK");
            throw error;
          }
        }
      } finally {
        await client.query("SELECT pg_advisory_unlock(hashtext('pt_smm_schema_migration'))").catch(() => undefined);
        client.release();
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

  async transaction<T>(handler: (client: PoolClient) => Promise<T>) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await handler(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
