---
name: bottom-sheet
description: Gorhom Bottom Sheet for modal sheets. Use when creating bottom sheets, action sheets, or slide-up panels in CoinX.
---

# Bottom Sheet

@gorhom/bottom-sheet for modal interactions.

## Basic Setup

```tsx
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRef, useMemo } from "react";

const MySheet = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}  // Start closed
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <BottomSheetView style={{ flex: 1, padding: 16 }}>
        <Text>Sheet Content</Text>
      </BottomSheetView>
    </BottomSheet>
  );
};
```

## Control Methods

```tsx
const bottomSheetRef = useRef<BottomSheet>(null);

// Open to snap point
bottomSheetRef.current?.snapToIndex(0);  // 25%
bottomSheetRef.current?.snapToIndex(1);  // 50%

// Expand fully
bottomSheetRef.current?.expand();

// Close
bottomSheetRef.current?.close();

// Collapse to first snap point
bottomSheetRef.current?.collapse();
```

## With Backdrop

```tsx
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

<BottomSheet
  ref={bottomSheetRef}
  snapPoints={snapPoints}
  backdropComponent={(props) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
    />
  )}
>
  {/* Content */}
</BottomSheet>
```

## Scrollable Content

```tsx
import { BottomSheetScrollView, BottomSheetFlatList } from "@gorhom/bottom-sheet";

// ScrollView
<BottomSheet snapPoints={snapPoints}>
  <BottomSheetScrollView>
    {/* Long content */}
  </BottomSheetScrollView>
</BottomSheet>

// FlatList
<BottomSheet snapPoints={snapPoints}>
  <BottomSheetFlatList
    data={items}
    renderItem={({ item }) => <Item data={item} />}
    keyExtractor={(item) => item.id}
  />
</BottomSheet>
```

## Text Input

```tsx
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

<BottomSheet snapPoints={snapPoints}>
  <BottomSheetView>
    <BottomSheetTextInput
      placeholder="Enter text"
      style={styles.input}
    />
  </BottomSheetView>
</BottomSheet>
```

## Callbacks

```tsx
<BottomSheet
  onChange={(index) => {
    console.log("Sheet moved to:", index);
  }}
  onClose={() => {
    console.log("Sheet closed");
  }}
>
```

## Dynamic Snap Points

```tsx
const snapPoints = useMemo(() => {
  // Based on content height
  return [contentHeight, "80%"];
}, [contentHeight]);

// Or use dynamic sizing
<BottomSheet
  enableDynamicSizing
  maxDynamicContentSize={500}
>
  <BottomSheetView>
    {/* Content determines height */}
  </BottomSheetView>
</BottomSheet>
```

## Common Pattern

```tsx
// Parent component manages sheet
const ParentScreen = () => {
  const sheetRef = useRef<BottomSheet>(null);

  const openSheet = () => sheetRef.current?.snapToIndex(0);
  const closeSheet = () => sheetRef.current?.close();

  return (
    <View style={{ flex: 1 }}>
      <Button onPress={openSheet}>Open Sheet</Button>
      
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={["50%"]}
        enablePanDownToClose
      >
        <BottomSheetView>
          <SheetContent onClose={closeSheet} />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};
```
