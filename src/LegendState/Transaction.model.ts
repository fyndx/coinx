import { observable } from "@legendapp/state";
import dayjs, { type Dayjs } from "dayjs";
import { db as database } from "@/db/client";
import { transactions as transactionsRepo } from "@/db/schema";

export interface ITransactionDraft {
	amount: string;
	date: Dayjs;
	categoryId?: number;
	note?: string;
}

export class TransactionModel {
	transaction;

	constructor() {
		this.transaction = observable<ITransactionDraft>({
			amount: "0",
			date: dayjs(),
			categoryId: undefined,
			note: "",
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

	createTransaction = async () => {
		const { amount, date, categoryId, note } = this.transaction.peek();
		const amountInNumber = Number.parseFloat(amount);
		const newTransaction = await database
			.insert(transactionsRepo)
			.values({
				// @ts-ignore
				amount: amountInNumber,
				categoryId,
				note,
				transactionTime: date.unix(),
			})
			.returning();
		return newTransaction;
	};

	get transactionsList() {
		// const transactions = this.database.collections.get("transactions").query();
		// return transactions;
	}

	transactionCount = async () => {
		// const transactions = await this.database
		// 	.get("transactions")
		// 	.query()
		// 	.fetchCount();
		// console.log({ transactions });
		// return transactions;
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
}
