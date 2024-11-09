import type { SelectProductListingHistory } from "@/db/schema";
import { getProductListingsHistoryByProductListingId } from "@/src/database/Products/ProductListingsHistoryRepo";
import { observable } from "@legendapp/state";
import { Effect } from "effect";

export class ProductsListingHistoryModel {
  productsListingHistory

  constructor() {
    this.productsListingHistory = observable<SelectProductListingHistory[]>([]);
  }

  getAllProductListingsByProductId = async (productId: number) => {
    const productListingHistory = await Effect.runPromise(getProductListingsHistoryByProductListingId(productId))
    console.log('productListingHistory', productListingHistory)
    this.productsListingHistory.set(productListingHistory);
  }
}