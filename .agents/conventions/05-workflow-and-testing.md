# Workflow, Testing & QA

## Development Workflow
**Essential Commands:**
```bash
pnpm install            # Install dependencies
pnpm start              # Start dev server
pnpm ios                # Run iOS simulator
pnpm android            # Run Android emulator
pnpm lint               # Run linter
pnpm type-check         # TypeScript validation
pnpm db:generate        # Generate Drizzle migrations
pnpm db:push            # Push migrations to local DB
```

## Essential Rules
- ✅ **DO** act as a Staff/Principal Engineer: stick to the established stack, enforce best practices, and avoid fragmenting the codebase.
- ✅ **DO** write proper **Unit Tests** and **E2E Tests** for all new features and bug fixes. Ensure they run reliably in GitHub Actions.
- ✅ **DO** use **TypeScript** everywhere in strict mode.
- ✅ **DO** use **Effect-TS** for error handling.
- ✅ **DO** follow PR Guidelines: Create feature branches, ensure `pnpm lint` passes, write focused commits.
- ✅ **DO** use MMKV storage for fast and secure data (prefer over AsyncStorage where feasible).
- ❌ **DO NOT** push directly to `main` — always use PRs.
- ❌ **DO NOT** modify native `android/`/`ios/` directories directly; use Expo config plugins.

## Analytics
- Log critical user actions using `analytics.logEvent(eventName, params)` from `src/services/analytics.ts`. Wrap analytics calls in `try/catch` to avoid disrupting user flow if they fail.
