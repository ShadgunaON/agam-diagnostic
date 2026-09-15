# 04 — Public Catalog & Search

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the public test, package, and service catalog — listing pages, detail pages, search, filters, and add-to-cart / book actions available to unauthenticated and authenticated users.

---

## A. Scope & routes

- `/tests` — Test catalog listing
- `/tests/[slug]` — Test detail page
- `/health-packages` — Package catalog listing
- `/health-packages/[slug]` — Package detail page
- `/services` — Services listing
- `/services/[slug]` — Service detail page
- Global search (available from public nav)

---

## B. Preconditions

- At least 3 tests, 2 packages, and 2 services exist in the system with status **Active**.
- At least 1 item from each type has a category assigned.
- At least 1 item has a price set.
- A5 (Patient) account available for authenticated booking tests.

---

## C. Test Cases

### C1. Tests Listing — `/tests`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-1 | [ ] | Tests page loads | Open `/tests` unauthenticated | List of active tests renders; no console errors | ⬜ | |
| CAT-2 | [ ] | Test card content | View any test card | Shows: test name, category, price (₹), brief description | ⬜ | |
| CAT-3 | [ ] | Only active tests shown | Check catalog | No draft or inactive tests appear in the public list | ⬜ | |
| CAT-4 | [ ] | Category filter | Apply a category filter (e.g. "Thyroid") | Only tests matching the category appear | ⬜ | |
| CAT-5 | [ ] | Clear filter | Apply filter then clear it | Full list restores | ⬜ | |
| CAT-6 | [ ] | Sort by price | Sort by price ascending/descending | Items reorder correctly | ⬜ | |
| CAT-7 | [ ] | Search on listing | Type in listing search field | Results filter in real time (debounced) | ⬜ | |
| CAT-8 | [ ] | Search no results | Type a term with no match | Friendly "no results" message; not blank | ⬜ | |
| CAT-9 | [ ] | Pagination / load-more | If items > page size | Next page or load-more works; items append | ⬜ | |
| CAT-10 | [ ] | Test card click | Click a test card | Navigates to `/tests/[slug]` | ⬜ | |
| CAT-11 | [ ] | Empty catalog | If no active tests | Friendly empty state | ⬜ | |

### C2. Test Detail — `/tests/[slug]`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-12 | [ ] | Test detail loads | Click any test | Detail page renders; title, price, description visible | ⬜ | |
| CAT-13 | [ ] | Overview section | View detail | Overview / What It Measures section renders | ⬜ | |
| CAT-14 | [ ] | What it checks section | View detail | "What It Checks" or parameters list renders | ⬜ | |
| CAT-15 | [ ] | Sample type info | View detail | Sample required (blood, urine, etc.) shown | ⬜ | |
| CAT-16 | [ ] | Report time | View detail | Turnaround time for results displayed | ⬜ | |
| CAT-17 | [ ] | FAQs section | Scroll to FAQs | FAQs render; accordion expands/collapses | ⬜ | |
| CAT-18 | [ ] | Book Now CTA | Click "Book Now" on test detail | Opens booking flow with the test pre-selected | ⬜ | |
| CAT-19 | [ ] | Price displayed | View any test | Price in ₹ is shown clearly | ⬜ | |
| CAT-20 | [ ] | Invalid slug | Visit `/tests/nonexistent-slug` | 404 or "not found"; not a crash | ⬜ | |
| CAT-21 | [ ] | Back to listing | Click browser Back from detail | Returns to test listing at same scroll/filter state (if preserved) | ⬜ | |
| CAT-22 | [ ] | Related tests / suggestions | View detail | Related or similar tests shown (if implemented) | ⬜ | |

### C3. Health Packages Listing — `/health-packages`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-23 | [ ] | Packages page loads | Open `/health-packages` | Packages list renders; no errors | ⬜ | |
| CAT-24 | [ ] | Package card content | View any card | Name, included tests count, price visible | ⬜ | |
| CAT-25 | [ ] | Category filter | Apply filter | Packages filter correctly | ⬜ | |
| CAT-26 | [ ] | Sort by price | Sort ascending/descending | Packages reorder correctly | ⬜ | |
| CAT-27 | [ ] | Package card click | Click any package card | Navigates to `/health-packages/[slug]` | ⬜ | |
| CAT-28 | [ ] | Empty state | If no active packages | Friendly empty state | ⬜ | |

### C4. Package Detail — `/health-packages/[slug]`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-29 | [ ] | Package detail loads | Click any package | Detail page renders; name, price, included tests visible | ⬜ | |
| CAT-30 | [ ] | Included tests list | View detail | List of tests included in the package shown | ⬜ | |
| CAT-31 | [ ] | Value comparison | View detail | Original price vs package price comparison visible (if implemented) | ⬜ | |
| CAT-32 | [ ] | Book Package CTA | Click "Book Package" | Opens booking flow with package pre-selected | ⬜ | |
| CAT-33 | [ ] | Invalid slug | Visit `/health-packages/nonexistent` | 404 or not-found | ⬜ | |

### C5. Services Listing & Detail

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-34 | [ ] | Services page loads | Open `/services` | Services list renders | ⬜ | |
| CAT-35 | [ ] | Service card content | View any card | Name, description, price (if applicable) visible | ⬜ | |
| CAT-36 | [ ] | Service detail | Click a service | `/services/[slug]` loads with full detail | ⬜ | |
| CAT-37 | [ ] | Service CTA | Click "Book" / "Enquire" on service detail | Initiates appropriate flow | ⬜ | |

### C6. Global Search

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-38 | [ ] | Search opens | Click search icon / field in public nav | Search input becomes active; ready for input | ⬜ | |
| CAT-39 | [ ] | Search results — test | Type "Blood" in search | Results show matching tests grouped under Tests | ⬜ | |
| CAT-40 | [ ] | Search results — package | Type "Thyroid" in search | Matching packages appear | ⬜ | |
| CAT-41 | [ ] | Search result click — test | Click a test result | Navigates to `/tests/[slug]` | ⬜ | |
| CAT-42 | [ ] | Search result click — package | Click a package result | Navigates to `/health-packages/[slug]` | ⬜ | |
| CAT-43 | [ ] | Search no results | Type an obscure term | "No results" message; no crash | ⬜ | |
| CAT-44 | [ ] | Search close | Press Escape or click outside | Search closes; page state unchanged | ⬜ | |
| CAT-45 | [ ] | Search debounce | Type rapidly | Requests fire after pause, not per-keystroke | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| CAT-R1 | [ ] | `/tests` | ⬜ | ⬜ | ⬜ | |
| CAT-R2 | [ ] | `/tests/[slug]` | ⬜ | ⬜ | ⬜ | |
| CAT-R3 | [ ] | `/health-packages` | ⬜ | ⬜ | ⬜ | |
| CAT-R4 | [ ] | `/health-packages/[slug]` | ⬜ | ⬜ | ⬜ | |
| CAT-R5 | [ ] | `/services` | ⬜ | ⬜ | ⬜ | |
| CAT-R6 | [ ] | `/services/[slug]` | ⬜ | ⬜ | ⬜ | |
| CAT-R7 | [ ] | Global search dropdown | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 45 |
| S1/S2 bugs filed | |
