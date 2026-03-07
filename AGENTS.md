# AGENTS.md — AI Coding Assistant Guide

This file helps AI coding assistants (Claude, Cursor, Copilot, etc.) understand the CoinX codebase.

## What: Project Overview

**CoinX** is a personal finance app built with React Native (Expo). It tracks expenses, products, and price history with local-first architecture and cloud sync for authenticated users with a pro plan.

**Related Repos:**

- **coinx-backend** — Hono API server (https://github.com/fyndx/coinx-backend)
- **wiki** — Project docs & decisions (https://github.com/fyndx/wiki)

## What: Technology Stack

- **Expo SDK 54** with React Native 0.81.5 - Managed React Native development
- **TypeScript** - Strict type safety throughout
- **Expo Router 6** - File-based routing (like Next.js)
- **TailwindCSS** via Uniwind/Hero Native UI - Utility-first styling for React Native
- **Legend State** - Fast, fine-grained global state management
- **Drizzle ORM** & **Expo SQLite** - Local database and schema management
- **Effect-TS** - Functional programming patterns and robust error handling
- **Supabase** - Auth and backend services
- **MMKV** - Encrypted local storage
- **Bun** - Package manager and script runner

## What: Project Structure

```text
app/                    # Expo Router screens (file-based routing)
├── (tabs)/             # Tab navigator screens
├── _layout.tsx         # Root layout
components/             # Reusable UI components
db/                     # Database layer (client.ts, schema.ts, migrations/)
src/
├── Components/         # Feature components
├── LegendState/        # State management (Auth, Transactions, etc.)
├── hooks/              # Custom React hooks
└── services/           # Service clients (api.ts, supabase.ts, sync.ts)
drizzle/                # Generated migrations
```

## How: Development Workflow

**Essential Commands:**

```bash
bun install             # Install dependencies
bun start               # Start dev server
bun run ios             # Run iOS simulator
bun run android         # Run Android emulator
bun run lint            # Run linter
bun run type-check      # TypeScript validation
bun run db:generate     # Generate Drizzle migrations
bun run db:push         # Push migrations to local DB
```

**Environment Variables:**
Copy `.env.example` to `.env` and fill in:

- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `EXPO_PUBLIC_API_URL` — Backend API URL

## How: Key Patterns

- **Local-First Architecture:** All data is stored in SQLite on-device. App works 100% offline. Sync is for authenticated users with a pro plan.
- **Core Entities (`db/schema.ts`):** `transactions`, `categories`, `products`, `stores`, `product_listings`, `product_listings_history`.
- **Sync Mechanism:** Every syncable table has `id` (UUID), `syncStatus` (`'pending'`|`'synced'`|`null`), `deletedAt` (soft delete timestamp), and `lastModifiedAt`.
- **Auth Flow:** Auth is modular. Supabase handles email/password. App stores tokens in SecureStore/MMKV.
- **Data Types:** Amount/price types are stored as numbers locally, but may need to be handled carefully or sent as strings to backend.

## How: Essential Rules

- ✅ **DO** use **TypeScript** everywhere in strict mode.
- ✅ **DO** use **Drizzle ORM** for database queries.
- ✅ **DO** use **Legend State** for state mutations.
- ✅ **DO** use **Effect-TS** for error handling.
- ✅ **DO** use **Hero Native UI** and **Uniwind** for styling.
- ✅ **DO** generate UUIDs with `crypto.randomUUID()`.
- ✅ **DO** follow PR Guidelines: Create feature branches, ensure `bun run lint` passes, write focused commits.
- ✅ **DO** use MMKV storage for fast and secure data (prefer over AsyncStorage where feasible).
- ❌ **DO NOT** use raw SQL queries.
- ❌ **DO NOT** push directly to `main` — always use PRs.
- ❌ **DO NOT** modify native `android/`/`ios/` directories directly; use Expo config plugins.
