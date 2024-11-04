import { db as database } from "@/db/client";
import {
	type InsertProductListing,
	product_listings as productsListingsRepo,
	products as productsRepo,
} from "@/db/schema";
import { Value } from "@sinclair/typebox/value";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export const getProductsListings = () => {
	return Effect.promise(() => {
		const query = database.select().from(productsListingsRepo);

		return query.execute();
	});
};

export const getProductListingsById = (id: number) => {
	return Effect.promise(() => {
		const query = database
			.select()
			.from(productsListingsRepo)
			.where(eq(productsListingsRepo.productId, id));

		return query.execute();
	});
};

export const addProductListing = (productListing: InsertProductListing) => {
	return Effect.promise(() => {
		const query = database
			.insert(productsListingsRepo)
			.values(productListing)
			.returning();

		return query.execute();
	});
};

export const deleteAllProductListings = () => {
	return Effect.promise(() => {
		const query = database.delete(productsListingsRepo);

		return query.execute();
	});
};
