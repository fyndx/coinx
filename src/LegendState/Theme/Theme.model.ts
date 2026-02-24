import { observable } from "@legendapp/state";
import { Appearance } from "react-native";
import { MMKV } from "react-native-mmkv";

export type ThemeMode = "light" | "dark" | "system";

const storage = new MMKV({ id: "theme-storage" });

const getStoredTheme = (): ThemeMode => {
	return (storage.getString("themeMode") as ThemeMode) ?? "system";
};

export const themeModel = observable({
	mode: getStoredTheme(),
});

export const setTheme = (mode: ThemeMode) => {
	storage.set("themeMode", mode);
	themeModel.mode.set(mode);
	Appearance.setColorScheme(mode === "system" ? null : mode);
};

export const initTheme = () => {
	const mode = getStoredTheme();
	Appearance.setColorScheme(mode === "system" ? null : mode);
};
