import { AppState, Platform } from "react-native";
import { Effect, pipe } from "effect";
import {
	categories,
	transactions,
	products,
	stores,
	product_listings,
	product_listings_history,
} from "@/db/schema";
import {
	SyncCancelledError,
	SyncPushError,
	SyncPullError,
	DeviceRegistrationError,
	AuthenticationError,
} from "./errors";
import { getStorageItem, setStorageItem, removeStorageItem } from "./storage";
import { checkAuthentication } from "./auth";
import { apiPost } from "./api";
import {
	collectPendingRecords,
	markRecordsSyncedForTable,
	applyTableChanges,
	splitChanges,
} from "./database";
import type {
	SyncState,
	SyncChanges,
	SyncChangesWithIds,
	SyncPushResponse,
	SyncPullResponse,
	PushedIds,
} from "./types";
import { STORAGE_KEYS as KEYS } from "./types";

// ─── Sync Manager ────────────────────────────────────────────

export class SyncManager {
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
	private appStateSubscription: ReturnType<
		typeof AppState.addEventListener
	> | null = null;

	// ─── Lifecycle ────────────────────────────────────────────

	/**
	 * Initialize sync manager using Effect.
	 * Restores deviceId and lastSyncedAt from storage.
	 */
	initialize = () =>
		pipe(
			Effect.all([
				getStorageItem(KEYS.DEVICE_ID),
				getStorageItem(KEYS.LAST_SYNCED_AT),
			]),
			Effect.map(([deviceId, lastSyncedAt]) => {
				this.updateState({ deviceId, lastSyncedAt });

				// Auto-sync on app foreground
				this.appStateSubscription = AppState.addEventListener(
					"change",
					(nextState) => {
						if (nextState === "active") {
							this.syncIfAuthenticated();
						}
					},
				);

				return { deviceId, lastSyncedAt };
			}),
			Effect.tapError((error) =>
				Effect.sync(() => {
					console.error("Initialization error:", error);
					this.updateState({
						status: "error",
						error:
							error instanceof Error ? error.message : "Initialization failed",
					});
				}),
			),
		);

	/**
	 * Clean up listeners and subscriptions.
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
	 * Ensure device is registered using Effect.
	 * Returns the device ID or registers a new one if needed.
	 */
	private ensureDevice = () =>
		pipe(
			Effect.succeed(this.state.deviceId),
			Effect.flatMap((deviceId) => {
				if (deviceId) {
					return Effect.succeed(deviceId);
				}

				// Skip device registration for web platform
				if (Platform.OS === "web") {
					const webDeviceId = `web-session-${Date.now()}`;
					this.state.deviceId = webDeviceId;
					return Effect.succeed(webDeviceId);
				}

				// Register device with backend
				return pipe(
					// Ensure profile exists
					apiPost("/api/auth/register", {}),
					Effect.flatMap(() => {
						const platform =
							Platform.OS === "ios" || Platform.OS === "android"
								? Platform.OS
								: "android";
						return apiPost<{ data: { id: string } }>("/api/auth/device", {
							platform,
							deviceName: `${Platform.OS} device`,
						});
					}),
					Effect.flatMap((response) => {
						const deviceId = response?.data?.id;
						if (!deviceId) {
							return Effect.fail(
								new DeviceRegistrationError({
									message: "Failed to register device: no ID returned",
								}),
							);
						}
						return pipe(
							setStorageItem(KEYS.DEVICE_ID, deviceId),
							Effect.map(() => {
								this.state.deviceId = deviceId;
								return deviceId;
							}),
							Effect.mapError(
								(error) =>
									new DeviceRegistrationError({
										message: `Failed to store device ID: ${error.message}`,
										cause: error,
									}),
							),
						);
					}),
					Effect.tapError((error) =>
						Effect.sync(() =>
							console.error("Device registration failed:", error),
						),
					),
				);
			}),
		);

	// ─── Sync Triggers ───────────────────────────────────────

