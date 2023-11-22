import { StyleSheet } from "react-native";
import React from "react";
import { Circle, Stack, YStack, ZStack } from "tamagui";
import { EnhancedCategoriesList } from "../../src/Components/CategoriesList";
import { rootStore } from "../../src/LegendState";
import { PlusCircle } from "@tamagui/lucide-icons";
import { Link } from "expo-router";

const Categories = () => {
  return (
    <YStack flex={1} padding={"$2"}>
      <EnhancedCategoriesList
        categories={rootStore.categoryModel.categoriesList}
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
