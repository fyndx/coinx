import { useSelector } from "@legendapp/state/react";
import { useColorScheme } from "react-native";

import { themeModel } from "@/src/LegendState/Theme/Theme.model";

export function useResolvedTheme() {
  const themeMode = useSelector(() => themeModel.obs.mode.get());
  const systemTheme = useColorScheme();

  const resolved = themeMode === "system" ? systemTheme : themeMode;
  const isDark = resolved === "dark";

  return { themeMode, resolved, isDark };
}
