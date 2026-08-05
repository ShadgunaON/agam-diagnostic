# Frontend ⇄ Backend Contract

To ensure that the frontend can integrate seamlessly with a backend (REST, GraphQL, CMS, etc.), we enforce strict separation layers.

## DTO Separation
- Backend responses are typed as `DTO` (Data Transfer Objects) (e.g. `BlogArticleDto`). 
- UI Components **never** use DTOs.
- `mappers.ts` safely converts `DTO` objects into structured UI Models.

## The Flow
1. **API Client** requests data.
2. **Repository** handles the request and parses the raw JSON as `DTO`.
3. **Repository** calls the `mapDtoToModel()` mapper.
4. **Repository** wraps the `Model` in a `Success` object and returns it to the UI.

This contract ensures that if the backend changes from Snake Case (`published_at`) to Camel Case (`publishedAt`), the only file needing updates is the `mapper.ts`. The UI remains untouched.
