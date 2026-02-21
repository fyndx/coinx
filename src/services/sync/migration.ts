/**
 * Migration Service
 *
 * Handles data ownership migration when anonymous users sign up or log in.
 * Assigns localOwnerId to all unclaimed (anonymous) records and marks them
 * as pending sync so they get pushed to the server.
 *
 * @module sync/migration
 */

import { db } from "@/db/client";
import {
	categories,
	product_listings,
	product_listings_history,
	products,
	stores,
	transactions,
} from "@/db/schema";
import { isNull } from "drizzle-orm";
import { Effect } from "effect";

// ─── Claim Anonymous Data ─────────────────────────────────────

/**
 * Claims all anonymous (localOwnerId = null) records for the given user.
 *
 * Called after successful sign-in or sign-up. Sets localOwnerId = userId
 * and syncStatus = "pending" on all unclaimed records so they get pushed
 * to the server on the next sync.
 *
 * All six table updates run inside a single transaction to ensure atomicity —
 * either all records are claimed or none are.
 *
 * @param userId - Supabase user ID to assign ownership to
 */
export const claimAnonymousData = (userId: string) =>
	Effect.tryPromise({
		try: () =>
			db.transaction(async (tx) => {
				await tx
					.update(categories)
					.set({ localOwnerId: userId, syncStatus: "pending" })
					.where(isNull(categories.localOwnerId));
				await tx
					.update(transactions)
					.set({ localOwnerId: userId, syncStatus: "pending" })
					.where(isNull(transactions.localOwnerId));
				await tx
					.update(products)
					.set({ localOwnerId: userId, syncStatus: "pending" })
					.where(isNull(products.localOwnerId));
				await tx
					.update(stores)
					.set({ localOwnerId: userId, syncStatus: "pending" })
					.where(isNull(stores.localOwnerId));
				await tx
					.update(product_listings)
					.set({ localOwnerId: userId, syncStatus: "pending" })
					.where(isNull(product_listings.localOwnerId));
				await tx
					.update(product_listings_history)
					.set({ localOwnerId: userId, syncStatus: "pending" })
					.where(isNull(product_listings_history.localOwnerId));
			}),
		catch: (error) =>
			new Error(`Failed to claim anonymous data: ${String(error)}`),
	});
