import { Effect } from "effect";
import { api } from "../api";
import { DatabaseError } from "./errors";

// ─── API Effects ─────────────────────────────────────────────

/**
 * Make a POST request to the API as an Effect.
 * Wraps the api.post method with proper error handling.
 */
export const apiPost = <T>(path: string, body?: unknown) =>
	Effect.tryPromise({
		try: () => api.post<T>(path, body),
		catch: (error) =>
			new DatabaseError({
				message: `API POST ${path} failed: ${error instanceof Error ? error.message : String(error)}`,
				operation: `POST ${path}`,
				cause: error,
			}),
	});
