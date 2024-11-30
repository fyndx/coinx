import { expoDb } from "@/db/client";
import { Splash } from "@/src/Components/Splash";
import { rootStore } from "@/src/LegendState";
import { appModel } from "@/src/LegendState/AppState/App.model";
import { RootProvider } from "@/src/Providers/RootProvider";
import { observer, useMount } from "@legendapp/state/react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import isYesterday from "dayjs/plugin/isYesterday";
import localeData from "dayjs/plugin/localeData";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { SplashScreen } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isTomorrow);
dayjs.extend(customParseFormat);
dayjs.extend(localeData);

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
						<Stack.Screen name="index" options={{ headerShown: false }} />
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
					</Stack>
				</RootProvider>
			</GestureHandlerRootView>
		</>
	);
};

const RootLayout = observer(() => {
	const isAppLoaded = appModel.obs.isAppLoaded.get();
	if (!process.env.EXPO_PUBLIC_DISABLE_FEATURE) {
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

	// TODO: Pass the initial route to the RootLayoutNav component.
	return <RootLayoutNav />;
});

export default RootLayout;
