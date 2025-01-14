import { db as database } from "@/db/client";
import { type InsertProduct, products as productsRepo } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Effect, pipe } from "effect";
import { InvalidIdError } from "../Stores/StoresErrors";

export const getProducts = () => {
	return Effect.promise(() => {
		const query = database.select().from(productsRepo);

		return query.execute();
	});
};

export const findProductById = ({ id }: { id: number }) => {
	return Effect.promise(() => {
		const query = database
			.select({
				id: productsRepo.id,
				name: productsRepo.name,
				defaultUnitCategory: productsRepo.defaultUnitCategory,
			})
			.from(productsRepo)
			.where(eq(productsRepo.id, id));

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
			.where(eq(productsRepo.name, name));

		return query.execute();
	});
};

export const addProduct = ({ name, defaultUnitCategory }: InsertProduct) => {
	// TODO: check if the product already exists by using name
	return Effect.promise(() => {
		const query = database
			.insert(productsRepo)
			.values({
				name,
				defaultUnitCategory,
			})
			.returning();

		return query.execute();
	});
};

export const updateProduct = (product: InsertProduct) => {
	return pipe(
		Effect.succeed(product),
		Effect.filterOrFail(
			(val) => val.id !== undefined && val.id > 0,
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
					})
					.where(eq(productsRepo.id, id as number))
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

export const deleteProduct = ({ id }: { id: number }) => {
	return Effect.promise(() => {
		const query = database
			.delete(productsRepo)
			.where(eq(productsRepo.id, id))
			.returning();

		return query.execute();
	});
};

export const deleteAllProducts = () => {
	return Effect.promise(() => {
		const query = database.delete(productsRepo);

		return query.execute();
	});
};
