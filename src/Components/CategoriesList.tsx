import React from "react";
import { Category } from "./Category";
import { observer, useMount } from "@legendapp/state/react";
import type { CategoriesListObservable } from "../LegendState/Category.model";

interface CategoriesListProps {
  categories: CategoriesListObservable;
  onCategoryPressed: (id: number) => void;
  onCategoryDelete: (id: number) => void;
}

export const CategoriesList = observer(
  ({
    categories,
    onCategoryPressed,
    onCategoryDelete,
  }: CategoriesListProps) => {
    console.log({ categories: categories?.peek?.() });

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
  }
);
