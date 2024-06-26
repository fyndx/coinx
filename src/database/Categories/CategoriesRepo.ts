import { Effect } from "effect";
import { db as database } from "@/db/client";
import {
	transactions as transactionsRepo,
	categories as categoriesRepo,
} from "@/db/schema";
import { and, between, desc, eq, sql, sum } from "drizzle-orm";

export const getCategories = ({
	startDate,
	endDate,
	transactionType,
	categoryId,
}: {
	startDate?: string;
	endDate?: string;
	transactionType?: "Income" | "Expense";
	categoryId?: number;
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

		if (startDate && endDate) {
			whereQueries.push(
				between(
					transactionsRepo.transactionTime,
					new Date(startDate),
					new Date(endDate),
				),
			);
		}

		if (transactionType) {
			whereQueries.push(eq(categoriesRepo.type, transactionType));
		}

		if (categoryId) {
			whereQueries.push(eq(categoriesRepo.id, categoryId));
		}

		if (whereQueries.length > 0) {
			query.where(and(...whereQueries));
		}

		return query.execute();
	});
