import { env } from '@/config/env';
import { ApiClient } from '@/lib/api/client';

// Blog
import { IBlogRepository } from '@/domains/blog/repository';
import { MockBlogRepository } from './mock/BlogRepository';

// Auth
import { IAuthRepository } from '@/domains/auth/repository';
import { MockAuthRepository } from './mock/AuthRepository';

// Booking
import { IBookingRepository } from '@/domains/booking/repository';
import { MockBookingRepository } from './mock/BookingRepository';

// Reports
import { IReportsRepository } from '@/domains/reports/repository';
import { MockReportsRepository } from './mock/ReportsRepository';

// Collections, Staff, Activity
import { ICollectionRepository } from '@/domains/collections/repository';
import { MockCollectionRepository } from './mock/CollectionRepository';
import { IStaffRepository } from '@/domains/staff/repository';
import { MockStaffRepository } from './mock/StaffRepository';
import { IActivityRepository } from '@/domains/activity/repository';
import { MockActivityRepository } from './mock/ActivityRepository';

import { MockPatientRepository } from './mock/PatientRepository';

import { IDocumentRepository } from '@/domains/document/repository';
import { MockDocumentRepository } from './mock/DocumentRepository';

export const apiClient = new ApiClient();

// ==========================================================
// REPOSITORIES WITH REAL BACKEND API (Lambda endpoints exist)
// These route to API implementations in production mode.
// ==========================================================

// export const authRepository: IAuthRepository = env.useMockData
//   ? new MockAuthRepository()
//   : new ApiAuthRepository(apiClient);

// export const bookingRepository: IBookingRepository = env.useMockData
//   ? new MockBookingRepository()
//   : new ApiBookingRepository(apiClient);

// export const patientRepository: IPatientRepository = env.useMockData
//   ? new MockPatientRepository()
//   : new ApiPatientRepository(apiClient);

// export const collectionRepository: ICollectionRepository = env.useMockData
//   ? new MockCollectionRepository()
//   : new ApiCollectionRepository(apiClient);

// export const invoiceRepository: IInvoiceRepository = env.useMockData
//   ? new MockInvoiceRepository()
//   : new ApiInvoiceRepository(apiClient);

// export const blogRepository: IBlogRepository = env.useMockData 
//   ? new MockBlogRepository() 
//   : new ApiBlogRepository(apiClient);

// export const documentRepository: IDocumentRepository = env.useMockData
//   ? new MockDocumentRepository()
//   : new ApiDocumentRepository(apiClient);

// export const reportsRepository: IReportsRepository = env.useMockData
//   ? new MockReportsRepository()
//   : new ApiReportsRepository(apiClient);



// ==========================================================
// CONTENT-CATALOG REPOSITORIES (No backend Lambda exists yet)
// These always use local data repositories in ALL modes.
// Their "API" implementations are stubs that return failure.
// When backend endpoints are built, move them to the section above.
// ==========================================================

export const staffRepository: IStaffRepository = new MockStaffRepository();

// export const activityRepository: IActivityRepository = env.useMockData
//   ? new MockActivityRepository()
//   : new ApiActivityRepository(apiClient);
