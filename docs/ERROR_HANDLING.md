# Error Handling Architecture

Robust error handling is critical for ensuring the application behaves gracefully when backend requests fail.

## The Result Pattern
Exceptions (`try / catch`) are avoided in UI components to prevent unhandled rejections from crashing the app. Instead, all repository methods return a generic `Result<T, AppError>`.

### Usage
```typescript
const result = await blogRepository.getArticleBySlug('slug');
if (result.isFailure) {
  return <ErrorState description={result.error.message} />;
}
return <Article detail={result.value} />;
```

## Error Models
Defined in `lib/api/errors.ts`.
- `AppError`: Base generic error.
- `ValidationError`: Input validation failures.
- `NetworkError`: Fetch failures (CORS, offline).
- `UnauthorizedError` / `ForbiddenError`: Auth failures.
- `NotFoundError`: Resource doesn't exist.
- `ServerError`: Unhandled backend crashes.

Repositories map native HTTP errors into these safe models.
