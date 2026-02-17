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
	transactions,
	products,
	stores,
	product_listings,
	product_listings_history,
} from "@/db/schema";
import { isNull } from "drizzle-orm";
import { Effect, pipe } from "effect";

// ─── Claim Anonymous Data ─────────────────────────────────────

/**
 * Claims all anonymous (localOwnerId = null) records for the given user.
 *
 * Called after successful sign-in or sign-up. Sets localOwnerId = userId
 * and syncStatus = "pending" on all unclaimed records so they get pushed
 * to the server on the next sync.
 *
 * @param userId - Supabase user ID to assign ownership to
 */
export const claimAnonymousData = (userId: string) =>
	pipe(
		Effect.all([
			Effect.tryPromise({
				try: () =>
					db
						.update(categories)
						.set({ localOwnerId: userId, syncStatus: "pending" })
						.where(isNull(categories.localOwnerId)),
				catch: (error) =>
					new Error(`Failed to claim categories: ${String(error)}`),
			}),
			Effect.tryPromise({
				try: () =>
					db
						.update(transactions)
						.set({ localOwnerId: userId, syncStatus: "pending" })
						.where(isNull(transactions.localOwnerId)),
				catch: (error) =>
					new Error(`Failed to claim transactions: ${String(error)}`),
			}),
			Effect.tryPromise({
				try: () =>
					db
						.update(products)
						.set({ localOwnerId: userId, syncStatus: "pending" })
						.where(isNull(products.localOwnerId)),
				catch: (error) =>
					new Error(`Failed to claim products: ${String(error)}`),
			}),
			Effect.tryPromise({
				try: () =>
					db
						.update(stores)
						.set({ localOwnerId: userId, syncStatus: "pending" })
						.where(isNull(stores.localOwnerId)),
				catch: (error) =>
					new Error(`Failed to claim stores: ${String(error)}`),
			}),
			Effect.tryPromise({
				try: () =>
					db
						.update(product_listings)
						.set({ localOwnerId: userId, syncStatus: "pending" })
						.where(isNull(product_listings.localOwnerId)),
				catch: (error) =>
					new Error(`Failed to claim product listings: ${String(error)}`),
			}),
			Effect.tryPromise({
				try: () =>
					db
						.update(product_listings_history)
						.set({ localOwnerId: userId, syncStatus: "pending" })
						.where(isNull(product_listings_history.localOwnerId)),
				catch: (error) =>
					new Error(
						`Failed to claim product listings history: ${String(error)}`,
					),
			}),
		]),
		Effect.map(() => undefined),
	);
