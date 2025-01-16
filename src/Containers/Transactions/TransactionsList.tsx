import { Transaction } from "@/src/Containers/Transactions/Components/Transaction";
import { TransactionSummary } from "@/src/Containers/Transactions/Components/TransactionSummary";
import type { FlashListTransactionsList } from "@/src/LegendState/TransactionsScreen.model";
import type { ObservableComputed } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { FlashList, type FlashListProps } from "@shopify/flash-list";
import { Banknote } from "@tamagui/lucide-icons";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import Animated from "react-native-reanimated";
import { H1, H2, H3, H4, Text, YStack } from "tamagui";

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
		onScroll:
			| ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
			| undefined;
	}) => {
		const transactions = transactions$.get();
		if (transactions.length === 0) {
			return (
				<YStack alignItems={"center"} justifyContent={"center"} flex={1}>
					<Banknote size={"$6"} />
					<H3 textAlign={"center"}>
						{"No Transactions found\n Tap the + icon to add your first product"}
					</H3>
				</YStack>
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
