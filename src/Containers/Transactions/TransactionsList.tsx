import type { ObservableComputed } from "@legendapp/state";
import { Transaction } from "@/src/Containers/Transactions/Components/Transaction";
import { observer } from "@legendapp/state/react";
import { FlashList } from "@shopify/flash-list";
import type { FlashListTransactionsList } from "@/src/LegendState/TransactionsScreen.model";
import { TransactionSummary } from "@/src/Containers/Transactions/Components/TransactionSummary";

export const TransactionsList = observer(
	({
		transactions,
	}: { transactions: ObservableComputed<FlashListTransactionsList[]> }) => {
		return (
			<FlashList
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
				showsVerticalScrollIndicator={false}
				estimatedItemSize={44}
			/>
		);
	},
);
