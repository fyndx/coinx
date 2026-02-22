import { Text } from "@/src/Components/ui/Text";
import type { ICategory } from "@/src/LegendState/Category.model";
import { useMount } from "@legendapp/state/react";
import { Link } from "expo-router";
import { PlusCircle } from "lucide-react-native";
import React, { Suspense } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { CategoriesList } from "../../src/Components/CategoriesList";
import { rootStore } from "../../src/LegendState";

const Categories = () => {
	const handleCagtegoryDelete = (category: ICategory) => {
		rootStore.categoryModel.deleteCategoryById(category.id);
	};

	useMount(() => {
		rootStore.categoryModel.getCategoriesList({});
	});

	return (
		<View className="flex-1">
			<Suspense
				fallback={
					<View className="p-4">
						<Text>Loading...</Text>
						<ActivityIndicator />
					</View>
				}
			>
				<ScrollView>
					<CategoriesList
						categories={rootStore.categoryModel.categories}
						onCategoryPressed={() => null}
						onCategoryDelete={handleCagtegoryDelete}
					/>
				</ScrollView>
			</Suspense>
			<View className="absolute right-6 bottom-6 bg-blue-100 p-2 rounded-full shadow-md">
				<Link href={"/add-category"} asChild>
					<Pressable>
						<PlusCircle size={32} color="#2563eb" />
					</Pressable>
				</Link>
			</View>
		</View>
	);
};

export default Categories;

const styles = StyleSheet.create({});
