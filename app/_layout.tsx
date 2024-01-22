import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect } from "react";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { RootProvider } from "../src/Providers/RootProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "@/db/client";
import migrations from "@/drizzle/migrations";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

export default function RootLayout() {
  const [hasLoadedFonts, loadingFontsError] = useFonts({
    LatoRegular: require("../assets/fonts/Lato/Lato-Regular.ttf"),
    ...MaterialCommunityIcons.font,
  });

  const { success: hasRunMigrations, error: migrationsError } = useMigrations(
    db,
    migrations
  );

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (loadingFontsError) throw loadingFontsError;
    if (migrationsError) throw migrationsError;
  }, [loadingFontsError, migrationsError]);

  useEffect(() => {
    if (hasLoadedFonts && hasRunMigrations) {
      SplashScreen.hideAsync();
    }
  }, [hasLoadedFonts, hasRunMigrations]);

  if (!hasLoadedFonts || !hasRunMigrations) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <RootProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="add-category/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="categories/index"
              options={{ headerShown: false }}
            />
          </Stack>
        </RootProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
