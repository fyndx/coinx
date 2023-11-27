import { withObservables } from "@nozbe/watermelondb/react";
import { EnhancedCategory } from "./Category";

const CategoriesList = ({
  categories,
  onCategoryPressed,
  onCategoryDelete,
}) => {
  return categories.map((category) => {
    return (
      <EnhancedCategory
        key={category.id}
        category={category}
        onCategoryPressed={onCategoryPressed}
        onCategoryDelete={onCategoryDelete}
      />
    );
  });
};

const enhance = withObservables(["categories"], ({ categories }) => ({
  categories,
}));

export const EnhancedCategoriesList = enhance(CategoriesList);
