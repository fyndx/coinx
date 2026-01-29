import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { HeroUINativeProvider } from "heroui-native";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
	const colorScheme = useColorScheme();
	return (
		<SafeAreaProvider>
			<HeroUINativeProvider>
				<NavigationThemeProvider
					value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
				>
					{children}
				</NavigationThemeProvider>
			</HeroUINativeProvider>
		</SafeAreaProvider>
	);
};
