import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { DatabaseService } from "./database.service.js";
import { ALL_CANONICAL_MENUS, AuthService, DashboardUserSession } from "./auth.service.js";
import { hashDashboardPassword, validateDashboardPassword } from "./auth-crypto.js";

@Controller("api/v1/rbac")
export class RbacController {
  constructor(
    private readonly database: DatabaseService,
    private readonly auth: AuthService,
  ) {}

  private async requireAdmin(request: Request): Promise<DashboardUserSession> {
    const user =
      (request as Request & { dashboardUser?: DashboardUserSession }).dashboardUser ||
      (await this.auth.sessionFromRequest(request));
    if (!user) throw new UnauthorizedException("Session tidak aktif.");
    const role = String(user.role).toUpperCase();
    if (role !== "ADMIN" && role !== "ADMINISTRATOR") {
      throw new ForbiddenException("Hanya Administrator yang memiliki akses ke konfigurasi Role & Permission.");
    }
    return user;
  }

  @Get("menus")
  async getMenus() {
    try {
      const result = await this.database.query(`
        SELECT menu_code, menu_group, menu_title, sort_order, icon, description
        FROM dashboard_menu
        ORDER BY sort_order ASC
      `);
      if (result.rows.length > 0) return { ok: true, menus: result.rows };
    } catch {
      // Fallback if table not ready
    }
    return {
      ok: true,
      menus: ALL_CANONICAL_MENUS.map((code, idx) => ({
        menu_code: code,
        menu_group: idx < 5 ? "Operations" : idx < 9 ? "Resources" : "Intelligence",
        menu_title: code.toUpperCase(),
        sort_order: idx + 1,
        icon: "⌁",
        description: "",
      })),
    };
  }

  @Get("roles")
  async getRoles(@Req() request: Request) {
    await this.requireAdmin(request);
    const result = await this.database.query(`
      SELECT
        r.role_code,
        r.role_name,
        r.description,
        r.is_system,
        r.created_at,
        COALESCE(
          json_agg(rm.menu_code ORDER BY m.sort_order ASC) FILTER (WHERE rm.menu_code IS NOT NULL),
          '[]'::json
        ) AS menus,
        COUNT(DISTINCT u.user_id)::int AS user_count
      FROM dashboard_role r
      LEFT JOIN dashboard_role_menu rm ON rm.role_code = r.role_code
      LEFT JOIN dashboard_menu m ON m.menu_code = rm.menu_code
      LEFT JOIN dashboard_user u ON u.role_code = r.role_code AND u.active = TRUE
      GROUP BY r.role_code, r.role_name, r.description, r.is_system, r.created_at
      ORDER BY
        CASE r.role_code
          WHEN 'ADMIN' THEN 1
          WHEN 'ENGINEER' THEN 2
          WHEN 'SUPERVISOR' THEN 3
          WHEN 'PRODUCTION' THEN 4
          WHEN 'OPERATOR' THEN 5
          WHEN 'WWTP' THEN 6
          WHEN 'VIEWER' THEN 7
          ELSE 8
        END,
        r.role_name ASC
    `);
    return { ok: true, roles: result.rows };
  }

