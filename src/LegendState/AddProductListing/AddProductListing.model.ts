import {
	type InsertProductListing,
	type SelectProduct,
	type SelectProductListing,
	insertProductListingSchema,
} from "@/db/schema";
import { addProductListingsHistory } from "@/src/database/Products/ProductListingsHistoryRepo";
import {
	addProductListing,
	getProductListingById,
} from "@/src/database/Products/ProductsListingsRepo";
import { findProductById } from "@/src/database/Products/ProductsRepo";
import { convert } from "@/src/utils/units";
import { observable } from "@legendapp/state";
import { Value } from "@sinclair/typebox/value";
import * as Burnt from "burnt";
import { Effect } from "effect";
import { router } from "expo-router";
import Currency from "@coinify/currency";

export class AddProductListingModel {
	product;
	units;
	productDetailsDraft;

	constructor() {
		this.product = observable<Partial<SelectProduct>>({});
		this.units = observable<string[]>([]);
		this.productDetailsDraft = observable<Partial<InsertProductListing>>({});
	}

	getProductById = async (id: number) => {
		const product = await Effect.runPromise(findProductById({ id }));
		this.product.set(product[0]);
		this.productDetailsDraft.productId.set(id);
		this.addUnitsForProduct();
	};

	// getProductListingById = async (id: number) => {
	// 	const productListing = await Effect.runPromise(getProductListingById(id));
	// 	this.productDetailsDraft.set(productListing[0]);
	// };

	addUnitsForProduct = () => {
		const defaultUnit = this.product.defaultUnitCategory.peek();
		const unitsList = convert().possibilities(defaultUnit);
		this.units.set(unitsList);
	};

	addProductDetails = async () => {
		try {
			const productListing = this.productDetailsDraft.peek();
			// TODO: Change INR to currency from user settings
			productListing.price = Currency.toSmallestSubunit(
				productListing.price,
				"INR",
			);

			const isProductListingValid = Value.Check(
				insertProductListingSchema,
				productListing,
			);

			if (isProductListingValid) {
				const [createdProductListing] = await Effect.runPromise(
					addProductListing(productListing),
				);
				await Effect.runPromise(
					addProductListingsHistory({
						productId: createdProductListing.productId,
						productListingId: createdProductListing.id,
						price: createdProductListing.price,
					}),
				);
				Burnt.toast({ title: "Product added successfully" });
				router.back();
				return;
			}

			Burnt.toast({ title: "Invalid product details" });
		} catch (error) {
			console.log({ error });
		}
	};

	reset = () => {
		this.product.set({});
	};
}
