import { getTransactions } from "@/src/database/Transactions/TransactionsRepo";
import { computed, observable } from "@legendapp/state";
import dayjs from "dayjs";
import { Effect } from "effect";
import type {
	FlashListTransactionsList,
	TransactionGroup,
} from "@/src/LegendState/TransactionsScreen.model";

type InsightsDurationType = "week" | "month" | "year";

interface InsightsObservable {
	durationType: InsightsDurationType;
	duration: {
		startTime: string;
		endTime: string;
	};
	transactions: TransactionGroup[];
}

export class InsightsModel {
	obs;
	constructor() {
		this.obs = observable<InsightsObservable>({
			durationType: "month",
			duration: {
				startTime: dayjs().startOf("month").format(),
				endTime: dayjs().endOf("month").format(),
			},
			transactions: [],
		});
	}

	onDurationChange = ({
		durationType,
	}: { durationType: InsightsDurationType }) => {
		this.obs.durationType.set(durationType);
	};

	getTransactonsList = async () => {
		const { startTime, endTime } = this.obs.duration.peek();
		const groupedTransactions = await Effect.runPromise(
			getTransactions({ startDate: startTime, endDate: endTime }),
		);

		const parsedTransactions = groupedTransactions.map((transaction) => {
			return {
				transaction_time: transaction.transaction_time,
				transactions: JSON.parse(transaction.transactions),
				total: transaction.total as unknown as number,
			};
		});

		this.obs.transactions.set(parsedTransactions);
		console.log({ groupedTransactions });
	};

	groupedTransactions = computed(() => {
		const transactionsGroup = this.obs.transactions.get();

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
}
