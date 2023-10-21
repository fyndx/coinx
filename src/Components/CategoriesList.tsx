import { withObservables } from "@nozbe/watermelondb/react";
import { EnhancedCategory } from "./Category";

const CategoriesList = ({ categories }) => {
  return categories.map((category) => {
    return <EnhancedCategory key={category.id} category={category} />;
  });
};

const enhance = withObservables(["categories"], ({ categories }) => ({
  categories,
}));

export const EnhancedCategoriesList = enhance(CategoriesList);
