import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

import { Database } from "../adl-gen/database";
import { DatabaseConfig, DatabaseReadWriteConfig } from "../config/database";

import { mapReadWrite, ReadWrite } from "./read-write";

// TODO: do imports via pg-migrate instead of rust backend
// import { migrate as pgMigrate } from 'postgres-migrations';
// TODO: move retry and sleep to utils

/** Async sleep for a given millisecond delay */
export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

export class NonRetryableError extends Error {}

export type RetryParams = {
  // initial delay milliseconds:
  delayMs: number;

  // growth factor for exponential backoff
  expFactor?: number;

  // maximum number of attempts before throwing the error
  maxAttempts: number;
};

/** Retry an async function */
export async function retry<T>(func: () => Promise<T>, params: RetryParams): Promise<T> {
  let retryDelayMs = params?.delayMs ?? 500;
  const expFac = params?.expFactor ?? 1.5;
  let attempts = 0;
  const maxAttempts = params?.maxAttempts;

  while (true) {
    try {
      const t: T = await func();
      return t;
    } catch (err) {
      if (err instanceof NonRetryableError) {
        throw err;
      }

      if (maxAttempts) {
        if (attempts > maxAttempts) {
          throw err;
        }
      }
    }

    attempts += 1;

    // scale up the delay by factor of 1.0 to 1.1
    const delayRandomisationScale = 1.0 + Math.random() / 10.0;

    await sleep(retryDelayMs * delayRandomisationScale);
    retryDelayMs *= expFac;
  }
}

export type DatabaseReadWritePools = ReadWrite<Pool>;

export function createDbPools(cfg: DatabaseReadWriteConfig): DatabaseReadWritePools {
  return mapReadWrite(cfg, (c) => new Pool(c));
}

function createDbClient(pool: Pool): Kysely<Database> {
  return new Kysely<Database>({
    // NOTE(alex): Uncomment this to log all queries for debugging SQL
    // log(event) {
    //   if (event.level === 'query') {
    //     log.info(event.query.sql);
    //     log.info(event.query.parameters);
    //   }
    // },
    dialect: new PostgresDialect({
      pool,
      // cursor: see https://github.com/koskimas/kysely#stream-select-query-results
    }),
  });
}

export function createReadWriteClients(pools: DatabaseReadWritePools): ReadWrite<Kysely<Database>> {
  return mapReadWrite(pools, createDbClient);
}

export async function retryDbReady(pool: Pool, cfg: DatabaseConfig) {
  await retry(async () => {
    // log.info("Checking for DB connection");
    await pool.query("select 1;");
  }, cfg.connect);
}

export async function retryDbReadWriteReady(pools: DatabaseReadWritePools, cfgs: DatabaseReadWriteConfig) {
  const read = retryDbReady(pools.read, cfgs.read);
  const write = retryDbReady(pools.write, cfgs.write);
  await Promise.all([read, write]);
}

// TODO: hacky currently relying on rust server to do migration
// export async function migrate(pool: Pool) {
//   log.info('Postgres Migrations: initialising...');

//   const migrationsPath = './sql/migrations';
//   const migrated = await pgMigrate({ client: pool }, migrationsPath, {
//     logger: (x) => log.info(x)
//   });

//   migrated.forEach((m) => log.info(`${m.fileName}: OK`));
//   if (migrated.length === 0) {
//     log.info('Postgres Migrations: No migrations ran');
//   }
//   log.info('Postgres Migrations done');
// }
