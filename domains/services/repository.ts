import { Result } from '../../shared/result';
import { ServiceItem, ServiceDetailData, ServicesHero } from './model';
import { PaginatedResponse } from '../../lib/api/types';

export interface IServicesRepository {
  getCatalog(page?: number, limit?: number): Promise<Result<PaginatedResponse<ServiceItem>>>;
  getServiceBySlug(slug: string): Promise<Result<ServiceDetailData>>;
  getHeroData(): Promise<Result<ServicesHero>>;
  
  // Admin CRUD methods
  getById?(id: string): Promise<Result<ServiceItem>>;
  create?(serviceData: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<ServiceItem>>;
  update?(id: string, serviceData: Partial<ServiceItem>): Promise<Result<ServiceItem>>;
  updateStatus?(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'): Promise<Result<void>>;
  delete?(id: string): Promise<Result<void>>;
}
