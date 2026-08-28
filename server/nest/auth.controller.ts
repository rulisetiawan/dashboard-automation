import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService, dashboardSessionCookie } from "./auth.service.js";

@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get("session")
  async session(@Req() request: Request) {
    const user = await this.auth.sessionFromRequest(request);
    if (!user) throw new UnauthorizedException("Session tidak aktif.");
    return { authenticated: true, user };
  }

  @Post("login")
  async login(@Body() body: Record<string, any>, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const identifier = String(body?.username || "").trim();
    const password = String(body?.password || "");
    if (!identifier || !password || identifier.length > 160 || password.length > 128) throw new UnauthorizedException("Username atau password tidak valid.");
    const result = await this.auth.login(identifier, password, request.headers["user-agent"] || null, request.ip || null);
    if (!result) throw new UnauthorizedException("Username atau password tidak valid.");
    const secure = request.secure || request.headers["x-forwarded-proto"] === "https";
    response.cookie(dashboardSessionCookie, result.token, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
      maxAge: 12 * 60 * 60_000,
    });
    return { authenticated: true, user: result.user };
  }

  @Post("logout")
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(request);
    response.clearCookie(dashboardSessionCookie, { httpOnly: true, sameSite: "strict", path: "/" });
    return { authenticated: false };
  }
}

