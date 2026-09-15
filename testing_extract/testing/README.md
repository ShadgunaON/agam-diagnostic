# OrbitNexa — Manual Testing Suite

This folder is the **complete manual test suite** for OrbitNexa. It is split into one document per module so a tester can pick up a single file and exhaustively test that module — every page, every button, every field, every state — and record results inline.

Each test case has a **Status** column (mark Pass/Fail/Blocked/N-A) and a **Comments** column (free notes, bug links, screenshots). Tick the checkbox when a case is done.

---

## First-time tester — 5-minute setup (read this if you're new)

New to testing? Don't worry — you don't need to write any code. You just **use the app like a normal user, compare what happens to the "Expected Result", and write down Pass or Fail.** Here's everything you need:

**1. What you need before you start**
- Use **Google Chrome** (clean results; avoid Brave/ad-blockers — they block analytics and cause false failures).
- The **UAT App URL** (in the table below) — this is the *only* site you test. Never test on the real `orbitnexa.com`.
- Your **5 test accounts** (A1–A5 below) — ask the dev team for the emails and passwords.

**2. Two browser tricks you'll use constantly**
- **Incognito window** (`Ctrl+Shift+N`): a fresh, logged-out browser with no memory — use it whenever a test says "fresh session" or "logged out".
- **DevTools** (`F12`): a panel that shows what the page is doing. You'll mostly use two tabs inside it:
  - **Console** — should have *no red errors* on normal use.
  - **Network** — should have *no red (failed) requests* on normal use.
  - To close it, press `F12` again.

**3. How to do one test case**
1. Read the **Steps** and do exactly that in the app.
2. Compare what you see to the **Expected Result**.
3. In the **Status** column, put `✅` (works) or `❌` (broken). If broken, also note it in **Comments**.
4. Put `[x]` in the `✓` box to mark the row done.
5. If something breaks, take a **screenshot** (`Windows key + Shift + S`), save it, and file a bug using the template at the bottom of this file.

**4. What "Pass" means**
A test passes only if the result **matches the Expected Result exactly**. If you're unsure, mark it `⚠️ Blocked` and ask — never guess a Pass.

> 🟢 **Start here:** do **[00 — Smoke & Global Checks](00-smoke-and-global.md)** first. If anything there fails, stop and tell the dev team before continuing.

---

## How to use this suite

1. Read **§ Test environment** and **§ Test accounts** below and get your accounts/URL from the dev team.
2. Run **[00 — Smoke & Global Checks](00-smoke-and-global.md)** first. If smoke fails, stop and report.
3. Work through one module doc at a time. For each test case:
   - Follow the steps exactly.
   - Compare against the **Expected Result**.
   - Set **Status** and add **Comments** (and a bug ID if it failed).
   - Tick the row's checkbox `[x]` when done.
4. Every module doc ends with a **Responsiveness** section and a **Sign-off** block — complete both.
5. Cross-cutting behavior (permissions, money privacy, responsiveness rules) is defined once in the global docs and referenced from each module.

> **Editing tip:** these are Markdown tables. Edit in VS Code (or any text editor). To track results in a spreadsheet instead, ask the dev to export — the tables convert cleanly to CSV. A status legend is repeated at the top of every doc.

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
| Environment | **UAT only** — do not test on the live `orbitnexa.com` (production) |
| App URL | **https://uat.d3u4bmo1qqaxmq.amplifyapp.com** _(confirm the current UAT link with the dev team before you start)_ |
| Backend | UAT Cognito pool, API Gateway, DynamoDB (`uat`) |
| Build under test | Amplify auto-deploys the `uat` branch — record the commit hash on each cycle |
| Logs | CloudWatch (ask dev for dashboard link) |

**Record per cycle:** date, build/commit, tester name, browser/OS.

---

## Test accounts (request all five before starting)

| ID | Type | Email domain | Used for |
|----|------|--------------|----------|
| **A1** | Administrator (wildcard `*`) | `@orbitnexa.com` | Setup, inviting others, full-access tests |
| **A2** | Internal — Finance group | `@orbitnexa.com` | Scoped access + segregation-of-duties checks |
| **A3** | Internal — Employee (HR-linked) | `@orbitnexa.com` | Self-service HR, own payslips/expenses |
| **A4** | External — view-only | non-`@orbitnexa.com` | Read-only ceiling enforcement |
| **A5** | Client portal user | any | Portal-only, single-client data scope |
| **A6** | Internal — **project-scoped** + UI-restricted | `@orbitnexa.com` | Per-user project allowlist, hidden tabs, forced money-mask (doc 02 C6/C7) |

