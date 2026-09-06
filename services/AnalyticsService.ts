import { BookingService } from './BookingService';
import { InvoiceService } from './InvoiceService';

export class AnalyticsService {
  constructor(
    private readonly bookingService: BookingService,
    private readonly invoiceService?: InvoiceService
  ) {}

  // ---------------------------------------------------------------------------
  // Internal: shared GraphQL fetch helper (mirrors getDashboardKPIs pattern)
  // ---------------------------------------------------------------------------
  private async _graphqlFetch<T>(query: string): Promise<T | null> {
    try {
      const token = typeof window !== 'undefined'
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) return null;
      const { data, errors } = await response.json();
      if (errors?.length) { console.error('GraphQL errors:', errors); return null; }
      return data as T;
    } catch (err) {
      console.error('GraphQL fetch failed:', err);
      return null;
    }
  }

  /**
   * Revenue aggregated server-side by the GraphQL analyticsCharts resolver.
   * Uses a single bounded GSI1 range query on ENTITY#INVOICE for the current
   * UTC year. FilterExpression restricts to paymentStatus=Paid.
   * Only createdAt and total fields are projected — no full invoice objects.
   * The old invoiceService.getAll() is no longer used for this purpose.
   */
  async getRevenueByMonth(): Promise<Array<{ month: string; revenue: number }>> {
    const EMPTY: Array<{ month: string; revenue: number }> = [
      { month: 'Jan', revenue: 0 }, { month: 'Feb', revenue: 0 },
      { month: 'Mar', revenue: 0 }, { month: 'Apr', revenue: 0 },
      { month: 'May', revenue: 0 }, { month: 'Jun', revenue: 0 },
      { month: 'Jul', revenue: 0 }, { month: 'Aug', revenue: 0 },
      { month: 'Sep', revenue: 0 }, { month: 'Oct', revenue: 0 },
      { month: 'Nov', revenue: 0 }, { month: 'Dec', revenue: 0 },
    ];
    const data = await this._graphqlFetch<{ analyticsCharts: { revenueByMonth: Array<{ month: string; revenue: number }> } }>(`
      query {
        analyticsCharts {
          revenueByMonth {
            month
            revenue
          }
        }
      }
    `);
    // Return the 12-entry array on success; fall back to zeroed structure on failure
    // so the chart always receives a consistent shape regardless of API state.
    return data?.analyticsCharts?.revenueByMonth ?? EMPTY;
  }

  async getDashboardKPIs() {
    try {
      const token = typeof window !== 'undefined' 
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';
        
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          query: `
            query {
              dashboardStats {
                bookingsToday
                pendingBookings
                homeCollections
                revenueToday
              }
            }
          `
        })
      });

      if (!response.ok) {
        throw new Error(`GraphQL Error: ${response.status}`);
      }

      const { data, errors } = await response.json();
      
      if (errors && errors.length > 0) {
        console.error('GraphQL Analytics Errors:', errors);
        return { bookingsToday: 0, pendingBookings: 0, homeCollections: 0, revenueToday: 0 };
      }

      return data.dashboardStats || { bookingsToday: 0, pendingBookings: 0, homeCollections: 0, revenueToday: 0 };
    } catch (err) {
      console.error('Failed to fetch dashboard KPIs via GraphQL:', err);
      return { bookingsToday: 0, pendingBookings: 0, homeCollections: 0, revenueToday: 0 };
    }
  }

  async getTestDistribution() {
    const result = await this.bookingService.getAll();
    if (!result.isSuccess) {
      return [];
    }

    const bookings = result.value;
    const distribution: Record<string, number> = {
      'Hematology': 0,
      'Biochemistry': 0,
      'Molecular': 0,
      'Microbiology': 0,
      'Packages': 0,
      'Other': 0
    };

    let totalItems = 0;
    bookings.forEach(b => {
      b.items.forEach(item => {
        totalItems++;
        if (item.type === 'Package') {
          distribution['Packages']++;
        } else if (item.name.toLowerCase().includes('blood') || item.name.toLowerCase().includes('cbc')) {
          distribution['Hematology']++;
        } else if (item.name.toLowerCase().includes('thyroid') || item.name.toLowerCase().includes('lipid') || item.name.toLowerCase().includes('liver') || item.name.toLowerCase().includes('sugar') || item.name.toLowerCase().includes('hba1c')) {
          distribution['Biochemistry']++;
        } else if (item.name.toLowerCase().includes('pcr')) {
          distribution['Molecular']++;
        } else {
          distribution['Other']++;
        }
      });
    });

    return Object.entries(distribution)
      .filter(([_, value]) => value > 0)
      .map(([name, value], index) => {
        // Mock colors for distribution
        const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];
        return { name, value: Math.round((value / totalItems) * 100) || 0, color: colors[index % colors.length] };
      });
  }

  /**
   * Patient KPIs — authoritative server-derived values.
   *
   * totalPatients: GSI1 ENTITY#PATIENT Select:COUNT (full pagination)
   * newThisMonth:  GSI1 ENTITY#PATIENT begins_with(GSI1SK, 'YYYY-MM') Select:COUNT
   * retentionRate: intentionally unavailable — no business definition exists
   * activeBookings: reuses dashboardStats.pendingBookings (already authoritative)
   */
  async getPatientKPIs(): Promise<{
    totalPatients: number;
    newThisMonth: number;
    activeBookings: number;
    retentionRate: null;
    retentionRateAvailable: false;
  }> {
    const FALLBACK = { totalPatients: 0, newThisMonth: 0, activeBookings: 0, retentionRate: null as null, retentionRateAvailable: false as const };
    try {
      const data = await this._graphqlFetch<{
        patientStats: { totalPatients: number; newThisMonth: number };
        dashboardStats: { pendingBookings: number };
      }>(`
        query {
          patientStats {
            totalPatients
            newThisMonth
          }
          dashboardStats {
            pendingBookings
          }
        }
      `);
      if (!data) return FALLBACK;
      return {
        totalPatients: data.patientStats?.totalPatients ?? 0,
        newThisMonth: data.patientStats?.newThisMonth ?? 0,
        activeBookings: data.dashboardStats?.pendingBookings ?? 0,
        retentionRate: null,
        retentionRateAvailable: false,
      };
    } catch {
      return FALLBACK;
    }
  }
}
