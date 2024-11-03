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

	const productListing$ = rootStore.productsListingsModel;

	useMount(() => {
		productListing$.getProductListingsById(Number(id));

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

// {productListing$.productListings.get().map((product) => (
// 	<XStack key={product.id} gap={"$2"}>
// 		<Text>{product.name}</Text>
// 		<Text>{product.price}</Text>
// 		{/* Price per unit */}
// 		<Text>{`${(product.price / product.quantity).toFixed(2)} per ${product.unit}`}</Text>
// 		<Text>{`${product.quantity} ${product.unit} `}</Text>
// 	</XStack>
// ))}
