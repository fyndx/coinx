import { View } from "react-native";
import { Text } from "@/src/Components/ui/Text";

export const TransactionSummary = ({
	total,
	transaction_time,
}: { total: string; transaction_time: string }) => {
	return (
		<View className="pt-4">
			<View className="flex-row justify-between">
				<Text>{transaction_time}</Text>
				<Text>{total}</Text>
			</View>
			<View className="border-b-[0.5px] border-border my-2" />
		</View>
	);
};

