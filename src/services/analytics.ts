import * as Sentry from "@sentry/react-native";

class AnalyticsService {
  init() {
    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      sendDefaultPii: false,
    });
  }

  setUserIdentity(userId: string) {
    Sentry.setUser({ id: userId });
  }

  clearUserIdentity() {
    Sentry.setUser(null);
  }

  setMetadata(
    keyOrProperties: string | Record<string, string | number | boolean>,
    value?: string | number | boolean,
  ) {
    if (typeof keyOrProperties === "object") {
      for (const [k, v] of Object.entries(keyOrProperties)) {
        if (v !== undefined) {
          Sentry.setTag(k, String(v));
        }
      }
    } else {
      if (value !== undefined) {
        Sentry.setTag(keyOrProperties, String(value));
      }
    }
  }

  logEvent(name: string, properties?: Record<string, unknown>) {
    Sentry.withScope((scope) => {
      if (properties) {
        scope.setExtras(properties);
      }
      Sentry.captureMessage(name, "info");
    });
  }
}

export const analytics = new AnalyticsService();
