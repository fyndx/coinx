import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { AppState, Platform } from "react-native";
import { env } from "./env";

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

export const supabase = createClient(
	env.EXPO_PUBLIC_SUPABASE_URL,
	env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
	{
		auth: {
			storage: SecureStoreAdapter,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
		},
	},
);

/**
 * Auto-refresh session when app comes to foreground.
 */
AppState.addEventListener("change", (state) => {
	if (state === "active") {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});
