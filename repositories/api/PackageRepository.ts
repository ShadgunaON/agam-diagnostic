import { IPackagesRepository } from '@/domains/packages/repository';
import { PackageItem, PackageDetailData, PackagesHero, Benefit, ProcessStep, FeaturedPackage } from '@/domains/packages/model';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';

export class ApiPackageRepository implements IPackagesRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getCatalog(page = 1, limit = 100): Promise<Result<PaginatedResponse<PackageItem>>> {
    return toResult(
      this.apiClient.get<PaginatedResponse<PackageItem>>(
        `/api/packages?page=${page}&limit=${limit}`
      )
    );
  }

  async getFeaturedPackages(): Promise<Result<FeaturedPackage[]>> {
    const res = await toResult(this.apiClient.get<any>(`/api/packages/featured`));
    if (res.isSuccess) {
      const arr = Array.isArray(res.value) ? res.value : (res.value?.data || []);
      return success(Array.isArray(arr) ? arr : []);
    }
    return failure(res.error);
  }

  async getHeroData(): Promise<Result<PackagesHero>> {
    return success({
      title: 'Comprehensive Health Packages',
      description: 'Proactive health monitoring with our carefully designed full-body checkups and specialized wellness packages.',
      image: '/images/lifestyle_hero.png',
      pill: 'Preventive Healthcare'
    });
  }

  async getBenefits(): Promise<Result<Benefit[]>> {
    const res = await toResult(this.apiClient.get<any>(`/api/packages/benefits`));
    if (res.isSuccess) {
      const arr = Array.isArray(res.value) ? res.value : (res.value?.data || []);
      return success(Array.isArray(arr) ? arr : []);
    }
    return failure(res.error);
  }

  async getProcessSteps(): Promise<Result<ProcessStep[]>> {
    const res = await toResult(this.apiClient.get<any>(`/api/packages/process`));
    if (res.isSuccess) {
      const arr = Array.isArray(res.value) ? res.value : (res.value?.data || []);
      return success(Array.isArray(arr) ? arr : []);
    }
    return failure(res.error);
  }

  async getPackageBySlug(slug: string): Promise<Result<PackageDetailData>> {
    const res = await toResult(this.apiClient.get<any>(`/api/packages/${encodeURIComponent(slug)}`));
    if (res.isFailure) return failure(res.error);
    
    // Fill in missing details since DynamoDB only contains basic catalog info right now
    const enriched: PackageDetailData = {
      ...res.value,
      includes: res.value.includes || ["Comprehensive testing parameters"],
      whoShouldGet: res.value.whoShouldGet || "Anyone looking for a comprehensive health checkup.",
      preparation: res.value.preparation || "Fasting for 9-12 hours is recommended.",
      relatedPackages: res.value.relatedPackages || [],
      highlights: res.value.highlights || ["Reports in 12-24 hrs", "Free Home Collection", "NABL Accredited"],
      includedTests: res.value.includedTests || []
    };
    
    return success(enriched);
  }

  // Admin CRUD methods
  async getById(id: string): Promise<Result<PackageItem>> {
    return toResult(
      this.apiClient.get<PackageItem>(`/api/packages/${encodeURIComponent(id)}`)
    );
  }

  async create(packageData: Omit<PackageItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<PackageItem>> {
    return toResult(
      this.apiClient.post<PackageItem>('/api/packages', packageData)
    );
  }

  async update(id: string, packageData: Partial<PackageItem>): Promise<Result<PackageItem>> {
    return toResult(
      this.apiClient.put<PackageItem>(`/api/packages/${encodeURIComponent(id)}`, packageData)
    );
  }

  async updateStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'): Promise<Result<void>> {
    return toResult(
      this.apiClient.patch<void>(`/api/packages/${encodeURIComponent(id)}/status`, { status })
    );
  }
}
