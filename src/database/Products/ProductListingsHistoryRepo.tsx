import { db as database } from "@/db/client";
import {
	product_listings_history as productsListingsHistoryRepo,
	type InsertProductListingHistory,
} from "@/db/schema";
import { DrizzleError } from "@/src/utils/error";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export const addProductListingsHistory = (
	productListingHistory: InsertProductListingHistory,
) => {
	return Effect.promise(() => {
		const query = database
			.insert(productsListingsHistoryRepo)
			.values(productListingHistory)
			.returning();

		return query.execute();
	});
};

export const getProductListingsHistoryByProductListingId = (
	productId: number,
) => {
	return Effect.tryPromise({
		try: () => {
			const query = database
				.select()
				.from(productsListingsHistoryRepo)
				.where(eq(productsListingsHistoryRepo.productListingId, productId));

			return query.execute();
		},
		catch: (error) => {
			console.error(error);
			return Effect.fail(
				new DrizzleError({
					message: "Failed to get product listings history for the given id",
				}),
			);
		},
	});
};

export const deleteProductListingsByProductListingId = (id: number) => {
	return Effect.promise(() => {
		const query = database
			.delete(productsListingsHistoryRepo)
			.where(eq(productsListingsHistoryRepo.productListingId, id));

		return query.execute();
	});
};
