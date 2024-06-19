import { InsightsView } from "@/src/Containers/Insights/Components/InsightsView";
import { InsightsHeader } from "@/src/Containers/Insights/Components/InsightsHeader";
import { TransactionsList } from "@/src/Containers/Transactions/TransactionsList";
import { rootStore } from "@/src/LegendState";
import { useMount } from "@legendapp/state/react";
import { StyleSheet } from "react-native";
import { Stack } from "tamagui";
import { BarGraphView } from "@/src/Containers/Insights/Components/BarGraphView";
import { InsightsGraph } from "@/src/Containers/Insights/Containers/InsightsGraph";

const Insights = () => {
	useMount(() => {
		rootStore.insightsModel.onMount();
	});

	return (
		<Stack flex={1} paddingVertical={"$4"} paddingHorizontal={"$6"}>
			<InsightsHeader insightsModel$={rootStore.insightsModel} />
			<InsightsGraph insightsModel$={rootStore.insightsModel} />
			<TransactionsList
				transactions={rootStore.insightsModel.groupedTransactions}
			/>
		</Stack>
	);
};

export default Insights;

const styles = StyleSheet.create({});
