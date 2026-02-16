import { rootStore } from "@/src/LegendState";
import { generateRandomTransactions } from "@/src/database/seeds/TransactionSeeds";
import { Delete } from "lucide-react-native";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import { Text } from "@/src/Components/ui/Text";

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

	const createRandomProductListings = () => {
		rootStore.productsListingsModel.createRandomProductListings();
	};

	const clearProducts = () => {
		rootStore.productsModel.deleteAllProducts();
	};

	const clearProductListings = () => {
		rootStore.productsListingsModel.deleteAllProductListings();
	};

	const ListItem = ({
		title,
		subTitle,
		onPress,
		icon: Icon,
		theme,
	}: {
		title: string;
		subTitle?: string;
		onPress: () => void;
		icon?: React.ComponentType<{ size: number; color: string }>;
		theme?: string;
	}) => (
		<Pressable
			onPress={onPress}
			className="p-4 border-b border-gray-200 flex-row items-center justify-between"
		>
			<View className="flex-1">
				<Text className="text-lg">{title}</Text>
				{subTitle && <Text className="text-gray-500">{subTitle}</Text>}
			</View>
			{Icon && <Icon size={24} color={theme === "red" ? "red" : "black"} />}
		</Pressable>
	);

	return (
		<View className="flex-1 p-2">
			<Text className="text-xl font-bold my-2">{"Creation"}</Text>
			<View className="bg-white rounded-md mb-4">
				<ListItem
					title={"Create Default Categories"}
					onPress={createDefaultCategories}
				/>
				<ListItem
					title={"Create Random Transactions"}
					onPress={createRandomTransactions}
				/>
				<ListItem
					title={"Create Random Products"}
					onPress={createRandomProducts}
				/>
				<ListItem
					title={"Create Random Product Listings"}
					onPress={createRandomProductListings}
				/>
			</View>

			<Text className="text-xl font-bold my-2">{"Deletion"}</Text>
			<View className="bg-white rounded-md">
				<ListItem
					title={"Clear All Transactions"}
					icon={Delete}
					theme={"red"}
					subTitle={"This action cannot be undone"}
					onPress={clearTransactions}
				/>
				<ListItem
					title={"Clear All Categories"}
					icon={Delete}
					theme={"red"}
					subTitle={"This action cannot be undone"}
					onPress={clearCategories}
				/>
				<ListItem
					title={"Clear All Products"}
					icon={Delete}
					theme={"red"}
					subTitle={"This action cannot be undone"}
					onPress={clearProducts}
				/>
				<ListItem
					title={"Clear All Product Listings"}
					icon={Delete}
					theme={"red"}
					subTitle={"This action cannot be undone"}
					onPress={clearProductListings}
				/>
			</View>
		</View>
	);
};

export default PlaygroundScreen;
