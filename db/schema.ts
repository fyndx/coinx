import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
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
}));

export const product_listings = sqliteTable("product_listings", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	productId: integer("product_id").references(() => products.id, {
		onDelete: "cascade",
	}),
	name: text("name").notNull(), // name of the product (Colgate Strong Teeth)
	store: text("store").notNull(),
	url: text("url"),
	location: text("location"),

	// Price details
	price: real("price").notNull(),
	quantity: real("quantity").notNull(),
	unit: text("unit").notNull(), // actual unit used (kg, l, pc, etc.)

	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: text("updated_at"),
});

export const productListingsRelations = relations(
	product_listings,
	({ one }) => ({
		product: one(products, {
			fields: [product_listings.productId],
			references: [products.id],
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
