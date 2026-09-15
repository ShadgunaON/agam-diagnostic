# 03 — Public Homepage & Marketing Pages

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the public-facing marketing pages: Homepage, About, specialty category pages (Men's Health, Women's Health, Lifestyle, Genetic Tests), Blog, and Reviews.

---

## A. Scope & routes

- `/` — Homepage
- `/about` — About Agam Diagnostics
- `/men-health` — Men's Health landing page
- `/women-health` — Women's Health landing page
- `/lifestyle-health` — Lifestyle Health landing page
- `/genetic-tests` — Genetic Tests landing page
- `/blog` — Blog listing
- `/blog/[slug]` — Blog article detail
- `/reviews` — Patient reviews listing
- `/help` — Help & FAQ page

---

## B. Preconditions

- Public site accessible without login.
- At least 1 published blog post exists.
- At least 1 approved patient review exists.

---

## C. Test Cases

### C1. Homepage — Load & Sections

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| HOME-1 | [ ] | Homepage loads | Open `/` unauthenticated | Page renders fully; no console errors | ⬜ | |
| HOME-2 | [ ] | Hero section | View above-the-fold | Hero headline, subtitle, and CTA buttons visible | ⬜ | |
| HOME-3 | [ ] | Hero CTA — Book Now | Click "Book Now" / "Book a Test" CTA | Navigates to booking flow or tests catalog | ⬜ | |
| HOME-4 | [ ] | Statistics section | Scroll to stats bar | Numbers (patient count, tests, etc.) render | ⬜ | |
| HOME-5 | [ ] | Services section | Scroll to Services | Service cards render with titles and icons | ⬜ | |
| HOME-6 | [ ] | Services card link | Click a service card | Navigates to `/services/[slug]` detail | ⬜ | |
| HOME-7 | [ ] | Health Packages section | Scroll to Packages | Package cards render with name and price | ⬜ | |
| HOME-8 | [ ] | Package card CTA | Click "Book" / "View" on a package | Navigates to package detail or booking | ⬜ | |
| HOME-9 | [ ] | Why Choose Us section | Scroll to Why Choose Us | Feature cards / reasons render | ⬜ | |
| HOME-10 | [ ] | Testimonials section | Scroll to Testimonials | Patient testimonials render | ⬜ | |
| HOME-11 | [ ] | Blog preview section | Scroll to Blog preview | At least 2–3 recent blog cards render | ⬜ | |
| HOME-12 | [ ] | Blog preview link | Click a blog card | Navigates to `/blog/[slug]` | ⬜ | |
| HOME-13 | [ ] | FAQ section | Scroll to FAQ | FAQ items render; at least one accordion opens | ⬜ | |
| HOME-14 | [ ] | FAQ accordion toggle | Click a FAQ item | Expands to show answer; collapses on re-click | ⬜ | |
| HOME-15 | [ ] | Contact / CTA section | Scroll to Contact preview | Contact details or "Contact Us" section visible | ⬜ | |
| HOME-16 | [ ] | Footer renders | Scroll to footer | Footer with nav links, legal links, logo renders | ⬜ | |
| HOME-17 | [ ] | Footer nav links | Click each footer link | Navigates to correct page; no 404s | ⬜ | |
| HOME-18 | [ ] | HomeRedirect — logged-in patient | Login as A5, then visit `/` | Auto-redirected to `/dashboard` (if HomeRedirect is active) | ⬜ | |

### C2. About Page

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ABOUT-1 | [ ] | About page loads | Open `/about` | Page renders; no console errors | ⬜ | |
| ABOUT-2 | [ ] | Hero section | View hero | About headline and intro text visible | ⬜ | |
| ABOUT-3 | [ ] | Trust bar | Scroll to trust bar | Accreditation logos / trust indicators render | ⬜ | |
| ABOUT-4 | [ ] | Story section | Scroll | Agam Diagnostics founding story text renders | ⬜ | |
| ABOUT-5 | [ ] | Mission & Vision | Scroll | Mission and Vision cards visible | ⬜ | |
| ABOUT-6 | [ ] | Journey tracker | Scroll | Timeline or milestones section renders | ⬜ | |
| ABOUT-7 | [ ] | Technology section | Scroll | Technology & Infrastructure section renders | ⬜ | |
| ABOUT-8 | [ ] | Team section | Scroll | Team member cards render with photos and roles | ⬜ | |
| ABOUT-9 | [ ] | Accreditations | Scroll | Accreditation badges / logos render | ⬜ | |
| ABOUT-10 | [ ] | CTA section | Scroll to bottom | "Book a Test" or "Contact Us" CTA renders | ⬜ | |

