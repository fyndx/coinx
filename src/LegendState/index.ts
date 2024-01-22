import { CategoryModel } from "./Category.model";
import { TransactionModel } from "./Transaction.model";
import { TransactionsScreenModel } from "./TransactionsScreen.model";

export const rootStore = {
  // Database
  categoryModel: new CategoryModel(),
  transactionModel: new TransactionModel(),
  // Screens
  transactionsScreenModel: new TransactionsScreenModel(),
};
