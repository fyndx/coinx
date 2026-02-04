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
import { eq } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

// ─── Types ───────────────────────────────────────────────────

interface ChangeSet<T> {
	upserted: T[];
	deleted: string[];
}

interface SyncChanges {
	transactions: ChangeSet<Record<string, unknown>>;
	categories: ChangeSet<Record<string, unknown>>;
	products: ChangeSet<Record<string, unknown>>;
	stores: ChangeSet<Record<string, unknown>>;
	productListings: ChangeSet<Record<string, unknown>>;
	productListingHistory: ChangeSet<Record<string, unknown>>;
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

		this.state.deviceId = deviceId;
		this.state.lastSyncedAt = lastSyncedAt;

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
	 * Creates a new device if no deviceId is stored locally.
	 */
	async ensureDevice(): Promise<string> {
		if (this.state.deviceId) {
			return this.state.deviceId;
		}

		const response = await api.post<{ data: { id: string } }>("/api/auth/device", {
			platform: Platform.OS as "ios" | "android",
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
	 */
	scheduleSyncAfterChange(): void {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}

		this.debounceTimer = setTimeout(() => {
			this.syncIfAuthenticated();
		}, 2000);
	}

	/**
	 * Full sync: push local changes, then pull remote changes.
	 * Returns silently if sync is already in progress.
	 */
	async sync(): Promise<void> {
		if (this.syncInProgress) return;

		this.syncInProgress = true;
		this.updateState({ status: "pushing", error: null });

		try {
			const deviceId = await this.ensureDevice();

			// 1. Push local changes
			const pushResult = await this.push(deviceId);

			// 2. Pull remote changes
			this.updateState({ status: "pulling" });
			const pullResult = await this.pull(deviceId);

			// 3. Update last synced timestamp
			const syncedAt = pullResult.syncedAt;
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
			this.updateState({ status: "error", error: message });
		} finally {
			this.syncInProgress = false;
		}
	}

	// ─── Push ────────────────────────────────────────────────

	private async push(deviceId: string): Promise<{ upserted: number; deleted: number }> {
		const changes = await this.collectLocalChanges();

		// Check if there's anything to push
		const totalChanges = Object.values(changes).reduce(
			(sum, cs) => sum + cs.upserted.length + cs.deleted.length,
			0,
		);

		if (totalChanges === 0) {
			return { upserted: 0, deleted: 0 };
		}

		const response = await api.post<SyncPushResponse>("/api/sync/push", {
			deviceId,
			lastSyncedAt: this.state.lastSyncedAt,
			changes,
		});

		if (!response?.data) {
			throw new Error("Push failed: no response");
		}

		// Mark pushed records as synced
		await this.markRecordsSynced();

		return response.data.counts;
	}

	/**
	 * Collect all local records with syncStatus = 'pending'.
	 */
	private async collectLocalChanges(): Promise<SyncChanges> {
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
	 */
	private splitChanges(records: Record<string, unknown>[]): ChangeSet<Record<string, unknown>> {
		const upserted: Record<string, unknown>[] = [];
		const deleted: string[] = [];

		for (const record of records) {
			if (record.deletedAt) {
				deleted.push(record.id as string);
			} else {
				// Strip local-only fields
				const { syncStatus, deletedAt, ...rest } = record;
				// Convert amount from number to string for backend compatibility
				if (typeof rest.amount === "number") {
					rest.amount = String(rest.amount);
				}
				if (typeof rest.price === "number") {
					rest.price = String(rest.price);
				}
				upserted.push(rest);
			}
		}

		return { upserted, deleted };
	}

	/**
	 * After successful push, mark all pending records as synced.
	 */
	private async markRecordsSynced(): Promise<void> {
		const tables = [
			transactions,
			categories,
			products,
			stores,
			product_listings,
			product_listings_history,
		];

		await Promise.all(
			tables.map((table) =>
				database
					.update(table)
					.set({ syncStatus: "synced" as const })
					.where(eq(table.syncStatus, "pending")),
			),
		);
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
	 * Upserts active records and soft-deletes removed ones.
	 */
	private async applyTableChanges(
		table: SQLiteTable,
		changeSet: ChangeSet<Record<string, unknown>>,
	): Promise<number> {
		let count = 0;

		// Upsert records
		for (const record of changeSet.upserted) {
			// Convert string amounts back to numbers for local storage
			const localRecord = { ...record };
			if (typeof localRecord.amount === "string") {
				localRecord.amount = Number.parseFloat(localRecord.amount);
			}
			if (typeof localRecord.price === "string") {
				localRecord.price = Number.parseFloat(localRecord.price);
			}
			localRecord.syncStatus = "synced";

			await database
				.insert(table)
				.values(localRecord)
				.onConflictDoUpdate({
					target: (table as any).id,
					set: localRecord,
				});
			count++;
		}

		// Soft-delete records
		for (const id of changeSet.deleted) {
			await database
				.update(table)
				.set({
					deletedAt: new Date().toISOString(),
					syncStatus: "synced" as const,
				} as any)
				.where(eq((table as any).id, id));
			count++;
		}

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
	 */
	async reset(): Promise<void> {
		await Promise.all([
			AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_ID),
			AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNCED_AT),
		]);

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
