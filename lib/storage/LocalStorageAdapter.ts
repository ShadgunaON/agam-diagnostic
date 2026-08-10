import { StorageAdapter } from './StorageAdapter';

export class LocalStorageAdapter<T> implements StorageAdapter<T> {
  constructor(private readonly storageKey: string) {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  load(): T | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      const storedData = localStorage.getItem(this.storageKey);
      if (!storedData) {
        return null;
      }
      const parsedData = JSON.parse(storedData) as T;
      return parsedData;
    } catch (error) {
      console.error(`Failed to load data from localStorage for key "${this.storageKey}":`, error);
      return null;
    }
  }

  save(data: T): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save data to localStorage for key "${this.storageKey}":`, error);
    }
  }

  clear(): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error(`Failed to clear localStorage for key "${this.storageKey}":`, error);
    }
  }
}
