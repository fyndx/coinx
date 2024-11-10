import { relations, sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

export const transactions = sqliteTable("transaction", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	transactionTime: integer("transaction_time", { mode: "timestamp" }).notNull(),
	amount: real("amount").notNull(),
	note: text("note"),
	transactionType: text("transaction_type", {
		enum: ["Income", "Expense"],
	}).notNull(),
	categoryId: integer("category_id").notNull(),

	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: text("updated_at"),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
	category: one(categories, {
		fields: [transactions.categoryId],
		references: [categories.id],
	}),
}));

export const categories = sqliteTable("category", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text("name").notNull().unique(),
	icon: text("icon").notNull().unique(),
	color: text("color").notNull().unique(),
	type: text("type", { enum: ["Income", "Expense"] }).notNull(),

	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: text("updated_at"),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
	transactions: many(transactions),
}));

export const products = sqliteTable("product", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	defaultUnitCategory: text("default_unit_category").notNull(), // from UnitCategory enum in units.ts
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const productsRelations = relations(products, ({ many }) => ({
	product_listings: many(product_listings),
	product_listings_history: many(product_listings_history),
}));

// TODO: Add constraints if needed
// TODO: Add indexes if needed
export const product_listings = sqliteTable("product_listings", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	productId: integer("product_id")
		.references(() => products.id, {
			onDelete: "cascade",
		})
		.notNull(),
	name: text("name").notNull(), // name of the product (Colgate Strong Teeth)
	store: text("store").notNull(),
	url: text("url"),
	location: text("location"),

	// Price details
	price: integer("price").notNull(),
	quantity: real("quantity").notNull(),
	unit: text("unit").notNull(), // actual unit used (kg, l, pc, etc.)

	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: text("updated_at"),
});

export const productListingsRelations = relations(
	product_listings,
	({ one, many }) => ({
		product: one(products, {
			fields: [product_listings.productId],
			references: [products.id],
		}),
		product_listings_history: many(product_listings_history),
	}),
);

export const product_listings_history = sqliteTable(
	"product_listings_history",
	{
		id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
		productId: integer("product_id")
			.references(() => products.id, {
				onDelete: "cascade",
			})
			.notNull(),
		productListingId: integer("product_listing_id")
			.references(() => product_listings.id, {
				onDelete: "cascade",
			})
			.notNull(),
		price: integer("price").notNull(),
		// quantity: real("quantity").notNull(),
		// unit: text("unit").notNull(),
		recordedAt: text("recorded_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	},
	(table) => {
		return {
			productIdIdx: index("idx_product_listings_history_product_id").on(
				table.productId,
			),
			productListingIdIdx: index(
				"idx_product_listings_history_product_listing_id",
			).on(table.productListingId),
			recordedAtIdx: index("idx_product_listings_history_recorded_at").on(
				table.recordedAt,
			),
			// TODO: Composite Index if needed for performance improvement
			// compositeIdx: index("idx_product_listings_history_product_id_recorded_at").on(
			// 	table.productId,
			// 	table.recordedAt,
			// ),
			// TODO: Add Constraints if needed
			// checkPrice: check("price_check", sql`${table.price} >= 0`),
			// checkQuantity: check("quantity_check", sql`${table.quantity} >= 0`),
		};
	},
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

// Types
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
