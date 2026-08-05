import { IServicesRepository } from '@/domains/services/repository';

export class ServiceCatalogService {
  constructor(private readonly repository: IServicesRepository) {}

  async getCatalog(page = 1, limit = 10) {
    return this.repository.getCatalog(page, limit);
  }

  async getServiceBySlug(slug: string) {
    return this.repository.getServiceBySlug(slug);
  }

  async getHeroData() {
    return this.repository.getHeroData();
  }
}
