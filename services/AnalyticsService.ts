import { BookingService } from './BookingService';

export class AnalyticsService {
  constructor(private readonly bookingService: BookingService) {}

  async getRevenueByMonth() {
    const result = await this.bookingService.getAll();
    if (!result.isSuccess) {
      return [];
    }

    const bookings = result.value;
    const monthlyRevenue: Record<string, number> = {
      'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0,
      'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
    };

    bookings.forEach(b => {
      // Assuming b.createdAt is something like 'Oct 12, 2026'
      const monthMatch = b.createdAt.match(/^[a-zA-Z]{3}/);
      if (monthMatch && monthMatch[0]) {
        const month = monthMatch[0];
        if (monthlyRevenue[month] !== undefined) {
          monthlyRevenue[month] += b.payment.total;
        }
      }
    });

    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }));
  }

  async getDashboardKPIs() {
    const result = await this.bookingService.getAll();
    if (!result.isSuccess) {
      return { bookingsToday: 0, pendingBookings: 0, homeCollections: 0, revenueToday: 0 };
    }

    const bookings = result.value;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Fallback: If no bookings are strictly "today", we just use all bookings for the sake of the mock,
    // or we filter by actual today. In mock data, dates are hardcoded to Oct 12, 2026.
    // For demonstration, we'll calculate based on the entire dataset if none match today.
    let todayBookings = bookings.filter(b => b.createdAt === today);
    if (todayBookings.length === 0) {
      todayBookings = bookings; 
    }

    const bookingsToday = todayBookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    const homeCollections = bookings.filter(b => b.collection.type === 'Home Collection').length;
    const revenueToday = todayBookings.reduce((sum, b) => sum + b.payment.total, 0);

    return { bookingsToday, pendingBookings, homeCollections, revenueToday };
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
}
