import { Result } from '../../shared/result';
import { TestItem, TestsHero, TestCategory } from './model';
import { PaginatedResponse } from '../../lib/api/types';

export interface ITestsRepository {
  getCatalog(page?: number, limit?: number): Promise<Result<PaginatedResponse<TestItem>>>;
  getCategories(): Promise<Result<TestCategory[]>>;
  getHeroData(): Promise<Result<TestsHero>>;
}
