import { IServicesRepository } from '@/domains/services/repository';
import { ServiceItem, ServiceDetailData, ServicesHero } from '@/domains/services/model';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';

export class ApiServiceRepository implements IServicesRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getCatalog(page: number = 1, limit: number = 100): Promise<Result<PaginatedResponse<ServiceItem>>> {
    return toResult(this.apiClient.get<PaginatedResponse<ServiceItem>>(`/api/services?page=${page}&limit=${limit}`));
  }

  async getServiceBySlug(slug: string): Promise<Result<ServiceDetailData>> {
    const res = await toResult(this.apiClient.get<any>(`/api/services/${slug}`));
    if (res.isFailure) return failure(res.error);
    
    // Fill in missing details since DynamoDB only contains basic catalog info right now
    const enriched: ServiceDetailData = {
      ...res.value,
      shortDescription: res.value.shortDescription || res.value.description || '',
      valueProps: res.value.valueProps || [
        { title: "Home Sample Collection", icon: "home" },
        { title: "NABL Accredited Lab", icon: "shield" },
        { title: "Same Day Digital Reports", icon: "clock" },
        { title: "WhatsApp Delivery", icon: "phone" }
      ],
      aboutHtml: res.value.aboutHtml || `<p>${res.value.description || ''}</p>`,
      whoShouldUse: res.value.whoShouldUse || ["Patients advised by their physicians"],
      process: res.value.process || [
        { title: "1. Sample Collection", description: "Visit our lab or book a free home collection slot." },
        { title: "2. Automated Processing", description: "Samples are processed in our NABL accredited facility." },
        { title: "3. Report Delivery", description: "Receive your secure digital reports on the same day." }
      ],
      preparation: res.value.preparation || { title: "General Preparation", description: "Consult your doctor for specific requirements.", icon: "warning" },
      faqs: res.value.faqs || [
        { question: "How long does it take to get the reports?", answer: "Reports are delivered on the same day." }
      ],
      relatedTests: res.value.relatedTests || [],
      otherServices: res.value.otherServices || []
    };
    
    return success(enriched);
  }

  async getHeroData(): Promise<Result<ServicesHero>> {
    return success({
      title: 'Our Medical Services',
      description: 'We offer a wide range of medical services to ensure your health and well-being.',
      image: '/images/services_hero_pic.png'
    });
  }

  // Admin CRUD methods
  async getById(id: string): Promise<Result<ServiceItem>> {
    return toResult(
      this.apiClient.get<ServiceItem>(`/api/services/${encodeURIComponent(id)}`)
    );
  }

  async create(serviceData: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<ServiceItem>> {
    return toResult(
      this.apiClient.post<ServiceItem>('/api/services', serviceData)
    );
  }

  async update(id: string, serviceData: Partial<ServiceItem>): Promise<Result<ServiceItem>> {
    return toResult(
      this.apiClient.put<ServiceItem>(`/api/services/${encodeURIComponent(id)}`, serviceData)
    );
  }

  async updateStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'): Promise<Result<void>> {
    return toResult(
      this.apiClient.patch<void>(`/api/services/${encodeURIComponent(id)}/status`, { status })
    );
  }
}
