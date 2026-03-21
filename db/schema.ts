import { sql } from "drizzle-orm";
import { defineRelations } from "drizzle-orm";
import { index, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";

import { generateUUID } from "@/src/utils/uuid";

// ─── Sync Status Enum ────────────────────────────────────────
export const syncStatusEnum = ["pending", "synced"] as const;
export type SyncStatus = (typeof syncStatusEnum)[number];

// ─── Categories ──────────────────────────────────────────────

export const categories = sqliteTable("coinx_category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUUID()), // UUID
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  type: text("type", { enum: ["Income", "Expense"] }).notNull(),

  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at"),

  // Sync fields
  syncStatus: text("sync_status", { enum: syncStatusEnum }).default("pending"),
  deletedAt: text("deleted_at"),
  localOwnerId: text("local_owner_id"),
});

// ─── Transactions ────────────────────────────────────────────

export const transactions = sqliteTable("coinx_transaction", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUUID()), // UUID
  transactionTime: text("transaction_time").notNull(),
  amount: real("amount").notNull(),
  note: text("note"),
  transactionType: text("transaction_type", {
    enum: ["Income", "Expense"],
  }).notNull(),
  categoryId: text("category_id") // UUID reference
    .notNull()
    .references(() => categories.id),

  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at"),

  // Sync fields
  syncStatus: text("sync_status", { enum: syncStatusEnum }).default("pending"),
  deletedAt: text("deleted_at"),
  localOwnerId: text("local_owner_id"),
});

// ─── Products ────────────────────────────────────────────────

export const products = sqliteTable("coinx_product", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUUID()), // UUID
  name: text("name").notNull(),
  image: text("image"),
  notes: text("notes"),
  defaultUnitCategory: text("default_unit_category").notNull(),

  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at"),

  // Sync fields
  syncStatus: text("sync_status", { enum: syncStatusEnum }).default("pending"),
  deletedAt: text("deleted_at"),
  localOwnerId: text("local_owner_id"),
});

// ─── Stores ──────────────────────────────────────────────────

export const stores = sqliteTable("coinx_store", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUUID()), // UUID
  name: text("name").notNull(),
  location: text("location"),

  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at"),

  // Sync fields
  syncStatus: text("sync_status", { enum: syncStatusEnum }).default("pending"),
  deletedAt: text("deleted_at"),
  localOwnerId: text("local_owner_id"),
});

// ─── Product Listings ────────────────────────────────────────

export const product_listings = sqliteTable(
  "coinx_product_listing",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateUUID()), // UUID
    productId: text("product_id") // UUID reference
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    storeId: text("store_id") // UUID reference
      .references(() => stores.id, { onDelete: "cascade" })
      .notNull(),
    url: text("url"),
    price: real("price").notNull(), // Changed from integer to real for decimals
    quantity: real("quantity").notNull(),
    unit: text("unit").notNull(),

    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updated_at"),

    // Sync fields
    syncStatus: text("sync_status", { enum: syncStatusEnum }).default(
      "pending",
    ),
    deletedAt: text("deleted_at"),
    localOwnerId: text("local_owner_id"),
  },
  (table) => [
    index("idx_product_listings_product_id").on(table.productId),
    index("idx_product_listings_store_id").on(table.storeId),
  ],
);

// ─── Product Listings History ────────────────────────────────

export const product_listings_history = sqliteTable(
  "coinx_product_listing_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateUUID()), // UUID
    productId: text("product_id") // UUID reference
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    productListingId: text("product_listing_id") // UUID reference
      .references(() => product_listings.id, { onDelete: "cascade" })
      .notNull(),
    price: real("price").notNull(), // Changed from integer to real
    recordedAt: text("recorded_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updated_at"),

    // Sync fields
    syncStatus: text("sync_status", { enum: syncStatusEnum }).default(
      "pending",
    ),
    deletedAt: text("deleted_at"),
    localOwnerId: text("local_owner_id"),
  },
  (table) => [
    index("idx_product_listings_history_product_id").on(table.productId),
    index("idx_product_listings_history_product_listing_id").on(
      table.productListingId,
    ),
    index("idx_product_listings_history_recorded_at").on(table.recordedAt),
  ],
);

export const schemaRelations = defineRelations(
  {
    categories,
    transactions,
    products,
    stores,
    product_listings,
    product_listings_history,
  },
  (r) => ({
    categories: {
      transactions: r.many.transactions(),
    },
    transactions: {
      category: r.one.categories({
        from: r.transactions.categoryId,
        to: r.categories.id,
      }),
    },
    products: {
      product_listings: r.many.product_listings(),
      product_listings_history: r.many.product_listings_history(),
    },
    stores: {
      product_listings: r.many.product_listings(),
    },
    product_listings: {
      product: r.one.products({
        from: r.product_listings.productId,
        to: r.products.id,
      }),
      store: r.one.stores({
        from: r.product_listings.storeId,
        to: r.stores.id,
      }),
      product_listings_history: r.many.product_listings_history(),
    },
    product_listings_history: {
      product: r.one.products({
        from: r.product_listings_history.productId,
        to: r.products.id,
      }),
      product_listing: r.one.product_listings({
        from: r.product_listings_history.productListingId,
        to: r.product_listings.id,
      }),
    },
  }),
);

// ─── Types ───────────────────────────────────────────────────

// Transaction Types
export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export const selectTransactionSchema = createSelectSchema(transactions);
export const insertTransactionSchema = createInsertSchema(transactions);

// Category Types
export type SelectCategory = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const selectCategorySchema = createSelectSchema(categories);
export const insertCategorySchema = createInsertSchema(categories);

// Product Types
export type SelectProduct = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const selectProductSchema = createSelectSchema(products);
export const insertProductSchema = createInsertSchema(products);

// Product Listings Types
export type SelectProductListing = typeof product_listings.$inferSelect;
export type InsertProductListing = typeof product_listings.$inferInsert;

export const selectProductListingSchema = createSelectSchema(product_listings);
export const insertProductListingSchema = createInsertSchema(product_listings);

// Product Listings History Types
export type SelectProductListingHistory =
  typeof product_listings_history.$inferSelect;
export type InsertProductListingHistory =
  typeof product_listings_history.$inferInsert;

export const selectProductListingHistorySchema = createSelectSchema(
  product_listings_history,
);
export const insertProductListingHistorySchema = createInsertSchema(
  product_listings_history,
);

// Store Types
export type SelectStore = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

export const selectStoreSchema = createSelectSchema(stores);
export const insertStoreSchema = createInsertSchema(stores);
