# SEO & Structured Data

## Strategy
Agam Diagnostics uses a centralized metadata strategy. All metadata generation flows through `config/metadata.ts`.

## Structured Data (JSON-LD)
We implement schema.org structured data using the `StructuredData` component:
- **Organization**: Injected globally in `app/layout.tsx`.
- **BreadcrumbList**: Injected dynamically in detail pages (Services, Packages, Blog).
- **Article**: Injected in `app/blog/[slug]/page.tsx`.

## Sitemaps & Robots
- `app/robots.ts` dynamically generates the `robots.txt` file.
- `app/sitemap.ts` builds the `sitemap.xml` iterating through all known static pages and the static data layers for dynamic routes.
