import { db as database } from "@/db/client";
import { product_listings_history as productsListingsHistoryRepo } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export const deleteProductListingsByProductListingId = (id: number) => {
	return Effect.promise(() => {
		const query = database
			.delete(productsListingsHistoryRepo)
			.where(eq(productsListingsHistoryRepo.productListingId, id));

		return query.execute();
	});
};