  @Post("roles")
  async createRole(
    @Body() body: { role_code?: string; role_name?: string; description?: string; menus?: string[] },
    @Req() request: Request,
  ) {
    await this.requireAdmin(request);
    const roleCode = String(body.role_code || "").trim().toUpperCase().replace(/[^A-Z0-9_]/g, "");
    const roleName = String(body.role_name || "").trim();
    const description = String(body.description || "").trim();
    const menus = Array.isArray(body.menus) ? body.menus : [];

    if (!roleCode || roleCode.length < 2) {
      throw new BadRequestException("Kode role tidak valid. Minimal 2 karakter alfanumerik.");
    }
    if (!roleName) {
      throw new BadRequestException("Nama role wajib diisi.");
    }

    const dupCheck = await this.database.query("SELECT role_code FROM dashboard_role WHERE role_code = $1", [roleCode]);
    if (dupCheck.rows.length > 0) {
      throw new BadRequestException(`Role dengan kode ${roleCode} sudah ada.`);
    }

    await this.database.query(`
      INSERT INTO dashboard_role (role_code, role_name, description, is_system)
      VALUES ($1, $2, $3, FALSE)
    `, [roleCode, roleName, description || null]);

    if (menus.length > 0) {
      for (const menu of menus) {
        await this.database.query(`
          INSERT INTO dashboard_role_menu (role_code, menu_code)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [roleCode, menu]);
      }
    }

    return { ok: true, role: { role_code: roleCode, role_name: roleName, description, menus } };
  }

  @Put("roles/:role_code/menus")
  async updateRoleMenus(
    @Param("role_code") roleCodeParam: string,
    @Body() body: { menus?: string[] },
    @Req() request: Request,
  ) {
    await this.requireAdmin(request);
    const roleCode = String(roleCodeParam || "").trim().toUpperCase();
    const menus = Array.isArray(body.menus) ? body.menus : [];

    const roleCheck = await this.database.query("SELECT role_code FROM dashboard_role WHERE role_code = $1", [roleCode]);
    if (!roleCheck.rows[0]) throw new NotFoundException(`Role ${roleCode} tidak ditemukan.`);

    await this.database.query("DELETE FROM dashboard_role_menu WHERE role_code = $1", [roleCode]);

    if (menus.length > 0) {
      for (const menu of menus) {
        await this.database.query(`
          INSERT INTO dashboard_role_menu (role_code, menu_code)
          VALUES ($1, $2)
          ON CONFLICT (role_code, menu_code) DO NOTHING
        `, [roleCode, menu]);
      }
    }

    return { ok: true, role_code: roleCode, menus };
  }

  @Delete("roles/:role_code")
  async deleteRole(
    @Param("role_code") roleCodeParam: string,
    @Req() request: Request,
  ) {
    await this.requireAdmin(request);
    const roleCode = String(roleCodeParam || "").trim().toUpperCase();

    const roleCheck = await this.database.query("SELECT role_code, is_system FROM dashboard_role WHERE role_code = $1", [roleCode]);
    if (!roleCheck.rows[0]) throw new NotFoundException(`Role ${roleCode} tidak ditemukan.`);
    if (roleCheck.rows[0].is_system) {
      throw new BadRequestException(`Role sistem ${roleCode} tidak dapat dihapus.`);
    }

    const userCount = await this.database.query("SELECT COUNT(*)::int AS count FROM dashboard_user WHERE role_code = $1", [roleCode]);
    if (Number(userCount.rows[0]?.count || 0) > 0) {
      throw new BadRequestException(`Role ${roleCode} sedang digunakan oleh pengguna dan tidak dapat dihapus.`);
    }

    await this.database.query("DELETE FROM dashboard_role WHERE role_code = $1", [roleCode]);
    return { ok: true, message: `Role ${roleCode} berhasil dihapus.` };
  }

  @Get("users")
  async getUsers(@Req() request: Request) {
    await this.requireAdmin(request);
    const result = await this.database.query(`
      SELECT
        u.user_id,
        u.username,
        u.email,
        u.display_name,
        u.department,
        u.role_code,
        r.role_name,
        u.active,
        u.failed_login_count,
        u.locked_until,
        u.last_login_at,
        u.created_at
      FROM dashboard_user u
      LEFT JOIN dashboard_role r ON r.role_code = u.role_code
      ORDER BY u.created_at DESC
    `);
    return { ok: true, users: result.rows };
  }

  @Post("users")
  async createUser(
    @Body() body: {
      username?: string;
      password?: string;
      display_name?: string;
      email?: string;
      department?: string;
      role_code?: string;
      active?: boolean;
    },
    @Req() request: Request,
  ) {
    await this.requireAdmin(request);
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    const displayName = String(body.display_name || "").trim();
    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const department = String(body.department || "Digital Automation").trim();
    const roleCode = String(body.role_code || "VIEWER").trim().toUpperCase();
    const active = body.active !== false;

    if (!username || username.length < 3 || username.length > 50 || !/^[a-z0-9_.-]+$/.test(username)) {
      throw new BadRequestException("Username minimal 3 karakter dan hanya boleh berisi huruf kecil, angka, titik, strip, atau underscore.");
    }
    if (!displayName) {
      throw new BadRequestException("Nama lengkap (display name) wajib diisi.");
    }
    try {
      validateDashboardPassword(password);
    } catch (err) {
      throw new BadRequestException(err instanceof Error ? err.message : "Password tidak valid.");
    }

    const dupUser = await this.database.query("SELECT user_id FROM dashboard_user WHERE LOWER(username) = $1", [username]);
    if (dupUser.rows.length > 0) {
      throw new BadRequestException(`Username "${username}" sudah digunakan.`);
    }

    if (email) {
      const dupEmail = await this.database.query("SELECT user_id FROM dashboard_user WHERE LOWER(email) = $1", [email]);
      if (dupEmail.rows.length > 0) {
        throw new BadRequestException(`Email "${email}" sudah digunakan.`);
      }
    }

    const roleCheck = await this.database.query("SELECT role_code, role_name FROM dashboard_role WHERE role_code = $1", [roleCode]);
    if (!roleCheck.rows[0]) {
      throw new BadRequestException(`Role "${roleCode}" tidak valid.`);
    }

    const passwordHash = await hashDashboardPassword(password);
    const insertResult = await this.database.query(`
      INSERT INTO dashboard_user (
        username, email, display_name, department, role_code, password_hash, active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, clock_timestamp(), clock_timestamp())
      RETURNING user_id, username, email, display_name, department, role_code, active, created_at
    `, [username, email, displayName, department, roleCode, passwordHash, active]);

    return {
      ok: true,
      message: `Pengguna ${displayName} (${username}) berhasil ditambahkan.`,
      user: insertResult.rows[0],
    };
  }

  @Put("users/:user_id")
  async updateUser(
    @Param("user_id") userIdParam: string,
    @Body() body: {
      display_name?: string;
      email?: string;
      department?: string;
      role_code?: string;
      active?: boolean;
      new_password?: string;
    },
    @Req() request: Request,
  ) {
    const admin = await this.requireAdmin(request);
    const userId = String(userIdParam || "").trim();

    const userCheck = await this.database.query("SELECT user_id, username, role_code, active FROM dashboard_user WHERE user_id = $1", [userId]);
    if (!userCheck.rows[0]) throw new NotFoundException("Pengguna tidak ditemukan.");
    const targetUser = userCheck.rows[0];

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (body.display_name !== undefined) {
      const displayName = String(body.display_name || "").trim();
      if (!displayName) throw new BadRequestException("Nama lengkap tidak boleh kosong.");
      updates.push(`display_name = $${paramIndex++}`);
      values.push(displayName);
    }

    if (body.email !== undefined) {
      const email = body.email ? String(body.email).trim().toLowerCase() : null;
      if (email) {
        const dupEmail = await this.database.query("SELECT user_id FROM dashboard_user WHERE LOWER(email) = $1 AND user_id <> $2", [email, userId]);
        if (dupEmail.rows.length > 0) throw new BadRequestException(`Email "${email}" sudah digunakan pengguna lain.`);
      }
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    if (body.department !== undefined) {
      updates.push(`department = $${paramIndex++}`);
      values.push(String(body.department || "").trim());
    }

    if (body.role_code !== undefined) {
      const newRole = String(body.role_code || "").trim().toUpperCase();
      const roleCheck = await this.database.query("SELECT role_code FROM dashboard_role WHERE role_code = $1", [newRole]);
      if (!roleCheck.rows[0]) throw new NotFoundException(`Role ${newRole} tidak valid.`);

      if (targetUser.user_id === admin.userId && newRole !== "ADMIN" && newRole !== "ADMINISTRATOR") {
        const adminCount = await this.database.query("SELECT COUNT(*)::int AS count FROM dashboard_user WHERE role_code IN ('ADMIN', 'ADMINISTRATOR') AND active = TRUE");
        if (Number(adminCount.rows[0]?.count || 0) <= 1) {
          throw new BadRequestException("Anda tidak dapat mengubah role akun Anda sendiri karena Anda adalah satu-satunya Administrator.");
        }
      }
      updates.push(`role_code = $${paramIndex++}`);
      values.push(newRole);
    }

    if (body.active !== undefined) {
      const newActive = Boolean(body.active);
      if (targetUser.user_id === admin.userId && !newActive) {
        throw new BadRequestException("Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang login.");
      }
      updates.push(`active = $${paramIndex++}`);
      values.push(newActive);
    }

    if (body.new_password) {
      const newPassword = String(body.new_password || "");
      try {
        validateDashboardPassword(newPassword);
      } catch (err) {
        throw new BadRequestException(err instanceof Error ? err.message : "Password baru tidak valid.");
      }
      const newHash = await hashDashboardPassword(newPassword);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(newHash);
      updates.push(`failed_login_count = 0`);
      updates.push(`locked_until = NULL`);
    }

    if (updates.length === 0) {
      return { ok: true, message: "Tidak ada perubahan." };
    }

    updates.push(`updated_at = clock_timestamp()`);
    values.push(userId);
    const query = `
      UPDATE dashboard_user
      SET ${updates.join(", ")}
      WHERE user_id = $${paramIndex}
      RETURNING user_id, username, email, display_name, department, role_code, active, updated_at
    `;
    const result = await this.database.query(query, values);
    return { ok: true, message: "Data pengguna berhasil diperbarui.", user: result.rows[0] };
  }

  @Delete("users/:user_id")
  async deleteUser(
    @Param("user_id") userIdParam: string,
    @Req() request: Request,
  ) {
    const admin = await this.requireAdmin(request);
    const userId = String(userIdParam || "").trim();

    const userCheck = await this.database.query("SELECT user_id, username, role_code FROM dashboard_user WHERE user_id = $1", [userId]);
    if (!userCheck.rows[0]) throw new NotFoundException("Pengguna tidak ditemukan.");

    if (userCheck.rows[0].user_id === admin.userId) {
      throw new BadRequestException("Anda tidak dapat menghapus akun Anda sendiri.");
    }

    if (userCheck.rows[0].role_code === "ADMIN" || userCheck.rows[0].role_code === "ADMINISTRATOR") {
      const adminCount = await this.database.query("SELECT COUNT(*)::int AS count FROM dashboard_user WHERE role_code IN ('ADMIN', 'ADMINISTRATOR') AND active = TRUE");
      if (Number(adminCount.rows[0]?.count || 0) <= 1) {
        throw new BadRequestException("Pengguna ini adalah satu-satunya Administrator dan tidak dapat dihapus.");
      }
    }

    await this.database.query("DELETE FROM dashboard_user WHERE user_id = $1", [userId]);
    return { ok: true, message: `Pengguna ${userCheck.rows[0].username} berhasil dihapus.` };
  }

  @Post("users/:user_id/unlock")
  async unlockUser(
    @Param("user_id") userIdParam: string,
    @Req() request: Request,
  ) {
    await this.requireAdmin(request);
    const userId = String(userIdParam || "").trim();
    const result = await this.database.query(`
      UPDATE dashboard_user
      SET failed_login_count = 0, locked_until = NULL, updated_at = clock_timestamp()
      WHERE user_id = $1
      RETURNING user_id, username, display_name
    `, [userId]);
    if (!result.rows[0]) throw new NotFoundException("Pengguna tidak ditemukan.");
    return { ok: true, message: `Akun ${result.rows[0].username} berhasil dibuka kuncinya.` };
  }

  @Put("users/:user_id/role")
  async updateUserRole(
    @Param("user_id") userIdParam: string,
    @Body() body: { role_code?: string },
    @Req() request: Request,
  ) {
    const admin = await this.requireAdmin(request);
    const userId = String(userIdParam || "").trim();
    const newRole = String(body.role_code || "").trim().toUpperCase();

    const roleCheck = await this.database.query("SELECT role_code, role_name FROM dashboard_role WHERE role_code = $1", [newRole]);
    if (!roleCheck.rows[0]) throw new NotFoundException(`Role ${newRole} tidak valid.`);

    const userCheck = await this.database.query("SELECT user_id, username, role_code FROM dashboard_user WHERE user_id = $1", [userId]);
    if (!userCheck.rows[0]) throw new NotFoundException("Pengguna tidak ditemukan.");

    // Prevent removing ADMIN from self if sole admin
    if (userCheck.rows[0].user_id === admin.userId && newRole !== "ADMIN" && newRole !== "ADMINISTRATOR") {
      const adminCount = await this.database.query("SELECT COUNT(*)::int AS count FROM dashboard_user WHERE role_code IN ('ADMIN', 'ADMINISTRATOR') AND active = TRUE");
      if (Number(adminCount.rows[0]?.count || 0) <= 1) {
        throw new BadRequestException("Anda tidak dapat mengubah role akun Anda sendiri karena Anda adalah satu-satunya Administrator.");
      }
    }

    await this.database.query(`
      UPDATE dashboard_user
      SET role_code = $1, updated_at = clock_timestamp()
      WHERE user_id = $2
    `, [newRole, userId]);

    return { ok: true, user_id: userId, role_code: newRole, role_name: roleCheck.rows[0].role_name };
  }
}
