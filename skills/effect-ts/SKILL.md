---
name: effect-ts
description: Effect-TS for typed async operations and error handling. Use when writing database repos, handling errors, or composing async operations in CoinX.
---

# Effect-TS

Typed async operations and error handling for CoinX repos.

## Basic Pattern

```typescript
import { Effect } from "effect";

// Wrap async operation
export const getItems = () =>
  Effect.promise(() => {
    return db.select().from(items).execute();
  });

// Run the effect
const result = await Effect.runPromise(getItems());
```

## Error Handling

### Custom Errors

```typescript
import { Data } from "effect";

// Define typed errors
export class InvalidIdError extends Data.TaggedError("InvalidIdError")<{
  message: string;
}> {}

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  id: string;
}> {}
```

### TryPromise with Catch

```typescript
export const findById = (id: string) =>
  Effect.tryPromise({
    try: () => db.select().from(items).where(eq(items.id, id)).execute(),
    catch: (error) => {
      Effect.logError({ error, operation: "findById", id });
      return new DatabaseError({ message: "Query failed" });
    },
  });
```

## Composition with Pipe

```typescript
import { Effect, pipe } from "effect";

export const updateItem = (item: InsertItem) =>
  pipe(
    // Start with the input
    Effect.succeed(item),
    
    // Validate
    Effect.filterOrFail(
      (val) => val.id !== undefined && val.id.length > 0,
      () => new InvalidIdError({ message: "Invalid ID" }),
    ),
    
    // Perform operation
    Effect.flatMap((validated) =>
      Effect.tryPromise(() =>
        db.update(items).set(validated).where(eq(items.id, validated.id!)).execute()
      )
    ),
    
    // Log errors
    Effect.tapError((error) =>
      Effect.sync(() => console.error("Update failed:", error))
    ),
  );
```

## Common Patterns

### FilterOrFail (Validation)

```typescript
Effect.filterOrFail(
  (value) => value > 0,  // Predicate
  () => new InvalidValueError({ message: "Must be positive" })  // Error if false
)
```

### FlatMap (Chain Operations)

```typescript
pipe(
  getItem(id),
  Effect.flatMap((item) => updateItem({ ...item, name: "New" })),
  Effect.flatMap((updated) => logChange(updated)),
)
```

### TapError (Side Effects on Error)

```typescript
Effect.tapError((error) =>
  Effect.sync(() => {
    console.error("Operation failed:", error);
    // Could also send to error tracking
  })
)
```

## Running Effects

```typescript
// In async function
const result = await Effect.runPromise(myEffect);

// With error handling
Effect.runPromise(myEffect)
  .then((result) => handleSuccess(result))
  .catch((error) => handleError(error));
```

## Repo Pattern

```typescript
import { Effect, pipe } from "effect";

export const addItem = (item: Omit<InsertItem, "id">) =>
  Effect.promise(() => {
    return db
      .insert(items)
      .values({
        id: generateUUID(),
        ...item,
        syncStatus: "pending",
      })
      .returning()
      .execute();
  });

export const deleteItem = (id: string) =>
  pipe(
    Effect.succeed(id),
    Effect.filterOrFail(
      (itemId) => itemId.length > 0,
      () => new InvalidIdError({ message: "Invalid ID" }),
    ),
    Effect.flatMap((validId) =>
      Effect.tryPromise(() =>
        db.delete(items).where(eq(items.id, validId)).execute()
      )
    ),
    Effect.tapError((error) =>
      Effect.sync(() => console.error("Delete failed:", error))
    ),
  );
```

## Model Integration

```typescript
class ItemModel {
  deleteItem = async (id: string) => {
    this.isLoading.set(true);
    
    Effect.runPromise(deleteItemRepo(id))
      .then(() => {
        Burnt.toast({ title: "Deleted successfully" });
        this.refreshList();
      })
      .catch((error) => {
        Burnt.toast({ title: "Delete failed", message: error.message });
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  };
}
```

## Tips

- Use `Effect.promise` for simple async wrapping
- Use `pipe` + `filterOrFail` for validation chains
- Define custom errors with `Data.TaggedError`
- Use `tapError` for logging without changing the error
- Keep repos focused on single operations
