import { AppModel } from "./App.model";
import { CategoryModel } from "./Category.model";
import { InsightsModel } from "./Insights/Insights.model";
import { ProductsModel } from "./Products.model";
import { ProductsListingsModel } from "./ProductsListings.model";
import { TransactionModel } from "./Transaction.model";
import { TransactionsScreenModel } from "./TransactionsScreen.model";

class RootStore {
	// App State
	appModel: AppModel;
	// Database
	categoryModel: CategoryModel;
	transactionModel: TransactionModel;
	insightsModel: InsightsModel;
	productsModel: ProductsModel;
	productsListingsModel: ProductsListingsModel;
	// Screens
	transactionsScreenModel: TransactionsScreenModel;

	constructor() {
		this.appModel = new AppModel();
		this.categoryModel = new CategoryModel();
		this.transactionModel = new TransactionModel();
		this.transactionsScreenModel = new TransactionsScreenModel();
		this.insightsModel = new InsightsModel();
		this.productsModel = new ProductsModel();
		this.productsListingsModel = new ProductsListingsModel();
	}

	private startServices = async () => {
		await this.appModel.actions.startServices();
		const isFirstLaunch = await this.appModel.checkFirstLaunch();
		if (isFirstLaunch) {
			await this.categoryModel.createDefaultCategories();
		}
	};

	actions = {
		startServices: this.startServices,
	};
}

export const rootStore = new RootStore();
