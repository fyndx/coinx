import type { SelectProduct } from "@/db/schema";
import { SwipeableRow } from "@/src/Components/SwipeableRow";
import { rootStore } from "@/src/LegendState";
import { WINDOW_HEIGHT } from "@gorhom/bottom-sheet";
import { observer } from "@legendapp/state/react";
import { FlashList } from "@shopify/flash-list";
import {
	Box,
	ChevronRight,
	FileEdit,
	PlusCircle,
	Trash2,
} from "@tamagui/lucide-icons";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	Circle,
	H3,
	ListItem,
	Separator,
	Spinner,
	Stack,
	XStack,
	YGroup,
	YStack,
} from "tamagui";

const Product = ({
	product,
}: { product: Omit<SelectProduct, "createdAt"> }) => {
	const router = useRouter();
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
								content: <Trash2 color={"red"} />,
								style: { backgroundColor: "white" },
								onPress: () => {
									rootStore.productsModel.deleteProduct(product.id);
								},
							},
						]}
						leftActions={[
							{
								content: <FileEdit color={"$black5"} />,
								style: { backgroundColor: "white" },
								onPress: () => {
									const addProductScreenModel$ =
										rootStore.addProductScreenModel;
									addProductScreenModel$.product.set(product);
									router.push({
										pathname: "/add-product",
									});
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
	const productsModel$ = rootStore.productsModel;
	useFocusEffect(
		useCallback(() => {
			productsModel$.getProductsList();
		}, []),
	);

	return (
		<SafeAreaView style={styles.container}>
			<Stack flex={1}>
				<XStack justifyContent={"center"} py={"$2"}>
					<H3>{"Products"}</H3>
				</XStack>
				{/* TODO: Search */}
				<YGroup flex={1} style={styles.container} padding={"$4"}>
					<FlashList
						data={productsModel$.products.get()}
						renderItem={({ item }) => <Product product={item} />}
						ListEmptyComponent={() => {
							// TODO: .get() might not work here
							if (productsModel$.isLoading.get()) {
								return (
									<YStack
										height={WINDOW_HEIGHT - 100}
										alignItems="center"
										justifyContent="center"
										padding={"$4"}
									>
										<Spinner size={"large"} />
									</YStack>
								);
							}
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
			</Stack>
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
