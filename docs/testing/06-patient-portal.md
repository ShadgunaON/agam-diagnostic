# 06 — Patient Portal

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the authenticated patient-facing portal — dashboard, lab reports list and download, patient profile management, and booking history.

---

## A. Scope & routes

- `/dashboard` — Patient portal home (KPIs, recent bookings, quick actions)
- `/reports` — Patient's lab reports listing
- `/profile` — Patient profile / account settings
- `/bookings/[bookingId]` — Individual booking status (also covered in 05-booking-flow)

---

## B. Preconditions

- A5 (Patient) account logged in.
- At least 1 completed booking exists for A5.
- At least 1 lab report released and associated with A5.
- A second patient account (A6) available to verify data isolation.

---

## C. Test Cases

### C1. Patient Dashboard — `/dashboard`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PAT-1 | [ ] | Dashboard loads | Log in as A5; open `/dashboard` | Page renders; no white screen or console errors | ⬜ | |
| PAT-2 | [ ] | KPI / summary cards | View dashboard | Booking count, pending reports, or summary stats visible | ⬜ | |
| PAT-3 | [ ] | Recent bookings list | View dashboard | Recent bookings shown with date, test name, status | ⬜ | |
| PAT-4 | [ ] | Booking status badge | View a booking row | Status badge (Pending / Confirmed / Completed / Cancelled) correct | ⬜ | |
| PAT-5 | [ ] | Booking row click | Click a recent booking | Navigates to `/bookings/[bookingId]` with correct details | ⬜ | |
| PAT-6 | [ ] | Quick book CTA | Click "Book a Test" on dashboard | Navigates to booking wizard | ⬜ | |
| PAT-7 | [ ] | View reports CTA | Click "My Reports" / "View Reports" on dashboard | Navigates to `/reports` | ⬜ | |
| PAT-8 | [ ] | Empty state — no bookings | New A5 account with no bookings | Friendly empty state for bookings section | ⬜ | |
| PAT-9 | [ ] | Dashboard data isolation | A5 dashboard | Shows only A5's bookings — no other patient's data | ⬜ | |
| PAT-10 | [ ] | Unauthenticated access | Visit `/dashboard` logged out | Redirected to `/login` | ⬜ | |

### C2. Lab Reports — `/reports`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PAT-11 | [ ] | Reports page loads | Log in as A5; open `/reports` | Reports list renders; no console errors | ⬜ | |
| PAT-12 | [ ] | Report card content | View any report | Shows: test name, date, status (Ready / Pending) | ⬜ | |
| PAT-13 | [ ] | Only own reports shown | View reports page | Only A5's reports visible; no other patient's reports | ⬜ | |
| PAT-14 | [ ] | Pending report | Report not yet released | Status shows "Pending" or "Processing"; no download button | ⬜ | |
| PAT-15 | [ ] | Ready report | Released report | Status shows "Ready"; download button/link visible | ⬜ | |
| PAT-16 | [ ] | Download report — PDF | Click download on a ready report | PDF downloads correctly; file is not corrupted | ⬜ | |
| PAT-17 | [ ] | Download report — contents | Open downloaded PDF | Contains correct patient name, test name, values, doctor signature | ⬜ | |
| PAT-18 | [ ] | View report online | Click "View" (if available) | Report preview modal or page renders | ⬜ | |
| PAT-19 | [ ] | Empty reports state | A5 with no released reports | Friendly "No reports yet" empty state | ⬜ | |
| PAT-20 | [ ] | Search / filter reports | Type test name in search (if available) | Filters report list | ⬜ | |
| PAT-21 | [ ] | Reports — unauthenticated | Visit `/reports` logged out | Redirected to `/login` | ⬜ | |
| PAT-22 | [ ] | Reports — cross-patient access | A5 visits a report URL belonging to A6 | Access denied; A6's report not shown | ⬜ | |

### C3. Patient Profile — `/profile`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PAT-23 | [ ] | Profile page loads | Log in as A5; open `/profile` | Profile form renders with current data; no errors | ⬜ | |
| PAT-24 | [ ] | Profile data pre-filled | View profile | Name, phone/email, DOB, gender pre-populated | ⬜ | |
| PAT-25 | [ ] | Edit name | Clear name, type new name; save | Name updated; success toast shown | ⬜ | |
| PAT-26 | [ ] | Name required | Clear name; save | Inline required error | ⬜ | |
| PAT-27 | [ ] | Edit date of birth | Change DOB; save | DOB updated correctly | ⬜ | |
| PAT-28 | [ ] | Future DOB | Enter tomorrow as DOB | Validation error; rejected | ⬜ | |
| PAT-29 | [ ] | Edit gender | Change gender; save | Gender updated | ⬜ | |
| PAT-30 | [ ] | Phone / email read-only | View phone/email field | If primary identifier is locked, it should be read-only (or show change flow) | ⬜ | |
| PAT-31 | [ ] | Save changes | Edit multiple fields; click Save | All changes persisted; success toast | ⬜ | |
| PAT-32 | [ ] | Discard changes | Edit fields; navigate away without saving | Warns about unsaved changes (if implemented) OR changes not saved | ⬜ | |
| PAT-33 | [ ] | Profile — unauthenticated | Visit `/profile` logged out | Redirected to `/login` | ⬜ | |
| PAT-34 | [ ] | Profile avatar (if shown) | View profile | Avatar or initials renders; no broken image | ⬜ | |

### C4. Booking History (from Dashboard/Portal)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PAT-35 | [ ] | Booking history accessible | From dashboard or profile | Full list of past bookings visible | ⬜ | |
| PAT-36 | [ ] | Booking statuses correct | View past bookings | Each booking shows correct status | ⬜ | |
| PAT-37 | [ ] | Cancel booking (if allowed) | Click Cancel on an upcoming booking | Booking cancelled; status updates to Cancelled | ⬜ | |
| PAT-38 | [ ] | Cannot cancel past booking | Try to cancel a completed booking | Option not available; blocked | ⬜ | |
| PAT-39 | [ ] | Re-book a test | From a completed booking, click "Re-book" (if available) | Opens booking wizard with same test pre-selected | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| PAT-R1 | [ ] | `/dashboard` | ⬜ | ⬜ | ⬜ | |
| PAT-R2 | [ ] | `/reports` | ⬜ | ⬜ | ⬜ | |
| PAT-R3 | [ ] | `/profile` | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 39 |
| S1/S2 bugs filed | |
