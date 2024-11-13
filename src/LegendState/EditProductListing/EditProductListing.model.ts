import type {
	InsertProductListingHistory,
	SelectProductListing,
} from "@/db/schema";
import { addProductListingsHistory } from "@/src/database/Products/ProductListingsHistoryRepo";
import {
	getProductListingById,
	updateProductListingById,
} from "@/src/database/Products/ProductsListingsRepo";
import { computed, observable } from "@legendapp/state";
import { Effect } from "effect";
import * as Burnt from "burnt";
import { router } from "expo-router";
import Currency from "@coinify/currency";
import type { AsyncInterface } from "@/src/utils/async-interface";

interface ProductListing extends AsyncInterface {
	data?: SelectProductListing;
}

interface EditProductDraft extends AsyncInterface {
	data: {
		price: string;
	};
}

export class EditProductListing {
	productListing;
	editProductDraft;

	constructor() {
		this.productListing = observable<ProductListing>({
			status: "pending",
		});
		this.editProductDraft = observable<EditProductDraft>({
			status: "idle",
			data: {
				price: "",
			},
		});
	}

	// Actions
	onMount({ listingId, productId }: { listingId: number; productId: number }) {
		this.getProductListingById(listingId);
	}

	onUnmount() {
		this.productListing.set({ status: "pending", data: undefined });
		this.editProductDraft.data.price.set("");
	}

	getProductListingById = async (id: number) => {
		this.productListing.set({ status: "pending" });
		const productListing = await Effect.runPromise(getProductListingById(id));
		this.productListing.set({ data: productListing[0], status: "success" });
	};

	modifyProductDraft = <K extends keyof EditProductDraft["data"]>(
		key: K,
		value: EditProductDraft["data"][K],
	) => {
		this.editProductDraft.data?.[key].set(value);
	};

	updateProductListing = async () => {
		try {
			this.editProductDraft.status.set("pending");
			const productListing = this.productListing.data.peek();
			const price = Currency.toSmallestSubunit(
				Number(this.editProductDraft.data.price.peek()),
				"INR",
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
			this.editProductDraft.status.set("success");
			Burnt.toast({
				title: "Price Updated Successfully",
			});
			router.back();
		} catch (error) {
			console.log({ error });
			this.editProductDraft.status.set("error");
			Burnt.toast({
				title: "Failed to update price",
			});
		} finally {
			this.editProductDraft.status.set("idle");
		}
	};

	// Views
	private isButtonDisabled = computed(() => {
		const price = this.editProductDraft.data.price.get();
		const isInvalidPrice = price === "" || Number.isNaN(Number(price));
		const isPriceSame =
			this.productListing.data?.price.peek() === Number(price);
		const isProductUpdatePending =
			this.editProductDraft.status.get() === "pending";

		return isInvalidPrice || isPriceSame || isProductUpdatePending;
	});

	views = {
		isButtonDisabled: this.isButtonDisabled,
	};
}
