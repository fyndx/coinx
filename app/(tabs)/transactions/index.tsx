import { StyleSheet, Text } from "react-native";
import { rootStore } from "../../../src/LegendState";
import { EnhancedTransactionsList } from "../../../src/Components/TransactionsList";
import { Button, Stack, XStack, YStack } from "tamagui";
import { ChevronDownSquare, Search } from "@tamagui/lucide-icons";
import { useRef } from "react";
import { MenuView, NativeActionEvent } from "@react-native-menu/menu";
import { TransactionsScreenModel } from "../../../src/LegendState/TransactionsScreen.model";
import { observer, useMount } from "@legendapp/state/react";

const ACTIONS = [
  {
    id: "today",
    title: "today",
  },
  {
    id: "this week",
    title: "this week",
  },
  {
    id: "this month",
    title: "this month",
  },
  {
    id: "this year",
    title: "this year",
  },
  {
    id: "all time",
    title: "all time",
  },
];

const SpentMenuComponent = observer(
  ({
    transactionsScreenModel$,
  }: {
    transactionsScreenModel$: TransactionsScreenModel;
  }) => {
    const handleOptionChange = ({ nativeEvent }: NativeActionEvent) => {
      transactionsScreenModel$.obs.duration.set(nativeEvent.event);
    };

    return (
      <YStack paddingVertical={"$6"}>
        <XStack alignItems="center" justifyContent="center">
          <Text>{"Spent "}</Text>
          <MenuView actions={ACTIONS} onPressAction={handleOptionChange}>
            <Button size={"$2"} variant="outlined">
              <Text>{transactionsScreenModel$.obs.duration.get()}</Text>
            </Button>
          </MenuView>
        </XStack>
      </YStack>
    );
  }
);

const Transactions = () => {
  const transactionsScreenModel$ = rootStore.transactionsScreenModel;

  const getTransactionsGrouped = () => {
    transactionsScreenModel$.transactionsList();
  };

  return (
    <Stack flex={1} paddingHorizontal={"$2"}>
      <XStack justifyContent="space-between" paddingVertical={"$2"}>
        <Search />
        <ChevronDownSquare />
      </XStack>
      <SpentMenuComponent transactionsScreenModel$={transactionsScreenModel$} />
      <EnhancedTransactionsList
        transactions={rootStore.transactionModel.transactionsList}
      />
      <Button onPress={getTransactionsGrouped}>
        <Text>Get Transactions</Text>
      </Button>
    </Stack>
  );
};

export default Transactions;

const styles = StyleSheet.create({});
