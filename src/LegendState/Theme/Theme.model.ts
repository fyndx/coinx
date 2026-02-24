import { observable } from "@legendapp/state";
import { MMKV } from "react-native-mmkv";
import { Uniwind } from "uniwind";

export type ThemeMode = "light" | "dark" | "system";

const storage = new MMKV({ id: "theme-storage" });

const isThemeMode = (value?: string): value is ThemeMode =>
	value === "light" || value === "dark" || value === "system";

export class ThemeModel {
	obs;

	constructor() {
		const stored = storage.getString("themeMode");
		this.obs = observable({
			mode: isThemeMode(stored) ? stored : ("system" as ThemeMode),
		});
	}

	setTheme = (mode: ThemeMode) => {
		storage.set("themeMode", mode);
		this.obs.mode.set(mode);
		Uniwind.setTheme(mode);
	};

	initTheme = () => {
		const stored = storage.getString("themeMode");
		const mode = isThemeMode(stored) ? stored : "system";
		Uniwind.setTheme(mode);
	};
}

export const themeModel = new ThemeModel();
