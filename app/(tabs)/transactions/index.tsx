import { MonthYearPicker } from "@/src/Components/MonthYearPicker";
import { TransactionsList } from "@/src/Containers/Transactions/TransactionsList";
import { rootStore } from "@/src/LegendState";
import type { TransactionsScreenModel } from "@/src/LegendState/TransactionsScreen.model";
import { observer, useMount } from "@legendapp/state/react";
import { MenuView } from "@react-native-menu/menu";
import type { NativeActionEvent } from "@react-native-menu/menu";
import { PlusCircle } from "@tamagui/lucide-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import Animated, {
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Circle, H3, Stack, Text, XStack, YStack } from "tamagui";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
	const transactionScrollY = useSharedValue(0);
	const lastScrollY = useSharedValue(0);
	const translateY = useSharedValue(0);

	useMount(() => {
		transactionsScreenModel$.onMount();
	});

	useFocusEffect(
		useCallback(() => {
			transactionsScreenModel$.transactionsList();
		}, []),
	);

	const animatedFabStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: withSpring(translateY.value),
				},
			],
		};
	});

	const scrollHandler = useAnimatedScrollHandler((event) => {
		const currentScrollY = event.contentOffset.y;
		const scrollDiff = currentScrollY - lastScrollY.value;
		if (Math.abs(scrollDiff) > 5) {
			translateY.value = scrollDiff > 0 ? 100 : 0;
		}
		lastScrollY.value = currentScrollY;
		transactionScrollY.value = currentScrollY;
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
				<MonthYearPicker transactionsScreenModel$={transactionsScreenModel$} />
				<TransactionsList
					transactions={transactionsScreenModel$.groupedTransactions}
					onScroll={scrollHandler}
				/>
			</Stack>

			<AnimatedCircle
				position="absolute"
				right={"$6"}
				bottom={"$6"}
				backgroundColor={"$blue10Light"}
				padding={"$1"}
				style={animatedFabStyle}
			>
				<Link href={{ pathname: "/add-transaction" }}>
					<PlusCircle size={"$4"} color="white" />
				</Link>
			</AnimatedCircle>
		</SafeAreaView>
	);
};

export default Transactions;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
