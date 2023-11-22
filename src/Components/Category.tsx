import { withObservables } from "@nozbe/watermelondb/react";
import { Button, Text, View, XStack, ListItem, Square } from "tamagui";

const Category = ({ category, onCategoryPressed }) => {
  return (
    <ListItem
      key={category.id}
      onPress={() => onCategoryPressed(category.id)}
      alignItems="center"
    >
      <XStack gap={"$4"}>
        <Text fontSize={"$6"}>{category.icon}</Text>
        <Text fontSize={"$6"}>{category.name}</Text>
      </XStack>
      <Square size={"$1"} backgroundColor={category.color} />
    </ListItem>
  );
};

const enhance = withObservables(["category"], ({ category }) => ({
  category,
}));

export const EnhancedCategory = enhance(Category);
