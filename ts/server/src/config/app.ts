import { z } from "zod";

export type ProcessEnv = Record<string, string | undefined>;

// An integer in a string
export const stringInteger = z
  .string()
  .regex(/[0-9]+/)
  .transform((s) => parseInt(s, 10));

// A big integer in a string
export const stringBigInteger = z
  .string()
  .regex(/[0-9]+/)
  .transform((s) => BigInt(s));

export const stringFloat = z
  .string()
  // regex for digits, signs and exponents of a floating point number
  .regex(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+\.?[0-9]*)(?:e[+-]?[0-9]+)?$/i)
  .transform((s) => parseFloat(s));

// A nonempty string
export const neString = z.string().min(1);

// Plain values (as used in dev and contents of secrets manager)
export const AppEnvValsSchema = z.object({
  APP_CONFIG: z.literal("VALUES"),
  JWT_ACCESS_SECRET: neString,
  JWT_REFRESH_SECRET: neString,
});

// type AppEnvVals = z.infer<typeof AppEnvValsSchema>;

// Schema for either secrets-manager or username-password access:
// TODO: this should derive somehow from the ADL server config
const AppEnvSchema = z.intersection(
  z.discriminatedUnion("APP_CONFIG", [AppEnvValsSchema]),
  z.object({
    // Non-secret portion of app config:

    // body limit size eg "50mb"
    APP_SERVER_BODY_LIMIT: z.string(),

    // own URL for redirect purposes
    APP_SERVER_URL: neString,
  }),
);
export type AppEnv = z.infer<typeof AppEnvSchema>;

export interface AppConfig {
  jwtIssuer: string;
  serverBodyLimit: string;
  serverUrl: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpirySecs: number;
  jwtRefreshExpirySecs: number;
}

// Read database (read-write) configuration from environment and or secrets manager
export async function configApp(env: ProcessEnv): Promise<AppConfig> {
  const appEnv = AppEnvSchema.parse(env);

  return {
    jwtAccessSecret: appEnv.JWT_ACCESS_SECRET,
    jwtRefreshSecret: appEnv.JWT_REFRESH_SECRET,
    serverBodyLimit: appEnv.APP_SERVER_BODY_LIMIT,
    serverUrl: appEnv.APP_SERVER_URL,
    jwtAccessExpirySecs: 60 * 60, // 1 hour
    jwtRefreshExpirySecs: 60 * 60 * 24, // 1 day
    jwtIssuer: "protoapp",
  };
}
