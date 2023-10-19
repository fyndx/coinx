import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect } from "react";
import { RootProvider } from "../src/Providers/RootProvider";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../src/model/init-watermelon";

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
  const [loaded, error] = useFonts({
    LatoRegular: require("../assets/fonts/Lato/Lato-Regular.ttf"),
    ...MaterialCommunityIcons.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RootProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </RootProvider>
    </SafeAreaView>
  );
}
