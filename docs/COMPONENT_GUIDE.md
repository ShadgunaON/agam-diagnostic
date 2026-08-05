# Component Guide

## Principles
1. **Composition over Configuration**: Components should accept `children` and composable props rather than massive configuration objects.
2. **Stable Public APIs**: UI Primitives should extend standard HTML attributes (e.g., `React.ButtonHTMLAttributes`).
3. **ForwardRefs**: All base UI components must wrap themselves in `forwardRef` to support animations, focus management, and accessibility.

## Component Hierarchy
1. **UI Primitives (`components/ui`)**: Agnostic, reusable elements (`Button`, `Input`). No business logic.
2. **Common Composites (`components/common`)**: Reusable blocks like `BlogCard` or `CTASection`.
3. **Sections (`components/sections`)**: Large page building blocks (e.g., `HeroSection`).
4. **Layouts (`components/layout`)**: Page framing elements.

## Styling Guidelines
- Merge class names cleanly using template literals.
- Accept an optional `className` prop on *every* component.
- Avoid inline styles.
