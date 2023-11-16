import { withObservables } from "@nozbe/watermelondb/react";
import { Button, Text, View, XStack, ListItem } from "tamagui";

const Category = ({ category, onCategoryPressed }) => {
  return (
    <ListItem
      key={category.id}
      title={category.name}
      onPress={() => onCategoryPressed(category.id)}
    />
  );
};

const enhance = withObservables(["category"], ({ category }) => ({
  category,
}));

export const EnhancedCategory = enhance(Category);
