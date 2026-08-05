# Repository Pattern

Repositories manage data access in the frontend, hiding whether the data comes from a REST API, GraphQL endpoint, mock JSON file, or local storage.

## The Contract
- Resides in `domains/[domain]/repository.ts`.
- Defines an interface (e.g., `IBlogRepository`).
- Functions must always return `Promise<Result<T, AppError>>`.
- UI components should inject or import instances of these repositories, relying only on the interface, never a concrete implementation.

## Example Flow
`Component` -> calls `IBlogRepository.getArticleBySlug('slug')` -> returns `Result<BlogArticle, AppError>`.
The component checks `result.isSuccess` and renders accordingly without throwing or catching native exceptions.
