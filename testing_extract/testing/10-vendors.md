# 10 — Vendors

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Vendor/supplier directory (purchase-side counterparties used by Expenses). Supports a **default department** that auto-fills on the expense form. Bank account numbers are **masked** for restricted roles. Governed by `vendors.*`.

## A. Scope & routes

- `/app/vendors` — list.
- `/app/vendors/add` — add vendor.
- `/app/vendors/[id]` — detail.
- `/app/vendors/[id]/edit` — edit.

## B. Preconditions

- Departments configured (for the default-department field).
- A1 + a Finance user with vendor permissions; a restricted role to test bank masking.

## C. Test cases

### C1. Vendors list

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| VEN-1 | [ ] | List loads | Open `/app/vendors` | Renders | ⬜ | |
| VEN-2 | [ ] | Empty/loading/error | No data / throttle / fail | Each state renders | ⬜ | |
| VEN-3 | [ ] | Search | By name/GST/contact | Filters | ⬜ | |
| VEN-4 | [ ] | Filters/sort/paginate/columns | Exercise + reload | Work; config persists | ⬜ | |
| VEN-5 | [ ] | Row → detail | Click a row | Opens detail | ⬜ | |
| VEN-6 | [ ] | Add button | Click Add vendor | Opens form | ⬜ | |

### C2. Add / edit vendor

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| VEN-7 | [ ] | Required fields | Submit empty | Inline errors; no save | ⬜ | |
| VEN-8 | [ ] | Name | Valid name | Accepted | ⬜ | |
| VEN-9 | [ ] | Email/phone | Invalid formats | Validation errors | ⬜ | |
| VEN-10 | [ ] | GSTIN/PAN | Invalid format | Format error (15-char GSTIN / 10-char PAN) | ⬜ | |
| VEN-11 | [ ] | **Default department** | Set a default department | Saved on vendor | ⬜ | |
| VEN-12 | [ ] | Bank details | Enter account #, IFSC, bank name | Saved; IFSC format validated | ⬜ | |
| VEN-13 | [ ] | Address fields | Fill address | Saved | ⬜ | |
| VEN-14 | [ ] | Save success | Valid → Save | In list | ⬜ | |
| VEN-15 | [ ] | Duplicate | Same name/GST | Blocked/warned | ⬜ | |
| VEN-16 | [ ] | Cancel/double-submit | Cancel; save twice | Guarded; one record | ⬜ | |
| VEN-17 | [ ] | Edit prefill & save | Open edit, change, save | Prefilled; persists | ⬜ | |

### C3. Detail & integration

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| VEN-18 | [ ] | Detail loads | Open a vendor | All fields render | ⬜ | |
| VEN-19 | [ ] | Linked expenses | View expenses for this vendor (if shown) | Correct list | ⬜ | |
| VEN-20 | [ ] | **Default dept auto-fill** | Create an expense, select this vendor | Department auto-fills (see [09 EXP-11](09-expenses.md)) | ⬜ | |
| VEN-21 | [ ] | Invalid ID | Open non-existent vendor | Graceful not-found | ⬜ | |

### C4. Bank masking, delete, export, permissions

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| VEN-22 | [ ] | **Bank masking** | View as restricted/external role | Account number masked | ⬜ | |
| VEN-23 | [ ] | Bank visible to permitted | View as full-access finance | Account number visible | ⬜ | |
| VEN-24 | [ ] | Delete vendor | Delete a vendor with no expenses | Confirm + removed | ⬜ | |
| VEN-25 | [ ] | Delete guard | Delete a vendor with expenses | Blocked/warned | ⬜ | |
| VEN-26 | [ ] | Export | Export vendors | CSV correct (bank masked per role) | ⬜ | |
| VEN-27 | [ ] | No view perm | Without `vendors.view` | `/app/no-access` | ⬜ | |
| VEN-28 | [ ] | No edit/delete perm | View-only | No edit/delete actions | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)).

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| VEN-R1 | [ ] | Vendors list | ⬜ | ⬜ | ⬜ | |
| VEN-R2 | [ ] | Add/Edit form | ⬜ | ⬜ | ⬜ | |
| VEN-R3 | [ ] | Vendor detail | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
