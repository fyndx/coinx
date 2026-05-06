/**
 * Web-specific database client.
 * On web, openDatabaseSync uses SharedArrayBuffer for sync-over-async,
 * but this times out on first load before the WASM worker is ready.
 * Instead, we use openDatabaseAsync and expose a lazy-initialised client.
 */
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseAsync } from "expo-sqlite";

import * as schema from "./schema";

export const COINX_DATABASE_NAME = "coinx.db";

// Lazily resolved on first access via initDb()
let _expoDb: Awaited<ReturnType<typeof openDatabaseAsync>> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _initPromise: Promise<void> | null = null;

async function _init() {
  // expo-sqlite on web uses OPFS (Origin Private File System) with a sync access
  // handle that only allows one holder at a time. During HMR reloads or when
  // multiple tabs are open, the lock might be held briefly. Retry a few times.
  const MAX_RETRIES = 5;
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      _expoDb = await openDatabaseAsync(COINX_DATABASE_NAME);
      _db = drizzle(_expoDb, { schema });
      return;
    } catch (err) {
      lastError = err;
      const isLockError =
        err instanceof Error &&
        (err.message.includes("NoModificationAllowedError") ||
          err.message.includes("createSyncAccessHandle") ||
          err.message.includes("Invalid VFS state"));
      if (!isLockError) throw err;
      // Wait before retrying (50 ms, 150 ms, 450 ms, …)
      await new Promise((res) => setTimeout(res, 50 * 3 ** attempt));
    }
  }
  throw lastError;
}

export function initDb(): Promise<void> {
  if (!_initPromise) {
    _initPromise = _init();
  }
  return _initPromise;
}

function getExpoDb() {
  if (!_expoDb)
    throw new Error("Database not initialised. Call initDb() first.");
  return _expoDb;
}

function getDb() {
  if (!_db) throw new Error("Database not initialised. Call initDb() first.");
  return _db;
}

// Proxy objects so callers can import `expoDb` and `db` just like the native version.
// Access is always after initDb() has resolved (enforced in App.model.ts).
export const expoDb = new Proxy(
  {} as Awaited<ReturnType<typeof openDatabaseAsync>>,
  {
    get(_target, prop) {
      return (getExpoDb() as Record<string | symbol, unknown>)[prop];
    },
  },
);

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as Record<string | symbol, unknown>)[prop];
  },
});

/**
 * Wipe all user-generated local data while preserving schema and migrations.
 * Child tables are deleted first to satisfy foreign-key constraints.
 */
export async function clearLocalDatabase(): Promise<void> {
  const db = getExpoDb();
  await db.execAsync("BEGIN TRANSACTION;");

  try {
    await db.execAsync(`
      DELETE FROM coinx_product_listing_history;
      DELETE FROM coinx_product_listing;
      DELETE FROM coinx_transaction;
      DELETE FROM coinx_store;
      DELETE FROM coinx_product;
      DELETE FROM coinx_category;
    `);
    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}
