# Domain Model Architecture

We employ a strict Domain-Driven Design (DDD) approach to structure features independently. 

## Structure
Each domain resides in `domains/` and must contain:
1. `dto.ts`: Backend DTO schemas. These mirror exactly what the REST/GraphQL endpoint returns.
2. `model.ts`: The UI-friendly data schema consumed by React components.
3. `mapper.ts`: Conversion functions `mapDtoToModel()` that protect the UI from backend schema changes.
4. `validator.ts`: Pure functions and generic schemas preparing for future Yup/Zod implementations.
5. `repository.ts`: Data-fetching interfaces returning `Promise<Result<Model>>`.

## Bounded Contexts
Current domains include:
- `auth`: Authentication and user context
- `blog`: Articles and categories
- `booking`: Appointments and flow states
- `packages`: Health package catalogs
- `services`: Diagnostic service catalogs
- `reports`: Secure patient lab results
