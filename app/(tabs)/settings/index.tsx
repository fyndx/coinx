import { StyleSheet, Text, View } from "react-native";
import { Button } from "tamagui";
import { rootStore } from "../../../src/LegendState";

const Settings = () => {
  const clearTransactions = () => {
    rootStore.transactionModel.deleteAllTransactions();
  };

  return (
    <View>
      <Text>Settings</Text>
      <Button onPress={clearTransactions}>{"Clear All Transactions"}</Button>
      <Button>{"Clear Database"}</Button>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({});
