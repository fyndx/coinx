import type React from "react";

import { observer, useMount } from "@legendapp/state/react";
import { SplashScreen, useRouter, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect } from "react";
import { Platform } from "react-native";

import { expoDb } from "@/db/client";
import { Splash } from "@/src/Components/Splash";
import { rootStore } from "@/src/LegendState";
import { appModel } from "@/src/LegendState/AppState/App.model";
import { authModel } from "@/src/LegendState/Auth/Auth.model";
import { setupModel } from "@/src/LegendState/Setup/Setup.model";
import { themeModel } from "@/src/LegendState/Theme/Theme.model";
import { RootProvider } from "@/src/Providers/RootProvider";
import { analytics } from "@/src/services/analytics";
import "@/src/utils/date";
import "../global.css";

analytics.init();

// Apply stored theme preference before rendering
themeModel.initTheme();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "index",
};

/**
 * Auth navigation guard.
 * Redirects unauthenticated users to sign-in when they try to access
 * protected routes. Auth is optional — users can skip.
 */
const useProtectedRoute = () => {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = authModel.obs.isAuthenticated.get();
  const isAuthLoading = authModel.obs.isLoading.get();
  const setupStatus = setupModel.obs.status.get();

  useEffect(() => {
    if (isAuthLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inSetupRoute = String(segments[0]) === "setup";

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace("/(auth)/sign-in");
      }
      return;
    }

    if (setupStatus !== "success") {
      if (!inSetupRoute) {
        router.replace("/setup");
      }
      return;
    }

    if (inAuthGroup || inSetupRoute) {
      router.replace("/" as const);
    }
  }, [isAuthenticated, isAuthLoading, router, segments, setupStatus]);
};

let WebToaster: React.ComponentType = () => null;
if (Platform.OS === "web") {
  // Loaded only on web to avoid bundling sonner on native
  const { Toaster } = require("sonner");
  WebToaster = () => <Toaster richColors position="top-right" />;
}

const RootLayoutNav = observer(() => {
  useProtectedRoute();

  return (
    <RootProvider>
      {Platform.OS === "web" && <WebToaster />}
      <Stack screenOptions={{ statusBarStyle: "auto" }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="setup/index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-category/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="categories/index"
          options={{
            headerTitle: "Categories",
            headerTitleAlign: "center",
          }}
        />
        {__DEV__ && (
          <Stack.Screen
            name="playground/index"
            options={{
              headerTitle: "PlayGround",
              headerTitleAlign: "center",
            }}
          />
        )}
        <Stack.Screen
          name="add-transaction/index"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="add-product/index"
          options={{
            headerTitle: "Add Product",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="add-product-listing/index"
          options={{
            headerTitle: "Add Product Listing",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="edit-product-listing/index"
          options={{
            headerTitle: "Edit Product Listing",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name={"currency-select/index"}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={"stores/index"}
          options={{ headerTitle: "Stores", headerTitleAlign: "center" }}
        />
        <Stack.Screen
          name={"add-store/index"}
          options={{
            headerTitle: "Add Store",
            headerTitleAlign: "center",
          }}
        />
      </Stack>
    </RootProvider>
  );
});

/**
 * useDrizzleStudio uses `window` (via useDevToolsPluginClient) which is
 * not available during SSR. Lazy-require it so it's only evaluated in
 * the browser, and only on native (it's a dev-only native tool).
 */
const NativeDrizzleStudio = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useDrizzleStudio } =
    require("expo-drizzle-studio-plugin") as typeof import("expo-drizzle-studio-plugin");
  useDrizzleStudio(expoDb);
  return null;
};

const RootLayout = observer(() => {
  const isAppLoaded = appModel.obs.isAppLoaded.get();

  useMount(() => {
    rootStore.actions.startServices();
  });

  useEffect(() => {
    if (isAppLoaded === true) {
      SplashScreen.hideAsync();
    }
  }, [isAppLoaded]);

  if (isAppLoaded === false) {
    return <Splash />;
  }

  return (
    <>
      {__DEV__ && Platform.OS !== "web" && <NativeDrizzleStudio />}
      <RootLayoutNav />
    </>
  );
});

// Sentry.wrap is only supported on native — web uses @sentry/browser instead
export default Platform.OS === "web"
  ? RootLayout
  : require("@sentry/react-native").wrap(RootLayout);
