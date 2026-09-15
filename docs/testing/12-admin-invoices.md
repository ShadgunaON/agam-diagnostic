# 12 — Admin Invoices

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the admin invoices list, invoice detail view, payment status tracking, and the public-facing patient payment page.

---

## A. Scope & routes

- `/admin/invoices` — Invoice list
- `/admin/invoices/[invoiceId]` — Invoice detail

---

## B. Preconditions

- A1 (Admin) logged in.
- At least 5 invoices in mixed statuses (Unpaid, Paid, Partially Paid).
- At least 1 invoice with a patient who has a payment pending.
- Payment gateway in sandbox/test mode.

---

## C. Test Cases

### C1. Invoices List — Load & Layout

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| INV-1 | [ ] | Invoices page loads | A1: open `/admin/invoices` | Page renders; list of invoices visible; no errors | ⬜ | |
| INV-2 | [ ] | Invoice row content | View any invoice row | Shows: invoice ID, patient name, amount (₹), date, status | ⬜ | |
| INV-3 | [ ] | Status badge — Paid | Paid invoice | Green "Paid" badge | ⬜ | |
| INV-4 | [ ] | Status badge — Unpaid | Unpaid invoice | Red or orange "Unpaid" badge | ⬜ | |
| INV-5 | [ ] | Status badge — Partial | Partially paid invoice | Yellow "Partially Paid" badge | ⬜ | |
| INV-6 | [ ] | Loading state | Slow network | Skeleton/spinner renders | ⬜ | |
| INV-7 | [ ] | Empty state | No invoices | Friendly empty state | ⬜ | |

### C2. Search, Filter & Sort

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| INV-8 | [ ] | Search by patient name | Type patient name | List filters to matching invoices | ⬜ | |
| INV-9 | [ ] | Search by invoice ID | Type invoice ID | Matching invoice shown | ⬜ | |
| INV-10 | [ ] | Filter by status — Paid | Select "Paid" | Only paid invoices | ⬜ | |
| INV-11 | [ ] | Filter by status — Unpaid | Select "Unpaid" | Only unpaid invoices | ⬜ | |
| INV-12 | [ ] | Filter by date range | Set start and end date (if available) | Only invoices within range | ⬜ | |
| INV-13 | [ ] | Sort by amount | Sort ascending/descending | Invoices reorder by amount | ⬜ | |
| INV-14 | [ ] | Sort by date | Sort by date newest/oldest | Invoices reorder by date | ⬜ | |
| INV-15 | [ ] | Clear filters | Clear all filters | Full list restores | ⬜ | |
| INV-16 | [ ] | Pagination | > page-size invoices | Pagination works; next/prev loads correct items | ⬜ | |

### C3. Invoice Detail — `/admin/invoices/[invoiceId]`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| INV-17 | [ ] | Invoice detail loads | Click an invoice row | `/admin/invoices/[invoiceId]` renders; no errors | ⬜ | |
| INV-18 | [ ] | Invoice header info | View detail | Invoice ID, date, due date, status shown | ⬜ | |
| INV-19 | [ ] | Patient / billing info | View detail | Patient name, phone, address (if applicable) shown | ⬜ | |
| INV-20 | [ ] | Line items | View detail | Each test/package booked listed as a line item with price | ⬜ | |
| INV-21 | [ ] | Subtotal calculation | View totals | Subtotal = sum of all line items | ⬜ | |
| INV-22 | [ ] | Tax (GST) line | View totals | Tax amount shown separately (if applicable) | ⬜ | |
| INV-23 | [ ] | Grand total | View totals | Grand total = subtotal + tax; correct | ⬜ | |
| INV-24 | [ ] | Amount paid | View paid invoice | Amount paid and balance due shown | ⬜ | |
| INV-25 | [ ] | Download / Print invoice | Click Download or Print | PDF invoice downloads or print dialog opens | ⬜ | |
| INV-26 | [ ] | PDF content correct | Open downloaded PDF | Patient name, test names, amounts, logo, date all correct | ⬜ | |
| INV-27 | [ ] | Share / Send invoice link | Click "Send to Patient" (if available) | Payment link sent via SMS/email | ⬜ | |
| INV-28 | [ ] | Mark as paid manually | Click "Mark Paid" (if available) | Status changes to Paid; log entry added | ⬜ | |
| INV-29 | [ ] | Invalid invoice ID | Visit `/admin/invoices/nonexistent-id` | 404 or error; not a crash | ⬜ | |
| INV-30 | [ ] | Back navigation | Click Back | Returns to invoice list | ⬜ | |

### C4. Permission Gating

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| INV-31 | [ ] | View invoices — permission | A2 with `invoices.view`; open `/admin/invoices` | Invoice list visible; no edit/mark-paid actions | ⬜ | |
| INV-32 | [ ] | No access | A2 without `invoices` permission; navigate to route | Access denied; no data shown | ⬜ | |
| INV-33 | [ ] | Patient can't view admin invoices | A5 visits `/admin/invoices` | Blocked; redirected | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| INV-R1 | [ ] | `/admin/invoices` — list | ⬜ | ⬜ | ⬜ | |
| INV-R2 | [ ] | `/admin/invoices/[invoiceId]` | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 33 |
| S1/S2 bugs filed | |
