import { db as database } from "@/db/client";
import {Effect} from "effect";
import {
  type InsertProductListing,
  product_listings as productsListingsRepo,
  products as productsRepo
} from "@/db/schema";

export const getProductsListings = ({}) => {
  return Effect.promise(() => {
    const query = database
      .select({
        id: productsListingsRepo.id,
        price: productsListingsRepo.price,
        quantity: productsListingsRepo.quantity,
        pricePerUnit: productsListingsRepo.pricePerUnit,
        brand: productsListingsRepo.brand,
        store: productsListingsRepo.store,
        location: productsListingsRepo.location,
        createdAt: productsListingsRepo.createdAt,
        updatedAt: productsListingsRepo.updatedAt,
        product: {
          id: productsRepo.id,
          name: productsRepo.name,
          unit: productsRepo.unit,
        },
      })
      .from(productsListingsRepo);

    return query.execute();
  });
}

export const addProductListing = ({productId, price, quantity, pricePerUnit, brand, store, location}: InsertProductListing) => {
  return Effect.promise(() => {
    const query = database.insert(productsListingsRepo).values({
      productId,
      price,
      quantity,
      pricePerUnit,
      brand,
      store,
      location,
    })

    return query.execute();
  });
}