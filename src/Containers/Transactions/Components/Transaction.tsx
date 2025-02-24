import { SwipeableRow } from "@/src/Components/SwipeableRow";
import { rootStore } from "@/src/LegendState";
import type { TransactionItem } from "@/src/LegendState/TransactionsScreen.model";
import { Trash2 } from "@tamagui/lucide-icons";
import dayjs from "dayjs";
import { Link } from "expo-router";
import { Fragment } from "react";
import { ListItem, Separator, Text, XStack, YGroup, YStack } from "tamagui";

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
					content: <Trash2 color={"$white5"} />,
					style: { backgroundColor: "red" },
					onPress: async () => {
						await rootStore.transactionModel.deleteTransaction(transaction.id);
						rootStore.transactionsScreenModel.transactionsList();
					},
				},
			]}
		>
			<ListItem padding={"$0"} backgroundColor={"rgb(242, 242, 242)"}>
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
					<XStack
						flex={1}
						alignItems={"center"}
						justifyContent={"space-between"}
						paddingVertical={"$1.5"}
					>
						{/* Category Icon */}
						<XStack gap={"$3"} flex={1}>
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
							<YStack flex={1}>
								<Text>{transaction.note ?? transaction.category_name}</Text>
								{/* Time with am and pm */}
								<Text>
									{dayjs(transaction.transactionTime).format("h:mm A")}
								</Text>
							</YStack>
						</XStack>
						{/* Amount */}
						<XStack alignItems={"center"} paddingHorizontal={"$3"}>
							<Text
								fontSize={"$6"}
								color={
									transaction.transactionType === "Income" ? "green" : "red"
								}
							>
								{transaction.amount}
							</Text>
						</XStack>
					</XStack>
				</Link>
			</ListItem>
		</SwipeableRow>
	);
};
