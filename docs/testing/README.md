# Agam Diagnostics — Manual Testing Suite

This folder is the **complete manual test suite** for Agam Diagnostics. It is split into one document per module so a tester can pick up a single file and exhaustively test that module — every page, every button, every field, every state — and record results inline.

Each test case has a **Status** column (mark Pass/Fail/Blocked/N-A) and a **Comments** column (free notes, bug links, screenshots). Tick the checkbox when a case is done.

---

## First-time tester — 5-minute setup (read this if you're new)

**1. What you need before you start**
- Use **Google Chrome** (clean results; avoid Brave/ad-blockers — they can block analytics and cause false failures).
- The **UAT App URL** (AWS Amplify link) — this is the *only* site you test. Never test on the live production URL.
- Your **test accounts** (A1–A6 below) — ask the dev team for the credentials.

**2. Two browser tricks you'll use constantly**
- **Incognito window** (`Ctrl+Shift+N`): a fresh, logged-out browser with no memory — use it whenever a test says "fresh session" or "logged out".
- **DevTools** (`F12`): a panel that shows what the page is doing. You'll mostly use:
  - **Console** — should have *no red errors* on normal use.
  - **Network** — should have *no red (failed) requests* on normal use.

**3. How to do one test case**
1. Read the **Steps** and do exactly that in the app.
2. Compare what you see to the **Expected Result**.
3. In the **Status** column, put `✅` (works) or `❌` (broken). If broken, note it in **Comments** and file a bug.
4. Put `[x]` in the `✓` box to mark the row done.
5. If something breaks, take a **screenshot** (`Windows key + Shift + S`), save it, and file a bug using the template at the bottom of this file.

**4. What "Pass" means**
A test passes only if the result **matches the Expected Result exactly**. If you're unsure, mark it `⚠️ Blocked` and ask — never guess a Pass.

> 🟢 **Start here:** do **[00 — Smoke & Global Checks](00-smoke-and-global.md)** first. If anything there fails, stop and tell the dev team before continuing.

---

## Status legend (used in every doc)

| Symbol | Meaning |
|--------|---------|
| ✅ | **Pass** — behaves as expected |
| ❌ | **Fail** — does not match expected result (file a bug, put ID in Comments) |
| ⚠️ | **Blocked** — could not test (dependency missing, env down) |
| ➖ | **N/A** — feature not enabled in this environment / not applicable |
| ⬜ | **Not yet tested** (default) |

**Severity (for bugs):** `S1` blocker/data-loss · `S2` major feature broken · `S3` minor · `S4` trivial/cosmetic.

---

## Test environment

| Item | Value |
|------|-------|
| Environment | **UAT only** — do not test on the live production site |
| App URL | AWS Amplify UAT link _(confirm the current link with the dev team before you start)_ |
| Backend | UAT Cognito pool, API Gateway, DynamoDB (`uat`) |
| Build under test | Record the Amplify deploy commit hash at the start of each cycle |
| Payment mode | PhonePe **Sandbox/UAT** only — **NEVER** use production payment credentials |

**Record per cycle:** date, build/commit, tester name, browser/OS.

---

## Test accounts (request all six before starting)

| ID | Type | Role | Used for |
|----|------|------|----------|
| **A1** | Superadmin | `superadmin` | Full system access, configuration, bypasses RBAC |
| **A2** | Admin | `admin` | Operations, catalog management, bookings management |
| **A3** | Lab Tech | `lab_tech` | Home collections, sample tracking |
| **A4** | Doctor | `doctor` | Viewing specific patient records and medical reports |
| **A5** | Patient | `patient` | Standard consumer booking tests, checking own reports/invoices |
| **A6** | Guest | (none) | Unauthenticated browsing of catalog and public pages |

---

## Global pre-conditions (data setup order)

Create shared data in this order so dependent modules have prerequisites:

