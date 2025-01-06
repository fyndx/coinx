import { Notebook, Package } from "@tamagui/lucide-icons";
import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "tamagui";

export default function RootLayout() {
	return (
		<Tabs>
			<Tabs.Screen
				name={"transactions/index"}
				options={{
					tabBarLabel: () => null,
					tabBarIcon: ({ color, focused, size }) => (
						<Image
							source={require("../../assets/icons/transactions-list.png")}
							width={24}
							height={24}
							tintColor={color}
						/>
					),
					header: () => null,
				}}
			/>
			<Tabs.Screen
				name={"products/index"}
				options={{
					// header: () => null,
					headerTitle: "Products",
					tabBarLabel: () => null,
					tabBarIcon: ({ color, focused, size }) => (
						<Package size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name={"insights/index"}
				options={{
					header: () => null,
					tabBarLabel: () => null,
					tabBarIcon: ({ color }) => (
						<Image
							tintColor={color}
							source={require("../../assets/icons/insights.png")}
							width={24}
							height={24}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name={"budgets/index"}
				options={{
					header: () => null,
					tabBarLabel: () => null,
					tabBarIcon: ({ color }) => (
						<Image
							source={require("../../assets/icons/budgets.png")}
							width={24}
							height={24}
							tintColor={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name={"settings/index"}
				options={{
					header: () => null,
					tabBarLabel: () => null,
					tabBarIcon: ({ color }) => (
						<Image
							source={require("../../assets/icons/settings.png")}
							width={24}
							height={24}
							tintColor={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
