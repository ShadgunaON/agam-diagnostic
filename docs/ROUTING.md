# Routing

## App Router Strategy
The application utilizes the **Next.js App Router** (`app/` directory).

## Static Pages
Standard static pages (e.g., `app/about/page.tsx`) are purely presentational and render instantly.

## Dynamic Routes
Dynamic routes use the `[slug]` convention:
- `/services/[slug]`
- `/health-packages/[slug]`
- `/blog/[slug]`

These routes utilize `generateStaticParams()` to pre-render HTML at build time, preventing expensive runtime computations.

## Layouts
`app/layout.tsx` is the root layout wrapping the entire application in the `Header` and `Footer`.
Specific sub-layouts (like `FormSplitLayout`) are used selectively inside page components.
