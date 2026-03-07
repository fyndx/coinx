import { Rejourney } from "@rejourneyco/react-native";

import { env } from "@/src/services/env";

class AnalyticsService {
  init() {
    const publicKey = env.EXPO_PUBLIC_REJOURNEY_PUBLIC_KEY;
    if (!publicKey) {
      console.warn("Analytics: Rejourney public key is missing. Analytics will be disabled.");
      return;
    }
    Rejourney.init(publicKey);
    Rejourney.start();
  }

  setUserIdentity(userId: string) {
    Rejourney.setUserIdentity(userId);
  }

  clearUserIdentity() {
    Rejourney.clearUserIdentity();
  }

  setMetadata(keyOrProperties: string | Record<string, string | number | boolean>, value?: string | number | boolean) {
    if (typeof keyOrProperties === 'object') {
      Rejourney.setMetadata(keyOrProperties);
    } else {
      Rejourney.setMetadata(keyOrProperties, value);
    }
  }

  logEvent(name: string, properties?: Record<string, unknown>) {
    Rejourney.logEvent(name, properties);
  }
}

export const analytics = new AnalyticsService();
