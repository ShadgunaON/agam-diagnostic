import { StorageAdapter } from './StorageAdapter';

export class LocalStorageAdapter<T> implements StorageAdapter<T> {
  
  constructor(private readonly storageKey: string) {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  load(): T | null {
    if (!this.isBrowser()) return null;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;
      return JSON.parse(stored) as T;
    } catch (e) {
      console.error('Failed to load from localStorage', e);
      return null;
    }
  }

  save(data: T): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  clear(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error('Failed to clear localStorage', e);
    }
  }
}

