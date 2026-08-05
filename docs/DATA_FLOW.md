# Data Flow

The frontend architecture implements a unidirectional, layered data flow that enforces strong boundaries between the UI, the domain models, and the data sources.

## Data Flow Pipeline

1. **UI Component (Consumer)**
   - Server Component requests data by calling a Service method.
   - Example: `blogService.getArticleBySlug(slug)`

2. **Service Layer (Orchestrator)**
   - Receives the request, performs any necessary orchestration.
   - Calls the injected Repository interface.
   - Example: `this.repository.getArticleBySlug(slug)`

3. **Registry (Dependency Injection)**
   - Resolves which repository implementation to provide based on `env.useMockData`.

4. **Repository Implementation (Data Access)**
   - **MockRepository**: Accesses legacy `data/*.ts` files.
   - **ApiRepository**: Calls `ApiClient` to fetch data from HTTP endpoints.

5. **Mapping Layer (Transformation)**
   - The Repository maps the external data structure to a DTO.
   - The Mapper function converts the DTO to the Domain Model.

6. **Result Handling**
   - The Repository wraps the Domain Model in a `Result` object (Success or Failure).
   - The Result propagates up to the UI Component.

7. **UI Render**
   - UI Component checks `result.isFailure`.
   - Renders `ErrorState` if failed, or the normal UI if successful.

## Diagram
\`\`\`
UI Component
      │
      ▼
   Service
      │
      ▼
  Registry ──▶ [MockRepo | ApiRepo]
                      │
                      ▼
            [Static Data | HTTP API]
                      │
                      ▼
                     DTO
                      │
                      ▼
                   Mapper
                      │
                      ▼
                 Domain Model
                      │
                      ▼
                 Result<T>
                      │
                      ▼
                 UI Component
\`\`\`
