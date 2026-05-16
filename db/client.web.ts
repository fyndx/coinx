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

/**
 * Detects transient lock errors from expo-sqlite on web.
 * Expected error formats:
 * - Chrome/Edge: DOMException with name "NoModificationAllowedError"
 * - Safari: Error mentioning "createSyncAccessHandle" or "Invalid VFS state"
 * - Expo-sqlite wrapper: Error messages containing OPFS lock indicators
 */
function isTransientLockError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;

  // Check canonical error properties first (DOMException, etc.)
  const domErr = err as DOMException & { name?: string; code?: number };
  if (domErr.name === "NoModificationAllowedError") {
    console.warn(
      "[db.web] Detected OPFS lock error (NoModificationAllowedError):",
      err.message,
      err.stack,
    );
    return true;
  }

  // Fall back to conservative regex on err.message when canonical properties unavailable
  const lockPatterns =
    /NoModificationAllowedError|createSyncAccessHandle|Invalid VFS state/i;
  if (lockPatterns.test(err.message)) {
    console.warn(
      "[db.web] Detected OPFS lock error via message pattern:",
      err.message,
      err.stack,
    );
    return true;
  }

  return false;
}

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
      if (!isTransientLockError(err)) throw err;
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
