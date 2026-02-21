import { relations, sql } from "drizzle-orm";
import {
	index,
	real,
	sqliteTable,
	text,
	unique,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Sync Status Enum ────────────────────────────────────────
export const syncStatusEnum = ["pending", "synced"] as const;
export type SyncStatus = (typeof syncStatusEnum)[number];

// ─── Categories ──────────────────────────────────────────────

export const categories = sqliteTable("coinx_category", {
	id: text("id").primaryKey(), // UUID
	name: text("name").notNull().unique(),
	icon: text("icon").notNull().unique(),
	color: text("color").notNull().unique(),
	type: text("type", { enum: ["Income", "Expense"] }).notNull(),

	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: text("updated_at"),

	// Sync fields
	syncStatus: text("sync_status", { enum: syncStatusEnum }).default("pending"),
	deletedAt: text("deleted_at"),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
	transactions: many(transactions),
}));

// ─── Transactions ────────────────────────────────────────────

export const transactions = sqliteTable("coinx_transaction", {
	id: text("id").primaryKey(), // UUID
	transactionTime: text("transaction_time").notNull(),
	amount: real("amount").notNull(),
	note: text("note"),
	transactionType: text("transaction_type", {
		enum: ["Income", "Expense"],
	}).notNull(),
	categoryId: text("category_id") // UUID reference
		.notNull()
		.references(() => categories.id),

	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: text("updated_at"),

	// Sync fields
	syncStatus: text("sync_status", { enum: syncStatusEnum }).default("pending"),
	deletedAt: text("deleted_at"),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
	category: one(categories, {
		fields: [transactions.categoryId],
		references: [categories.id],
	}),
}));

// ─── Products ────────────────────────────────────────────────

export const products = sqliteTable("coinx_product", {
	id: text("id").primaryKey(), // UUID
	name: text("name").notNull(),
	image: text("image"),
	notes: text("notes"),
	defaultUnitCategory: text("default_unit_category").notNull(),

	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: text("updated_at"),

	// Sync fields
	syncStatus: text("sync_status", { enum: syncStatusEnum }).default("pending"),
	deletedAt: text("deleted_at"),
});

export const productsRelations = relations(products, ({ many }) => ({
	product_listings: many(product_listings),
	product_listings_history: many(product_listings_history),
}));

// ─── Stores ──────────────────────────────────────────────────

export const stores = sqliteTable(
	"coinx_store",
	{
		id: text("id").primaryKey(), // UUID
		name: text("name").notNull(),
		location: text("location"),

		createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
		updatedAt: text("updated_at"),

		// Sync fields
		syncStatus: text("sync_status", { enum: syncStatusEnum }).default(
			"pending",
		),
		deletedAt: text("deleted_at"),
	},
	(table) => ({
		uniqueNameAndLocation: unique("unique_store_name_location").on(
			table.name,
			table.location,
		),
	}),
);

export const storesRelations = relations(stores, ({ many }) => ({
	product_listings: many(product_listings),
}));

// ─── Product Listings ────────────────────────────────────────

export const product_listings = sqliteTable(
	"coinx_product_listing",
	{
		id: text("id").primaryKey(), // UUID
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

		createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
		updatedAt: text("updated_at"),

		// Sync fields
		syncStatus: text("sync_status", { enum: syncStatusEnum }).default(
			"pending",
		),
		deletedAt: text("deleted_at"),
	},
	(table) => ({
		productIdIdx: index("idx_product_listings_product_id").on(table.productId),
		storeIdIdx: index("idx_product_listings_store_id").on(table.storeId),
	}),
);

export const productListingsRelations = relations(
	product_listings,
	({ one, many }) => ({
		product: one(products, {
			fields: [product_listings.productId],
			references: [products.id],
		}),
		store: one(stores, {
			fields: [product_listings.storeId],
			references: [stores.id],
		}),
		product_listings_history: many(product_listings_history),
	}),
);

// ─── Product Listings History ────────────────────────────────

export const product_listings_history = sqliteTable(
	"coinx_product_listing_history",
	{
		id: text("id").primaryKey(), // UUID
		productId: text("product_id") // UUID reference
			.references(() => products.id, { onDelete: "cascade" })
			.notNull(),
		productListingId: text("product_listing_id") // UUID reference
			.references(() => product_listings.id, { onDelete: "cascade" })
			.notNull(),
		price: real("price").notNull(), // Changed from integer to real
		recordedAt: text("recorded_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
		updatedAt: text("updated_at"),

		// Sync fields
		syncStatus: text("sync_status", { enum: syncStatusEnum }).default(
			"pending",
		),
		deletedAt: text("deleted_at"),
	},
	(table) => ({
		productIdIdx: index("idx_product_listings_history_product_id").on(
			table.productId,
		),
		productListingIdIdx: index(
			"idx_product_listings_history_product_listing_id",
		).on(table.productListingId),
		recordedAtIdx: index("idx_product_listings_history_recorded_at").on(
			table.recordedAt,
		),
	}),
);

export const productListingHistoryRelations = relations(
	product_listings_history,
	({ one }) => ({
		product: one(products, {
			fields: [product_listings_history.productId],
			references: [products.id],
		}),
		product_listing: one(product_listings, {
			fields: [product_listings_history.productListingId],
			references: [product_listings.id],
		}),
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
