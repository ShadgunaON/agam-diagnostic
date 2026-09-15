# 11 — Accounting & Budgets

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Accounting categories (chart of accounts), budget creation/management, and budget-vs-actual performance. Governed by accounting/budget permissions (`expenses.budgets.*` and related).

## A. Scope & routes

- `/app/finance/accounting/categories` — chart of accounts / categories.
- `/app/finance/accounting/budgets` — budgets list.
- `/app/finance/accounting/budgets/add` — create budget.
- `/app/finance/accounting/budgets/[id]` — budget detail.
- `/app/finance/accounting/budgets/[id]/edit` — edit budget.
- `/app/finance/accounting/budget-performance` — budget vs actual.

## B. Preconditions

- Categories configured; some expenses recorded so budget-vs-actual has data.
- A1 + a user with budget permissions.

## C. Test cases

### C1. Categories

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ACC-1 | [ ] | List loads | Open categories | Renders | ⬜ | |
| ACC-2 | [ ] | Create category | Add a category (name, type) | Saved | ⬜ | |
| ACC-3 | [ ] | Required validation | Save blank | Blocked | ⬜ | |
| ACC-4 | [ ] | Edit/delete | Edit; delete unused | Works; delete-guard if in use | ⬜ | |
| ACC-5 | [ ] | Used in forms | Open expense/budget form | Categories appear in pickers | ⬜ | |

### C2. Budgets list & create

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ACC-6 | [ ] | List loads | Open budgets | Renders with periods/amounts | ⬜ | |
| ACC-7 | [ ] | Empty/loading/error | No data / throttle / fail | Each state renders | ⬜ | |
| ACC-8 | [ ] | Money privacy | Mask ON | Amounts masked | ⬜ | |
| ACC-9 | [ ] | Add budget | `/budgets/add`: category/department, period, amount | Saved | ⬜ | |
| ACC-10 | [ ] | Required fields | Submit empty | Inline errors | ⬜ | |
| ACC-11 | [ ] | Amount validation | 0 / negative / non-numeric | Rejected | ⬜ | |
| ACC-12 | [ ] | Period validation | Overlapping/invalid period | Handled (blocked/warned) | ⬜ | |
| ACC-13 | [ ] | Save & double-submit | Save; save twice | One budget created | ⬜ | |

### C3. Budget detail & edit

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ACC-14 | [ ] | Detail loads | Open `/budgets/[id]` | Shows allocation + utilization | ⬜ | |
| ACC-15 | [ ] | Edit prefill & save | Edit amount/period | Persists; performance recomputes | ⬜ | |
| ACC-16 | [ ] | Delete | Delete a budget | Confirm + removed | ⬜ | |
| ACC-17 | [ ] | Invalid ID | Non-existent budget | Graceful not-found | ⬜ | |

### C4. Budget performance

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ACC-18 | [ ] | Page loads | Open budget-performance | Budget vs actual table/chart renders | ⬜ | |
| ACC-19 | [ ] | Actual computed | Add an expense in a budgeted category | Actual increases by that amount | ⬜ | |
| ACC-20 | [ ] | Variance/over-budget | Exceed a budget | Over-budget highlighted; variance correct | ⬜ | |
| ACC-21 | [ ] | Filters/date range | Change period/filters | Recomputes correctly | ⬜ | |
| ACC-22 | [ ] | Export | Export performance | CSV/PDF correct | ⬜ | |

### C5. Permissions

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ACC-23 | [ ] | No budget view perm | Without it | `/app/no-access` | ⬜ | |
| ACC-24 | [ ] | No manage perm | View-only | No add/edit/delete actions | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)).

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| ACC-R1 | [ ] | Categories | ⬜ | ⬜ | ⬜ | |
| ACC-R2 | [ ] | Budgets list + add/edit | ⬜ | ⬜ | ⬜ | |
| ACC-R3 | [ ] | Budget performance (charts) | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
