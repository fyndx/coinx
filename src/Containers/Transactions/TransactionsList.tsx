import { Transaction } from "@/src/Containers/Transactions/Components/Transaction";
import { TransactionSummary } from "@/src/Containers/Transactions/Components/TransactionSummary";
import type { FlashListTransactionsList } from "@/src/LegendState/TransactionsScreen.model";
import type { ObservableComputed } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { FlashList, type FlashListProps } from "@shopify/flash-list";
import { Banknote } from "lucide-react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { Text } from "@/src/Components/ui/Text";

const AnimatedFlashList =
	Animated.createAnimatedComponent<FlashListProps<FlashListTransactionsList>>(
		FlashList,
	);

export const TransactionsList = observer(
	({
		transactions$,
		onScroll,
	}: {
		transactions$: ObservableComputed<FlashListTransactionsList[]>;
		onScroll?:
			| ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
			| undefined;
	}) => {
		const transactions = transactions$.get();
		if (transactions.length === 0) {
			return (
				<View className="flex-1 items-center justify-center">
					<Banknote size={32} color="gray" />
					<Text className="text-center font-medium mt-2 text-lg">
						{
							"No Transactions found\n Tap the + icon to add a transaction"
						}
					</Text>
				</View>
			);
		}
		return (
			<AnimatedFlashList
				data={transactions}
				renderItem={({ item }) => {
					if ("transaction" in item) {
						return <Transaction transaction={item.transaction} />;
					}
					return (
						<TransactionSummary
							transaction_time={item.transaction_time}
							total={item.total}
						/>
					);
				}}
				onScroll={onScroll}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps={"handled"}
				estimatedItemSize={44}
			/>
		);
	},
);

