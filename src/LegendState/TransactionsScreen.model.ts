import { db as database } from "@/db/client";
import {
	transactions as transactionsRepo,
	categories as categoriesRepo,
	type SelectTransaction,
} from "@/db/schema";
import { computed, observable } from "@legendapp/state";
import dayjs from "dayjs";
import { and, between, eq, sql, sum } from "drizzle-orm";

export interface TransactionItem extends SelectTransaction {
	category_name: string;
	category_icon: string;
	category_color: string;
	category_type: string;
}

interface TransactionGroup {
	transaction_time: string;
	transactions: TransactionItem[];
	total: number;
}

export type FlashListTransactionsList =
	| {
			transaction: TransactionItem;
	  }
	| {
			transaction_time: string;
			total: string;
	  };

export type DurationOptions =
	| "today"
	| "this week"
	| "this month"
	| "this year"
	| "all time";

interface InsightOptions {
	timeFrame: DurationOptions;
	// insightsType: "totalIncome" | "totalExpense" | "netTotal";
}

export class TransactionsScreenModel {
	obs;
	transactions;
	constructor() {
		this.obs = observable<{
			duration: DurationOptions;
			insights: {
				totalIncome: number;
				totalExpense: number;
				netTotal: number;
			};
		}>({
			duration: "this month",
			insights: {
				totalIncome: 0,
				totalExpense: 0,
				netTotal: 0,
			},
		});
		this.transactions = observable<TransactionGroup[]>([]);
	}

	onMount = () => {
		this.startLiseners();
		this.transactionsList();
		this.calculateInsights({
			timeFrame: this.obs.duration.peek(),
		});
	};

	startLiseners = () => {
		this.obs.duration.onChange((duration) => {
			this.calculateInsights({
				timeFrame: duration.value,
			});
		});
	};

	calculateInsights = async ({ timeFrame }: InsightOptions) => {
		let startDate: string;
		let endDate: string;
		switch (timeFrame) {
			case "today":
				startDate = dayjs().startOf("day").format();
				endDate = dayjs().endOf("day").format();
				break;
			case "this week":
				startDate = dayjs().startOf("week").format();
				endDate = dayjs().endOf("week").format();
				break;
			case "this month":
				startDate = dayjs().startOf("month").format();
				endDate = dayjs().endOf("month").format();
				break;
			case "this year":
				startDate = dayjs().startOf("year").format();
				endDate = dayjs().endOf("year").format();
				break;
			case "all time":
				startDate = dayjs("1970-01-01").format();
				endDate = dayjs().format();
		}

		const totalExpense = await database
			.select({
				total: sum(transactionsRepo.amount),
			})
			.from(transactionsRepo)
			.where(
				and(
					between(
						transactionsRepo.transactionTime,
						new Date(startDate),
						new Date(endDate),
					),
					eq(transactionsRepo.transactionType, "Expense"),
				),
			);

		const totalIncome = await database
			.select({
				total: sum(transactionsRepo.amount),
			})
			.from(transactionsRepo)
			.where(
				and(
					between(
						transactionsRepo.transactionTime,
						new Date(startDate),
						new Date(endDate),
					),
					eq(transactionsRepo.transactionType, "Income"),
				),
			);

		const incomeParsed = Number(totalIncome?.[0]?.total) ?? 0;
		const expenseParsed = Number(totalExpense?.[0]?.total) ?? 0;
		this.obs.insights.set({
			totalIncome: incomeParsed,
			totalExpense: expenseParsed,
			netTotal: incomeParsed - expenseParsed,
		});
	};

