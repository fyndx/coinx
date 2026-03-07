import 'tsx/cjs';
import type { ExpoConfig, ConfigContext } from 'expo/config';

// eslint-disable-next-line perfectionist/sort-imports
import { env } from './src/services/env';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: env.EXPO_PUBLIC_NAME,
  slug: "coinx",
  version: env.EXPO_PUBLIC_VERSION,
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#def5f0"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.EXPO_PUBLIC_BUNDLE_ID,
    infoPlist: {
      UIViewControllerBasedStatusBarAppearance: "YES"
    }
  },
  android: {
    softwareKeyboardLayoutMode: "pan",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#def5f0"
    },
    package: env.EXPO_PUBLIC_PACKAGE
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "15.5"
        }
      }
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#def5f0",
        image: "./assets/splash.png",
        imageWidth: 600
      }
    ],
    [
      "expo-dev-launcher",
      {
        launchMode: "most-recent"
      }
    ],
    "expo-localization",
    "expo-sqlite",
    "expo-updates",
    "expo-secure-store",
    [
      "@sentry/react-native",
      {
        organization: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        dsn: env.EXPO_PUBLIC_SENTRY_DSN
      }
    ]
  ],
  scheme: env.EXPO_PUBLIC_SCHEME,
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "53bbeb96-179b-4605-8e69-a5639caa179f"
    }
  },
  owner: "fyndx",
  runtimeVersion: {
    policy: "appVersion"
  },
  updates: {
    url: "https://u.expo.dev/53bbeb96-179b-4605-8e69-a5639caa179f"
  }
});
