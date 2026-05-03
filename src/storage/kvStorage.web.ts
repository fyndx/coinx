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
      const val = getStorage()?.getItem(prefix + key) ?? null;
      return val === null ? undefined : val;
    },
    getBoolean(key: string): boolean | undefined {
      const val = getStorage()?.getItem(prefix + key) ?? null;
      if (val === null) return undefined;
      return val === "true";
    },
    set(key: string, value: string | boolean): void {
      getStorage()?.setItem(prefix + key, String(value));
    },
    delete(key: string): void {
      getStorage()?.removeItem(prefix + key);
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
