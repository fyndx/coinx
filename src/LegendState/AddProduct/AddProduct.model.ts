import type { InsertProduct } from "@/db/schema";
import {
	addProduct,
	findProductByName,
} from "@/src/database/Products/ProductsRepo";
import { type MeasurementUnits, isValidUnitCategory } from "@/src/utils/units";
import { type ObservableObject, observable } from "@legendapp/state";
import * as Burnt from "burnt";
import { Effect } from "effect";
import { router } from "expo-router";

interface AddProductDraft {
	name: string;
	defaultUnitCategory?: (typeof MeasurementUnits)[number];
}

export class AddProductScreenModel {
	isLoading;
	product: ObservableObject<AddProductDraft>;

	constructor() {
		this.product = observable({
			name: "",
			defaultUnitCategory: undefined as
				| (typeof MeasurementUnits)[number]
				| undefined,
		});
		this.isLoading = observable(false);
	}

	private validateProduct(product: AddProductDraft) {
		if (!product.name) {
			return "Product name is required";
		}

		if (product.name.trim().length < 2) {
			return "Product name must be at least 2 characters long";
		}
		if (product.name.trim().length > 50) {
			return "Product name must not exceed 50 characters";
		}

		if (
			product.defaultUnitCategory === undefined ||
			!isValidUnitCategory(product.defaultUnitCategory)
		) {
			return "Please select a valid measurement unit";
		}

		return null;
	}

	addProduct = async () => {
		if (this.isLoading.peek()) return;

		const product = this.product.peek();
		// product object checks
		const validationError = this.validateProduct(product);
		if (validationError) {
			Burnt.toast({ title: validationError });
			return;
		}

		this.isLoading.set(true);

		try {
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
					defaultUnitCategory: product.defaultUnitCategory,
				}),
			);

			if (createdProduct.length > 0) {
				Burnt.toast({ title: "Product added successfully" });
				this.product.set({
					name: "",
					defaultUnitCategory: undefined,
				});
				router.back();
			}
		} catch (error) {
			Burnt.toast({
				title: "An error occurred",
				message: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			this.isLoading.set(false);
		}
	};
}
