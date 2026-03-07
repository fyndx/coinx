import type { Theme } from "@react-navigation/native";

import {
  DarkTheme as _DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";

import { useResolvedTheme } from "./useResolvedTheme";

const DarkTheme: Theme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    primary: "#9D34FF", // oklch(0.6204 0.195 253.83) => --accent
    background: "#1C1C1E", // oklch(12% 0.005 285.823) => --background
    text: "#FFFFFF", // oklch(0.9911 0 0) => --snow / --foreground
    border: "#38383A", // oklch(28% 0.006 286.033) => --border
    card: "#2C2C2E", // oklch(0.2103 0.0059 285.89) => --surface
  },
};

const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#9D34FF", // oklch(0.6204 0.195 253.83) => --accent
    background: "#F7F7F7", // oklch(0.9702 0 0) => --background
    text: "#2C2C2E", // oklch(0.2103 0.0059 285.89) => --eclipse / --foreground
    border: "#E5E5EA", // oklch(90% 0.004 286.32) => --border
    card: "#FFFFFF", // oklch(100% 0 0) => --surface
  },
};

export function useThemeConfig() {
  const { isDark } = useResolvedTheme();

  if (isDark) return DarkTheme;

  return LightTheme;
}
