import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

async function main() {
  console.log("Menghubungkan ke PostgreSQL lokal...");
  try {
    const test = await pool.query("SELECT 1 AS connected, current_database() AS db");
    console.log(`Terhubung ke database: ${test.rows[0].db}`);

    const migrationDir = resolve(process.cwd(), "postgres", "migrations");
    const files = (await readdir(migrationDir)).filter((f) => f.endsWith(".sql")).sort();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migration (
        file_name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
      )
    `);
    const client = await pool.connect();
    try {
      await client.query("SELECT pg_advisory_lock(hashtext('pt_smm_schema_migration'))");
      const applied = await client.query("SELECT file_name FROM schema_migration");
      const appliedFiles = new Set(applied.rows.map((row) => row.file_name));
      for (const file of files) {
        if (appliedFiles.has(file)) {
          console.log(`Lewati migrasi yang sudah diterapkan: ${file}`);
          continue;
        }
        console.log(`Menjalankan migrasi: ${file}...`);
        await client.query("BEGIN");
        try {
          const sql = await readFile(resolve(migrationDir, file), "utf8");
          await client.query(sql);
          await client.query("INSERT INTO schema_migration (file_name) VALUES ($1)", [file]);
          await client.query("COMMIT");
          console.log(`✓ ${file} selesai.`);
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        }
      }
    } finally {
      await client.query("SELECT pg_advisory_unlock(hashtext('pt_smm_schema_migration'))").catch(() => undefined);
      client.release();
    }

    console.log("\n--- HASIL INJEKSI DATABASE ---");
    const assetCount = await pool.query("SELECT process_type, COUNT(*)::int AS count FROM asset GROUP BY process_type ORDER BY process_type");
    console.log("Daftar Asset per Proses:");
    console.table(assetCount.rows);

    const tagCount = await pool.query(`
      SELECT a.process_type, COUNT(t.tag_code)::int AS tag_count
      FROM tag_definition t
      JOIN asset a ON a.asset_id = t.asset_id
      GROUP BY a.process_type
      ORDER BY a.process_type
    `);
    console.log("Daftar Canonical Tags per Proses:");
    console.table(tagCount.rows);

    const totalTags = await pool.query("SELECT COUNT(*)::int AS total FROM tag_definition");
    console.log(`Total Tag Terdaftar di tag_definition: ${totalTags.rows[0].total}`);

  } catch (err) {
    console.error("Gagal menghubungkan atau menginjeksi ke PostgreSQL:", err.message);
  } finally {
    await pool.end();
  }
}

main();
