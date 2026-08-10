import { ITestsRepository } from '@/domains/tests/repository';

export class TestCatalogService {
  constructor(private readonly repository: ITestsRepository) {}

  async getCatalog(page = 1, limit = 10) {
    return this.repository.getCatalog(page, limit);
  }

  async getCategories() {
    return this.repository.getCategories();
  }

  async getHeroData() {
    return this.repository.getHeroData();
  }

  async getTestBySlug(slug: string) {
    return this.repository.getTestBySlug(slug);
  }

  async searchTests(query: string) {
    return this.repository.searchTests(query);
  }
}
