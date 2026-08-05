# Contributing

## Workflow
1. Create a feature branch off `main`.
2. Ensure strict adherence to the existing UI wireframes. **No unapproved design deviations.**
3. Create composable primitives before large layout sections.

## Code Quality
- **Linting**: Ensure `npm run lint` passes before opening a PR.
- **Build**: Ensure `npm run build` succeeds (no SSG failures).
- **Types**: All component props must be explicitly typed using TypeScript interfaces.

## Pull Requests
- Provide a summary of the UI or structural changes.
- Ensure cross-browser verification.
