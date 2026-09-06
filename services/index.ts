
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
import { DocumentService } from './DocumentService';
import { PaymentService, MockPaymentProvider, ApiPaymentProvider } from './PaymentService';
import { env } from '@/config/env';
import { apiClient } from '@/repositories/registry';

// Services with remaining repositories
export const blogService = new BlogService();
export const authService = new AuthService();
export const activityService = new ActivityService();

// Services migrated to direct GraphQL fetches
export const invoiceService = new InvoiceService();
export const serviceCatalogService = new ServiceCatalogService();
export const packageService = new PackageService();
export const testCatalogService = new TestCatalogService();
export const staffService = new StaffService();
export const patientService = new PatientService();
export const notificationService = new NotificationService();
export const documentService = new DocumentService();
export const bookingService = new BookingService(invoiceService);
export const collectionService = new CollectionService();
export const reportsService = new ReportsService();

// Services depending on other services
export const reviewService = new ReviewService(bookingService);

// Wire Unified Diagnostic Lifecycle Dependencies
bookingService.setCollectionService(collectionService);
invoiceService.setBookingService(bookingService);
collectionService.setBookingService(bookingService);
collectionService.setReportsService(reportsService);
collectionService.setNotificationService(notificationService);
reportsService.setBookingService(bookingService);
patientService.setBookingService(bookingService);
patientService.setReportsService(reportsService);
patientService.setCollectionService(collectionService);
patientService.setInvoiceService(invoiceService);

export const analyticsService = new AnalyticsService(bookingService, invoiceService);
export const alertService = new AlertService(reportsService, collectionService);
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
const paymentProvider = env.useMockData ? new MockPaymentProvider() : new ApiPaymentProvider();
export const paymentService = new PaymentService(paymentProvider, invoiceService);


