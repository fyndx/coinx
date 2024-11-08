import type { InsertProductListing, SelectProductListing } from "@/db/schema";
import {
	addProductListing,
	deleteAllProductListings,
	deleteProductListingById,
	getProductListingsByProductId,
	getProductsListings,
} from "@/src/database/Products/ProductsListingsRepo";
import { faker } from "@faker-js/faker";
import { type Observable, computed, observable } from "@legendapp/state";
import * as Burnt from "burnt";
import { Effect } from "effect";
import { router } from "expo-router";

export class ProductsListingsModel {
	productListings: Observable<SelectProductListing[]>;
	productId: Observable<number>;
	constructor() {
		this.productId = observable(0);
		this.productListings = observable([]);
	}

	// @Actions

	// getProductListings = async () => {
	// 	const productListings = await Effect.runPromise(getProductsListings());
	// 	this.productListings.set(productListings);
	// };

	getProductListingsById = async (id: number) => {
		const productListings = await Effect.runPromise(
			getProductListingsByProductId(id),
		);
		this.productId.set(id);
		this.productListings.set(productListings);
	};

	deleteProductListingById = async (id: number) => {
		await Effect.runPromise(deleteProductListingById(id));
		await this.getProductListingsById(this.productId.peek());
		Burnt.toast({ title: "Product listing deleted successfully" });
	};

	reset = () => {
		this.productId.set(0);
		this.productListings.set([]);
	};

	deleteAllProductListings = async () => {
		await Effect.runPromise(deleteAllProductListings());
		Burnt.toast({ title: "All product listings deleted successfully" });
	};

	// @Views
	productListingsTable = computed(() => {
		const productListings = this.productListings.get();
		const tableHead = [
			"Name",
			"Price per unit",
			"Price",
			"Quantity",
			"Store",
			"Url",
			"Edit",
			"Delete",
		];
		const table = [];

		for (const productListing of productListings) {
			table.push([
				{
					type: "text",
					value: productListing.name,
				},
				{
					type: "text",
					value: `${(productListing.price / productListing.quantity).toFixed(2)} per ${productListing.unit}`,
				},
				{
					type: "text",
					value: `${productListing.price}`,
				},
				{
					type: "text",
					value: `${productListing.quantity} ${productListing.unit}`,
				},
				{
					type: "text",
					value: productListing.store,
				},
				{
					type: "text",
					value: productListing.url,
				},
				{
					type: "button",
					value: "Edit",
					onPress: () => {
						// TODO: Implement edit functionality
						router.push({
							pathname: "/edit-product-listing",
							params: {
								id: productListing.productId,
								listing_id: productListing.id,
							},
						});
					},
				},
				{
					type: "button",
					value: "Delete",
					onPress: () => {
						this.deleteProductListingById(productListing.id);
					},
				},
			]);
		}

		return {
			head: tableHead,
			data: table,
		};
	});
}
