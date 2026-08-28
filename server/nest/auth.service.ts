import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { DatabaseService } from "./database.service.js";
import { createDashboardSessionToken, hashDashboardSessionToken, verifyDashboardPassword } from "./auth-crypto.js";

export const dashboardSessionCookie = "smm_dashboard_session";
const sessionLifetimeMs = 12 * 60 * 60_000;
const failedLoginLimit = 5;
const lockDurationMinutes = 15;

export type DashboardUserSession = {
  userId: string;
  username: string;
  displayName: string;
  department: string;
  role: string;
  expiresAt: string;
};

export function cookieValue(header: string | undefined, name: string) {
  const match = String(header || "").split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService) {}

  async login(identifier: string, password: string, userAgent: string | null, ipAddress: string | null) {
    const normalized = String(identifier || "").trim().toLowerCase();
    const result = await this.database.query(`
      SELECT user_id, username, display_name, department, role_code, password_hash,
             active, failed_login_count, locked_until
      FROM dashboard_user
      WHERE LOWER(username) = $1 OR LOWER(COALESCE(email, '')) = $1
      LIMIT 1
    `, [normalized]);
    const user = result.rows[0];
    const locked = user?.locked_until && new Date(user.locked_until).getTime() > Date.now();
    const valid = user?.active === true && !locked && await verifyDashboardPassword(String(password || ""), user.password_hash).catch(() => false);
    if (!valid) {
      if (user && !locked) {
        await this.database.query(`
          UPDATE dashboard_user
          SET failed_login_count = failed_login_count + 1,
              locked_until = CASE WHEN failed_login_count + 1 >= $2 THEN clock_timestamp() + ($3 || ' minutes')::interval ELSE locked_until END,
              updated_at = clock_timestamp()
          WHERE user_id = $1
        `, [user.user_id, failedLoginLimit, String(lockDurationMinutes)]);
      }
      return null;
    }

    const token = createDashboardSessionToken();
    const tokenHash = hashDashboardSessionToken(token);
    const expiresAt = new Date(Date.now() + sessionLifetimeMs).toISOString();
    await this.database.transaction(async (client) => {
      await client.query(`
        UPDATE dashboard_user
        SET failed_login_count = 0, locked_until = NULL, last_login_at = clock_timestamp(), updated_at = clock_timestamp()
        WHERE user_id = $1
      `, [user.user_id]);
      await client.query(`
        INSERT INTO dashboard_session (user_id, token_hash, expires_at, user_agent, ip_address)
        VALUES ($1, $2, $3, $4, $5)
      `, [user.user_id, tokenHash, expiresAt, userAgent, ipAddress]);
      await client.query(`
        UPDATE dashboard_session SET revoked_at = clock_timestamp()
        WHERE user_id = $1 AND revoked_at IS NULL AND expires_at <= clock_timestamp()
      `, [user.user_id]);
    });
    return { token, user: this.userPayload(user, expiresAt) };
  }

  async sessionFromRequest(request: Pick<Request, "headers">) {
    const token = cookieValue(request.headers.cookie, dashboardSessionCookie);
    if (!token) return null;
    const result = await this.database.query(`
      SELECT u.user_id, u.username, u.display_name, u.department, u.role_code,
             s.session_id, s.expires_at, s.last_seen_at
      FROM dashboard_session s
      JOIN dashboard_user u ON u.user_id = s.user_id
      WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > clock_timestamp() AND u.active = TRUE
      LIMIT 1
    `, [hashDashboardSessionToken(token)]);
    const row = result.rows[0];
    if (!row) return null;
    if (!row.last_seen_at || Date.now() - new Date(row.last_seen_at).getTime() > 5 * 60_000) {
      void this.database.query("UPDATE dashboard_session SET last_seen_at = clock_timestamp() WHERE session_id = $1", [row.session_id]).catch(() => undefined);
    }
    return this.userPayload(row, new Date(row.expires_at).toISOString());
  }

  async logout(request: Pick<Request, "headers">) {
    const token = cookieValue(request.headers.cookie, dashboardSessionCookie);
    if (!token) return;
    await this.database.query("UPDATE dashboard_session SET revoked_at = clock_timestamp() WHERE token_hash = $1 AND revoked_at IS NULL", [hashDashboardSessionToken(token)]);
  }

  private userPayload(row: Record<string, any>, expiresAt: string): DashboardUserSession {
    return {
      userId: row.user_id,
      username: row.username,
      displayName: row.display_name,
      department: row.department || "Digital Automation",
      role: row.role_code || "VIEWER",
      expiresAt,
    };
  }
}

