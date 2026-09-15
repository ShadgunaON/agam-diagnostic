# 07 — Invoices

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Invoice lifecycle and **GST math** — the highest-risk area in the app. Hand-verify totals on at least one invoice. Governed by `invoices.*`.

**Calculation model (from `lib/invoiceCalculator.ts`) — verify against these:**
- `subtotal = Σ(quantity × rate)`, rounded to 2 dp.
- Tax: either a per-line/HSN **tax breakdown** (sum of breakdown amounts) **or** legacy CGST% + SGST% applied to subtotal. Intra-state → CGST+SGST; inter-state → IGST.
- `total = subtotal + tax + roundOff` (round-off optional).
- `amountPaid = Σ payments where status = completed`.
- `balanceDue = max(0, total − amountPaid)`; if status = `paid`, balance forced to 0.
- Computed status: `draft` → `pending` → `partially_paid` (some completed payment, balance > 0) → `overdue` (past due date, unpaid) → `paid` (balance ≤ 0.01).
- Currency formatted to the invoice currency, 2 decimals.

## A. Scope & routes

- `/app/finance/sales/invoices` — list.
- `/app/finance/sales/invoices/new` — create.
- `/app/finance/sales/invoices/[id]` — view.
- `/app/finance/sales/invoices/[id]/edit` — edit.
- `/invoice/render/[id]` — **public** print/PDF render (no login).

## B. Preconditions

- A client, a project (optional), HSN/SAC codes, and at least one currency configured.
- Company profile (banking/UPI, GSTIN) set in Settings — appears on the invoice.
- A1 + a Finance user with `invoices.*`.

## C. Test cases

### C1. Invoices list

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| INV-1 | [ ] | List loads | Open invoices list | Renders with status badges & amounts | ⬜ | |
| INV-2 | [ ] | Empty/loading/error | No data / throttle / fail | Each state renders | ⬜ | |
| INV-3 | [ ] | Search | Search by number/client | Filters | ⬜ | |
| INV-4 | [ ] | Status filter | Filter draft/pending/paid/overdue/partially_paid | Correct rows | ⬜ | |
| INV-5 | [ ] | Date range filter | Filter by issue/due date | Correct rows | ⬜ | |
| INV-6 | [ ] | Sort / paginate / columns | Sort by amount/date; page; toggle columns | Work; config persists | ⬜ | |
| INV-7 | [ ] | Money privacy | With mask ON | Amounts masked in list | ⬜ | |
| INV-8 | [ ] | Row → view | Click a row | Opens invoice view | ⬜ | |
| INV-9 | [ ] | New button | Click New invoice | Opens create form | ⬜ | |

