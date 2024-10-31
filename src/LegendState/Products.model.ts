import type { SelectProduct } from "@/db/schema";
import { type ObservableArray, observable } from "@legendapp/state";
import * as Burnt from "burnt";
import { Effect } from "effect";
import {
	addProduct,
	deleteAllProducts,
	getProducts,
} from "../database/Products/ProductsRepo";
import { generateRandomProducts } from "../database/seeds/ProductSeeds";

export class ProductsModel {
	products: ObservableArray<Omit<SelectProduct, "createdAt">[]>;
	constructor() {
		this.products = observable([]);
	}

	getProductsList = async () => {
		const products = await Effect.runPromise(getProducts({}));
		this.products.set(products);
	};

	createRandomProducts = async () => {
		const products = generateRandomProducts({ count: 10 });
		for await (const product of products) {
			Effect.runPromise(addProduct(product));
		}
		Burnt.toast({ title: "Products created successfully" });
	};

	deleteAllProducts = async () => {
		await Effect.runPromise(deleteAllProducts());
		Burnt.toast({ title: "All products deleted successfully" });
	};
}
