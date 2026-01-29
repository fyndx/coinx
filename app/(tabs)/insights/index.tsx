import { BarGraphView } from "@/src/Containers/Insights/Components/BarGraphView";
import { InsightsHeader } from "@/src/Containers/Insights/Components/InsightsHeader";
import { InsightsGraph } from "@/src/Containers/Insights/Containers/InsightsGraph";
import { TransactionsList } from "@/src/Containers/Transactions/TransactionsList";
import { rootStore } from "@/src/LegendState";
import { useMount } from "@legendapp/state/react";
import { Construction } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/src/Components/ui/Text";

const Insights = () => {
	useMount(() => {
		rootStore.insightsModel.onMount();

		return () => {
			rootStore.insightsModel.onUnmount();
		};
	});

	// return (
	// 	<SafeAreaView style={styles.container}>
	// 		<View className="flex-1 justify-center items-center">
	// 			<Construction
	// 				size={32}
	// 				color="#d97706" // yellow8Light approximation
	// 			/>
	// 			<Text className="text-3xl font-bold text-center mt-4">{"Insights Coming Soon"}</Text>
	// 			<Text className="text-center mt-2">
	// 				{"This feature is currently in development"}
	// 			</Text>
	// 		</View>
	// 	</SafeAreaView>
	// );

	return (
		<SafeAreaView style={styles.container}>
			<View className="flex-1 py-4 px-6">
				<InsightsHeader insightsModel$={rootStore.insightsModel} />
				<InsightsGraph insightsModel$={rootStore.insightsModel} />
				<TransactionsList
					transactions$={rootStore.insightsModel.groupedTransactions}
				/>
			</View>
		</SafeAreaView>
	);
};

export default Insights;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

