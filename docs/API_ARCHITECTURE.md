# API Architecture

The API layer acts as the foundation for network communication in the application, completely decoupling UI and Domain layers from implementation details like `fetch`, `axios`, or backend endpoints.

## Core Principles
- **Transport Agnostic**: UI components do not perform HTTP requests. They call Repository interfaces.
- **Centralized Endpoint Management**: Defined entirely within `lib/api/endpoints.ts`.
- **Consistent Response/Error Handling**: Driven by the `Result<T, E>` pattern and structured `AppError` models.

## Folder Structure
```
lib/api/
  client.ts       - Generic IApiClient interface and ApiClient placeholder
  endpoints.ts    - API path constants
  errors.ts       - Error models (AppError, ValidationError, etc.)
  interceptors.ts - Placeholder for future request/response transformers
  request.ts      - HttpRequest schema
  response.ts     - HttpResponse schema
  types.ts        - Common API interfaces (PaginatedResponse, etc.)
```
