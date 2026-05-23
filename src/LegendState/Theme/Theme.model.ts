import { observable } from "@legendapp/state";
import { Uniwind } from "uniwind";

import type { IKVStorage } from "@/src/storage/kvStorage";

import { createKVStorage } from "@/src/storage/kvStorage";

export type ThemeMode = "light" | "dark" | "system";

let _storage: IKVStorage | null = null;

function getThemeStorage(): IKVStorage {
  if (!_storage) {
    _storage = createKVStorage("theme-storage");
  }
  return _storage;
}

const isThemeMode = (value?: string): value is ThemeMode =>
  value === "light" || value === "dark" || value === "system";

export class ThemeModel {
  obs;

  constructor() {
    const stored = getThemeStorage().getString("themeMode");
    this.obs = observable({
      mode: isThemeMode(stored) ? stored : ("system" as ThemeMode),
    });
  }

  setTheme = (mode: ThemeMode) => {
    getThemeStorage().set("themeMode", mode);
    this.obs.mode.set(mode);
    Uniwind.setTheme(mode);
  };

  initTheme = () => {
    const stored = getThemeStorage().getString("themeMode");
    const mode = isThemeMode(stored) ? stored : "system";
    Uniwind.setTheme(mode);
  };
}

export const themeModel = new ThemeModel();
