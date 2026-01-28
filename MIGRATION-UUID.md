# UUID Migration Guide

## Overview

Migrate all local SQLite tables from auto-increment integer IDs to UUID strings.

**Why:** Backend uses UUIDs. App needs matching IDs for sync to work.

## Tables Affected

| Table | ID Fields to Change | Foreign Keys to Change |
|-------|---------------------|----------------------|
| `coinx_category` | `id` | — |
| `coinx_transaction` | `id` | `category_id` |
| `coinx_product` | `id` | — |
| `coinx_store` | `id` | — |
| `coinx_product_listing` | `id` | `product_id`, `store_id` |
| `coinx_product_listing_history` | `id` | `product_id`, `product_listing_id` |

## Step 1: Add UUID Utility

Create `src/utils/uuid.ts`:

```typescript
/**
 * Generate a UUID v4 for local records.
 * Uses crypto.randomUUID() which is available in React Native.
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
```

## Step 2: Update Schema

Replace `db/schema.ts` with UUID-based IDs:

```typescript
import { relations, sql } from "drizzle-orm";
import {
  index,
  real,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

// ─── Categories ──────────────────────────────────────────────

export const categories = sqliteTable("coinx_category", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  type: text("type", { enum: ["Income", "Expense"] }).notNull(),

  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at"),
  
  // Sync fields
  syncStatus: text("sync_status", { enum: ["pending", "synced"] }).default("pending"),
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
  syncStatus: text("sync_status", { enum: ["pending", "synced"] }).default("pending"),
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
  syncStatus: text("sync_status", { enum: ["pending", "synced"] }).default("pending"),
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
    syncStatus: text("sync_status", { enum: ["pending", "synced"] }).default("pending"),
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
    syncStatus: text("sync_status", { enum: ["pending", "synced"] }).default("pending"),
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
    syncStatus: text("sync_status", { enum: ["pending", "synced"] }).default("pending"),
    deletedAt: text("deleted_at"),
  },
  (table) => ({
    productIdIdx: index("idx_product_listings_history_product_id").on(table.productId),
    productListingIdIdx: index("idx_product_listings_history_product_listing_id").on(table.productListingId),
    recordedAtIdx: index("idx_product_listings_history_recorded_at").on(table.recordedAt),
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

export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export const selectTransactionSchema = createSelectSchema(transactions);
export const insertTransactionSchema = createInsertSchema(transactions);

export type SelectCategory = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export const selectCategorySchema = createSelectSchema(categories);
export const insertCategorySchema = createInsertSchema(categories);

export type SelectProduct = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export const selectProductSchema = createSelectSchema(products);
export const insertProductSchema = createInsertSchema(products);

export type SelectProductListing = typeof product_listings.$inferSelect;
export type InsertProductListing = typeof product_listings.$inferInsert;
export const selectProductListingSchema = createSelectSchema(product_listings);
export const insertProductListingSchema = createInsertSchema(product_listings);

export type SelectProductListingHistory = typeof product_listings_history.$inferSelect;
export type InsertProductListingHistory = typeof product_listings_history.$inferInsert;
export const selectProductListingHistorySchema = createSelectSchema(product_listings_history);
export const insertProductListingHistorySchema = createInsertSchema(product_listings_history);

export type SelectStore = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;
export const selectStoreSchema = createSelectSchema(stores);
export const insertStoreSchema = createInsertSchema(stores);
```

## Step 3: Data Migration SQL

SQLite migration to convert existing data:

