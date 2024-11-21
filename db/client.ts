import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

export const COINX_DATABASE_NAME = "coinx.db";
export const expoDb = openDatabaseSync(COINX_DATABASE_NAME);
export const db = drizzle(expoDb);
