import { withObservables } from "@nozbe/watermelondb/react";
import { EnhancedCategory } from "./Category";

const CategoriesList = ({ categories, onCategoryPressed }) => {
  return categories.map((category) => {
    return (
      <EnhancedCategory
        key={category.id}
        category={category}
        onCategoryPressed={onCategoryPressed}
      />
    );
  });
};

const enhance = withObservables(["categories"], ({ categories }) => ({
  categories,
}));

export const EnhancedCategoriesList = enhance(CategoriesList);
