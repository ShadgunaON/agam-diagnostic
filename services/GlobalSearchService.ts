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
import { AdminIconName } from '@/components/admin/navigation/AdminIcons';

export type GlobalSearchType = 'patient' | 'booking' | 'report' | 'collection' | 'blog' | 'test' | 'package' | 'service';

export type GlobalSearchResult = {
  id: string;
  type: GlobalSearchType;
  title: string;
  subtitle?: string;
  href: string;
  icon: AdminIconName;
};

export class GlobalSearchService {
  constructor(
    private readonly patientService: PatientService,
    private readonly bookingService: BookingService,
    private readonly reportsService: ReportsService,
    private readonly collectionService: CollectionService,
    private readonly blogService: BlogService,
    private readonly testService: TestCatalogService,
    private readonly packageService: PackageService,
    private readonly serviceCatalog: ServiceCatalogService,
    private readonly staffService?: StaffService,
    private readonly invoiceService?: InvoiceService
  ) {}

  private normalizeMatch(query: string, text?: string): boolean {
    if (!text) return false;
    const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
    const t = text.trim().toLowerCase().replace(/\s+/g, ' ');
    return t.includes(q);
  }

  async search(query: string): Promise<GlobalSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const q = query.trim().toLowerCase();
    const results: GlobalSearchResult[] = [];

    // 1. Patients
    const patientsRes = await this.patientService.getAll(1, 100);
    if (patientsRes.isSuccess) {
      const matched = patientsRes.value.data.filter(p => 
        this.normalizeMatch(q, p.id) || 
        this.normalizeMatch(q, p.name) || 
        this.normalizeMatch(q, p.phone) || 
        this.normalizeMatch(q, p.email)
      );
      results.push(...matched.map(p => ({
        id: p.id,
        type: 'patient' as GlobalSearchType,
        title: p.name,
        subtitle: `${p.id} • ${p.phone}`,
        href: `/admin/patients/${p.id}`,
        icon: 'users' as AdminIconName
      })));
    }

    // 2. Bookings
    const bookingsRes = await this.bookingService.getAll();
    if (bookingsRes.isSuccess) {
      const matched = bookingsRes.value.filter(b => 
        this.normalizeMatch(q, b.id) || 
        this.normalizeMatch(q, b.patient?.name) || 
        this.normalizeMatch(q, b.patient?.phone) || 
        this.normalizeMatch(q, b.patient?.email) || 
        this.normalizeMatch(q, b.status) || 
        b.items.some(item => this.normalizeMatch(q, item.name))
      );
      results.push(...matched.map(b => ({
        id: b.id,
        type: 'booking' as GlobalSearchType,
        title: `${b.patient?.name || 'Unknown'} - ${b.id}`,
        subtitle: `Booking • ${b.status}`,
        href: `/admin/bookings`,
        icon: 'calendar' as AdminIconName
      })));
    }

    // 3. Reports
    const reportsRes = await this.reportsService.getAllTasks();
    if (reportsRes.isSuccess) {
      const matched = reportsRes.value.filter(r => 
        this.normalizeMatch(q, r.id) || 
        this.normalizeMatch(q, r.patient?.name) ||
        this.normalizeMatch(q, r.status)
      );
      results.push(...matched.map(r => ({
        id: r.id,
        type: 'report' as GlobalSearchType,
        title: `${r.patient?.name || 'Unknown'} - ${r.id}`,
        subtitle: `Report • ${r.status}`,
        href: `/admin/reports`,
        icon: 'fileText' as AdminIconName
      })));
    }

    // 4. Collections
    const collectionsRes = await this.collectionService.getAll();
    if (collectionsRes.isSuccess) {
      const matched = collectionsRes.value.filter(c => 
        this.normalizeMatch(q, c.id) || 
        this.normalizeMatch(q, c.patient) || 
        this.normalizeMatch(q, c.address) || 
        this.normalizeMatch(q, c.assignedTo) || 
        this.normalizeMatch(q, c.status)
      );
      results.push(...matched.map(c => ({
        id: c.id,
        type: 'collection' as GlobalSearchType,
        title: `${c.patient} - ${c.id}`,
        subtitle: `Collection • ${c.status}`,
        href: `/admin/collections`,
        icon: 'activity' as AdminIconName
      })));
    }

