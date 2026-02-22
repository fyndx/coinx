import { Text } from "@/src/Components/ui/Text";
import { Construction } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Budgets = () => {
	return (
		<SafeAreaView style={styles.container}>
			<View className="flex-1 justify-center items-center">
				<Construction size={32} color="#d97706" />
				<Text className="text-3xl font-bold text-center mt-4">
					{"Budgets Coming Soon"}
				</Text>
				<Text className="text-center mt-2">
					{"This feature is currently in development"}
				</Text>
			</View>
		</SafeAreaView>
	);
};

export default Budgets;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
