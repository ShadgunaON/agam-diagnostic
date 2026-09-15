# 13 — Admin Collections (Home Collection Management)

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the admin home-collection workspace — viewing, filtering, and managing home-collection bookings, assigning phlebotomists, and tracking collection status.

---

## A. Scope & routes

- `/admin/collections` — Home Collection management workspace

---

## B. Preconditions

- A1 (Admin) logged in.
- At least 5 home-collection bookings in mixed statuses (Scheduled, Collected, Cancelled).
- At least 1 phlebotomist / collection staff in the system (if assignment feature exists).

---

## C. Test Cases

### C1. Collections Page — Load & Layout

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| COL-1 | [ ] | Collections page loads | A1: open `/admin/collections` | Page renders; home-collection bookings listed; no errors | ⬜ | |
| COL-2 | [ ] | Only home collections shown | View list | All items in list are Home Collection type; no Lab Visit items | ⬜ | |
| COL-3 | [ ] | Collection row content | View any row | Shows: patient name, address, scheduled date/time, status | ⬜ | |
| COL-4 | [ ] | Status badge | View rows | Correct status badges (Scheduled, In-Progress, Collected, Cancelled) | ⬜ | |
| COL-5 | [ ] | Loading state | Slow network | Skeleton/spinner renders | ⬜ | |
| COL-6 | [ ] | Empty state | No home collections | Friendly empty state | ⬜ | |

### C2. Filter, Sort & Search

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| COL-7 | [ ] | Filter by status — Scheduled | Select "Scheduled" | Only scheduled collections shown | ⬜ | |
| COL-8 | [ ] | Filter by status — Collected | Select "Collected" | Only completed collections shown | ⬜ | |
| COL-9 | [ ] | Filter by date | Select a specific date | Only collections for that date shown | ⬜ | |
| COL-10 | [ ] | Sort by date — ascending | Sort ascending | Earliest collection first | ⬜ | |
| COL-11 | [ ] | Sort by date — descending | Sort descending | Latest collection first | ⬜ | |
| COL-12 | [ ] | Search by patient name | Type name in search | Matching collections shown | ⬜ | |
| COL-13 | [ ] | Search by address area | Type area/locality | If supported, matching items shown | ⬜ | |
| COL-14 | [ ] | Clear filters | Reset all | Full collection list restores | ⬜ | |
| COL-15 | [ ] | Pagination | > page-size items | Pagination works correctly | ⬜ | |

### C3. Collection Assignment

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| COL-16 | [ ] | Assign phlebotomist | Select a collection; assign staff | Staff assigned; shown on collection row | ⬜ | |
| COL-17 | [ ] | Re-assign phlebotomist | Change assigned staff | New staff shown; old assignment replaced | ⬜ | |
| COL-18 | [ ] | Unassigned collections | Filter for unassigned (if available) | Shows collections with no assigned staff | ⬜ | |
| COL-19 | [ ] | Assignment saves | Assign staff; reload page | Assignment persists after reload | ⬜ | |

### C4. Status Management

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| COL-20 | [ ] | Mark as Collected | On Scheduled item; click "Mark Collected" | Status changes to Collected | ⬜ | |
| COL-21 | [ ] | Mark collected — confirmation | Click action | Confirm dialog appears | ⬜ | |
| COL-22 | [ ] | Cancel a collection | Click Cancel on Scheduled item | Status changes to Cancelled; reason optional | ⬜ | |
| COL-23 | [ ] | Cannot un-cancel | Cancelled collection | No "re-schedule" or status reversal without admin override | ⬜ | |
| COL-24 | [ ] | Status update toast | After any status change | Toast confirms success or shows error | ⬜ | |
| COL-25 | [ ] | Status persists | Change status; reload | New status still shown | ⬜ | |

### C5. Collection Detail (if applicable)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| COL-26 | [ ] | View collection detail | Click a collection row | Expanded detail or side panel shows full info | ⬜ | |
| COL-27 | [ ] | Patient address | View detail | Full collection address shown (street, area, city, pincode) | ⬜ | |
| COL-28 | [ ] | Special instructions | View detail | Patient's additional notes/instructions shown (if entered at booking) | ⬜ | |
| COL-29 | [ ] | Patient contact info | View detail | Patient phone/email accessible for coordination | ⬜ | |

### C6. Permission Gating

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| COL-30 | [ ] | View with permission | A2 with `collections.view`; open `/admin/collections` | Collections visible; assignment/status actions may be hidden | ⬜ | |
| COL-31 | [ ] | No access | A2 without `collections` permission; navigate to route | Access denied; no data shown | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| COL-R1 | [ ] | `/admin/collections` — list view | ⬜ | ⬜ | ⬜ | |
| COL-R2 | [ ] | `/admin/collections` — detail panel | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 31 |
| S1/S2 bugs filed | |
