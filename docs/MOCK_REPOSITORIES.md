# Mock Repositories

During Phase 5, Mock Repositories serve as the implementation layer that enables the frontend to function without a real backend API, while strictly adhering to the architectural contract.

## Purpose
Mock repositories consume the legacy `data/*.ts` static files, transforming them through mappers to fulfill the repository interfaces. The UI is completely unaware that it is receiving data from a mock repository rather than a real API.

## Implementation Pattern
1. **Dependency Injection**: The Registry injects the Mock Repository when `env.useMockData` is true.
2. **Legacy Data Access**: The Mock Repository imports the static data files.
3. **DTO Transformation**: The static data is transformed into a DTO format.
4. **Model Mapping**: The DTO is mapped into the Domain Model using the domain's mapper.
5. **Result Wrapper**: The domain model is wrapped in a `Result` object (Success or Failure).

## Example: MockBlogRepository
\`\`\`typescript
export class MockBlogRepository implements IBlogRepository {
  async getCatalog(page = 1, limit = 10): Promise<Result<PaginatedResponse<BlogArticle>>> {
    const rawData = blogData.articles;
    // Map rawData to DTOs
    // Map DTOs to Models
    // Return success(models)
  }
}
\`\`\`
