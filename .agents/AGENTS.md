# Premium UI/UX Permanent Standards

These rules are permanent architectural standards that must be applied incrementally to all future implementations. Do not immediately refactor existing code unless the current phase naturally touches it.

## 1. Spacing System
- **Rule:** Use a consistent spacing scale (4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px).
- **Rule:** Avoid arbitrary values (e.g., `mt-[13px]`, `gap-[27px]`) unless documented.
- **Rule:** Standardize section, card, form, and grid spacing using design tokens or Tailwind spacing consistently.

## 2. Layout Consistency
- **Rule:** Standardize container widths, section padding, content max widths, grid gaps, and vertical rhythm.
- **Rule:** Avoid inventing new layouts per page. Future phases must introduce reusable layout primitives (e.g. `<Container>`) instead of repeating flex/grid structures.

## 3. Margin Rules
- **Rule:** Prefer layout components (`<Stack>`, Grid) and gap utilities (`gap-4`) over arbitrary margin utilities.
- **Rule:** Avoid stacking multiple margins (`mt-8 mb-10 mt-3`).

## 4. Card Consistency
- **Rule:** Future cards must share border radius, internal padding, shadows, hover transitions, spacing, and typography hierarchy. Avoid bespoke card styling.

## 5. Form Consistency
- **Rule:** Use consistent vertical rhythm (e.g., Label -> 8px -> Input -> 16px -> Next Field).
- **Rule:** Standardize button alignment and validation message placement.

## 6. Typography Rhythm
- **Rule:** Never use arbitrary font sizes (e.g. `text-[13px]`). Use a consistent semantic scale for Headings, Body, Caption, Labels, Helper Text, and Table Text.

## 7. Responsive Rules
- **Rule:** Every new component must be verified across Desktop, Tablet, and Mobile. Avoid desktop-first implementations.

## 8. Motion Consistency
- **Rule:** Future animations must share duration, easing, hover behavior, focus behavior, and transitions.

## 9. Accessibility
- **Rule:** Maintain consistent focus rings, keyboard navigation, touch targets, color contrast, and ARIA support. Never sacrifice accessibility for aesthetics.

## 10. Design System Integrity
- **Rule:** Do not introduce arbitrary spacing, sizing, typography, or colors. Reuse existing tokens and primitives.
- **Rule:** Extend through composition, not isolated implementations.
- **Rule:** Before creating new UI, review surrounding page context to ensure visual consistency. Document intentional deviations. Consistency is paramount.


# Phase 7 & Future Modules Permanent Reporting and Implementation Standards

These standards are mandatory for every remaining phase and module.

1. **Use a single standardized report template for every module:**
   - Executive Summary
   - Migration Report
   - Architecture Decisions
   - Files Modified
   - Components Migrated
   - Before vs After Comparison
   - Visual Verification
   - Responsive Verification
   - Accessibility Verification (where applicable)
   - Performance Impact
   - Build Verification
   - Architecture Metrics
   - Walkthrough
   - Retrospective
   - Lessons Learned
   - Architecture Health Review
   - Remaining Risks / Technical Debt
   - Next Module Plan
   - Definition of Done
   - Closure Report

2. **Metrics:** Every migration report must include measurable metrics (Components migrated, Files modified, Legacy CSS removed, Inline styles removed, Duplicate code eliminated, Hooks/event listeners removed, Accessibility improvements, Animation standardization, Build time, TypeScript errors, Build errors, Static routes generated, Visual regressions, Remaining migration progress).

3. **Before vs After:** Include a comparison showing exactly what architectural debt was removed and what replaced it.

4. **Architecture Health Review:** Must show progress over time (Previous Score, Current Score, Improvement, Primary reasons for the change).

5. **Migration Tracker:** Include current module, completed, remaining, overall percentage, next milestone.

6. **Walkthrough:** Explain why old implementation was problematic, what decisions were made, why new is better, how logic was preserved, how future maintenance is easier.

7. **Retrospective:** Document what worked well, what required adjustment, risks encountered, resolution, recommendations.

8. **Enforce Architectural Rules:**
   - Composition over Configuration.
   - Keep primitives presentation-only.
   - No business logic inside shared UI components.
   - No prop bloat.
   - Keep the DOM shallow.
   - Remove unnecessary wrappers.
   - Eliminate arbitrary spacing and inline styles.
   - Follow the canonical spacing scale and design tokens.
   - Maintain responsive consistency.
   - Eliminate unused or excessive whitespace.
   - Preserve deployment-platform agnosticism.
   - Maintain strict separation between Public and Admin architectures.

9. **Validation Gates:** Do not mark complete until verifying: Production build, TypeScript, Responsive, Accessibility, Visual parity, Architecture, Definition of Done.

10. **Documentation Quality:** Leave behind enough documentation that a new engineer can understand what changed, why, validation, remaining debt, and next module.
