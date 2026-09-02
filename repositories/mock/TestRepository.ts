import { ITestsRepository } from '@/domains/tests/repository';
import { TestItem, TestsHero, TestCategory, TestDetailData } from '@/domains/tests/model';
import { TestItemDto } from '@/domains/tests/dto';
import { mapTestItemDtoToModel } from '@/domains/tests/mapper';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { testsData, getTestBySlug } from '@/data/tests';

export class MockTestRepository implements ITestsRepository {
  async getCatalog(page = 1, limit = 10): Promise<Result<PaginatedResponse<TestItem>>> {
    const rawData = testsData.catalog;
    
    const dtos: TestItemDto[] = rawData.map((raw, index) => ({
      id: `test-${index}`,
      url_slug: raw.slug,
      name: raw.title,
      category_id: raw.category,
      tag_name: raw.tag,
      summary: raw.description,
    }));

    const models = dtos.map(mapTestItemDtoToModel);

    return success({
      data: models,
      meta: { total: models.length, page, limit, totalPages: Math.ceil(models.length / limit) }
    });
  }

  async getCategories(): Promise<Result<TestCategory[]>> {
    return success(testsData.categories);
  }

  async getHeroData(): Promise<Result<TestsHero>> {
    return success(testsData.hero);
  }

  async getTestBySlug(slug: string): Promise<Result<TestDetailData>> {
    const test = getTestBySlug(slug);
    if (!test) {
      return failure(new Error('Test not found'));
    }
    return success({ ...test, id: `test-${test.slug}` } as TestDetailData);
  }

  async searchTests(query: string): Promise<Result<TestItem[]>> {
    const rawData = testsData.catalog;
    const lowerQuery = query.toLowerCase();
    
    const results = rawData.filter(t => t.title.toLowerCase().includes(lowerQuery));
    const dtos: TestItemDto[] = results.map((raw, index) => ({
      id: `test-${index}`,
      url_slug: raw.slug,
      name: raw.title,
      category_id: raw.category,
      tag_name: raw.tag,
      summary: raw.description,
    }));
    
    return success(dtos.map(mapTestItemDtoToModel));
  }
}
