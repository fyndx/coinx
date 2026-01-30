import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { AppState, Platform } from "react-native";

const SUPABASE_URL = "https://wevmlplbmdwzgnoodkxw.supabase.co";
const SUPABASE_ANON_KEY = "REPLACE_WITH_ANON_KEY"; // TODO: Move to env config

/**
 * SecureStore adapter for Supabase auth token persistence.
 * Uses expo-secure-store on native, falls back to nothing on web.
 */
const SecureStoreAdapter = {
	getItem: async (key: string): Promise<string | null> => {
		if (Platform.OS === "web") return null;
		return SecureStore.getItemAsync(key);
	},
	setItem: async (key: string, value: string): Promise<void> => {
		if (Platform.OS === "web") return;
		await SecureStore.setItemAsync(key, value);
	},
	removeItem: async (key: string): Promise<void> => {
		if (Platform.OS === "web") return;
		await SecureStore.deleteItemAsync(key);
	},
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
	auth: {
		storage: SecureStoreAdapter,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false, // Not using OAuth redirects
	},
});

/**
 * Auto-refresh session when app comes to foreground.
 * Supabase handles token refresh, but we need to tell it when the app is active.
 */
AppState.addEventListener("change", (state) => {
	if (state === "active") {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});