1. Admin Settings → Lab profile, accreditation info
2. Test Catalog → Categories, then Tests, then Packages
3. Staff accounts (A2–A4 invited by A1)
4. At least one Home Collection booking (for lab-tech collection tests)
5. At least one completed booking to generate a Report and Invoice

---

## What to check on EVERY screen (assume it — don't repeat per row)

- No console errors; no failed network calls (4xx/5xx) in DevTools Network tab.
- **Loading**, **empty**, and **error** states all render correctly.
- Browser back/forward keeps state sane.
- Works on the 3 responsive breakpoints (see [17 — Responsiveness](17-responsiveness.md)).

---

## Module index

| # | Document | Covers |
|---|----------|--------|
| 00 | [Smoke & Global Checks](00-smoke-and-global.md) | Critical path, non-functional, cross-cutting rules |
| 01 | [Auth & Onboarding](01-auth-onboarding.md) | OTP login/sign-up, session management, logout |
| 02 | [RBAC, Staff & Roles](02-rbac-staff-roles.md) | Permissions matrix, role enforcement, no-access paths |
| 03 | [Public Homepage & Marketing](03-public-homepage-marketing.md) | Public marketing pages, nav, hero, CTAs |
| 04 | [Public Catalog & Search](04-public-catalog-search.md) | Test catalog, search, filter, test detail |
| 05 | [Booking Flow](05-booking-flow.md) | End-to-end booking wizard, home collection, PhonePe payment |
| 06 | [Patient Portal](06-patient-portal.md) | Dashboard, my bookings, reports, invoices, profile |
| 07 | [Admin Dashboard & Analytics](07-admin-dashboard-analytics.md) | KPI cards, charts, overview |
| 08 | [Admin Bookings](08-admin-bookings.md) | Booking workspace, status transitions, sample tracking |
| 09 | [Admin Patients](09-admin-patients.md) | Patient CRM list, patient detail, record view |
| 10 | [Admin Catalog](10-admin-catalog.md) | Tests CRUD, packages, categories, pricing |
| 11 | [Admin Reports](11-admin-reports.md) | Report upload, release to patient, report states |
| 12 | [Admin Invoices](12-admin-invoices.md) | Invoice generation, status, download |
| 13 | [Admin Collections](13-admin-collections.md) | Home collection job assignment, lab-tech workflow |
| 14 | [Admin Content (Blog, Reviews, Newsletter)](14-admin-content.md) | Blog CMS, review moderation, newsletter subscribers |
| 15 | [Admin Staff & Settings](15-admin-staff-settings.md) | Platform config, lab profile, equipment, staff management |
| 16 | [Public Site & Legal](16-public-site-legal.md) | Marketing pages, OTP login, legal pages, SEO, analytics, cookie consent |
| 17 | [Responsiveness](17-responsiveness.md) | Breakpoint standard + per-page responsive checklist |

---

## Bug report template

```
Title: [Module] Short summary

Severity: S1 / S2 / S3 / S4
Environment: UAT — <commit/branch>
Browser/Device: Chrome 1xx / desktop 1440px (or 390 / 768)
Account: A1 superadmin / A2 admin / A3 lab-tech / A4 doctor / A5 patient / A6 guest
Test case ID: (e.g. BKG-12) — or "exploratory"

Steps to reproduce:
1.
2.
3.

Expected:
Actual:

Evidence: screenshot / recording / console + network log
Reproducible: always / intermittent (x/y)
Notes / data used:
```

---

## Per-doc structure (so every module reads the same)

Each module doc contains:

- **A. Scope & routes** — what's covered, the URLs.
- **B. Preconditions** — data and accounts needed before testing.
- **C. Test cases** — grouped by page/sub-area, each as a table:
  `| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |`
  Covering: access/permission, navigation, **every button/action**, **every form field** (valid, invalid, required, boundary), search/filter/sort/pagination, empty/loading/error states, and edge cases.
- **D. Responsiveness** — the pages checked at 390 / 768 / 1440 px.
- **E. Sign-off** — tester, date, build, pass count.
