import { ObservableObject, observable } from "@legendapp/state";
import { Database } from "@nozbe/watermelondb";
import Transaction from "../model/Transaction";
import dayjs, { Dayjs } from "dayjs";
import Category from "../model/Category";

export class TransactionModel {
  obs: ObservableObject<{
    amount: string;
    date: Dayjs;
    category?: any;
    note: string;
  }>;

  constructor(private readonly database: Database) {
    this.database = database;
    this.obs = observable({
      amount: "0",
      date: dayjs(),
      category: undefined,
      note: "",
    });
  }

  setAmount = (text: string) => {
    const textString = text.toString();
    const amount = this.obs.amount.peek();

    if (textString.includes(".")) {
      if (amount.includes(".")) {
        return;
      } else {
        this.obs.amount.set((prev) => prev.concat(textString));
      }
    } else {
      if (amount === "0") {
        this.obs.amount.set(textString);
      } else {
        this.obs.amount.set((prev) => prev.concat(textString));
      }
    }
  };

  clear = () => {
    const amount = this.obs.amount.peek();
    if (amount.length > 1) {
      this.obs.amount.set(amount.slice(0, -1));
    } else {
      this.obs.amount.set("0");
    }
  };

  createTransaction = async () => {
    const transaction = await this.database.write(async () => {
      // const category = await this.database.collections
      //   .get<Category>("categories")
      //   .find(this.obs.category.peek().id);

      const newTransaction = await this.database
        .get<Transaction>("transactions")
        .create((transactionRecord) => {
          const rawNote = this.obs.note.peek();
          const note =
            rawNote.length > 0 ? rawNote : this.obs.category.name.peek();
          const transactionTime = this.obs.date.peek().unix();
          const amount = Number(this.obs.amount.peek());

          transactionRecord.transactionTime = transactionTime;
          transactionRecord.type = "expense";
          transactionRecord.amount = amount;
          transactionRecord.note = note;
          // transactionRecord.category.set(category);
          transactionRecord.category.id = this.obs.category.peek().id;
        });

      return newTransaction;
    });

    console.log({ transaction: transaction._raw });

    return transaction;
  };

  get transactionsList() {
    const transactions = this.database.collections.get("transactions").query();

    return transactions;
  }

  transactionCount = async () => {
    const transactions = await this.database
      .get("transactions")
      .query()
      .fetchCount();
    console.log({ transactions });
    return transactions;
  };

  deleteAllTransactions = async () => {
    await this.database.write(async () => {
      const transactions = await this.database
        .get("transactions")
        .query()
        .fetch();

      const transactionsToDelete = transactions.map((transaction) => {
        return transaction.prepareDestroyPermanently();
      });

      await this.database.batch(transactionsToDelete);
    });
  };
}
