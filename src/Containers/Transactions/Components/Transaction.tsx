import { Text, XStack, YStack } from "tamagui";
import type { TransactionItem } from "@/src/LegendState/TransactionsScreen.model";
import dayjs from "dayjs";

export const Transaction = ({
	transaction,
}: { transaction: TransactionItem }) => {
	return (
		<XStack justifyContent={"space-between"} paddingVertical={"$1.5"}>
			{/* Category Icon */}
			<XStack gap={"$3"}>
				<XStack
					backgroundColor={transaction.category_color}
					alignSelf={"center"}
					alignItems={"center"}
					justifyContent={"center"}
					width={"$3"}
					height={"$3"}
					borderRadius={"$3"}
				>
					<Text fontSize={"$6"}>{transaction.category_icon}</Text>
				</XStack>
				{/* Transaction Details */}
				<YStack>
					<Text>{transaction.note ?? transaction.category_name}</Text>
					{/* Time with am and pm */}
					<Text>{dayjs(transaction.transactionTime).format("h:mm A")}</Text>
				</YStack>
			</XStack>
			{/* Amount */}
			<XStack alignItems={"center"}>
				<Text
					fontSize={"$6"}
					color={transaction.transactionType === "Income" ? "green" : "red"}
				>
					{transaction.amount}
				</Text>
			</XStack>
		</XStack>
	);
};
