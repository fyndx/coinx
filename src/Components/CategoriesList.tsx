import type {
	CategoriesListObservable,
	ICategory,
} from "@/src/LegendState/Category.model";
import { observer } from "@legendapp/state/react";
import React from "react";
import { View } from "react-native";
import { Category } from "./Category";

interface CategoriesListProps {
	categories: CategoriesListObservable;
	onCategoryPressed: (category: ICategory) => void;
	onCategoryDelete: (category: ICategory) => void;
}

export const CategoriesList = observer(
	({
		categories,
		onCategoryPressed,
		onCategoryDelete,
	}: CategoriesListProps) => {
		return (
			<View className="p-4 rounded-lg bg-card">
				{categories?.map((category) => (
					<Category
						key={category.id.peek()}
						category={category}
						onCategoryPressed={onCategoryPressed}
						onCategoryDelete={onCategoryDelete}
					/>
				))}
			</View>
		);
	},
);
