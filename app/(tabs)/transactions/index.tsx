import { MonthYearPicker } from "@/src/Components/MonthYearPicker";
import { Text } from "@/src/Components/ui/Text";
import { TransactionsList } from "@/src/Containers/Transactions/TransactionsList";
import { rootStore } from "@/src/LegendState";
import type {
	DurationOptions,
	TransactionsScreenModel,
} from "@/src/LegendState/TransactionsScreen.model";
import { observer, useMount } from "@legendapp/state/react";
import { MenuView } from "@react-native-menu/menu";
import type { NativeActionEvent } from "@react-native-menu/menu";
import { Link, useFocusEffect } from "expo-router";
import { Button } from "heroui-native";
import { PlusCircle } from "lucide-react-native";
import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);

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
 */
const SpentMenuComponent = observer(
	({
		transactionsScreenModel$,
	}: {
		transactionsScreenModel$: TransactionsScreenModel;
	}) => {
		const handleOptionChange = ({ nativeEvent }: NativeActionEvent) => {
			transactionsScreenModel$.obs.duration.set(
				nativeEvent.event as DurationOptions,
			);
		};

		return (
			<View className="py-6">
				<View className="flex-row items-center justify-center">
					<Text>{"Spent "}</Text>
					<MenuView actions={ACTIONS} onPressAction={handleOptionChange}>
						<Button size="sm" variant="secondary">
							<Text>{transactionsScreenModel$.obs.duration.get()}</Text>
						</Button>
					</MenuView>
				</View>
				<View className="flex-row items-center justify-center">
					<Text className="text-3xl font-bold">
						{/* TODO: Add Selected Currency */}
						{transactionsScreenModel$.obs.insights.totalExpense.get()}
					</Text>
				</View>
			</View>
		);
	},
);

/**
 * A React component that renders the main transactions screen.
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
		}, [transactionsScreenModel$]),
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
			<View style={styles.container} className="px-6">
				{/* <XStack justifyContent="space-between" paddingVertical={"$2"}>
				<Search />
				<ChevronDownSquare />
			</XStack> */}
				{/* <SpentMenuComponent transactionsScreenModel$={transactionsScreenModel$} /> */}
				<View className="justify-center items-center py-2">
					<Text className="text-xl font-bold">{"Transactions"}</Text>
				</View>
				<MonthYearPicker transactionsScreenModel$={transactionsScreenModel$} />
				<TransactionsList
					transactions$={transactionsScreenModel$.groupedTransactions}
					onScroll={scrollHandler}
				/>
			</View>

			<AnimatedView
				className="absolute right-6 bottom-6 bg-blue-100 p-2 rounded-full"
				style={animatedFabStyle}
			>
				<Link href={{ pathname: "/add-transaction" }} asChild>
					<Pressable>
						<PlusCircle size={32} color="#2563eb" />
					</Pressable>
				</Link>
			</AnimatedView>
		</SafeAreaView>
	);
};

export default Transactions;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
