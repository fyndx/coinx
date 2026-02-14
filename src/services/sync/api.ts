import { Effect } from "effect";
import { api } from "../api";
import { ApiError } from "./errors";

// ─── API Effects ─────────────────────────────────────────────

/**
 * Make a POST request to the API as an Effect.
 * Wraps the api.post method with proper error handling.
 * Throws ApiError - callers should map to domain-specific errors
 * (e.g., AuthenticationError, SyncPushError) as needed.
 */
export const apiPost = <T>(path: string, body?: unknown) =>
	Effect.tryPromise({
		try: () => api.post<T>(path, body),
		catch: (error) =>
			new ApiError({
				message: `API POST ${path} failed: ${error instanceof Error ? error.message : String(error)}`,
				operation: `POST ${path}`,
				cause: error,
			}),
	});
