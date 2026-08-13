import { LocalStorageAdapter } from './LocalStorageAdapter';

export class SharedMockAdapter<T> {
  private localAdapter: LocalStorageAdapter<T>;

  constructor(private readonly storageKey: string) {
    this.localAdapter = new LocalStorageAdapter<T>(storageKey);
  }

  async load(): Promise<T | null> {
    return this.localAdapter.load();
  }

  async save(data: T): Promise<void> {
    this.localAdapter.save(data);
  }

  async clear(): Promise<void> {
    this.localAdapter.clear();
  }
}
