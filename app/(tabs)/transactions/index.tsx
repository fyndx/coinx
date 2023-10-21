import { StyleSheet, Text, View } from "react-native";
import { EnhancedCategoriesList } from "../../../src/Components/CategoriesList";
import { rootStore } from "../../../src/LegendState";

const Transactions = () => {
  return (
    <View>
      <Text>Transactions</Text>
      <EnhancedCategoriesList
        categories={rootStore.categoryModel.categoriesList}
      />
    </View>
  );
};

export default Transactions;

const styles = StyleSheet.create({});
