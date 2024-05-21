import { Text, XStack, ListItem, Square } from "tamagui";
import { SwipeableRow } from "./SwipeableRow";
import { rootStore } from "../LegendState";
import type { ObservableObject } from "@legendapp/state";
import type { ICategory } from "../LegendState/Category.model";
import { observer } from "@legendapp/state/react";

interface CategoryProps {
  category: ObservableObject<ICategory>;
  onCategoryPressed: (id: number) => void;
  onCategoryDelete: (id: number) => void;
}

export const Category = observer(({ category, onCategoryPressed, onCategoryDelete }: CategoryProps) => {
  return (
    <SwipeableRow
      key={category.id.peek()}
      onDelete={() => onCategoryDelete(category.id.peek())}
    >
      <ListItem
        onPress={() => onCategoryPressed(category.id.peek())}
        alignItems="center"
      >
        <XStack gap={"$4"}>
          <Text fontSize={"$6"}>{category.icon}</Text>
          <Text fontSize={"$6"}>{category.name}</Text>
        </XStack>
        <Square size={"$1"} backgroundColor={category.color.get()} />
      </ListItem>
    </SwipeableRow>
  );
});
