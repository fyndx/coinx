import { db as database } from "@/db/client";
import { type insertStoreSchema, stores as storesRepo } from "@/db/schema";
import type { Static } from "@sinclair/typebox";
import { Effect } from "effect";

export const addStore = (store: Static<typeof insertStoreSchema>) =>
	Effect.promise(() => {
		return database.insert(storesRepo).values(store).execute();
	});

export const getStores = () =>
	Effect.promise(() => {
		return database.select().from(storesRepo).execute();
	});
