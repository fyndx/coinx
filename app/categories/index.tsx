import type { ICategory } from "@/src/LegendState/Category.model";
import { useMount } from "@legendapp/state/react";
import { PlusCircle } from "@tamagui/lucide-icons";
import { Link } from "expo-router";
import React, { Suspense } from "react";
import { StyleSheet } from "react-native";
import { Circle, Text, YStack } from "tamagui";
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
		<YStack flex={1} padding={"$2"}>
			<Suspense fallback={<Text>Loading...</Text>}>
				<CategoriesList
					categories={rootStore.categoryModel.categories}
					onCategoryPressed={() => null}
					onCategoryDelete={handleCagtegoryDelete}
				/>
			</Suspense>
			<Circle
				position="absolute"
				right={"$6"}
				bottom={"$6"}
				backgroundColor={"$blue10Light"}
				padding={"$1"}
			>
				<Link href={"add-category"}>
					<PlusCircle size={"$4"} color="white" />
				</Link>
			</Circle>
		</YStack>
	);
};

export default Categories;

const styles = StyleSheet.create({});
