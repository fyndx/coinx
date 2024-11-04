import type { InsertProduct } from "@/db/schema";
import {
	addProduct,
	findProductByName,
} from "@/src/database/Products/ProductsRepo";
import type { UnitCategory } from "@/src/utils/units";
import { type ObservableObject, observable } from "@legendapp/state";
import * as Burnt from "burnt";
import { Effect } from "effect";
import { router } from "expo-router";

interface AddProductDraft {
	name: string;
	defaultUnitCategory?: (typeof UnitCategory)[number];
}

export class AddProductScreenModel {
	isLoading;
	product: ObservableObject<AddProductDraft>;

	constructor() {
		this.product = observable({
			name: "",
			defaultUnitCategory: undefined as
				| (typeof UnitCategory)[number]
				| undefined,
		});
		this.isLoading = observable(false);
	}

	addProduct = async () => {
		const product = this.product.peek();
		// product object checks
		if (!product.name) {
			Burnt.toast({ title: "Product name is required" });
			return;
		}

		if (!product.defaultUnitCategory) {
			Burnt.toast({ title: "Default unit category is required" });
			return;
		}

		this.isLoading.set(true);

		try {
			if (this.isLoading.peek()) return;
			// Check if the product already exists in the database
			const existingProduct = await Effect.runPromise(
				findProductByName({ name: product.name }),
			);

			if (existingProduct.length > 0) {
				// Product already exists
				Burnt.toast({ title: "Product already exists" });
				return;
			}

			const createdProduct = await Effect.runPromise(
				addProduct({
					name: product.name,
					defaultUnitCategory:
						product.defaultUnitCategory as InsertProduct["defaultUnitCategory"],
				}),
			);

			if (createdProduct.length > 0) {
				Burnt.toast({ title: "Product added successfully" });
				this.product.set({
					name: "",
					defaultUnitCategory: undefined,
				});
			}
		} catch (error) {
			Burnt.toast({
				title: "An error occurred",
				message: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			this.isLoading.set(false);
		}

		router.back();
	};
}
