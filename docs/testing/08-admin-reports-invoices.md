# 08 — Admin Reports & Invoices

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers medical result uploads and financial ledger management.

## A. Preconditions
- Logged in as Admin (A2).
- At least one "Processing" report and one "Pending" invoice.

## B. Test Cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RPT-1 | [ ] | Reports List | Visit `/admin/reports` | Paginated list, default sorted by `date_newest` | ⬜ | |
| RPT-2 | [ ] | Empty State Fallback | View a "Processing" report | Renders clean empty state ("Awaiting laboratory results"), NOT fake mock data | ⬜ | |
| RPT-3 | [ ] | Upload Report | Upload a PDF file to a Processing report | File saved to S3. Status remains Processing or moves to Published depending on flow | ⬜ | |
| RPT-4 | [ ] | Publish Report | Click Publish on uploaded report | Status changes to Published. Now visible to Patient. | ⬜ | |
| INV-1 | [ ] | Invoices List | Visit `/admin/invoices` | Paginated list | ⬜ | |
| INV-2 | [ ] | Invoice Details | Click an invoice | Shows all items, total, and Provider Transaction ID if paid via PhonePe | ⬜ | |
| INV-3 | [ ] | Record Payment | Click Record Payment on Unpaid invoice | Invoice changes to Paid. Booking synced. | ⬜ | |
| INV-4 | [ ] | Print PDF | Click "Print / Save PDF" | Dialog opens, admin sidebar is hidden | ⬜ | |
