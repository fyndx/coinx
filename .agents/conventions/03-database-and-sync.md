# Database & Sync (Drizzle & SQLite)

- **Queries:** Always use `drizzle-orm` for database queries (`insert`, `update`, `select`, `where`, `eq`, `isNull`). Avoid raw SQL queries.
- **Core Entities (`db/schema.ts`):** `transactions`, `categories`, `products`, `stores`, `product_listings`, `product_listings_history`.
- **Sync Architecture:** Every table that syncs to the cloud MUST include:
  - `id`: UUID (Generated via `crypto.randomUUID()` or `generateUUID()`)
  - `syncStatus`: String (`'pending'` | `'synced'` | `null`)
  - `deletedAt`: ISO string timestamp (for soft deletes)
  - `lastModifiedAt` / `updatedAt`: ISO string timestamp
- **Soft Deletes:** Use `deletedAt: new Date().toISOString()` instead of physically deleting rows to preserve sync capabilities.
- **Sync Triggering:** After any mutation, call `syncManager.scheduleSyncAfterChange()` to queue sync.
- **Data Types:** Amount/price types are stored as numbers locally, but may need to be handled carefully or sent as strings to backend.
