import { MetadataRoute } from 'next';
import { siteConfig } from '../config/site';
import { blogService, serviceCatalogService, packageService } from '../services';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  const staticRoutes = [
    '',
    '/about',
    '/help',
    '/privacy-policy',
    '/terms',
    '/blog',
    '/services',
    '/tests',
    '/health-packages',
    '/book',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const [blogRes, serviceRes, packageRes] = await Promise.all([
    blogService.getArticles(1, 100),
    serviceCatalogService.getCatalog(1, 100),
    packageService.getCatalog(1, 100),
  ]);

  const blogRoutes = blogRes.isSuccess ? blogRes.value.data.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  })) : [];

  const serviceRoutes = serviceRes.isSuccess ? serviceRes.value.data.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  })) : [];

  const packageRoutes = packageRes.isSuccess ? packageRes.value.data.map((pkg) => ({
    url: `${baseUrl}/health-packages/${pkg.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  })) : [];

  return [...staticRoutes, ...blogRoutes, ...serviceRoutes, ...packageRoutes];
}
