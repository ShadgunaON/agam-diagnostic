# 07 — Admin Dashboard & Analytics

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the admin landing dashboard (KPIs, recent bookings overview) and the dedicated analytics workspace (revenue charts, test distribution, booking trends).

---

## A. Scope & routes

- `/admin` — Admin dashboard home
- `/admin/analytics` — Analytics workspace

---

## B. Preconditions

- A1 (Admin) account logged in.
- At least 5 bookings exist in the system with varied statuses.
- At least some completed bookings with associated invoice amounts (for revenue charts).
- At least 2 different test types in bookings (for distribution chart).

---

## C. Test Cases

### C1. Admin Dashboard — `/admin`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| DASH-1 | [ ] | Dashboard loads | A1: open `/admin` | Dashboard renders; no white screen or errors | ⬜ | |
| DASH-2 | [ ] | KPI — Bookings Today | View KPI cards | "Bookings Today" count renders (0 or more) | ⬜ | |
| DASH-3 | [ ] | KPI — Pending Bookings | View KPI cards | "Pending Bookings" count renders correctly | ⬜ | |
| DASH-4 | [ ] | KPI — Home Collections | View KPI cards | "Home Collections" count renders | ⬜ | |
| DASH-5 | [ ] | KPI — Revenue Today | View KPI cards | Revenue today renders in ₹ format | ⬜ | |
| DASH-6 | [ ] | KPI data accuracy | Compare KPI to actual bookings | Numbers match the real data | ⬜ | |
| DASH-7 | [ ] | Recent bookings list | View dashboard | At least last 4 recent bookings shown | ⬜ | |
| DASH-8 | [ ] | Booking row content | View a booking row | Shows patient name, test, date, collection type, status | ⬜ | |
| DASH-9 | [ ] | Booking status badge color | View bookings with different statuses | Green (Confirmed/Completed), Yellow (Pending/Processing), Red (Cancelled) | ⬜ | |
| DASH-10 | [ ] | Booking row click | Click a booking row | Navigates to that booking's detail in admin | ⬜ | |
| DASH-11 | [ ] | Quick actions | View dashboard quick-action links | Links to Bookings, Patients, Reports, etc. work | ⬜ | |
| DASH-12 | [ ] | Empty state — no bookings | Fresh system with no bookings | Friendly empty state; KPIs show 0 | ⬜ | |
| DASH-13 | [ ] | Unauthenticated access | Visit `/admin` logged out | Redirected to `/login` | ⬜ | |
| DASH-14 | [ ] | Patient can't access | Login as A5; visit `/admin` | Blocked; redirected out | ⬜ | |
| DASH-15 | [ ] | Background gradient | View dashboard | Mesh gradient background renders without visual glitches | ⬜ | |

### C2. Analytics Workspace — `/admin/analytics`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ANA-1 | [ ] | Analytics page loads | A1: open `/admin/analytics` | Page renders; no white screen or errors | ⬜ | |
| ANA-2 | [ ] | KPI cards load | View analytics KPIs | Same KPIs as dashboard (Bookings Today, Pending, Home Collections, Revenue) | ⬜ | |
| ANA-3 | [ ] | Revenue chart renders | View analytics | Revenue by Month bar/line chart renders | ⬜ | |
| ANA-4 | [ ] | Revenue chart data | View revenue chart | Bars/points show non-zero months; empty months hidden or shown as 0 | ⬜ | |
| ANA-5 | [ ] | Revenue format | View chart axis labels | Revenue formatted as ₹Xk or ₹XL (not raw numbers) | ⬜ | |
| ANA-6 | [ ] | Test distribution chart | View analytics | Donut/pie chart of test types renders | ⬜ | |
| ANA-7 | [ ] | Distribution chart data | View distribution | Chart segments match actual test booking distribution | ⬜ | |
| ANA-8 | [ ] | Distribution legend | View distribution chart | Legend shows test names and color keys | ⬜ | |
| ANA-9 | [ ] | Charts with no data | Empty system | Charts show "No data" or empty state; not a crash | ⬜ | |
| ANA-10 | [ ] | Export analytics | Click Export / Download (if available) | CSV or PDF downloads with correct data | ⬜ | |
| ANA-11 | [ ] | Date range filter | Change date range (if available) | Charts update to reflect selected period | ⬜ | |
| ANA-12 | [ ] | Analytics permission gate | A2 (limited staff) opens `/admin/analytics` | Accessible if role has analytics permission; blocked otherwise | ⬜ | |
| ANA-13 | [ ] | Revenue toast actions | Click any action button on analytics | Toast feedback appears correctly | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| DASH-R1 | [ ] | `/admin` — Dashboard | ⬜ | ⬜ | ⬜ | |
| DASH-R2 | [ ] | `/admin/analytics` | ⬜ | ⬜ | ⬜ | |
| DASH-R3 | [ ] | Analytics charts on mobile | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 28 |
| S1/S2 bugs filed | |
