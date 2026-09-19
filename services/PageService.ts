import { env } from '@/config/env';
import { CMSPage } from '@/domains/cms/models';

export class PageService {
  /**
   * Internal fetch — returns data or throws with the real error message.
   *
   * Server-side (SSR): calls AppSync directly with the API key.
   *   This avoids a self-referential HTTP loop through /api/graphql which
   *   requires NEXT_PUBLIC_SITE_URL to be correctly set — unreliable on Amplify.
   *
   * Client-side (browser): calls /api/graphql proxy with the Cognito token
   *   (or API key for public queries) so auth is handled correctly.
   */
  private async _graphqlFetch<T>(
    query: string,
    variables?: Record<string, unknown>,
    useApiKey = false
  ): Promise<T> {
    const isServer = typeof window === 'undefined';

    // ── Auth headers ────────────────────────────────────────────────────────
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Resolved API key — server env var takes priority, then build-time public var, then hardcoded fallback
    const apiKey =
      process.env.APPSYNC_API_KEY ||
      process.env.NEXT_PUBLIC_APPSYNC_API_KEY ||
      'da2-wyfofmw3ffgwrgdo5kyajft5yy'; // fallback from SAM outputs

    if (isServer) {
      // Server-side: always use API key for direct AppSync call
      headers['x-api-key'] = apiKey;
    } else {
      // Client-side: prefer Cognito token, fall back to API key
      const token =
        sessionStorage.getItem('cognito_id_token') ||
        localStorage.getItem('cognito_id_token') ||
        '';

      if (!useApiKey && token) {
        headers['Authorization'] = token;
      } else {
        headers['x-api-key'] = apiKey;
      }
    }

    // ── URL ─────────────────────────────────────────────────────────────────
    const url = isServer
      ? // Direct AppSync call — no proxy, no self-referential loop
        (process.env.NEXT_PUBLIC_GRAPHQL_URL || env.graphqlUrl)
      : '/api/graphql'; // Proxy route (browser)

    // ── Fetch ────────────────────────────────────────────────────────────────
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`GraphQL HTTP ${response.status}: ${response.statusText}`);
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
   * - Server-side (public SSR): direct AppSync call with API key → draftContent stripped by Lambda.
   * - Client-side (admin editor): proxy call with Cognito token → draftContent returned.
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
      // isServer determines auth: server → API key (SSR), browser → Cognito token (admin)
      const isServer = typeof window === 'undefined';
      const data = await this._graphqlFetch<{ pageById: CMSPage }>(query, { id }, isServer);
      return data?.pageById || null;
    } catch (e) {
      // Read failures are non-fatal — fall back to static defaults
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
   * Content + seo are passed directly so the Lambda does not need to re-read
   * from DynamoDB — eliminating the eventual-consistency race condition.
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
