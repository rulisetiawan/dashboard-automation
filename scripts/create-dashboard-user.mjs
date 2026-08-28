import { pbkdf2 as pbkdf2Callback, randomBytes } from "node:crypto";
import pg from "pg";

const args = Object.fromEntries(process.argv.slice(2).map((item) => {
  const [key, ...values] = item.replace(/^--/, "").split("=");
  return [key, values.join("=")];
}));
const username = String(args.username || "admin").trim().toLowerCase();
const displayName = String(args.name || "Dashboard Administrator").trim();
const role = String(args.role || "ADMIN").trim().toUpperCase();
const password = String(process.env.DASHBOARD_USER_PASSWORD || "");
if (!/^[a-z0-9._-]{3,80}$/.test(username)) throw new Error("Username harus 3–80 karakter: huruf kecil, angka, titik, underscore, atau dash.");
if (!displayName || displayName.length > 160) throw new Error("Display name wajib dan maksimal 160 karakter.");
if (!["ADMIN", "ENGINEER", "SUPERVISOR", "OPERATOR", "VIEWER"].includes(role)) throw new Error("Role tidak valid.");
if (password.length < 12 || password.length > 128) throw new Error("DASHBOARD_USER_PASSWORD harus 12–128 karakter.");

const salt = randomBytes(32);
const derivedKey = await new Promise((resolve, reject) => pbkdf2Callback(password, salt, 600_000, 32, "sha256", (error, key) => error ? reject(error) : resolve(key)));
const passwordHash = `pbkdf2-sha256$600000$${salt.toString("base64")}$${derivedKey.toString("base64")}`;
const pool = new pg.Pool({
  ...(process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : { host: process.env.DB_HOST, port: Number(process.env.DB_PORT), database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD }),
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});
try {
  const result = await pool.query(`
    INSERT INTO dashboard_user (username, display_name, department, role_code, password_hash)
    VALUES ($1, $2, 'Digital Automation', $3, $4)
    ON CONFLICT (LOWER(username)) DO UPDATE
    SET display_name = EXCLUDED.display_name, role_code = EXCLUDED.role_code,
        password_hash = EXCLUDED.password_hash, active = TRUE,
        failed_login_count = 0, locked_until = NULL, updated_at = clock_timestamp()
    RETURNING username, display_name, department, role_code
  `, [username, displayName, role, passwordHash]);
  console.log(`Dashboard user ready: ${result.rows[0].username} · ${result.rows[0].role_code}`);
  if (process.env.DASHBOARD_EXPORT_HASH === "true") console.log(`DASHBOARD_PASSWORD_HASH=${passwordHash}`);
} finally {
  await pool.end();
}
