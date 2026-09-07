import { Result, success, failure } from '@/shared/result';
import { TestItem, TestCategory, TestsHero, TestDetailData } from '@/domains/tests/model';
import { PaginatedResponse } from '@/lib/api/types';

export class TestCatalogService {
  constructor() {}

  private async _graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const isServer = typeof window === 'undefined';
      const token = !isServer
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';
        
      if (isServer) {
        // Direct AppSync fetch for SSR to avoid hairpin routing timeouts
        const apiUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://cihtpsxiibcb5bewwzxibt2l3i.appsync-api.us-east-1.amazonaws.com/graphql';
        const apiKey = process.env.APPSYNC_API_KEY || '';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: token } : apiKey ? { 'x-api-key': apiKey } : {}),
          },
          body: JSON.stringify({ query, variables }),
        });
        if (!response.ok) return null;
        const { data, errors } = await response.json();
        if (errors?.length) throw new Error(errors[0].message);
        return data as T;
      }
      
      const _url = '/api/graphql';
      const response = await fetch(_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
      });
      if (!response.ok) return null;
      const { data, errors } = await response.json();
      if (errors?.length) { 
        console.error('GraphQL errors:', errors); 
        throw new Error(errors[0].message);
      }
      return data as T;
    } catch (err) {
      console.error('GraphQL fetch failed:', err);
      return null;
    }
  }

  async getCatalog(page = 1, limit = 100): Promise<Result<PaginatedResponse<TestItem>>> {
    try {
      const res = await this._graphqlFetch<{ catalogTests: PaginatedResponse<TestItem> }>(
        `query CatalogTests($page: Int, $limit: Int) {
          catalogTests(page: $page, limit: $limit) {
            data {
              id slug title category tag price discountPrice description duration preparation
              homeCollection sampleType fastFasting parametersCount status createdAt updatedAt
            }
            meta { total page limit totalPages }
          }
        }`,
        { page, limit }
      );
      return success(res!.catalogTests);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get test catalog'));
    }
  }

  async getCategories(): Promise<Result<TestCategory[]>> {
    const catalogResult = await this.getCatalog(1, 200);
    if (catalogResult.isFailure) return failure(catalogResult.error);
    const items = catalogResult.value.data;
    const seen = new Set<string>();
    const categories: TestCategory[] = [{ id: 'all', label: 'All Tests' }];
    for (const item of items) {
      if (item.category && !seen.has(item.category)) {
        seen.add(item.category);
        const label = (item as any).categoryLabel || item.category.charAt(0).toUpperCase() + item.category.slice(1);
        categories.push({ id: item.category, label });
      }
    }
    return success(categories);
  }

  async getHeroData(): Promise<Result<TestsHero>> {
    return success({
      title: 'Health Tests',
      description: 'Book reliable blood tests and health checkups. NABL-accredited results with free home collection across Madurai.',
      image: '/images/hero_lab_visual.png',
    });
  }

  async getTestBySlug(slug: string): Promise<Result<TestDetailData>> {
    try {
      const res = await this._graphqlFetch<{ testBySlug: TestDetailData }>(
        `query TestBySlug($slug: String!) {
          testBySlug(slug: $slug) {
            id slug title category tag price discountPrice description duration preparation
            homeCollection sampleType fastFasting parametersCount status createdAt updatedAt
            relatedTests { title category description slug status }
            faqs { question answer }
          }
        }`,
        { slug }
      );
      if (!res?.testBySlug) return failure(new Error('Test not found'));
      return success(res.testBySlug);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get test'));
    }
  }

  async searchTests(query: string): Promise<Result<TestItem[]>> {
    if (!query || !query.trim()) {
      const catalogResult = await this.getCatalog(1, 200);
      return catalogResult.isFailure ? failure(catalogResult.error) : success(catalogResult.value.data);
    }
    try {
      const res = await this._graphqlFetch<{ catalogTests: PaginatedResponse<TestItem> }>(
        `query CatalogTests($q: String!) {
          catalogTests(q: $q, limit: 100) {
            data {
              id slug title category tag price discountPrice description duration preparation
              homeCollection sampleType fastFasting parametersCount status createdAt updatedAt
            }
          }
        }`,
        { q: query }
      );
      return success(res!.catalogTests.data);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to search tests'));
    }
  }

  async getById(id: string): Promise<Result<TestItem>> {
    try {
      const res = await this._graphqlFetch<{ testById: TestItem }>(
        `query TestById($id: ID!) {
          testById(id: $id) {
            id slug title category tag price discountPrice description duration preparation
            homeCollection sampleType fastFasting parametersCount status createdAt updatedAt
            relatedTests { title category description slug status }
            faqs { question answer }
          }
        }`,
        { id }
      );
      if (!res?.testById) return failure(new Error('Test not found'));
      return success(res.testById);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get test'));
    }
  }

  async create(testData: any): Promise<Result<TestItem>> {
    try {
      const res = await this._graphqlFetch<{ createCatalogTest: TestItem }>(
        `mutation CreateCatalogTest($input: AWSJSON!) {
          createCatalogTest(input: $input) { id slug title status }
        }`,
        { input: testData }
      );
      return success(res!.createCatalogTest);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to create test'));
    }
  }

  async update(id: string, testData: any): Promise<Result<TestItem>> {
    try {
      const res = await this._graphqlFetch<{ updateCatalogTest: TestItem }>(
        `mutation UpdateCatalogTest($id: ID!, $input: AWSJSON!) {
          updateCatalogTest(id: $id, input: $input) { id slug title status }
        }`,
        { id, input: testData }
      );
      return success(res!.updateCatalogTest);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to update test'));
    }
  }

  async updateStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'): Promise<Result<void>> {
    try {
      await this._graphqlFetch(
        `mutation UpdateCatalogTestStatus($id: ID!, $status: String!) {
          updateCatalogTestStatus(id: $id, status: $status)
        }`,
        { id, status }
      );
      return success(undefined);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to update status'));
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this._graphqlFetch(
        `mutation DeleteCatalogTest($id: ID!) {
          deleteCatalogTest(id: $id)
        }`,
        { id }
      );
      return success(undefined);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to delete test'));
    }
  }
}
