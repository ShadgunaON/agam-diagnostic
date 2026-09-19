import { CMSPage } from '@/domains/cms/models';

export class PageService {
  /**
   * Internal fetch — returns data or throws with the real error message.
   * Never swallows errors silently.
   */
  private async _graphqlFetch<T>(
    query: string,
    variables?: Record<string, unknown>,
    useApiKey = false
  ): Promise<T> {
    const isServer = typeof window === 'undefined';
    const base = isServer
      ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
      : '';
    const url = `${base}/api/graphql`;

    const token = !isServer
      ? (sessionStorage.getItem('cognito_id_token') ||
         localStorage.getItem('cognito_id_token') || '')
      : '';

    const apiKey = process.env.APPSYNC_API_KEY || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (useApiKey && apiKey) {
      headers['x-api-key'] = apiKey;
    } else if (token) {
      headers['Authorization'] = token;
    } else if (apiKey) {
      // Last resort: API key (won't work for admin mutations but at least shows right error)
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`GraphQL proxy HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.errors?.length) {
      const msg = json.errors.map((e: any) => e.message).join('; ');
      console.error('[PageService] AppSync errors:', json.errors);
      throw new Error(msg);
    }

    if (!json.data) {
      throw new Error('AppSync returned empty response (no data, no errors).');
    }

    return json.data as T;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Fetch a CMS page by ID.
   * - If called from the browser (admin), uses the Cognito token so draftContent is returned.
   * - If called server-side (public SSR), uses the API key (draftContent will be stripped by Lambda).
   */
  async getPageById(id: string): Promise<CMSPage | null> {
    try {
      const query = `
        query PageById($id: ID!) {
          pageById(id: $id) {
            id slug title status
            draftContent publishedContent
            draftSeo publishedSeo
            createdAt updatedAt createdBy updatedBy
            publishedAt publishedBy
          }
        }
      `;
      const isServer = typeof window === 'undefined';
      // Server-side (public page SSR): use API key — draftContent stripped by Lambda
      // Client-side (admin editor): use Cognito token — draftContent returned
      const data = await this._graphqlFetch<{ pageById: CMSPage }>(query, { id }, isServer);
      return data?.pageById || null;
    } catch (e) {
      // Read failures are non-fatal — fall back to defaults
      console.error('[PageService] getPageById failed:', e);
      return null;
    }
  }

  /**
   * Save draft content + SEO.
   * Throws on failure — caller must handle and show error to user.
   */
  async updatePage(id: string, content: string, seo?: string): Promise<CMSPage> {
    const query = `
      mutation UpdatePage($id: ID!, $content: String, $seo: String) {
        updatePage(id: $id, content: $content, seo: $seo) {
          id status draftContent draftSeo updatedAt
        }
      }
    `;
    const data = await this._graphqlFetch<{ updatePage: CMSPage }>(query, { id, content, seo });
    if (!data?.updatePage) throw new Error('updatePage returned no data.');
    return data.updatePage;
  }

  /**
   * Promote draft → published.
   * Pass content + seo directly to avoid DynamoDB eventual-consistency race
   * between the preceding updatePage write and the publishPage read.
   * Throws on failure — caller must handle and show error to user.
   */
  async publishPage(id: string, content?: string, seo?: string): Promise<CMSPage> {
    const query = `
      mutation PublishPage($id: ID!, $content: String, $seo: String) {
        publishPage(id: $id, content: $content, seo: $seo) {
          id status draftContent publishedContent draftSeo publishedSeo publishedAt
        }
      }
    `;
    const data = await this._graphqlFetch<{ publishPage: CMSPage }>(query, { id, content, seo });
    if (!data?.publishPage) throw new Error('publishPage returned no data.');
    return data.publishPage;
  }
}

export const pageService = new PageService();
