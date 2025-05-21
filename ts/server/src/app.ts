import Koa from "koa";
import KoaRouter from "koa-router";
import bodyParser from "koa-bodyparser";

import { configApp } from "./config/app";
import { registerEndpoints } from "./adl-gen/endpoints";
import { handleException } from "./server/http-exception";
import { requestLog } from "./server/request-log";
import { decodeJwt } from "./server/jwt-utils";
import { UserService } from "./services/user-service";
import { setupAuth } from "./server/auth";
import { configDatabase } from "./config/database";
import { createDbPools, createReadWriteClients, retryDbReadWriteReady } from "./database/init";
import { fixPgTypes } from "./database/adl-database";
import { publicEndpoints, UserEndpoints } from "./handlers";
import { MessageService } from "./services/message-service";
import { MessageEndpoints } from "./handlers/message-endpoints";

async function setup(koa: Koa): Promise<void> {
  const env = process.env;
  const appCfg = await configApp(env);

  // configure database pools and clients
  const databaseCfgs = await configDatabase(env);
  fixPgTypes();
  const databasePools = createDbPools(databaseCfgs);
  await retryDbReadWriteReady(databasePools, databaseCfgs);
  const databaseClients = createReadWriteClients(databasePools);

  // setup koa middleware and routes
  koa.use(requestLog);
  koa.use(handleException);
  koa.use(
    bodyParser({
      // allow string, null etc json body, not only object, array
      strict: false,
    }),
  );
  koa.use(decodeJwt({ jwtAccessSecret: appCfg.jwtAccessSecret }));

  // setup koa routes and auth
  const r = new KoaRouter({});
  setupAuth(koa, r, databaseClients.write, appCfg);

  // setup services
  const userService = new UserService({
    databaseClients,
  });
  const messageService = new MessageService({
    databaseClients,
  });

  // endpoint handlers
  const userEndpoints = new UserEndpoints({
    userService,
  });
  const messageEndpoints = new MessageEndpoints({
    messageService,
  });

  registerEndpoints(publicEndpoints, r);
  registerEndpoints(userEndpoints, r);
  registerEndpoints(messageEndpoints, r);

  koa.use(r.routes()).use(r.allowedMethods());
}

// synchronously create and export a Koa app
function createKoaApp(): Koa {
  const koa = new Koa();

  // asynchronously setup and build the routes and middlewares on the koa app:
  const setupPromise = setup(koa).catch((err) => {
    console.error("Fatal error setting up app", err);
    process.exit(1);
  });

  // await rest of async setup before continuing with the request
  koa.use(async (ctx, next) => {
    await setupPromise;
    await next();
  });

  return koa;
}

export const app = createKoaApp();
