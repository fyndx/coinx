import { database } from "../database/WaterMelon";
import { CategoryModel } from "./Category.model";
import { TransactionModel } from "./Transaction.model";

export const rootStore = {
  categoryModel: new CategoryModel(database),
  transactionModel: new TransactionModel(database),
};
