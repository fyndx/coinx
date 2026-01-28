import { db as database } from "@/db/client";
import {
	product_listings as productListingsRepo,
	product_listings_history as productsListingsHistoryRepo,
	type InsertProductListingHistory,
} from "@/db/schema";
import { DrizzleError } from "@/src/utils/error";
import { generateUUID } from "@/src/utils/uuid";
import { asc, eq } from "drizzle-orm";
import { Effect } from "effect";

export const addProductListingsHistory = (
	productListingHistory: Omit<InsertProductListingHistory, "id">,
) => {
	return Effect.promise(() => {
		const query = database
			.insert(productsListingsHistoryRepo)
			.values({
				...productListingHistory,
				id: generateUUID(),
				syncStatus: "pending",
			})
			.returning();

		return query.execute();
	});
};

/**
 * Retrieves the product listings history for a given product ID Grouped by Listing ID.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.productId - The UUID of the product to retrieve the listings history for.
 */
export const getProductListingsHistoryByProductId = ({
	productId,
}: { productId: string }) => {
	return Effect.tryPromise({
		try: () => {
			const query = database
				.select({
					productListingId: productsListingsHistoryRepo.productListingId,
					price: productsListingsHistoryRepo.price,
					recordedAt: productsListingsHistoryRepo.recordedAt,
					listingName: productListingsRepo.name, // Selecting the listing name from product_listings
				})
				.from(productsListingsHistoryRepo)
				.innerJoin(
					productListingsRepo,
					eq(
						productsListingsHistoryRepo.productListingId,
						productListingsRepo.id,
					),
				)
				.where(eq(productsListingsHistoryRepo.productId, productId))
				.orderBy(asc(productsListingsHistoryRepo.recordedAt));

			return query.execute();
		},
		catch: (error) => {
			// console.error(error);
			Effect.logError({
				error: error instanceof Error ? error.message : "Unknown error",
				operation: "getProductListingsHistoryByProductId",
				productId,
			});
			return Effect.fail(
				new DrizzleError({
					message:
						"Failed to get product listings history for the given product id",
				}),
			);
		},
	});
};

export const deleteProductListingsByProductListingId = (id: string) => {
	return Effect.promise(() => {
		const query = database
			.delete(productsListingsHistoryRepo)
			.where(eq(productsListingsHistoryRepo.productListingId, id));

		return query.execute();
	});
};
