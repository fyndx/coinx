import { Effect, pipe } from "effect";
import { supabase } from "../supabase";
import { AuthenticationError } from "./errors";

// ─── Auth Effects ────────────────────────────────────────────

/**
 * Get the current Supabase session as an Effect.
 */
export const getCurrentSession = () =>
	Effect.tryPromise({
		try: async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			return session;
		},
		catch: (error) =>
			new AuthenticationError({
				message: "Failed to get current session",
			}),
	});

/**
 * Check if the user is authenticated.
 * Fails with AuthenticationError if no valid session exists.
 */
export const checkAuthentication = () =>
	pipe(
		getCurrentSession(),
		Effect.filterOrFail(
			(session) => session?.access_token !== undefined,
			() =>
				new AuthenticationError({
					message: "User is not authenticated",
				}),
		),
	);
