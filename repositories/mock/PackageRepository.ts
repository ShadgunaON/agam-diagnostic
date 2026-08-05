import { IPackagesRepository } from '@/domains/packages/repository';
import { PackageItem, PackageDetailData, PackagesHero, Benefit, ProcessStep, FeaturedPackage } from '@/domains/packages/model';
import { PackageItemDto, PackageDetailDto } from '@/domains/packages/dto';
import { mapPackageItemDtoToModel, mapPackageDetailDtoToModel } from '@/domains/packages/mapper';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { NotFoundError } from '@/lib/api/errors';
import { packagesData, getPackageBySlug } from '@/data/packages';

export class MockPackageRepository implements IPackagesRepository {
  async getCatalog(page = 1, limit = 10): Promise<Result<PaginatedResponse<PackageItem>>> {
    const rawData = packagesData.catalog;
    
    const dtos: PackageItemDto[] = rawData.map((raw, index) => ({
      id: `pkg-${index}`,
      url_slug: raw.slug,
      name: raw.title,
      category_name: raw.category,
      summary: raw.description,
      cost: raw.price,
      icon_name: raw.icon,
    }));

    const models = dtos.map(mapPackageItemDtoToModel);

    return success({
      data: models,
      meta: { total: models.length, page, limit, totalPages: Math.ceil(models.length / limit) }
    });
  }

  async getPackageBySlug(slug: string): Promise<Result<PackageDetailData>> {
    const raw = getPackageBySlug(slug);
    if (!raw) return failure(new NotFoundError(`Package with slug ${slug} not found`));

    const dto: PackageDetailDto = {
      id: `pkg-${slug}`,
      url_slug: raw.slug,
      category_name: raw.category,
      name: raw.title,
      summary: raw.description,
      icon_name: raw.icon,
      included_tests: raw.includes,
      target_demographic: raw.whoShouldGet,
      prep_instructions: raw.preparation,
      related_packs: raw.relatedPackages.map(rp => ({ name: rp.title, category: rp.category, desc: rp.description, url_slug: rp.slug })),
      key_highlights: raw.highlights,
    };

    return success(mapPackageDetailDtoToModel(dto));
  }

  async getHeroData(): Promise<Result<PackagesHero>> {
    return success(packagesData.hero);
  }

  async getBenefits(): Promise<Result<Benefit[]>> {
    return success(packagesData.benefits);
  }

  async getProcessSteps(): Promise<Result<ProcessStep[]>> {
    return success(packagesData.process);
  }

  async getFeaturedPackages(): Promise<Result<FeaturedPackage[]>> {
    return success(packagesData.featured);
  }
}
