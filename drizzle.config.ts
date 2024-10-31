import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  driver: "expo",
  dialect: "sqlite",
} satisfies Config;
