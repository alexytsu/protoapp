import JWT from "jwt-simple";
import { Context } from "koa";

import { HttpException } from "./http-exception";
import { UserRole } from "./adl-requests";
import { AppConfig } from "../config/app";

export interface AccessClaims {
  iss: string;
  sub: string;
  exp: number;
  role: string;
}

export interface RefreshClaims {
  iss: string;
  sub: string;
  exp: number;
}

function calcAccessExp(expirySecs: number): number {
  return Math.floor(Date.now() / 1000) + expirySecs;
}

// Extend the Koa Context type to include our JWT claims
declare module "koa" {
  interface Context {
    jwtClaims?: AccessClaims;
  }
}

/**
 * Middleware to validate and decode a JWT if present
 */
export function decodeJwt(cfg: Pick<AppConfig, "jwtAccessSecret">) {
  return async (ctx: Context, next: () => Promise<void>) => {
    const bearerToken = bearerTokenFromAuthHeader(ctx.headers.authorization);
    if (!bearerToken) {
      // Proceed without claims
      await next();
    } else {
      try {
        const claims = decodeAccess(cfg.jwtAccessSecret, bearerToken);
        // Attach the claims to the context for the duration of the handler
        ctx.jwtClaims = claims;
        await next();
      } catch (error) {
        console.error(error);
        ctx.jwtClaims = undefined;
        throw new HttpException(401, "Invalid JWT token");
      } finally {
        ctx.jwtClaims = undefined;
      }
    }
  };
}

export function getJwtClaims(ctx: Context): AccessClaims {
  if (!ctx.jwtClaims) {
    throw new HttpException(401, "No JWT claims");
  }
  return ctx.jwtClaims;
}

export function createAdminAccess(cfg: AppConfig, sub: string): string {
  return createAccessToken(cfg, UserRole.ADMIN, sub);
}

export function createUserAccess(cfg: AppConfig, sub: string): string {
  return createAccessToken(cfg, UserRole.USER, sub);
}

export function createRefresh(cfg: AppConfig, sub: string): string {
  const exp = calcAccessExp(cfg.jwtRefreshExpirySecs);

  const claims: RefreshClaims = {
    iss: cfg.jwtIssuer,
    sub,
    exp,
  };

  return JWT.encode(claims, cfg.jwtRefreshSecret, "HS256");
}

function createAccessToken(cfg: AppConfig, role: string, sub: string): string {
  const exp = calcAccessExp(cfg.jwtAccessExpirySecs);

  const claims: AccessClaims = {
    iss: cfg.jwtIssuer,
    sub,
    exp,
    role,
  };

  return JWT.encode(claims, cfg.jwtAccessSecret, "HS256");
}

export function decodeAccess(jwtSecret: string, jwt: string): AccessClaims {
  try {
    return JWT.decode(jwt, jwtSecret, false, "HS256");
  } catch (error) {
    throw new HttpException(401, "Invalid access token");
  }
}

export function decodeRefresh(jwtSecret: string, jwt: string): RefreshClaims {
  try {
    return JWT.decode(jwt, jwtSecret, false, "HS256");
  } catch (error) {
    throw new HttpException(401, "Invalid refresh token");
  }
}

export function bearerTokenFromAuthHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }
  const fields = authHeader.split(/\s+/);
  if (fields.length === 2 && fields[0].toLowerCase() === "bearer") {
    return fields[1];
  }
  return null;
}
