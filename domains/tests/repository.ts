import { Result } from '../../shared/result';
import { TestItem, TestsHero, TestCategory, TestDetailData } from './model';
import { PaginatedResponse } from '../../lib/api/types';

export interface ITestsRepository {
  getCatalog(page?: number, limit?: number): Promise<Result<PaginatedResponse<TestItem>>>;
  getCategories(): Promise<Result<TestCategory[]>>;
  getHeroData(): Promise<Result<TestsHero>>;
  getTestBySlug(slug: string): Promise<Result<TestDetailData>>;
  searchTests(query: string): Promise<Result<TestItem[]>>;
  
  // Admin CRUD methods
  getById?(id: string): Promise<Result<TestItem>>;
  create?(testData: Omit<TestItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<TestItem>>;
  update?(id: string, testData: Partial<TestItem>): Promise<Result<TestItem>>;
  updateStatus?(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'): Promise<Result<void>>;
}
