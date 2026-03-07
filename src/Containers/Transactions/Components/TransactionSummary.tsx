import { View } from "react-native";

import { Text } from "@/src/Components/ui/Text";

export const TransactionSummary = ({
  total,
  transaction_time,
}: {
  total: string;
  transaction_time: string;
}) => {
  return (
    <View className="flex-row justify-between items-center px-4 py-3 border-b border-border">
      <Text className="font-semibold text-sm">{transaction_time}</Text>
      <Text className="text-sm text-muted-foreground">{total}</Text>
    </View>
  );
};
