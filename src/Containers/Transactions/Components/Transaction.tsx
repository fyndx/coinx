import { SwipeableRow } from "@/src/Components/SwipeableRow";
import { Text } from "@/src/Components/ui/Text";
import { rootStore } from "@/src/LegendState";
import type { TransactionItem } from "@/src/LegendState/TransactionsScreen.model";
import dayjs from "dayjs";
import { Link } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { Pressable, View } from "react-native";

export const Transaction = ({
	transaction,
}: {
	transaction: TransactionItem;
}) => {
	return (
		<SwipeableRow
			key={transaction.id}
			rightActions={[
				{
					content: <Trash2 color="white" />,
					style: { backgroundColor: "red" },
					onPress: async () => {
						await rootStore.transactionModel.deleteTransaction(transaction.id);
						rootStore.transactionsScreenModel.transactionsList();
					},
				},
			]}
		>
			<View className="bg-[#f2f2f2] border-b border-border">
				<Link
					href={{
						pathname: "/add-transaction",
						params: {
							id: transaction.id,
							amount: transaction.amount,
							transactionType: transaction.transactionType,
							transactionTime: transaction.transactionTime,
							categoryId: transaction.category_id,
							categoryName: transaction.category_name,
							note: transaction.note,
						},
					}}
					asChild
				>
					<Pressable className="flex-row justify-between items-center py-3 px-4">
						{/* Category Icon */}
						<View className="flex-row gap-3 flex-1 items-center">
							<View
								className="items-center justify-center w-8 h-8 rounded-full"
								style={{ backgroundColor: transaction.category_color }}
							>
								<Text className="text-lg">{transaction.category_icon}</Text>
							</View>
							{/* Transaction Details */}
							<View className="flex-1">
								<Text className="font-medium">
									{transaction.note ?? transaction.category_name}
								</Text>
								{/* Time with am and pm */}
								<Text className="text-sm text-muted-foreground">
									{dayjs(transaction.transactionTime).format("h:mm A")}
								</Text>
							</View>
						</View>
						{/* Amount */}
						<View className="flex-row items-center px-3">
							<Text
								className={`text-lg font-medium ${
									transaction.transactionType === "Income"
										? "text-green-600"
										: "text-red-600"
								}`}
							>
								{transaction.amount}
							</Text>
						</View>
					</Pressable>
				</Link>
			</View>
		</SwipeableRow>
	);
};
