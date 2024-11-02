import type { InsertProductListing, SelectProductListing } from "@/db/schema";
import {
	addProductListing,
	getProductListingsById,
	getProductsListings,
} from "@/src/database/Products/ProductsListingsRepo";
import { faker } from "@faker-js/faker";
import { observable } from "@legendapp/state";
import { Effect } from "effect";

export class ProductsListingsModel {
	productListings;
	constructor() {
		this.productListings = observable<Partial<SelectProductListing>[]>([]);
	}

	getProductListings = async () => {
		const productListings = await Effect.runPromise(getProductsListings());
		// this.productListings.set(productListings);
		console.log("productListings 1", productListings);
	};

	getProductListingsById = async (id: number) => {
		const productListings = await Effect.runPromise(getProductListingsById(id));
		this.productListings.set(productListings);
		console.log("productListings", productListings);
	};

	createRandomProductListing = () => {
		return {
			price: faker.commerce.price(),
			quantity: faker.number.int({ min: 1, max: 10 }),
			pricePerUnit: faker.commerce.price(),
			brand: faker.company.name(),
			store: faker.company.catchPhraseNoun(),
			location: faker.location.city(),
		};
	};
}
