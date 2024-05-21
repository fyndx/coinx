import { StyleSheet } from "react-native";
import { Button, YStack } from "tamagui";
import { rootStore } from "../../../src/LegendState";
import { Link } from "expo-router";

const Settings = () => {
	const clearTransactions = () => {
		rootStore.transactionModel.deleteAllTransactions();
	};

	const clearCategories = () => {
		rootStore.categoryModel.deleteAllCategories();
	};

	return (
		<YStack>
			<Link href={"categories"} asChild>
				<Button>{"Categories"}</Button>
			</Link>
			{__DEV__ && (
				<Link href={"test"} asChild>
					<Button>{"Go To Test"}</Button>
				</Link>
			)}
		</YStack>
	);
};

export default Settings;

const styles = StyleSheet.create({});
