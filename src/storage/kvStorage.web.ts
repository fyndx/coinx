export interface IKVStorage {
  getString(key: string): string | undefined;
  getBoolean(key: string): boolean | undefined;
  set(key: string, value: string | boolean): void;
  delete(key: string): void;
  getAllKeys(): string[];
}

// Safe accessor — returns undefined/no-ops when localStorage is not available
// (e.g. during SSR or Metro server-side rendering on web).
function getStorage(): Storage | null {
  if (typeof localStorage !== "undefined") {
    return localStorage;
  }
  return null;
}

export function createKVStorage(id: string): IKVStorage {
  const prefix = `${id}:`;

  return {
    getString(key: string): string | undefined {
      const storage = getStorage();
      if (!storage) return undefined;
      try {
        const val = storage.getItem(prefix + key);
        return val === null ? undefined : val;
      } catch {
        return undefined;
      }
    },
    getBoolean(key: string): boolean | undefined {
      const storage = getStorage();
      if (!storage) return undefined;
      try {
        const val = storage.getItem(prefix + key);
        if (val === null) return undefined;
        if (val === "true") return true;
        if (val === "false") return false;
        return undefined;
      } catch {
        return undefined;
      }
    },
    set(key: string, value: string | boolean): void {
      const storage = getStorage();
      if (!storage) return;
      try {
        storage.setItem(prefix + key, String(value));
      } catch {
        // No-op
      }
    },
    delete(key: string): void {
      const storage = getStorage();
      if (!storage) return;
      try {
        storage.removeItem(prefix + key);
      } catch {
        // No-op
      }
    },
    getAllKeys(): string[] {
      const storage = getStorage();
      if (!storage) return [];
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k?.startsWith(prefix)) {
          keys.push(k.slice(prefix.length));
        }
      }
      return keys;
    },
  };
}
