export class SharedMockAdapter<T> {
  constructor(private readonly storageKey: string) {}

  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return '';
    }
    // If running on server side, fallback to localhost
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }

  async load(): Promise<T | null> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/mock-store?key=${this.storageKey}`, { cache: 'no-store' });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data as T | null;
    } catch (e) {
      console.error('SharedMockAdapter load error', e);
      return null;
    }
  }

  async save(data: T): Promise<void> {
    try {
      await fetch(`${this.getBaseUrl()}/api/mock-store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: this.storageKey, data })
      });
    } catch (e) {
      console.error('SharedMockAdapter save error', e);
    }
  }

  async clear(): Promise<void> {
    try {
      await fetch(`${this.getBaseUrl()}/api/mock-store?key=${this.storageKey}`, { method: 'DELETE' });
    } catch (e) {
      console.error('SharedMockAdapter clear error', e);
    }
  }
}
