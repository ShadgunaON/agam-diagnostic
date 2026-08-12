import { 
  blogRepository, 
  serviceRepository, 
  packageRepository, 
  authRepository, 
  bookingRepository, 
  reportsRepository, 
  testRepository,
  collectionRepository,
  staffRepository,
  activityRepository,
  patientRepository,
  invoiceRepository
} from '@/repositories/registry';
import { BlogService } from './BlogService';
import { ServiceCatalogService } from './ServiceCatalogService';
import { PackageService } from './PackageService';
import { AuthService } from './AuthService';
import { BookingService } from './BookingService';
import { ReportsService } from './ReportsService';
import { TestCatalogService } from './TestCatalogService';
import { CollectionService } from './CollectionService';
import { StaffService } from './StaffService';
import { ActivityService } from './ActivityService';
import { AnalyticsService } from './AnalyticsService';
import { AlertService } from './AlertService';
import { PatientService } from './PatientService';
import { InvoiceService } from './InvoiceService';

import { GlobalSearchService } from './GlobalSearchService';
import { PaymentService, MockPaymentProvider } from './PaymentService';

// Import mock repositories
import { MockAuthRepository } from '@/repositories/mock/AuthRepository';
import { MockPatientRepository } from '@/repositories/mock/PatientRepository';
import { MockBookingRepository } from '@/repositories/mock/BookingRepository';
import { MockReportsRepository } from '@/repositories/mock/ReportsRepository';
import { MockCollectionRepository } from '@/repositories/mock/CollectionRepository';
import { MockBlogRepository } from '@/repositories/mock/BlogRepository';
import { MockTestRepository } from '@/repositories/mock/TestRepository';
import { MockPackageRepository } from '@/repositories/mock/PackageRepository';
import { MockServiceRepository } from '@/repositories/mock/ServiceRepository';
import { MockStaffRepository } from '@/repositories/mock/StaffRepository';

export const blogService = new BlogService(blogRepository);
export const serviceCatalogService = new ServiceCatalogService(serviceRepository);
export const packageService = new PackageService(packageRepository);
export const authService = new AuthService(authRepository);
export const invoiceService = new InvoiceService(invoiceRepository);
export const bookingService = new BookingService(bookingRepository, invoiceService);
export const reportsService = new ReportsService(reportsRepository);
export const testCatalogService = new TestCatalogService(testRepository);
export const collectionService = new CollectionService(collectionRepository);
export const staffService = new StaffService(staffRepository);
export const activityService = new ActivityService(activityRepository);
export const analyticsService = new AnalyticsService(bookingService, invoiceService);
export const alertService = new AlertService(reportsService, collectionService);
export const patientService = new PatientService(patientRepository, bookingService, reportsService, collectionService, invoiceService);
export const globalSearchService = new GlobalSearchService(
  patientService,
  bookingService,
  reportsService,
  collectionService,
  blogService,
  testCatalogService,
  packageService,
  serviceCatalogService,
  staffService,
  invoiceService
);

// Payment Architecture
const mockPaymentProvider = new MockPaymentProvider();
export const paymentService = new PaymentService(mockPaymentProvider, invoiceService);


