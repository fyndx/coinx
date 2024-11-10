import type { SelectProductListingHistory } from "@/db/schema";
import { getProductListingsHistoryByProductListingId } from "@/src/database/Products/ProductListingsHistoryRepo";
import type { AsyncInterface } from "@/src/utils/async-interface";
import { observable } from "@legendapp/state";
import { Effect, pipe } from "effect";

interface ProductListingHistory extends AsyncInterface {
	data?: SelectProductListingHistory;
}

export class ProductsListingHistoryModel {
	productsListingHistory;

	constructor() {
		this.productsListingHistory = observable<ProductListingHistory>({
			status: "pending",
		});
	}

	onUnmount = () => {
		this.productsListingHistory.set({ status: "pending", data: undefined });
	};

	getAllProductListingsByProductId = async (productId: number) => {
		this.productsListingHistory.status.set("pending");
		const [productListingHistory] = await Effect.runPromise(
			getProductListingsHistoryByProductListingId(productId),
		);
		if (productListingHistory === undefined) {
			return;
		}
		this.productsListingHistory.set({
			data: productListingHistory,
			status: "success",
		});
	};
}
