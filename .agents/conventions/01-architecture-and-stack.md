# Architecture & Tech Stack

## Technology Stack
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

## Core Patterns
- **Local-First Architecture:** All data is stored in SQLite on-device. App works 100% offline. Sync is for authenticated users with a pro plan.
- **Cross-Platform Compatibility:** The app must work on Web, iOS, and Android. For native-only libraries (e.g., `react-native-gesture-handler`), always check `Platform.OS === 'web'` to provide a graceful fallback. Use `.web.tsx` or `.web.ts` for web-specific overrides.
- **Auth Flow:** Auth is modular. Supabase handles email/password. App stores tokens in SecureStore/MMKV.

## Project Structure
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
