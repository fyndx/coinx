import { observable } from "@legendapp/state";
import { MMKV } from "react-native-mmkv";
import { Uniwind } from "uniwind";

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
	Uniwind.setTheme(mode);
};

export const initTheme = () => {
	const mode = getStoredTheme();
	Uniwind.setTheme(mode);
};
