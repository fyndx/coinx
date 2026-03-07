# CLAUDE.md — Claude Code Instructions

Quick reference for Claude Code sessions working on CoinX.

## What: Technology Stack

- **Expo SDK 54** with React Native 0.81.5 - Managed React Native development
- **TypeScript** - Strict type safety throughout
- **Expo Router 6** - File-based routing
- **TailwindCSS** via Uniwind/Hero Native UI - Utility-first styling for React Native
- **Legend State** - Fast, fine-grained global state management
- **Drizzle ORM** & **Expo SQLite** - Local database and schema management
- **Effect-TS** - Functional programming patterns and robust error handling
- **Supabase** - Auth and backend services
- **MMKV** - Encrypted, fast local storage
- **Bun** - Package manager and script runner

## What: Project Structure

```text
app/                    # Expo Router file-based routes (add new routes here)
├── (tabs)/             # Main tab navigator
├── _layout.tsx         # Root layout & providers
components/             # Pre-built UI components
db/                     # Database layer
├── client.ts           # Drizzle SQLite client
├── schema.ts           # All table definitions
└── migrations/         # Drizzle migrations
src/
├── Components/         # Feature-specific components
├── LegendState/        # State management models and store initialization
├── hooks/              # Custom React hooks
└── services/           # Service clients (api.ts, supabase.ts, sync.ts)
```

## How: Development Workflow

**Essential Commands:**

```bash
bun start               # Start dev server
bun run ios             # Run on iOS simulator
bun run android         # Run on Android emulator
bun run lint            # Run linter
bun run type-check      # TypeScript validation
bun run db:generate     # Generate Drizzle migrations
bun run db:push         # Push migrations to local DB
```

**Testing Checklist (Before PR):**

- [ ] Works when logged out
- [ ] Works when logged in
- [ ] Works offline
- [ ] Works after token expiry
- [ ] No console errors in dev mode

## How: Key Patterns & Concepts

- **Database Operations**: Always try to use Drizzle ORM (`db/client.ts`), only use raw SQL if necessary.
- **Sync Architecture**:
  1. Check auth state and pro plan status BEFORE any sync operation.
  2. No sync UI/logic for logged-out or non-pro users.
  3. Cancel in-flight sync on logout.
  4. Local records start with `syncStatus: 'pending'`.
  5. Mark records `synced` ONLY after server confirms.
- **Backend API**: Base URL is `EXPO_PUBLIC_API_URL`
  - Endpoints: `POST /api/auth/register`, `POST /api/auth/device`, `POST /api/sync/push`, `POST /api/sync/pull` (All require `Authorization: Bearer <token>`).

## How: Essential Rules

- ✅ **DO** use Drizzle ORM for all database operations.
- ✅ **DO** use Legend State for state management.
- ✅ **DO** use Effect-TS for error handling and async operations.
- ✅ **DO** use Hero Native UI components with Uniwind for styling.
- ✅ **DO** handle both authenticated and unauthenticated states.
- ✅ **DO** soft delete via `deletedAt`.
- ❌ **DO NOT** hard delete records (`rm`).
- ❌ **DO NOT** push directly to `main` — create small, focused PRs.
- ❌ **DO NOT** assume the user is logged in.

**Related Repos:**

- **coinx-backend** — Hono API server (https://github.com/fyndx/coinx-backend)
- **wiki** — Project docs & decisions (https://github.com/fyndx/wiki)
