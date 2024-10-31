import { db as database } from "@/db/client";
import { type InsertProduct, products as productsRepo } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export const getProducts = ({}) => {
	return Effect.promise(() => {
		const query = database
			.select({
				id: productsRepo.id,
				name: productsRepo.name,
				defaultUnitCategory: productsRepo.defaultUnitCategory,
			})
			.from(productsRepo);

		return query.execute();
	});
};

export const addProduct = ({ name, defaultUnitCategory }: InsertProduct) => {
	return Effect.promise(() => {
		const query = database.insert(productsRepo).values({
			name,
			defaultUnitCategory,
		});

		return query.execute();
	});
};

export const deleteProduct = ({ id }: { id: number }) => {
	return Effect.promise(() => {
		const query = database.delete(productsRepo).where(eq(productsRepo.id, id));

		return query.execute();
	});
};

export const deleteAllProducts = () => {
	return Effect.promise(() => {
		const query = database.delete(productsRepo);

		return query.execute();
	});
};
