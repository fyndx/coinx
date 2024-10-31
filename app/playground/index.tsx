import { rootStore } from "@/src/LegendState";
import { generateRandomTransactions } from "@/src/database/seeds/TransactionSeeds";
import { Delete } from "@tamagui/lucide-icons";
import { Link } from "expo-router";
import {
	Button,
	H2,
	H3,
	ListItem,
	Separator,
	Text,
	YGroup,
	YStack,
} from "tamagui";

const PlaygroundScreen = () => {
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

	const createRandomProducts = () => {
		rootStore.productsModel.createRandomProducts();
	};

	const clearProducts = () => {
		rootStore.productsModel.deleteAllProducts();
	};

	return (
		<YStack padding={"$2"}>
			<H3>{"Creation"}</H3>
			<YGroup paddingVertical={"$2"}>
				<YGroup.Item>
					<ListItem
						title={"Create Default Categories"}
						onPress={createDefaultCategories}
					/>
				</YGroup.Item>
				<Separator />
				<YGroup.Item>
					<ListItem
						title={"Create Random Transactions"}
						onPress={createRandomTransactions}
					/>
				</YGroup.Item>
				<YGroup.Item>
					<ListItem
						title={"Create Random Products"}
						onPress={createRandomProducts}
					/>
				</YGroup.Item>
				<H3>{"Deletion"}</H3>
				<YGroup.Item>
					<ListItem
						title={"Clear All Transactions"}
						icon={Delete}
						theme={"red"}
						subTitle={"This action cannot be undone"}
						onPress={clearTransactions}
					/>
				</YGroup.Item>
				<Separator borderColor={"$color.gray8Light"} />
				<YGroup.Item>
					<ListItem
						title={"Clear All Categories"}
						icon={Delete}
						theme={"red"}
						subTitle={"This action cannot be undone"}
						onPress={clearCategories}
					/>
				</YGroup.Item>
				<Separator borderColor={"$color.gray8Light"} />
				<YGroup.Item>
					<ListItem
						title={"Clear All Products"}
						icon={Delete}
						theme={"red"}
						subTitle={"This action cannot be undone"}
						onPress={clearProducts}
					/>
				</YGroup.Item>
			</YGroup>
		</YStack>
	);
};

export default PlaygroundScreen;
