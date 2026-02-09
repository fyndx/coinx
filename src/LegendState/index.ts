import { AddProductScreenModel } from "@/src/LegendState/AddProduct/AddProduct.model";
import { AddProductListingModel } from "@/src/LegendState/AddProductListing/AddProductListing.model";
import { appModel } from "@/src/LegendState/AppState/App.model";
import { authModel } from "@/src/LegendState/Auth/Auth.model";
import { CategoryModel } from "@/src/LegendState/Category.model";
import { EditProductListing } from "@/src/LegendState/EditProductListing/EditProductListing.model";
import { InsightsModel } from "@/src/LegendState/Insights/Insights.model";
import { ProductsListingHistoryModel } from "@/src/LegendState/ProductListingHistory/ProductListingHistory.model";
import { ProductsModel } from "@/src/LegendState/Products/Products.model";
import { ProductsListingsModel } from "@/src/LegendState/ProductsListings.model";
import { TransactionModel } from "@/src/LegendState/Transaction.model";
import { TransactionsScreenModel } from "@/src/LegendState/TransactionsScreen.model";
import { syncManager } from "@/src/services/sync";
import { Effect } from "effect";
import { storeModel$ } from "./Store/Store.model";

class RootStore {
	// Database
	categoryModel: CategoryModel;
	transactionModel: TransactionModel;
	insightsModel: InsightsModel;
	productsModel: ProductsModel;
	productsListingsModel: ProductsListingsModel;
	productListingHistoryModel: ProductsListingHistoryModel;
	// Screens
	transactionsScreenModel: TransactionsScreenModel;
	addProductScreenModel: AddProductScreenModel;
	addProductListingModel: AddProductListingModel;
	editProductListingModel: EditProductListing;

	constructor() {
		this.categoryModel = new CategoryModel();
		this.transactionModel = new TransactionModel();
		this.transactionsScreenModel = new TransactionsScreenModel();
		this.insightsModel = new InsightsModel();
		this.productsModel = new ProductsModel();
		this.productListingHistoryModel = new ProductsListingHistoryModel();
		this.productsListingsModel = new ProductsListingsModel();
		this.addProductScreenModel = new AddProductScreenModel();
		this.addProductListingModel = new AddProductListingModel();
		this.editProductListingModel = new EditProductListing();
	}

	private startServices = async () => {
		await appModel.actions.startServices();

		// Initialize auth (restore session, start listener)
		await authModel.actions.initialize();

		// Initialize sync manager (restores deviceId, starts foreground listener)
		await Effect.runPromise(syncManager.initialize());

		const isFirstLaunch = await appModel.checkFirstLaunch();
		if (isFirstLaunch) {
			await this.categoryModel.createDefaultCategories();
			await this.productsModel.createDefaultProducts();
			await storeModel$.createDefaultStores();
		}

		// Trigger initial sync if user is authenticated
		syncManager.syncIfAuthenticated();
	};

	actions = {
		startServices: this.startServices,
	};
}

export const rootStore = new RootStore();
