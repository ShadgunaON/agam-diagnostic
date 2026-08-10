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
  activityRepository
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

export const blogService = new BlogService(blogRepository);
export const serviceCatalogService = new ServiceCatalogService(serviceRepository);
export const packageService = new PackageService(packageRepository);
export const authService = new AuthService(authRepository);
export const bookingService = new BookingService(bookingRepository);
export const reportsService = new ReportsService(reportsRepository);
export const testCatalogService = new TestCatalogService(testRepository);
export const collectionService = new CollectionService(collectionRepository);
export const staffService = new StaffService(staffRepository);
export const activityService = new ActivityService(activityRepository);
export const analyticsService = new AnalyticsService(bookingService);
export const alertService = new AlertService(reportsService, collectionService);
