import { db as database } from "@/db/client";
import { type InsertStore, stores as storesRepo } from "@/db/schema";
import { generateUUID } from "@/src/utils/uuid";
import { eq, isNull } from "drizzle-orm";
import { Effect, Predicate, pipe } from "effect";
import { InvalidIdError } from "./StoresErrors";

export const addStore = (
	store: Omit<InsertStore, "id"> | Omit<InsertStore, "id">[],
) =>
	Effect.promise(() => {
		if (Array.isArray(store)) {
			const storesWithIds = store.map((s) => ({
				...s,
				id: generateUUID(),
				syncStatus: "pending" as const,
			}));
			return database.insert(storesRepo).values(storesWithIds).execute();
		}
		return database
			.insert(storesRepo)
			.values({
				...store,
				id: generateUUID(),
				syncStatus: "pending",
			})
			.execute();
	});

export const editStore = (store: Omit<InsertStore, "id">, id: string) =>
	pipe(
		Effect.succeed({ store, id }),
		Effect.filterOrFail(
			({ id }) => id.length > 0,
			() => new InvalidIdError({ message: "Invalid store ID" }),
		),
		Effect.filterOrFail(
			({ store }) => Boolean(store.name?.trim() && store.location?.trim()),
			() => new Error("Store name and location are required"),
		),
		Effect.flatMap(({ store, id }) =>
			Effect.tryPromise(() => {
				return database
					.update(storesRepo)
					.set({
						...store,
						updatedAt: new Date().toISOString(),
						syncStatus: "pending",
					})
					.where(eq(storesRepo.id, id))
					.execute();
			}),
		),
		// Log Errors
		Effect.tapError((error) => {
			return Effect.sync(() => {
				console.error("Failed to update store:", error);
			});
		}),
	);

export const getStores = () =>
	Effect.promise(() => {
		return database
			.select()
			.from(storesRepo)
			.where(isNull(storesRepo.deletedAt))
			.execute();
	});

export const deleteStoreById = (id: string) => {
	return pipe(
		Effect.succeed(id),
		// id validation
		Effect.filterOrFail(
			(storeId) => storeId.length > 0,
			() => new InvalidIdError({ message: "Invalid Store id" }),
		),
		// soft delete store
		Effect.flatMap((validStoreId) =>
			Effect.tryPromise(() =>
				database
					.update(storesRepo)
					.set({
						deletedAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						syncStatus: "pending",
					})
					.where(eq(storesRepo.id, validStoreId))
					.execute(),
			),
		),
		// Log Errors
		Effect.tapError((error) => {
			return Effect.sync(() => {
				console.error("Failed to delete store:", error);
			});
		}),
	);
};
