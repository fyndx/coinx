import { StyleSheet, Text, View } from "react-native";
import { EnhancedCategoriesList } from "../../../src/Components/CategoriesList";
import { rootStore } from "../../../src/LegendState";
import { EnhancedTransactionsList } from "../../../src/Components/TransactionsList";
import { Stack } from "tamagui";

const Transactions = () => {
  return (
    <Stack flex={1}>
      <Text>Transactions</Text>
      <EnhancedTransactionsList
        transactions={rootStore.transactionModel.transactionsList}
      />
    </Stack>
  );
};

export default Transactions;

const styles = StyleSheet.create({});
