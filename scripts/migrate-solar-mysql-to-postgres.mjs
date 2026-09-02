import mysql from "mysql2/promise";
import pg from "pg";

const sourceSystem = "SMM_MYSQL_QR_CODE_DB";
const fullSync = process.argv.includes("--full");
const follow = process.argv.includes("--follow");
const batchSize = Math.min(5000, Math.max(250, Number(process.env.SOLAR_MIGRATION_BATCH_SIZE) || 2000));
const pollMilliseconds = Math.max(5000, Number(process.env.SOLAR_SYNC_INTERVAL_MS) || 15000);

const mysqlConfig = {
  host: process.env.SMM_MYSQL_HOST || "192.168.100.82",
  port: Number(process.env.SMM_MYSQL_PORT) || 3306,
  user: process.env.SMM_MYSQL_USER || "root",
  password: process.env.SMM_MYSQL_PASSWORD || "",
  database: process.env.SMM_MYSQL_DATABASE || "qr_code_db",
  dateStrings: true,
  connectTimeout: 10000,
};

const postgresConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

function sourceTimestamp(value) {
  if (!value) return null;
  const text = String(value).trim();
  const parsed = new Date(`${text.replace(" ", "T")}+07:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Timestamp MySQL tidak valid: ${text}`);
  return parsed.toISOString();
}

function latestTimestamp(...values) {
  return values.filter(Boolean).map(sourceTimestamp).sort().at(-1) || null;
}

function normalizedStatus(value) {
  const status = String(value || "").trim().toUpperCase();
  if (status === "TERPAKAI") return "COMPLETED";
  if (status === "AKTIF") return "READY";
  if (status === "TIDAK AKTIF") return "CANCELLED";
  return "MANUAL_REVIEW";
}

function executionMode(value) {
  return String(value || "").trim().toLowerCase() === "manual" ? "MANUAL" : "QR";
}

function cleanText(value) {
  if (value == null) return null;
  return String(value).replaceAll("\u0000", "").trim() || null;
}

function cleanRecord(record) {
  return Object.fromEntries(Object.entries(record).map(([key,value]) => [key,typeof value === "string" ? value.replaceAll("\u0000", "") : value]));
}

function sqlRows(rowCount, columnCount, offset = 0) {
  return Array.from({ length: rowCount }, (_, row) => `(${Array.from({ length: columnCount }, (_, column) => `$${offset + row * columnCount + column + 1}`).join(",")})`).join(",");
}

async function updateSyncState(client, table, lastId, rowCount, lastTs, status = "SUCCESS", error = null) {
  await client.query(`
    INSERT INTO solar_source_sync_state (source_system,source_table,last_source_id,source_row_count,last_source_ts,last_sync_at,last_status,last_error)
    VALUES ($1,$2,$3,$4,$5,clock_timestamp(),$6,$7)
    ON CONFLICT (source_system,source_table) DO UPDATE SET
      last_source_id=EXCLUDED.last_source_id,source_row_count=EXCLUDED.source_row_count,last_source_ts=EXCLUDED.last_source_ts,
      last_sync_at=EXCLUDED.last_sync_at,last_status=EXCLUDED.last_status,last_error=EXCLUDED.last_error
  `, [sourceSystem,table,lastId,rowCount,lastTs,status,error]);
}

async function startingId(postgres, table, targetTable) {
  if (fullSync) return 0;
  const state = await postgres.query("SELECT last_source_id FROM solar_source_sync_state WHERE source_system=$1 AND source_table=$2", [sourceSystem,table]);
  if (state.rows[0]) return Number(state.rows[0].last_source_id || 0);
  const target = await postgres.query(`SELECT COALESCE(MAX(source_id),0) AS last_id FROM ${targetTable} WHERE source_system=$1`, [sourceSystem]);
  return Number(target.rows[0]?.last_id || 0);
}

