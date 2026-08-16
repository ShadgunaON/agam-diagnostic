'use server';

import { testCatalogService, packageService, blogService } from '@/services';
import { servicesData } from '@/data/services';

export interface SearchResultItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  price?: number | string;
  type: 'test' | 'package' | 'service' | 'blog' | 'page';
  description?: string;
  url: string;
}

export async function performGlobalSearch(query: string): Promise<SearchResultItem[]> {
  const searchTerm = query.toLowerCase().trim();
  const results: SearchResultItem[] = [];

  // IF empty, return default top items
  if (!searchTerm) {
    try {
      const pkgsRes = await packageService.getCatalog(1, 4);
      if (pkgsRes.isSuccess && pkgsRes.value) {
        pkgsRes.value.data?.slice(0, 4).forEach(p => {
          results.push({
            id: p.id,
            slug: p.slug,
            title: p.title,
            category: p.category || 'Package',
            price: p.price,
            type: 'package',
            url: `/health-packages/${p.slug}`
          });
        });
      }
      
      const services = servicesData.catalog || [];
      services.slice(0, 4).forEach(s => {
        results.push({
          id: `service-${s.slug}`,
          slug: s.slug,
          title: s.title,
          category: s.category || 'Service',
          price: s.price,
          type: 'service',
          url: `/services/${s.slug}`
        });
      });
      
    } catch (e) {
      console.error("Default search failed", e);
    }
    return results;
  }

  // Search Tests
  try {
    const testsRes = await testCatalogService.searchTests(searchTerm);
    if (testsRes.isSuccess && testsRes.value) {
      testsRes.value.forEach(test => {
        results.push({
          id: test.id,
          slug: test.slug,
          title: test.title,
          category: test.category || 'Test',
          price: test.price,
          type: 'test',
          url: `/tests/${test.slug}`
        });
      });
    }
  } catch (e) {
    console.error("Test search failed", e);
  }

  // Search Packages
  try {
    const pkgsRes = await packageService.getCatalog(1, 100);
    if (pkgsRes.isSuccess && pkgsRes.value) {
      const packages = pkgsRes.value.data || [];
      const filtered = packages.filter(p => 
        p.title.toLowerCase().includes(searchTerm) || 
        (p.description && p.description.toLowerCase().includes(searchTerm))
      );
      filtered.forEach(p => {
        results.push({
          id: p.id,
          slug: p.slug,
          title: p.title,
          category: p.category || 'Package',
          price: p.price,
          type: 'package',
          url: `/health-packages/${p.slug}`
        });
      });
    }
  } catch (e) {
    console.error("Package search failed", e);
  }

  // Search Services
  try {
    const services = servicesData.catalog || [];
    const filtered = services.filter(s =>
      s.title.toLowerCase().includes(searchTerm) ||
      (s.description && s.description.toLowerCase().includes(searchTerm))
    );
    filtered.forEach(s => {
      results.push({
        id: `service-${s.slug}`,
        slug: s.slug,
        title: s.title,
        category: s.category || 'Service',
        price: s.price,
        type: 'service',
        url: `/services/${s.slug}`
      });
    });
  } catch (e) {
    console.error("Service search failed", e);
  }

  // Search Blogs
  try {
    const blogsRes = await blogService.getArticles(1, 100);
    if (blogsRes.isSuccess && blogsRes.value && blogsRes.value.data) {
      const filtered = blogsRes.value.data.filter(b => 
        b.title.toLowerCase().includes(searchTerm) || 
        (b.category && b.category.toLowerCase().includes(searchTerm)) ||
        b.description.toLowerCase().includes(searchTerm)
      );
      filtered.forEach(blog => {
        results.push({
          id: blog.id,
          slug: blog.slug,
          title: blog.title,
          category: blog.category || 'Blog',
          type: 'blog',
          url: `/blog/${blog.slug}`
        });
      });
    }
  } catch (e) {
    console.error("Blog search failed", e);
  }

  // Static Public Pages
  const staticPages = [
    { id: 'page-home', title: 'Home', category: 'Page', url: '/' },
    { id: 'page-about', title: 'About Us', category: 'Page', url: '/about' },
    { id: 'page-services', title: 'Diagnostic Services', category: 'Page', url: '/services' },
    { id: 'page-help', title: 'Help & Contact', category: 'Page', url: '/help' },
  ];
  
  staticPages.forEach(page => {
    if (page.title.toLowerCase().includes(searchTerm)) {
      results.push({
        ...page,
        slug: page.url,
        type: 'page'
      });
    }
  });

  return results.slice(0, 15); // limit to 15 results
}
