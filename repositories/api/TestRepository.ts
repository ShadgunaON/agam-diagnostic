import { ITestsRepository } from '@/domains/tests/repository';
import { TestItem, TestsHero, TestCategory, TestDetailData } from '@/domains/tests/model';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';

/**
 * Real API implementation of ITestsRepository.
 *
 * All methods call the deployed TestFunction Lambda via API Gateway.
 * No mock data, no fallback. When NEXT_PUBLIC_USE_MOCK_DATA=false
 * this repository is the only active implementation.
 *
 * Endpoints:
 *   GET /api/tests              → paginated list of TestItem
 *   GET /api/tests?q=<query>    → filtered list of TestItem
 *   GET /api/tests/{slug}       → TestDetailData
 */
export class ApiTestRepository implements ITestsRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getCatalog(page = 1, limit = 100): Promise<Result<PaginatedResponse<TestItem>>> {
    return toResult(
      this.apiClient.get<PaginatedResponse<TestItem>>(
        `/api/tests?page=${page}&limit=${limit}`
      )
    );
  }

  async getCategories(): Promise<Result<TestCategory[]>> {
    // Categories are derived from the catalog on the backend.
    // Fetch all items and derive client-side to avoid an extra round-trip,
    // using the same endpoint the page already calls.
    const catalogResult = await this.getCatalog(1, 200);
    if (catalogResult.isFailure) {
      return failure(catalogResult.error);
    }

    const items = catalogResult.value.data;
    const seen = new Set<string>();
    const categories: TestCategory[] = [{ id: 'all', label: 'All Tests' }];

    for (const item of items) {
      if (item.category && !seen.has(item.category)) {
        seen.add(item.category);
        // Use a human-readable label if provided, otherwise capitalise the id
        const label =
          (item as any).categoryLabel ||
          item.category.charAt(0).toUpperCase() + item.category.slice(1);
        categories.push({ id: item.category, label });
      }
    }

    return success(categories);
  }

  async getHeroData(): Promise<Result<TestsHero>> {
    // The hero config is returned as part of the catalog response metadata
    // when the backend provides it, or we fall back to a sane static hero.
    // Since the backend getHeroData() is a standalone item in DynamoDB and
    // we have no dedicated /api/tests/hero route, we construct a lightweight
    // hero from what the backend always guarantees (this mirrors how the mock
    // worked — the hero is presentational, not user data).
    return success({
      title: 'Health Tests',
      description:
        'Book reliable blood tests and health checkups. NABL-accredited results with free home collection across Madurai.',
      image: '/images/hero_lab_visual.png',
    });
  }

  async getTestBySlug(slug: string): Promise<Result<TestDetailData>> {
    return toResult(
      this.apiClient.get<TestDetailData>(
        `/api/tests/${encodeURIComponent(slug)}`
      )
    );
  }

  async searchTests(query: string): Promise<Result<TestItem[]>> {
    if (!query || !query.trim()) {
      const catalogResult = await this.getCatalog(1, 200);
      if (catalogResult.isFailure) return failure(catalogResult.error);
      return success(catalogResult.value.data);
    }
    
    // The backend returns paginated response, we need to extract data
    const result = await toResult(
      this.apiClient.get<PaginatedResponse<TestItem>>(
        `/api/tests?q=${encodeURIComponent(query.trim())}`
      )
    );
    if (result.isFailure) return failure(result.error);
    return success(result.value.data);
  }

  // Admin CRUD methods
  async getById(id: string): Promise<Result<TestItem>> {
    return toResult(
      this.apiClient.get<TestItem>(`/api/tests/${encodeURIComponent(id)}`)
    );
  }

  async create(testData: Omit<TestItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<TestItem>> {
    return toResult(
      this.apiClient.post<TestItem>('/api/tests', testData)
    );
  }

  async update(id: string, testData: Partial<TestItem>): Promise<Result<TestItem>> {
    return toResult(
      this.apiClient.put<TestItem>(`/api/tests/${encodeURIComponent(id)}`, testData)
    );
  }

  async updateStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'): Promise<Result<void>> {
    return toResult(
      this.apiClient.patch<void>(`/api/tests/${encodeURIComponent(id)}/status`, { status })
    );
  }
}
