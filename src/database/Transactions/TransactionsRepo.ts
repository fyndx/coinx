import { db as database } from "@/db/client";
import { between, eq, sql } from "drizzle-orm";
import { Effect } from "effect";
import {
	transactions as transactionsRepo,
	categories as categoriesRepo,
} from "@/db/schema";

export const getTransactions = ({
	startDate,
	endDate,
}: { startDate?: string; endDate?: string }) =>
	Effect.promise(() => {
		const query = database
			.select({
				/**
				 * Formats the `transaction_time` from UNIX epoch to a string in the format 'DD-MM-YYYY'.
				 * This formatted date is aliased as `transaction_day` in the resulting SQL query.
				 */
				transaction_time: sql<string>`strftime('%d-%m-%Y', transaction_time, 'unixepoch') as transaction_day`,
				transactions: sql<string>`json_group_array(json_object('amount', amount, 'note', note, 'transactionTime', transaction_time, 'transactionType', transaction_type, 'category_id', category_id, 'category_name', category.name, 'category_icon', category.icon, 'category_color', category.color, 'category_type', category.type)) as transactions_list`,
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
			.groupBy(sql<string>`strftime('%d-%m-%Y', transaction_time, 'unixepoch')`)
			/**
			 * Orders the transactions by the transaction date in descending order.
			 */
			.orderBy(sql<string>`transaction_time desc`);

		if (startDate && endDate) {
			query.where(
				between(
					transactionsRepo.transactionTime,
					new Date(startDate),
					new Date(endDate),
				),
			);
		}

		const groupedTransactions = query.execute();
		return groupedTransactions;
	});
