# 07 — Admin Operations (Bookings & Collections)

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the management of bookings, lifecycle state transitions, and home collections.

## A. Preconditions
- Logged in as Admin (A2).
- Pending and Confirmed bookings exist.

## B. Test Cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| OPS-1 | [ ] | Bookings List | Visit `/admin/bookings` | Paginated list, default sorted by `date_newest` | ⬜ | |
| OPS-2 | [ ] | Filter & Search | Use search bar and tabs (All, Confirmed, etc.) | Results update instantly and correctly | ⬜ | |
| OPS-3 | [ ] | Booking Details | Open a specific booking | Shows patient info, items, invoice status, and current workflow state | ⬜ | |
| OPS-4 | [ ] | Status Transition | Change booking to "Sample Collected" | DB updates. A downstream Report task is generated automatically. | ⬜ | |
| OPS-5 | [ ] | Invalid Transition | Attempt to transition backwards | UI handles errors if backend rejects | ⬜ | |
| OPS-6 | [ ] | Collections List | Visit `/admin/collections` | Paginated list, sorted by newest | ⬜ | |
| OPS-7 | [ ] | Collection Update | Mark collection task as Completed | Task updates. If linked to a booking, booking state may advance. | ⬜ | |
| OPS-8 | [ ] | Manual Collection | Create/edit collection without a booking | Does not crash; Report is generated even for manual collections | ⬜ | |
