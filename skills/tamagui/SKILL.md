---
name: tamagui
description: Tamagui UI components for React Native. Use when building screens, styling components, or working with the design system in CoinX.
---

# Tamagui

Universal UI components for CoinX.

## Common Components

### Layout

```tsx
import { XStack, YStack, Stack } from "tamagui";

// Vertical stack
<YStack gap="$4" padding="$4">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</YStack>

// Horizontal stack
<XStack gap="$2" alignItems="center" justifyContent="space-between">
  <Text>Left</Text>
  <Text>Right</Text>
</XStack>
```

### Text & Headings

```tsx
import { Text, H1, H2, H3, Paragraph } from "tamagui";

<H1>Title</H1>
<H3>Subtitle</H3>
<Text fontSize="$6" color="$gray10">Body text</Text>
<Paragraph>Long form content...</Paragraph>
```

### Interactive

```tsx
import { Button, Input, ListItem } from "tamagui";

<Button onPress={handlePress}>Submit</Button>
<Button variant="outlined" size="$4">Secondary</Button>

<Input 
  placeholder="Enter text"
  value={value}
  onChangeText={setValue}
/>

<ListItem 
  title="Item Title"
  subTitle="Description"
  iconAfter={ChevronRight}
/>
```

### Groups

```tsx
import { YGroup } from "tamagui";

<YGroup bordered>
  <YGroup.Item>
    <ListItem title="Option 1" />
  </YGroup.Item>
  <YGroup.Item>
    <ListItem title="Option 2" />
  </YGroup.Item>
</YGroup>
```

## Spacing Tokens

```
$1  = 4px
$2  = 8px
$3  = 16px
$4  = 24px
$5  = 32px
$6  = 48px
```

Usage: `padding="$4"`, `gap="$2"`, `margin="$3"`

## Font Size Tokens

```
$1 = 11px
$2 = 12px
$3 = 13px
$4 = 14px
$5 = 16px
$6 = 18px
$7 = 20px
$8 = 24px
```

Usage: `fontSize="$6"`

## Colors

```tsx
// Theme colors
color="$color"           // Primary text
color="$colorFocus"      // Focused state
backgroundColor="$background"
backgroundColor="$backgroundFocus"

// Gray scale
color="$gray10"
color="$gray11"
color="$gray12"

// Named colors
color="red"
color="green"
backgroundColor="$white5"
```

## Styling Props

### Common Props

```tsx
<YStack
  flex={1}
  padding="$4"
  paddingHorizontal="$2"
  paddingVertical="$3"
  margin="$2"
  gap="$3"
  alignItems="center"
  justifyContent="space-between"
  backgroundColor="$background"
  borderRadius="$4"
  borderWidth={1}
  borderColor="$borderColor"
/>
```

### Size Props

```tsx
<Stack
  width="$10"      // Token
  width={100}      // Pixels
  width="100%"     // Percentage
  height="$5"
  minHeight={200}
  maxWidth="$20"
/>
```

## Icons

```tsx
import { ChevronRight, Trash2, Plus } from "@tamagui/lucide-icons";

<Trash2 color="red" size={24} />
<ChevronRight color="$gray10" />
```

## Screen Pattern

```tsx
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, H3, Button } from "tamagui";

const Screen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} padding="$4" gap="$4">
        <H3>Screen Title</H3>
        
        <YStack flex={1}>
          {/* Content */}
        </YStack>
        
        <Button onPress={handleSubmit}>
          Submit
        </Button>
      </YStack>
    </SafeAreaView>
  );
};
```

## List Pattern

```tsx
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={items}
  renderItem={({ item }) => (
    <ListItem title={item.name} />
  )}
  estimatedItemSize={50}
  ItemSeparatorComponent={() => <Separator />}
/>
```

## Platform Notes

- **Discord/WhatsApp**: No markdown tables - use bullet lists
- **React Native**: Use `StyleSheet.create` for complex styles
- Prefer Tamagui tokens over raw values for consistency
