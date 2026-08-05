# Data Layer

## Overview
The `data/` directory acts as a mock backend for the application, enforcing strict separation of concerns.

## Strategy
- **TypeScript Interfaces**: Every data file exports a schema interface (e.g., `BlogArticle`).
- **Static Exports**: Data is exported as static constants.
- **Helper Functions**: Data files export helpers (e.g., `getArticleBySlug(slug)`) to mimic API calls.

## Future API Integration
When the backend API is ready:
1. Replace the mock data arrays with `fetch()` calls inside the helper functions.
2. No UI components will need to be refactored since the prop contracts remain identical.
