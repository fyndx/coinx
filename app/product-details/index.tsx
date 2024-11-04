import { ProductListingTable } from "@/src/Containers/ProductListings/Containers/ProductListingTable";
import { rootStore } from "@/src/LegendState";
import { useMount } from "@legendapp/state/react";
import { Construction, PlusCircle } from "@tamagui/lucide-icons";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Circle, Text, XStack, YStack } from "tamagui";

const ProductDetails = () => {
	const { id, name } = useLocalSearchParams();
	const productId = Number(id);

	const { productsListingsModel: productListing$ } = rootStore;

	useMount(() => {
		productListing$.getProductListingsById(productId);

		return () => {
			productListing$.reset();
		};
	});

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen
				options={{ headerTitle: (name as string) ?? "Product Details" }}
			/>
			<YStack flex={1} padding={"$3"} backgroundColor={"$background"}>
				<ProductListingTable data={productListing$.productListingsTable} />
			</YStack>
			<Circle
				position="absolute"
				right={"$6"}
				bottom={"$6"}
				backgroundColor={"$blue10Light"}
				padding={"$1"}
				// biome-ignore lint/a11y/useSemanticElements: react-native does not have a semantic element for a button
				role={"button"}
				aria-label={"Add Product Details"}
			>
				<Link href={{ pathname: "/add-product-details", params: { id, name } }}>
					<PlusCircle size={"$4"} color="white" />
				</Link>
			</Circle>
		</SafeAreaView>
	);
};

export default ProductDetails;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
