import { db as database } from "@/db/client";
import {
	type InsertTransaction,
	transactions as transactionsRepo,
} from "@/db/schema";
import { dayjsInstance as dayjs } from "@/src/utils/date";
import { type ObservableListenerDispose, observable } from "@legendapp/state";
import type { Dayjs } from "dayjs";
import { generateRandomTransactions } from "../database/seeds/TransactionSeeds";
import type { CategoryModel } from "./Category.model";

export interface ITransactionDraft {
	amount: string;
	date: Dayjs;
	categoryId?: number;
	categoryName?: string;
	note?: string;
	transactionType: string;
	selectedTransactionType: "Expense" | "Income";
}

export class TransactionModel {
	transaction;
	listeners: ObservableListenerDispose[] = [];

	constructor() {
		this.transaction = observable<ITransactionDraft>({
			selectedTransactionType: "Expense",
			amount: "0",
			date: dayjs(),
			categoryId: undefined,
			categoryName: "",
			note: "",
			transactionType: "",
		});
	}

	onMount = ({ categoryModel$ }: { categoryModel$: CategoryModel }) => {
		const transactionTypeListener =
			this.transaction.selectedTransactionType.onChange(({ value }) => {
				categoryModel$.getCategoriesList({
					type: value,
				});
			});

		this.listeners.push(transactionTypeListener);
	};

	onUnmount = () => {
		while (this.listeners.length > 0) {
			const disposer = this.listeners.pop();
			disposer?.();
		}
	};

	setAmount = (text: string) => {
		const textString = text.toString();
		const amount = this.transaction.amount.peek();

		if (textString.includes(".")) {
			if (amount.includes(".")) {
				return;
				// biome-ignore lint/style/noUselessElse: <explanation>
			} else {
				this.transaction.amount.set((prev) => prev.concat(textString));
			}
		} else {
			if (amount === "0") {
				this.transaction.amount.set(textString);
			} else {
				this.transaction.amount.set((prev) => prev.concat(textString));
			}
		}
	};

	clear = () => {
		const amount = this.transaction.amount.peek();
		if (amount.length > 1) {
			this.transaction.amount.set(amount.slice(0, -1));
		} else {
			this.transaction.amount.set("0");
		}
	};

	private async createNewTransaction({
		amount,
		categoryId,
		note,
		transactionTime,
		transactionType,
	}: InsertTransaction) {
		return await database
			.insert(transactionsRepo)
			.values({
				// @ts-ignore
				amount: amount,
				categoryId,
				note,
				transactionTime,
				transactionType,
			})
			.returning();
	}

	createTransaction = async () => {
		const { amount, date, categoryId, note, transactionType, categoryName } =
			this.transaction.peek();
		const amountInNumber = Number.parseFloat(amount);
		const newTransaction = await this.createNewTransaction({
			amount: amountInNumber,
			categoryId,
			note: note?.length ? note : categoryName,
			transactionTime: date.toDate(),
			transactionType: transactionType,
		});
		// Reset the transaction
		this.transaction.set({
			amount: "0",
			date: dayjs(),
			categoryId: undefined,
			categoryName: "",
			note: "",
			transactionType: "",
			selectedTransactionType: this.transaction.selectedTransactionType.peek(),
		});
		return newTransaction;
	};

	/**
	 * Deletes all transactions from the database.
	 * @returns A promise that resolves when all transactions have been deleted.
	 */
	deleteAllTransactions = async () => {
		return await database.delete(transactionsRepo).returning();
	};

	createRandomTransactions = () => {
		const transactions = generateRandomTransactions(100);
		for (const transaction of transactions) {
			this.createNewTransaction({
				...transaction,
				transactionTime: transaction.transactionTime,
			});
		}
	};
}
