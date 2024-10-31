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
	return Array.from({ length: count }).map(() => generateRandomProduct());
};
