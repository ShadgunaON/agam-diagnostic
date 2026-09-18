import { CMSPage } from '@/domains/cms/models';

/**
 * PageService — CMS page persistence via AppSync.
 *
 * Follows the same pattern as BookingService, BlogService, etc.:
 *  - Server-side: uses NEXT_PUBLIC_SITE_URL + '/api/graphql'
 *  - Client-side: uses '/api/graphql' (relative, same origin)
 *
 * The /api/graphql route proxies to AppSync, which routes to the Lambda
 * handler that reads/writes DynamoDB.
 *
 * Auth:
 *  - pageById (public query): uses API key (@aws_api_key on schema)
 *  - updatePage / publishPage (admin mutations): uses Cognito id_token
 */
export class PageService {
  private async _graphqlFetch<T>(
    query: string,
    variables?: Record<string, unknown>,
    useApiKey = false
  ): Promise<T | null> {
    try {
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
        headers['x-api-key'] = apiKey;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const { data, errors } = await response.json();
      if (errors?.length) {
        console.error('[PageService] GraphQL errors:', errors);
        throw new Error(errors.map((e: any) => e.message).join('; '));
      }
      return data as T;
    } catch (e) {
      console.error('[PageService] _graphqlFetch error:', e);
      return null;
    }
  }

  /**
   * Fetch a CMS page by ID.
   * Public query — uses API key so it works without auth on public pages.
   */
  async getPageById(id: string): Promise<CMSPage | null> {
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
    const data = await this._graphqlFetch<{ pageById: CMSPage }>(
      query,
      { id },
      true /* useApiKey */
    );
    return data?.pageById || null;
  }

  /**
   * Save draft content + SEO (admin mutation).
   * Requires Cognito auth token.
   */
  async updatePage(id: string, content: string, seo?: string): Promise<CMSPage | null> {
    const query = `
      mutation UpdatePage($id: ID!, $content: String, $seo: String) {
        updatePage(id: $id, content: $content, seo: $seo) {
          id status draftContent draftSeo updatedAt
        }
      }
    `;
    const data = await this._graphqlFetch<{ updatePage: CMSPage }>(query, { id, content, seo });
    return data?.updatePage || null;
  }

  /**
   * Promote draft → published (admin mutation).
   * Requires Cognito auth token.
   */
  async publishPage(id: string): Promise<CMSPage | null> {
    const query = `
      mutation PublishPage($id: ID!) {
        publishPage(id: $id) {
          id status publishedContent publishedSeo publishedAt
        }
      }
    `;
    const data = await this._graphqlFetch<{ publishPage: CMSPage }>(query, { id });
    return data?.publishPage || null;
  }
}

export const pageService = new PageService();
