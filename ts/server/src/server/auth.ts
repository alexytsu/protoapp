import Koa from "koa";
import Router from "koa-router";
import { Kysely } from "kysely";
import { DbKey, WithId } from "@protoapp/adl/common/db";
import { AppUser, texprAppUserTable } from "@protoapp/adl/protoapp/db";
import { RESOLVER } from "@protoapp/adl/resolver";
import {
  LoginReq,
  RefreshReq,
  RefreshResp,
  texprLoginReq,
  texprLoginResp,
  texprRefreshReq,
  texprRefreshResp,
} from "@protoapp/adl/protoapp/apis/ui";

import { Database } from "../adl-gen/database";
import { getAdlTableDetails, valueFromDbObject } from "../database/adl-database";
import { AppConfig } from "../config/app";
import { checkHashedPassword } from "./hashed-password";
import { createAdminAccess, createUserAccess, createRefresh, decodeRefresh } from "./jwt-utils";
import { createBiBinding } from "./adl-requests";

const APP_USER_TABLE = getAdlTableDetails(RESOLVER, texprAppUserTable());
const REFRESH_TOKEN = "refreshToken";

export function setupAuth(koa: Koa, router: Router, writeDb: Kysely<Database>, appCfg: AppConfig) {
  router.post("/login", async (ctx) => {
    const biBinding = createBiBinding(RESOLVER, {
      reqType: texprLoginReq(),
      respType: texprLoginResp(),
    });
    const loginReq = ctx.request.body as LoginReq;
    const user = await findUserCompareHashedPw(writeDb, loginReq.email, loginReq.password);

    if (!user) {
      ctx.body = JSON.stringify(biBinding.respJB.toJson({ kind: "invalid_credentials" }));
      return;
    }

    const accessJwt = accessJwtFromUser(appCfg, user.id, user.value);
    const refreshJwt = createRefresh(appCfg, user.id);

    // Set refresh token in HTTP-only cookie
    ctx.cookies.set(REFRESH_TOKEN, refreshJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    ctx.body = JSON.stringify(
      biBinding.respJB.toJson({
        kind: "tokens",
        value: {
          access_jwt: accessJwt,
          refresh_jwt: refreshJwt,
        },
      }),
    );
  });

  router.post("/refresh", async (ctx) => {
    const biBinding = createBiBinding(RESOLVER, {
      reqType: texprRefreshReq(),
      respType: texprRefreshResp(),
    });
    const refreshReq = ctx.request.body as RefreshReq;
    const tokenFromCookie = ctx.cookies.get(REFRESH_TOKEN);

    // If there's no refresh token in the request, use the one from the cookie
    const refreshToken = refreshReq.refresh_token || (tokenFromCookie ?? null);

    const resp = await refresh(writeDb, appCfg, { refresh_token: refreshToken });
    ctx.body = JSON.stringify(biBinding.respJB.toJson(resp));
  });

  router.post("/logout", (ctx) => {
    ctx.cookies.set(REFRESH_TOKEN, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
    });
    ctx.body = "{}";
  });
}

async function refresh(db: Kysely<Database>, appCfg: AppConfig, req: RefreshReq): Promise<RefreshResp> {
  if (!req.refresh_token) {
    return { kind: "invalid_refresh_token" };
  }

  try {
    const claims = decodeRefresh(appCfg.jwtRefreshSecret, req.refresh_token);
    const userId = claims.sub;
    const user = await findActiveUserById(db, userId);

    if (!user) {
      return { kind: "invalid_refresh_token" };
    }

    const accessJwt = accessJwtFromUser(appCfg, user.id, user.value);
    return { kind: "access_token", value: accessJwt };
  } catch (error) {
    return { kind: "invalid_refresh_token" };
  }
}

function accessJwtFromUser(cfg: AppConfig, userId: DbKey<AppUser>, user: AppUser): string {
  if (user.is_admin) {
    return createAdminAccess(cfg, userId);
  } else {
    return createUserAccess(cfg, userId);
  }
}

async function findActiveUserById(db: Kysely<Database>, userId: DbKey<AppUser>): Promise<WithId<AppUser> | undefined> {
  const resp = await db.selectFrom("app_user").selectAll().where("app_user.id", "=", userId).executeTakeFirst();

  if (resp) {
    return valueFromDbObject(APP_USER_TABLE, resp);
  }
}

async function findUserCompareHashedPw(
  db: Kysely<Database>,
  email: string,
  password: string,
): Promise<WithId<AppUser> | null> {
  const resp = await db
    .selectFrom("app_user")
    .selectAll()
    .where("app_user.email", "=", email.toLowerCase())
    .executeTakeFirst();

  let isValid = true;
  let user: WithId<AppUser> | null = null;

  // Dummy hashed password that will be used if the user or password does not exist so
  // the timing of the check remains consistent
  let hashedPassword = "$2a$10$ad1RYJEBeKpUWkkcYZmkguAkh56m9/RuwnWOlQ2UmZV8PRcKpPRBe";

  if (resp) {
    user = valueFromDbObject(APP_USER_TABLE, resp);
    hashedPassword = user.value.hashed_password ?? hashedPassword;
  } else {
    isValid = false;
  }

  const validHashedPassword = await checkHashedPassword(password, hashedPassword);
  // Return user if the user exists and the password matches (validHashedPassword is true)
  return isValid && validHashedPassword ? user : null;
}
