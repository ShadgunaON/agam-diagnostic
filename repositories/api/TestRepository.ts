import { ITestsRepository } from '@/domains/tests/repository';
import { TestItem, TestsHero, TestCategory, TestDetailData } from '@/domains/tests/model';
import { Result, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';

export class ApiTestRepository implements ITestsRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getCatalog(_page?: number, _limit?: number): Promise<Result<PaginatedResponse<TestItem>>> {
    void _page;
    void _limit;
    return failure(new ServerError('Not implemented'));
  }

  async getCategories(): Promise<Result<TestCategory[]>> {
    return failure(new ServerError('Not implemented'));
  }

  async getHeroData(): Promise<Result<TestsHero>> {
    return failure(new ServerError('Not implemented'));
  }

  async getTestBySlug(slug: string): Promise<Result<TestDetailData>> {
    void slug;
    return failure(new ServerError('Not implemented'));
  }

  async searchTests(query: string): Promise<Result<TestItem[]>> {
    void query;
    return failure(new ServerError('Not implemented'));
  }
}
