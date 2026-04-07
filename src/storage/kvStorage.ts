import { MMKV } from "react-native-mmkv";

export interface IKVStorage {
  getString(key: string): string | undefined;
  getBoolean(key: string): boolean | undefined;
  set(key: string, value: string | boolean): void;
  delete(key: string): void;
  getAllKeys(): string[];
}

export function createKVStorage(id: string): IKVStorage {
  return new MMKV({ id });
}
