# Service Layer

The Service Layer acts as the orchestrator for domain logic and data access, providing a clean API for the UI components to consume.

## Purpose
- Decouples UI components from Repositories.
- Encapsulates business logic (if any).
- Coordinates calls across multiple repositories or handles complex data aggregation.
- Provides a centralized entry point for data fetching per domain.

## Implementation Pattern
Services are classes instantiated in `services/index.ts` with their required repository dependencies injected from the Registry.

## Example: BlogService
\`\`\`typescript
export class BlogService {
  constructor(private readonly repository: IBlogRepository) {}

  async getCatalog(page = 1, limit = 10) {
    return this.repository.getCatalog(page, limit);
  }
}
\`\`\`

## UI Consumption
UI Components (Server Components) import the singleton service instances from `services/index.ts`.

\`\`\`typescript
import { blogService } from '../../services';

export default async function BlogPage() {
  const result = await blogService.getCatalog(1, 10);
  if (result.isFailure) return <ErrorState />;
  // ...
}
\`\`\`
