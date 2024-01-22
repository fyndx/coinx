import { Transaction } from "./Transaction";
import { ScrollView } from "tamagui";

export const TransactionsList = ({ transactions }) => {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      {transactions.map((transaction) => {
        return <Transaction key={transaction.id} transaction={transaction} />;
      })}
    </ScrollView>
  );
};
