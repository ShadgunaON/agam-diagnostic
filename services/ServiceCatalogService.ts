import { Result, success, failure } from '@/shared/result';
import { ServiceItem, ServicesHero, ServiceDetailData } from '@/domains/services/model';
import { PaginatedResponse } from '@/lib/api/types';

export class ServiceCatalogService {
  constructor() {}

  private async _graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const token = typeof window !== 'undefined'
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';
      const _url = typeof window === 'undefined' ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api/graphql' : '/api/graphql';
      const response = await fetch(_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
      });
      if (!response.ok) return null;
      const { data, errors } = await response.json();
      if (errors?.length) { 
        console.error('GraphQL errors:', errors); 
        throw new Error(errors[0].message);
      }
      return data as T;
    } catch (err) {
      console.error('GraphQL fetch failed:', err);
      throw err;
    }
  }

  async getCatalog(page = 1, limit = 100): Promise<Result<PaginatedResponse<ServiceItem>>> {
    try {
      const res = await this._graphqlFetch<{ catalogServices: PaginatedResponse<ServiceItem> }>(
        `query CatalogServices($page: Int, $limit: Int) {
          catalogServices(page: $page, limit: $limit) {
            data {
              id slug title category tag price discountPrice description duration preparation status createdAt updatedAt
            }
            meta { total page limit totalPages }
          }
        }`,
        { page, limit }
      );
      return success(res!.catalogServices);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get service catalog'));
    }
  }

  async getServiceBySlug(slug: string): Promise<Result<ServiceDetailData>> {
    try {
      const res = await this._graphqlFetch<{ serviceBySlug: ServiceDetailData }>(
        `query ServiceBySlug($slug: String!) {
          serviceBySlug(slug: $slug) {
            id slug title category tag price discountPrice description duration preparation status createdAt updatedAt
            faqs { question answer }
          }
        }`,
        { slug }
      );
      if (!res?.serviceBySlug) return failure(new Error('Service not found'));
      return success(res.serviceBySlug);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get service'));
    }
  }

  async getHeroData(): Promise<Result<ServicesHero>> {
    return success({
      title: 'Our Services',
      description: 'Comprehensive healthcare services tailored to your needs. From diagnostic imaging to specialized consultations.',
      image: '/images/hero_services_visual.png',
    });
  }

  async getById(id: string): Promise<Result<ServiceItem>> {
    try {
      const res = await this._graphqlFetch<{ serviceById: ServiceItem }>(
        `query ServiceById($id: ID!) {
          serviceById(id: $id) {
            id slug title category tag price discountPrice description duration preparation status createdAt updatedAt
            faqs { question answer }
          }
        }`,
        { id }
      );
      if (!res?.serviceById) return failure(new Error('Service not found'));
      return success(res.serviceById);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get service'));
    }
  }

  async create(serviceData: any): Promise<Result<ServiceItem>> {
    try {
      const res = await this._graphqlFetch<{ createCatalogService: ServiceItem }>(
        `mutation CreateCatalogService($input: AWSJSON!) {
          createCatalogService(input: $input) { id slug title status }
        }`,
        { input: serviceData }
      );
      return success(res!.createCatalogService);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to create service'));
    }
  }

  async update(id: string, serviceData: any): Promise<Result<ServiceItem>> {
    try {
      const res = await this._graphqlFetch<{ updateCatalogService: ServiceItem }>(
        `mutation UpdateCatalogService($id: ID!, $input: AWSJSON!) {
          updateCatalogService(id: $id, input: $input) { id slug title status }
        }`,
        { id, input: serviceData }
      );
      return success(res!.updateCatalogService);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to update service'));
    }
  }

  async updateStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'): Promise<Result<void>> {
    try {
      await this._graphqlFetch(
        `mutation UpdateCatalogServiceStatus($id: ID!, $status: String!) {
          updateCatalogServiceStatus(id: $id, status: $status)
        }`,
        { id, status }
      );
      return success(undefined);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to update status'));
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this._graphqlFetch(
        `mutation DeleteCatalogService($id: ID!) {
          deleteCatalogService(id: $id)
        }`,
        { id }
      );
      return success(undefined);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to delete service'));
    }
  }
}
