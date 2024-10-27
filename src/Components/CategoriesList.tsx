import type {
	CategoriesListObservable,
	ICategory,
} from "@/src/LegendState/Category.model";
import { observer, useMount } from "@legendapp/state/react";
import React, { Fragment } from "react";
import { Separator, YGroup } from "tamagui";
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
			<YGroup padding={"$3"}>
				{categories?.map((category) => {
					return (
						<Fragment key={category.id.peek()}>
							<Category
								key={category.id.peek()}
								category={category}
								onCategoryPressed={onCategoryPressed}
								onCategoryDelete={onCategoryDelete}
							/>
							<Separator />
						</Fragment>
					);
				})}
			</YGroup>
		);
	},
);
