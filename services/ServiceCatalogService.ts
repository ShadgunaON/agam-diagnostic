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

  // Admin CRUD methods
  async getById(id: string) {
    if (this.repository.getById) {
      return this.repository.getById(id);
    }
    throw new Error('Method not implemented in repository');
  }

  async create(serviceData: any) {
    if (this.repository.create) {
      return this.repository.create(serviceData);
    }
    throw new Error('Method not implemented in repository');
  }

  async update(id: string, serviceData: any) {
    if (this.repository.update) {
      return this.repository.update(id, serviceData);
    }
    throw new Error('Method not implemented in repository');
  }

  async updateStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE') {
    if (this.repository.updateStatus) {
      return this.repository.updateStatus(id, status);
    }
    throw new Error('Method not implemented in repository');
  }
}