	/**
	 * Fetches a list of transactions grouped by transaction date, including the total balance for each date.
	 * The transactions are retrieved from the database and formatted as an array of objects, where each object contains:
	 * - `transaction_time`: The date of the transaction.
	 * - `transactions`: An array of transaction objects, each with the following properties:
	 *   - `amount`: The transaction amount.
	 *   - `note`: The note associated with the transaction.
	 *   - `transaction_time`: The timestamp of the transaction.
	 *   - `category_id`: The ID of the category associated with the transaction.
	 *   - `category_name`: The name of the category.
	 *   - `category_icon`: The icon representing the category.
	 *   - `category_color`: The color associated with the category.
	 *   - `category_type`: The type of the category (e.g., 'Income' or 'Expense').
	 * - `total`: The total balance for the transactions on the given date.
	 */
	transactionsList = async () => {
		const groupedTransactions = await database
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
			.from(transactionsRepo)
			/**
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

		/**
		 * Maps the grouped transactions to an array of objects with the following properties:
		 * - `transaction_time`: the timestamp of the transaction
		 * - `transactions`: the parsed JSON transactions
		 * - `total`: the total amount of the transactions
		 */
		const parsedTransactions = groupedTransactions.map((transaction) => {
			return {
				transaction_time: transaction.transaction_time,
				transactions: JSON.parse(transaction.transactions),
				total: transaction.total as unknown as number,
			};
		});
		this.transactions.set(parsedTransactions);

		// Get transactions group by date
		// Query to get transactions json like this
		// [
		//   {
		//     "transaction_time": "2021-11-10",
		//     "transactions": [
		//       {
		//         "id": "1",
		//         "amount": "1000",
		//         "transaction_time": "2021-11-10",
		//         "transaction_type": "expense",
		//         "transaction_category": "food",
		//         "transaction_note": "test",
		//       }
		//     ]
		// ]
		// const transactions = await this.database.collections
		//   .get("transactions")
		//   .query(
		//     Q.unsafeSqlQuery(
		//       `select strftime('%d-%m-%Y', transaction_time, 'unixepoch') as transaction_day, json_group_array(json_object('amount', amount, 'note', note, 'transaction_time', transaction_time, 'category_id', category_id, 'category_name', categories.name, 'category_icon', categories.icon, 'category_color', categories.color)) as transactions_list from transactions inner join categories on transactions.category_id = categories.id group by strftime('%d-%m-%Y', transaction_time, 'unixepoch') order by transaction_time desc`
		//     )
		//   )
		//   .unsafeFetchRaw();
		// console.log({ transactions: transactions });
		// return transactions;
	};

	/**
	 * Computes a grouped list of transactions, with each group containing the transaction date and the total amount of transactions for that date, followed by the individual transactions.
	 *
	 * The date is displayed as "Today", "Yesterday", "Tomorrow", or the formatted date (e.g. "01 January 2023") depending on the transaction date.
	 *
	 * @returns {FlashListTransactionsList[]} - A list of transaction groups, where each group contains the date and total, followed by the individual transactions.
	 */
	groupedTransactions = computed(() => {
		const transactionsGroup = this.transactions.get();

		// Get Transaction Date and Transactions as item in array
		const transactionsResult: FlashListTransactionsList[] = [];
		/**
		 * 1. Loop through the transactions group
		 * 2. Push the transaction date and total to the transactionsResult
		 * 3. Loop through the transactions and push them to the transactionsResult
		 */
		for (const transactionGroupItem of transactionsGroup) {
			/**
			 * 1. If the transaction date is today, display "Today"
			 * 2. If the transaction date is yesterday, display "Yesterday"
			 * 3. If the transaction date is tomorrow, display "Tomorrow"
			 * 4. If the transaction date is not today, yesterday, or tomorrow, display the formatted date
			 */
			const transaction_time = transactionGroupItem.transaction_time;
			const parsedTransactionTime = dayjs(transaction_time, "DD-MM-YYYY");
			const isToday = parsedTransactionTime.isToday();
			const isYesterday = parsedTransactionTime.isYesterday();
			const isTomorrow = parsedTransactionTime.isTomorrow();
			const formattedDate = parsedTransactionTime.format("DD MMMM YYYY");

			let displayDate = formattedDate;
			if (isToday) displayDate = "Today";
			else if (isYesterday) displayDate = "Yesterday";
			else if (isTomorrow) displayDate = "Tomorrow";

			transactionsResult.push({
				transaction_time: displayDate,
				total: transactionGroupItem.total.toFixed(2),
			});
			for (const transaction of transactionGroupItem.transactions) {
				transactionsResult.push({
					transaction,
				});
			}
		}
		return transactionsResult;
	});

	onDurationChange = (duration: DurationOptions) => {
		this.obs.duration.set(duration);
		this.calculateInsights({ timeFrame: duration });
	};
}
