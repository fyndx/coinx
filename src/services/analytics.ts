import * as Sentry from "@sentry/react-native";

class AnalyticsService {
  init() {
    Sentry.init({
      dsn: "https://65b84b072ecf556794b373fd098a0c79@o365646.ingest.us.sentry.io/4511002627538944",
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
        Sentry.setTag(k, String(v));
      }
    } else {
      Sentry.setTag(keyOrProperties, String(value));
    }
  }

  logEvent(name: string, properties?: Record<string, unknown>) {
    Sentry.addBreadcrumb({ message: name, data: properties, level: "info" });
  }
}

export const analytics = new AnalyticsService();
