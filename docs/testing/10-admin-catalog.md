# 10 — Admin Catalog

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the admin catalog workspace — creating, editing, activating/deactivating, and deleting Tests, Services, and Packages. Also covers the sub-catalog routes.

---

## A. Scope & routes

- `/admin/catalog` — Catalog workspace (Tests / Services / Packages tabs)
- `/admin/catalog/tests` — Tests sub-page (if applicable)
- `/admin/catalog/services` — Services sub-page
- `/admin/catalog/packages` — Packages sub-page

---

## B. Preconditions

- A1 (Admin) logged in.
- At least 3 active tests, 2 services, 2 packages.
- At least 1 item in Draft/Inactive status to test status management.
- A2 (limited-permission staff) for permission gating tests.

---

## C. Test Cases

### C1. Catalog Page — Load & Tabs

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-A1 | [ ] | Catalog page loads | A1: open `/admin/catalog` | Page renders; Tests/Services/Packages tabs visible; no errors | ⬜ | |
| CAT-A2 | [ ] | Tests tab default | On page load | Tests tab active; tests list renders | ⬜ | |
| CAT-A3 | [ ] | Services tab | Click Services tab | Services list renders | ⬜ | |
| CAT-A4 | [ ] | Packages tab | Click Packages tab | Packages list renders | ⬜ | |
| CAT-A5 | [ ] | Tab count | View each tab | Count of items per tab visible | ⬜ | |
| CAT-A6 | [ ] | Loading state | Slow network; load catalog | Skeleton/spinner while data loads | ⬜ | |
| CAT-A7 | [ ] | Empty state | System with no tests | Friendly empty state with "Add Test" CTA | ⬜ | |

### C2. Tests List

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-A8 | [ ] | Test row content | View any test row | Shows: title, category, price (₹), status badge | ⬜ | |
| CAT-A9 | [ ] | Status badge — Active | Active test | Green "Active" badge | ⬜ | |
| CAT-A10 | [ ] | Status badge — Inactive/Draft | Inactive test | Grey or yellow "Inactive/Draft" badge | ⬜ | |
| CAT-A11 | [ ] | Search tests | Type test name in search | List filters correctly | ⬜ | |
| CAT-A12 | [ ] | Filter by category | Select a category filter | Only tests in that category shown | ⬜ | |
| CAT-A13 | [ ] | Filter by status | Select Active/Inactive filter | Filtered correctly | ⬜ | |
| CAT-A14 | [ ] | Sort by price | Sort ascending/descending | Tests reorder by price | ⬜ | |

### C3. Add / Edit Test

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-A15 | [ ] | Add test opens form | Click "Add Test" | Form/drawer/modal opens | ⬜ | |
| CAT-A16 | [ ] | Title required | Submit with blank title | Inline required error | ⬜ | |
| CAT-A17 | [ ] | Price required | Submit with blank price | Inline required error | ⬜ | |
| CAT-A18 | [ ] | Negative price | Enter `-100`; submit | Validation error (price must be positive) | ⬜ | |
| CAT-A19 | [ ] | Category required | Submit without category | Inline required error | ⬜ | |
| CAT-A20 | [ ] | Slug auto-generated | Enter title; view slug field | Slug auto-populates from title | ⬜ | |
| CAT-A21 | [ ] | Duplicate slug | Try to save with same slug as existing test | Error "slug already in use" | ⬜ | |
| CAT-A22 | [ ] | Save new test | Fill all required fields; save | Test created; appears in Tests list | ⬜ | |
| CAT-A23 | [ ] | New test — public visibility | Activate new test; visit `/tests` | Test appears in public catalog | ⬜ | |
| CAT-A24 | [ ] | Edit existing test | Click Edit on a test | Form pre-fills with existing data | ⬜ | |
| CAT-A25 | [ ] | Edit — change price | Update price; save | New price reflected in public catalog | ⬜ | |
| CAT-A26 | [ ] | Edit — change category | Update category; save | Test moves to new category in public catalog | ⬜ | |
| CAT-A27 | [ ] | Cancel edit | Click Cancel | No changes saved; returns to list | ⬜ | |
| CAT-A28 | [ ] | Double-save guard | Click Save twice rapidly | Only one record created/updated | ⬜ | |

### C4. Status — Activate / Deactivate

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-A29 | [ ] | Deactivate active test | Toggle status off / click Deactivate | Status changes to Inactive; public catalog no longer shows it | ⬜ | |
| CAT-A30 | [ ] | Activate inactive test | Toggle status on / click Activate | Status changes to Active; appears in public catalog | ⬜ | |
| CAT-A31 | [ ] | Status persists | Change status; reload admin catalog | Status still shows correctly | ⬜ | |

### C5. Delete Test

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-A32 | [ ] | Delete test — confirmation | Click Delete; dialog appears | Confirm/Cancel dialog shown | ⬜ | |
| CAT-A33 | [ ] | Confirm delete | Confirm deletion | Test removed; list updates | ⬜ | |
| CAT-A34 | [ ] | Cancel delete | Click Cancel in dialog | Test not deleted | ⬜ | |
| CAT-A35 | [ ] | Delete — public removes | Delete an active test; check public catalog | Test no longer appears in `/tests` | ⬜ | |
| CAT-A36 | [ ] | Delete test with bookings | Delete a test that has active bookings | Warning shown; deletion blocked or warned | ⬜ | |

### C6. Services & Packages (same pattern as Tests)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-A37 | [ ] | Services — CRUD works | Apply Add/Edit/Deactivate/Delete to a service | All operations mirror Test behavior correctly | ⬜ | |
| CAT-A38 | [ ] | Packages — CRUD works | Apply Add/Edit/Deactivate/Delete to a package | All operations work; included tests selectable | ⬜ | |
| CAT-A39 | [ ] | Package — include tests | Edit a package; select included tests | Included tests appear in package detail public page | ⬜ | |
| CAT-A40 | [ ] | Package price vs test sum | Create package with 3 tests | Package price can differ from individual test sum | ⬜ | |

### C7. Permission Gating

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-A41 | [ ] | View catalog — permission | A2 with `catalog.view`; open `/admin/catalog` | Catalog visible; no edit/add/delete buttons | ⬜ | |
| CAT-A42 | [ ] | Edit without permission | A2 without `catalog.edit`; try Edit button | Button hidden or action blocked | ⬜ | |
| CAT-A43 | [ ] | No access | A2 with no `catalog` permission; open `/admin/catalog` | Access denied; no items exposed | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| CAT-AR1 | [ ] | `/admin/catalog` — Tests tab | ⬜ | ⬜ | ⬜ | |
| CAT-AR2 | [ ] | `/admin/catalog` — Packages tab | ⬜ | ⬜ | ⬜ | |
| CAT-AR3 | [ ] | Add/Edit form modal/drawer | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 43 |
| S1/S2 bugs filed | |
