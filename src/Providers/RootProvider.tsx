import React from "react";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import config from "../../tamagui.config";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";

export const RootProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  return (
    <TamaguiProvider
      config={config}
      defaultTheme={colorScheme === "dark" ? "dark" : "light"}
      disableInjectCSS
    >
      <NavigationThemeProvider
        value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        {children}
      </NavigationThemeProvider>
    </TamaguiProvider>
  );
};
