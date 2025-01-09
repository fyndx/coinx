import { Transaction } from "@/src/Containers/Transactions/Components/Transaction";
import { TransactionSummary } from "@/src/Containers/Transactions/Components/TransactionSummary";
import type { FlashListTransactionsList } from "@/src/LegendState/TransactionsScreen.model";
import type { ObservableComputed } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { FlashList, type FlashListProps } from "@shopify/flash-list";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import Animated from "react-native-reanimated";

const AnimatedFlashList =
	Animated.createAnimatedComponent<FlashListProps<FlashListTransactionsList>>(
		FlashList,
	);

export const TransactionsList = observer(
	({
		transactions,
		onScroll,
	}: {
		transactions: ObservableComputed<FlashListTransactionsList[]>;
		onScroll:
			| ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
			| undefined;
	}) => {
		return (
			<AnimatedFlashList
				data={transactions.get()}
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
