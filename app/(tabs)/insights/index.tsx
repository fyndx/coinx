import { BarGraphView } from "@/src/Containers/Insights/Components/BarGraphView";
import { InsightsHeader } from "@/src/Containers/Insights/Components/InsightsHeader";
import { InsightsView } from "@/src/Containers/Insights/Components/InsightsView";
import { InsightsGraph } from "@/src/Containers/Insights/Containers/InsightsGraph";
import { TransactionsList } from "@/src/Containers/Transactions/TransactionsList";
import { rootStore } from "@/src/LegendState";
import { useMount } from "@legendapp/state/react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "tamagui";

const Insights = () => {
	useMount(() => {
		rootStore.insightsModel.onMount();

		return () => {
			rootStore.insightsModel.onUnmount();
		};
	});

	return (
		<SafeAreaView style={styles.container}>
			<Stack flex={1} paddingVertical={"$4"} paddingHorizontal={"$6"}>
				<InsightsHeader insightsModel$={rootStore.insightsModel} />
				<InsightsGraph insightsModel$={rootStore.insightsModel} />
				<TransactionsList
					transactions={rootStore.insightsModel.groupedTransactions}
				/>
			</Stack>
		</SafeAreaView>
	);
};

export default Insights;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
