import { database } from "../database/WaterMelon";
import { CategoryModel } from "./Category.model";
import { TransactionModel } from "./Transaction.model";
import { TransactionsScreenModel } from "./TransactionsScreen.model";

export const rootStore = {
  // Database
  categoryModel: new CategoryModel(database),
  transactionModel: new TransactionModel(database),
  // Screens
  transactionsScreenModel: new TransactionsScreenModel(database),
};
