import { Select } from "@/src/Components/Select";
import { rootStore } from "@/src/LegendState";
import { storeModel$ } from "@/src/LegendState/Store/Store.model";
import { observer, useMount } from "@legendapp/state/react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Spinner, Text, YStack } from "tamagui";

const AddProductListing = observer(() => {
	const { id } = useLocalSearchParams();

	const productModel$ = rootStore.addProductListingModel;

	useMount(() => {
		const productId = Number(id);
		if (Number.isNaN(productId)) {
			return;
		}

		// Fetch product details
		productModel$.getProductById(productId);
		storeModel$.getStoresList();

		return () => {
			productModel$.reset();
		};
	});

	const handleUnitChange = (value: string) => {
		productModel$.productDetailsDraft.unit.set(value);
	};

	const handleStoreChange = (value: string) => {
		const stores = storeModel$.storesList.peek();

		const storeIndex = stores.findIndex(
			(store) => `${store.name} - ${store.location}` === value,
		);

		const storeId = stores[storeIndex].id;
		productModel$.productDetailsDraft.storeId.set(storeId);
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
						placeholder={"Unit *"}
						data={productModel$.units.get()}
						onValueChange={handleUnitChange}
					/>
					<Select
						placeholder={"Store *"}
						data={storeModel$.storesList.get()}
						displayField={(item) => `${item.name} - ${item.location}`}
						onValueChange={handleStoreChange}
					/>
					<Input
						placeholder="URL"
						size={"$5"}
						onChangeText={(text) =>
							productModel$.productDetailsDraft.url.set(text.trim())
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
