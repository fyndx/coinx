import { ProductListingGraph } from "@/src/Containers/ProductListings/Containers/ProductListingGraph";
import { ProductListingTable } from "@/src/Containers/ProductListings/Containers/ProductListingTable";
import { rootStore } from "@/src/LegendState";
import { useMount } from "@legendapp/state/react";
import { PlusCircle } from "@tamagui/lucide-icons";
import { Link, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Circle, Spacer, YStack } from "tamagui";

const ProductListings = () => {
	const { id, name } = useLocalSearchParams();
	const productId = Number(id);

	const {
		productsListingsModel: productListing$,
		productListingHistoryModel: productListingHistoryModel$,
	} = rootStore;

	useMount(() => {
		return () => {
			productListing$.reset();
			productListingHistoryModel$.onUnmount();
		};
	});

	useFocusEffect(
		// biome-ignore lint/correctness/useExhaustiveDependencies: legend state methods are not necessary
		useCallback(() => {
			productListing$.getProductListingsByProductId(productId);
			productListingHistoryModel$.getProductListingsHistoryByProductId(
				productId,
			);
		}, [productId]),
	);

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen
				options={{ headerTitle: (name as string) ?? "Product Listings" }}
			/>
			<YStack flex={1} padding={"$3"} backgroundColor={"$background"}>
				<ProductListingTable data={productListing$.productListingsTable} />
				<Spacer size={"$6"} />
				<ProductListingGraph
					productListingHistoryModel$={productListingHistoryModel$}
				/>
			</YStack>
			<Circle
				position="absolute"
				right={"$6"}
				bottom={"$6"}
				backgroundColor={"$blue10Light"}
				padding={"$1"}
				// biome-ignore lint/a11y/useSemanticElements: react-native does not have a semantic element for a button
				role={"button"}
				aria-label={"Add Product Listing"}
			>
				<Link href={{ pathname: "/add-product-listing", params: { id, name } }}>
					<PlusCircle size={"$4"} color="white" />
				</Link>
			</Circle>
		</SafeAreaView>
	);
};

export default ProductListings;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
