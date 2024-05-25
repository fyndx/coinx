import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite/next";

export const expoDb = openDatabaseSync("coinx.db");

export const db = drizzle(expoDb);
