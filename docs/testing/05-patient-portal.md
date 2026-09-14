# 05 — Patient Portal

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the self-service dashboard for patients, tracking their bookings, invoices, and downloading reports.

## A. Preconditions
- Logged in as Patient (A5) who has existing bookings, invoices, and published reports.

## B. Test Cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PTL-1 | [ ] | View Dashboard | Visit `/dashboard` | Shows quick summary of patient's records | ⬜ | |
| PTL-2 | [ ] | My Bookings List | Visit `/bookings` | Lists only the current patient's bookings | ⬜ | |
| PTL-3 | [ ] | Booking Details | Click a specific booking | Shows items, status timeline (Pending -> Confirmed -> Sample Collected) | ⬜ | |
| PTL-4 | [ ] | Download Receipt | On booking detail, click Print/Save PDF | Opens print dialog formatting an invoice cleanly without headers | ⬜ | |
| PTL-5 | [ ] | Missing Transaction ID | View receipt for unpaid booking | Provider transaction ID is omitted or marked N/A | ⬜ | |
| PTL-6 | [ ] | View My Reports | Visit `/reports` | Lists published reports | ⬜ | |
| PTL-7 | [ ] | Hidden Reports | Admin creates report but leaves in "Processing" | Report does NOT appear in patient portal | ⬜ | |
| PTL-8 | [ ] | Download Report | Click download on a report | PDF opens/downloads successfully | ⬜ | |
| PTL-9 | [ ] | Write Review | From a completed booking, click Leave Review | Review form opens, submits to pending state | ⬜ | |
| PTL-10| [ ] | Ineligible Review | Attempt to review a pending booking | Button is disabled or hidden | ⬜ | |
