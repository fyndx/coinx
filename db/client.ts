import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

import * as schema from "./schema";

export const COINX_DATABASE_NAME = "coinx.db";
export const expoDb = openDatabaseSync(COINX_DATABASE_NAME);
export const db = drizzle(expoDb, { schema });

/**
 * Wipe all user-generated local data while preserving schema and migrations.
 * Child tables are deleted first to satisfy foreign-key constraints.
 */
export async function clearLocalDatabase(): Promise<void> {
  await expoDb.execAsync("BEGIN TRANSACTION;");

  try {
    await expoDb.execAsync(`
      DELETE FROM coinx_product_listing_history;
      DELETE FROM coinx_product_listing;
      DELETE FROM coinx_transaction;
      DELETE FROM coinx_store;
      DELETE FROM coinx_product;
      DELETE FROM coinx_category;
    `);
    await expoDb.execAsync("COMMIT;");
  } catch (error) {
    await expoDb.execAsync("ROLLBACK;");
    throw error;
  }
}
