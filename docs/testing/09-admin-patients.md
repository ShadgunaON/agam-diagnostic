# 09 — Admin Patients

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the patient directory — KPI cards, listing with search/filter/sort, patient detail view and history.

---

## A. Scope & routes

- `/admin/patients` — Patient directory
- `/admin/patients/[patientId]` — Patient detail page

---

## B. Preconditions

- A1 (Admin) logged in.
- At least 10 patients in the system with varied genders and statuses.
- At least 1 patient with multiple bookings and at least 1 released report.
- A2 (limited-permission staff) account to test permission gating.

---

## C. Test Cases

### C1. Patient Directory — Load & KPIs

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| APNT-1 | [ ] | Patients page loads | A1: open `/admin/patients` | Page renders; KPI cards and patient list visible; no errors | ⬜ | |
| APNT-2 | [ ] | KPI — Total Patients | View KPI cards | "Total Patients" shows correct total count | ⬜ | |
| APNT-3 | [ ] | KPI — New This Month | View KPI cards | "New This Month" count is accurate | ⬜ | |
| APNT-4 | [ ] | KPI — Active Bookings | View KPI cards | "Active Bookings" count renders | ⬜ | |
| APNT-5 | [ ] | KPI data accuracy | Cross-check with actual patient records | Numbers match real data | ⬜ | |
| APNT-6 | [ ] | Loading state | Throttle network; open patients | Skeleton/spinner renders while data loads | ⬜ | |
| APNT-7 | [ ] | Empty state | No patients in system | Friendly empty state message | ⬜ | |

### C2. Patient List — Columns & Display

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| APNT-8 | [ ] | Patient row content | View any patient row | Shows: name, phone/email, gender, booking count, status | ⬜ | |
| APNT-9 | [ ] | Status badge | View patients with varied statuses | Active / Inactive badge renders with correct colors | ⬜ | |
| APNT-10 | [ ] | Unique patients only | View list | No duplicate patient entries (de-duplicated by phone/email) | ⬜ | |
| APNT-11 | [ ] | Patient row click | Click a patient row | Navigates to `/admin/patients/[patientId]` | ⬜ | |

### C3. Search

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| APNT-12 | [ ] | Search by name | Type patient name in search | List filters to matching patients | ⬜ | |
| APNT-13 | [ ] | Search by phone | Type phone number | Matching patient shown | ⬜ | |
| APNT-14 | [ ] | Search by email | Type email address | Matching patient shown | ⬜ | |
| APNT-15 | [ ] | Search debounce | Type rapidly | API not called per-keystroke; triggers after ≈500 ms | ⬜ | |
| APNT-16 | [ ] | Search no results | Type unmatch term | Friendly "No patients found" message | ⬜ | |
| APNT-17 | [ ] | Clear search | Clear search field | Full patient list restores | ⬜ | |

### C4. Filter & Sort

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| APNT-18 | [ ] | Filter by gender — Male | Select "Male" filter | Only male patients shown | ⬜ | |
| APNT-19 | [ ] | Filter by gender — Female | Select "Female" filter | Only female patients shown | ⬜ | |
| APNT-20 | [ ] | Filter by gender — All | Select "All" gender | Full list restored | ⬜ | |
| APNT-21 | [ ] | Filter by status — Active | Select "Active" status filter | Only active patients shown | ⬜ | |
| APNT-22 | [ ] | Filter by status — Inactive | Select "Inactive" status filter | Only inactive patients shown | ⬜ | |
| APNT-23 | [ ] | Sort by newest | Select "Newest" sort | Most recently registered patients first | ⬜ | |
| APNT-24 | [ ] | Sort by name | Select name sort (if available) | Alphabetically ordered | ⬜ | |
| APNT-25 | [ ] | Combined filter + sort | Apply gender filter + newest sort | Filtered AND sorted correctly | ⬜ | |
| APNT-26 | [ ] | Pagination | > 10 patients; paginate | Next/prev pages load correctly | ⬜ | |

### C5. Patient Detail — `/admin/patients/[patientId]`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| APNT-27 | [ ] | Patient detail loads | Click a patient | Detail page renders; no errors | ⬜ | |
| APNT-28 | [ ] | Patient info displayed | View detail | Name, phone, email, gender, DOB, registration date visible | ⬜ | |
| APNT-29 | [ ] | Booking history | View detail | All past bookings listed with date, test, status | ⬜ | |
| APNT-30 | [ ] | Booking history — empty | Patient with no bookings | Friendly "No bookings yet" empty state | ⬜ | |
| APNT-31 | [ ] | Reports list | View detail | Released reports shown with download link | ⬜ | |
| APNT-32 | [ ] | Report download | Click download on a report | PDF downloads correctly | ⬜ | |
| APNT-33 | [ ] | Invalid patient ID | Visit `/admin/patients/nonexistent-id` | 404 or "not found"; not a crash | ⬜ | |
| APNT-34 | [ ] | Back navigation | Click Back from detail | Returns to patient list; filters/search preserved | ⬜ | |

### C6. Permission Gating

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| APNT-35 | [ ] | Access with permission | A2 with `patients.view`; open patients | List accessible | ⬜ | |
| APNT-36 | [ ] | Access without permission | A2 without `patients.view`; navigate to `/admin/patients` | Access denied; no patient data visible | ⬜ | |
| APNT-37 | [ ] | Patient can't access admin patients | A5 (patient) visits `/admin/patients` | Blocked; redirected | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| APNT-R1 | [ ] | `/admin/patients` | ⬜ | ⬜ | ⬜ | |
| APNT-R2 | [ ] | `/admin/patients/[patientId]` | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 37 |
| S1/S2 bugs filed | |
