import { UnitCategory } from "@/src/utils/units";
import { Construction } from "@tamagui/lucide-icons";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { H1, Input, Text, YStack } from "tamagui";

const UnitCategories = UnitCategory.map((category) => ({
	label: category,
	value: category,
}));

const AddProduct = () => {
	return (
		<SafeAreaView style={styles.container}>
			<YStack flex={1} padding={"$4"}>
				<Input placeholder={"Product Name"} />
			</YStack>
		</SafeAreaView>
	);
};

export default AddProduct;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
