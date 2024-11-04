import { AddProductScreenModel } from "@/src/LegendState/AddProduct/AddProduct.model";
import { AppModel } from "@/src/LegendState/App.model";
import { CategoryModel } from "@/src/LegendState/Category.model";
import { InsightsModel } from "@/src/LegendState/Insights/Insights.model";
import { ProductsModel } from "@/src/LegendState/Products.model";
import { ProductsListingsModel } from "@/src/LegendState/ProductsListings.model";
import { TransactionModel } from "@/src/LegendState/Transaction.model";
import { TransactionsScreenModel } from "@/src/LegendState/TransactionsScreen.model";
import { AddProductDetailsModel } from "./AddProductDetails/AddProductDetails.model";

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
	addProductScreenModel: AddProductScreenModel;
	addProductDetailsModel: AddProductDetailsModel;

	constructor() {
		this.appModel = new AppModel();
		this.categoryModel = new CategoryModel();
		this.transactionModel = new TransactionModel();
		this.transactionsScreenModel = new TransactionsScreenModel();
		this.insightsModel = new InsightsModel();
		this.productsModel = new ProductsModel();
		this.productsListingsModel = new ProductsListingsModel();
		this.addProductScreenModel = new AddProductScreenModel();
		this.addProductDetailsModel = new AddProductDetailsModel();
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
