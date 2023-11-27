import { StyleSheet } from "react-native";
import React from "react";
import { Circle, YStack } from "tamagui";
import { EnhancedCategoriesList } from "../../src/Components/CategoriesList";
import { rootStore } from "../../src/LegendState";
import { PlusCircle } from "@tamagui/lucide-icons";
import { Link } from "expo-router";

const Categories = () => {
  const handleCagtegoryDelete = (id) => {
    rootStore.categoryModel.deleteCategoryById(id);
  };

  return (
    <YStack flex={1} padding={"$2"}>
      <EnhancedCategoriesList
        categories={rootStore.categoryModel.categoriesList}
        onCategoryPressed={() => null}
        onCategoryDelete={handleCagtegoryDelete}
      />
      <Circle
        position="absolute"
        right={"$6"}
        bottom={"$6"}
        backgroundColor={"$blue10Light"}
        padding={"$1"}
      >
        <Link href={"add-category"}>
          <PlusCircle size={"$4"} color="white" />
        </Link>
      </Circle>
    </YStack>
  );
};

export default Categories;

const styles = StyleSheet.create({});
