import type { InsertProductListing, SelectProductListing } from "@/db/schema";
import {
	addProductListing,
	deleteAllProductListings,
	getProductListingsById,
	getProductsListings,
} from "@/src/database/Products/ProductsListingsRepo";
import { faker } from "@faker-js/faker";
import { computed, observable } from "@legendapp/state";
import * as Burnt from "burnt";
import { Effect } from "effect";

export class ProductsListingsModel {
	productListings;
	constructor() {
		this.productListings = observable<SelectProductListing[]>([]);
	}

	// @Actions

	// getProductListings = async () => {
	// 	const productListings = await Effect.runPromise(getProductsListings());
	// 	this.productListings.set(productListings);
	// };

	getProductListingsById = async (id: number) => {
		const productListings = await Effect.runPromise(getProductListingsById(id));
		this.productListings.set(productListings);
		console.log("productListings", productListings);
	};

	reset = () => {
		this.productListings.set([]);
	};

	deleteAllProductListings = async () => {
		await Effect.runPromise(deleteAllProductListings());
		Burnt.toast({ title: "All product listings deleted successfully" });
	};

	// @Views
	productListingsTable = computed(() => {
		const products = this.productListings.get();
		const tableHead = [
			"Name",
			"Price per unit",
			"Price",
			"Quantity",
			"Store",
			"Url",
		];
		const table = [];

		for (const product of products) {
			table.push([
				`${product.name}`,
				`${(product.price / product.quantity).toFixed(2)} per ${product.unit}`,
				`${product.price}`,
				`${product.quantity} ${product.unit}`,
				`${product.store}`,
				`${product.url}`,
			]);
		}

		return {
			head: tableHead,
			data: table,
		};
	});
}
