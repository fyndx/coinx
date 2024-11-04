import { DefaultUnitSelect } from "@/src/Containers/AddProduct/Components/DefaultUnitSelect";
import { rootStore } from "@/src/LegendState";
import { observer } from "@legendapp/state/react";
import { Keyboard, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, YStack } from "tamagui";

const AddProduct = observer(() => {
	const addProductScreenModel$ = rootStore.addProductScreenModel;

	const handleProductNameChange = (value: string) => {
		addProductScreenModel$.product.name.set(value.trim());
	};

	const handleUnitCategoryChange = (value: string) => {
		// @ts-expect-error
		addProductScreenModel$.product.defaultUnitCategory.set(value);
	};

	const isAddProductInProgress = addProductScreenModel$.isLoading.get();

	return (
		// TODO: Add error messages for input and select
		<SafeAreaView style={styles.container}>
			<YStack
				flex={1}
				padding={"$4"}
				justifyContent={"space-between"}
				onPress={Keyboard.dismiss}
			>
				<YStack gap={"$3"}>
					<Input
						placeholder={"Product Name"}
						onChangeText={handleProductNameChange}
						disabled={isAddProductInProgress}
					/>
					{/* Default Unit Select */}
					<DefaultUnitSelect onValueChange={handleUnitCategoryChange} />
				</YStack>
				<Button
					onPress={addProductScreenModel$.addProduct}
					// TODO: Disable Button unless input and select is valid
					disabled={isAddProductInProgress}
				>
					{"Add Product"}
				</Button>
			</YStack>
		</SafeAreaView>
	);
});

export default AddProduct;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
