import type { InsertProduct } from "@/db/schema";
import { faker } from "@faker-js/faker";

const UNIT_CATEGORIES = ["weight", "volume", "quantity"];

const PRODUCT_NAMES = [
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
];

const generateRandomProduct = (): InsertProduct => {
	return {
		name: faker.helpers.arrayElement(PRODUCT_NAMES),
		defaultUnitCategory: faker.helpers.arrayElement(UNIT_CATEGORIES),
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
