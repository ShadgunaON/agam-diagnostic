# Architecture

## Overview
Agam Diagnostics Frontend is built on **Next.js App Router (React Server Components)**. The architecture strictly separates presentational UI from static data to ensure deployment agnosticism and future CMS/API integrations.

## Folder Structure
```
app/          # Next.js App Router (Pages, Layouts, Meta)
components/   # React Components
  common/     # Shared composite components (Cards, CTAs)
  forms/      # Form structures (Presentational)
  layout/     # Header, Footer, Wrappers
  sections/   # Page-specific composite sections
  ui/         # Low-level UI primitives (Button, Input)
config/       # Centralized configuration (Metadata, Site Info)
data/         # Static Data Layer (Mocking API responses)
docs/         # Engineering Documentation
```

## Rendering Strategy (SSG)
All pages are fully pre-rendered at build time using **Static Site Generation (SSG)**. Dynamic routes (`[slug]`) use `generateStaticParams()` to fetch available slugs from the Data Layer at build time.

## Data Flow
1. **Data Layer**: Structured TypeScript files in `data/` export strongly typed interfaces and mock data.
2. **Page Components**: Server Components fetch this data.
3. **Section Components**: Receive data via props and render it.

## Styling Architecture
We use a **Hybrid Styling Approach**:
- **Tailwind CSS**: For layout, spacing, and typography.
- **Vanilla CSS Variables**: (`globals.css`) for design tokens (Colors, Radii) ensuring strict consistency with the wireframe.

## Deployment Philosophy
The application is entirely static and environment-agnostic. It avoids edge runtime dependencies, hardcoded AWS services, and proprietary Vercel APIs. It can be deployed to:
- Static Hosts (S3 + CloudFront, Netlify)
- Docker / Kubernetes Clusters
- Traditional Node.js Servers
