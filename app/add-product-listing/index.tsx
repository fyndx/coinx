import { Select } from "@/src/Components/Select";
import { rootStore } from "@/src/LegendState";
import { observer, useMount } from "@legendapp/state/react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Label, Spinner, Text, YStack } from "tamagui";

const AddProductListing = observer(() => {
	const { id } = useLocalSearchParams();

	const productModel$ = rootStore.addProductDetailsModel;

	useMount(() => {
		const productId = Number(id);
		if (Number.isNaN(productId)) {
			return;
		}

		// Fetch product details
		productModel$.getProductById(productId);

		return () => {
			productModel$.reset();
		};
	});

	const handleUnitChange = (value: string) => {
		console.log("handleUnitChange", value);
		productModel$.productDetailsDraft.unit.set(value);
	};

	const addProductDetails = () => {
		productModel$.addProductDetails();
	};

	if (productModel$.product?.defaultUnitCategory?.get() === undefined) {
		return (
			<SafeAreaView>
				<YStack padding={"$4"} gap={"$2"}>
					<Text>Loading...</Text>
					<Spinner />
				</YStack>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<YStack flex={1} padding={"$4"} justifyContent={"space-between"}>
				<YStack gap={"$2"}>
					<Input
						placeholder="Product Name *"
						size={"$5"}
						aria-label={"Product Name"}
						onChangeText={(text) =>
							productModel$.productDetailsDraft.name.set(text.trim())
						}
					/>
					<Input
						placeholder="Price *"
						size={"$5"}
						keyboardType={"numeric"}
						onChangeText={(text) =>
							productModel$.productDetailsDraft.price.set(Number(text.trim()))
						}
					/>
					<Input
						placeholder="Quantity *"
						size={"$5"}
						keyboardType={"numeric"}
						onChangeText={(text) =>
							productModel$.productDetailsDraft.quantity.set(
								Number(text.trim()),
							)
						}
					/>
					<Select
						data={productModel$.units.get()}
						onValueChange={handleUnitChange}
					/>
					{/* TODO: Create Stores Table */}
					<Input
						placeholder="Store *"
						size={"$5"}
						onChangeText={(text) =>
							productModel$.productDetailsDraft.store.set(text.trim())
						}
					/>
					<Input
						placeholder="URL"
						size={"$5"}
						onChangeText={(text) =>
							productModel$.productDetailsDraft.url.set(text.trim())
						}
					/>
					<Input
						placeholder="Location"
						size={"$5"}
						onChangeText={(text) =>
							productModel$.productDetailsDraft.location.set(text.trim())
						}
					/>
				</YStack>
				<YStack>
					<Button onPress={addProductDetails}>Add</Button>
				</YStack>
			</YStack>
		</SafeAreaView>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default AddProductListing;