```sql
-- Migration: Convert integer IDs to UUIDs
-- Run this BEFORE changing the schema

-- 1. Create mapping tables
CREATE TABLE IF NOT EXISTS _uuid_map_categories (old_id INTEGER PRIMARY KEY, new_id TEXT);
CREATE TABLE IF NOT EXISTS _uuid_map_transactions (old_id INTEGER PRIMARY KEY, new_id TEXT);
CREATE TABLE IF NOT EXISTS _uuid_map_products (old_id INTEGER PRIMARY KEY, new_id TEXT);
CREATE TABLE IF NOT EXISTS _uuid_map_stores (old_id INTEGER PRIMARY KEY, new_id TEXT);
CREATE TABLE IF NOT EXISTS _uuid_map_product_listings (old_id INTEGER PRIMARY KEY, new_id TEXT);
CREATE TABLE IF NOT EXISTS _uuid_map_product_listings_history (old_id INTEGER PRIMARY KEY, new_id TEXT);

-- 2. Generate UUIDs for each existing record (done in JS)
-- INSERT INTO _uuid_map_categories SELECT id, <generated_uuid> FROM coinx_category;
-- etc.

-- 3. Add new UUID columns
ALTER TABLE coinx_category ADD COLUMN new_id TEXT;
ALTER TABLE coinx_transaction ADD COLUMN new_id TEXT;
ALTER TABLE coinx_transaction ADD COLUMN new_category_id TEXT;
ALTER TABLE coinx_product ADD COLUMN new_id TEXT;
ALTER TABLE coinx_store ADD COLUMN new_id TEXT;
ALTER TABLE coinx_product_listing ADD COLUMN new_id TEXT;
ALTER TABLE coinx_product_listing ADD COLUMN new_product_id TEXT;
ALTER TABLE coinx_product_listing ADD COLUMN new_store_id TEXT;
ALTER TABLE coinx_product_listing_history ADD COLUMN new_id TEXT;
ALTER TABLE coinx_product_listing_history ADD COLUMN new_product_id TEXT;
ALTER TABLE coinx_product_listing_history ADD COLUMN new_product_listing_id TEXT;

-- 4. Copy UUIDs from mapping tables
UPDATE coinx_category SET new_id = (SELECT new_id FROM _uuid_map_categories WHERE old_id = coinx_category.id);
UPDATE coinx_transaction SET new_id = (SELECT new_id FROM _uuid_map_transactions WHERE old_id = coinx_transaction.id);
UPDATE coinx_transaction SET new_category_id = (SELECT new_id FROM _uuid_map_categories WHERE old_id = coinx_transaction.category_id);
-- etc. for all tables and foreign keys

-- 5. Add sync columns
ALTER TABLE coinx_category ADD COLUMN sync_status TEXT DEFAULT 'pending';
ALTER TABLE coinx_category ADD COLUMN deleted_at TEXT;
-- etc. for all tables

-- 6. Recreate tables with new schema (SQLite limitation: can't change column types)
-- Create new tables, copy data, drop old, rename new

-- 7. Clean up mapping tables
DROP TABLE _uuid_map_categories;
DROP TABLE _uuid_map_transactions;
DROP TABLE _uuid_map_products;
DROP TABLE _uuid_map_stores;
DROP TABLE _uuid_map_product_listings;
DROP TABLE _uuid_map_product_listings_history;
```

## Step 4: Update Repos

Every repo that creates records needs to generate UUIDs:

```typescript
// Before
const newTransaction = await db.insert(transactions).values({
  // id auto-generated
  amount: 100,
  ...
});

// After
import { generateUUID } from '@/src/utils/uuid';

const newTransaction = await db.insert(transactions).values({
  id: generateUUID(), // Must provide UUID
  amount: 100,
  syncStatus: 'pending', // New records are pending sync
  ...
});
```

**Files to update:**
- `src/database/Transactions/TransactionsRepo.ts`
- `src/database/Categories/CategoriesRepo.ts`
- `src/database/Products/ProductsRepo.ts`
- `src/database/Products/ProductsListingsRepo.ts`
- `src/database/Products/ProductListingsHistoryRepo.tsx`
- `src/database/Stores/StoresRepo.ts`
- All seed files in `src/database/seeds/`

## Step 5: Update Models/State

Any Legend State models that reference IDs by number need updating:

```typescript
// Before
const categoryId = 1;

// After  
const categoryId = "550e8400-e29b-41d4-a716-446655440000";
```

**Files to check:**
- `src/LegendState/*.model.ts`
- Any component that passes ID props

## Testing Checklist

- [ ] Fresh install works (no existing data)
- [ ] Existing user data migrates correctly
- [ ] All CRUD operations work with UUIDs
- [ ] Foreign key relationships intact
- [ ] No TypeScript errors
- [ ] App doesn't crash on startup

## Rollback Plan

If migration fails:
1. Keep backup of SQLite database before migration
2. Restore from backup if needed
3. Test migration on a copy first

---

*This is a breaking change for the database. Test thoroughly before releasing.*
