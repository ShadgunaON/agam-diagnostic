import { StorageAdapter } from './StorageAdapter';

export class LocalStorageAdapter<T> implements StorageAdapter<T> {
  
  constructor(private readonly storageKey: string) {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  load(): T | null {
    if (!this.isBrowser()) return null;
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (!stored) return null;
      return JSON.parse(stored) as T;
    } catch (e) {
      console.error('Failed to load from sessionStorage', e);
      return null;
    }
  }

  save(data: T): void {
    if (!this.isBrowser()) return;
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to sessionStorage', e);
    }
  }

  clear(): void {
    if (!this.isBrowser()) return;
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error('Failed to clear sessionStorage', e);
    }
  }
}

