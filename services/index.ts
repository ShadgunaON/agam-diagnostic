import { blogRepository, serviceRepository, packageRepository, authRepository, bookingRepository, reportsRepository, testRepository } from '@/repositories/registry';
import { BlogService } from './BlogService';
import { ServiceCatalogService } from './ServiceCatalogService';
import { PackageService } from './PackageService';
import { AuthService } from './AuthService';
import { BookingService } from './BookingService';
import { ReportsService } from './ReportsService';
import { TestCatalogService } from './TestCatalogService';

export const blogService = new BlogService(blogRepository);
export const serviceCatalogService = new ServiceCatalogService(serviceRepository);
export const packageService = new PackageService(packageRepository);
export const authService = new AuthService(authRepository);
export const bookingService = new BookingService(bookingRepository);
export const reportsService = new ReportsService(reportsRepository);
export const testCatalogService = new TestCatalogService(testRepository);
