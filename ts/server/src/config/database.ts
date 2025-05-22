import { z } from "zod";

import { ReadWrite as ReadWrite } from "../database/read-write";

import { neString, stringInteger, ProcessEnv, stringFloat } from "./app";
// import { log } from 'utils/logger';

// Option to use secrets manager for username and password
// const DatabaseEnvSecretSchema = z.object({
//   DATABASE_ACCESS: z.literal('SECRET'),

//   // a secrets manager secret ARN
//   DATABASE_ACCESS_SECRET: z.string().min(1)
// });

// Option to use username and password in the environment
const DatabaseEnvPasswordSchema = z.object({
  DATABASE_ACCESS: z.literal("VALUES"),
  DATABASE_USERNAME: neString,
  DATABASE_PASSWORD: neString,
});

// Schema for either secrets-manager or username-password access:
const DatabaseEnvAccessSchema = z.discriminatedUnion("DATABASE_ACCESS", [
  //   DatabaseEnvSecretSchema,
  DatabaseEnvPasswordSchema,
]);

// Schema for environment variables for database access:
const DatabaseEnvSchema = z.intersection(
  DatabaseEnvAccessSchema,
  z.object({
    DATABASE_NAME: neString,

    DATABASE_READ_HOST: neString,
    DATABASE_READ_PORT: stringInteger,
    DATABASE_READ_POOL_MIN: stringInteger,
    DATABASE_READ_POOL_MAX: stringInteger,

    DATABASE_WRITE_HOST: neString,
    DATABASE_WRITE_PORT: stringInteger,
    DATABASE_WRITE_POOL_MIN: stringInteger,
    DATABASE_WRITE_POOL_MAX: stringInteger,

    DATABASE_CONNECT_TIMEOUT_MS: stringInteger.default("500"),
    DATABASE_CONNECT_RETRY_EXP: stringFloat.default("2.0"),
    DATABASE_CONNECT_RETRY_ATTEMPTS: stringInteger.default("5"),
  }),
);
type DatabaseEnv = z.infer<typeof DatabaseEnvSchema>;

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  min: number;
  max: number;

  connect: {
    delayMs: number;
    expFactor: number;
    maxAttempts: number;
  };
}

// Configuration for databases (read and write)
export type DatabaseReadWriteConfig = ReadWrite<DatabaseConfig>;

// Read database (read-write) configuration from environment and or secrets manager
export async function configDatabase(env: ProcessEnv): Promise<DatabaseReadWriteConfig> {
  //   log.info('configDatabase parsing env');
  const e = DatabaseEnvSchema.parse(env);
  const { username, password } = await getDbAccess(e);
  //   log.info('configDatabase loaded');

  const connect = {
    delayMs: e.DATABASE_CONNECT_TIMEOUT_MS,
    expFactor: e.DATABASE_CONNECT_RETRY_EXP,
    maxAttempts: e.DATABASE_CONNECT_RETRY_ATTEMPTS,
  };

  return {
    read: {
      host: e.DATABASE_READ_HOST,
      port: e.DATABASE_READ_PORT,
      database: e.DATABASE_NAME,
      user: username,
      password: password,
      min: e.DATABASE_READ_POOL_MIN,
      max: e.DATABASE_READ_POOL_MAX,
      connect,
    },
    write: {
      host: e.DATABASE_WRITE_HOST,
      port: e.DATABASE_WRITE_PORT,
      database: e.DATABASE_NAME,
      user: username,
      password: password,
      min: e.DATABASE_WRITE_POOL_MIN,
      max: e.DATABASE_WRITE_POOL_MAX,
      connect,
    },
  };
}

// Get DB username and password from environment (or environment & via secrets manager)
async function getDbAccess(e: DatabaseEnv): Promise<{ username: string; password: string }> {
  // Schema for Resulting object in secrets manager
  // const DbSecretValueSchema = z.object({
  //   username: neString,
  //   password: neString,
  // });

  //   if (e.DATABASE_ACCESS === 'SECRET') {
  //     log.info('getDbAccess loading from secrets manager %s', e.DATABASE_ACCESS_SECRET);
  //     const { secretsManager } = deps;
  //     const valueJson = await secretsManager.getSecretValue(e.DATABASE_ACCESS_SECRET);
  //     log.info('getDbAccess parsing secret json');
  //     const res = DbSecretValueSchema.parse(valueJson);
  //     log.info('getDbAccess loaded secret json ok');
  //     return res;
  //   }

  //   else {
  return {
    username: e.DATABASE_USERNAME,
    password: e.DATABASE_PASSWORD,
  };
  //   }
}
