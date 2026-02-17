# Sync V2 Service

Effect.ts-based synchronization manager for CoinX mobile app. Handles bidirectional sync between local SQLite database and backend server.

## Architecture

The sync service is organized into focused modules:

```
sync/
├── index.ts          # Main export and singleton instance
├── manager.ts        # SyncManager class (orchestrator)
├── types.ts          # TypeScript types and interfaces
├── errors.ts         # Custom Error classes
├── storage.ts        # AsyncStorage Effect wrappers
├── auth.ts           # Authentication Effect wrappers
├── api.ts            # API Effect wrappers
└── database.ts       # Database Effect wrappers
```

## Module Overview

### `types.ts`
Core TypeScript types and interfaces for the sync system:
- `SyncableRecord` - Base interface for syncable database records
- `ChangeSet` - Upserted and deleted record sets
- `SyncChanges` - Changes across all tables
- `SyncState` - Current sync status and metadata
- `STORAGE_KEYS` - Storage key constants

### `errors.ts`
Custom typed errors using Effect's `Data.TaggedError`:
- `SyncInitializationError` - Initialization failures
- `DeviceRegistrationError` - Device registration failures
- `SyncPushError` - Push operation failures
- `SyncPullError` - Pull operation failures
- `DatabaseError` - Database operation failures
- `StorageError` - Storage operation failures
- `AuthenticationError` - Authentication failures
- `SyncCancelledError` - Cancelled sync operations

### `storage.ts`
AsyncStorage operations wrapped as Effects:
- `getStorageItem(key)` - Get value from storage
- `setStorageItem(key, value)` - Set value in storage
- `removeStorageItem(key)` - Remove value from storage

### `auth.ts`
Supabase authentication wrapped as Effects:
- `getCurrentSession()` - Get current auth session
- `checkAuthentication()` - Verify user is logged in

### `api.ts`
API client wrapped as Effects:
- `apiPost<T>(path, body?)` - POST request with error handling

### `database.ts`
Database operations wrapped as Effects:
- `collectPendingRecords(table)` - Get pending records from table
- `markRecordsSyncedForTable(table, ids)` - Mark records as synced
- `applyTableChanges(table, changeSet)` - Apply remote changes locally
- `splitChanges(records)` - Split records into upserted/deleted sets

### `manager.ts`
Main SyncManager class that orchestrates the sync flow:
- Device registration
- Push/pull sync operations
- State management
- Subscription system

## Usage

### Initialization

```typescript
import { syncManager } from "@/services/sync";
import { Effect } from "effect";

// Initialize during app startup (after auth)
await Effect.runPromise(syncManager.initialize());
```

### Trigger Sync

```typescript
// Manual sync (checks auth automatically)
await syncManager.syncIfAuthenticated();

// Debounced sync after local changes
syncManager.scheduleSyncAfterChange();
```

### Subscribe to State Changes

```typescript
const unsubscribe = syncManager.subscribe((state) => {
  console.log("Status:", state.status);
  console.log("Last synced:", state.lastSyncedAt);
  console.log("Error:", state.error);
});

// Later: unsubscribe
unsubscribe();
```

### Get Current State

```typescript
const state = syncManager.getState();
console.log(state.status); // 'idle' | 'pushing' | 'pulling' | 'error' | 'success'
```

### Reset on Logout

```typescript
import { Effect } from "effect";

// Clear sync state and storage
await Effect.runPromise(syncManager.reset());
```

### Cleanup

```typescript
// Remove listeners and subscriptions
syncManager.destroy();
```

## Effect Composition Examples

### Using Individual Effects

```typescript
import { Effect } from "effect";
import { getStorageItem, setStorageItem } from "@/services/sync";

// Get value
const deviceIdEffect = getStorageItem("coinx:sync:deviceId");
const deviceId = await Effect.runPromise(deviceIdEffect);

// Set value
const setEffect = setStorageItem("coinx:sync:deviceId", "new-id");
await Effect.runPromise(setEffect);
```

### Composing Effects with Pipe

```typescript
import { Effect, pipe } from "effect";
import { checkAuthentication, apiPost } from "@/services/sync";

const registerDevice = () =>
  pipe(
    checkAuthentication(),
    Effect.flatMap(() =>
      apiPost<{ data: { id: string } }>("/api/auth/device", {
        platform: "ios",
        deviceName: "My iPhone",
      })
    ),
    Effect.map((response) => response.data.id),
    Effect.tapError((error) =>
      Effect.sync(() => console.error("Registration failed:", error))
    )
  );

// Run the effect
const deviceId = await Effect.runPromise(registerDevice());
```

### Error Handling

```typescript
import { Effect } from "effect";
import { DatabaseError, StorageError } from "@/services/sync";

const myEffect = pipe(
  someEffect,
  Effect.catchTag("DatabaseError", (error) =>
    Effect.sync(() => {
      console.error("DB error:", error.message);
      return null;
    })
  ),
  Effect.catchTag("StorageError", (error) =>
    Effect.sync(() => {
      console.error("Storage error:", error.message);
      return null;
    })
  )
);
```

## Sync Flow

1. **Initialize** - Load device ID and last sync timestamp from storage
2. **Check Auth** - Verify user is logged in
3. **Ensure Device** - Register device if needed
4. **Push** - Send local changes to server
   - Collect pending records
   - Split into upserted/deleted sets
   - Send to backend
5. **Pull** - Get remote changes from server
   - Fetch changes since last sync
   - Apply to local database
6. **Commit** - Mark pushed records as synced, update timestamp
7. **Notify** - Update state and notify listeners

## Benefits of Effect.ts

✅ **Type Safety** - All errors are typed and handled explicitly  
✅ **Composability** - Operations chain together using `pipe` and `flatMap`  
✅ **Testability** - Each Effect can be mocked and tested in isolation  
✅ **Declarative** - Clear separation between effect definition and execution  
✅ **Error Handling** - Structured error types with proper propagation  
✅ **Maintainability** - Each module has a single responsibility

## Migration from V1

The API is identical to the original `SyncManager`:

```typescript
// V1
import { syncManager } from "@/services/sync";
await syncManager.initialize();

// V2
import { syncManager } from "@/services/sync";
import { Effect } from "effect";
await Effect.runPromise(syncManager.initialize());
```

The main difference is that Effect-returning methods need to be run with `Effect.runPromise()`.

## Testing

Each module can be tested independently:

```typescript
import { Effect } from "effect";
import { getStorageItem, setStorageItem } from "@/services/sync";

describe("Storage Effects", () => {
  it("should get and set storage items", async () => {
    await Effect.runPromise(setStorageItem("test", "value"));
    const value = await Effect.runPromise(getStorageItem("test"));
    expect(value).toBe("value");
  });
});
```

## Future Enhancements

- [ ] Add retry logic with exponential backoff
- [ ] Add conflict resolution strategies
- [ ] Add partial sync for large datasets
- [ ] Add sync metrics and telemetry
- [ ] Add offline queue for failed syncs
- [ ] Add sync progress events
