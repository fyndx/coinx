import { AppModel } from "./App.model";
import { CategoryModel } from "./Category.model";
import { TransactionModel } from "./Transaction.model";
import { TransactionsScreenModel } from "./TransactionsScreen.model";

class RootStore {
  // App State
  appModel: AppModel;
  // Database
  categoryModel: CategoryModel;
  transactionModel: TransactionModel;
  // Screens
  transactionsScreenModel: TransactionsScreenModel;

  constructor() {
    this.appModel = new AppModel();
    this.categoryModel = new CategoryModel();
    this.transactionModel = new TransactionModel();
    this.transactionsScreenModel = new TransactionsScreenModel();
  }

  private startServices = async () => {
    await this.appModel.actions.startServices();
    const isFirstLaunch = await this.appModel.checkFirstLaunch();
    if (isFirstLaunch) {
      await this.categoryModel.createDefaultCategories();
    }
  }

  actions = {
    startServices: this.startServices,
  }
}

export const rootStore = new RootStore();


