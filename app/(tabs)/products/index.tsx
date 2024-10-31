import type { SelectProduct } from "@/db/schema";
import { rootStore } from "@/src/LegendState";
import { observer, useMount } from "@legendapp/state/react";
import { FlashList } from "@shopify/flash-list";
import { ChevronRight, Construction, PlusCircle } from "@tamagui/lucide-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Circle, H1, Header, ListItem, Text, YGroup, YStack } from "tamagui";

const Product = ({
	product,
}: { product: Omit<SelectProduct, "createdAt"> }) => {
	return (
		<Link href={`/product-details?product_id=${product.id}`}>
			<YGroup.Item key={product.id}>
				<ListItem title={product.name} iconAfter={ChevronRight} />
			</YGroup.Item>
		</Link>
	);
};

/**
 * Products List Screen
 */
const Products = observer(() => {
	useFocusEffect(
		useCallback(() => {
			rootStore.productsModel.getProductsList();
		}, []),
	);

	console.log(rootStore.productsModel.products.get());

	return (
		<SafeAreaView style={styles.container}>
			{/* TODO: Search */}
			<YGroup style={styles.container} padding={"$4"}>
				<FlashList
					data={rootStore.productsModel.products.get()}
					renderItem={({ item }) => <Product product={item} />}
					estimatedItemSize={100}
				/>
			</YGroup>
			<Circle
				position="absolute"
				right={"$6"}
				bottom={"$6"}
				backgroundColor={"$blue10Light"}
				padding={"$1"}
			>
				<Link href={"/add-product"}>
					<PlusCircle size={"$4"} color="white" />
				</Link>
			</Circle>
		</SafeAreaView>
	);
});

export default Products;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
