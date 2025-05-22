import { Context } from "koa";

/**
 *  An exception thrown in server code that will result
 *  in an appropriate http response
 */
export class HttpException extends Error {
  private readonly _statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "HttpException";
    this._statusCode = statusCode;
  }

  get statusCode(): number {
    return this._statusCode;
  }

  toObject(): object {
    return {
      statusCode: this._statusCode,
      message: this.message,
    };
  }
}

/**
 * Koa middleware function to handle HttpExceptions
 * TODO: add a proper logger
 */
export async function handleException(ctx: Context, next: () => Promise<unknown>) {
  try {
    const result = await next();
    return result;
  } catch (err) {
    if (err instanceof HttpException) {
      ctx.body = err.toObject();
      ctx.status = err.statusCode;
      console.log(`HttpException: ${err.message}`, {
        requestId: ctx.requestId,
      });
      console.trace(err.stack);
    } else {
      ctx.body = { message: "Unexpected error." };
      ctx.status = 500;
      console.log(`Unexpected error`, { requestId: ctx.requestId });
      const stack = (err as Error).stack;
      if (stack) {
        console.log(stack, { requestId: ctx.requestId });
      }
    }
  }
}
