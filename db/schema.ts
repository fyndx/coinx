import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable("transaction", {
  id: text("id").primaryKey(),
  transactionTime: integer("transaction_time", { mode: "timestamp" }).notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  note: text("note"),
  categoryId: text("category_id").notNull(),

  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at"),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const categories = sqliteTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  type: text("type").notNull(),

  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at"),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export type SelectTransaction = typeof transactions.$inferSelect;