### C3. Specialty Category Pages

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-S1 | [ ] | Men's Health loads | Open `/men-health` | Page renders with men's health content; no errors | ⬜ | |
| CAT-S2 | [ ] | Women's Health loads | Open `/women-health` | Page renders with women's health content; no errors | ⬜ | |
| CAT-S3 | [ ] | Lifestyle Health loads | Open `/lifestyle-health` | Page renders with lifestyle content; no errors | ⬜ | |
| CAT-S4 | [ ] | Genetic Tests loads | Open `/genetic-tests` | Page renders with genetic test content; no errors | ⬜ | |
| CAT-S5 | [ ] | Specialty page CTAs | Click Book / Explore on any specialty page | Navigates to booking or appropriate catalog page | ⬜ | |
| CAT-S6 | [ ] | Specialty page items | View related tests/packages on specialty page | Items listed with prices; links work | ⬜ | |

### C4. Blog

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| BLOG-1 | [ ] | Blog listing loads | Open `/blog` | Shows published articles with title, date, thumbnail | ⬜ | |
| BLOG-2 | [ ] | Blog empty state | If no published blogs | Friendly empty state; not a crash | ⬜ | |
| BLOG-3 | [ ] | Blog detail loads | Click a blog card | `/blog/[slug]` renders; title, content, date visible | ⬜ | |
| BLOG-4 | [ ] | Rich text renders | View blog detail body | Headings, paragraphs, images (if any) render correctly | ⬜ | |
| BLOG-5 | [ ] | Invalid slug | Visit `/blog/nonexistent-slug` | 404 or "not found" page — not a crash | ⬜ | |
| BLOG-6 | [ ] | Back navigation | On blog detail, use browser Back | Returns to blog listing at correct scroll | ⬜ | |

### C5. Reviews

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| REV-P1 | [ ] | Reviews page loads | Open `/reviews` | Approved reviews render with rating, name, comment | ⬜ | |
| REV-P2 | [ ] | Unapproved reviews hidden | View reviews | No unapproved/pending reviews visible to public | ⬜ | |
| REV-P3 | [ ] | Empty reviews state | If no approved reviews | Friendly empty state | ⬜ | |
| REV-P4 | [ ] | Review star rating | View a review | Star rating renders visually (not just a number) | ⬜ | |

### C6. Help Page

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| HELP-1 | [ ] | Help page loads | Open `/help` | Help page renders with FAQs or contact info | ⬜ | |
| HELP-2 | [ ] | FAQ interaction | Click a FAQ item | Expands to show answer | ⬜ | |

### C7. Navigation & Global Header

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| NAV-1 | [ ] | Public nav links | Click each link in the main nav | Navigates to correct page; active link highlighted | ⬜ | |
| NAV-2 | [ ] | Mobile nav menu | Open on mobile (390 px) | Hamburger menu opens; all links accessible | ⬜ | |
| NAV-3 | [ ] | Login button in nav | Click Login in nav (unauthenticated) | Navigates to `/login` | ⬜ | |
| NAV-4 | [ ] | Logo link | Click the Agam Diagnostics logo | Returns to `/` homepage | ⬜ | |
| NAV-5 | [ ] | Nav scroll behavior | Scroll down on any page | Nav stays accessible (fixed/sticky if designed) | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| HOME-R1 | [ ] | `/` — Homepage | ⬜ | ⬜ | ⬜ | |
| HOME-R2 | [ ] | `/about` | ⬜ | ⬜ | ⬜ | |
| HOME-R3 | [ ] | `/men-health` | ⬜ | ⬜ | ⬜ | |
| HOME-R4 | [ ] | `/women-health` | ⬜ | ⬜ | ⬜ | |
| HOME-R5 | [ ] | `/lifestyle-health` | ⬜ | ⬜ | ⬜ | |
| HOME-R6 | [ ] | `/genetic-tests` | ⬜ | ⬜ | ⬜ | |
| HOME-R7 | [ ] | `/blog` | ⬜ | ⬜ | ⬜ | |
| HOME-R8 | [ ] | `/blog/[slug]` | ⬜ | ⬜ | ⬜ | |
| HOME-R9 | [ ] | `/reviews` | ⬜ | ⬜ | ⬜ | |
| HOME-R10 | [ ] | `/help` | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 56 |
| S1/S2 bugs filed | |
