import { Data } from "effect";

// ─── Custom Sync Errors ──────────────────────────────────────

export class SyncInitializationError extends Data.TaggedError(
	"SyncInitializationError",
)<{
	message: string;
	cause?: unknown;
}> {}

export class DeviceRegistrationError extends Data.TaggedError(
	"DeviceRegistrationError",
)<{
	message: string;
	cause?: unknown;
}> {}

export class SyncPushError extends Data.TaggedError("SyncPushError")<{
	message: string;
	cause?: unknown;
}> {}

export class SyncPullError extends Data.TaggedError("SyncPullError")<{
	message: string;
	cause?: unknown;
}> {}

export class ApiError extends Data.TaggedError("ApiError")<{
	message: string;
	operation: string;
	cause?: unknown;
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
	message: string;
	operation: string;
	cause?: unknown;
}> {}

export class StorageError extends Data.TaggedError("StorageError")<{
	message: string;
	key: string;
	cause?: unknown;
}> {}

export class AuthenticationError extends Data.TaggedError(
	"AuthenticationError",
)<{
	message: string;
}> {}

export class SyncCancelledError extends Data.TaggedError("SyncCancelledError")<{
	message: string;
}> {}
