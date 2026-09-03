import { Result } from '../../shared/result';
import { PackageItem, PackageDetailData, PackagesHero, Benefit, ProcessStep, FeaturedPackage } from './model';
import { PaginatedResponse } from '../../lib/api/types';

export interface IPackagesRepository {
  getCatalog(page?: number, limit?: number): Promise<Result<PaginatedResponse<PackageItem>>>;
  getPackageBySlug(slug: string): Promise<Result<PackageDetailData>>;
  getHeroData(): Promise<Result<PackagesHero>>;
  getBenefits(): Promise<Result<Benefit[]>>;
  getProcessSteps(): Promise<Result<ProcessStep[]>>;
  getFeaturedPackages(): Promise<Result<FeaturedPackage[]>>;
  
  // Admin CRUD methods
  getById?(id: string): Promise<Result<PackageItem>>;
  create?(packageData: Omit<PackageItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<PackageItem>>;
  update?(id: string, packageData: Partial<PackageItem>): Promise<Result<PackageItem>>;
  updateStatus?(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'): Promise<Result<void>>;
  delete?(id: string): Promise<Result<void>>;
}
