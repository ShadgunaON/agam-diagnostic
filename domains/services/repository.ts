import { Result } from '../../shared/result';
import { ServiceItem, ServiceDetailData, ServicesHero } from './model';
import { PaginatedResponse } from '../../lib/api/types';

export interface IServicesRepository {
  getCatalog(page?: number, limit?: number): Promise<Result<PaginatedResponse<ServiceItem>>>;
  getServiceBySlug(slug: string): Promise<Result<ServiceDetailData>>;
  getHeroData(): Promise<Result<ServicesHero>>;
}
