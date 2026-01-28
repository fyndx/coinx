---
name: coinx
description: CoinX app architecture and patterns. Use when working on CoinX features, understanding the codebase structure, or implementing new functionality.
---

# CoinX

Personal finance app built with Expo, Drizzle, Legend State, and Tamagui.

## Architecture

```
app/                    # Expo Router screens
├── (tabs)/             # Tab navigation screens
├── add-*/              # Modal/form screens
└── _layout.tsx         # Root layout + app init

src/
├── Components/         # Shared UI components
├── Containers/         # Feature-specific UI
├── LegendState/        # State management models
│   ├── index.ts        # Root store
│   ├── AppState/       # App-level state
│   └── [Feature]/      # Feature models
├── database/           # Database repos
│   ├── [Entity]/       # Entity-specific repos
│   └── seeds/          # Seed data generators
└── utils/              # Utilities

db/
├── client.ts           # Database connection
├── schema.ts           # Drizzle schema
└── migrations/         # Custom migrations
```

## Data Flow

```
Screen (app/) 
  → Model (LegendState/) 
    → Repo (database/) 
      → Drizzle (db/)
```

## Adding a Feature

### 1. Schema (db/schema.ts)

```typescript
export const newEntity = sqliteTable("coinx_new_entity", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  // ... fields
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at"),
  syncStatus: text("sync_status", { enum: ["pending", "synced"] }).default("pending"),
  deletedAt: text("deleted_at"),
});
```

Then run: `bun generate`

### 2. Repo (src/database/NewEntity/NewEntityRepo.ts)

```typescript
import { Effect } from "effect";
import { db } from "@/db/client";
import { newEntity } from "@/db/schema";
import { generateUUID } from "@/src/utils/uuid";

export const getAll = () =>
  Effect.promise(() => db.select().from(newEntity).execute());

export const add = (data: Omit<InsertNewEntity, "id">) =>
  Effect.promise(() =>
    db.insert(newEntity).values({
      id: generateUUID(),
      ...data,
      syncStatus: "pending",
    }).returning().execute()
  );
```

### 3. Model (src/LegendState/NewEntity/NewEntity.model.ts)

```typescript
import { observable } from "@legendapp/state";
import { Effect } from "effect";
import * as Burnt from "burnt";
import { getAll, add } from "@/src/database/NewEntity/NewEntityRepo";

export class NewEntityModel {
  items = observable([]);
  isLoading = observable(false);

  load = async () => {
    this.isLoading.set(true);
    try {
      const items = await Effect.runPromise(getAll());
      this.items.set(items);
    } finally {
      this.isLoading.set(false);
    }
  };

  create = async (data) => {
    await Effect.runPromise(add(data));
    Burnt.toast({ title: "Created successfully" });
    this.load();
  };
}
```

### 4. Register in Root Store (src/LegendState/index.ts)

```typescript
import { NewEntityModel } from "./NewEntity/NewEntity.model";

class RootStore {
  // ...existing models
  newEntityModel = new NewEntityModel();
}
```

### 5. Screen (app/new-entity/index.tsx)

```typescript
import { observer } from "@legendapp/state/react";
import { rootStore } from "@/src/LegendState";

const NewEntityScreen = observer(() => {
  const { newEntityModel } = rootStore;
  // ...
});
```

## Conventions

### IDs
- All IDs are UUIDs (strings)
- Generate with `generateUUID()` from `@/src/utils/uuid`

### Sync Fields
All tables have:
- `syncStatus`: "pending" | "synced"
- `deletedAt`: soft delete timestamp

### Error Handling
- Use Effect-TS in repos
- Use Burnt.toast for user feedback
- Log errors with console.error

### Naming
- Repos: `[Entity]Repo.ts`
- Models: `[Entity].model.ts`
- Screens: `app/[entity]/index.tsx`

## Key Files

- **App init**: `src/LegendState/AppState/App.model.ts`
- **Root store**: `src/LegendState/index.ts`
- **DB client**: `db/client.ts`
- **Schema**: `db/schema.ts`
- **UUID util**: `src/utils/uuid.ts`

## Related Skills

- `expo-drizzle` - Database operations
- `legend-state` - State management
- `effect-ts` - Async/error handling
- `tamagui` - UI components
