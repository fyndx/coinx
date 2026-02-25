import type { ReactNode } from "react";

import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { HeroUINativeProvider } from "heroui-native";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "../../global.css";

export const RootProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <HeroUINativeProvider>
        <ThemeProvider
          value={
            colorScheme === "dark"
              ? NavigationDarkTheme
              : NavigationDefaultTheme
          }
        >
          {children}
        </ThemeProvider>
      </HeroUINativeProvider>
    </SafeAreaProvider>
  );
};
