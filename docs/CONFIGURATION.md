# Configuration Layer

Centralized configuration ensures environment variables are typed, checked, and easily accessible without littering `process.env` throughout components.

## `config/env.ts`
The single source of truth for all runtime environment settings. Prepares for future validation using libraries like Envalid.

## `config/api.ts`
Global API configurations including timeouts, default headers, and the active `baseUrl`.

## `config/routes.ts`
All Next.js application routes. Replaces hardcoded string routes with safe object references (e.g., `routes.blog.detail('health-tips')`).

## `config/features.ts`
Feature flags registry to safely toggle experimental functionality.

## `config/constants.ts`
Application-wide business constants (e.g., max pagination limits).
