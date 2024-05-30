import { observable } from "@legendapp/state";
import dayjs, { type Dayjs } from "dayjs";
import { db as database } from "@/db/client";
import { transactions as transactionsRepo } from "@/db/schema";
import { generateRandomTransactions } from "../database/TransactionSeeds";

export interface ITransactionDraft {
	amount: string;
	date: Dayjs;
	categoryId?: number;
	note?: string;
	transactionType: string;
}

export class TransactionModel {
	transaction;

	constructor() {
		this.transaction = observable<ITransactionDraft>({
			amount: "0",
			date: dayjs(),
			categoryId: undefined,
			note: "",
			transactionType: "",
		});
	}

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
	}: {
		amount: number;
		categoryId: number | undefined;
		note?: string | null;
		transactionTime: number;
		transactionType: string;
	}) {
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
		const { amount, date, categoryId, note, transactionType } =
			this.transaction.peek();
		const amountInNumber = Number.parseFloat(amount);
		const newTransaction = await this.createNewTransaction({
			amount: amountInNumber,
			categoryId,
			note,
			transactionTime: date.unix(),
			transactionType: transactionType,
		});
		return newTransaction;
	};

	deleteAllTransactions = async () => {
		// await this.database.write(async () => {
		// 	const transactions = await this.database
		// 		.get("transactions")
		// 		.query()
		// 		.fetch();
		// 	const transactionsToDelete = transactions.map((transaction) => {
		// 		return transaction.prepareDestroyPermanently();
		// 	});
		// 	await this.database.batch(transactionsToDelete);
		// });
	};

	createRandomTransactions = () => {
		const transactions = generateRandomTransactions(100);
		for (const transaction of transactions) {
			this.createNewTransaction({
				...transaction,
				// @ts-ignore
				transactionTime: transaction.transactionTime,
			});
		}
	};
}
