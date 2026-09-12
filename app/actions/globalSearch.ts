'use server';

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

  // If empty, return a default selection
  if (!searchTerm) {
    // We will still call the backend with an empty query to get top items
    // The backend handles empty queries by returning default items for public catalog
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const url = new URL('/api/graphql', baseUrl).toString();

    // Use GraphQL for the public search too
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GlobalSearch($query: String!, $limit: Int) {
            globalSearch(query: $query, limit: $limit) {
              id
              type
              title
              subtitle
              href
              icon
            }
          }
        `,
        variables: {
          query: searchTerm,
          limit: 15
        }
      }),
    });

    if (response.ok) {
      const result = await response.json();
      const gqlResults = result.data?.globalSearch || [];
      
      // Map back to SearchResultItem
      gqlResults.forEach((item: any) => {
        // Only include public catalog items
        if (['test', 'package', 'service', 'blog'].includes(item.type)) {
          results.push({
            id: item.id,
            slug: item.id, // ID is usually slug for these
            title: item.title,
            category: item.subtitle, // Subtitle contains category
            type: item.type,
            url: item.href
          });
        }
      });
    }
  } catch (e) {
    console.error("GraphQL public search failed", e);
  }

  // Static Public Pages (Still handled locally)
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

  return results.slice(0, 15);
}
