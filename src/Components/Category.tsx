import { withObservables } from "@nozbe/watermelondb/react";
import { Text, View } from "tamagui";

const Category = ({ category }) => {
  return (
    <View>
      <Text>{category.name}</Text>
      <Text>{category.icon}</Text>
      <Text>{category.color}</Text>
    </View>
  );
};

const enhance = withObservables(["category"], ({ category }) => ({
  category,
}));

export const EnhancedCategory = enhance(Category);
