import { Effect } from "effect";
import { db as database } from "@/db/client";
import {
	transactions as transactionsRepo,
	categories as categoriesRepo,
} from "@/db/schema";
import { and, between, desc, eq, isNull, sql, sum } from "drizzle-orm";

export const getCategories = ({
	startDate,
	endDate,
	transactionType,
	categoryId,
}: {
	startDate?: string;
	endDate?: string;
	transactionType?: "Income" | "Expense";
	categoryId?: string; // UUID
}) =>
	Effect.promise(() => {
		const query = database
			.select({
				id: categoriesRepo.id,
				name: categoriesRepo.name,
				icon: categoriesRepo.icon,
				color: categoriesRepo.color,
				type: categoriesRepo.type,

				total: sum(transactionsRepo.amount).mapWith(Number),
			})
			.from(categoriesRepo)
			.leftJoin(
				transactionsRepo,
				eq(categoriesRepo.id, transactionsRepo.categoryId),
			)
			.groupBy(categoriesRepo.id)
			.orderBy(({ total }) => {
				return desc(total);
			});

		const whereQueries = [];

		// Always exclude soft-deleted records
		whereQueries.push(isNull(categoriesRepo.deletedAt));

		if (startDate && endDate) {
			whereQueries.push(
				between(
					transactionsRepo.transactionTime,
					new Date(startDate).toISOString(),
					new Date(endDate).toISOString(),
				),
			);
		}

		if (transactionType) {
			whereQueries.push(eq(categoriesRepo.type, transactionType));
		}

		if (categoryId) {
			whereQueries.push(eq(categoriesRepo.id, categoryId));
		}

		query.where(and(...whereQueries));

		return query.execute();
	});
