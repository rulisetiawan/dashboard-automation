import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AuthService, DashboardUserSession } from "./auth.service.js";

const PRODUCTION_MENUS = [
  "overview",
  "jetflow",
  "calator",
  "dryer",
  "kalender",
  "utilities",
  "trends",
  "health",
];

@Injectable()
export class DashboardAuthMiddleware implements NestMiddleware {
  constructor(private readonly auth: AuthService) {}

  async use(request: Request, response: Response, next: NextFunction) {
    const user = await this.auth.sessionFromRequest(request);
    if (!user) {
      response.status(401).json({
        statusCode: 401,
        error: "Unauthorized",
        message: "Session dashboard tidak aktif.",
      });
      return;
    }
    (request as Request & { dashboardUser?: DashboardUserSession }).dashboardUser = user;

    const userRole = String(user.role || "").toUpperCase();
    const allowedMenus = Array.isArray(user.allowedMenus) ? user.allowedMenus : [];

    // Administrator memiliki akses penuh ke seluruh modul dan endpoint
    if (userRole === "ADMIN" || userRole === "ADMINISTRATOR") {
      return next();
    }

    // Normalisasi request path (hapus leading slash & query string)
    const rawPath = String(request.path || request.originalUrl || "").split("?")[0];
    const cleanPath = rawPath.replace(/^\/+/, "").toLowerCase();

    // 1. RBAC (Roles, Menus, Users RBAC management) -> Khusus ADMIN
    if (cleanPath.startsWith("api/v1/rbac")) {
      response.status(403).json({
        statusCode: 403,
        error: "Forbidden",
        message: "Akses ditolak: Hanya Administrator yang dapat mengakses konfigurasi Role & Permission.",
      });
      return;
    }

    // 2. Modul WWTP (IPAL): HTML simulasi & endpoint API WWTP
    const isWwtpRoute =
      cleanPath === "simulasi-full-process.html" ||
      cleanPath.startsWith("api/v1/wwtp") ||
      cleanPath.startsWith("api/asset-sensor-master") ||
      cleanPath.startsWith("api/equipment-master") ||
      cleanPath.startsWith("api/page-values") ||
      cleanPath.startsWith("api/manual-control-logs") ||
      cleanPath.startsWith("api/equipment-control");

    if (isWwtpRoute) {
      if (!allowedMenus.includes("wwtp")) {
        response.status(403).json({
          statusCode: 403,
          error: "Forbidden",
          message: "Akses ditolak: Akun Anda tidak memiliki izin akses modul WWTP (IPAL).",
        });
        return;
      }
      return next();
    }

    // 3. Modul Solar Fueling
    if (cleanPath.startsWith("api/v1/solar")) {
      if (!allowedMenus.includes("solar")) {
        response.status(403).json({
          statusCode: 403,
          error: "Forbidden",
          message: "Akses ditolak: Akun Anda tidak memiliki izin akses modul Solar Fueling.",
        });
        return;
      }
      return next();
    }

    // 4. Modul Chemical Dispensing
    if (cleanPath.startsWith("api/v1/chemical")) {
      if (!allowedMenus.includes("chemical")) {
        response.status(403).json({
          statusCode: 403,
          error: "Forbidden",
          message: "Akses ditolak: Akun Anda tidak memiliki izin akses modul Chemical Dispensing.",
        });
        return;
      }
      return next();
    }

    // 5. Modul Alarms
    if (cleanPath.startsWith("api/v1/alarms")) {
      if (!allowedMenus.includes("alarms")) {
        response.status(403).json({
          statusCode: 403,
          error: "Forbidden",
          message: "Akses ditolak: Akun Anda tidak memiliki izin akses modul Alarms.",
        });
        return;
      }
      return next();
    }

    // 6. Modul Produksi Mesin & Telemetry (Jetflow, Calator, Dryer, Kalender, Plant Overview)
    const isProductionRoute =
      cleanPath.startsWith("api/v1/batch") ||
      cleanPath.startsWith("api/v1/performance") ||
      cleanPath.startsWith("api/v1/process-deviations") ||
      cleanPath.startsWith("api/v1/production-output") ||
      cleanPath.startsWith("api/v1/assets") ||
      cleanPath.startsWith("api/v1/equipment") ||
      cleanPath.startsWith("api/v1/telemetry") ||
      cleanPath.startsWith("api/v1/utilities") ||
      cleanPath.startsWith("api/v1/machine-states") ||
      cleanPath.startsWith("api/v1/dispensing");

    if (isProductionRoute) {
      const hasAnyProdMenu = PRODUCTION_MENUS.some((m) => allowedMenus.includes(m));
      if (!hasAnyProdMenu) {
        response.status(403).json({
          statusCode: 403,
          error: "Forbidden",
          message: "Akses ditolak: Akun Anda tidak memiliki izin akses modul Operasional Mesin / Produksi.",
        });
        return;
      }
      return next();
    }

    next();
  }
}
