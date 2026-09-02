import { ServiceItemDto, ServiceDetailDto } from './dto';
import { ServiceItem, ServiceDetailData } from './model';

export function mapServiceItemDtoToModel(dto: ServiceItemDto): ServiceItem {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.name,
    category: dto.category_name,
    description: dto.description_short,
    price: dto.price_inr,
    icon: dto.icon_name,
    color: dto.brand_color,
  };
}

export function mapServiceDetailDtoToModel(dto: ServiceDetailDto): ServiceDetailData {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.name,
    category: dto.category_name,
    description: dto.description_short,
    shortDescription: dto.description_short,
    color: 'blue',
    price: dto.price_inr || '0',
    icon: dto.icon_name,
    valueProps: dto.value_propositions.map(vp => ({ title: vp.label, icon: vp.icon })),
    aboutHtml: dto.about_html_content,
    whoShouldUse: dto.target_audience,
    process: dto.workflow_steps.map(s => ({ title: s.step_title, description: s.step_desc })),
    preparation: {
      title: dto.prep_requirements.label,
      description: dto.prep_requirements.details,
      icon: dto.prep_requirements.icon
    },
    faqs: dto.faqs.map(f => ({ question: f.q, answer: f.a })),
    relatedTests: dto.related_tests.map(rt => ({ title: rt.name, category: rt.category, description: rt.desc, slug: rt.url_slug })),
    otherServices: dto.cross_sell_services.map(os => ({ title: os.name, slug: os.url_slug })),
  };
}
