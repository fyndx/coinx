import { env } from "./env";
import { supabase } from "./supabase";

type RequestOptions = {
	method?: "GET" | "POST" | "PUT" | "DELETE";
	body?: unknown;
	headers?: Record<string, string>;
};

/**
 * Authenticated API client for CoinX backend.
 * Automatically injects the Supabase JWT as Bearer token.
 */
export async function apiClient<T = unknown>(
	path: string,
	options: RequestOptions = {},
): Promise<T | undefined> {
	const { method = "GET", body, headers = {} } = options;

	let {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	// Check if session exists and token isn't expired
	const isExpired =
		session?.expires_at && session.expires_at * 1000 < Date.now();

	if (error || !session?.access_token || isExpired) {
		const { data } = await supabase.auth.refreshSession();
		if (!data.session?.access_token) {
			throw new Error("Not authenticated");
		}
		session = data.session;
	}

	try {
		const response = await fetch(`${env.EXPO_PUBLIC_BACKEND_URL}${path}`, {
			method,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
				...headers,
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			const errorBody = await response
				.json()
				.catch(() => ({ message: response.statusText }));
			// Backend returns { error: { code, message, status } }
			const errorMessage =
				errorBody?.error?.message || errorBody?.message || response.statusText;
			throw new Error(
				`API error [${method} ${path}]: ${errorMessage} (${response.status})`,
			);
		}

		// Check if response has content before parsing JSON
		const text = await response.text();
		if (!text || text.trim() === "") {
			return undefined as T;
		}

		return JSON.parse(text) as T;
	} catch (err) {
		if (err instanceof TypeError) {
			throw new Error(`Network error [${method} ${path}]: ${err.message}`);
		}
		throw err;
	}
}

/**
 * Convenience methods
 */
export const api = {
	get: <T = unknown>(path: string) => apiClient<T>(path, { method: "GET" }),

	post: <T = unknown>(path: string, body?: unknown) =>
		apiClient<T>(path, { method: "POST", body }),

	put: <T = unknown>(path: string, body?: unknown) =>
		apiClient<T>(path, { method: "PUT", body }),

	delete: <T = unknown>(path: string) =>
		apiClient<T>(path, { method: "DELETE" }),
};
