import type {
	CategoriesListObservable,
	ICategory,
} from "@/src/LegendState/Category.model";
import { observer, useMount } from "@legendapp/state/react";
import React from "react";
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
		return categories?.map((category) => {
			return (
				<Category
					key={category.id.peek()}
					category={category}
					onCategoryPressed={onCategoryPressed}
					onCategoryDelete={onCategoryDelete}
				/>
			);
		});
	},
);
