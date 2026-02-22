import { Input } from "@/src/Components/ui/Input";
import { Text } from "@/src/Components/ui/Text";
import { rootStore } from "@/src/LegendState";
import { observer, useMount } from "@legendapp/state/react";
import { useLocalSearchParams } from "expo-router";
import { Button } from "heroui-native";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EditProductListing = observer(() => {
	const { listing_id, product_id } = useLocalSearchParams();

	const listingId = listing_id as string;
	const productId = product_id as string;

	const { editProductListingModel } = rootStore;

	useMount(() => {
		if (!listingId || !productId) {
			return;
		}

		// Fetch product details
		editProductListingModel.onMount({ listingId, productId });

		return () => {
			editProductListingModel.onUnmount();
		};
	});

	const productListing$ = editProductListingModel.productListing.get();

	const handlePriceChange = (value: string) => {
		editProductListingModel.modifyProductDraft("price", value);
	};

	if (productListing$.status === "pending") {
		return (
			<View className="flex-1 justify-center items-center p-4">
				<View className="flex-row items-center gap-2">
					<ActivityIndicator />
					<Text>Loading...</Text>
				</View>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View className="flex-1 p-4 gap-4">
				<View className="flex-1 gap-2">
					<Text>{`Name: ${productListing$.data?.name}`}</Text>
					<Text>{`Store: ${productListing$.data?.storeName}`}</Text>
					<Text>{`Location: ${productListing$.data?.storeLocation ?? "---"}`}</Text>
					<Input
						placeholder="Enter New Price"
						onChangeText={handlePriceChange}
					/>
				</View>
				<Button
					onPress={editProductListingModel.updateProductListing}
					isDisabled={editProductListingModel.views.isButtonDisabled.get()}
				>
					<Text>Update Price</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default EditProductListing;
