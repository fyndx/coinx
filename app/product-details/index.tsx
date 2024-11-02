import { rootStore } from "@/src/LegendState";
import { useMount } from "@legendapp/state/react";
import { Construction, PlusCircle } from "@tamagui/lucide-icons";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Circle, YStack } from "tamagui";

const ProductDetails = () => {
	const { id, name } = useLocalSearchParams();

	const productListing$ = rootStore.productsListingsModel;

	useMount(() => {
		productListing$.getProductListings();
		productListing$.getProductListingsById(Number(id));
	});

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen
				options={{ headerTitle: (name as string) ?? "Product Details" }}
			/>
			<YStack flex={1}>
				<Construction size={64} />
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
