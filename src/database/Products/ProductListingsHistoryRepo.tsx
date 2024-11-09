import { db as database } from "@/db/client";
import { product_listings_history as productsListingsHistoryRepo, type InsertProductListingHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export const addProductListingsHistory = (productListingHistory: InsertProductListingHistory) => {
	return Effect.promise(() => {
		const query = database
			.insert(productsListingsHistoryRepo)
			.values(productListingHistory)
			.returning();

		return query.execute();
	});
}

export const getProductListingsHistoryByProductListingId = (productId: number) => {
	return Effect.promise(() => {
		const query = database
			.select()
			.from(productsListingsHistoryRepo)
			.where(eq(productsListingsHistoryRepo.productListingId, productId));

		return query.execute();
	});
}

export const deleteProductListingsByProductListingId = (id: number) => {
	return Effect.promise(() => {
		const query = database
			.delete(productsListingsHistoryRepo)
			.where(eq(productsListingsHistoryRepo.productListingId, id));

		return query.execute();
	});
};
