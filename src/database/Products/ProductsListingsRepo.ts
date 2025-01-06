import { db as database } from "@/db/client";
import {
	type InsertProductListing,
	product_listings as productsListingsRepo,
	products as productsRepo,
	stores as storesRepo,
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

export type GetProductListingsByProductId = ReturnType<
	typeof getProductListingsByProductId
>;
/**
 * Retrieves product listings by the given product ID.
 *
 * This function performs a database query to fetch product listings
 * associated with the specified product ID. It joins the `stores` table
 * to include the store name in the result.
 *
 * @param id - The ID of the product for which to retrieve listings.
 * @returns A promise that resolves to the product listings, including store name.
 */
export const getProductListingsByProductId = (id: number) => {
	// TODO: Join stores table to get store name
	return Effect.promise(() => {
		const query = database
			.select({
				id: productsListingsRepo.id,
				productId: productsListingsRepo.productId,
				name: productsListingsRepo.name,
				storeId: productsListingsRepo.storeId,
				storeName: storesRepo.name, // Include store name
				url: productsListingsRepo.url,
				price: productsListingsRepo.price,
				quantity: productsListingsRepo.quantity,
				unit: productsListingsRepo.unit,
				createdAt: productsListingsRepo.createdAt,
				updatedAt: productsListingsRepo.updatedAt,
			})
			.from(productsListingsRepo)
			.innerJoin(storesRepo, eq(productsListingsRepo.storeId, storesRepo.id))
			.where(eq(productsListingsRepo.productId, id));

		return query.execute();
	});
};

// Get a Product Listing by ID
export const getProductListingById = (id: number) => {
	return Effect.promise(() => {
		const query = database
			.select({
				id: productsListingsRepo.id,
				productId: productsListingsRepo.productId,
				name: productsListingsRepo.name,
				storeId: productsListingsRepo.storeId,
				storeName: storesRepo.name,
				storeLocation: storesRepo.location,
				url: productsListingsRepo.url,
				price: productsListingsRepo.price,
				quantity: productsListingsRepo.quantity,
				unit: productsListingsRepo.unit,
				createdAt: productsListingsRepo.createdAt,
				updatedAt: productsListingsRepo.updatedAt,
			})
			.from(productsListingsRepo)
			.innerJoin(storesRepo, eq(productsListingsRepo.storeId, storesRepo.id))
			.where(eq(productsListingsRepo.id, id));

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

export const updateProductListingById = (
	productListing: Partial<InsertProductListing>,
) => {
	return Effect.promise(() => {
		const query = database
			.update(productsListingsRepo)
			.set(productListing)
			.where(eq(productsListingsRepo.id, productListing.id as number))
			.returning();

		return query.execute();
	});
};

export const deleteProductListingById = (id: number) => {
	return Effect.promise(() => {
		const query = database
			.delete(productsListingsRepo)
			.where(eq(productsListingsRepo.id, id));

		return query.execute();
	});
};

export const deleteAllProductListings = () => {
	return Effect.promise(() => {
		const query = database.delete(productsListingsRepo);

		return query.execute();
	});
};
