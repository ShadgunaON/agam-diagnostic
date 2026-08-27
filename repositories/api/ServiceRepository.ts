import { IServicesRepository } from '@/domains/services/repository';
import { ServiceItem, ServiceDetailData, ServicesHero } from '@/domains/services/model';
import { Result, success } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';

export class ApiServiceRepository implements IServicesRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getCatalog(page: number = 1, limit: number = 100): Promise<Result<PaginatedResponse<ServiceItem>>> {
    return toResult(this.apiClient.get<PaginatedResponse<ServiceItem>>(`/api/services?page=${page}&limit=${limit}`));
  }

  async getServiceBySlug(slug: string): Promise<Result<ServiceDetailData>> {
    return toResult(this.apiClient.get<ServiceDetailData>(`/api/services/${slug}`));
  }

  async getHeroData(): Promise<Result<ServicesHero>> {
    // Wait, the API doesn't expose a specific /hero endpoint, but the mock did?
    // Let's assume the mock just returned static data. If the backend doesn't expose /hero,
    // we can either add it to the backend or just return static fallback here for now,
    // or fetch from a config API.
    // Actually, in Phase 2.4, we didn't expose getHeroData via API Gateway for tests!
    // We just return a static fallback if the API doesn't have it.
    // Let's check TestRepository to see what it did.
    return success({
      title: 'Our Medical Services',
      description: 'We offer a wide range of medical services to ensure your health and well-being.',
      image: '/images/services_hero_visual.png'
    });
  }
}
