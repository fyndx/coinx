import AsyncStorage from "@react-native-async-storage/async-storage";
import { Effect } from "effect";
import { StorageError } from "./errors";

// ─── Storage Effects ─────────────────────────────────────────

/**
 * Get an item from AsyncStorage as an Effect.
 * Returns null if the key doesn't exist.
 */
export const getStorageItem = (key: string) =>
	Effect.tryPromise({
		try: () => AsyncStorage.getItem(key),
		catch: (error) =>
			new StorageError({
				message: `Failed to get item from storage: ${key}`,
				key,
				cause: error,
			}),
	});

/**
 * Set an item in AsyncStorage as an Effect.
 */
export const setStorageItem = (key: string, value: string) =>
	Effect.tryPromise({
		try: () => AsyncStorage.setItem(key, value),
		catch: (error) =>
			new StorageError({
				message: `Failed to set item in storage: ${key}`,
				key,
				cause: error,
			}),
	});

/**
 * Remove an item from AsyncStorage as an Effect.
 */
export const removeStorageItem = (key: string) =>
	Effect.tryPromise({
		try: () => AsyncStorage.removeItem(key),
		catch: (error) =>
			new StorageError({
				message: `Failed to remove item from storage: ${key}`,
				key,
				cause: error,
			}),
	});
