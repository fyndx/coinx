import type { SelectProduct } from "@/db/schema";
import { SwipeableRow } from "@/src/Components/SwipeableRow";
import { rootStore } from "@/src/LegendState";
import { WINDOW_HEIGHT } from "@gorhom/bottom-sheet";
import { observer, useMount } from "@legendapp/state/react";
import { FlashList } from "@shopify/flash-list";
import {
	Box,
	ChevronRight,
	Construction,
	PlusCircle,
	Trash2,
} from "@tamagui/lucide-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	Circle,
	H1,
	H3,
	Header,
	ListItem,
	Separator,
	Text,
	XStack,
	YGroup,
	YStack,
} from "tamagui";

const Product = ({
	product,
}: { product: Omit<SelectProduct, "createdAt"> }) => {
	return (
		<Link
			href={{
				pathname: "/product-listings",
				params: { id: product.id, name: product.name },
			}}
			asChild
		>
			<YStack>
				<YGroup.Item key={product.id}>
					<SwipeableRow
						rightActions={[
							{
								content: <Trash2 color={"$white5"} />,
								style: { backgroundColor: "red" },
								onPress: () => {
									rootStore.productsModel.deleteProduct(product.id);
								},
							},
						]}
					>
						<ListItem title={product.name} iconAfter={ChevronRight} />
					</SwipeableRow>
				</YGroup.Item>
			</YStack>
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

	return (
		<SafeAreaView style={styles.container}>
			{/* TODO: Search */}
			<YGroup flex={1} style={styles.container} padding={"$4"}>
				<FlashList
					data={rootStore.productsModel.products.get()}
					renderItem={({ item }) => <Product product={item} />}
					ListEmptyComponent={() => {
						return (
							<YStack
								height={WINDOW_HEIGHT - 100}
								alignItems="center"
								justifyContent="center"
								padding={"$4"}
							>
								<Box size={"$8"} />
								<H3 textAlign={"center"}>
									{
										"No products found.\nTap the + icon to add your first product!"
									}
								</H3>
							</YStack>
						);
					}}
					estimatedItemSize={100}
					ItemSeparatorComponent={() => <Separator />}
				/>
			</YGroup>
			<Circle
				position="absolute"
				right={"$6"}
				bottom={"$6"}
				backgroundColor={"$blue10Light"}
				padding={"$1"}
			>
				<Link href={{ pathname: "/add-product" }}>
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
