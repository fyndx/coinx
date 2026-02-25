import { HeroUINativeProvider } from "heroui-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<SafeAreaProvider>
			<HeroUINativeProvider>
				{children}
			</HeroUINativeProvider>
		</SafeAreaProvider>
	);
};
