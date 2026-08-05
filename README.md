# Agam Diagnostics (Next.js Application)

This is the Next.js application for Agam Diagnostics, bootstrapped with `create-next-app`.

## Project Architecture

This project follows a highly scalable architecture utilizing the Next.js App Router. The source code is organized at the project root to maintain a clean structure.

### Folder Structure

The following directories have been established to separate concerns:

- `app/`: Next.js App Router pages and layouts.
- `components/`: React components, subdivided by function:
  - `ui/`: Generic, reusable base components (buttons, inputs).
  - `layout/`: Structural components (headers, footers, sidebars).
  - `navigation/`: Navbars, menus, and breadcrumbs.
  - `sections/`: Large page sections and content blocks.
  - `cards/`: Card components for varied data presentation.
  - `forms/`: Form elements and complex assemblies.
- `hooks/`: Custom React hooks.
- `lib/`: Core business logic and third-party library configurations.
- `styles/`: Global stylesheets, design tokens, and custom animations.
- `utils/`: Pure helper functions and formatting utilities.
- `data/`: Mock data and static content data.
- `types/`: Global TypeScript interfaces and type definitions.
- `constants/`: Application-wide immutable constants.
- `config/`: Configuration settings and environment variables wrappers.

### Styling & Design System

We use **Tailwind CSS v4**.
- `app/globals.css` is the main entry point for styles.
- Design tokens (colors, spacing, typography) are defined as CSS variables in `styles/design-tokens.css`.
- Custom animations are defined in `styles/animations.css`.
- These are imported into `globals.css` and consumed via Tailwind's `@theme` directive, ensuring a scalable design system without needing a traditional `tailwind.config.ts`.

## Naming Conventions

To maintain consistency across the codebase, please adhere to the following naming conventions:

- **Components**: `PascalCase` (e.g., `Button.tsx`, `HeaderBar.tsx`)
- **Hooks**: `camelCase` (e.g., `useAuth.ts`, `useWindowSize.ts`)
- **Utilities / Styles**: `kebab-case` (e.g., `format-date.ts`, `design-tokens.css`)
- **Constants / Config**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL.ts`, `MAX_RETRIES.ts`)

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
