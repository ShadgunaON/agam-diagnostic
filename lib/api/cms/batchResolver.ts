import { apiClient } from '@/repositories/registry';

/**
 * Executes a batched GraphQL query using aliases to fetch multiple entities by ID in a single HTTP request.
 * This avoids N+1 queries by combining them into one AppSync query.
 * 
 * @param queryName The GraphQL query field to use (e.g., 'serviceById', 'packageById')
 * @param ids Array of IDs to fetch
 * @param fields The GraphQL selection set (e.g., 'id title description')
 */
export async function fetchBatchedByIds<T>(
  queryName: string,
  ids: string[],
  fields: string
): Promise<T[]> {
  if (!ids || ids.length === 0) return [];

  // Construct aliased query string
  // e.g., 
  // query BatchedServices {
  //   item_0: serviceById(id: "1") { id title }
  //   item_1: serviceById(id: "2") { id title }
  // }
  
  const queryParts = ids.map((id, index) => {
    return `item_${index}: ${queryName}(id: "${id}") { ${fields} }`;
  });

  const query = `
    query Batched_${queryName} {
      ${queryParts.join('\n      ')}
    }
  `;

  try {
    const _url = typeof window === 'undefined' ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api/graphql' : '/api/graphql';
    const response = await fetch(_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    if (result.errors) {
      console.error('GraphQL batch query errors:', result.errors);
      return [];
    }
    
    const data = result.data;
    if (!data) return [];

    const results: T[] = [];
    for (let i = 0; i < ids.length; i++) {
      const item = data[`item_${i}`];
      if (item) {
        results.push(item as T);
      }
    }

    return results;
  } catch (err) {
    console.error('Failed to execute batched GraphQL query', err);
    return [];
  }
}
