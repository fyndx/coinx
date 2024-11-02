import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalProvider, TamaguiProvider } from "tamagui";
import config from "../../tamagui.config";

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
	const colorScheme = useColorScheme();
	return (
		<SafeAreaProvider>
			<TamaguiProvider
				config={config}
				defaultTheme={colorScheme === "dark" ? "dark_blue" : "light_blue"}
				disableInjectCSS
			>
				<NavigationThemeProvider
					value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
				>
					<PortalProvider>
						<ToastProvider>
							{children}
							<ToastViewport />
						</ToastProvider>
					</PortalProvider>
				</NavigationThemeProvider>
			</TamaguiProvider>
		</SafeAreaProvider>
	);
};
