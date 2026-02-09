# AGENTS.md — AI Coding Assistant Guide

This file helps AI coding assistants (Claude, Cursor, Copilot, etc.) understand the CoinX codebase.

## Project Overview

**CoinX** is a personal finance app built with React Native (Expo). It tracks expenses, products, and price history with local-first architecture and optional cloud sync.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo (SDK 51) |
| Router | Expo Router (file-based) |
| State | Legend State |
| Local DB | SQLite via Drizzle ORM |
| Auth | Supabase Auth |
| Backend | Hono (separate repo: `coinx-backend`) |
| Styling | Hero Native UI + Uniwind |
| FP Patterns | Effect-TS |
| Build | EAS Build |

## Project Structure

```
app/                    # Expo Router screens (file-based routing)
├── (tabs)/            # Tab navigator screens
│   ├── index.tsx      # Home/Dashboard
│   ├── transactions/  # Transaction list & detail
│   └── settings/      # Settings & account
├── _layout.tsx        # Root layout

components/            # Reusable UI components

db/                    # Database layer
├── client.ts          # Drizzle SQLite client
├── schema.ts          # Table definitions
└── migrations/        # Drizzle migrations

src/
├── Components/        # Feature components
├── LegendState/       # State management
│   ├── Auth/          # Auth state & actions
│   ├── Transaction.model.ts
│   └── index.ts       # Store initialization
├── hooks/             # Custom React hooks
└── services/          # API & external services
    ├── api.ts         # HTTP client
    ├── supabase.ts    # Supabase client
    └── sync.ts        # Sync manager (WIP)

drizzle/               # Generated migrations
```

## Key Concepts

### Local-First Architecture
- All data stored in SQLite on device
- App works 100% offline
- Sync is optional (requires auth)
- `syncStatus` field tracks pending changes

### Tables (db/schema.ts)
- `transactions` — Income/expense records
- `categories` — User-defined categories
- `products` — Product catalog
- `stores` — Store list
- `product_listings` — Products at stores (with prices)
- `product_listings_history` — Price history over time

### Sync Fields
Every syncable table has:
- `id` — UUID (text, primary key)
- `syncStatus` — `'pending'` | `'synced'` | `null`
- `deletedAt` — Soft delete timestamp (ISO string or null)
- `lastModifiedAt` — Last local change timestamp

### Auth Flow
- Auth is **optional** — app works without login
- Supabase handles email/password auth
- Tokens stored in Expo SecureStore
- Backend validates Supabase JWT

## Development Commands

```bash
# Install dependencies
bun install

# Run iOS simulator
bun run ios

# Run Android emulator
bun run android

# Run web (limited support)
bun run web

# Generate Drizzle migrations
bun run db:generate

# Push migrations to local DB
bun run db:push

# Lint & format
bun run lint
bun run format
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `EXPO_PUBLIC_API_URL` — Backend API URL

## Current Phase

**Phase 2: App Integration** — connecting app to backend with auth + sync.

See `wiki/Projects/CoinX/Phases/Phase2-AppIntegration.md` for task breakdown.

## Related Repos

- **coinx-backend** — Hono API server (https://github.com/fyndx/coinx-backend)
- **wiki** — Project docs & decisions (https://github.com/fyndx/wiki)

## Coding Conventions

- **TypeScript** everywhere, strict mode
- **Biome** for linting/formatting (not ESLint)
- **Drizzle ORM** for database (not raw SQL)
- **Legend State** for state (not Redux/Zustand)
- **Effect-TS** for error handling and async operations
- **Hero Native UI** for components with **Uniwind** for styling
- **Functional components** with hooks
- **File naming**: `kebab-case` for files, `PascalCase` for components

## PR Guidelines

1. Create feature branch from `main`
2. Small, focused commits
3. Run `bun run lint` before pushing
4. PR description should explain what & why
5. Wait for CI checks to pass

## Common Pitfalls

- **Don't use `rm`** — use soft deletes via `deletedAt`
- **Don't push directly to main** — always use PRs
- **UUID generation** — use `crypto.randomUUID()`, not auto-increment
- **Sync status** — new records start as `'pending'`, set `'synced'` only after backend confirms
- **Amount/price types** — stored as numbers locally, sent as strings to backend
