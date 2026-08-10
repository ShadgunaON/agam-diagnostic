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
import { IStaffRepository } from '@/domains/staff/repository';
import { MockStaffRepository } from './mock/StaffRepository';
import { IActivityRepository } from '@/domains/activity/repository';
import { MockActivityRepository } from './mock/ActivityRepository';


const apiClient = new ApiClient();

export const blogRepository: IBlogRepository = env.useMockData 
  ? new MockBlogRepository() 
  : new ApiBlogRepository(apiClient);

export const serviceRepository: IServicesRepository = env.useMockData
  ? new MockServiceRepository()
  : new ApiServiceRepository(apiClient);

export const packageRepository: IPackagesRepository = env.useMockData
  ? new MockPackageRepository()
  : new ApiPackageRepository(apiClient);

export const authRepository: IAuthRepository = env.useMockData
  ? new MockAuthRepository()
  : new ApiAuthRepository(apiClient);

export const bookingRepository: IBookingRepository = env.useMockData
  ? new MockBookingRepository()
  : new ApiBookingRepository(apiClient);

export const reportsRepository: IReportsRepository = env.useMockData
  ? new MockReportsRepository()
  : new ApiReportsRepository(apiClient);

export const testRepository: ITestsRepository = env.useMockData
  ? new MockTestRepository()
  : new ApiTestRepository(apiClient);

export const collectionRepository: ICollectionRepository = new MockCollectionRepository();
export const staffRepository: IStaffRepository = new MockStaffRepository();
export const activityRepository: IActivityRepository = new MockActivityRepository();
