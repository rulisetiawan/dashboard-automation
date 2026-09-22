import pg from "pg";

const postgresConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || "pt_smm_scada",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
    };

const client = new pg.Client(postgresConfig);

try {
  await client.connect();
  console.log("Connected to PostgreSQL database:", client.database);

  const updateRes = await client.query(`
    UPDATE solar_fueling_transaction
    SET 
      requested_liters = CASE 
        WHEN (raw_payload->>'actual_solar') IS NOT NULL AND (raw_payload->>'actual_solar')::numeric > 0 
          THEN (raw_payload->>'actual_solar')::numeric 
        WHEN (raw_payload->>'jumlah') IS NOT NULL 
          THEN (raw_payload->>'jumlah')::numeric 
        ELSE requested_liters 
      END,
      metered_liters = COALESCE((raw_payload->>'actual_solar')::numeric, metered_liters),
      calculated_stock_liters = COALESCE((raw_payload->>'calculated_volume')::numeric, calculated_stock_liters),
      source_totalizer_out_liters = COALESCE((raw_payload->>'total_solar_out')::numeric, source_totalizer_out_liters),
      source_totalizer_in_liters = COALESCE((raw_payload->>'total_solar_IN')::numeric, source_totalizer_in_liters),
      machine_totalizer_liters = COALESCE(
        (raw_payload->>'total_solar_out')::numeric,
        (raw_payload->>'total_solar_IN')::numeric,
        machine_totalizer_liters
      ),
      updated_at = clock_timestamp()
    WHERE source_system = 'SMM_MYSQL_QR_CODE_DB';
  `);
  console.log(`Successfully reconciled ${updateRes.rowCount} record(s) in solar_fueling_transaction.`);

  // Display the latest system_stock_liters from COMPLETED transactions
  const stockRes = await client.query(`
    SELECT calculated_stock_liters, fueling_completed_at, qr_code, requester_name
    FROM solar_fueling_transaction
    WHERE transaction_status = 'COMPLETED'
      AND calculated_stock_liters IS NOT NULL
    ORDER BY fueling_completed_at DESC NULLS LAST, source_id DESC
    LIMIT 1
  `);
  if (stockRes.rows[0]) {
    console.log("Latest COMPLETED calculated stock in PG:", stockRes.rows[0]);
  }

} catch (err) {
  console.error("Reconciliation error:", err);
  process.exit(1);
} finally {
  await client.end();
}
