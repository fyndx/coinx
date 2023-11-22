import { StyleSheet, Text, View } from "react-native";
import { Button } from "tamagui";
import { rootStore } from "../../../src/LegendState";
import { Link } from "expo-router";

const Settings = () => {
  const clearTransactions = () => {
    rootStore.transactionModel.deleteAllTransactions();
  };

  const clearCategories = () => {
    rootStore.categoryModel.deleteAllCategories();
  };

  return (
    <View>
      <Text>Settings</Text>
      <Button onPress={clearTransactions}>{"Clear All Transactions"}</Button>
      <Button onPress={clearCategories}>{"Clear All Categories"}</Button>
      <Link href={"categories"} asChild>
        <Button>{"Categories"}</Button>
      </Link>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({});
