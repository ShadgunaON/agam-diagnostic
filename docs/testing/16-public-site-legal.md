# 16 — Public Site & Legal

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

The public-facing marketing website, OTP-based sign-up/login entry points, consent checkboxes, legal pages (Terms / Privacy / Refund), and analytics/cookie-consent. All pages in this module are **unauthenticated** (test in a fresh incognito window unless noted).

---

## A. Scope & routes

### Public / marketing pages
- `/` — homepage
- `/tests` — test catalog (public)
- `/about`, `/contact`, `/careers` — company pages
- `/packages` — health packages
- `/blogs` — blog / resource hub

### Entry points / Auth
- `/login` — OTP sign-in / sign-up (patients)

### Legal
- `/terms` — Terms & Conditions
- `/privacy` — Privacy Policy
- `/refund-policy` — Refund & Cancellation Policy

---

## B. Preconditions

- Test in **incognito** (fresh, no cached state) unless the test case says otherwise.
- A5 (Patient) credentials available to verify logged-in header state on public pages.
- At least 3 published blog posts and at least 1 published health package (see [10 — Admin Catalog](10-admin-catalog.md)).

---

## C. Test Cases

### C1. Homepage — `/`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-1 | [ ] | Homepage loads | Open UAT URL unauthenticated | Hero section renders; no console errors; no failed network calls | ⬜ | |
| PUB-2 | [ ] | Hero CTAs | Click primary CTA (e.g., "Book a Test") | Navigates to `/tests` or `/login` | ⬜ | |
| PUB-3 | [ ] | Nav links | Click each header nav link | Each resolves to the correct page; no 404 | ⬜ | |
| PUB-4 | [ ] | Footer links | Click each footer link | All resolve; no 404; legal links go to correct legal pages | ⬜ | |
| PUB-5 | [ ] | Logged-in header swap | Visit homepage while logged in as A5 | Header shows patient name / avatar; "Login" CTA replaced with dashboard link | ⬜ | |

### C2. Test Catalog — `/tests`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-6 | [ ] | Catalog loads | Open `/tests` unauthenticated | All published tests listed with name, price, category | ⬜ | |
| PUB-7 | [ ] | Test detail | Click any test | Detail page renders (description, what it checks, price, FAQs) | ⬜ | |
| PUB-8 | [ ] | Search / filter | Use search or category filter | List updates to matching tests | ⬜ | |
| PUB-9 | [ ] | Empty state | Filter to no results | Friendly "no results" message shown | ⬜ | |
| PUB-10 | [ ] | Book CTA on catalog | Click "Book" on a test | Redirects to booking wizard or `/login` if unauthenticated | ⬜ | |

### C3. Packages — `/packages`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-11 | [ ] | Packages page loads | Open `/packages` | Published packages render with name, price, included tests | ⬜ | |
| PUB-12 | [ ] | Package detail | Click a package | Detail renders; included tests listed | ⬜ | |
| PUB-13 | [ ] | Book package CTA | Click "Book" on a package | Redirects to booking wizard or `/login` | ⬜ | |

### C4. Company pages

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-14 | [ ] | About loads | Open `/about` | Page renders; no errors | ⬜ | |
| PUB-15 | [ ] | Contact loads | Open `/contact` | Contact page with form renders | ⬜ | |
| PUB-16 | [ ] | Contact form fields | Fill all fields | Name, email, phone, message all accept input | ⬜ | |
| PUB-17 | [ ] | Contact form validation | Submit empty / bad email | Inline required errors; no submit | ⬜ | |
| PUB-18 | [ ] | Contact form submit | Submit with valid data | Success message shown; no duplicate submit possible | ⬜ | |
| PUB-19 | [ ] | Careers loads | Open `/careers` | Careers page renders | ⬜ | |

### C5. Blog — `/blogs`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-20 | [ ] | Blog list loads | Open `/blogs` | Published blog posts render with title, date, thumbnail | ⬜ | |
| PUB-21 | [ ] | Blog post detail | Click a post | Full post renders; author and date shown | ⬜ | |
| PUB-22 | [ ] | Unpublished post | Visit slug of a draft post directly | 404 or access denied; not publicly visible | ⬜ | |

