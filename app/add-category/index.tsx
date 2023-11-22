import BottomSheet from "@gorhom/bottom-sheet";
import { observer } from "@legendapp/state/react";
import { PlusSquare, Smile } from "@tamagui/lucide-icons";
import { useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import ColorPicker, {
  BlueSlider,
  GreenSlider,
  OpacitySlider,
  Panel4,
  Panel5,
  RedSlider,
  Swatches,
  returnedResults,
} from "reanimated-color-picker";
import EmojiPicker, { EmojiType } from "rn-emoji-keyboard";
import {
  Button,
  Input,
  Separator,
  SizableText,
  Square,
  Tabs,
  Text,
  ToggleGroup,
  XStack,
  YStack,
  styled,
} from "tamagui";
import { rootStore } from "../../src/LegendState";

const CategoryType = observer(({ state$ }) => {
  const onCategoryChanged = (value) => {
    console.log({ value });
    state$.type.set(value);
  };

  return (
    <XStack justifyContent="center" py={"$2"} my={"$6"}>
      <ToggleGroup
        type="single"
        defaultValue={"Expense"}
        onValueChange={onCategoryChanged}
        disableDeactivation
      >
        <ToggleGroup.Item value="Expense">
          <Text>{"Expense"}</Text>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="Income">
          <Text>{"Income"}</Text>
        </ToggleGroup.Item>
      </ToggleGroup>
    </XStack>
  );
});

const Emoji = observer(({ state$ }) => {
  const handlePickedEmoji = (val: EmojiType) => {
    state$.icon.set(val.emoji);
  };

  return (
    <>
      <Square
        size={"$6"}
        backgroundColor={"$blue10Light"}
        onPress={state$.isEmojiPickerOpen.toggle}
      >
        {state$.icon.get().length === 0 ? (
          <Smile size={"$4"} />
        ) : (
          <Text fontSize={"$10"}>{state$.icon.get()}</Text>
        )}
      </Square>
      <EmojiPicker
        onEmojiSelected={handlePickedEmoji}
        open={state$.isEmojiPickerOpen.get()}
        onClose={() => {
          state$.isEmojiPickerOpen.set(false);
        }}
      />
    </>
  );
});

const CategoryNameRow = observer(({ state$, colorSheetRef, addCategory }) => {
  const openColorPicker = () => {
    colorSheetRef.current.snapToIndex(0);
  };

  const handleTextChange = (text: string) => {
    state$.name.set(text);
  };

  return (
    <XStack p={"$2"} alignSelf={"stretch"} space={"$2"} my={"$6"}>
      <Square
        size={"$4"}
        backgroundColor={state$.color.get()}
        onPress={openColorPicker}
      />
      <Input
        flex={1}
        placeholder={"Category name"}
        onChangeText={handleTextChange}
      />
      <Square justifyContent="center" onPress={addCategory}>
        <PlusSquare size={"$4"} />
      </Square>
    </XStack>
  );
});

const ColorPickerSheet = observer(({ state$, colorSheetRef, colors }) => {
  const snapPoints = useMemo(() => ["75%"], []);

  const handleConfirm = () => {
    colorSheetRef.current?.close?.();
  };

  const onColorSelected = ({ rgb }: returnedResults) => {
    state$.color.set(rgb);
  };

  return (
    <BottomSheet
      ref={colorSheetRef}
      snapPoints={snapPoints}
      index={-1}
      bottomInset={46}
      style={styles.sheetContainer}
      detached
    >
      <YStack p={"$4"} flex={1} justifyContent="space-between">
        <ColorPicker
          sliderThickness={25}
          thumbSize={24}
          thumbShape="circle"
          thumbAnimationDuration={100}
          adaptSpectrum
          boundedThumb
          value={state$.color.get()}
          onComplete={onColorSelected}
        >
          <Tabs
            defaultValue="tab1"
            orientation={"horizontal"}
            flexDirection="column"
          >
            <Tabs.List>
              <Tabs.Tab flex={1} value="tab1">
                <SizableText fontFamily="$body">Grid</SizableText>
              </Tabs.Tab>
              <Tabs.Tab flex={1} value="tab2">
                <SizableText fontFamily="$body">Spectrum</SizableText>
              </Tabs.Tab>
              <Tabs.Tab flex={1} value="tab3">
                <SizableText fontFamily="$body">Sliders</SizableText>
              </Tabs.Tab>
            </Tabs.List>
            <Separator py={"$2"} />
            <Tabs.Content value="tab1">
              <Panel5 />
            </Tabs.Content>

            <Tabs.Content value="tab2">
              <Panel4 />
            </Tabs.Content>

            <Tabs.Content value="tab3">
              <Text style={styles.sliderTitle}>Red</Text>
              <RedSlider style={styles.sliderStyle} />

              <Text style={styles.sliderTitle}>Green</Text>
              <GreenSlider style={styles.sliderStyle} />

              <Text style={styles.sliderTitle}>Blue</Text>
              <BlueSlider style={styles.sliderStyle} />

              <Text style={styles.sliderTitle}>Opacity</Text>
              <OpacitySlider style={styles.sliderStyle} />

              <Swatches
                style={styles.swatchesContainer}
                swatchStyle={styles.swatchStyle}
                colors={colors}
              />
            </Tabs.Content>
          </Tabs>
        </ColorPicker>
        <Button backgroundColor={"$color.green10Light"} onPress={handleConfirm}>
          <Text color={"white"}>{"Pick"}</Text>
        </Button>
      </YStack>
    </BottomSheet>
  );
});

const AddCategory = () => {
  const colorSheetRef = useRef<BottomSheet>(null);
  const state$ = rootStore.categoryModel.obs;

  return (
    <YStack flex={1} px={"$2"} alignItems="center">
      <CategoryType state$={state$} />
      <Emoji state$={state$} />
      <CategoryNameRow
        state$={state$}
        colorSheetRef={colorSheetRef}
        addCategory={rootStore.categoryModel.create}
      />
      <ColorPickerSheet
        colorSheetRef={colorSheetRef}
        state$={state$}
        colors={rootStore.categoryModel.colors}
      />
    </YStack>
  );
};

export default AddCategory;

const styles = StyleSheet.create({
  sheetContainer: {
    // add horizontal space
    marginHorizontal: 10,
  },
  sliderTitle: {
    color: "#000",
    fontWeight: "bold",
    marginBottom: 5,
    paddingHorizontal: 4,
  },
  sliderStyle: {
    borderRadius: 20,
    marginBottom: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  swatchesContainer: {
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: "#bebdbe",
    alignItems: "center",
    flexWrap: "nowrap",
    gap: 10,
  },
  swatchStyle: {
    borderRadius: 20,
    height: 30,
    width: 30,
    margin: 0,
    marginBottom: 0,
    marginHorizontal: 0,
    marginVertical: 0,
  },
});
