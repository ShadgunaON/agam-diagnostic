import { IPackagesRepository } from '@/domains/packages/repository';

export class PackageService {
  constructor(private readonly repository: IPackagesRepository) {}

  async getCatalog(page = 1, limit = 10) {
    return this.repository.getCatalog(page, limit);
  }

  async getPackageBySlug(slug: string) {
    return this.repository.getPackageBySlug(slug);
  }

  async getHeroData() {
    return this.repository.getHeroData();
  }

  async getBenefits() {
    return this.repository.getBenefits();
  }

  async getProcessSteps() {
    return this.repository.getProcessSteps();
  }

  async getFeaturedPackages() {
    return this.repository.getFeaturedPackages();
  }

  // Admin CRUD methods
  async getById(id: string) {
    if (this.repository.getById) {
      return this.repository.getById(id);
    }
    throw new Error('Method not implemented in repository');
  }

  async create(packageData: any) {
    if (this.repository.create) {
      return this.repository.create(packageData);
    }
    throw new Error('Method not implemented in repository');
  }

  async update(id: string, packageData: any) {
    if (this.repository.update) {
      return this.repository.update(id, packageData);
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
