import { Tabs } from "expo-router";
import { Notebook, Package } from "lucide-react-native";
import { Image } from "react-native";

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
							style={{ width: 24, height: 24, tintColor: color }}
						/>
					),
					header: () => null,
				}}
			/>
			<Tabs.Screen
				name={"products/index"}
				options={{
					tabBarLabel: () => null,
					tabBarIcon: ({ color, focused, size }) => (
						<Package size={size} color={color} />
					),
					header: () => null,
				}}
			/>
			<Tabs.Screen
				name={"insights/index"}
				options={{
					href: null,
					header: () => null,
					tabBarLabel: () => null,
					tabBarIcon: ({ color }) => (
						<Image
							style={{ width: 24, height: 24, tintColor: color }}
							source={require("../../assets/icons/insights.png")}
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
							style={{ width: 24, height: 24, tintColor: color }}
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
							style={{ width: 24, height: 24, tintColor: color }}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
