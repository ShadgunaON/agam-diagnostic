# 08 — Estimates & Payments

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Estimates/quotes (with the same line-item + GST engine as invoices) and their conversion to invoices, plus the received-payments ledger. Governed by `invoices.estimates.*` and `invoices.payments.*`.

> Estimates share the invoice calculation model — for GST/total verification details see [07 — Invoices](07-invoices.md#c3-gst--totals-verify-by-hand).

## A. Scope & routes

- `/app/finance/sales/estimates` — list.
- `/app/finance/sales/estimates/new` — create.
- `/app/finance/sales/estimates/[id]` — view (+ convert).
- `/app/finance/sales/estimates/[id]/edit` — edit.
- `/app/finance/sales/payments` — list.
- `/app/finance/sales/payments/new` — record payment.
- `/app/finance/sales/payments/[id]` — view.
- `/app/finance/sales/payments/[id]/edit` — edit.

## B. Preconditions

- A client (and ideally an issued invoice) to attach payments to.
- A1 + Finance user with estimate/payment permissions.

## C. Test cases

### C1. Estimates list

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EST-1 | [ ] | List loads | Open estimates list | Renders with statuses/amounts | ⬜ | |
| EST-2 | [ ] | Empty/loading/error | No data / throttle / fail | Each state renders | ⬜ | |
| EST-3 | [ ] | Search / filter / sort / paginate | Exercise each | Correct results; config persists | ⬜ | |
| EST-4 | [ ] | Money privacy | Mask ON | Amounts masked | ⬜ | |
| EST-5 | [ ] | New button | Click New estimate | Opens form | ⬜ | |

### C2. Create / edit estimate

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EST-6 | [ ] | Required fields | Submit empty | Inline errors | ⬜ | |
| EST-7 | [ ] | Client + validity date | Select client; set valid-until date | Saved; date validated | ⬜ | |
| EST-8 | [ ] | Line items | Add/edit/remove lines (desc, HSN, qty, rate, tax) | Rows + totals update | ⬜ | |
| EST-9 | [ ] | GST/totals | Verify subtotal/tax/total | Matches hand calc (see [07 §C3](07-invoices.md#c3-gst--totals-verify-by-hand)) | ⬜ | |
| EST-10 | [ ] | Save draft | Save | In list with correct status | ⬜ | |
| EST-11 | [ ] | Edit recalculates | Edit a line | Totals recompute & persist | ⬜ | |
| EST-12 | [ ] | Cancel/double-submit | Cancel; save twice | Guarded; one record | ⬜ | |

### C3. Estimate statuses & convert

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EST-13 | [ ] | Send estimate | Mark/send | Status updates | ⬜ | |
| EST-14 | [ ] | Accept/reject | Mark accepted/rejected (if supported) | Status updates | ⬜ | |
| EST-15 | [ ] | **Convert to invoice** | Convert an estimate | New invoice created with **same line items + totals**; estimate marked converted | ⬜ | |
| EST-16 | [ ] | No double-convert | Convert an already-converted estimate | Blocked/handled | ⬜ | |
| EST-17 | [ ] | Converted linkage | Open the resulting invoice | Links back to source estimate; amounts identical | ⬜ | |

### C4. Payments list

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EST-18 | [ ] | List loads | Open payments list | Renders | ⬜ | |
| EST-19 | [ ] | Empty/loading/error | No data / throttle / fail | Each state renders | ⬜ | |
| EST-20 | [ ] | Filter/sort/search | By client/invoice/date/method | Correct rows | ⬜ | |
| EST-21 | [ ] | Money privacy | Mask ON | Amounts masked | ⬜ | |

### C5. Record / edit / delete payment

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EST-22 | [ ] | Record payment | New payment: invoice, amount, date, method, status | Saved; linked to invoice | ⬜ | |
| EST-23 | [ ] | Required fields | Submit empty | Inline errors | ⬜ | |
| EST-24 | [ ] | Amount validation | 0 / negative / > balance due | Rejected or warned (per rules) | ⬜ | |
| EST-25 | [ ] | Completed payment updates invoice | Mark a payment completed | Invoice amountPaid/balance/status update | ⬜ | |
| EST-26 | [ ] | Partial then full | Two payments summing to total | Invoice → paid | ⬜ | |
| EST-27 | [ ] | Edit payment | Change amount/status | Invoice recomputes | ⬜ | |
| EST-28 | [ ] | Delete payment | Delete a payment | Confirm; invoice balance restored | ⬜ | |
| EST-29 | [ ] | Method options | Try each method (bank/UPI/cash/etc.) | All save | ⬜ | |
| EST-30 | [ ] | Currency match | Payment currency vs invoice | Consistent | ⬜ | |

### C6. Permissions & edge cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EST-31 | [ ] | No estimate perm | Without `invoices.estimates.view` | `/app/no-access` | ⬜ | |
| EST-32 | [ ] | No payment perm | Without `invoices.payments.view` | Blocked | ⬜ | |
| EST-33 | [ ] | Read-only user | View-only | No create/edit/delete actions | ⬜ | |
| EST-34 | [ ] | Overpayment guard | Pay more than balance | Handled (blocked/credit) per design | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)).

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| EST-R1 | [ ] | Estimates list | ⬜ | ⬜ | ⬜ | |
| EST-R2 | [ ] | Estimate create/edit (line items) | ⬜ | ⬜ | ⬜ | |
| EST-R3 | [ ] | Payments list | ⬜ | ⬜ | ⬜ | |
| EST-R4 | [ ] | Payment form | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
