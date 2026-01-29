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
} from "lucide-react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/src/Components/ui/Text";

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
			<Pressable>
				<View key={product.id}>
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
								content: <FileEdit color="gray" />,
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
						<View className="flex-row justify-between items-center p-4 bg-background border-b border-border">
							<Text className="text-lg">{product.name}</Text>
							<ChevronRight size={20} color="gray" />
						</View>
					</SwipeableRow>
				</View>
			</Pressable>
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
			<View className="flex-1">
				<View className="justify-center items-center py-2">
					<Text className="text-xl font-bold">{"Products"}</Text>
				</View>
				{/* TODO: Search */}
				<View className="flex-1 p-4">
					<FlashList
					data={productsModel$.products.get()}
					renderItem={({ item }) => <Product product={item} />}
					estimatedItemSize={100}
					ListEmptyComponent={() => {
						// TODO: .get() might not work here
						if (productsModel$.isLoading.get()) {
							return (
								<View
									style={{ height: WINDOW_HEIGHT - 100 }}
									className="items-center justify-center p-4"
								>
									<ActivityIndicator size={"large"} />
								</View>
							);
						}
						return (
							<View
								style={{ height: WINDOW_HEIGHT - 100 }}
								className="items-center justify-center p-4"
							>
								<Box size={32} color="gray" />
								<Text className="text-center font-bold text-lg mt-2">
									{
										"No products found.\nTap the + icon to add your first product!"
									}
								</Text>
							</View>
						);
					}}
					ItemSeparatorComponent={() => <View className="h-[1px] bg-border" />}
				/>
				</View>
			</View>
			<View
				className="absolute right-6 bottom-6 bg-blue-100 p-2 rounded-full"
			>
				<Link href={{ pathname: "/add-product" }} asChild>
					<Pressable>
						<PlusCircle size={32} color="#2563eb" />
					</Pressable>
				</Link>
			</View>
		</SafeAreaView>
	);
});


export default Products;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
