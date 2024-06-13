import type { InsertTransaction } from "@/db/schema";
import { faker } from "@faker-js/faker";

const generateRandomTransaction = (): InsertTransaction => {
	return {
		amount: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
		transactionTime: faker.date.recent({ days: 90 }),
		categoryId: faker.helpers.arrayElement([1, 2, 3, 4, 5]),
		transactionType: faker.helpers.arrayElement(["Income", "Expense"]),
	};
};

export const generateRandomTransactions = (
	count: number,
): InsertTransaction[] => {
	return Array.from({ length: count }).map(() => generateRandomTransaction());
};
