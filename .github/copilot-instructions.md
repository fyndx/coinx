# Project Context
- This is a React Native/Expo mobile app project using TypeScript
- Uses Tamagui for UI components and styling
- Uses LegendState for state management
- Uses SQLite with Drizzle ORM for data persistence
- Uses Expo Router for navigation
- Used Effect.ts Library for writing safe and sound code using functional programming patterns

# Key Technologies & Patterns
- State Management: Uses `@legendapp/state` with observable patterns
- UI Components: Tamagui components like Stack, XStack, YStack, Button, etc.
- Navigation: Expo Router with tabs and stack navigation
- Database: SQLite with Drizzle ORM for schema management
- Testing: Uses Biome for linting and TypeScript for type checking

# Code Organization
- Models follow a class-based pattern with observable state
- Uses repository pattern for database operations
- Components are organized by feature in separate directories
- Follows atomic design with reusable components

# Coding Standards
1. Use TypeScript with strict type checking
2. Follow object-oriented patterns for models
3. Use observable state patterns with LegendState
4. Implement proper error handling with Effect.ts
5. Follow Expo and React Native best practices
6. Use Tamagui components for consistent UI
7. Follow functional patterns and use Effect.ts for repos (db access)

# Common Patterns to Follow
1. Screen components use the observer pattern from LegendState
2. Database operations are wrapped in Effect.ts for error handling
3. UI components accept model props with $ suffix (e.g. `transactionModel$`)
4. Use Suspense and error boundaries for loading states
5. Follow mobile-first responsive design patterns

# Key Files & Components
- Root store configuration in `src/LegendState/index.ts`
- Database schema in `db/schema.ts`
- Navigation configuration in `app/_layout.tsx`
- Core models in `src/LegendState/` directory
- Reusable components in `src/Components/`

# Architectural Decisions
1. Use class-based models for complex state management
2. Implement repository pattern for database operations
3. Use Effect.ts for functional error handling
4. Follow Expo's file-based routing convention
5. Organize code by feature/domain