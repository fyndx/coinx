import type { InsertProduct } from "@/db/schema";
import { faker } from "@faker-js/faker";

const generateRandomProduct = (): InsertProduct => {
	return {
		name: faker.helpers.arrayElement([
			"Milk",
			"Tooth Paste",
			"Carrots",
			"Bread",
			"Butter",
			"Cheese",
			"Apples",
			"Bananas",
			"Oranges",
			"Pomagranate",
			"Curd",
		]),
		defaultUnitCategory: faker.helpers.arrayElement([
			"weight",
			"volume",
			"quantity",
		]),
	};
};

export const generateRandomProducts = ({
	count,
}: { count: number }): InsertProduct[] => {
	if (!Number.isInteger(count) || count < 0 || count > 1000) {
		throw new Error(
			"Count must be a positive integer less than or equal to 1000",
		);
	}
	return Array.from({ length: count }).map(() => generateRandomProduct());
};