	/**
	 * Trigger sync only if user is authenticated.
	 * Safe to call from anywhere — silently no-ops if not logged in.
	 */
	syncIfAuthenticated = async (): Promise<void> => {
		const syncEffect = pipe(
			checkAuthentication(),
			Effect.flatMap(() => this.sync()),
			Effect.catchAll((error) =>
				Effect.sync(() => {
					// Silently ignore auth errors
					if (!(error instanceof AuthenticationError)) {
						console.error("syncIfAuthenticated error:", error);
					}
				}),
			),
		);

		await Effect.runPromise(syncEffect);
	};

	/**
	 * Debounced sync — call after local changes.
	 * Waits 2 seconds after last call before syncing.
	 */
	scheduleSyncAfterChange(): void {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}

		this.hasPendingSync = true;

		this.debounceTimer = setTimeout(() => {
			if (this.hasPendingSync && !this.syncInProgress) {
				this.hasPendingSync = false;
				this.syncIfAuthenticated();
			}
		}, 2000);
	}

	/**
	 * Full sync: push local changes, then pull remote changes.
	 * Returns silently if sync is already in progress.
	 */
	private sync = () =>
		pipe(
			Effect.sync(() => {
				// Skip sync for web platform
				if (Platform.OS === "web") {
					return true;
				}

				if (this.syncInProgress) {
					this.hasPendingSync = true;
					return false;
				}

				this.syncInProgress = true;
				this.syncCancelled = false;
				this.updateState({ status: "pushing", error: null });
				return true;
			}),
			Effect.filterOrFail(
				(shouldContinue) => shouldContinue,
				() =>
					new SyncCancelledError({
						message: "Sync already in progress or platform unsupported",
					}),
			),
			Effect.flatMap(() => this.ensureDevice()),
			Effect.flatMap((deviceId) =>
				pipe(
					// Check for cancellation
					this.checkCancellation(),
					// Push local changes
					Effect.flatMap(() => this.push(deviceId)),
					Effect.tap(() => this.checkCancellation()),
					Effect.tap(() =>
						Effect.sync(() => this.updateState({ status: "pulling" })),
					),
					// Pull remote changes
					Effect.flatMap((pushResult) =>
						pipe(
							this.pull(deviceId),
							Effect.map((pullResult) => ({ pushResult, pullResult })),
						),
					),
					Effect.tap(() => this.checkCancellation()),
					// Atomic commit
					Effect.flatMap(({ pushResult, pullResult }) =>
						pipe(
							this.markAllRecordsSynced(pushResult.pushedIds),
							Effect.flatMap(() =>
								setStorageItem(KEYS.LAST_SYNCED_AT, pullResult.syncedAt),
							),
							Effect.map(() => ({
								syncedAt: pullResult.syncedAt,
								pushCount: pushResult.upserted + pushResult.deleted,
								pullCount: pullResult.totalRecords,
							})),
						),
					),
					Effect.tap((result) =>
						Effect.sync(() => {
							this.updateState({
								status: "success",
								lastSyncedAt: result.syncedAt,
								lastPushCount: result.pushCount,
								lastPullCount: result.pullCount,
								error: null,
							});
						}),
					),
				),
			),
			Effect.catchAll((error) =>
				Effect.sync(() => {
					const message =
						error instanceof Error ? error.message : "Sync failed";
					console.error("Sync error:", message);
					if (!this.syncCancelled && !(error instanceof SyncCancelledError)) {
						this.updateState({ status: "error", error: message });
					}
				}),
			),
			Effect.tap(() =>
				Effect.sync(() => {
					this.syncInProgress = false;
					// If changes occurred during sync, schedule another sync
					if (this.hasPendingSync && !this.syncCancelled) {
						this.hasPendingSync = false;
						setTimeout(() => this.syncIfAuthenticated(), 0);
					}
				}),
			),
		);

	// ─── Helper Effects ──────────────────────────────────────

	private checkCancellation = () =>
		pipe(
			Effect.succeed(this.syncCancelled),
			Effect.flatMap((cancelled) => {
				if (cancelled) {
					return Effect.fail(
						new SyncCancelledError({
							message: "Sync was cancelled",
						}),
					);
				}
				return Effect.void;
			}),
		);

	// ─── Push ────────────────────────────────────────────────

	private push = (deviceId: string) =>
		pipe(
			this.collectLocalChanges(),
			Effect.flatMap((changesWithIds) => {
				const pushedIds: PushedIds = {
					transactions: changesWithIds.transactions.ids,
					categories: changesWithIds.categories.ids,
					products: changesWithIds.products.ids,
					stores: changesWithIds.stores.ids,
					product_listings: changesWithIds.productListings.ids,
					product_listings_history: changesWithIds.productListingHistory.ids,
				};

				const totalChanges = Object.values(changesWithIds).reduce(
					(sum, cs) => sum + cs.upserted.length + cs.deleted.length,
					0,
				);

				if (totalChanges === 0) {
					return Effect.succeed({
						upserted: 0,
						deleted: 0,
						pushedIds,
					});
				}

				const changes: SyncChanges = {
					transactions: {
						upserted: changesWithIds.transactions.upserted,
						deleted: changesWithIds.transactions.deleted,
					},
					categories: {
						upserted: changesWithIds.categories.upserted,
						deleted: changesWithIds.categories.deleted,
					},
					products: {
						upserted: changesWithIds.products.upserted,
						deleted: changesWithIds.products.deleted,
					},
					stores: {
						upserted: changesWithIds.stores.upserted,
						deleted: changesWithIds.stores.deleted,
					},
					productListings: {
						upserted: changesWithIds.productListings.upserted,
						deleted: changesWithIds.productListings.deleted,
					},
					productListingHistory: {
						upserted: changesWithIds.productListingHistory.upserted,
						deleted: changesWithIds.productListingHistory.deleted,
					},
				};

				if (__DEV__) {
					console.log("[Sync Push V2] Total changes:", totalChanges);
				}

				return pipe(
					apiPost<SyncPushResponse>("/api/sync/push", {
						deviceId,
						lastSyncedAt: this.state.lastSyncedAt,
						changes,
					}),
					Effect.flatMap((response) => {
						if (!response?.data) {
							return Effect.fail(
								new SyncPushError({
									message: "Push failed: no response data",
								}),
							);
						}
						return Effect.succeed({
							...response.data.counts,
							pushedIds,
						});
					}),
				);
			}),
			Effect.tapError((error) =>
				Effect.sync(() => console.error("Push error:", error)),
			),
		);

	/**
	 * Collect all local records with syncStatus = 'pending'.
	 */
	private collectLocalChanges = () =>
		pipe(
			Effect.all([
				collectPendingRecords(transactions),
				collectPendingRecords(categories),
				collectPendingRecords(products),
				collectPendingRecords(stores),
				collectPendingRecords(product_listings),
				collectPendingRecords(product_listings_history),
			]),
			Effect.map(
				([
					pendingTransactions,
					pendingCategories,
					pendingProducts,
					pendingStores,
					pendingProductListings,
					pendingProductListingHistory,
				]) => {
					const result: SyncChangesWithIds = {
						transactions: splitChanges(pendingTransactions),
						categories: splitChanges(pendingCategories),
						products: splitChanges(pendingProducts),
						stores: splitChanges(pendingStores),
						productListings: splitChanges(pendingProductListings),
						productListingHistory: splitChanges(pendingProductListingHistory),
					};
					return result;
				},
			),
		);

	/**
	 * Mark all pushed records as synced.
	 */
	private markAllRecordsSynced = (pushedIds: PushedIds) =>
		pipe(
			Effect.all([
				pushedIds.transactions.length > 0
					? markRecordsSyncedForTable(transactions, pushedIds.transactions)
					: Effect.succeed(undefined),
				pushedIds.categories.length > 0
					? markRecordsSyncedForTable(categories, pushedIds.categories)
					: Effect.succeed(undefined),
				pushedIds.products.length > 0
					? markRecordsSyncedForTable(products, pushedIds.products)
					: Effect.succeed(undefined),
				pushedIds.stores.length > 0
					? markRecordsSyncedForTable(stores, pushedIds.stores)
					: Effect.succeed(undefined),
				pushedIds.product_listings.length > 0
					? markRecordsSyncedForTable(
							product_listings,
							pushedIds.product_listings,
						)
					: Effect.succeed(undefined),
				pushedIds.product_listings_history.length > 0
					? markRecordsSyncedForTable(
							product_listings_history,
							pushedIds.product_listings_history,
						)
					: Effect.succeed(undefined),
			]),
			Effect.map(() => undefined),
		);

	// ─── Pull ────────────────────────────────────────────────

	private pull = (deviceId: string) =>
		pipe(
			apiPost<SyncPullResponse>("/api/sync/pull", {
				deviceId,
				lastSyncedAt: this.state.lastSyncedAt,
			}),
			Effect.flatMap((response) => {
				if (!response?.data) {
					return Effect.fail(
						new SyncPullError({
							message: "Pull failed: no response data",
						}),
					);
				}
				const { syncedAt, changes } = response.data;
				return pipe(
					this.applyRemoteChanges(changes),
					Effect.map((totalRecords) => ({ syncedAt, totalRecords })),
					Effect.mapError(
						(error) =>
							new SyncPullError({
								message: `Failed to apply remote changes: ${error.message}`,
								cause: error,
							}),
					),
				);
			}),
			Effect.tapError((error) =>
				Effect.sync(() => console.error("Pull error:", error)),
			),
		);

	/**
	 * Apply pulled changes to local database.
	 * Applies in dependency order to maintain referential integrity.
	 */
	private applyRemoteChanges = (changes: SyncChanges) =>
		pipe(
			Effect.all([
				applyTableChanges(
					categories,
					changes.categories ?? { upserted: [], deleted: [] },
				),
				applyTableChanges(
					stores,
					changes.stores ?? { upserted: [], deleted: [] },
				),
				applyTableChanges(
					products,
					changes.products ?? { upserted: [], deleted: [] },
				),
				applyTableChanges(
					transactions,
					changes.transactions ?? { upserted: [], deleted: [] },
				),
				applyTableChanges(
					product_listings,
					changes.productListings ?? { upserted: [], deleted: [] },
				),
				applyTableChanges(
					product_listings_history,
					changes.productListingHistory ?? { upserted: [], deleted: [] },
				),
			]),
			Effect.map((counts) => counts.reduce((sum, count) => sum + count, 0)),
		);

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
		listener(this.state);
		return () => this.listeners.delete(listener);
	}

	private notifyListeners(): void {
		for (const listener of this.listeners) {
			try {
				listener(this.state);
			} catch (err) {
				console.error("SyncManagerV2: Listener error:", err);
			}
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
	 * Clear all sync data using Effect.
	 * Cancels any in-progress sync to prevent race conditions.
	 */
	reset = () =>
		pipe(
			Effect.sync(() => {
				this.syncCancelled = true;
				this.hasPendingSync = false;

				if (this.debounceTimer) {
					clearTimeout(this.debounceTimer);
					this.debounceTimer = null;
				}
			}),
			Effect.flatMap(() =>
				Effect.promise(async () => {
					if (this.syncInProgress) {
						const maxWaitTime = 5000;
						const startTime = Date.now();
						while (
							this.syncInProgress &&
							Date.now() - startTime < maxWaitTime
						) {
							await new Promise((resolve) => setTimeout(resolve, 100));
						}
					}
				}),
			),
			Effect.flatMap(() =>
				Effect.all([
					removeStorageItem(KEYS.DEVICE_ID),
					removeStorageItem(KEYS.LAST_SYNCED_AT),
				]),
			),
			Effect.tap(() =>
				Effect.sync(() => {
					this.state = {
						status: "idle",
						lastSyncedAt: null,
						deviceId: null,
						error: null,
						lastPushCount: 0,
						lastPullCount: 0,
					};
					this.notifyListeners();
				}),
			),
			Effect.catchAll((error) =>
				Effect.sync(() => {
					console.error("Reset error:", error);
				}),
			),
		);
}
