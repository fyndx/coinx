import type { SQLiteTable, SQLiteColumn } from "drizzle-orm/sqlite-core";

// ─── Type Utilities ──────────────────────────────────────────

/**
 * Get the id column from a syncable table.
 * Returns a properly typed Drizzle column that can be used in queries.
 */
export function getIdColumn(table: SQLiteTable): SQLiteColumn {
	const col = (table as unknown as Record<string, SQLiteColumn>).id;
	if (!col) {
		throw new Error(`Table does not have an 'id' column`);
	}
	return col;
}

// ─── Base Types ──────────────────────────────────────────────

/**
 * Base interface for all syncable records.
 * Ensures type safety when accessing common sync fields.
 */
export interface SyncableRecord {
	id: string;
	deletedAt: string | null;
	syncStatus: "pending" | "synced" | null;
	// Optional fields for financial records
	amount?: number | string;
	price?: number | string;
	// Allow other properties
	[key: string]: unknown;
}

// ─── Change Set Types ────────────────────────────────────────

export interface ChangeSet<T extends SyncableRecord> {
	upserted: T[];
	deleted: string[];
}

export interface ChangeSetWithIds<T extends SyncableRecord>
	extends ChangeSet<T> {
	/** IDs of all records (both upserted and deleted) for tracking */
	ids: string[];
}

// ─── Sync Changes Types ──────────────────────────────────────

export interface SyncChanges {
	transactions: ChangeSet<SyncableRecord>;
	categories: ChangeSet<SyncableRecord>;
	products: ChangeSet<SyncableRecord>;
	stores: ChangeSet<SyncableRecord>;
	productListings: ChangeSet<SyncableRecord>;
	productListingHistory: ChangeSet<SyncableRecord>;
}

export interface SyncChangesWithIds {
	transactions: ChangeSetWithIds<SyncableRecord>;
	categories: ChangeSetWithIds<SyncableRecord>;
	products: ChangeSetWithIds<SyncableRecord>;
	stores: ChangeSetWithIds<SyncableRecord>;
	productListings: ChangeSetWithIds<SyncableRecord>;
	productListingHistory: ChangeSetWithIds<SyncableRecord>;
}

export interface PushedIds {
	transactions: string[];
	categories: string[];
	products: string[];
	stores: string[];
	product_listings: string[];
	product_listings_history: string[];
}

// ─── API Response Types ──────────────────────────────────────

export interface SyncPushResponse {
	data: {
		syncedAt: string;
		counts: {
			upserted: number;
			deleted: number;
		};
	};
}

export interface SyncPullResponse {
	data: {
		syncedAt: string;
		changes: SyncChanges;
	};
}

// ─── Sync State Types ────────────────────────────────────────

export type SyncStatus_Type =
	| "idle"
	| "pushing"
	| "pulling"
	| "error"
	| "success";

export interface SyncState {
	status: SyncStatus_Type;
	lastSyncedAt: string | null;
	deviceId: string | null;
	error: string | null;
	lastPushCount: number;
	lastPullCount: number;
}

// ─── Storage Keys ────────────────────────────────────────────

export const STORAGE_KEYS = {
	DEVICE_ID: "coinx:sync:deviceId",
	LAST_SYNCED_AT: "coinx:sync:lastSyncedAt",
} as const;
