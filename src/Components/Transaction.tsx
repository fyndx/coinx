import { withObservables } from "@nozbe/watermelondb/react";
import { ListItem } from "tamagui";

const Transaction = ({ transaction }) => {
  return <ListItem key={transaction.id} title={transaction.amount} />;
};

const enhance = withObservables(["transaction"], ({ transaction }) => ({
  transaction,
}));

export const EnhancedTransaction = enhance(Transaction);
