import { Platform } from "react-native";

class AnalyticsService {
  private get sentry() {
    if (Platform.OS === "web") return null;
    // Lazy require so the module isn't loaded on web at bundle time
    return require("@sentry/react-native") as typeof import("@sentry/react-native");
  }

  init() {
    this.sentry?.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      sendDefaultPii: false,
    });
  }

  setUserIdentity(userId: string) {
    this.sentry?.setUser({ id: userId });
  }

  clearUserIdentity() {
    this.sentry?.setUser(null);
  }

  setMetadata(
    keyOrProperties: string | Record<string, string | number | boolean>,
    value?: string | number | boolean,
  ) {
    const sentry = this.sentry;
    if (!sentry) return;
    if (typeof keyOrProperties === "object") {
      for (const [k, v] of Object.entries(keyOrProperties)) {
        if (v !== undefined) {
          sentry.setTag(k, String(v));
        }
      }
    } else {
      if (value !== undefined) {
        sentry.setTag(keyOrProperties, String(value));
      }
    }
  }

  logEvent(name: string, properties?: Record<string, unknown>) {
    this.sentry?.withScope((scope) => {
      if (properties) {
        scope.setExtras(properties);
      }
      this.sentry?.captureMessage(name, "info");
    });
  }
}

export const analytics = new AnalyticsService();
