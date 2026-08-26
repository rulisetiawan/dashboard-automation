import pg from "pg";

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  const res = await pool.query(`
    SELECT tag_code, asset_id, signal_role, engineering_unit, source_status 
    FROM tag_definition 
    ORDER BY asset_id, tag_code 
    LIMIT 12
  `);
  console.log("Contoh 12 Tag Baku yang Berhasil Diinjeksi ke PostgreSQL:");
  console.table(res.rows);
  await pool.end();
}

main();
