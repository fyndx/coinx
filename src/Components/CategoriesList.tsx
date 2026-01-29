import type {
	CategoriesListObservable,
	ICategory,
} from "@/src/LegendState/Category.model";
import { observer, useMount } from "@legendapp/state/react";
import React, { Fragment } from "react";
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
				{categories?.map((category) => {
					return (
						<Fragment key={category.id.peek()}>
							<Category
								category={category}
								onCategoryPressed={onCategoryPressed}
								onCategoryDelete={onCategoryDelete}
							/>
						</Fragment>
					);
				})}
			</View>
		);
	},
);
