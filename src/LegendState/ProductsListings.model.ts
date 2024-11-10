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
import { type Observable, computed, observable } from "@legendapp/state";
import * as Burnt from "burnt";
import { Effect } from "effect";
import { router } from "expo-router";
import Currency from "@coinify/currency";

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

	getProductListingById = async (id: number) => {
		const productListing = await Effect.runPromise(getProductListingById(id));
		return productListing;
	};

	getProductListingsByProductId = async (productId: number) => {
		const productListings = await Effect.runPromise(
			getProductListingsByProductId(productId),
		);
		const updatedProductListings = productListings.map((productListing) => {
			return {
				...productListing,
				// TODO: Change INR to currency from user settings
				price: Currency.fromSmallestSubunit(productListing.price, "INR"),
			};
		});
		this.productId.set(productId);
		this.productListings.set(productListings);
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
					value:
						productListing.quantity !== 0
							? `${(productListing.price / productListing.quantity).toFixed(2)} per ${productListing.unit}`
							: "N/A",
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
