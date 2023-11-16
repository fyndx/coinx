import { useMemo, useRef } from "react";
import {
  Button,
  Popover,
  SizableText,
  Spacer,
  Stack,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { observer } from "@legendapp/state/react";
import { CheckSquare, Delete } from "@tamagui/lucide-icons";
import DateTimePicker, { DateType } from "react-native-ui-datepicker";
import dayjs from "dayjs";
import { TransactionModel } from "../../../src/LegendState/Transaction.model";
import { database } from "../../../src/database/WaterMelon";
import BottomSheet, {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { EnhancedCategoriesList } from "../../../src/Components/CategoriesList";
import { rootStore } from "../../../src/LegendState";

const NumberButton = ({ text, onPress }) => {
  return (
    <Button
      size={"$6"}
      width={"$9"}
      onPress={(_event) => onPress(_event, text)}
      backgroundColor={"$color.green10Light"}
      pressStyle={{ backgroundColor: "$color.green10Dark" }}
    >
      <Text color={"white"}>{text}</Text>
    </Button>
  );
};

const SubmitButton = ({ onPress }) => {
  return (
    <Button
      size={"$6"}
      width={"$9"}
      onPress={onPress}
      icon={CheckSquare}
      backgroundColor={"$color.green10Light"}
      pressStyle={{ backgroundColor: "$color.green10Dark" }}
      color={"white"}
    />
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
      </XStack>
    </YStack>
  );
};

const CategoryAndDateButtons = observer(
  ({ transactionModel$, dateSheetRef, categorySheetRef }) => {
    const openDatepicker = () => {
      dateSheetRef.current.snapToIndex(0);
    };

    const openCategoryPicker = () => {
      categorySheetRef.current.snapToIndex(0);
    };

    const rawCategory = transactionModel$.obs.category.get();

    const category = rawCategory ? rawCategory.name : "Category";

    return (
      <XStack space>
        <Button
          flex={3}
          variant="outlined"
          backgroundColor={"$color.green10Light"}
          pressStyle={{ backgroundColor: "$color.green10Dark" }}
          onPress={openDatepicker}
        >
          <SizableText color={"white"}>
            {transactionModel$.obs.date.get().format("ddd D MMM HH:MM")}
          </SizableText>
        </Button>
        <Button
          flex={2}
          variant="outlined"
          backgroundColor={"$color.green10Light"}
          pressStyle={{ backgroundColor: "$color.green10Dark" }}
          onPress={openCategoryPicker}
        >
          <SizableText color={"white"}>{category}</SizableText>
        </Button>
      </XStack>
    );
  }
);

const DatePicker = observer(({ transactionModel$, dateSheetRef }) => {
  const snapPoints = useMemo(() => ["50%"], []);

  const handleValueChange = (value: DateType) => {
    transactionModel$.obs.date.set(dayjs(value));
    dateSheetRef.current.close();
  };

  return (
    <BottomSheet ref={dateSheetRef} snapPoints={snapPoints} index={-1}>
      <Stack>
        <DateTimePicker
          value={transactionModel$.obs.date.get()}
          onValueChange={handleValueChange}
        />
      </Stack>
    </BottomSheet>
  );
});

const CategoryPicker = observer(
  ({ transactionModel$, categoryModel$, categorySheetRef }) => {
    const onCategoryPressed = async (id) => {
      console.log("Pressed category", id);
      const category = await categoryModel$.getCategoryByIdAsync(id);
      transactionModel$.obs.category.set(category);
      categorySheetRef.current.close();
    };

    return (
      <BottomSheet ref={categorySheetRef} snapPoints={["50%"]} index={-1}>
        <BottomSheetScrollView>
          <EnhancedCategoriesList
            categories={rootStore.categoryModel.categoriesList}
            onCategoryPressed={onCategoryPressed}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

const TransactionInput = observer(({ transactionModel$ }) => {
  return (
    <XStack>
      <Spacer size={"$5"} />
      <XStack flex={1} alignItems="center" justifyContent="center" space="$2">
        <SizableText theme="alt1" size={"$4"}>
          $
        </SizableText>
        <SizableText size={"$8"}>
          {transactionModel$.obs.amount.get()}
        </SizableText>
      </XStack>
      <Button icon={<Delete size={"$1"} />} onPress={transactionModel$.clear} />
    </XStack>
  );
});

const AddTransaction = () => {
  const dateSheetRef = useRef<BottomSheet>(null);
  const categorySheetRef = useRef<BottomSheet>(null);
  const transactionModel$ = rootStore.transactionModel;
  const categoryModel$ = rootStore.categoryModel;

  const handleKeyPressed = (text) => {
    transactionModel$.setAmount(text);
  };

  const handleSubmit = async () => {
    await transactionModel$.createTransaction();
    await transactionModel$.transactionCount();
  };

  return (
    <YStack paddingHorizontal="$4" flex={1} justifyContent="space-between">
      <Stack flex={1} justifyContent="center">
        <TransactionInput transactionModel$={transactionModel$} />
      </Stack>
      <CategoryAndDateButtons
        transactionModel$={transactionModel$}
        dateSheetRef={dateSheetRef}
        categorySheetRef={categorySheetRef}
      />
      <Stack paddingVertical="$4">
        <NumberKeypad onKeyPressed={handleKeyPressed} onSubmit={handleSubmit} />
      </Stack>
      <DatePicker
        transactionModel$={transactionModel$}
        dateSheetRef={dateSheetRef}
      />
      <CategoryPicker
        transactionModel$={transactionModel$}
        categoryModel$={categoryModel$}
        categorySheetRef={categorySheetRef}
      />
    </YStack>
  );
};

export default AddTransaction;
