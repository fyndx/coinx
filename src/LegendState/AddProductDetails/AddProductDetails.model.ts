import {
	type InsertProductListing,
	type SelectProduct,
	type SelectProductListing,
	insertProductListingSchema,
} from "@/db/schema";
import { addProductListing } from "@/src/database/Products/ProductsListingsRepo";
import { findProductById } from "@/src/database/Products/ProductsRepo";
import { UnitConversions } from "@/src/utils/units";
import { type ObservableObject, observable } from "@legendapp/state";
import { Value } from "@sinclair/typebox/value";
import * as Burnt from "burnt";
import { Effect } from "effect";

export class AddProductDetailsModel {
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

	addUnitsForProduct = () => {
		const defaultUnit =
			this.product.defaultUnitCategory.get() as keyof typeof UnitConversions;
		const unitsList = Object.keys(UnitConversions[defaultUnit]);
		this.units.set(unitsList);
		console.log("unitsList", unitsList);
	};

	addProductDetails = async () => {
		const productListing = this.productDetailsDraft.peek();

		const isProductListingValid = Value.Check(
			insertProductListingSchema,
			productListing,
		);

		console.log("isProductListingValid", isProductListingValid);

		if (isProductListingValid) {
			Effect.runPromise(addProductListing(productListing));
			Burnt.toast({ title: "Product added successfully" });
			return;
		}

		Burnt.toast({ title: "Invalid product details" });
	};

	reset = () => {
		this.product.set({});
	};
}
