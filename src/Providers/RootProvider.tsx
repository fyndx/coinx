import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";
import config from "../../tamagui.config";

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
	const colorScheme = useColorScheme();
	return (
		<SafeAreaProvider>
			<TamaguiProvider
				config={config}
				defaultTheme={colorScheme === "dark" ? "dark_green" : "light_green"}
				disableInjectCSS
			>
				<NavigationThemeProvider
					value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
				>
					<ToastProvider>
						{children}
						<ToastViewport />
					</ToastProvider>
				</NavigationThemeProvider>
			</TamaguiProvider>
		</SafeAreaProvider>
	);
};
