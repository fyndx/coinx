import { InsightsHeader } from "@/src/Containers/Insights/Components/InsightsHeader";
import { TransactionsList } from "@/src/Containers/Transactions/TransactionsList";
import { rootStore } from "@/src/LegendState";
import { useMount } from "@legendapp/state/react";
import { StyleSheet } from "react-native";
import { Stack } from "tamagui";

const Insights = () => {
	useMount(() => {
		rootStore.insightsModel.getTransactonsList();
	});

	return (
		<Stack flex={1} paddingVertical={"$4"} paddingHorizontal={"$6"}>
			<InsightsHeader insightsModel$={rootStore.insightsModel} />
			<TransactionsList
				transactions={rootStore.insightsModel.groupedTransactions}
			/>
		</Stack>
	);
};

export default Insights;

const styles = StyleSheet.create({});
