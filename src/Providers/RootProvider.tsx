import type { ReactNode } from "react";

import { ThemeProvider } from "@react-navigation/native";
import { HeroUINativeProvider } from "heroui-native";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useThemeConfig } from "../hooks/useThemeConfig";

export const RootProvider = ({ children }: { children: ReactNode }) => {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
      // eslint-disable-next-line better-tailwindcss/no-unknown-classes
      className={theme.dark ? `dark` : undefined}
    >
      <StatusBar />
      <KeyboardProvider>
        <HeroUINativeProvider>
          <ThemeProvider value={theme}>{children}</ThemeProvider>
        </HeroUINativeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};
