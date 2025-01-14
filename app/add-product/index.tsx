import { DefaultUnitSelect } from "@/src/Containers/AddProduct/Components/DefaultUnitSelect";
import { rootStore } from "@/src/LegendState";
import { observer, useMount } from "@legendapp/state/react";
import { Keyboard, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, TextArea, YStack } from "tamagui";

const AddProduct = observer(() => {
	const addProductScreenModel$ = rootStore.addProductScreenModel;

	const isAddProductInProgress = addProductScreenModel$.isLoading.get();

	const {
		id,
		name,
		notes = "",
		defaultUnitCategory,
	} = addProductScreenModel$.product.get();

	useMount(() => {
		() => {
			addProductScreenModel$.resetProduct();
		};
	});

	const handleProductNameChange = (value: string) => {
		addProductScreenModel$.product.name.set(value.trim());
	};

	const handleProductNotesChange = (value: string) => {
		addProductScreenModel$.product.notes.set(value.trim());
	};

	const handleUnitCategoryChange = (value: string) => {
		addProductScreenModel$.product.defaultUnitCategory.set(value);
	};

	const handleSubmit = () => {
		if (id) {
			addProductScreenModel$.editProduct();
		} else {
			addProductScreenModel$.addProduct();
		}
	};

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
						placeholder={"Product Name *"}
						value={name}
						onChangeText={handleProductNameChange}
						disabled={isAddProductInProgress}
						autoFocus
					/>
					<TextArea
						placeholder={
							"Notes\n(eg. Describe your expectations, quality, usage etc.)"
						}
						value={notes}
						onChangeText={handleProductNotesChange}
						disabled={isAddProductInProgress}
						minHeight={"$12"}
						textAlignVertical={"top"}
					/>
					{/* Default Unit Select */}
					<DefaultUnitSelect
						value={defaultUnitCategory}
						onValueChange={handleUnitCategoryChange}
					/>
				</YStack>
				<Button
					onPress={handleSubmit}
					// TODO: Disable Button unless input and select is valid
					disabled={isAddProductInProgress}
				>
					{id ? "Edit Product" : "Add Product"}
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
