# 19 — Responsiveness (Global Standard + Checklist)

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

This document defines **how** to test responsiveness and provides a **per-page checklist**. Every module doc also has its own short Responsiveness section — this is the master reference.

---

## A. Breakpoints to test

Use Chrome DevTools device toolbar (Ctrl/Cmd+Shift+M). Test each page at all three:

| Code | Width | Represents | Notes |
|------|-------|-----------|-------|
| **M** (Mobile) | **390 px** | iPhone 12/13/14 | Most demanding; sidebar should collapse to a drawer/hamburger |
| **T** (Tablet) | **768 px** | iPad portrait | Hybrid layout; tables often switch to cards or scroll |
| **D** (Desktop) | **1440 px** | Laptop (primary) | Full layout — the baseline |

Also spot-check **320 px** (smallest) and **1920 px** (large monitor) on key pages.

---

## B. What "responsive pass" means — check on every page

| # | ✓ | Check | Expected | M | T | D | Comments |
|---|---|-------|----------|---|---|---|----------|
| R-1 | [ ] | No horizontal scroll | Page never scrolls sideways (unless a table has an intentional internal scroll) | ⬜ | ⬜ | ⬜ | |
| R-2 | [ ] | No overlap/clipping | Text, buttons, icons never overlap or get cut off | ⬜ | ⬜ | ⬜ | |
| R-3 | [ ] | Sidebar/nav | Collapses to hamburger/drawer on M; drawer opens/closes; overlay dismisses | ⬜ | ⬜ | ⬜ | |
| R-4 | [ ] | Tables | Switch to cards OR scroll horizontally inside their container (page itself doesn't scroll) | ⬜ | ⬜ | ⬜ | |
| R-5 | [ ] | Forms | Fields stack vertically; labels readable; inputs full-width and tappable | ⬜ | ⬜ | ⬜ | |
| R-6 | [ ] | Modals/dialogs | Fit the viewport; scroll internally; close button reachable; not taller than screen | ⬜ | ⬜ | ⬜ | |
| R-7 | [ ] | Tap targets | Buttons/links ≥ ~40px; not too close together to tap | ⬜ | ⬜ | ⬜ | |
| R-8 | [ ] | Top bar | Privacy toggle, notifications bell, user menu all reachable on M | ⬜ | ⬜ | ⬜ | |
| R-9 | [ ] | Charts/dashboards | Resize to fit; legends/labels not clipped; no overflow | ⬜ | ⬜ | ⬜ | |
| R-10 | [ ] | Long content | Long names/emails/amounts truncate or wrap, never break layout | ⬜ | ⬜ | ⬜ | |
| R-11 | [ ] | Images/logos | Scale proportionally; no distortion | ⬜ | ⬜ | ⬜ | |
| R-12 | [ ] | Sticky elements | Headers/action bars/footers stay usable, don't cover content | ⬜ | ⬜ | ⬜ | |
| R-13 | [ ] | Orientation | Rotate mobile to landscape — layout still works | ⬜ | ⬜ | ⬜ | |
| R-14 | [ ] | Keyboard (mobile) | On-screen keyboard doesn't hide the field being typed in | ⬜ | ⬜ | ⬜ | |
| R-15 | [ ] | Dark theme | Contrast holds at every breakpoint; nothing unreadable | ⬜ | ⬜ | ⬜ | |

---

## C. Per-page responsive checklist

Run B-1…B-15 against each of these. Mark the overall result per page; log specifics in module docs.

| Page / route | M (390) | T (768) | D (1440) | Comments |
|--------------|---------|---------|----------|----------|
| `/login`, `/reset-password`, `/auth/accept-invite` | ⬜ | ⬜ | ⬜ | |
| `/app` dashboard + analytics | ⬜ | ⬜ | ⬜ | |
| `/app/clients` list + new + detail | ⬜ | ⬜ | ⬜ | |
| `/app/projects` list + new + detail + edit | ⬜ | ⬜ | ⬜ | |
| `/app/employees` list + new + detail + edit | ⬜ | ⬜ | ⬜ | |
| `/app/profile` | ⬜ | ⬜ | ⬜ | |
| `/app/departments` | ⬜ | ⬜ | ⬜ | |
| `/app/finance/sales/invoices` list + new + detail + edit | ⬜ | ⬜ | ⬜ | |
| `/invoice/render/[id]` (public PDF view) | ⬜ | ⬜ | ⬜ | |
| `/app/finance/sales/estimates` + `/payments` | ⬜ | ⬜ | ⬜ | |
| `/app/finance/expenses` list + new + detail + import + recurring + approvals | ⬜ | ⬜ | ⬜ | |
| `/app/vendors` list + add + detail | ⬜ | ⬜ | ⬜ | |
| `/app/finance/accounting/budgets` + budget-performance | ⬜ | ⬜ | ⬜ | |
| `/app/finance/payroll` runs + generate + detail + payslips | ⬜ | ⬜ | ⬜ | |
| `/app/hr/*` (attendance, leave, calendar, holidays, probation, reports) | ⬜ | ⬜ | ⬜ | |
| `/app/leaves` + `/app/attendance` | ⬜ | ⬜ | ⬜ | |
| `/app/tasks` + `/app/submissions` + `/app/subscribers` + `/app/job-applications` | ⬜ | ⬜ | ⬜ | |
| `/app/settings/*` (company, currencies, hsn-sac, payroll-taxes, users, groups, audit) | ⬜ | ⬜ | ⬜ | |
| `/app/content/*` (blog, case-studies, services, industries, careers) | ⬜ | ⬜ | ⬜ | |
| Public: `/`, `/about`, `/contact`, `/careers`, `/products`, `/services`, `/industries`, `/resources`, `/demo`, `/start-project` | ⬜ | ⬜ | ⬜ | |
| Legal: `/terms`, `/privacy`, `/refund-policy` (scrollspy TOC) | ⬜ | ⬜ | ⬜ | |

---

## D. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Devices/browsers used | |
| Pages passing all breakpoints | __ / __ |
| S1/S2 responsive bugs filed | |
