# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CoinX is a personal finance mobile app built with React Native/Expo. It tracks transactions (income/expenses), products with price history, and stores. The app supports offline-first operation with cloud sync via Supabase.

## Commands

```bash
# Development
pnpm start           # Start Expo dev server
pnpm ios             # Run on iOS simulator
pnpm android         # Run on Android emulator

# Code quality
pnpm lint            # Run Biome linter
pnpm type-check      # TypeScript check

# Database
pnpm generate        # Generate Drizzle migrations from schema changes
```

## Architecture

### State Management (LegendState)

The app uses `@legendapp/state` with class-based observable models. The pattern:

- **RootStore** (`src/LegendState/index.ts`) - Instantiates and holds all models
- **Models** - Each domain has a model class with:
  - Observable state via `observable()`
  - Actions as class methods
  - UI props accept models with `$` suffix (e.g., `transactionModel$`)
- **Screens** wrap components with `observer()` from `@legendapp/state/react`

### Database (Drizzle + SQLite)

- **Schema**: `db/schema.ts` - All tables use UUIDs as primary keys
- **Sync fields**: Every table has `syncStatus` ('pending'|'synced') and `deletedAt` for soft deletes
- **Repos**: `src/database/*Repo.ts` - Database operations wrapped in Effect.ts
- **Migrations**: `drizzle/` folder, generated via `pnpm generate`

Tables: categories, transactions, products, stores, product_listings, product_listings_history

### Sync Service (Effect.ts)

Located in `src/services/sync/`. Bidirectional sync between local SQLite and Supabase backend.

Key files:
- `manager.ts` - SyncManager orchestrator (push/pull operations)
- `database.ts` - Database Effect wrappers for sync operations
- `api.ts` - API Effect wrappers
- `types.ts` and `errors.ts` - TypeScript types and tagged errors

Sync flow: Initialize → Check Auth → Ensure Device → Push (local changes) → Pull (remote changes) → Commit

### Navigation (Expo Router)

File-based routing in `app/` directory:
- `app/(tabs)/` - Main tab screens (transactions, products, insights, budgets, settings)
- `app/(auth)/` - Authentication screens (sign-in, sign-up)
- Modal screens at root level (add-transaction, add-product, etc.)

### Styling

Uses `uniwind` (TailwindCSS for React Native) with `tailwind-variants` for component variants.

## Key Patterns

### Effect.ts for Database Operations

Repos return Effects that are composed and run with `Effect.runPromise()`:
```typescript
const result = await Effect.runPromise(getTransactions({ startDate, endDate }));
```

### Soft Deletes

All records use soft deletes - never use hard delete. Always set `deletedAt` and `syncStatus: 'pending'` when "deleting":
```typescript
.set({ deletedAt: new Date().toISOString(), syncStatus: "pending" })
```

Filter out deleted records with `isNull(table.deletedAt)` in queries.

### Sync After Changes

Call `syncManager.scheduleSyncAfterChange()` after any local database mutation.

## Path Aliases

`@/*` maps to project root (e.g., `@/src/`, `@/db/`)
