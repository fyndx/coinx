import type { InsertTransaction } from "@/db/schema";
import { generateUUID } from "@/src/utils/uuid";
import { faker } from "@faker-js/faker";

// Pre-generated category UUIDs for seeding (these would need to match actual seeded categories)
// In production, fetch actual category IDs from the database
const SEED_CATEGORY_IDS: string[] = [];

const generateRandomTransaction = (categoryIds: string[]): Omit<InsertTransaction, "id"> => {
	return {
		amount: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
		transactionTime: faker.date.recent({ days: 90 }).toISOString(),
		categoryId: faker.helpers.arrayElement(categoryIds),
		transactionType: faker.helpers.arrayElement(["Income", "Expense"]),
		syncStatus: "pending",
	};
};

export const generateRandomTransactions = (
	count: number,
	categoryIds?: string[],
): Omit<InsertTransaction, "id">[] => {
	// Use provided category IDs or generate placeholder UUIDs
	const ids = categoryIds?.length ? categoryIds : Array.from({ length: 5 }, () => generateUUID());
	return Array.from({ length: count }).map(() => generateRandomTransaction(ids));
};
