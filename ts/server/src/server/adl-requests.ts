import { Context } from "koa";
import Router from "koa-router";
import { HttpReq, HttpSecurity } from "@protoapp/adl/common/http";
import * as ADL from "@adllang/adl-runtime";
import { createJsonBinding, isJsonParseException, Json, JsonBinding } from "@adllang/adl-runtime";

import { AccessClaims, getJwtClaims } from "./jwt-utils";
import { HttpException } from "./http-exception";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

interface AuthenticatedUser extends AccessClaims {
  kind: "authenticated";
}

type EndpointClaims = AuthenticatedUser | undefined;

export interface AContext<O> {
  ctx: Context;
  endpointClaims: EndpointClaims;
  setAdlResponse(value: O): void;
}

export type Handler = (ctx: Context) => Promise<void>;

export type AdlReqHandler<I, O> = (ctx: AContext<O>, req: I) => Promise<void>;

export function addReqHandler<I, O>(
  router: Router,
  resolver: ADL.DeclResolver,
  rtype: HttpReq<I, O>,
  handler: AdlReqHandler<I, O>,
) {
  if (rtype.method === "post") {
    router.post(rtype.path, createPostReqHandler(resolver, rtype, handler));
  } else if (rtype.method === "get") {
    router.get(rtype.path, createGetReqHandler(resolver, rtype, handler));
  } else {
    throw new Error(`Unsupported method: ${rtype.method}`);
  }
}

export function createGetReqHandler<I, O>(
  resolver: ADL.DeclResolver,
  rtype: HttpReq<I, O>,
  handler: AdlReqHandler<I, O>,
): Handler {
  const biBinding = createBiBinding(resolver, rtype);

  return (ctx: Context) => {
    return withEndpointSecurity(ctx, rtype.security, async (endpointClaims) => {
      // Here we implement the query string -> ADL value transform. The rules are
      //    if I is Void, we allow no query string
      //    otherwise we expect a query string of form
      //
      //      input=${encodeURIComponent(serde_json::to_string(i))}
      //
      let req: I;
      try {
        const queryStr = ctx.request.querystring;
        if (!queryStr) {
          // For GET requests with no query, use null as input
          req = biBinding.reqJB.fromJson(null);
        } else {
          // Parse the input parameter from query string
          const params = new URLSearchParams(queryStr);
          const inputStr = params.get("input");
          if (!inputStr) {
            throw new HttpException(400, "Missing input parameter in query string");
          }
          try {
            const inputJson = JSON.parse(decodeURIComponent(inputStr));
            req = biBinding.reqJB.fromJson(inputJson);
          } catch (e) {
            if (isJsonParseException(e)) {
              throw new HttpException(400, "Invalid input parameter format");
            }
            throw e;
          }
        }
      } catch (e) {
        if (isJsonParseException(e)) {
          throw new HttpException(400, e.getMessage());
        }
        throw e;
      }

      const actx = {
        ctx,
        endpointClaims,
        setAdlResponse: (resp: O) => {
          ctx.set("Content-Type", "application/json");
          ctx.body = JSON.stringify(biBinding.respJB.toJson(resp));
        },
      };
      return handler(actx, req);
    });
  };
}

export function createPostReqHandler<I, O>(
  resolver: ADL.DeclResolver,
  rtype: HttpReq<I, O>,
  handler: AdlReqHandler<I, O>,
): Handler {
  const biBinding = createBiBinding(resolver, rtype);

  return (ctx: Context) => {
    return withEndpointSecurity(ctx, rtype.security, async (endpointClaims) => {
      let req: I;
      try {
        req = biBinding.reqJB.fromJson(ctx.request.body as Json);
      } catch (e) {
        if (isJsonParseException(e)) {
          throw new HttpException(400, e.getMessage());
        } else {
          throw e;
        }
      }
      const actx = {
        ctx,
        endpointClaims,
        setAdlResponse: (resp: O) => {
          ctx.set("Content-Type", "application/json");
          ctx.body = JSON.stringify(biBinding.respJB.toJson(resp));
        },
      };
      return handler(actx, req);
    });
  };
}

//Only execute the handler if the request matches the ADL HttpSecurity metadata
//   public => always run handler
//   token  => run handler if valid JWT
//   tokenWithRole => run handler if valid JWT with the specified role
//   postback => run handler if postback secret is valid
//
export async function withEndpointSecurity(
  ctx: Context,
  security: HttpSecurity,
  handler: (jwtClaims: EndpointClaims) => Promise<void>,
): Promise<void> {
  if (security.kind === "public") {
    return handler(undefined);
  }

  const jwtClaims = getJwtClaims(ctx);

  if (security.kind === "token") {
    return handler({ kind: "authenticated", ...jwtClaims });
  } else if (security.kind === "tokenWithRole") {
    if (jwtClaims.role.includes(security.value as UserRole)) {
      return handler({ kind: "authenticated", ...jwtClaims });
    } else {
      throw new HttpException(401, "Missing role");
    }
  }
}

export function getHostname<T>(ctx: AContext<T>): string {
  // NOTE(Barry): Just using ctx.ctx.origin returns the origin of the server, which is not
  // what's in the user's browser. To get that we need to use the request header
  return ctx.ctx.request.headers.origin || ctx.ctx.origin;
}

export function getAppUserId<T>(ctx: AContext<T>): string {
  if (ctx.endpointClaims?.kind === "authenticated") {
    return ctx.endpointClaims.sub;
  }
  throw new HttpException(500, "Unable to get userid without JWT claims");
}
interface BiTypeExpr<I, O> {
  reqType: ADL.ATypeExpr<I>;
  respType: ADL.ATypeExpr<O>;
}

interface BiBinding<I, O> {
  reqJB: JsonBinding<I>;
  respJB: JsonBinding<O>;
}

export function createBiBinding<I, O>(resolver: ADL.DeclResolver, rtype: BiTypeExpr<I, O>): BiBinding<I, O> {
  return {
    reqJB: createJsonBinding(resolver, rtype.reqType),
    respJB: createJsonBinding(resolver, rtype.respType),
  };
}
