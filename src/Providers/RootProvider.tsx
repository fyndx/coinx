import { HeroUINativeProvider } from "heroui-native";
import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

export const RootProvider = ({ children }: { children: ReactNode }) => {
	return (
		<SafeAreaProvider>
			<HeroUINativeProvider>
				{children}
			</HeroUINativeProvider>
		</SafeAreaProvider>
	);
};
