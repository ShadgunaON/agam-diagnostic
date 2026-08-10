import { PackageItemDto, PackageDetailDto } from './dto';
import { PackageItem, PackageDetailData } from './model';

export function mapPackageItemDtoToModel(dto: PackageItemDto): PackageItem {
  return {
    id: dto.id,
    slug: dto.url_slug,
    title: dto.name,
    category: dto.category_name,
    description: dto.summary,
    price: dto.cost,
    icon: dto.icon_name,
    includedTests: dto.included_tests_slugs,
  };
}

export function mapPackageDetailDtoToModel(dto: PackageDetailDto): PackageDetailData {
  return {
    id: dto.id,
    slug: dto.url_slug,
    title: dto.name,
    category: dto.category_name,
    description: dto.summary,
    price: dto.cost || '0',
    icon: dto.icon_name,
    includes: dto.included_tests,
    whoShouldGet: dto.target_demographic,
    preparation: dto.prep_instructions,
    relatedPackages: dto.related_packs.map(rp => ({ title: rp.name, category: rp.category, description: rp.desc, slug: rp.url_slug })),
    highlights: dto.key_highlights,
    includedTests: dto.included_tests_slugs,
  };
}
