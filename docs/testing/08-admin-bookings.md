# 08 — Admin Bookings

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the admin bookings workspace — the main list view with tabs, search, cursor-based pagination, status management, creating a booking from admin, and accessing booking detail.

---

## A. Scope & routes

- `/admin/bookings` — Bookings workspace (tabs: All / Home Collection / Lab Visit)
- `/admin/bookings/create` — Create a new booking from admin

---

## B. Preconditions

- A1 (Admin) logged in.
- At least 10 bookings in mixed statuses (Pending, Confirmed, Completed, Cancelled).
- At least 2 Home Collection and 2 Lab Visit bookings.
- A patient account (A5) available as the linked patient for create-booking tests.
- Active tests/packages available in the catalog.

---

## C. Test Cases

### C1. Bookings List — Load & Layout

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ABKG-1 | [ ] | Bookings page loads | A1: open `/admin/bookings` | Page renders; list of bookings visible; no errors | ⬜ | |
| ABKG-2 | [ ] | Booking row content | View any booking row | Shows: patient name, test(s), date, time, collection type, status badge | ⬜ | |
| ABKG-3 | [ ] | Status badge colors | View rows with varied statuses | Green = Confirmed/Completed, Yellow = Pending/Processing, Red = Cancelled | ⬜ | |
| ABKG-4 | [ ] | Loading state | On slow connection (throttle) | Skeleton/spinner shows while list loads | ⬜ | |
| ABKG-5 | [ ] | Empty state | System with no bookings | Friendly empty state message | ⬜ | |

### C2. Tabs — All / Home Collection / Lab Visit

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ABKG-6 | [ ] | All tab | Click "All" tab | Shows every booking regardless of type | ⬜ | |
| ABKG-7 | [ ] | Home Collection tab | Click "Home Collection" tab | Shows only Home Collection bookings | ⬜ | |
| ABKG-8 | [ ] | Lab Visit tab | Click "Lab Visit" tab | Shows only Lab Visit bookings | ⬜ | |
| ABKG-9 | [ ] | Tab count badges | View each tab | Count badge reflects correct number for that tab | ⬜ | |
| ABKG-10 | [ ] | Tab state resets search | Switch tabs | Search/filter resets to show correct subset | ⬜ | |

### C3. Search

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ABKG-11 | [ ] | Search by patient name | Type patient name | List filters to matching bookings | ⬜ | |
| ABKG-12 | [ ] | Search by test name | Type test name | List filters to bookings containing that test | ⬜ | |
| ABKG-13 | [ ] | Search by phone | Type patient phone (if supported) | Matches are shown | ⬜ | |
| ABKG-14 | [ ] | Search debounce | Type rapidly | API called only after ≈500 ms pause; no per-keystroke calls | ⬜ | |
| ABKG-15 | [ ] | Search no results | Type an unmatched term | Friendly "no bookings found" message | ⬜ | |
| ABKG-16 | [ ] | Clear search | Clear search input | Full list reloads | ⬜ | |

### C4. Sort

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ABKG-17 | [ ] | Sort newest first | Select "Date: Newest" sort | Most recent bookings at top | ⬜ | |
| ABKG-18 | [ ] | Sort oldest first | Select "Date: Oldest" sort | Oldest bookings at top | ⬜ | |
| ABKG-19 | [ ] | Sort by status | Select status sort (if available) | Grouped or sorted by status | ⬜ | |

### C5. Cursor-based Pagination

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ABKG-20 | [ ] | Next page | If > page limit (e.g. 20) bookings; click Next | Next set of bookings loads | ⬜ | |
| ABKG-21 | [ ] | Previous page | On page 2+; click Previous | Previous bookings reload | ⬜ | |
| ABKG-22 | [ ] | Last page — no Next | On last page | Next button disabled or hidden | ⬜ | |
| ABKG-23 | [ ] | First page — no Prev | On first page | Previous button disabled or hidden | ⬜ | |
| ABKG-24 | [ ] | Filter + pagination | Apply filter; paginate | Pagination stays within filtered results | ⬜ | |

### C6. Status Management

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ABKG-25 | [ ] | Confirm a pending booking | On a Pending booking, click Confirm | Status changes to Confirmed; badge updates | ⬜ | |
| ABKG-26 | [ ] | Complete a booking | On a Confirmed booking, click Complete | Status changes to Completed | ⬜ | |
| ABKG-27 | [ ] | Cancel a booking | Click Cancel on an upcoming booking | Status changes to Cancelled; confirmation prompt shown | ⬜ | |
| ABKG-28 | [ ] | Cancel confirmation | Click Cancel; confirm in dialog | Booking cancelled; cannot be reversed without re-booking | ⬜ | |
| ABKG-29 | [ ] | Cannot re-confirm cancelled | Try to confirm a Cancelled booking | Action not available | ⬜ | |
| ABKG-30 | [ ] | Status update persists | Change status; reload page | New status still shown | ⬜ | |
| ABKG-31 | [ ] | Status update — permission | A2 (limited staff) tries to change status without permission | Action blocked; button hidden or error shown | ⬜ | |

### C7. Create Booking — `/admin/bookings/create`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ABKG-32 | [ ] | Create page loads | A1: open `/admin/bookings/create` | Create booking form renders; no errors | ⬜ | |
| ABKG-33 | [ ] | Patient selection | Search and select a patient | Patient name and contact pre-fills | ⬜ | |
| ABKG-34 | [ ] | New patient entry | Enter new patient details | Form accepts new patient data | ⬜ | |
| ABKG-35 | [ ] | Test selection | Select a test/package | Test added to order; price shown | ⬜ | |
| ABKG-36 | [ ] | Collection type | Select Home or Lab | Appropriate fields (address or lab info) appear | ⬜ | |
| ABKG-37 | [ ] | Date & slot | Pick date and slot | Selected slot shown in summary | ⬜ | |
| ABKG-38 | [ ] | Required fields validation | Submit with missing required fields | Inline errors; blocked | ⬜ | |
| ABKG-39 | [ ] | Save booking | Fill all fields; click Save | Booking created; appears in bookings list | ⬜ | |
| ABKG-40 | [ ] | Double-save guard | Click Save twice rapidly | Only one booking created | ⬜ | |
| ABKG-41 | [ ] | Cancel creation | Click Cancel / Back | Returns to list; no booking created | ⬜ | |
| ABKG-42 | [ ] | Create — permission gate | A2 without `bookings.create` permission | Create button hidden or page access denied | ⬜ | |

### C8. 401 / 403 / 500 Error States

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ABKG-43 | [ ] | 401 — session expired | Let session expire; open bookings | Re-auth prompt or redirect to login | ⬜ | |
| ABKG-44 | [ ] | 403 — no permission | Staff with no bookings.view permission visits `/admin/bookings` | Access denied UI; no booking data exposed | ⬜ | |
| ABKG-45 | [ ] | 500 — server error | Simulate a server failure | Error message shown; no white screen | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| ABKG-R1 | [ ] | `/admin/bookings` — list | ⬜ | ⬜ | ⬜ | |
| ABKG-R2 | [ ] | `/admin/bookings` — search active | ⬜ | ⬜ | ⬜ | |
| ABKG-R3 | [ ] | `/admin/bookings/create` | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 45 |
| S1/S2 bugs filed | |
