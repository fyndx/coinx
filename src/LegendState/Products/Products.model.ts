import type { SelectProduct } from "@/db/schema";
import {
	type Observable,
	type ObservableArray,
	observable,
} from "@legendapp/state";
import * as Burnt from "burnt";
import { Effect } from "effect";
import {
	addProduct,
	deleteAllProducts,
	deleteProduct,
	getProducts,
} from "../../database/Products/ProductsRepo";
import { generateRandomProducts } from "../../database/seeds/ProductSeeds";

export class ProductsModel {
	isLoading;
	products: ObservableArray<Omit<SelectProduct, "createdAt">[]>;
	constructor() {
		this.isLoading = observable(false);
		this.products = observable([]);
	}

	getProductsList = async () => {
		this.isLoading.set(true);
		try {
			const products = await Effect.runPromise(getProducts());
			this.products.set(products);
		} catch (error) {
			Burnt.toast({
				title: "Failed to fetch products",
				message: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			this.isLoading.set(false);
		}
	};

	deleteProduct = async (id: number) => {
		await Effect.runPromise(deleteProduct({ id }));
		const updatedProducts = this.products
			.peek()
			.filter((product) => product.id !== id);
		this.products.set(updatedProducts);
		Burnt.toast({ title: "Product deleted successfully" });
	};

	createRandomProducts = async (count = 10) => {
		this.isLoading.set(true);
		try {
			const products = generateRandomProducts({ count });
			await Promise.all(
				products.map((product) => Effect.runPromise(addProduct(product))),
			);
			Burnt.toast({ title: "Products created successfully" });
		} catch (error) {
			Burnt.toast({
				title: "Failed to create products",
				message: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			this.isLoading.set(false);
		}
	};

	deleteAllProducts = async () => {
		this.isLoading.set(true);
		try {
			await Effect.runPromise(deleteAllProducts());
			this.products.set([]);
			Burnt.toast({ title: "All products deleted successfully" });
		} catch (error) {
			Burnt.toast({
				title: "Failed to delete products",
				message: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			this.isLoading.set(false);
		}
	};

	createDefaultProducts = async () => {
		await Promise.all(
			DEFAULT_PRODUCTS.map((product) => Effect.runPromise(addProduct(product))),
		);
		this.getProductsList();
	};
}
