---
name: react-native
description: React Native core patterns and best practices. Use when working with native components, styling, performance optimization, or platform-specific code.
---

# React Native

Core patterns and best practices for CoinX.

## Component Patterns

### Functional Components

```tsx
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  onPress?: () => void;
}

export const MyComponent = ({ title, onPress }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
```

### Platform-Specific Code

```tsx
import { Platform } from "react-native";

// Inline
const padding = Platform.OS === "ios" ? 20 : 16;

// Platform.select
const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 4 },
    }),
  },
});
```

## Safe Area

```tsx
import { SafeAreaView } from "react-native-safe-area-context";

const Screen = () => (
  <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
    {/* Content */}
  </SafeAreaView>
);
```

## Lists

### FlashList (Preferred)

```tsx
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  estimatedItemSize={50}
  keyExtractor={(item) => item.id}
/>
```

### FlatList

```tsx
import { FlatList } from "react-native";

<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={(item) => item.id}
  ItemSeparatorComponent={() => <Separator />}
  ListEmptyComponent={<EmptyState />}
/>
```

## Keyboard Handling

```tsx
import { KeyboardAvoidingView, Platform } from "react-native";

<KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  style={{ flex: 1 }}
>
  {/* Form content */}
</KeyboardAvoidingView>
```

## Gestures

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Wrap app root
<GestureHandlerRootView style={{ flex: 1 }}>
  <App />
</GestureHandlerRootView>
```

## Performance Best Practices

### Memoization

```tsx
import { memo, useCallback, useMemo } from "react";

// Memoize components
const Item = memo(({ data, onPress }) => { /* ... */ });

// Memoize callbacks
const handlePress = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize expensive computations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);
```

### Avoid Anonymous Functions in Render

```tsx
// ❌ Bad - creates new function every render
<Button onPress={() => handlePress(item.id)} />

// ✅ Good - stable reference
const onPress = useCallback(() => handlePress(item.id), [item.id]);
<Button onPress={onPress} />
```

### Image Optimization

```tsx
import { Image } from "react-native";

<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  resizeMode="cover"
/>
```

## Navigation (Expo Router)

```tsx
import { useRouter, useLocalSearchParams, Link } from "expo-router";

// Navigate
const router = useRouter();
router.push("/details");
router.push({ pathname: "/details", params: { id: "123" } });
router.back();

// Get params
const { id } = useLocalSearchParams();

// Declarative link
<Link href="/details">Go to Details</Link>
```

## Storage

### MMKV (Fast)

```tsx
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

storage.set("key", "value");
storage.set("number", 42);
storage.set("bool", true);

const value = storage.getString("key");
const num = storage.getNumber("number");
```

### AsyncStorage (Legacy)

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";

await AsyncStorage.setItem("key", JSON.stringify(data));
const data = JSON.parse(await AsyncStorage.getItem("key") || "null");
```

## Debugging Tips

- Use Flipper for network/layout inspection
- `console.log` works but use sparingly
- React DevTools for component inspection
- Check `__DEV__` for dev-only code
