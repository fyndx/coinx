import Currency from "@coinify/currency";
import { observable } from "@legendapp/state";
import * as Burnt from "burnt";
import { Effect } from "effect";
import { router } from "expo-router";

import {
  type InsertProductListing,
  type SelectProduct,
  type SelectProductListing,
  insertProductListingSchema,
} from "@/db/schema";
import { addProductListingsHistory } from "@/src/database/Products/ProductListingsHistoryRepo";
import { addProductListing } from "@/src/database/Products/ProductsListingsRepo";
import { findProductById } from "@/src/database/Products/ProductsRepo";
import { syncManager } from "@/src/services/sync";
import { convert } from "@/src/utils/units";

import { appModel } from "../AppState/App.model";

type ProductUnitOption = {
  label: string;
  value: string;
};

export class AddProductListingModel {
  product;
  units;
  productDetailsDraft;

  constructor() {
    this.product = observable<Partial<SelectProduct>>({});
    this.units = observable<ProductUnitOption[]>([]);
    this.productDetailsDraft = observable<Partial<InsertProductListing>>({});
  }

  getProductById = async (id: string) => {
    console.log("Fetching product details for ID:", id);
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
    if (!defaultUnit) {
      this.units.set([]);
      return;
    }

    const unitsList = convert()
      .list(defaultUnit)
      .map((unit) => ({
        label: `${unit.plural} (${unit.abbr})`,
        value: unit.abbr,
      }));
    console.log("Available units for product:", unitsList);
    this.units.set(unitsList);
  };

  addProductDetails = async () => {
    try {
      const productListing = this.productDetailsDraft.peek();
      console.log("Adding product listing with details:", productListing);
      // TODO: Change INR to currency from user settings
      productListing.price = Currency.toSmallestSubunit(
        productListing.price ?? 0,
        appModel.obs.currency.code.peek(),
      ) as number;

      const validationResult =
        insertProductListingSchema.safeParse(productListing);

      console.log("Validation result for product listing:", validationResult);

      if (!validationResult.success) {
        Burnt.toast({ title: "Invalid product details" });
        return;
      }

      const [createdProductListing] = await Effect.runPromise(
        addProductListing(validationResult.data),
      );
      await Effect.runPromise(
        addProductListingsHistory({
          productId: createdProductListing.productId,
          productListingId: createdProductListing.id,
          price: createdProductListing.price,
        }),
      );
      syncManager.scheduleSyncAfterChange();
      Burnt.toast({ title: "Product added successfully" });
      router.back();
    } catch (error) {
      console.error("Failed to add product listing:", error);
      Burnt.toast({
        title: "Failed to add product",
      });
    }
  };

  reset = () => {
    this.product.set({});
    this.units.set([]);
  };
}
