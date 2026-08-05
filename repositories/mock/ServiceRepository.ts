import { IServicesRepository } from '@/domains/services/repository';
import { ServiceItem, ServiceDetailData, ServicesHero } from '@/domains/services/model';
import { ServiceItemDto, ServiceDetailDto } from '@/domains/services/dto';
import { mapServiceItemDtoToModel, mapServiceDetailDtoToModel } from '@/domains/services/mapper';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { NotFoundError } from '@/lib/api/errors';
import { servicesData, getServiceBySlug } from '@/data/services';

export class MockServiceRepository implements IServicesRepository {
  async getCatalog(page = 1, limit = 10): Promise<Result<PaginatedResponse<ServiceItem>>> {
    const rawData = servicesData.catalog;
    
    const dtos: ServiceItemDto[] = rawData.map((raw, index) => ({
      id: `srv-${index}`,
      slug: raw.slug,
      name: raw.title,
      category_name: raw.category,
      description_short: raw.description,
      price_inr: raw.price,
      icon_name: raw.icon,
      brand_color: raw.color as "blue" | "green" | "orange" | "purple" | "red",
    }));

    const models = dtos.map(mapServiceItemDtoToModel);

    return success({
      data: models,
      meta: { total: models.length, page, limit, totalPages: Math.ceil(models.length / limit) }
    });
  }

  async getServiceBySlug(slug: string): Promise<Result<ServiceDetailData>> {
    const raw = getServiceBySlug(slug);
    if (!raw) return failure(new NotFoundError(`Service with slug ${slug} not found`));

    const dto: ServiceDetailDto = {
      id: `srv-${slug}`,
      slug: raw.slug,
      name: raw.title,
      category_name: raw.category,
      description_short: raw.shortDescription,
      icon_name: raw.icon,
      value_propositions: raw.valueProps.map(vp => ({ label: vp.title, icon: vp.icon })),
      about_html_content: raw.aboutHtml,
      target_audience: raw.whoShouldUse,
      workflow_steps: raw.process.map(p => ({ step_title: p.title, step_desc: p.description })),
      prep_requirements: { label: raw.preparation.title, details: raw.preparation.description, icon: raw.preparation.icon },
      faqs: raw.faqs.map(f => ({ q: f.question, a: f.answer })),
      related_tests: raw.relatedTests.map(rt => ({ name: rt.title, category: rt.category, desc: rt.description, url_slug: rt.slug })),
      cross_sell_services: raw.otherServices.map(os => ({ name: os.title, url_slug: os.slug }))
    };

    return success(mapServiceDetailDtoToModel(dto));
  }

  async getHeroData(): Promise<Result<ServicesHero>> {
    return success(servicesData.hero);
  }
}