    // 5. Blogs
    const blogsRes = await this.blogService.getArticles(1, 100);
    if (blogsRes.isSuccess) {
      const matched = blogsRes.value.data.filter(b => 
        this.normalizeMatch(q, b.title) || 
        this.normalizeMatch(q, b.slug) || 
        this.normalizeMatch(q, b.author) ||
        this.normalizeMatch(q, b.status)
      );
      results.push(...matched.map(b => ({
        id: b.id,
        type: 'blog' as GlobalSearchType,
        title: b.title,
        subtitle: `Blog • ${b.author}`,
        href: `/admin/blogs`,
        icon: 'layoutDashboard' as AdminIconName
      })));
    }

    // 6. Tests
    const testsRes = await this.testService.getCatalog(1, 100);
    if (testsRes.isSuccess) {
      const matched = testsRes.value.data.filter(t => 
        this.normalizeMatch(q, t.title) || 
        this.normalizeMatch(q, t.slug) || 
        this.normalizeMatch(q, t.category)
      );
      results.push(...matched.map(t => ({
        id: t.id,
        type: 'test' as GlobalSearchType,
        title: t.title,
        subtitle: `Test • ${t.category}`,
        href: `/tests/${t.slug}`,
        icon: 'testTube' as AdminIconName
      })));
    }

    // 7. Packages
    const packagesRes = await this.packageService.getCatalog(1, 100);
    if (packagesRes.isSuccess) {
      const matched = packagesRes.value.data.filter(p => 
        this.normalizeMatch(q, p.title) || 
        this.normalizeMatch(q, p.slug) || 
        this.normalizeMatch(q, p.category)
      );
      results.push(...matched.map(p => ({
        id: p.id,
        type: 'package' as GlobalSearchType,
        title: p.title,
        subtitle: `Package • ${p.category || 'Health'}`,
        href: `/health-packages/${p.slug}`,
        icon: 'package' as AdminIconName
      })));
    }

    // 8. Services
    const servicesRes = await this.serviceCatalog.getCatalog(1, 100);
    if (servicesRes.isSuccess) {
      const matched = servicesRes.value.data.filter(s => 
        this.normalizeMatch(q, s.title) || 
        this.normalizeMatch(q, s.slug) || 
        this.normalizeMatch(q, s.category)
      );
      results.push(...matched.map(s => ({
        id: s.id,
        type: 'service' as GlobalSearchType,
        title: s.title,
        subtitle: `Service • ${s.category}`,
        href: `/services/${s.slug}`,
        icon: 'box' as AdminIconName
      })));
    }

    // 9. Staff
    if (this.staffService) {
      const staffRes = await this.staffService.getAllStaff();
      if (staffRes.isSuccess) {
        const matched = staffRes.value.filter(s => 
          this.normalizeMatch(q, s.name) || 
          this.normalizeMatch(q, s.email) || 
          this.normalizeMatch(q, s.role)
        );
        results.push(...matched.map(s => ({
          id: s.id,
          type: 'patient' as GlobalSearchType,
          title: s.name,
          subtitle: `Staff • ${s.department}`,
          href: `/admin/staff/${s.id}`,
          icon: 'users' as AdminIconName
        })));
      }
    }

    // 10. Invoices
    if (this.invoiceService) {
      const invRes = await this.invoiceService.getAll();
      if (invRes.isSuccess) {
        const matched = invRes.value.filter(i => 
          this.normalizeMatch(q, i.id) || 
          this.normalizeMatch(q, i.patientId) || 
          this.normalizeMatch(q, i.bookingId)
        );
        results.push(...matched.map(i => ({
          id: i.id,
          type: 'booking' as GlobalSearchType,
          title: `Invoice ${i.id}`,
          subtitle: `₹${i.total} • ${i.paymentStatus}`,
          href: `/admin/invoices/${i.id}`,
          icon: 'fileText' as AdminIconName
        })));
      }
    }

    // Deterministic ranking:
    // 1. Exact title/id match
    // 2. Contains match
    return results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === q || a.id.toLowerCase() === q;
      const bExact = b.title.toLowerCase() === q || b.id.toLowerCase() === q;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    }).slice(0, 12);
  }
}
