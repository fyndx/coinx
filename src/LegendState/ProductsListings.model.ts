import type { SelectProductListing } from "@/db/schema";
import { deleteProductListingsByProductListingId } from "@/src/database/Products/ProductListingsHistoryRepo";
import {
	addProductListing,
	deleteAllProductListings,
	deleteProductListingById,
	getProductListingById,
	getProductListingsByProductId,
	getProductsListings,
} from "@/src/database/Products/ProductsListingsRepo";
import Currency from "@coinify/currency";
import { type Observable, computed, observable } from "@legendapp/state";
import * as Burnt from "burnt";
import { Effect } from "effect";
import { router } from "expo-router";
import { generateRandomProductListings } from "../database/seeds/ProductListingSeeds";
import { appModel } from "./AppState/App.model";

export class ProductsListingsModel {
	productListings: Observable<(SelectProductListing & { storeName: string })[]>;
	productId: Observable<number>;
	constructor() {
		this.productId = observable(0);
		this.productListings = observable([]);
	}

	getProductListingById = async (id: number) => {
		const productListing = await Effect.runPromise(getProductListingById(id));
		return productListing;
	};

	getProductListingsByProductId = async (productId: number) => {
		try {
			const productListings = await Effect.runPromise(
				getProductListingsByProductId(productId),
			);
			const updatedProductListings = productListings.map((productListing) => {
				return {
					...productListing,
					price: Currency.fromSmallestSubunit(
						productListing.price,
						appModel.obs.currency.code.peek(),
					),
				};
			});
			this.productId.set(productId);
			this.productListings.set(updatedProductListings);
		} catch (error) {
			console.error("[ProductsListings] Failed to fetch listings:", error);
			Burnt.toast({
				title: "Error fetching product listings",
				message:
					error instanceof Error ? error.message : "Unknown error occurred",
				preset: "error",
			});
		}
	};

	deleteProductListingById = async (id: number) => {
		// Delete all product listings history for this product listing
		await Effect.runPromise(deleteProductListingsByProductListingId(id));
		// Delete the product listing
		await Effect.runPromise(deleteProductListingById(id));
		// Get the updated product listings
		await this.getProductListingsByProductId(this.productId.peek());
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

	createRandomProductListings = async () => {
		// TODO: Pick Product IDs from the table
		generateRandomProductListings(10, { productIds: [1, 2, 3] });
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
			const price = productListing.price;
			table.push([
				{
					type: "text",
					value: productListing.name,
				},
				{
					type: "text",
					value:
						productListing.quantity !== 0
							? `${(price / productListing.quantity).toFixed(2)} per ${productListing.unit}`
							: "N/A",
				},
				{
					type: "text",
					value: `${price}`,
				},
				{
					type: "text",
					value: `${productListing.quantity} ${productListing.unit}`,
				},
				{
					type: "text",
					value: productListing.storeName,
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
								product_id: productListing.productId,
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
