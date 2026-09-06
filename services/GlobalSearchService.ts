import { PatientService } from './PatientService';
import { BookingService } from './BookingService';
import { ReportsService } from './ReportsService';
import { CollectionService } from './CollectionService';
import { StaffService } from './StaffService';
import { InvoiceService } from './InvoiceService';
import { BlogService } from './BlogService';
import { TestCatalogService } from './TestCatalogService';
import { PackageService } from './PackageService';
import { ServiceCatalogService } from './ServiceCatalogService';
import { ReviewService } from './ReviewService';
import { AdminIconName } from '@/components/admin/navigation/AdminIcons';

export type GlobalSearchType = 'patient' | 'booking' | 'report' | 'collection' | 'blog' | 'test' | 'package' | 'service' | 'review' | 'staff';

export type GlobalSearchResult = {
  id: string;
  type: GlobalSearchType;
  title: string;
  subtitle?: string;
  href: string;
  icon: AdminIconName;
};

export class GlobalSearchService {
  // Keep constructor for backward compatibility in DI if needed
  constructor(
    private readonly patientService?: any,
    private readonly bookingService?: any,
    private readonly reportsService?: any,
    private readonly collectionService?: any,
    private readonly blogService?: any,
    private readonly testService?: any,
    private readonly packageService?: any,
    private readonly serviceCatalog?: any,
    private readonly reviewService?: any,
    private readonly staffService?: any,
    private readonly invoiceService?: any
  ) {}

  async search(query: string): Promise<GlobalSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const q = query.trim();
    
    try {
      // Base URL depends on environment (Next.js server-side API proxy)
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const url = new URL('/api/graphql', baseUrl).toString();

      // In Phase B1, we execute a single GraphQL query pointing to our local AppSync proxy
      // The backend DynamoDB FilterExpressions will handle efficient narrowing.
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GlobalSearch($query: String!, $limit: Int) {
              globalSearch(query: $query, limit: $limit) {
                id
                type
                title
                subtitle
                href
                icon
              }
            }
          `,
          variables: {
            query: q,
            limit: 12
          }
        }),
      });

      if (!response.ok) {
        console.error('GraphQL search failed', await response.text());
        return [];
      }

      const result = await response.json();
      return result.data?.globalSearch || [];
    } catch (error) {
      console.error('Failed to execute global search', error);
      return [];
    }
  }
}
