import { rootStore } from "@/src/LegendState";
import { observer, useMount } from "@legendapp/state/react";
import { Construction } from "@tamagui/lucide-icons";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, H1, Input, Spinner, Text, XStack, YStack } from "tamagui";

const EditProductListing = observer(() => {
	const { listing_id, product_id } = useLocalSearchParams();
	console.log({ listing_id, product_id });

	const listingId = Number(listing_id);
	const productId = Number(product_id);

	const { editProductListingModel } = rootStore;

	useMount(() => {
		if (Number.isNaN(listingId) || Number.isNaN(productId)) {
			return;
		}

		console.log("EditProductListing: ", listingId, productId);

		// Fetch product details
		editProductListingModel.onMount({ listingId, productId });

		return () => {
			editProductListingModel.onUnmount();
		};
	});

	const productListing$ = editProductListingModel.productListing.get();

	const handlePriceChange = (value: string) => {
		editProductListingModel.modifyProductDraft("price", value);
	}

	if (productListing$.status === "loading") {
		return (
			<YStack
				flex={1}
				padding={"$4"}
				justifyContent={"center"}
				alignItems={"center"}
			>
				<XStack>
					<Spinner />
					<Text>Loading...</Text>
				</XStack>
			</YStack>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<YStack flex={1} padding={"$4"}>
				<YStack flex={1} gap={"$2"}>
					<Text>{`Name: ${productListing$.data?.name}`}</Text>
					<Text>{`Store: ${productListing$.data?.store}`}</Text>
					<Text>{`Location: ${productListing$.data?.location ?? "---"}`}</Text>
					<Input placeholder="Enter New Price" onChangeText={handlePriceChange} />
				</YStack>
				<Button onPress={editProductListingModel.updateProductListing}>Update Price</Button>
			</YStack>
		</SafeAreaView>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default EditProductListing;
