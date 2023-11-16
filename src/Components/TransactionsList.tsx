import { withObservables } from "@nozbe/watermelondb/react";
import { EnhancedTransaction } from "./Transaction";
import { ScrollView } from "tamagui";

const TransactionsList = ({ transactions }) => {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      {transactions.map((transaction) => {
        return (
          <EnhancedTransaction key={transaction.id} transaction={transaction} />
        );
      })}
    </ScrollView>
  );
};

const enhance = withObservables(["transactions"], ({ transactions }) => ({
  transactions,
}));

export const EnhancedTransactionsList = enhance(TransactionsList);
