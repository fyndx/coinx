---
name: expo-router
description: Expo Router for file-based navigation. Use when creating screens, handling navigation, passing params, or setting up layouts.
---

# Expo Router

File-based routing for CoinX.

## File Structure

```
app/
├── _layout.tsx          # Root layout
├── index.tsx            # Home screen (/)
├── (tabs)/              # Tab group
│   ├── _layout.tsx      # Tab layout
│   ├── index.tsx        # First tab
│   └── settings.tsx     # /settings
├── [id].tsx             # Dynamic route (/123)
├── details/
│   └── index.tsx        # /details
└── modal.tsx            # Modal screen
```

## Layouts

### Root Layout

```tsx
// app/_layout.tsx
import { Stack } from "expo-router/stack";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="modal" 
        options={{ presentation: "modal" }} 
      />
    </Stack>
  );
}
```

### Tab Layout

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Home, Settings } from "@tamagui/lucide-icons";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings color={color} />,
        }}
      />
    </Tabs>
  );
}
```

## Navigation

### Imperative

```tsx
import { useRouter } from "expo-router";

const router = useRouter();

// Push new screen
router.push("/details");

// With params
router.push({
  pathname: "/details/[id]",
  params: { id: "123" },
});

// Replace current screen
router.replace("/home");

// Go back
router.back();

// Go to root
router.dismissAll();
```

### Declarative

```tsx
import { Link } from "expo-router";

<Link href="/details">Go to Details</Link>

<Link 
  href={{
    pathname: "/details/[id]",
    params: { id: "123" },
  }}
  asChild
>
  <Button>View Details</Button>
</Link>
```

## Route Parameters

### Dynamic Routes

```tsx
// app/details/[id].tsx
import { useLocalSearchParams } from "expo-router";

export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>Item: {id}</Text>;
}
```

### Query Params

```tsx
// Navigate with params
router.push({
  pathname: "/search",
  params: { query: "test", page: "1" },
});

// Read params
const { query, page } = useLocalSearchParams();
```

## Screen Options

### Static Options

```tsx
export default function Screen() {
  return <View />;
}

// Export options
export const unstable_settings = {
  initialRouteName: "index",
};
```

### Dynamic Options

```tsx
import { Stack } from "expo-router";

export default function Screen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Custom Title",
          headerRight: () => <Button />,
        }} 
      />
      <View />
    </>
  );
}
```

## Modal Screens

```tsx
// app/_layout.tsx
<Stack.Screen
  name="modal"
  options={{
    presentation: "modal",
    headerShown: false,
  }}
/>

// Navigate to modal
router.push("/modal");

// Close modal
router.back();
// or
router.dismiss();
```

## Protected Routes

```tsx
// app/_layout.tsx
import { Redirect } from "expo-router";

export default function Layout() {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }
  
  return <Stack />;
}
```

## Focus Effects

```tsx
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

useFocusEffect(
  useCallback(() => {
    // Runs when screen is focused
    loadData();
    
    return () => {
      // Cleanup when unfocused
    };
  }, [])
);
```
