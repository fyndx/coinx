import { MonthYearPicker } from "@/src/Components/MonthYearPicker";
import { observer, useMount } from "@legendapp/state/react";
import { MenuView } from "@react-native-menu/menu";
import type { NativeActionEvent } from "@react-native-menu/menu";
import { ChevronDownSquare, Search } from "@tamagui/lucide-icons";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, H1, H3, Header, Stack, Text, XStack, YStack } from "tamagui";
import { TransactionsList } from "@/src/Containers/Transactions/TransactionsList";
import { rootStore } from "@/src/LegendState";
import type { TransactionsScreenModel } from "@/src/LegendState/TransactionsScreen.model";

const ACTIONS = [
	{
		id: "today",
		title: "today",
	},
	{
		id: "this week",
		title: "this week",
	},
	{
		id: "this month",
		title: "this month",
	},
	{
		id: "this year",
		title: "this year",
	},
	{
		id: "all time",
		title: "all time",
	},
];

/**
 * A React component that renders a menu for selecting the duration of transactions to display.
 * The component uses the `transactionsScreenModel$` prop to access the `duration` and `insights.totalExpense` observables from the `TransactionsScreenModel`.
 * The menu options are defined in the `ACTIONS` constant, and the `handleOptionChange` function is called when an option is selected, updating the `duration` observable.
 * The component also displays the total expense amount based on the selected duration.
 */
const SpentMenuComponent = observer(
	({
		transactionsScreenModel$,
	}: {
		transactionsScreenModel$: TransactionsScreenModel;
	}) => {
		const handleOptionChange = ({ nativeEvent }: NativeActionEvent) => {
			transactionsScreenModel$.obs.duration.set(nativeEvent.event);
		};

		return (
			<YStack paddingVertical={"$6"}>
				<XStack alignItems="center" justifyContent="center">
					<Text>{"Spent "}</Text>
					<MenuView actions={ACTIONS} onPressAction={handleOptionChange}>
						<Button size={"$2"} variant="outlined">
							<Text>{transactionsScreenModel$.obs.duration.get()}</Text>
						</Button>
					</MenuView>
				</XStack>
				<XStack alignItems="center" justifyContent="center">
					<Text fontSize={"$8"}>
						{/* TODO: Add Selected Currency */}
						{transactionsScreenModel$.obs.insights.totalExpense.get()}
					</Text>
				</XStack>
			</YStack>
		);
	},
);

/**
 * A React component that renders the main transactions screen, including a search bar, a menu for selecting the duration of transactions to display, and a list of transactions.
 * The component uses the `transactionsScreenModel` from the root store to access the necessary data and observables for the transactions screen.
 * The component is responsible for setting up the necessary lifecycle hooks and rendering the child components that make up the transactions screen.
 */
const Transactions = () => {
	const transactionsScreenModel$ = rootStore.transactionsScreenModel;

	useMount(() => {
		transactionsScreenModel$.onMount();
	});

	return (
		<SafeAreaView style={styles.container}>
			<Stack flex={1} paddingHorizontal={"$6"}>
				{/* <XStack justifyContent="space-between" paddingVertical={"$2"}>
				<Search />
				<ChevronDownSquare />
			</XStack> */}
				{/* <SpentMenuComponent transactionsScreenModel$={transactionsScreenModel$} /> */}
				<XStack justifyContent={"center"} py={"$2"}>
					<H3>{"Transactions"}</H3>
				</XStack>
				<MonthYearPicker transactionsScreenModel$={rootStore.transactionsScreenModel} />
				<TransactionsList
					transactions={rootStore.transactionsScreenModel.groupedTransactions}
				/>
			</Stack>
		</SafeAreaView>
	);
};

export default Transactions;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
