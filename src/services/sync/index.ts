/**
 * Sync Service
 *
 * Effect.ts-based sync manager for CoinX.
 * Handles bidirectional synchronization between local SQLite and backend.
 *
 * @module sync
 */

// ─── Exports ─────────────────────────────────────────────────

// Types
export type {
	SyncableRecord,
	ChangeSet,
	ChangeSetWithIds,
	SyncChanges,
	SyncChangesWithIds,
	PushedIds,
	SyncPushResponse,
	SyncPullResponse,
	SyncStatus_Type,
	SyncState,
} from "./types";
export { STORAGE_KEYS, getIdColumn } from "./types";

// Errors
export {
	SyncInitializationError,
	DeviceRegistrationError,
	SyncPushError,
	SyncPullError,
	DatabaseError,
	StorageError,
	AuthenticationError,
	SyncCancelledError,
} from "./errors";

// Storage Effects
export { getStorageItem, setStorageItem, removeStorageItem } from "./storage";

// Auth Effects
export { getCurrentSession, checkAuthentication } from "./auth";

// API Effects
export { apiPost } from "./api";

// Database Effects
export {
	collectPendingRecords,
	markRecordsSyncedForTable,
	applyTableChanges,
	splitChanges,
} from "./database";

// Sync Manager
export { SyncManager } from "./manager";

// ─── Singleton Instance ──────────────────────────────────────

import { SyncManager } from "./manager";

/**
 * Singleton instance of SyncManager.
 *
 * Usage:
 * ```typescript
 * import { syncManager } from "@/services/sync";
 *
 * // Initialize during app startup
 * await Effect.runPromise(syncManager.initialize());
 *
 * // Trigger sync
 * await syncManager.syncIfAuthenticated();
 *
 * // Subscribe to state changes
 * const unsubscribe = syncManager.subscribe((state) => {
 *   console.log("Sync state:", state);
 * });
 *
 * // Clean up
 * unsubscribe();
 * syncManager.destroy();
 * ```
 */
export const syncManager = new SyncManager();
