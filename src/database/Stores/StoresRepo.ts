import { db as database } from "@/db/client";
import { type insertStoreSchema, stores as storesRepo } from "@/db/schema";
import type { Static } from "@sinclair/typebox";
import { eq } from "drizzle-orm";
import { Effect, Predicate, pipe } from "effect";
import { InvalidIdError } from "./StoresErrors";

export const addStore = (
	store: Static<typeof insertStoreSchema> | Static<typeof insertStoreSchema>[],
) =>
	Effect.promise(() => {
		return database.insert(storesRepo).values(store).execute();
	});

export const editStore = (
	store: Static<typeof insertStoreSchema>,
	id: number,
) =>
	pipe(
		Effect.succeed({ store, id }),
		Effect.filterOrFail(
			({ id }) => id > 0,
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
					.set(store)
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
		return database.select().from(storesRepo).execute();
	});

export const deleteStoreById = (id: number) => {
	return pipe(
		Effect.succeed(id),
		// id validation
		Effect.filterOrFail(
			(storeId) => storeId > 0,
			() => new InvalidIdError({ message: "Invalid Store id" }),
		),
		// delete store
		Effect.flatMap((validStoreId) =>
			Effect.tryPromise(() =>
				database
					.delete(storesRepo)
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
