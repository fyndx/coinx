import { db as database } from "@/db/client";
import { type insertStoreSchema, stores as storesRepo } from "@/db/schema";
import type { Static } from "@sinclair/typebox";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export const addStore = (store: Static<typeof insertStoreSchema>) =>
	Effect.promise(() => {
		return database.insert(storesRepo).values(store).execute();
	});

export const editStore = (
	store: Static<typeof insertStoreSchema>,
	id: number,
) =>
	Effect.promise(() => {
		return database
			.update(storesRepo)
			.set(store)
			.where(eq(storesRepo.id, id))
			.execute();
	});

export const getStores = () =>
	Effect.promise(() => {
		return database.select().from(storesRepo).execute();
	});

export const deleteStoreById = (id: number) =>
	Effect.promise(() => {
		return database.delete(storesRepo).where(eq(storesRepo.id, id)).execute();
	});
