# CLAUDE.md — Claude Code Instructions

Quick reference for Claude Code sessions working on CoinX.

## Before You Code

1. **Read the design doc first** — Check `wiki/Projects/CoinX/` for specs
2. **Check current phase** — See `wiki/Projects/CoinX/Phases/`
3. **Understand the schema** — Look at `db/schema.ts`

## Key Files to Know

| File | Purpose |
|------|---------|
| `db/schema.ts` | All table definitions |
| `src/LegendState/index.ts` | State initialization |
| `src/services/api.ts` | HTTP client with auth |
| `src/services/supabase.ts` | Supabase client |
| `app/_layout.tsx` | Root layout & providers |

## Do's

- ✅ Write design doc before implementing complex features
- ✅ Use Drizzle ORM for all database operations
- ✅ Use Legend State for state management
- ✅ Set `syncStatus: 'pending'` on local changes
- ✅ Soft delete via `deletedAt`, never hard delete
- ✅ Handle both authenticated and unauthenticated states
- ✅ Create small, focused PRs

## Don'ts

- ❌ Don't skip the design doc for sync/auth features
- ❌ Don't use raw SQL — use Drizzle
- ❌ Don't hard delete records
- ❌ Don't push directly to main
- ❌ Don't assume user is logged in

## Sync Implementation Notes

When implementing sync:
1. Check auth state BEFORE any sync operation
2. No sync UI/logic for logged-out users
3. Handle token expiration gracefully
4. Cancel in-flight sync on logout
5. Mark records synced ONLY after server confirms

## Testing Checklist

Before submitting PR:
- [ ] Works when logged out
- [ ] Works when logged in
- [ ] Works offline
- [ ] Works after token expiry
- [ ] No console errors in dev mode

## Backend API

Base URL: `EXPO_PUBLIC_API_URL`

Key endpoints:
- `POST /api/auth/register` — Create profile
- `POST /api/auth/device` — Register device
- `POST /api/sync/push` — Upload local changes
- `POST /api/sync/pull` — Download remote changes

All endpoints require `Authorization: Bearer <supabase_token>`.
