import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

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

// Types
// Transaction Types
export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Category Types
export type SelectCategory = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
