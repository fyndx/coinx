import {
	getInsights,
	getTransactions,
} from "@/src/database/Transactions/TransactionsRepo";
import {
	computed,
	observable,
	beginBatch,
	endBatch,
	type ObservableListenerDispose,
} from "@legendapp/state";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { Effect } from "effect";
import type {
	FlashListTransactionsList,
	TransactionGroup,
} from "@/src/LegendState/TransactionsScreen.model";
import { dayjsRange } from "@/src/utils/date";
import { getCategories } from "@/src/database/Categories/CategoriesRepo";

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
	categories: {
		id: number;
		name: string;
		icon: string;
		type: "Income" | "Expense";
		total: number;
		color: string;
	}[];
	categoryId?: number;
}

export class InsightsModel {
	obs;
	listeners: ObservableListenerDispose[] = [];
	constructor() {
		this.obs = observable<InsightsObservable>({
			durationType: "month",
			duration: {
				startTime: dayjs().startOf("month").format(),
				endTime: dayjs().endOf("month").format(),
			},
			transactions: [],
			categories: [],
			insights: {
				totalIncome: 0,
				totalExpense: 0,
				netTotal: 0,
			},
			categoryId: undefined,
		});
	}

	private onDurationTypeChange = () => {
		const durationType = this.obs.durationType.peek();

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
	};

	private onDurationChange = () => {
		this.getTransactionsList();
		this.getCategoriesList();
		this.getTransactionInsights();
	};

	onMount = () => {
		// Load the transactions and insights on mount
		this.getTransactionsList();
		this.getCategoriesList();
		this.getTransactionInsights();

		this.startListeners();
	};

	onUnmount = () => {
		this.stopListeners();
	};

	startListeners = () => {
		const durationTypeChangeListener = this.obs.durationType.onChange(
			this.onDurationTypeChange,
		);

		const durationChangeListener = this.obs.duration.onChange(
			this.onDurationChange,
		);

		this.listeners.push(durationTypeChangeListener, durationChangeListener);
	};

	stopListeners = () => {
		while (this.listeners.length > 0) {
			const disposer = this.listeners.pop();
			disposer?.();
		}
	};

	private getTransactionsList = async () => {
		const { startTime, endTime } = this.obs.duration.peek();
		console.log({ startTime, endTime }, "getTransactionsList");
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

	private getCategoriesList = async () => {
		const { startTime, endTime } = this.obs.duration.peek();

		const categories = await Effect.runPromise(
			getCategories({
				startDate: startTime,
				endDate: endTime,
			}),
		);
		this.obs.categories.set(categories);
		console.log({ categories });
	};

	private getTransactionInsights = async () => {
		const { startTime, endTime } = this.obs.duration.peek();
		console.log({ startTime, endTime }, "getTransactionInsights");

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

	private onSwipe = (direction: "left" | "right") => {
		const durationType = this.obs.durationType.peek();
		const startDate = this.obs.duration.startTime.peek();
		const endDate = this.obs.duration.endTime.peek();

		if (direction === "left") {
			this.obs.duration.set({
				startTime: dayjs(startDate).subtract(1, durationType).format(),
				endTime: dayjs(endDate).subtract(1, durationType).format(),
			});
		}
		if (direction === "right") {
			this.obs.duration.set({
				startTime: dayjs(startDate).add(1, durationType).format(),
				endTime: dayjs(endDate).add(1, durationType).format(),
			});
		}
	};

	groupedTransactions = computed(() => {
		const transactionsGroup = this.obs.transactions.get(true);

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
		const durationType = this.obs.durationType.get();

		let durationText: string;
		let spentPerDuration: number;
		let spentDurationHeading: string;

		switch (durationType) {
			case "week":
				durationText = `${dayjs(startDate).format("D MMM")} - ${dayjs(
					endDate,
				).format("D MMM")}`;
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
			spentPerDuration: spentPerDuration.toFixed(2),
			spentDurationHeading,
			netTotal: this.obs.insights.netTotal.get(),
		};
	});

	durationGraphData = computed(() => {
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
				day: date.format(durationType === "year" ? "MMM" : "D"),
				total: Math.abs(transactionsForTheDay?.total ?? 0),
			};
		});

		return finalTransactionsList;
	});

	categoriesGraphData = computed(() => {
		const categories = this.obs.categories.get(true);

		const totalAmount = categories.reduce(
			(sum, category) => sum + category.total,
			0,
		);

		const categoriesWithPercentage = categories.map((category) => {
			const percentage = (category.total / totalAmount) * 100;
			return {
				...category,
				percentage: Number.parseFloat(percentage.toFixed(2)),
			};
		});

		return categoriesWithPercentage;
	});

	swipeData = computed(() => {
		const durationType = this.obs.durationType.get();
		const startDate = this.obs.duration.startTime.get();
		const endDate = this.obs.duration.endTime.get();

		const prevStartDate = dayjs(startDate).subtract(1, durationType);
		const prevEndDate = dayjs(endDate).subtract(1, durationType);

		const nextStartDate = dayjs(startDate).add(1, durationType);
		const nextEndDate = dayjs(endDate).add(1, durationType);

		return {
			prevStartDate: prevStartDate.format(
				durationType === "week"
					? "DD MMM"
					: durationType === "month"
						? "MMM YY"
						: "YYYY",
			),
			prevEndDate: prevEndDate.format(
				durationType === "week"
					? "DD MMM"
					: durationType === "month"
						? "MMM YY"
						: "YYYY",
			),
			nextStartDate: nextStartDate.format(
				durationType === "week"
					? "DD MMM"
					: durationType === "month"
						? "MMM YY"
						: "YYYY",
			),
			nextEndDate: nextEndDate.format(
				durationType === "week"
					? "DD MMM"
					: durationType === "month"
						? "MMM YY"
						: "YYYY",
			),
		};
	});

	actions = {
		setDurationType: ({
			durationType,
		}: { durationType: InsightsDurationType }) => {
			this.obs.durationType.set(durationType);
		},
		onSwipe: this.onSwipe,
	};
}
