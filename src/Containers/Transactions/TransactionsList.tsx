import type { ObservableComputed } from "@legendapp/state";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

import { observer } from "@legendapp/state/react";
import { FlashList } from "@shopify/flash-list";
import { Banknote } from "lucide-react-native";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import type { FlashListTransactionsList } from "@/src/LegendState/TransactionsScreen.model";

import { Text } from "@/src/Components/ui/Text";
import { Transaction } from "@/src/Containers/Transactions/Components/Transaction";
import { TransactionSummary } from "@/src/Containers/Transactions/Components/TransactionSummary";

const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList,
) as typeof FlashList;

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
            {"No Transactions found\n Tap the + icon to add a transaction"}
          </Text>
        </View>
      );
    }
    return (
      <AnimatedFlashList
        data={transactions}
        renderItem={({ item }) => (
          <View className="bg-card rounded-2xl mb-3 overflow-hidden">
            <TransactionSummary
              transaction_time={item.transaction_time}
              total={item.total}
            />
            {item.transactions.map((transaction, index) => (
              <View key={transaction.id}>
                {index > 0 && <View className="h-[0.5px] bg-border mx-4" />}
                <Transaction transaction={transaction} />
              </View>
            ))}
          </View>
        )}
        onScroll={onScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={"handled"}
      />
    );
  },
);
