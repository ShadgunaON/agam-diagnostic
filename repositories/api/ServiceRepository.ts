import { IServicesRepository } from '@/domains/services/repository';
import { ServiceItem, ServiceDetailData, ServicesHero } from '@/domains/services/model';
import { Result, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';

export class ApiServiceRepository implements IServicesRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getCatalog(_page?: number, _limit?: number): Promise<Result<PaginatedResponse<ServiceItem>>> {
    void _page;
    void _limit;
    return failure(new ServerError('Not implemented'));
  }

  async getServiceBySlug(_slug: string): Promise<Result<ServiceDetailData>> {
    void _slug;
    return failure(new ServerError('Not implemented'));
  }

  async getHeroData(): Promise<Result<ServicesHero>> {
    return failure(new ServerError('Not implemented'));
  }
}
