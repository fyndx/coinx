import { SplashScreen } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect } from "react";
import { RootProvider } from "@/src/Providers/RootProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { observer, useMount } from "@legendapp/state/react";
import { rootStore } from "@/src/LegendState";
import { expoDb } from "@/db/client";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isTomorrow);
dayjs.extend(customParseFormat);

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: "index",
};

const RootLayoutNav = () => {
	return (
		<>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<RootProvider>
					<Stack screenOptions={{ statusBarStyle: "dark" }}>
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen
							name="add-category/index"
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="categories/index"
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="test/index"
							options={{ headerTitle: "Test", headerTitleAlign: "center" }}
						/>
					</Stack>
				</RootProvider>
			</GestureHandlerRootView>
		</>
	);
};

const RootLayout = observer(() => {
	const isAppLoaded = rootStore.appModel.obs.isAppLoaded.get();
	useDrizzleStudio(expoDb);

	useMount(() => {
		rootStore.actions.startServices();
	});

	useEffect(() => {
		if (isAppLoaded === true) {
			SplashScreen.hideAsync();
		}
	}, [isAppLoaded]);

	if (isAppLoaded === false) {
		return null;
	}

	return <RootLayoutNav />;
});

export default RootLayout;
