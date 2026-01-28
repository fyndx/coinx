---
name: expo
description: Expo SDK for React Native development. Use when working with Expo APIs like file system, linking, constants, localization, or other Expo modules.
---

# Expo

Expo SDK modules used in CoinX.

## File System

```typescript
import * as FileSystem from "expo-file-system";

// App directories
const docDir = FileSystem.documentDirectory;      // Persistent
const cacheDir = FileSystem.cacheDirectory;       // Temporary

// Read file
const content = await FileSystem.readAsStringAsync(uri);

// Write file
await FileSystem.writeAsStringAsync(uri, content);

// Check if exists
const info = await FileSystem.getInfoAsync(uri);
if (info.exists) { /* ... */ }

// Delete
await FileSystem.deleteAsync(uri);

// Copy
await FileSystem.copyAsync({ from: srcUri, to: destUri });
```

## Sharing

```typescript
import * as Sharing from "expo-sharing";

// Check availability
const available = await Sharing.isAvailableAsync();

// Share file
await Sharing.shareAsync(fileUri, {
  mimeType: "text/csv",
  dialogTitle: "Export Data",
});
```

## Linking

```typescript
import * as Linking from "expo-linking";

// Open URL
await Linking.openURL("https://example.com");

// Open settings
await Linking.openSettings();

// Create app URL
const url = Linking.createURL("path", { queryParams: { id: "123" } });
```

## Constants

```typescript
import Constants from "expo-constants";

const appVersion = Constants.expoConfig?.version;
const appName = Constants.expoConfig?.name;
const isDevice = Constants.isDevice;
```

## Localization

```typescript
import { getLocales, getCalendars } from "expo-localization";

const locales = getLocales();
const locale = locales[0];
// { languageCode: "en", regionCode: "US", ... }

const calendars = getCalendars();
```

## Crypto

```typescript
import * as Crypto from "expo-crypto";

// Random UUID
const uuid = Crypto.randomUUID();

// Hash
const hash = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  "data"
);
```

## Splash Screen

```typescript
import * as SplashScreen from "expo-splash-screen";

// Prevent auto-hide
SplashScreen.preventAutoHideAsync();

// Hide when ready
await SplashScreen.hideAsync();
```

## Status Bar

```typescript
import { StatusBar } from "expo-status-bar";

<StatusBar style="dark" />  // dark icons
<StatusBar style="light" /> // light icons
<StatusBar style="auto" />  // based on theme
```

## App Lifecycle

```typescript
import { AppState } from "react-native";
import { useEffect } from "react";

useEffect(() => {
  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      // App came to foreground
    }
  });
  return () => sub.remove();
}, []);
```

## Environment

```typescript
// Check dev mode
if (__DEV__) {
  console.log("Development mode");
}

// Expo config values
import Constants from "expo-constants";
const extra = Constants.expoConfig?.extra;
```
