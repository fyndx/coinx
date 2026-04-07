export interface IKVStorage {
  getString(key: string): string | undefined;
  getBoolean(key: string): boolean | undefined;
  set(key: string, value: string | boolean): void;
  delete(key: string): void;
  getAllKeys(): string[];
}

export function createKVStorage(id: string): IKVStorage {
  const prefix = `${id}:`;

  return {
    getString(key: string): string | undefined {
      const val = localStorage.getItem(prefix + key);
      return val === null ? undefined : val;
    },
    getBoolean(key: string): boolean | undefined {
      const val = localStorage.getItem(prefix + key);
      if (val === null) return undefined;
      return val === "true";
    },
    set(key: string, value: string | boolean): void {
      localStorage.setItem(prefix + key, String(value));
    },
    delete(key: string): void {
      localStorage.removeItem(prefix + key);
    },
    getAllKeys(): string[] {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(prefix)) {
          keys.push(k.slice(prefix.length));
        }
      }
      return keys;
    },
  };
}
