import { db as database } from "@/db/client";
import { eq, inArray } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import { Effect, pipe } from "effect";
import { DatabaseError } from "./errors";
import type { ChangeSet, SyncableRecord } from "./types";
import { getIdColumn } from "./types";

// ─── Type Helpers ────────────────────────────────────────────

type TableWithSyncStatus = {
	syncStatus: SQLiteColumn;
};

// ─── Database Effects ────────────────────────────────────────

/**
 * Collect all pending records from a table as an Effect.
 */
export const collectPendingRecords = (table: SQLiteTable) =>
	Effect.tryPromise({
		try: () => {
			const tableWithSync = table as unknown as TableWithSyncStatus;
			return database
				.select()
				.from(table)
				.where(eq(tableWithSync.syncStatus, "pending"))
				.execute() as Promise<SyncableRecord[]>;
		},
		catch: (error) =>
			new DatabaseError({
				message: "Failed to collect pending records",
				operation: "collectPendingRecords",
				cause: error,
			}),
	});

/**
 * Mark records as synced for a specific table.
 * Validates that IDs are provided before executing.
 */
export const markRecordsSyncedForTable = (table: SQLiteTable, ids: string[]) =>
	pipe(
		Effect.succeed(ids),
		Effect.filterOrFail(
			(idList) => idList.length > 0,
			() =>
				new DatabaseError({
					message: "No IDs provided to mark as synced",
					operation: "markRecordsSynced",
				}),
		),
		Effect.flatMap((validIds) =>
			Effect.tryPromise({
				try: () => {
					const idColumn = getIdColumn(table);
					return database
						.update(table)
						.set({ syncStatus: "synced" as const })
						.where(inArray(idColumn, validIds))
						.execute();
				},
				catch: (error) =>
					new DatabaseError({
						message: "Failed to mark records as synced",
						operation: "markRecordsSynced",
						cause: error,
					}),
			}),
		),
	);

/**
 * Apply remote changes to a table (upsert and soft-delete).
 * Returns the count of records processed.
 */
export const applyTableChanges = (
	table: SQLiteTable,
	changeSet: ChangeSet<SyncableRecord>,
) =>
	Effect.tryPromise({
		try: async () => {
			if (changeSet.upserted.length === 0 && changeSet.deleted.length === 0) {
				return 0;
			}

			let count = 0;
			const idColumn = getIdColumn(table);

			await database.transaction(async (tx) => {
				// Upsert records
				if (changeSet.upserted.length > 0) {
					for (const record of changeSet.upserted) {
						const localRecord: Record<string, unknown> = { ...record };
						// Convert string amounts back to numbers for local storage
						if (typeof localRecord.amount === "string") {
							const parsed = Number.parseFloat(localRecord.amount);
							localRecord.amount = Number.isNaN(parsed) ? 0 : parsed;
						}
						if (typeof localRecord.price === "string") {
							const parsed = Number.parseFloat(localRecord.price);
							localRecord.price = Number.isNaN(parsed) ? 0 : parsed;
						}
						localRecord.syncStatus = "synced";

						const { id, ...updatePayload } = localRecord;

						await tx.insert(table).values(localRecord).onConflictDoUpdate({
							target: idColumn,
							set: updatePayload,
						});
						count++;
					}
				}

				// Soft-delete records
				if (changeSet.deleted.length > 0) {
					const deletedAt = new Date().toISOString();
					const syncStatus = "synced" as const;

					for (const id of changeSet.deleted) {
						const updatePayload: Record<string, unknown> = {
							deletedAt,
							syncStatus,
						};

						await tx.update(table).set(updatePayload).where(eq(idColumn, id));
						count++;
					}
				}
			});

			return count;
		},
		catch: (error) =>
			new DatabaseError({
				message: "Failed to apply table changes",
				operation: "applyTableChanges",
				cause: error,
			}),
	});

/**
 * Split records into upserted (active) and deleted (soft-deleted) sets.
 * Strips sync-only fields and converts formatting for backend compatibility.
 */
export function splitChanges(records: SyncableRecord[]): {
	upserted: SyncableRecord[];
	deleted: string[];
	ids: string[];
} {
	const upserted: SyncableRecord[] = [];
	const deleted: string[] = [];
	const ids: string[] = [];

	for (const record of records) {
		ids.push(record.id);
		if (record.deletedAt) {
			deleted.push(record.id);
		} else {
			const { syncStatus, deletedAt, ...rest } = record;
			// Convert amount/price from number to string for backend
			if (typeof rest.amount === "number") {
				rest.amount = String(rest.amount);
			}
			if (typeof rest.price === "number") {
				rest.price = String(rest.price);
			}
			// Strip null/undefined values
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
