import { env } from '@/config/env';
import { ApiClient } from '@/lib/api/client';

// Blog
import { IBlogRepository } from '@/domains/blog/repository';
import { MockBlogRepository } from './mock/BlogRepository';
import { ApiBlogRepository } from './api/BlogRepository';

// Services
import { IServicesRepository } from '@/domains/services/repository';
import { MockServiceRepository } from './mock/ServiceRepository';
import { ApiServiceRepository } from './api/ServiceRepository';

// Packages
import { IPackagesRepository } from '@/domains/packages/repository';
import { MockPackageRepository } from './mock/PackageRepository';
import { ApiPackageRepository } from './api/PackageRepository';

// Auth
import { IAuthRepository } from '@/domains/auth/repository';
import { MockAuthRepository } from './mock/AuthRepository';
import { ApiAuthRepository } from './api/AuthRepository';

// Booking
import { IBookingRepository } from '@/domains/booking/repository';
import { MockBookingRepository } from './mock/BookingRepository';
import { ApiBookingRepository } from './api/BookingRepository';

// Reports
import { IReportsRepository } from '@/domains/reports/repository';
import { MockReportsRepository } from './mock/ReportsRepository';
import { ApiReportsRepository } from './api/ReportsRepository';

// Tests
import { ITestsRepository } from '@/domains/tests/repository';
import { MockTestRepository } from './mock/TestRepository';
import { ApiTestRepository } from './api/TestRepository';

// Collections, Staff, Activity
import { ICollectionRepository } from '@/domains/collections/repository';
import { MockCollectionRepository } from './mock/CollectionRepository';
import { ApiCollectionRepository } from './api/CollectionRepository';
import { INotificationRepository } from '@/domains/notification/repository';
import { MockNotificationRepository } from './mock/NotificationRepository';
import { ApiNotificationRepository } from './api/NotificationRepository';
import { IStaffRepository } from '@/domains/staff/repository';
import { MockStaffRepository } from './mock/StaffRepository';
import { ApiStaffRepository } from './api/StaffRepository';
import { IActivityRepository } from '@/domains/activity/repository';
import { MockActivityRepository } from './mock/ActivityRepository';
import { ApiActivityRepository } from './api/ActivityRepository';

import { IPatientRepository } from '@/domains/patient/repository';
import { MockPatientRepository } from './mock/PatientRepository';
import { ApiPatientRepository } from './api/PatientRepository';
import { IInvoiceRepository } from '@/domains/invoice/repository';
import { MockInvoiceRepository } from './mock/InvoiceRepository';
import { ApiInvoiceRepository } from './api/InvoiceRepository';

import { IReviewRepository } from '@/domains/review/repository';
import { MockReviewRepository } from './mock/ReviewRepository';
import { ApiReviewRepository } from './api/ReviewRepository';

import { IDocumentRepository } from '@/domains/document/repository';
import { MockDocumentRepository } from './mock/DocumentRepository';
import { ApiDocumentRepository } from './api/DocumentRepository';

export const apiClient = new ApiClient();

// ==========================================================
// REPOSITORIES WITH REAL BACKEND API (Lambda endpoints exist)
// These route to API implementations in production mode.
// ==========================================================

export const authRepository: IAuthRepository = env.useMockData
  ? new MockAuthRepository()
  : new ApiAuthRepository(apiClient);

export const bookingRepository: IBookingRepository = env.useMockData
  ? new MockBookingRepository()
  : new ApiBookingRepository(apiClient);

export const patientRepository: IPatientRepository = env.useMockData
  ? new MockPatientRepository()
  : new ApiPatientRepository(apiClient);

export const collectionRepository: ICollectionRepository = env.useMockData
  ? new MockCollectionRepository()
  : new ApiCollectionRepository(apiClient);

export const notificationRepository: INotificationRepository = env.useMockData
  ? new MockNotificationRepository()
  : new ApiNotificationRepository(apiClient);

export const invoiceRepository: IInvoiceRepository = env.useMockData
  ? new MockInvoiceRepository()
  : new ApiInvoiceRepository(apiClient);

export const reviewRepository: IReviewRepository = env.useMockData
  ? new MockReviewRepository()
  : new ApiReviewRepository(apiClient);

export const blogRepository: IBlogRepository = env.useMockData 
  ? new MockBlogRepository() 
  : new ApiBlogRepository(apiClient);

export const documentRepository: IDocumentRepository = env.useMockData
  ? new MockDocumentRepository()
  : new ApiDocumentRepository(apiClient);

export const reportsRepository: IReportsRepository = env.useMockData
  ? new MockReportsRepository()
  : new ApiReportsRepository(apiClient);

export const serviceRepository: IServicesRepository = env.useMockData
  ? new MockServiceRepository()
  : new ApiServiceRepository(apiClient);

export const packageRepository: IPackagesRepository = env.useMockData
  ? new MockPackageRepository()
  : new ApiPackageRepository(apiClient);

export const testRepository: ITestsRepository = env.useMockData
  ? new MockTestRepository()
  : new ApiTestRepository(apiClient);

// ==========================================================
// CONTENT-CATALOG REPOSITORIES (No backend Lambda exists yet)
// These always use local data repositories in ALL modes.
// Their "API" implementations are stubs that return failure.
// When backend endpoints are built, move them to the section above.
// ==========================================================

export const staffRepository: IStaffRepository = env.useMockData
  ? new MockStaffRepository()
  : new ApiStaffRepository(apiClient);

export const activityRepository: IActivityRepository = env.useMockData
  ? new MockActivityRepository()
  : new ApiActivityRepository(apiClient);
