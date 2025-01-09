import { db as database } from "@/db/client";
import {
	type InsertTransaction,
	transactions as transactionsRepo,
} from "@/db/schema";
import { dayjsInstance as dayjs } from "@/src/utils/date";
import { type ObservableListenerDispose, observable } from "@legendapp/state";
import type { Dayjs } from "dayjs";
import { eq } from "drizzle-orm";
import type { DateType } from "react-native-ui-datepicker";
import { generateRandomTransactions } from "../database/seeds/TransactionSeeds";
import type { CategoryModel } from "./Category.model";

export interface ITransactionDraft {
	id?: number;
	amount: string;
	date: DateType;
	categoryId?: number;
	categoryName?: string;
	note?: string;
	transactionType: "Expense" | "Income";
}

type UpdateTransaction = Required<Pick<InsertTransaction, "id">> &
	InsertTransaction;

export class TransactionModel {
	transaction;
	listeners: ObservableListenerDispose[] = [];

	constructor() {
		this.transaction = observable<ITransactionDraft>({
			amount: "0",
			date: new Date(),
			categoryId: undefined,
			categoryName: "",
			note: "",
			transactionType: "Expense",
		});
	}

	onMount = ({ categoryModel$ }: { categoryModel$: CategoryModel }) => {
		const transactionTypeListener = this.transaction.transactionType.onChange(
			({ value }) => {
				categoryModel$.getCategoriesList({
					type: value,
				});
			},
		);

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

	private async updateTransaction({
		id,
		amount,
		categoryId,
		note,
		transactionTime,
		transactionType,
	}: UpdateTransaction) {
		return await database
			.update(transactionsRepo)
			.set({
				amount,
				categoryId,
				note,
				transactionTime,
				transactionType,
			})
			.where(eq(transactionsRepo.id, id))
			.returning();
	}

	createTransaction = async () => {
		const {
			amount,
			date,
			categoryId,
			note,
			transactionType,
			categoryName,
			id,
		} = this.transaction.peek();
		const amountInNumber = Number.parseFloat(amount);

		// If the transaction has an id, it means it is an existing transaction that needs to be updated
		if (id) {
			await this.updateTransaction({
				amount: amountInNumber,
				categoryId,
				note: note,
				transactionTime: new Date(date).toISOString(),
				transactionType: transactionType,
				id,
			});
		} else {
			// Create a new transaction
			await this.createNewTransaction({
				amount: amountInNumber,
				categoryId,
				note: note?.length ? note : categoryName,
				transactionTime: new Date(date).toISOString(),
				transactionType: transactionType,
			});
		}
		// Reset the transaction to its initial state

		this.transaction.set({
			...this.transaction.peek(),
			amount: "0",
			date: new Date(),
			categoryId: undefined,
			categoryName: "",
			note: "",
			id: undefined,
		});
	};

	deleteTransaction = async (id: number) => {
		return await database
			.delete(transactionsRepo)
			.where(eq(transactionsRepo.id, id));
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
