---
name: expo-drizzle
description: Drizzle ORM with Expo SQLite for React Native. Use when working with database schemas, migrations, queries, or CRUD operations in CoinX.
---

# Expo Drizzle

Drizzle ORM configured for Expo SQLite in React Native.

## Project Structure

```
db/
├── client.ts          # Database connection
├── schema.ts          # Table definitions
└── migrations/        # Custom migrations
drizzle/
├── *.sql              # Generated SQL migrations
├── migrations.js      # Migration exports
└── meta/              # Migration metadata
```

## Schema Pattern

```typescript
import { sqliteTable, text, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const items = sqliteTable("items", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at"),
  // Sync fields
  syncStatus: text("sync_status", { enum: ["pending", "synced"] }).default("pending"),
  deletedAt: text("deleted_at"),
});
```

## Common Operations

### Insert with UUID

```typescript
import { generateUUID } from "@/src/utils/uuid";

await db.insert(items).values({
  id: generateUUID(),
  name: "Item",
  amount: 100,
  syncStatus: "pending",
}).returning();
```

### Query

```typescript
import { eq, and, between } from "drizzle-orm";

// Simple select
const all = await db.select().from(items);

// With conditions
const filtered = await db
  .select()
  .from(items)
  .where(eq(items.name, "Item"));

// With joins
const joined = await db
  .select()
  .from(transactions)
  .innerJoin(categories, eq(transactions.categoryId, categories.id));
```

### Update

```typescript
await db
  .update(items)
  .set({ 
    name: "Updated",
    updatedAt: new Date().toISOString(),
    syncStatus: "pending",
  })
  .where(eq(items.id, id));
```

### Delete

```typescript
await db.delete(items).where(eq(items.id, id));
```

## Migrations

### Generate migration

```bash
bun generate
```

### Run migrations (App.model.ts)

```typescript
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";

await migrate(db, migrations);
```

## Types

```typescript
// Infer types from schema
type SelectItem = typeof items.$inferSelect;
type InsertItem = typeof items.$inferInsert;

// Zod schemas
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
export const selectItemSchema = createSelectSchema(items);
export const insertItemSchema = createInsertSchema(items);
```

## Foreign Keys

```typescript
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
});

// With cascade delete
export const listings = sqliteTable("listings", {
  productId: text("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
});
```

## Indexes

```typescript
export const items = sqliteTable(
  "items",
  { /* columns */ },
  (table) => ({
    nameIdx: index("idx_items_name").on(table.name),
    uniqueConstraint: unique("unique_name").on(table.name, table.type),
  })
);
```
