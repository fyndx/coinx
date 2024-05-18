import { ListItem } from "tamagui";

export const Transaction = ({ transaction }) => {
  return (
    <ListItem
      key={transaction.id}
      title={transaction.amount}
      subTitle={transaction.note}
    />
  );
};
