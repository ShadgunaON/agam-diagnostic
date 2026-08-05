import { IPackagesRepository } from '@/domains/packages/repository';
import { PackageItem, PackageDetailData, PackagesHero, Benefit, ProcessStep, FeaturedPackage } from '@/domains/packages/model';
import { Result, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';

export class ApiPackageRepository implements IPackagesRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getCatalog(_page?: number, _limit?: number): Promise<Result<PaginatedResponse<PackageItem>>> {
    void _page;
    void _limit;
    return failure(new ServerError('Not implemented'));
  }

  async getPackageBySlug(_slug: string): Promise<Result<PackageDetailData>> {
    void _slug;
    return failure(new ServerError('Not implemented'));
  }

  async getHeroData(): Promise<Result<PackagesHero>> {
    return failure(new ServerError('Not implemented'));
  }

  async getBenefits(): Promise<Result<Benefit[]>> {
    return failure(new ServerError('Not implemented'));
  }

  async getProcessSteps(): Promise<Result<ProcessStep[]>> {
    return failure(new Error('Method not implemented in API mode.'));
  }

  async getFeaturedPackages(): Promise<Result<FeaturedPackage[]>> {
    return failure(new Error('Method not implemented in API mode.'));
  }
}
