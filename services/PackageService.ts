import { Result, success, failure } from '@/shared/result';
import { PackageItem, PackagesHero, PackageDetailData, FeaturedPackage } from '@/domains/packages/model';
import { packagesData } from '@/data/packages';
import { PaginatedResponse } from '@/lib/api/types';

export class PackageService {
  constructor() {}

  private async _graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const isServer = typeof window === 'undefined';
      const token = !isServer
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';
        
      if (isServer) {
        const apiUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://cihtpsxiibcb5bewwzxibt2l3i.appsync-api.us-east-1.amazonaws.com/graphql';
        const apiKey = process.env.APPSYNC_API_KEY || '';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: token } : apiKey ? { 'x-api-key': apiKey } : {}),
          },
          body: JSON.stringify({ query, variables }),
        });
        if (!response.ok) return null;
        const { data, errors } = await response.json();
        if (errors?.length) throw new Error(errors[0].message);
        return data as T;
      }
      
      const _url = '/api/graphql';
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
      return null;
    }
  }

  async getCatalog(page = 1, limit = 100): Promise<Result<PaginatedResponse<PackageItem>>> {
    try {
      const res = await this._graphqlFetch<{ catalogPackages: PaginatedResponse<PackageItem> }>(
        `query CatalogPackages($page: Int, $limit: Int) {
          catalogPackages(page: $page, limit: $limit) {
            data {
              id slug title category price status description
              packagePrice individualValue sortOrder testIds
            }
            meta { total page limit totalPages }
          }
        }`,
        { page, limit }
      );
      return success(res!.catalogPackages);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get package catalog'));
    }
  }

  async getPackageBySlug(slug: string): Promise<Result<PackageDetailData>> {
    try {
      const res = await this._graphqlFetch<{ packageBySlug: PackageDetailData }>(
        `query PackageBySlug($slug: String!) {
          packageBySlug(slug: $slug) {
            id slug title category price status description
            packagePrice individualValue sortOrder testIds includes
            faqs { question answer }
          }
        }`,
        { slug }
      );
      if (!res?.packageBySlug) return failure(new Error('Package not found'));
      return success(res.packageBySlug);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get package'));
    }
  }

  async getHeroData(): Promise<Result<PackagesHero>> {
    return success({
      title: 'Comprehensive Health Packages',
      description: 'Preventive health checkups for you and your family. Full body assessments with specialist consultations included.',
      image: '/images/hero_packages_visual.png',
      pill: 'Preventive Care',
    });
  }

  async getBenefits() {
    return success([
      { title: 'Complete Assessment', description: 'Comprehensive coverage of all vital health parameters.', icon: 'CheckCircle' },
      { title: 'Free Consultation', description: 'Expert review of your reports by specialist doctors.', icon: 'Stethoscope' },
      { title: 'Home Collection', description: 'Free sample collection from your home at your preferred time.', icon: 'Home' },
      { title: 'Smart Reports', description: 'Easy-to-understand digital reports with historical trends.', icon: 'FileText' }
    ]);
  }

  async getProcessSteps() {
    return success([
      { id: '1', stepNumber: 1, title: 'Book Package', description: 'Select a package and schedule your preferred time.' },
      { id: '2', stepNumber: 2, title: 'Sample Collection', description: 'Our phlebotomist visits your home for sample collection.' },
      { id: '3', stepNumber: 3, title: 'Lab Processing', description: 'Samples are processed in our NABL accredited lab.' },
      { id: '4', stepNumber: 4, title: 'Digital Reports', description: 'Receive smart reports via WhatsApp and email.' }
    ]);
  }

  async getFeaturedPackages(): Promise<Result<FeaturedPackage[]>> {
    return success(packagesData.featured);
  }

  async getById(id: string): Promise<Result<PackageItem>> {
    try {
      const res = await this._graphqlFetch<{ packageById: PackageItem }>(
        `query PackageById($id: ID!) {
          packageById(id: $id) {
            id slug title category price status description
            packagePrice individualValue sortOrder testIds includes
            faqs { question answer }
          }
        }`,
        { id }
      );
      if (!res?.packageById) return failure(new Error('Package not found'));
      return success(res.packageById);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get package'));
    }
  }

  async create(packageData: any): Promise<Result<PackageItem>> {
    try {
      const res = await this._graphqlFetch<{ createCatalogPackage: PackageItem }>(
        `mutation CreateCatalogPackage($input: String!) {
          createCatalogPackage(input: $input) { id slug title status }
        }`,
        { input: typeof packageData === "string" ? packageData : JSON.stringify(packageData) }
      );
      return success(res!.createCatalogPackage);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to create package'));
    }
  }

  async update(id: string, packageData: any): Promise<Result<PackageItem>> {
    try {
      const res = await this._graphqlFetch<{ updateCatalogPackage: PackageItem }>(
        `mutation UpdateCatalogPackage($id: ID!, $input: String!) {
          updateCatalogPackage(id: $id, input: $input) { id slug title status }
        }`,
        { id, input: typeof packageData === "string" ? packageData : JSON.stringify(packageData) }
      );
      return success(res!.updateCatalogPackage);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to update package'));
    }
  }

  async updateStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'): Promise<Result<void>> {
    try {
      await this._graphqlFetch(
        `mutation UpdateCatalogPackageStatus($id: ID!, $status: String!) {
          updateCatalogPackageStatus(id: $id, status: $status)
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
        `mutation DeleteCatalogPackage($id: ID!) {
          deleteCatalogPackage(id: $id)
        }`,
        { id }
      );
      return success(undefined);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to delete package'));
    }
  }
}
