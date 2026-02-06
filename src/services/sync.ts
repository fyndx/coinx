import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Platform } from "react-native";
import { db as database } from "@/db/client";
import {
	categories,
	transactions,
	products,
	stores,
	product_listings,
	product_listings_history,
} from "@/db/schema";
import { api } from "./api";
import { supabase } from "./supabase";
import { eq, inArray } from "drizzle-orm";
import { sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

// ─── Types ───────────────────────────────────────────────────

/**
 * Type-safe column accessors for syncable tables.
 * These helpers eliminate unsafe any casts by leveraging TypeScript's structural typing.
 */

/**
 * Get the id column from a syncable table.
 * Returns a properly typed Drizzle column that can be used in queries.
 */
function getIdColumn(table: SQLiteTable): SQLiteColumn {
	// All our syncable tables have an 'id' column of type text
	return (table as unknown as Record<string, SQLiteColumn>).id;
}

/**
 * Get the syncStatus column from a syncable table.
 * Returns a properly typed Drizzle column that can be used in queries.
 */
function getSyncStatusColumn(table: SQLiteTable): SQLiteColumn {
	return (table as unknown as Record<string, SQLiteColumn>).syncStatus;
}

/**
 * Get the deletedAt column from a syncable table.
 * Returns a properly typed Drizzle column that can be used in queries.
 */
function getDeletedAtColumn(table: SQLiteTable): SQLiteColumn {
	return (table as unknown as Record<string, SQLiteColumn>).deletedAt;
}

/**
 * Base interface for all syncable records.
 * Ensures type safety when accessing common sync fields.
 */
interface SyncableRecord {
	id: string;
	deletedAt: string | null;
	syncStatus: "pending" | "synced" | null;
	// Optional fields for financial records
	amount?: number | string;
	price?: number | string;
	// Allow other properties
	[key: string]: unknown;
}

interface ChangeSet<T extends SyncableRecord> {
	upserted: T[];
	deleted: string[];
}

interface ChangeSetWithIds<T extends SyncableRecord> extends ChangeSet<T> {
	/** IDs of all records (both upserted and deleted) for tracking */
	ids: string[];
}

interface SyncChanges {
	transactions: ChangeSet<SyncableRecord>;
	categories: ChangeSet<SyncableRecord>;
	products: ChangeSet<SyncableRecord>;
	stores: ChangeSet<SyncableRecord>;
	productListings: ChangeSet<SyncableRecord>;
	productListingHistory: ChangeSet<SyncableRecord>;
}

interface SyncChangesWithIds {
	transactions: ChangeSetWithIds<SyncableRecord>;
	categories: ChangeSetWithIds<SyncableRecord>;
	products: ChangeSetWithIds<SyncableRecord>;
	stores: ChangeSetWithIds<SyncableRecord>;
	productListings: ChangeSetWithIds<SyncableRecord>;
	productListingHistory: ChangeSetWithIds<SyncableRecord>;
}

interface PushedIds {
	transactions: string[];
	categories: string[];
	products: string[];
	stores: string[];
	product_listings: string[];
	product_listings_history: string[];
}

interface SyncPushResponse {
	data: {
		syncedAt: string;
		counts: {
			upserted: number;
			deleted: number;
		};
	};
}

interface SyncPullResponse {
	data: {
		syncedAt: string;
		changes: SyncChanges;
	};
}

type SyncStatus_Type = "idle" | "pushing" | "pulling" | "error" | "success";

interface SyncState {
	status: SyncStatus_Type;
	lastSyncedAt: string | null;
	deviceId: string | null;
	error: string | null;
	lastPushCount: number;
	lastPullCount: number;
}

// ─── Storage Keys ────────────────────────────────────────────

const STORAGE_KEYS = {
	DEVICE_ID: "coinx:sync:deviceId",
	LAST_SYNCED_AT: "coinx:sync:lastSyncedAt",
} as const;

// ─── Sync Manager ────────────────────────────────────────────

class SyncManager {
	private state: SyncState = {
		status: "idle",
		lastSyncedAt: null,
		deviceId: null,
		error: null,
		lastPushCount: 0,
		lastPullCount: 0,
	};

	private syncInProgress = false;
	private syncCancelled = false;
	private hasPendingSync = false;
	private debounceTimer: ReturnType<typeof setTimeout> | null = null;
	private listeners: Set<(state: SyncState) => void> = new Set();
	private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

	// ─── Lifecycle ────────────────────────────────────────────

	/**
	 * Initialize sync manager. Call once during app startup (after auth init).
	 * Restores deviceId and lastSyncedAt from storage.
	 */
	async initialize(): Promise<void> {
		const [deviceId, lastSyncedAt] = await Promise.all([
			AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID),
			AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNCED_AT),
		]);

		this.updateState({ deviceId, lastSyncedAt });

		// Auto-sync on app foreground
		this.appStateSubscription = AppState.addEventListener("change", (nextState) => {
			if (nextState === "active") {
				this.syncIfAuthenticated();
			}
		});
	}

	/**
	 * Clean up listeners. Call on app shutdown if needed.
	 */
	destroy(): void {
		this.appStateSubscription?.remove();
		this.listeners.clear();
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}
	}

	// ─── Device Registration ─────────────────────────────────

	/**
	 * Ensure this device is registered with the backend.
	 * Creates profile (if needed) and device if no deviceId is stored locally.
	 * For web platform, skips device registration (web not supported by backend).
	 */
	async ensureDevice(): Promise<string> {
		if (this.state.deviceId) {
			return this.state.deviceId;
		}

		// Skip device registration for web platform
		if (Platform.OS === "web") {
			// Generate a pseudo device ID for web that won't be sent to backend
			const webDeviceId = `web-session-${Date.now()}`;
			this.state.deviceId = webDeviceId;
			return webDeviceId;
		}

		// Ensure profile exists before registering device
		await api.post("/api/auth/register", {});

		// Only send ios or android platform values
		const platform = Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "android";
		const response = await api.post<{ data: { id: string } }>("/api/auth/device", {
			platform,
			deviceName: `${Platform.OS} device`,
		});

		if (!response?.data?.id) {
			throw new Error("Failed to register device");
		}

		const deviceId = response.data.id;
		await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
		this.state.deviceId = deviceId;

		return deviceId;
	}

	// ─── Sync Triggers ───────────────────────────────────────

	/**
	 * Trigger sync only if user is authenticated.
	 * Safe to call from anywhere — silently no-ops if not logged in.
	 */
	async syncIfAuthenticated(): Promise<void> {
		const { data: { session } } = await supabase.auth.getSession();
		if (!session?.access_token) return;

		await this.sync();
	}

	/**
	 * Debounced sync — call after local changes.
	 * Waits 2 seconds after last call before syncing.
	 * Coalesces multiple rapid changes to avoid redundant syncs.
	 */
	scheduleSyncAfterChange(): void {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}

		// Mark that we have pending changes
		this.hasPendingSync = true;

		this.debounceTimer = setTimeout(() => {
			// Only sync if there are still pending changes and no sync in progress
			if (this.hasPendingSync && !this.syncInProgress) {
				this.hasPendingSync = false;
				this.syncIfAuthenticated();
			}
		}, 2000);
	}

	/**
	 * Full sync: push local changes, then pull remote changes.
	 * Returns silently if sync is already in progress.
	 * Queues another sync if changes occur during current sync.
	 */
	async sync(): Promise<void> {
		if (this.syncInProgress) {
			// Mark that another sync is needed after current one completes
			this.hasPendingSync = true;
			return;
		}

		this.syncInProgress = true;
		this.syncCancelled = false;
		this.updateState({ status: "pushing", error: null });

		try {
			const deviceId = await this.ensureDevice();

			// Check for cancellation
			if (this.syncCancelled) {
				this.updateState({ status: "idle", error: null });
				return;
			}

			// 1. Push local changes (stages only, doesn't mark as synced yet)
			const pushResult = await this.push(deviceId);

			if (this.syncCancelled) {
				this.updateState({ status: "idle", error: null });
				return;
			}

			// 2. Pull remote changes
			this.updateState({ status: "pulling" });
			const pullResult = await this.pull(deviceId);

			if (this.syncCancelled) {
				this.updateState({ status: "idle", error: null });
				return;
			}

			// 3. Atomic commit: mark pushed records as synced and update timestamp
			// Only happens after pull succeeds to avoid inconsistent state
			const syncedAt = pullResult.syncedAt;
			await this.markRecordsSynced(pushResult.pushedIds);
			await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNCED_AT, syncedAt);

			this.updateState({
				status: "success",
				lastSyncedAt: syncedAt,
				lastPushCount: pushResult.upserted + pushResult.deleted,
				lastPullCount: pullResult.totalRecords,
				error: null,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Sync failed";
			console.error("Sync error:", message);
			if (!this.syncCancelled) {
				this.updateState({ status: "error", error: message });
			}
		} finally {
			this.syncInProgress = false;
			// If changes occurred during sync, schedule another sync
			if (this.hasPendingSync && !this.syncCancelled) {
				this.hasPendingSync = false;
				setTimeout(() => this.syncIfAuthenticated(), 0);
			}
		}
	}

	// ─── Push ────────────────────────────────────────────────

	private async push(deviceId: string): Promise<{ upserted: number; deleted: number; pushedIds: PushedIds }> {
		const changesWithIds = await this.collectLocalChanges();

		// Extract pushed IDs for later marking as synced
		const pushedIds: PushedIds = {
			transactions: changesWithIds.transactions.ids,
			categories: changesWithIds.categories.ids,
			products: changesWithIds.products.ids,
			stores: changesWithIds.stores.ids,
			product_listings: changesWithIds.productListings.ids,
			product_listings_history: changesWithIds.productListingHistory.ids,
		};

		// Check if there's anything to push
		const totalChanges = Object.values(changesWithIds).reduce(
			(sum, cs) => sum + cs.upserted.length + cs.deleted.length,
			0,
		);

		if (totalChanges === 0) {
			return { upserted: 0, deleted: 0, pushedIds };
		}

		// Strip ids from changes before sending to backend
		const changes: SyncChanges = {
			transactions: { upserted: changesWithIds.transactions.upserted, deleted: changesWithIds.transactions.deleted },
			categories: { upserted: changesWithIds.categories.upserted, deleted: changesWithIds.categories.deleted },
			products: { upserted: changesWithIds.products.upserted, deleted: changesWithIds.products.deleted },
			stores: { upserted: changesWithIds.stores.upserted, deleted: changesWithIds.stores.deleted },
			productListings: { upserted: changesWithIds.productListings.upserted, deleted: changesWithIds.productListings.deleted },
			productListingHistory: { upserted: changesWithIds.productListingHistory.upserted, deleted: changesWithIds.productListingHistory.deleted },
		};

		if (__DEV__) {
			console.log("[Sync Push] Payload:", JSON.stringify({
				deviceId,
				lastSyncedAt: this.state.lastSyncedAt,
				changes: {
					transactions: { upserted: changes.transactions.upserted.length, deleted: changes.transactions.deleted.length },
					categories: { upserted: changes.categories.upserted.length, deleted: changes.categories.deleted.length },
					products: { upserted: changes.products.upserted.length, deleted: changes.products.deleted.length },
					stores: { upserted: changes.stores.upserted.length, deleted: changes.stores.deleted.length },
					productListings: { upserted: changes.productListings.upserted.length, deleted: changes.productListings.deleted.length },
					productListingHistory: { upserted: changes.productListingHistory.upserted.length, deleted: changes.productListingHistory.deleted.length },
				},
			}));
			// Log first record of each non-empty table for debugging
			for (const [table, cs] of Object.entries(changes)) {
				if (cs.upserted.length > 0) {
					console.log(`[Sync Push] Sample ${table}:`, JSON.stringify(cs.upserted[0]));
				}
			}
		}

		const response = await api.post<SyncPushResponse>("/api/sync/push", {
			deviceId,
			lastSyncedAt: this.state.lastSyncedAt,
			changes,
		});

		if (!response?.data) {
			throw new Error("Push failed: no response");
		}

		// Don't mark as synced yet — wait for pull() to succeed (atomic commit)

		return { ...response.data.counts, pushedIds };
	}

	/**
	 * Collect all local records with syncStatus = 'pending'.
	 * Returns changes with ID tracking for later selective marking as synced.
	 */
	private async collectLocalChanges(): Promise<SyncChangesWithIds> {
		const [
			pendingTransactions,
			pendingCategories,
			pendingProducts,
			pendingStores,
			pendingProductListings,
			pendingProductListingHistory,
		] = await Promise.all([
			database.select().from(transactions).where(eq(transactions.syncStatus, "pending")),
			database.select().from(categories).where(eq(categories.syncStatus, "pending")),
			database.select().from(products).where(eq(products.syncStatus, "pending")),
			database.select().from(stores).where(eq(stores.syncStatus, "pending")),
			database.select().from(product_listings).where(eq(product_listings.syncStatus, "pending")),
			database.select().from(product_listings_history).where(eq(product_listings_history.syncStatus, "pending")),
		]);

		return {
			transactions: this.splitChanges(pendingTransactions),
			categories: this.splitChanges(pendingCategories),
			products: this.splitChanges(pendingProducts),
			stores: this.splitChanges(pendingStores),
			productListings: this.splitChanges(pendingProductListings),
			productListingHistory: this.splitChanges(pendingProductListingHistory),
		};
	}

	/**
	 * Split records into upserted (active) and deleted (soft-deleted) sets.
	 * Strips sync-only fields before sending to backend.
	 * Also tracks all IDs for selective marking as synced later.
	 */
	private splitChanges(records: SyncableRecord[]): ChangeSetWithIds<SyncableRecord> {
		const upserted: SyncableRecord[] = [];
		const deleted: string[] = [];
		const ids: string[] = [];

		for (const record of records) {
			ids.push(record.id);
			if (record.deletedAt) {
				deleted.push(record.id);
			} else {
				// Strip local-only fields
				const { syncStatus, deletedAt, ...rest } = record;
				// Convert amount/price from number to string for backend compatibility
				if (typeof rest.amount === "number") {
					rest.amount = String(rest.amount);
				}
				if (typeof rest.price === "number") {
					rest.price = String(rest.price);
				}
				// Strip null/undefined values — backend uses t.Optional(t.String())
				// which accepts absent fields but rejects null
				const cleaned: Record<string, unknown> = {};
				for (const [key, value] of Object.entries(rest)) {
					if (value !== null && value !== undefined) {
						cleaned[key] = value;
					}
				}
				upserted.push(cleaned as SyncableRecord);
			}
		}

		return { upserted, deleted, ids };
	}

	/**
	 * Mark only the specified records as synced.
	 * Uses WHERE id IN (...) to avoid marking records created during push.
	 * @param pushedIds Per-table arrays of IDs that were successfully pushed
	 */
	private async markRecordsSynced(pushedIds: PushedIds): Promise<void> {
		const updates: Promise<unknown>[] = [];

		// Only update tables with IDs to mark
		if (pushedIds.transactions.length > 0) {
			updates.push(
				database
					.update(transactions)
					.set({ syncStatus: "synced" as const })
					.where(inArray(transactions.id, pushedIds.transactions)),
			);
		}

		if (pushedIds.categories.length > 0) {
			updates.push(
				database
					.update(categories)
					.set({ syncStatus: "synced" as const })
					.where(inArray(categories.id, pushedIds.categories)),
			);
		}

		if (pushedIds.products.length > 0) {
			updates.push(
				database
					.update(products)
					.set({ syncStatus: "synced" as const })
					.where(inArray(products.id, pushedIds.products)),
			);
		}

		if (pushedIds.stores.length > 0) {
			updates.push(
				database
					.update(stores)
					.set({ syncStatus: "synced" as const })
					.where(inArray(stores.id, pushedIds.stores)),
			);
		}

		if (pushedIds.product_listings.length > 0) {
			updates.push(
				database
					.update(product_listings)
					.set({ syncStatus: "synced" as const })
					.where(inArray(product_listings.id, pushedIds.product_listings)),
			);
		}

		if (pushedIds.product_listings_history.length > 0) {
			updates.push(
				database
					.update(product_listings_history)
					.set({ syncStatus: "synced" as const })
					.where(inArray(product_listings_history.id, pushedIds.product_listings_history)),
			);
		}

		await Promise.all(updates);
	}

	// ─── Pull ────────────────────────────────────────────────

	private async pull(deviceId: string): Promise<{ syncedAt: string; totalRecords: number }> {
		const response = await api.post<SyncPullResponse>("/api/sync/pull", {
			deviceId,
			lastSyncedAt: this.state.lastSyncedAt,
		});

		if (!response?.data) {
			throw new Error("Pull failed: no response");
		}

		const { syncedAt, changes } = response.data;

		// Apply remote changes to local DB
		const totalRecords = await this.applyRemoteChanges(changes);

		return { syncedAt, totalRecords };
	}

	/**
	 * Apply pulled changes to local SQLite database.
	 * Uses upsert (insert or replace) for each record.
	 */
	private async applyRemoteChanges(changes: SyncChanges): Promise<number> {
		let totalRecords = 0;

		// Apply in dependency order (categories before transactions, products before listings, etc.)
		totalRecords += await this.applyTableChanges(categories, changes.categories);
		totalRecords += await this.applyTableChanges(stores, changes.stores);
		totalRecords += await this.applyTableChanges(products, changes.products);
		totalRecords += await this.applyTableChanges(transactions, changes.transactions);
		totalRecords += await this.applyTableChanges(product_listings, changes.productListings);
		totalRecords += await this.applyTableChanges(product_listings_history, changes.productListingHistory);

		return totalRecords;
	}

	/**
	 * Apply changes for a single table.
	 * Uses transaction for atomicity and type-safe table access.
	 * Upserts active records and soft-deletes removed ones.
	 */
	private async applyTableChanges(
		table: SQLiteTable,
		changeSet: ChangeSet<SyncableRecord>,
	): Promise<number> {
		let count = 0;

		// Skip if no changes
		if (changeSet.upserted.length === 0 && changeSet.deleted.length === 0) {
			return 0;
		}

		// Get typed column accessors
		const idColumn = getIdColumn(table);
		const syncStatusColumn = getSyncStatusColumn(table);
		const deletedAtColumn = getDeletedAtColumn(table);

		// Process all changes within a single transaction for atomicity
		await database.transaction(async (tx) => {
			// Upsert records (per-record loop wrapped in transaction)
			if (changeSet.upserted.length > 0) {
				for (const record of changeSet.upserted) {
					// Convert string amounts back to numbers for local storage
					const localRecord: Record<string, unknown> = { ...record };
					if (typeof localRecord.amount === "string") {
						localRecord.amount = Number.parseFloat(localRecord.amount);
					}
					if (typeof localRecord.price === "string") {
						localRecord.price = Number.parseFloat(localRecord.price);
					}
					localRecord.syncStatus = "synced";

					await tx
						.insert(table)
						.values(localRecord)
						.onConflictDoUpdate({
							target: idColumn,
							set: localRecord,
						});
					count++;
				}
			}

			// Soft-delete records
			if (changeSet.deleted.length > 0) {
				const deletedAt = new Date().toISOString();
				const syncStatus = "synced" as const;
				
				for (const id of changeSet.deleted) {
					// Build update payload with proper typing
					const updatePayload: Record<string, unknown> = {
						deletedAt,
						syncStatus,
					};

					await tx
						.update(table)
						.set(updatePayload)
						.where(eq(idColumn, id));
					count++;
				}
			}
		});

		return count;
	}

	// ─── State Management ────────────────────────────────────

	private updateState(partial: Partial<SyncState>): void {
		this.state = { ...this.state, ...partial };
		this.notifyListeners();
	}

	/**
	 * Subscribe to sync state changes.
	 * Returns unsubscribe function.
	 */
	subscribe(listener: (state: SyncState) => void): () => void {
		this.listeners.add(listener);
		// Immediately notify with current state
		listener(this.state);
		return () => this.listeners.delete(listener);
	}

	private notifyListeners(): void {
		for (const listener of this.listeners) {
			listener(this.state);
		}
	}

	/**
	 * Get current sync state (snapshot).
	 */
	getState(): Readonly<SyncState> {
		return { ...this.state };
	}

	// ─── Reset ───────────────────────────────────────────────

	/**
	 * Clear all sync data. Use on sign-out.
	 * Cancels any in-progress sync to prevent race conditions.
	 */
	async reset(): Promise<void> {
		// Cancel any in-progress sync
		this.syncCancelled = true;
		this.hasPendingSync = false;

		// Clear debounce timer
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}

		// Wait for in-progress sync to complete if any
		if (this.syncInProgress) {
			// Wait up to 5 seconds for sync to complete
			const maxWaitTime = 5000;
			const startTime = Date.now();
			while (this.syncInProgress && Date.now() - startTime < maxWaitTime) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}

		// Clear storage
		await Promise.all([
			AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_ID),
			AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNCED_AT),
		]);

		// Reset state
		this.state = {
			status: "idle",
			lastSyncedAt: null,
			deviceId: null,
			error: null,
			lastPushCount: 0,
			lastPullCount: 0,
		};

		this.notifyListeners();
	}
}

// ─── Singleton ───────────────────────────────────────────────

export const syncManager = new SyncManager();
