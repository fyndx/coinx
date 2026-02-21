import type { InsertProductListing } from "@/db/schema";
import { faker } from "@faker-js/faker";

const generateRandomProductListing = ({
	productIds,
	storeIds,
}: { productIds: string[]; storeIds: string[] }): Omit<
	InsertProductListing,
	"id"
> => {
	const price = faker.number.float({ min: 10, max: 1000, fractionDigits: 2 });
	const quantity = faker.number.float({ min: 1, max: 10, fractionDigits: 2 });
	return {
		productId: faker.helpers.arrayElement(productIds),
		storeId: faker.helpers.arrayElement(storeIds),
		price: price,
		quantity: quantity,
		unit: faker.helpers.arrayElement(["kg", "g", "l", "ml", "unit"]),
		name: faker.helpers.arrayElement([
			"Apple 13 Pro",
			"Samsung Fold",
			"OnePlus 10",
		]),
		syncStatus: "pending",
	};
};

export const generateRandomProductListings = (
	count: number,
	{ productIds, storeIds }: { productIds: string[]; storeIds: string[] },
): Omit<InsertProductListing, "id">[] => {
	if (count <= 0) {
		throw new Error("Count must be positive");
	}
	if (productIds.length === 0) {
		throw new Error("ProductIds array cannot be empty");
	}
	if (storeIds.length === 0) {
		throw new Error("StoreIds array cannot be empty");
	}
	return Array.from({ length: count }).map(() =>
		generateRandomProductListing({ productIds, storeIds }),
	);
};
