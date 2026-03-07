import { Rejourney } from "@rejourneyco/react-native";

import { env } from "@/src/services/env";

class AnalyticsService {
  init() {
    try {
      const publicKey = env.EXPO_PUBLIC_REJOURNEY_PUBLIC_KEY;
      if (!publicKey) {
        console.warn("Analytics: Rejourney public key is missing. Analytics will be disabled.");
        return;
      }
      Rejourney.init(publicKey);
      Rejourney.start();
    } catch (e) {
      console.warn("Analytics: Failed to initialize Rejourney", e);
    }
  }

  setUserIdentity(userId: string) {
    try {
      Rejourney.setUserIdentity(userId);
    } catch (e) {
      console.warn("Analytics: Failed to set user identity", e);
    }
  }

  clearUserIdentity() {
    try {
      Rejourney.clearUserIdentity();
    } catch (e) {
      console.warn("Analytics: Failed to clear user identity", e);
    }
  }

  setMetadata(keyOrProperties: string | Record<string, string | number | boolean>, value?: string | number | boolean) {
    try {
      if (typeof keyOrProperties === "object") {
        Rejourney.setMetadata(keyOrProperties);
      } else {
        Rejourney.setMetadata(keyOrProperties, value);
      }
    } catch (e) {
      console.warn("Analytics: Failed to set metadata", e);
    }
  }

  logEvent(name: string, properties?: Record<string, unknown>) {
    try {
      Rejourney.logEvent(name, properties);
    } catch (e) {
      console.warn("Analytics: Failed to log event", e);
    }
  }
}

export const analytics = new AnalyticsService();
