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
  invoiceRepository,
  reviewRepository,
  notificationRepository
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
import { ReviewService } from './ReviewService';
import { ActivityService } from './ActivityService';
import { AnalyticsService } from './AnalyticsService';
import { AlertService } from './AlertService';
import { PatientService } from './PatientService';
import { InvoiceService } from './InvoiceService';

import { GlobalSearchService } from './GlobalSearchService';
import { NotificationService } from './NotificationService';
import { PaymentService, MockPaymentProvider } from './PaymentService';

export const blogService = new BlogService(blogRepository);
export const serviceCatalogService = new ServiceCatalogService(serviceRepository);
export const packageService = new PackageService(packageRepository);
export const authService = new AuthService(authRepository);
export const invoiceService = new InvoiceService(invoiceRepository);
export const bookingService = new BookingService(bookingRepository, invoiceService);
invoiceService.setBookingService(bookingService);
export const reviewService = new ReviewService(reviewRepository, bookingRepository);

export const reportsService = new ReportsService(reportsRepository);
export const notificationService = new NotificationService(notificationRepository);
export const testCatalogService = new TestCatalogService(testRepository);
export const collectionService = new CollectionService(collectionRepository);

// Wire Unified Diagnostic Lifecycle Dependencies
bookingService.setCollectionService(collectionService);
collectionService.setBookingService(bookingService);
collectionService.setReportsService(reportsService);
collectionService.setNotificationService(notificationService);
reportsService.setBookingService(bookingService);
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
  reviewService,
  staffService,
  invoiceService
);

// Payment Architecture
const mockPaymentProvider = new MockPaymentProvider();
export const paymentService = new PaymentService(mockPaymentProvider, invoiceService);


