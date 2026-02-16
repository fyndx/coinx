import { Select } from "@/src/Components/Select";
import { rootStore } from "@/src/LegendState";
import { storeModel$ } from "@/src/LegendState/Store/Store.model";
import { observer, useMount } from "@legendapp/state/react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "heroui-native";
import { Input } from "@/src/Components/ui/Input";
import { Text } from "@/src/Components/ui/Text";

const AddProductListing = observer(() => {
	const { id } = useLocalSearchParams();

	const productModel$ = rootStore.addProductListingModel;

	useMount(() => {
		const productId = id as string;
		if (!productId) {
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
				<View className="p-4 gap-2">
					<Text>Loading...</Text>
					<ActivityIndicator />
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View className="flex-1 p-4 justify-between">
				<View className="gap-2">
					<Input
						placeholder="Product Name *"
						aria-label={"Product Name"}
						onChangeText={(text) =>
							productModel$.productDetailsDraft.name.set(text.trim())
						}
					/>
					<Input
						placeholder="Price *"
						keyboardType={"numeric"}
						onChangeText={(text) =>
							productModel$.productDetailsDraft.price.set(Number(text.trim()))
						}
					/>
					<Input
						placeholder="Quantity *"
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
						displayField={(item: { name: string; location: string | null }) =>
							`${item.name} - ${item.location}`
						}
						onValueChange={handleStoreChange}
					/>
					<Input
						placeholder="URL"
						onChangeText={(text) =>
							productModel$.productDetailsDraft.url.set(text.trim())
						}
					/>
				</View>
				<View>
					<Button onPress={addProductDetails}>
						<Text>Add</Text>
					</Button>
				</View>
			</View>
		</SafeAreaView>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default AddProductListing;
