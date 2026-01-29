import { db as database } from "@/db/client";
import { type InsertProduct, products as productsRepo } from "@/db/schema";
import { generateUUID } from "@/src/utils/uuid";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, pipe } from "effect";
import { InvalidIdError } from "../Stores/StoresErrors";

export const getProducts = () => {
	return Effect.promise(() => {
		const query = database
			.select()
			.from(productsRepo)
			.where(isNull(productsRepo.deletedAt));

		return query.execute();
	});
};

export const findProductById = ({ id }: { id: string }) => {
	return Effect.promise(() => {
		const query = database
			.select({
				id: productsRepo.id,
				name: productsRepo.name,
				defaultUnitCategory: productsRepo.defaultUnitCategory,
			})
			.from(productsRepo)
			.where(and(eq(productsRepo.id, id), isNull(productsRepo.deletedAt)));

		return query.execute();
	});
};

export const findProductByName = ({ name }: { name: string }) => {
	return Effect.promise(() => {
		const query = database
			.select({
				id: productsRepo.id,
				name: productsRepo.name,
				defaultUnitCategory: productsRepo.defaultUnitCategory,
			})
			.from(productsRepo)
			.where(and(eq(productsRepo.name, name), isNull(productsRepo.deletedAt)));

		return query.execute();
	});
};

export const addProduct = ({ name, defaultUnitCategory }: Omit<InsertProduct, "id">) => {
	return Effect.promise(() => {
		const query = database
			.insert(productsRepo)
			.values({
				id: generateUUID(),
				name,
				defaultUnitCategory,
				syncStatus: "pending",
			})
			.returning();

		return query.execute();
	});
};

export const updateProduct = (product: InsertProduct) => {
	return pipe(
		Effect.succeed(product),
		Effect.filterOrFail(
			(val) => val.id !== undefined && val.id.length > 0,
			() => new InvalidIdError({ message: "Invalid Product ID" }),
		),
		Effect.flatMap((validatedProduct) => {
			const { id, name, defaultUnitCategory, notes, image } = validatedProduct;
			return Effect.tryPromise(() => {
				const query = database
					.update(productsRepo)
					.set({
						name,
						defaultUnitCategory,
						notes,
						image,
						updatedAt: new Date().toISOString(),
						syncStatus: "pending",
					})
					.where(eq(productsRepo.id, id as string))
					.returning();

				return query.execute();
			});
		}),
		// Log Errors
		Effect.tapError((error) => {
			return Effect.sync(() => {
				console.error("Failed to update product:", error);
			});
		}),
	);
};

export const deleteProduct = ({ id }: { id: string }) => {
	return Effect.promise(() => {
		const query = database
			.update(productsRepo)
			.set({
				deletedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				syncStatus: "pending",
			})
			.where(eq(productsRepo.id, id))
			.returning();

		return query.execute();
	});
};

export const deleteAllProducts = () => {
	return Effect.promise(() => {
		const query = database
			.update(productsRepo)
			.set({
				deletedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				syncStatus: "pending",
			});

		return query.execute();
	});
};