### C2. Create invoice — header & line items

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| INV-10 | [ ] | Required fields | Submit empty | Inline errors; no save | ⬜ | |
| INV-11 | [ ] | Client select | Pick a client | Bills-to populated; required | ⬜ | |
| INV-12 | [ ] | Project link | Link a project (optional) | Saved | ⬜ | |
| INV-13 | [ ] | Invoice number | Auto-generated / editable | Unique; no duplicates | ⬜ | |
| INV-14 | [ ] | Issue & due date | Set dates | Due ≥ issue; date pickers work | ⬜ | |
| INV-15 | [ ] | Currency | Choose currency | Symbol/format applied throughout | ⬜ | |
| INV-16 | [ ] | Add line item | Add a line (description, HSN/SAC, qty, rate, tax) | Row added | ⬜ | |
| INV-17 | [ ] | Multiple line items | Add several lines | All sum correctly | ⬜ | |
| INV-18 | [ ] | Remove line item | Delete a line | Totals recompute | ⬜ | |
| INV-19 | [ ] | Qty/rate validation | Enter 0 / negative / non-numeric | Rejected/handled | ⬜ | |
| INV-20 | [ ] | HSN/SAC select | Pick HSN/SAC per line | Tax rate auto-applies if linked | ⬜ | |
| INV-21 | [ ] | Line subtotal | qty × rate | Line amount correct | ⬜ | |
| INV-21a | [ ] | Invoice from milestone tasks | Generate an invoice from a milestone billed off its tasks (see [05 — Projects](05-projects.md#c5b-milestone--task-billing)) | **One line item per task**; amounts match the tasks' bill amounts | ⬜ | |
| INV-21b | [ ] | No double-billing | Try to invoice the same milestone tasks again | Already-billed tasks are excluded/blocked | ⬜ | |

### C3. GST & totals (verify by hand)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| INV-22 | [ ] | Subtotal | Sum lines | = Σ(qty×rate), 2 dp | ⬜ | |
| INV-23 | [ ] | Intra-state (CGST+SGST) | Client in same state as company | CGST + SGST split (e.g. 9%+9%); sums to total tax | ⬜ | |
| INV-24 | [ ] | Inter-state (IGST) | Client in a different state | Single IGST (e.g. 18%); no CGST/SGST | ⬜ | |
| INV-25 | [ ] | Mixed tax rates | Lines with different rates | Tax breakdown per rate correct | ⬜ | |
| INV-26 | [ ] | Round-off | Enable round-off | total = subtotal+tax+roundOff; rounding correct | ⬜ | |
| INV-27 | [ ] | Grand total | Check total | Matches hand calc exactly (2 dp) | ⬜ | |
| INV-28 | [ ] | Zero-tax line | A 0% / exempt line | No tax added for it | ⬜ | |
| INV-29 | [ ] | Discount (if supported) | Apply line/invoice discount | Applied before/after tax as designed; total correct | ⬜ | |
| INV-30 | [ ] | Currency formatting | Non-INR currency | Correct symbol, locale, 2 decimals | ⬜ | |

### C4. Save, statuses & actions

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| INV-31 | [ ] | Save draft | Save as draft | Status = draft; in list | ⬜ | |
| INV-32 | [ ] | Send invoice | Mark/send | Status → pending/sent; client notified if applicable | ⬜ | |
| INV-33 | [ ] | Double-submit | Save twice | One invoice | ⬜ | |
| INV-34 | [ ] | Cancel/discard | Cancel mid-edit | Unsaved guard | ⬜ | |
| INV-35 | [ ] | Mark paid | Mark fully paid | Status → paid; balance = 0 | ⬜ | |
| INV-36 | [ ] | Record partial payment | Add a completed payment < total | Status → partially_paid; balance updates | ⬜ | |
| INV-37 | [ ] | Overdue | Past due date, unpaid | Status → overdue | ⬜ | |
| INV-38 | [ ] | Balance after payment | total − amountPaid | Correct; never negative | ⬜ | |

### C5. View & public render

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| INV-39 | [ ] | View loads | Open `/[id]` | All details, totals, company/bank info, status | ⬜ | |
| INV-40 | [ ] | Edit shortcut | Click Edit | Opens edit prefilled | ⬜ | |
| INV-41 | [ ] | Download/print PDF | Use download/print | PDF/print layout correct, totals match | ⬜ | |
| INV-42 | [ ] | Public render | Open `/invoice/render/[id]` (logged out / incognito) | Renders without auth; layout intact | ⬜ | |
| INV-43 | [ ] | Public render security | Alter the id/token in URL | Invalid → not exposed (confirm access rules) | ⬜ | |
| INV-44 | [ ] | Export list | Export invoices | CSV correct | ⬜ | |

### C6. Edit & permissions

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| INV-45 | [ ] | Edit recalculates | Edit a line in `/edit` | Totals recompute and persist | ⬜ | |
| INV-46 | [ ] | Edit paid invoice | Try editing a paid invoice | Locked/limited as designed | ⬜ | |
| INV-47 | [ ] | No view perm | Without `invoices.view` | `/app/no-access` | ⬜ | |
| INV-48 | [ ] | Create auto-grants view.own | User with only `invoices.create` | Can reach the list (view.own auto) | ⬜ | |
| INV-49 | [ ] | No send/mark-paid perm | Limited user | Those actions hidden/blocked | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)). Pay attention to the **line-items table** on mobile.

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| INV-R1 | [ ] | Invoices list | ⬜ | ⬜ | ⬜ | |
| INV-R2 | [ ] | Create/Edit (line items) | ⬜ | ⬜ | ⬜ | |
| INV-R3 | [ ] | Invoice view | ⬜ | ⬜ | ⬜ | |
| INV-R4 | [ ] | Public render `/invoice/render/[id]` | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| GST hand-verified? | |
| S1/S2 bugs filed | |
