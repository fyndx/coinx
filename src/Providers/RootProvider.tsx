import type { ReactNode } from "react";

import { ThemeProvider } from "@react-navigation/native";
import { HeroUINativeProvider } from "heroui-native";
import { Platform, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useThemeConfig } from "../hooks/useThemeConfig";

const darkClass = "dark";

export const RootProvider = ({ children }: { children: ReactNode }) => {
  const theme = useThemeConfig();

  const inner = (
    <HeroUINativeProvider>
      <ThemeProvider value={theme}>{children}</ThemeProvider>
    </HeroUINativeProvider>
  );

  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
      // eslint-disable-next-line better-tailwindcss/no-unknown-classes
      className={theme.dark ? darkClass : undefined}
    >
      <StatusBar />
      {Platform.OS === "web" ? (
        inner
      ) : (
        <KeyboardProvider>{inner}</KeyboardProvider>
      )}
    </GestureHandlerRootView>
  );
};
