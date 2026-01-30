import { db as database } from "@/db/client";
import {
	type InsertProductListing,
	product_listings as productsListingsRepo,
	products as productsRepo,
	stores as storesRepo,
} from "@/db/schema";
import { generateUUID } from "@/src/utils/uuid";
import { eq, and, isNull } from "drizzle-orm";
import { Effect } from "effect";

export const getProductsListings = () => {
	return Effect.promise(() => {
		const query = database
			.select()
			.from(productsListingsRepo)
			.where(isNull(productsListingsRepo.deletedAt));

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
export const getProductListingsByProductId = (id: string) => {
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
			.where(
				and(
					eq(productsListingsRepo.productId, id),
					isNull(productsListingsRepo.deletedAt),
					isNull(storesRepo.deletedAt),
				),
			);

		return query.execute();
	});
};

// Get a Product Listing by ID
export const getProductListingById = (id: string) => {
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
			.where(
				and(
					eq(productsListingsRepo.id, id),
					isNull(productsListingsRepo.deletedAt),
					isNull(storesRepo.deletedAt),
				),
			);

		return query.execute();
	});
};

export const addProductListing = (productListing: Omit<InsertProductListing, "id">) => {
	return Effect.promise(() => {
		const query = database
			.insert(productsListingsRepo)
			.values({
				...productListing,
				id: generateUUID(),
				syncStatus: "pending",
			})
			.returning();

		return query.execute();
	});
};

export const updateProductListingById = (
	productListing: Partial<InsertProductListing> & { id: string },
) => {
	return Effect.promise(() => {
		const { id, ...rest } = productListing;
		const query = database
			.update(productsListingsRepo)
			.set({
				...rest,
				updatedAt: new Date().toISOString(),
				syncStatus: "pending",
			})
			.where(eq(productsListingsRepo.id, id))
			.returning();

		return query.execute();
	});
};

export const deleteProductListingById = (id: string) => {
	return Effect.promise(() => {
		const query = database
			.update(productsListingsRepo)
			.set({
				deletedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				syncStatus: "pending",
			})
			.where(eq(productsListingsRepo.id, id));

		return query.execute();
	});
};

export const deleteAllProductListings = () => {
	return Effect.promise(() => {
		const query = database
			.update(productsListingsRepo)
			.set({
				deletedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				syncStatus: "pending",
			})
			.where(isNull(productsListingsRepo.deletedAt));

		return query.execute();
	});
};
