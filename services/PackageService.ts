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
}
