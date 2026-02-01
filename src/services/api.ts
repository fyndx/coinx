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
): Promise<T> {
	const { method = "GET", body, headers = {} } = options;

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.access_token) {
		throw new Error("Not authenticated");
	}

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
		const error = await response
			.json()
			.catch(() => ({ message: response.statusText }));
		throw new Error(error.message || `API error: ${response.status}`);
	}

	return response.json() as Promise<T>;
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
