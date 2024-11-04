import type { InsertProductListing } from "@/db/schema";
import { faker } from "@faker-js/faker";

const generateRandomProductListing = ({
	productIds,
}: { productIds: number[] }): InsertProductListing => {
	const price = faker.number.float({ min: 10, max: 1000, fractionDigits: 2 });
	const quantity = faker.number.float({ min: 1, max: 10, fractionDigits: 2 });
	return {
		productId: faker.helpers.arrayElement(productIds),
		price: price,
		quantity: quantity,
		unit: faker.helpers.arrayElement(["kg", "g", "l", "ml", "unit"]),
		name: faker.helpers.arrayElement([
			"Apple 13 Pro",
			"Samsung Fold",
			"OnePlus 10",
		]),
		store: faker.helpers.arrayElement(["Amazon", "Flipkart", "Myntra"]),
	};
};

export const generateRandomProductListings = (
	count: number,
	{ productIds }: { productIds: number[] },
): InsertProductListing[] => {
	if (count <= 0) {
		throw new Error("Count must be positive");
	}
	if (productIds.length === 0) {
		throw new Error("ProductIds array cannot be empty");
	}
	return Array.from({ length: count }).map(() =>
		generateRandomProductListing({ productIds }),
	);
};
