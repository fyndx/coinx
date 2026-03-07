import { z } from "zod";

import packageJSON from "../../package.json";

// Single unified environment schema
const envSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(["development", "preview", "production"]),
  EXPO_PUBLIC_NAME: z.string(),
  EXPO_PUBLIC_SCHEME: z.string(),
  EXPO_PUBLIC_BUNDLE_ID: z.string(),
  EXPO_PUBLIC_PACKAGE: z.string(),
  EXPO_PUBLIC_VERSION: z.string(),
  EXPO_PUBLIC_SUPABASE_URL: z
    .string()
    .url("EXPO_PUBLIC_SUPABASE_URL must be a valid URL"),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "EXPO_PUBLIC_SUPABASE_ANON_KEY is required"),
  EXPO_PUBLIC_BACKEND_URL: z
    .string()
    .url("EXPO_PUBLIC_BACKEND_URL must be a valid URL"),

  // Sentry
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  EXPO_PUBLIC_SENTRY_DSN: z
    .string()
    .url("EXPO_PUBLIC_SENTRY_DSN must be a valid URL")
    .optional(),

  // only available for app.config.ts usage
  APP_BUILD_ONLY_VAR: z.string().optional(),
});

// Config records per environment
const EXPO_PUBLIC_APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV ??
  "development") as z.infer<typeof envSchema>["EXPO_PUBLIC_APP_ENV"];

const BUNDLE_IDS = {
  development: "io.fyndx.coinx.dev",
  preview: "io.fyndx.coinx.preview",
  production: "io.fyndx.coinx",
} as const;

const PACKAGES = {
  development: "io.fyndx.coinx.dev",
  preview: "io.fyndx.coinx.preview",
  production: "io.fyndx.coinx",
} as const;

const SCHEMES = {
  development: "coinx-dev",
  preview: "coinx-preview",
  production: "coinx",
} as const;

const NAME = "CoinX";

// Build env object
const _env: z.infer<typeof envSchema> = {
  EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_NAME: NAME,
  EXPO_PUBLIC_SCHEME: SCHEMES[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_BUNDLE_ID: BUNDLE_IDS[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_PACKAGE: PACKAGES[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_VERSION: packageJSON.version,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  EXPO_PUBLIC_SUPABASE_ANON_KEY:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  EXPO_PUBLIC_BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL ?? "",
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
  APP_BUILD_ONLY_VAR: process.env.APP_BUILD_ONLY_VAR,
};

function getValidatedEnv(env: z.infer<typeof envSchema>) {
  const parsed = envSchema.safeParse(env);

  if (parsed.success === false) {
    const errorMessage =
      `❌ Invalid environment variables:\n` +
      `${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}\n` +
      `❌ Missing variables in .env file for APP_ENV=${EXPO_PUBLIC_APP_ENV}\n` +
      `💡 Tip: If you recently updated the .env file, try restarting with -c flag to clear the cache.`;

    // Always log errors, but only throw on strict validation.
    console.error(errorMessage);

    // By default, only throw in development unless strictly overridden,
    // to match previous strict behavior for EXPO_PUBLIC env vars at runtime.
    const strictValidation =
      process.env.STRICT_ENV_VALIDATION === "1" ||
      process.env.NODE_ENV !== "production";

    if (strictValidation) {
      throw new Error("Invalid environment variables");
    }
  } else {
    // console.log("✅ Environment variables validated successfully");
  }

  return parsed.success ? parsed.data : env;
}

export const env = getValidatedEnv(_env);
