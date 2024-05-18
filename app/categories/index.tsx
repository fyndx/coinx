import { StyleSheet } from "react-native";
import React, { Suspense } from "react";
import { Circle, YStack, Text } from "tamagui";
import { CategoriesList } from "../../src/Components/CategoriesList";
import { rootStore } from "../../src/LegendState";
import { PlusCircle } from "@tamagui/lucide-icons";
import { Link } from "expo-router";
import { useMount } from "@legendapp/state/react";

const Categories = () => {
  const handleCagtegoryDelete = (id) => {
    rootStore.categoryModel.deleteCategoryById(id);
  };

  useMount(() => {
    rootStore.categoryModel.getCategoriesList();
  })

  return (
    <YStack flex={1} padding={"$2"}>
      <Suspense fallback={<Text>Loading...</Text>}>
        <CategoriesList
          categories={rootStore.categoryModel.categories}
          onCategoryPressed={() => null}
          onCategoryDelete={handleCagtegoryDelete}
        />
      </Suspense>
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