> The app is **invite-only** (no self-signup). A1 invites A2–A6 from **Settings → Users**. A6 is created during RBAC testing (doc 02) — give it `projects.view` but restrict it to 1–2 projects.

---

## Global pre-conditions (data setup order)

Create shared data in this order so dependent modules have prerequisites:

1. Settings → Company profile, Currencies, HSN/SAC codes, Payroll tax slabs
2. Departments
3. Clients
4. Vendors
5. Projects (need a client)
6. Employees (need a department) → Employee salary records
7. Invoices / Estimates (need client + project + HSN + currency)
8. Expenses (need vendor/category/department)
9. Payroll run (needs employees + salary + attendance/leave for the period)

---

## What to check on EVERY screen (don't repeat per row — assume it)

- No console errors; no failed network calls (4xx/5xx) in the Network tab.
- **Loading**, **empty**, and **error** states all render correctly.
- Money values respect **privacy mode** (see [00 — Global](00-smoke-and-global.md#money-privacy)).
- Breadcrumbs (section/page chips) correct.
- Works on the 3 responsive breakpoints (see [19 — Responsiveness](19-responsiveness.md)).
- Browser back/forward keeps state sane.

---

## Module index

| # | Document | Covers |
|---|----------|--------|
| 00 | [Smoke & Global Checks](00-smoke-and-global.md) | Critical path, non-functional, money privacy, notifications |
| 01 | [Auth & Onboarding](01-auth-onboarding.md) | Login, reset password, invites, accept-invite, consent |
| 02 | [RBAC, Roles, Groups & Access](02-rbac-roles-groups.md) | Permissions, groups, no-access, audit of access |
| 03 | [External & Client Portal Users](03-external-client-portal.md) | View-only ceiling, client portal scoping |
| 04 | [Clients](04-clients.md) | Client CRUD, detail, export |
| 05 | [Projects](05-projects.md) | Project CRUD, milestones, status |
| 06 | [Employees, Profile & Departments](06-employees-profile.md) | Employee CRUD, self-profile, departments |
| 07 | [Invoices](07-invoices.md) | Invoice CRUD, GST math, statuses, public render |
| 08 | [Estimates & Payments](08-estimates-payments.md) | Estimates, convert, payments |
| 09 | [Expenses](09-expenses.md) | Expense CRUD, approvals, bulk import, recurring |
| 10 | [Vendors](10-vendors.md) | Vendor CRUD, default department, bank masking |
| 11 | [Accounting & Budgets](11-accounting-budgets.md) | Budgets, budget performance, categories |
| 12 | [Payroll](12-payroll.md) | Salary config, runs, LOP, payslip PDF, tax simulator |
| 13 | [HR — Leave, Attendance, Probation](13-hr.md) | Leave, attendance, corrections, holidays, probation |
| 14 | [Tasks, Submissions & Recruitment](14-tasks-submissions.md) | Tasks, contact inbox, subscribers, applications |
| 15 | [Settings](15-settings.md) | Company, currencies, HSN, payroll-taxes, users, groups, audit |
| 16 | [Content Management](16-content.md) | Blog, case studies, services, industries, careers |
| 17 | [Public Site & Legal](17-public-legal.md) | Marketing pages, forms, consent, legal pages, analytics |
| 19 | [Responsiveness](19-responsiveness.md) | Breakpoint standard + per-page responsive checklist |

---

## Bug report template

```
Title: [Module] Short summary

Severity: S1 / S2 / S3 / S4
Environment: UAT — <commit/branch>
Browser/Device: Chrome 1xx / desktop 1440px (or 390 / 768)
Account: A1 admin / A2 finance / A3 employee / A4 external / A5 client
Test case ID: (e.g. INV-12) — or "exploratory"

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
- **B. Preconditions** — data needed before testing.
- **C. Test cases** — grouped by page/sub-area, each as a table:
  `| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |`
  Covering: access/permission, navigation, **every button/action**, **every form field** (valid, invalid, required, boundary), search/filter/sort/pagination, empty/loading/error states, and edge cases.
- **D. Responsiveness** — the page checked at 390 / 768 / 1440 px.
- **E. Sign-off** — tester, date, build, pass count.
