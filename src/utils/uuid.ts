import * as Crypto from 'expo-crypto';

/**
 * Generate a UUID v4 for local records.
 * Uses crypto.randomUUID() which is available in React Native (Hermes).
 */
export function generateUUID(): string {
  return Crypto.randomUUID();
}
