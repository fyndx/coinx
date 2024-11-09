import type {
	InsertProductListingHistory,
	SelectProductListing,
} from "@/db/schema";
import { addProductListingsHistory } from "@/src/database/Products/ProductListingsHistoryRepo";
import {
	getProductListingById,
	updateProductListingById,
} from "@/src/database/Products/ProductsListingsRepo";
import { observable } from "@legendapp/state";
import { Effect } from "effect";
import * as Burnt from "burnt";
import { router } from "expo-router";
import Currency from "@coinify/currency";

interface ProductListing {
	status: "loading" | "success" | "error";
	data?: SelectProductListing;
}

interface EditProductDraft {
	price: string;
}

export class EditProductListing {
	productListing;
	editProductDraft;

	constructor() {
		this.productListing = observable<ProductListing>({
			status: "loading",
		});
		this.editProductDraft = observable<EditProductDraft>({
			price: "",
		});
	}

	// Actions
	onMount({ listingId, productId }: { listingId: number; productId: number }) {
		this.getProductListingById(listingId);
	}

	onUnmount() {
		this.productListing.set({ status: "loading", data: undefined });
		this.editProductDraft.price.set("");
	}

	getProductListingById = async (id: number) => {
		this.productListing.set({ status: "loading" });
		const productListing = await Effect.runPromise(getProductListingById(id));
		this.productListing.set({ data: productListing[0], status: "success" });
	};

	modifyProductDraft = <K extends keyof EditProductDraft>(
		key: K,
		value: EditProductDraft[K],
	) => {
		this.editProductDraft[key].set(value);
	};

	updateProductListing = async () => {
		const productListing = this.productListing.data.peek();
		const price = Currency.toSmallestSubunit(
			Number(this.editProductDraft.price.peek()),
		);

		if (Number.isNaN(price) || price <= 0) {
			throw new Error("Invalid price value");
		}

		const updatedProductListing = await Effect.runPromise(
			updateProductListingById({
				id: productListing.id,
				price: price,
			}),
		);

		const productListingHistory: InsertProductListingHistory = {
			productId: productListing.productId,
			productListingId: productListing.id,
			price: price,
		};

		const addedProductListingHistory = await Effect.runPromise(
			addProductListingsHistory(productListingHistory),
		);

		Burnt.toast({
			title: "Price Updated Successfully",
		});
		router.back();
	};
}
