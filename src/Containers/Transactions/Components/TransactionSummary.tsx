import { Separator, Text, XStack, YStack } from "tamagui";

export const TransactionSummary = ({
	total,
	transaction_time,
}: { total: string; transaction_time: string }) => {
	return (
		<YStack paddingTop={"$4"}>
			<XStack justifyContent={"space-between"}>
				<Text>{transaction_time}</Text>
				<Text>{total}</Text>
			</XStack>
			<Separator
				borderWidth={"$0.5"}
				marginVertical={"$1.5"}
				borderColor={"$gray10Light"}
			/>
		</YStack>
	);
};
