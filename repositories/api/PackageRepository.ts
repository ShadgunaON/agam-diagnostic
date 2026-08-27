import { IPackagesRepository } from '@/domains/packages/repository';
import { PackageItem, PackageDetailData, PackagesHero, PackageBenefit, PackageProcessStep } from '@/domains/packages/model';
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

  async getFeaturedPackages(): Promise<Result<PackageItem[]>> {
    const res = await toResult(this.apiClient.get<PackageItem[]>(`/api/packages/featured`));
    if (res.isSuccess) {
      return success(res.value || []);
    }
    return failure(res.error);
  }

  async getHeroData(): Promise<Result<PackagesHero>> {
    return success({
      title: 'Comprehensive Health Packages',
      description: 'Proactive health monitoring with our carefully designed full-body checkups and specialized wellness packages.',
      image: '/images/hero_packages_visual.png',
    });
  }

  async getBenefits(): Promise<Result<PackageBenefit[]>> {
    const res = await toResult(this.apiClient.get<PackageBenefit[]>(`/api/packages/benefits`));
    if (res.isSuccess) {
      return success(res.value || []);
    }
    return failure(res.error);
  }

  async getProcessSteps(): Promise<Result<PackageProcessStep[]>> {
    const res = await toResult(this.apiClient.get<PackageProcessStep[]>(`/api/packages/process`));
    if (res.isSuccess) {
      return success(res.value || []);
    }
    return failure(res.error);
  }

  async getPackageBySlug(slug: string): Promise<Result<PackageDetailData>> {
    return toResult(
      this.apiClient.get<PackageDetailData>(
        `/api/packages/${encodeURIComponent(slug)}`
      )
    );
  }
}
