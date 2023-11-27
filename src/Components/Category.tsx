import { withObservables } from "@nozbe/watermelondb/react";
import { Text, XStack, ListItem, Square } from "tamagui";
import { SwipeableRow } from "./SwipeableRow";
import { rootStore } from "../LegendState";

const Category = ({ category, onCategoryPressed, onCategoryDelete }) => {
  return (
    <SwipeableRow
      key={category.id}
      onDelete={() => onCategoryDelete(category.id)}
    >
      <ListItem
        onPress={() => onCategoryPressed(category.id)}
        alignItems="center"
      >
        <XStack gap={"$4"}>
          <Text fontSize={"$6"}>{category.icon}</Text>
          <Text fontSize={"$6"}>{category.name}</Text>
        </XStack>
        <Square size={"$1"} backgroundColor={category.color} />
      </ListItem>
    </SwipeableRow>
  );
};

const enhance = withObservables(["category"], ({ category }) => ({
  category,
}));

export const EnhancedCategory = enhance(Category);