async function syncTransactions(source, postgres) {
  let cursor = await startingId(postgres, "qr_codes", "solar_fueling_transaction");
  let processed = 0;
  let lastSourceTs = null;
  for (;;) {
    const [rows] = await source.query("SELECT * FROM qr_codes WHERE id > ? ORDER BY id LIMIT ?", [cursor,batchSize]);
    if (!rows.length) break;
    const values = [];
    for (const row of rows) {
      const totalizerIn = row.total_solar_IN == null ? null : Number(row.total_solar_IN);
      const totalizerOut = row.total_solar_out == null ? null : Number(row.total_solar_out);
      const raw = cleanRecord(row);
      const createdAt = sourceTimestamp(row.date_created);
      const startedAt = sourceTimestamp(row.process_at);
      const completedAt = sourceTimestamp(row.date_activated);
      const sourceUpdatedAt = latestTimestamp(row.date_activated,row.process_at,row.date_created);
      values.push(
        sourceSystem,Number(row.id),cleanText(row.code) || `SOURCE-${row.id}`,Number(row.jumlah),row.actual_solar == null ? null : Number(row.actual_solar),
        totalizerOut ?? totalizerIn,totalizerIn,totalizerOut,row.calculated_volume == null ? null : Number(row.calculated_volume),
        "FUELING","OUT",executionMode(row.process_type),normalizedStatus(row.status),createdAt,startedAt,completedAt,
        cleanText(row.nama_pemesan),cleanText(row.nama_pembuat),cleanText(row.process_by),cleanText(row.keterangan),sourceUpdatedAt,JSON.stringify(raw),
      );
      cursor = Math.max(cursor,Number(row.id));
      if (sourceUpdatedAt && (!lastSourceTs || sourceUpdatedAt > lastSourceTs)) lastSourceTs = sourceUpdatedAt;
    }
    await postgres.query(`
      INSERT INTO solar_fueling_transaction (
        source_system,source_id,qr_code,requested_liters,metered_liters,machine_totalizer_liters,
        source_totalizer_in_liters,source_totalizer_out_liters,calculated_stock_liters,
        operation_type,movement_direction,execution_mode,transaction_status,qr_created_at,fueling_started_at,
        fueling_completed_at,requester_name,qr_created_by,processed_by,notes,source_updated_at,raw_payload
      ) VALUES ${sqlRows(rows.length,22)}
      ON CONFLICT (source_system,source_id) DO UPDATE SET
        qr_code=EXCLUDED.qr_code,requested_liters=EXCLUDED.requested_liters,metered_liters=EXCLUDED.metered_liters,
        machine_totalizer_liters=EXCLUDED.machine_totalizer_liters,source_totalizer_in_liters=EXCLUDED.source_totalizer_in_liters,
        source_totalizer_out_liters=EXCLUDED.source_totalizer_out_liters,calculated_stock_liters=EXCLUDED.calculated_stock_liters,
        operation_type=EXCLUDED.operation_type,movement_direction=EXCLUDED.movement_direction,execution_mode=EXCLUDED.execution_mode,
        transaction_status=EXCLUDED.transaction_status,qr_created_at=EXCLUDED.qr_created_at,fueling_started_at=EXCLUDED.fueling_started_at,
        fueling_completed_at=EXCLUDED.fueling_completed_at,requester_name=EXCLUDED.requester_name,qr_created_by=EXCLUDED.qr_created_by,
        processed_by=EXCLUDED.processed_by,notes=EXCLUDED.notes,source_updated_at=EXCLUDED.source_updated_at,raw_payload=EXCLUDED.raw_payload,
        updated_at=clock_timestamp()
    `, values);
    processed += rows.length;
  }
  const count = await postgres.query("SELECT COUNT(*)::int AS total FROM solar_fueling_transaction WHERE source_system=$1", [sourceSystem]);
  await updateSyncState(postgres,"qr_codes",cursor,Number(count.rows[0].total),lastSourceTs);
  return { processed,total:Number(count.rows[0].total),lastId:cursor };
}

