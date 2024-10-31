import type { InsertProductListing } from "@/db/schema";
import { faker } from "@faker-js/faker";

const generateRandomProductListing = ({
	productIds,
}: { productIds: [] }): InsertProductListing => {
	return {
		productId: faker.helpers.arrayElement(productIds),
		price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
		quantity: faker.number.float({ min: 1, max: 10, fractionDigits: 2 }),
		// TODO: Calculate pricePerUnit based on price and quantity
		pricePerUnit: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
		brand: faker.helpers.arrayElement(["Apple", "Samsung", "OnePlus"]),
		store: faker.helpers.arrayElement(["Amazon", "Flipkart", "Myntra"]),
	};
};

export const generateRandomProductListings = (
	count: number,
	{ productIds }: { productIds: [] },
): InsertProductListing[] => {
	return Array.from({ length: count }).map(() =>
		generateRandomProductListing({ productIds }),
	);
};
