import { useRef } from "react";
import { StyleSheet } from "react-native";
import { Button, Input, Label, Stack, Text, XStack, YStack } from "tamagui";
import { observer } from "@legendapp/state/react";
import { CheckSquare } from "@tamagui/lucide-icons";
import { TransactionModel } from "../../../src/LegendState/Transaction.model";

const NumberButton = ({ text, onPress }) => {
  return (
    <Button
      size={"$6"}
      width={"$9"}
      backgroundColor={"$blue10Dark"}
      onPress={(_event) => onPress(_event, text)}
    >
      <Text>{text}</Text>
    </Button>
  );
};

const SubmitButton = ({ onPress }) => {
  return (
    <Button
      size={"$6"}
      width={"$9"}
      backgroundColor={"$blue10Dark"}
      onPress={onPress}
      icon={CheckSquare}
    ></Button>
  );
};

const NumberKeypad = ({ onKeyPressed, onSubmit }) => {
  const handleKeyPressed = (_event, text) => {
    onKeyPressed(text);
  };

  return (
    <YStack space="$3">
      <XStack justifyContent="space-around">
        <NumberButton text={1} onPress={handleKeyPressed} />
        <NumberButton text={2} onPress={handleKeyPressed} />
        <NumberButton text={3} onPress={handleKeyPressed} />
      </XStack>
      <XStack justifyContent="space-around">
        <NumberButton text={4} onPress={handleKeyPressed} />
        <NumberButton text={5} onPress={handleKeyPressed} />
        <NumberButton text={6} onPress={handleKeyPressed} />
      </XStack>
      <XStack justifyContent="space-around">
        <NumberButton text={7} onPress={handleKeyPressed} />
        <NumberButton text={8} onPress={handleKeyPressed} />
        <NumberButton text={9} onPress={handleKeyPressed} />
      </XStack>
      <XStack justifyContent="space-around">
        <NumberButton text={0} onPress={handleKeyPressed} />
        <NumberButton text={"."} onPress={handleKeyPressed} />
        <SubmitButton onPress={onSubmit} />
        {/* <NumberButton text={"✔︎"} onPress={onSubmit} /> */}
      </XStack>
    </YStack>
  );
};

const TransactionInput = observer(({ transactionModel$ }) => {
  return (
    <XStack alignItems="center" justifyContent="center" space padding="$4">
      <Label>$</Label>
      <Input
        size={"$4"}
        borderWidth={"$1"}
        placeholder={"Amount"}
        value={transactionModel$.obs.amount.get()}
        disabled
      />
    </XStack>
  );
});

const AddTransaction = () => {
  const transactionModel$ = useRef(new TransactionModel()).current;

  const handleKeyPressed = (text) => {
    transactionModel$.setAmount(text);
  };

  const handleSubmit = () => {
    transactionModel$.createTransaction();
  };

  return (
    <YStack paddingHorizontal="$4" flex={1} justifyContent="space-between">
      <Stack flex={1} justifyContent="center">
        <TransactionInput transactionModel$={transactionModel$} />
      </Stack>
      <Stack paddingVertical="$4">
        <NumberKeypad onKeyPressed={handleKeyPressed} onSubmit={handleSubmit} />
      </Stack>
    </YStack>
  );
};

export default AddTransaction;

const styles = StyleSheet.create({});
