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

  // Admin CRUD methods
  async getById(id: string) {
    if (this.repository.getById) {
      return this.repository.getById(id);
    }
    throw new Error('Method not implemented in repository');
  }

  async create(testData: any) {
    if (this.repository.create) {
      return this.repository.create(testData);
    }
    throw new Error('Method not implemented in repository');
  }

  async update(id: string, testData: any) {
    if (this.repository.update) {
      return this.repository.update(id, testData);
    }
    throw new Error('Method not implemented in repository');
  }

  async updateStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE') {
    if (this.repository.updateStatus) {
      return this.repository.updateStatus(id, status);
    }
    throw new Error('Method not implemented in repository');
  }

  async delete(id: string) {
    if (this.repository.delete) {
      return this.repository.delete(id);
    }
    throw new Error('Method not implemented in repository');
  }
}