async function syncLevels(source, postgres) {
  let cursor = await startingId(postgres, "qr_solar_level", "solar_level_sample");
  let processed = 0;
  let lastSourceTs = null;
  let bad = 0;
  for (;;) {
    const [rows] = await source.query("SELECT id,stock,created_at,update_at FROM qr_solar_level WHERE id > ? ORDER BY id LIMIT ?", [cursor,batchSize]);
    if (!rows.length) break;
    const values = [];
    for (const row of rows) {
      const stock = Number(row.stock);
      const good = Number.isFinite(stock) && stock >= 0 && stock <= 100000;
      if (!good) bad += 1;
      const sourceTs = sourceTimestamp(row.update_at || row.created_at);
      values.push(sourceSystem,Number(row.id),"SOLAR-MAIN",stock,good ? "GOOD" : "BAD",good ? null : "Nilai di luar sanity range 0–100000 liter",sourceTs,sourceTimestamp(row.created_at));
      cursor = Math.max(cursor,Number(row.id));
      if (sourceTs && (!lastSourceTs || sourceTs > lastSourceTs)) lastSourceTs = sourceTs;
    }
    await postgres.query(`
      INSERT INTO solar_level_sample (source_system,source_id,tank_id,stock_liters,quality,quality_reason,source_ts,source_created_at)
      VALUES ${sqlRows(rows.length,8)}
      ON CONFLICT (source_system,source_id) DO UPDATE SET
        tank_id=EXCLUDED.tank_id,stock_liters=EXCLUDED.stock_liters,quality=EXCLUDED.quality,quality_reason=EXCLUDED.quality_reason,
        source_ts=EXCLUDED.source_ts,source_created_at=EXCLUDED.source_created_at,updated_at=clock_timestamp()
    `, values);
    processed += rows.length;
  }
  const count = await postgres.query("SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE quality='BAD')::int AS bad FROM solar_level_sample WHERE source_system=$1", [sourceSystem]);
  await updateSyncState(postgres,"qr_solar_level",cursor,Number(count.rows[0].total),lastSourceTs);
  return { processed,total:Number(count.rows[0].total),bad:Number(count.rows[0].bad),badProcessed:bad,lastId:cursor };
}

async function alignOpeningStock(postgres) {
  await postgres.query(`
    UPDATE solar_stock_config config SET
      opening_stock_liters=sample.stock_liters,opening_at=sample.source_ts,updated_by='SMM_MYSQL_MIGRATION',updated_at=clock_timestamp()
    FROM (
      SELECT stock_liters,source_ts FROM solar_level_sample
      WHERE source_system=$1 AND tank_id='SOLAR-MAIN' AND quality='GOOD'
      ORDER BY source_ts,source_id LIMIT 1
    ) sample
    WHERE config.tank_id='SOLAR-MAIN' AND config.opening_stock_liters=0 AND config.opening_at <= '2000-01-02'::timestamptz
  `, [sourceSystem]);
}

async function synchronize(source, postgres) {
  const transaction = await syncTransactions(source,postgres);
  const level = await syncLevels(source,postgres);
  await alignOpeningStock(postgres);
  if (logNextSync || transaction.processed || level.processed) console.log(JSON.stringify({ source:sourceSystem,transaction,level,syncedAt:new Date().toISOString() }));
  logNextSync = false;
}

const source = await mysql.createConnection(mysqlConfig);
const postgres = new pg.Pool(postgresConfig);
let stopped = false;
let logNextSync = true;
let lockAcquired = false;
process.on("SIGINT", () => { stopped = true; });
process.on("SIGTERM", () => { stopped = true; });

try {
  const lock = await postgres.query("SELECT pg_try_advisory_lock(hashtext('smm_mysql_solar_sync')) AS acquired");
  lockAcquired = lock.rows[0]?.acquired === true;
  if (!lockAcquired) throw new Error("Sinkronisasi Solar MySQL lain sedang berjalan.");
  await synchronize(source,postgres);
  while (follow && !stopped) {
    await new Promise((resolve) => setTimeout(resolve,pollMilliseconds));
    if (!stopped) await synchronize(source,postgres);
  }
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`Solar migration failed: ${detail}`);
  process.exitCode = 1;
} finally {
  if (lockAcquired) await postgres.query("SELECT pg_advisory_unlock(hashtext('smm_mysql_solar_sync'))").catch(() => undefined);
  await source.end().catch(() => undefined);
  await postgres.end().catch(() => undefined);
}
