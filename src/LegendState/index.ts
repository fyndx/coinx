import { AddProductScreenModel } from "@/src/LegendState/AddProduct/AddProduct.model";
import { AppModel } from "@/src/LegendState/App.model";
import { CategoryModel } from "@/src/LegendState/Category.model";
import { InsightsModel } from "@/src/LegendState/Insights/Insights.model";
import { ProductsModel } from "@/src/LegendState/Products.model";
import { ProductsListingsModel } from "@/src/LegendState/ProductsListings.model";
import { TransactionModel } from "@/src/LegendState/Transaction.model";
import { TransactionsScreenModel } from "@/src/LegendState/TransactionsScreen.model";
import { AddProductListingModel } from "@/src/LegendState/AddProductListing/AddProductListing.model";
import { ProductsListingHistoryModel } from "@/src/LegendState/ProductListingHistory/ProductListingHistory.model";
import { EditProductListing } from "@/src/LegendState/EditProductListing/EditProductListing.model";

class RootStore {
	// App State
	appModel: AppModel;
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
		this.appModel = new AppModel();
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
		await this.appModel.actions.startServices();
		const isFirstLaunch = await this.appModel.checkFirstLaunch();
		if (isFirstLaunch) {
			await this.categoryModel.createDefaultCategories();
			await this.productsModel.createRandomProducts();
		}
	};

	actions = {
		startServices: this.startServices,
	};
}

export const rootStore = new RootStore();