### C6. OTP Login / Sign-up — `/login`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-23 | [ ] | Login page loads | Open `/login` | OTP entry form renders; no errors | ⬜ | |
| PUB-24 | [ ] | Phone field — required | Submit with empty phone | Inline required error | ⬜ | |
| PUB-25 | [ ] | Phone field — invalid | Enter non-numeric / too-short number | Inline validation error | ⬜ | |
| PUB-26 | [ ] | Send OTP | Enter valid phone; click "Send OTP" | OTP sent; OTP input step shown | ⬜ | |
| PUB-27 | [ ] | OTP — correct | Enter correct OTP | Logged in; redirected to `/dashboard` | ⬜ | |
| PUB-28 | [ ] | OTP — incorrect | Enter wrong OTP | Error message; retry allowed | ⬜ | |
| PUB-29 | [ ] | OTP — expired | Wait for expiry; enter valid OTP | "OTP expired" message; option to resend | ⬜ | |
| PUB-30 | [ ] | Resend OTP | Click "Resend" | New OTP sent; old OTP invalid | ⬜ | |
| PUB-31 | [ ] | Already logged in redirect | Visit `/login` while already logged in | Redirected to `/dashboard` (not shown login page) | ⬜ | |
| PUB-32 | [ ] | New user first login | Use a phone number not previously registered | New patient account created; onboarding or profile-complete flow triggered | ⬜ | |

### C7. Legal pages

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-33 | [ ] | Terms page | Open `/terms` | Page renders; correct content | ⬜ | |
| PUB-34 | [ ] | Privacy page | Open `/privacy` | Page renders; reflects real data practices | ⬜ | |
| PUB-35 | [ ] | Refund policy page | Open `/refund-policy` | Page renders | ⬜ | |
| PUB-36 | [ ] | Scrollspy TOC (if present) | Scroll on a legal page | TOC highlights active section; clicking a TOC item jumps to it | ⬜ | |
| PUB-37 | [ ] | Footer legal links | Click Terms / Privacy / Refund in footer | Navigate to correct pages | ⬜ | |
| PUB-38 | [ ] | Consent checkbox on forms | On contact form or booking consent step | "I agree to Terms & Privacy" checkbox present | ⬜ | |
| PUB-39 | [ ] | Consent gating | Submit without checking consent | Blocked until checked | ⬜ | |
| PUB-40 | [ ] | Consent links | Click Terms / Privacy from consent checkbox | Opens correct legal pages (tab or modal) | ⬜ | |

### C8. SEO & analytics

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-41 | [ ] | Meta / OG tags | View page source for `/`, `/tests`, `/blogs` | `<title>`, `<meta name="description">`, OG tags present per page | ⬜ | |
| PUB-42 | [ ] | GA4 fires (if configured) | DevTools → Network, filter `collect`; navigate pages | GA4 pageview requests fire on each navigation | ⬜ | |
| PUB-43 | [ ] | 404 page | Visit a non-existent path | Branded 404 page renders; not a crash | ⬜ | |
| PUB-44 | [ ] | Performance — throttled | Load homepage on "Slow 3G" in DevTools | Page loads within acceptable time; images lazy-load | ⬜ | |
| PUB-45 | [ ] | Accessibility spot-check | Tab through the homepage and `/login` form | Focus order logical; all interactive elements reachable by keyboard | ⬜ | |

### C9. Cookie consent banner (if implemented)

> If a cookie / analytics consent banner is present on the public site, run these cases. If not implemented, mark all ➖.

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-46 | [ ] | Banner appears (first visit) | Open the site in a **fresh incognito** window | Banner appears (after ~1 s) with "Accept" and "Decline" options | ⬜ | |
| PUB-47 | [ ] | Accept | Click "Accept All" | Banner closes; site fully functional | ⬜ | |
| PUB-48 | [ ] | Choice remembered | Reload after accepting | Banner does **not** reappear | ⬜ | |
| PUB-49 | [ ] | Decline | Fresh incognito → click "Decline" (or ✕) | Banner closes; site still works | ⬜ | |
| PUB-50 | [ ] | Decline remembered | Reload after declining | Banner does **not** reappear | ⬜ | |
| PUB-51 | [ ] | Privacy link in banner | Click "Privacy Policy" link inside banner | Opens `/privacy` | ⬜ | |

---

## D. Responsiveness

Run **R-1…R-15** (see [17 — Responsiveness](17-responsiveness.md)). Public/marketing pages are the most visible on mobile — check hero, nav drawer, and forms carefully.

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| PUB-R1 | [ ] | Homepage `/` | ⬜ | ⬜ | ⬜ | |
| PUB-R2 | [ ] | Test catalog `/tests` | ⬜ | ⬜ | ⬜ | |
| PUB-R3 | [ ] | Packages `/packages` | ⬜ | ⬜ | ⬜ | |
| PUB-R4 | [ ] | Blog list + detail `/blogs` | ⬜ | ⬜ | ⬜ | |
| PUB-R5 | [ ] | Contact form `/contact` | ⬜ | ⬜ | ⬜ | |
| PUB-R6 | [ ] | Login / OTP form `/login` | ⬜ | ⬜ | ⬜ | |
| PUB-R7 | [ ] | Legal pages (scrollspy TOC) | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 51 |
| S1/S2 bugs filed | |
