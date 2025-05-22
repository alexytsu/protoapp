import { Context, Next } from "koa";
import { nanoid } from "nanoid";

// Extend koa Context with a request id
declare module "koa" {
  interface Context {
    requestId?: string;
    postbackAuthenticated?: boolean;
  }
}

/**
 * Log the start and completion of a request, and attaches a unique ID to the context,
 * that can be referenced by intermediate logging
 */
// TODO: add a proper logger
export async function requestLog(ctx: Context, next: Next) {
  // use lambda request id (as setup by serverless-http lib)
  // or invent a random id
  const requestId = ctx.get("x-request-id") || nanoid();

  ctx.requestId = requestId;
  console.log(`start ${ctx.method} ${ctx.path}`, { requestId });
  await next();
  const status = ctx.status;
  console.log(`end ${ctx.method} ${ctx.path}`, { requestId, status });
}
