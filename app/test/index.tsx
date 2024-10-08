import { rootStore } from "@/src/LegendState";
import { generateRandomTransactions } from "@/src/database/seeds/TransactionSeeds";
import { Link } from "expo-router";
import { Button, Separator, Text, H2, YStack } from "tamagui";

const TestScreen = () => {
	const clearTransactions = () => {
		rootStore.transactionModel.deleteAllTransactions();
	};

	const clearCategories = () => {
		rootStore.categoryModel.deleteAllCategories();
	};

	const createDefaultCategories = () => {
		rootStore.categoryModel.createDefaultCategories();
	};

	const createRandomTransactions = () => {
		rootStore.transactionModel.createRandomTransactions();
	};

	return (
		<YStack alignItems={"center"} gap={"$2"}>
			<H2>{"Creation"}</H2>
			<Button onPress={createDefaultCategories}>
				{"Create Default Categories"}
			</Button>
			<Button onPress={createRandomTransactions}>
				{"Create Random Transactions"}
			</Button>
			<Separator />
			<H2>{"Deletion"}</H2>
			<Button onPress={clearTransactions}>{"Clear All Transactions"}</Button>
			<Button onPress={clearCategories}>{"Clear All Categories"}</Button>
			<Link href={"categories"} asChild>
				<Button>{"Categories"}</Button>
			</Link>
		</YStack>
	);
};

export default TestScreen;
