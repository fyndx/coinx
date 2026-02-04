import { api } from "@/src/services/api";
import { supabase } from "@/src/services/supabase";
import { syncManager } from "@/src/services/sync";
import type { Session, User } from "@supabase/supabase-js";
import { observable } from "@legendapp/state";

type AuthState = {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	error: string | null;
};

export class AuthModel {
	obs;

	constructor() {
		this.obs = observable<AuthState>({
			user: null,
			session: null,
			isLoading: true,
			isAuthenticated: false,
			error: null,
		});
	}

	/**
	 * Initialize auth — restore session and listen for changes.
	 * Call this once during app startup.
	 */
	initialize = async () => {
		try {
			// Restore existing session
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session) {
				this.obs.user.set(session.user);
				this.obs.session.set(session);
				this.obs.isAuthenticated.set(true);
			}
		} catch (error) {
			console.error("Auth initialization error:", error);
		} finally {
			this.obs.isLoading.set(false);
		}

		// Listen for auth state changes (sign in, sign out, token refresh)
		supabase.auth.onAuthStateChange((_event, session) => {
			this.obs.session.set(session);
			this.obs.user.set(session?.user ?? null);
			this.obs.isAuthenticated.set(!!session);
		});
	};

	/**
	 * Sign up with email and password.
	 * On success, upserts profile on the backend.
	 */
	signUp = async (email: string, password: string) => {
		this.obs.isLoading.set(true);
		this.obs.error.set(null);

		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) {
				this.obs.error.set(error.message);
				return { success: false, error: error.message };
			}

			// Register profile on backend
			if (data.session) {
				try {
					await api.post("/api/auth/register");
				} catch (e) {
					console.warn("Backend profile registration failed:", e);
					// Don't block auth — backend profile can be created later
				}

				// Trigger initial sync after sign up
				syncManager.syncIfAuthenticated();
			}

			return { success: true, needsConfirmation: !data.session };
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Sign up failed";
			this.obs.error.set(message);
			return { success: false, error: message };
		} finally {
			this.obs.isLoading.set(false);
		}
	};

	/**
	 * Sign in with email and password.
	 * On success, upserts profile on the backend.
	 */
	signIn = async (email: string, password: string) => {
		this.obs.isLoading.set(true);
		this.obs.error.set(null);

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				this.obs.error.set(error.message);
				return { success: false, error: error.message };
			}

			// Ensure profile exists on backend
			try {
				await api.post("/api/auth/register");
			} catch (e) {
				console.warn("Backend profile registration failed:", e);
			}

			// Trigger sync after sign in
			syncManager.syncIfAuthenticated();

			return { success: true };
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Sign in failed";
			this.obs.error.set(message);
			return { success: false, error: message };
		} finally {
			this.obs.isLoading.set(false);
		}
	};

	/**
	 * Sign out and clear session.
	 * Also resets sync state (deviceId, lastSyncedAt).
	 */
	signOut = async () => {
		this.obs.isLoading.set(true);
		try {
			await syncManager.reset();
			await supabase.auth.signOut();
		} catch (error) {
			console.error("Sign out error:", error);
		} finally {
			this.obs.isLoading.set(false);
		}
	};

	/**
	 * Clear error state.
	 */
	clearError = () => {
		this.obs.error.set(null);
	};

	actions = {
		initialize: this.initialize,
		signUp: this.signUp,
		signIn: this.signIn,
		signOut: this.signOut,
		clearError: this.clearError,
	};
}

export const authModel = new AuthModel();
