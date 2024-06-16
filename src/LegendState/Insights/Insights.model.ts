import {
	getInsights,
	getTransactions,
} from "@/src/database/Transactions/TransactionsRepo";
import { computed, observable } from "@legendapp/state";
import dayjs, { Dayjs } from "dayjs";
import { Effect } from "effect";
import type {
	FlashListTransactionsList,
	TransactionGroup,
} from "@/src/LegendState/TransactionsScreen.model";
import { dayjsRange } from "@/src/utils/date";

type InsightsDurationType = "week" | "month" | "year";

interface InsightsObservable {
	durationType: InsightsDurationType;
	duration: {
		startTime: string;
		endTime: string;
	};
	transactions: TransactionGroup[];
	insights: {
		totalIncome: number;
		totalExpense: number;
		netTotal: number;
	};
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
			insights: {
				totalIncome: 0,
				totalExpense: 0,
				netTotal: 0,
			},
		});
	}

	onDurationChange = ({
		durationType,
	}: { durationType: InsightsDurationType }) => {
		this.obs.durationType.set(durationType);
		let startTime: string;
		let endTime: string;
		switch (durationType) {
			case "month":
				startTime = dayjs().startOf("month").format();
				endTime = dayjs().endOf("month").format();
				break;

			case "week":
				startTime = dayjs().startOf("week").format();
				endTime = dayjs().endOf("week").format();
				break;

			case "year":
				startTime = dayjs().startOf("year").format();
				endTime = dayjs().endOf("year").format();
				break;
		}
		this.obs.duration.set({
			startTime,
			endTime,
		});
		this.getTransactonsList();
		this.getTransactionInsights();
	};

	onMount = () => {
		this.getTransactonsList();
		this.getTransactionInsights();
	};

	getTransactonsList = async () => {
		const { startTime, endTime } = this.obs.duration.peek();
		const groupedTransactions = await Effect.runPromise(
			getTransactions({
				startDate: startTime,
				endDate: endTime,
				transactionType: "Expense",
			}),
		);

		const parsedTransactions = groupedTransactions.map((transaction) => {
			return {
				transaction_time: transaction.transaction_time,
				transactions: JSON.parse(transaction.transactions),
				total: transaction.total as unknown as number,
			};
		});

		this.obs.transactions.set(parsedTransactions);
	};

	getTransactionInsights = async () => {
		const { startTime, endTime } = this.obs.duration.peek();

		const totalExpenseResult = await Effect.runPromise(
			getInsights({
				startDate: startTime,
				endDate: endTime,
				transactionType: "Expense",
			}),
		);
		const totalIncomeResult = await Effect.runPromise(
			getInsights({
				startDate: startTime,
				endDate: endTime,
				transactionType: "Income",
			}),
		);

		const incomeParsed = Number(totalIncomeResult?.[0]?.total) ?? 0;
		const expenseParsed = Number(totalExpenseResult?.[0]?.total) ?? 0;

		this.obs.insights.set({
			totalIncome: incomeParsed,
			totalExpense: expenseParsed,
			netTotal: incomeParsed - expenseParsed,
		});
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

	insightsData = computed(() => {
		const startDate = this.obs.duration.startTime.get();
		const endDate = this.obs.duration.endTime.get();
		const totalExpense = this.obs.insights.totalExpense.get();
		const durationType = this.obs.durationType.peek();

		let durationText: string;
		let spentPerDuration: number;
		let spentDurationHeading: string;

		switch (durationType) {
			case "week":
				durationText = `${dayjs(startDate).format("D MMM")} - ${dayjs(
					endDate,
				).format("d MMM")}`;
				spentPerDuration = totalExpense / 7;
				spentDurationHeading = "SPENT/DAY";
				break;
			case "month":
				durationText = `${dayjs(startDate).format("MMM YYYY")}`;
				spentPerDuration = totalExpense / dayjs(startDate).daysInMonth();
				spentDurationHeading = "SPENT/DAY";
				break;

			case "year":
				durationText = `${dayjs(startDate).format("YYYY")}`;
				spentPerDuration = totalExpense / 12;
				spentDurationHeading = "SPENT/MONTH";
				break;
		}

		return {
			durationText,
			spentPerDuration,
			spentDurationHeading,
			netTotal: this.obs.insights.netTotal.get(),
		};
	});

	graphData = computed(() => {
		const durationType = this.obs.durationType.get();
		const startDate = this.obs.duration.startTime.get();
		const endDate = this.obs.duration.endTime.get();
		const transactions = this.obs.transactions.get(true);

		console.log({ transactions });

		let durationList: Dayjs[];

		switch (durationType) {
			case "week":
				durationList = dayjsRange({
					start: dayjs(startDate),
					end: dayjs(endDate),
					unit: "days",
				});
				break;

			case "month":
				durationList = dayjsRange({
					start: dayjs(startDate),
					end: dayjs(endDate),
					unit: "days",
				});

				break;
			case "year":
				durationList = dayjsRange({
					start: dayjs(startDate),
					end: dayjs(endDate),
					unit: "months",
				});
				break;
		}

		const finalTransactionsList = durationList.map((date, index) => {
			const day = date.format("DD-MM-YYYY");
			const transactionsForTheDay = transactions.find((transaction) => {
				return transaction.transaction_time === day;
			});

			return {
				day: day,
				total: Math.abs(transactionsForTheDay?.total ?? 0),
			};
		});

		return finalTransactionsList;
	});
}
