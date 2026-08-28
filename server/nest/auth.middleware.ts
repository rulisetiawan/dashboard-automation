import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service.js";

@Injectable()
export class DashboardAuthMiddleware implements NestMiddleware {
  constructor(private readonly auth: AuthService) {}

  async use(request: Request, response: Response, next: NextFunction) {
    const user = await this.auth.sessionFromRequest(request);
    if (!user) {
      response.status(401).json({ statusCode: 401, error: "Unauthorized", message: "Session dashboard tidak aktif." });
      return;
    }
    (request as Request & { dashboardUser?: unknown }).dashboardUser = user;
    next();
  }
}

