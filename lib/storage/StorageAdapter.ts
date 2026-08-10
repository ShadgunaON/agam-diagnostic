export interface StorageAdapter<T> {
  load(): T | null;
  save(data: T): void;
  clear(): void;
}
