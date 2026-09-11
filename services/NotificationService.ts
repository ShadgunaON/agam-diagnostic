

export class NotificationService {
  constructor() {}

  // ---------------------------------------------------------------------------
  // Shared GraphQL fetch helper
  // ---------------------------------------------------------------------------
  private async _graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const token = typeof window !== 'undefined'
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';
      const _url = typeof window === 'undefined' ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api/graphql' : '/api/graphql';
      const response = await fetch(_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }), cache: 'no-store',
      });
      if (!response.ok) return null;
      const { data, errors } = await response.json();
      if (errors?.length) { console.error('GraphQL errors:', errors); return null; }
      return data as T;
    } catch (err) {
      console.error('GraphQL fetch failed:', err);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // GraphQL-backed notification feed
  // ---------------------------------------------------------------------------
  async getMyNotificationsGql(): Promise<{ isSuccess: boolean; value: any[] }> {
    const data = await this._graphqlFetch<{ myNotifications: any[] }>(
      `query MyNotifications {
        myNotifications {
          id userId title message isRead link createdAt
        }
      }`
    );
    return {
      isSuccess: !!data?.myNotifications,
      value: data?.myNotifications ?? [],
    };
  }

  // ---------------------------------------------------------------------------
  // GraphQL-backed mark-as-read mutation
  // ---------------------------------------------------------------------------
  async markAsReadGql(id: string): Promise<{ isSuccess: boolean }> {
    const data = await this._graphqlFetch<{ markNotificationRead: boolean }>(
      `mutation MarkNotificationRead($id: ID!) {
        markNotificationRead(id: $id)
      }`,
      { id }
    );
    return { isSuccess: data?.markNotificationRead === true };
  }
}
