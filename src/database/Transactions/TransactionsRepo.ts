import { db as database } from "@/db/client";
import {
	categories as categoriesRepo,
	transactions as transactionsRepo,
} from "@/db/schema";
import dayjs from "dayjs";
import { and, between, eq, isNull, sql, sum } from "drizzle-orm";
import { Effect } from "effect";

export const getTransactions = ({
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
				/**
				 * Formats the `transaction_time` from UNIX epoch to a string in the format 'DD-MM-YYYY'.
				 * This formatted date is aliased as `transaction_day` in the resulting SQL query.
				 */
				transaction_time: sql<string>`strftime('%d-%m-%Y', transaction_time, 'localtime') as transaction_day`,
				transactions: sql<string>`json_group_array(json_object('id', coinx_transaction.id, 'amount', amount, 'note', note, 'transactionTime', transaction_time, 'transactionType', transaction_type, 'category_id', category_id, 'category_name', coinx_category.name, 'category_icon', coinx_category.icon, 'category_color', coinx_category.color, 'category_type', coinx_category.type)) as transactions_list`,
				/**
				 * This SQL query calculates the total balance for each grouped transaction date.
				 * It sums up all amounts, treating 'Income' type transactions as positive and
				 * 'Expense' type transactions as negative.
				 */
				total: sql<string>`sum(case when transaction_type = 'Income' then amount else -amount end) as total`,
			})
			.from(transactionsRepo) /**
			 * Performs an inner join on the `categoriesRepo` table using the `categoryId` from the `transactionsRepo`.
			 * This join is essential to combine and access category details related to each transaction.
			 */
			.innerJoin(
				categoriesRepo,
				eq(transactionsRepo.categoryId, categoriesRepo.id),
			)
			/**
			 * Groups the transactions by the transaction date.
			 */
			.groupBy(sql<string>`strftime('%d-%m-%Y', transaction_time, 'localtime')`)
			/**
			 * Orders the transactions by the transaction date in descending order.
			 */
			.orderBy(sql<string>`transaction_time desc`);

		const whereQueries = [];

		// Always exclude soft-deleted records
		whereQueries.push(isNull(transactionsRepo.deletedAt));

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
			whereQueries.push(eq(transactionsRepo.transactionType, transactionType));
		}

		if (categoryId) {
			whereQueries.push(eq(transactionsRepo.categoryId, categoryId));
		}

		query.where(and(...whereQueries));

		const groupedTransactions = query.execute();
		return groupedTransactions;
	});

export const getInsights = ({
	startDate,
	endDate,
	transactionType,
}: {
	startDate?: string;
	endDate?: string;
	transactionType: "Income" | "Expense";
}) =>
	Effect.promise(() => {
		const totalQuery = database
			.select({
				total: sum(transactionsRepo.amount),
			})
			.from(transactionsRepo)
			.where(
				and(
					isNull(transactionsRepo.deletedAt),
					startDate && endDate
						? between(
								transactionsRepo.transactionTime,
								new Date(startDate).toISOString(),
								new Date(endDate).toISOString(),
							)
						: undefined,
					eq(transactionsRepo.transactionType, transactionType),
				),
			);

		const totalQueryPromise = totalQuery.execute();

		return totalQueryPromise;
	});
