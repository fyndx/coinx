import { Effect, pipe } from "effect";
import { AppState, Platform } from "react-native";

import {
  categories,
  product_listings,
  product_listings_history,
  products,
  stores,
  transactions,
} from "@/db/schema";
import { getHttpStatusFromError } from "@/src/utils/http";

import type {
  PushedIds,
  SyncChanges,
  SyncChangesWithIds,
  SyncPullResponse,
  SyncPushResponse,
  SyncState,
} from "./types";

import { apiPost } from "./api";
import { checkAuthentication } from "./auth";
import {
  applyTableChanges,
  collectPendingRecords,
  markRecordsSyncedForTable,
  splitChanges,
} from "./database";
import {
  AuthenticationError,
  DeviceRegistrationError,
  SyncCancelledError,
  SyncPullError,
  SyncPushError,
} from "./errors";
import { getStorageItem, removeStorageItem, setStorageItem } from "./storage";
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
    consecutiveFailures: 0,
    lastErrorTimestamp: null,
    lastErrorContext: null,
  };

  private syncInProgress = false;
  private syncCancelled = false;
  private hasPendingSync = false;
  private lastSyncHadError = false;
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

        // Remove existing listener if re-initializing
        this.appStateSubscription?.remove();

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
          const errorMessage =
            error instanceof Error ? error.message : "Initialization failed";
          this.logStructuredError("init", errorMessage, error);
          this.updateState({
            status: "error",
            error: errorMessage,
            consecutiveFailures: this.state.consecutiveFailures + 1,
            lastErrorTimestamp: new Date().toISOString(),
            lastErrorContext: "init",
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
          this.updateState({ deviceId: webDeviceId });
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
            // Strict type guard for API response
            if (
              !response ||
              !response.data ||
              typeof response.data !== "object" ||
              !response.data.id ||
              typeof response.data.id !== "string" ||
              response.data.id.trim() === ""
            ) {
              return Effect.fail(
                new DeviceRegistrationError({
                  message:
                    "Failed to register device: invalid or missing ID in response",
                }),
              );
            }
            const deviceId = response.data.id;
            return pipe(
              setStorageItem(KEYS.DEVICE_ID, deviceId),
              Effect.map(() => {
                this.updateState({ deviceId });
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
            Effect.sync(() => {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Device registration failed";
              this.logStructuredError(
                "device_registration",
                errorMessage,
                error,
              );
            }),
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
    // Early return for web platform
    if (Platform.OS === "web") {
      return;
    }

    // Early return if sync already in progress
    if (this.syncInProgress) {
      this.hasPendingSync = true;
      return;
    }

    const syncEffect = pipe(
      checkAuthentication(),
      Effect.flatMap(() => this.sync()),
      Effect.catchAll((error: unknown) =>
        Effect.sync(() => {
          // Silently ignore auth errors (user not logged in is expected state)
          // This allows sync to be called freely without checking auth state first
          if (!(error instanceof AuthenticationError)) {
            const errorMessage =
              error instanceof Error ? error.message : "Sync failed";
            this.logStructuredError("sync_trigger", errorMessage, error);
          }
        }),
      ),
    );

    await Effect.runPromise(syncEffect);
  };

  /**
   * Run an authenticated sync and surface any failure to the caller.
   * Intended for explicit flows such as post-auth setup.
   */
  syncAuthenticated = async (): Promise<void> => {
    if (Platform.OS === "web") {
      return;
    }

    if (this.syncInProgress) {
      this.hasPendingSync = true;
      return;
    }

    await Effect.runPromise(
      pipe(
        checkAuthentication(),
        Effect.flatMap(() => this.sync()),
      ),
    );
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
   * Caller must check if sync is already in progress.
   */
  private sync = () =>
    pipe(
      Effect.sync(() => {
        this.syncInProgress = true;
        this.syncCancelled = false;
        this.updateState({ status: "pushing", error: null });
      }),
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
                consecutiveFailures: 0, // Reset on success
                lastErrorTimestamp: null,
                lastErrorContext: null,
              });
            }),
          ),
        ),
      ),
      Effect.catchAll((error) =>
        Effect.sync(() => {
          const message =
            error instanceof Error ? error.message : "Sync failed";

          if (!this.syncCancelled && !(error instanceof SyncCancelledError)) {
            this.lastSyncHadError = true;
            // Determine context based on current status
            const context =
              this.state.status === "pushing"
                ? "push"
                : this.state.status === "pulling"
                  ? "pull"
                  : "sync";
            this.logStructuredError(context, message, error);
            this.updateState({
              status: "error",
              error: message,
              consecutiveFailures: this.state.consecutiveFailures + 1,
              lastErrorTimestamp: new Date().toISOString(),
              lastErrorContext: context,
            });
          }
        }),
      ),
      Effect.tap(() =>
        Effect.sync(() => {
          this.syncInProgress = false;
          // If changes occurred during sync, schedule another sync
          // Only reschedule if no error occurred and sync wasn't cancelled
          if (
            this.hasPendingSync &&
            !this.syncCancelled &&
            !this.lastSyncHadError
          ) {
            setTimeout(() => this.syncIfAuthenticated(), 0);
          }
          // Reset flags for next sync
          this.hasPendingSync = false;
          this.lastSyncHadError = false;
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
            // Strict type guard for API response
            if (
              !response ||
              !response.data ||
              typeof response.data !== "object" ||
              !response.data.counts ||
              typeof response.data.counts !== "object" ||
              typeof response.data.counts.upserted !== "number" ||
              typeof response.data.counts.deleted !== "number"
            ) {
              return Effect.fail(
                new SyncPushError({
                  message: "Push failed: invalid or missing response data",
                }),
              );
            }
            return Effect.succeed({
              ...response.data.counts,
              pushedIds,
            });
          }),
          Effect.catchAll((error) => {
            // Handle 409 Conflict - records already exist on server
            const statusCode = getHttpStatusFromError(error);
            if (statusCode === 409) {
              console.warn(
                "[Sync Push] 409 conflict: Records already exist on server.",
              );
              console.warn(
                "[Sync Push] This likely means the app crashed after push succeeded but before marking records as synced.",
              );
              console.warn(
                "[Sync Push] Treating as success and marking local records as synced to resolve conflict.",
              );
              if (__DEV__) {
                console.log(
                  "[Sync Push] Conflicting record count:",
                  totalChanges,
                );
              }
              // PRAGMATIC FIX: Records exist on server, so mark them as synced locally
              // This resolves the infinite retry loop
              // TODO: Backend should implement UPSERT (INSERT ... ON CONFLICT DO UPDATE)
              // to handle this gracefully without 409 errors
              return Effect.succeed({
                upserted: totalChanges,
                deleted: 0,
                pushedIds,
              });
            }
            // Re-throw other errors
            return Effect.fail(error);
          }),
        );
      }),
      Effect.tapError((error) =>
        Effect.sync(() => {
          const errorMessage =
            error instanceof Error ? error.message : "Push failed";
          this.logStructuredError("push", errorMessage, error);
        }),
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
   * Uses a data-driven approach to reduce duplication.
   */
  private markAllRecordsSynced = (pushedIds: PushedIds) => {
    // Define table-to-ids mapping for reduced duplication
    const tableOperations = [
      { table: transactions, ids: pushedIds.transactions },
      { table: categories, ids: pushedIds.categories },
      { table: products, ids: pushedIds.products },
      { table: stores, ids: pushedIds.stores },
      { table: product_listings, ids: pushedIds.product_listings },
      {
        table: product_listings_history,
        ids: pushedIds.product_listings_history,
      },
    ] as const;

    // Map to effects, only processing tables with IDs
    const effects = tableOperations.map(({ table, ids }) =>
      ids.length > 0
        ? markRecordsSyncedForTable(table, ids)
        : Effect.succeed(undefined),
    );

    return pipe(
      Effect.all(effects),
      Effect.map(() => undefined),
    );
  };

  // ─── Pull ────────────────────────────────────────────────

  private pull = (deviceId: string) =>
    pipe(
      apiPost<SyncPullResponse>("/api/sync/pull", {
        deviceId,
        lastSyncedAt: this.state.lastSyncedAt,
      }),
      Effect.flatMap((response) => {
        // Strict type guard for API response
        if (
          !response ||
          !response.data ||
          typeof response.data !== "object" ||
          !response.data.syncedAt ||
          typeof response.data.syncedAt !== "string" ||
          !response.data.changes ||
          typeof response.data.changes !== "object"
        ) {
          return Effect.fail(
            new SyncPullError({
              message: "Pull failed: invalid or missing response data",
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
        Effect.sync(() => {
          const errorMessage =
            error instanceof Error ? error.message : "Pull failed";
          this.logStructuredError("pull", errorMessage, error);
        }),
      ),
    );

  /**
   * Apply pulled changes to local database.
   * Applies in dependency order to maintain referential integrity.
   * Must be sequential to respect foreign key constraints:
   * 1. categories, stores (no dependencies)
   * 2. products (no dependencies)
   * 3. transactions (depends on categories)
   * 4. product_listings (depends on products and stores)
   * 5. product_listings_history (depends on products)
   */
  private applyRemoteChanges = (changes: SyncChanges) =>
    pipe(
      // Step 1: Base tables (no dependencies) - can run in parallel
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
      ]),
      // Step 2: Tables that depend on step 1 - can run in parallel with each other
      Effect.flatMap((counts1) =>
        pipe(
          Effect.all([
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
          Effect.map((counts2) => [...counts1, ...counts2]),
        ),
      ),
      Effect.map((counts) => counts.reduce((sum, count) => sum + count, 0)),
    );

  // ─── State Management ────────────────────────────────────

  private updateState(partial: Partial<SyncState>): void {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  /**
   * Log structured error with context for better debugging.
   * Includes timestamp, operation, device ID, and error details.
   */
  private logStructuredError(
    context: string,
    message: string,
    error: unknown,
  ): void {
    const timestamp = new Date().toISOString();
    const errorDetails = {
      timestamp,
      context,
      message,
      deviceId: this.state.deviceId,
      lastSyncedAt: this.state.lastSyncedAt,
      consecutiveFailures: this.state.consecutiveFailures + 1,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
    };

    console.error(`[SyncManager Error] ${context}:`, message);
    if (__DEV__) {
      console.error("Error details:", errorDetails);
    }
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
            consecutiveFailures: 0,
            lastErrorTimestamp: null,
            lastErrorContext: null,
          };
          this.notifyListeners();
        }),
      ),
      Effect.catchAll((error) =>
        Effect.sync(() => {
          const errorMessage =
            error instanceof Error ? error.message : "Reset failed";
          this.logStructuredError("reset", errorMessage, error);
        }),
      ),
    );
}
