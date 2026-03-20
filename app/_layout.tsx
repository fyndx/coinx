import { observer, useMount } from "@legendapp/state/react";
import * as Sentry from "@sentry/react-native";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { SplashScreen, useRouter, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect } from "react";

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

const RootLayoutNav = observer(() => {
  useProtectedRoute();

  return (
    <RootProvider>
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

const RootLayout = observer(() => {
  const isAppLoaded = appModel.obs.isAppLoaded.get();
  if (__DEV__) {
    useDrizzleStudio(expoDb);
  }

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

  return <RootLayoutNav />;
});

export default Sentry.wrap(RootLayout);
