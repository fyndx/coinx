import { ProductListingGraph } from "@/src/Containers/ProductListings/Containers/ProductListingGraph";
import { ProductListingTable } from "@/src/Containers/ProductListings/Containers/ProductListingTable";
import { rootStore } from "@/src/LegendState";
import { useMount } from "@legendapp/state/react";
import { PlusCircle } from "lucide-react-native";
import { Link, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
			<View className="flex-1 p-3 bg-background">
				<ProductListingTable data={productListing$.productListingsTable as any} />
				<View className="h-6" />
				<ProductListingGraph
					productListingHistoryModel$={productListingHistoryModel$}
				/>
			</View>
			<View
				className="absolute right-6 bottom-6 bg-blue-100 p-2 rounded-full shadow-md"
			>
				<Link href={{ pathname: "/add-product-listing", params: { id, name } }} asChild>
					<Pressable>
						<PlusCircle size={32} color="#2563eb" />
					</Pressable>
				</Link>
			</View>
		</SafeAreaView>
	);
};

export default ProductListings;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

