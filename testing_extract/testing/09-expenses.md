# 09 — Expenses

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Expense capture, approval workflow, bulk Excel import, recurring expenses, categories/budgets and reports. Governed by `expenses.*` (note `expenses.view.all` vs own; `expenses.approve`/`reject`/`mark_paid`; `expenses.lookups.*`, `expenses.budgets.*`, `expenses.reports.*`).

> A deeper expense-specific plan exists — also run **[docs/EXPENSES-TEST-PLAN.md](../EXPENSES-TEST-PLAN.md)**. This doc is the structured per-page checklist.

## A. Scope & routes

- `/app/finance/expenses` (+ `/list`) — expenses list.
- `/app/finance/expenses/new` — create expense.
- `/app/finance/expenses/[id]` (+ `/edit`) — view/edit.
- `/app/finance/expenses/approvals` — approval queue.
- `/app/finance/expenses/import` — bulk Excel import wizard.
- `/app/finance/expenses/recurring` — recurring series.
- `/app/finance/expenses/categories` — categories.
- `/app/finance/expenses/budgets` — budgets.
- `/app/finance/expenses/reports` — reports.

## B. Preconditions

- Vendors, categories, departments, payment modes configured (lookups).
- A1 admin, A2 Finance (own expenses, no approve), and an **approver** role to test approvals.

## C. Test cases

### C1. Expenses list

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXP-1 | [ ] | List loads | Open expenses list | Renders with status + amounts | ⬜ | |
| EXP-2 | [ ] | Empty/loading/error | No data / throttle / fail | Each state renders | ⬜ | |
| EXP-3 | [ ] | Search | By vendor/description/number | Filters | ⬜ | |
| EXP-4 | [ ] | Filters | Status, category, department, vendor, date range | Correct rows | ⬜ | |
| EXP-5 | [ ] | Own vs all | A2 (no `view.all`) | Sees only own expenses; admin sees all | ⬜ | |
| EXP-6 | [ ] | Sort/paginate/columns | Exercise + reload | Work; config persists | ⬜ | |
| EXP-7 | [ ] | Money privacy | Mask ON | Amounts masked | ⬜ | |
| EXP-8 | [ ] | Row → detail | Click a row | Opens detail | ⬜ | |

### C2. Create expense

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXP-9 | [ ] | Required fields | Submit empty | Inline errors; no save | ⬜ | |
| EXP-10 | [ ] | Vendor select | Pick a vendor | Selected | ⬜ | |
| EXP-11 | [ ] | **Vendor default department** | Select a vendor with a default dept (dept empty) | Department auto-fills | ⬜ | |
| EXP-12 | [ ] | Don't overwrite dept | Choose a dept, then pick that vendor | Chosen dept **not** overwritten | ⬜ | |
| EXP-13 | [ ] | Category | Pick category | Saved | ⬜ | |
| EXP-14 | [ ] | Amount | Enter amount | Numeric; negatives/zero handled | ⬜ | |
| EXP-15 | [ ] | Tax/GST fields (if present) | Enter tax | Computes total correctly | ⬜ | |
| EXP-16 | [ ] | Date | Set expense date | Valid; future handling sane | ⬜ | |
| EXP-17 | [ ] | Payment mode | Pick mode | Saved | ⬜ | |
| EXP-18 | [ ] | Receipt upload | Upload a receipt (image/PDF) | Uploads; type/size validated; preview/download | ⬜ | |
| EXP-19 | [ ] | Multiple receipts | Attach several | All stored | ⬜ | |
| EXP-20 | [ ] | Save as draft | Save | **Default = draft**; in list | ⬜ | |
| EXP-21 | [ ] | Submit for approval | Submit | Status → submitted/pending | ⬜ | |
| EXP-22 | [ ] | Cancel/double-submit | Cancel; save twice | Guarded; one record | ⬜ | |

### C3. View / edit / detail

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXP-23 | [ ] | Detail loads | Open an expense | All fields + receipts render | ⬜ | |
| EXP-24 | [ ] | Edit own | Edit an own draft | Persists | ⬜ | |
| EXP-25 | [ ] | Edit.own vs edit.all | A2 tries to edit someone else's | Blocked unless `expenses.edit.all` | ⬜ | |
| EXP-26 | [ ] | Edit after submit | Edit a submitted/approved expense | Locked/limited per rules | ⬜ | |
| EXP-27 | [ ] | Receipt download/delete | Manage receipts | Works | ⬜ | |

### C4. Approval workflow

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXP-28 | [ ] | Queue loads | Approver opens `/approvals` | Pending expenses listed | ⬜ | |
| EXP-29 | [ ] | Approve | Approve an expense | Status → approved; bell/notification updates | ⬜ | |
| EXP-30 | [ ] | Reject w/ reason | Reject with a comment | Status → rejected; reason recorded | ⬜ | |
| EXP-31 | [ ] | Finance can't approve | A2 (Finance) views an expense | **No** approve/reject actions (segregation of duties) | ⬜ | |
| EXP-32 | [ ] | Mark paid | After approval, mark paid | Status → paid; reflected in figures | ⬜ | |
| EXP-33 | [ ] | Self-approval guard | Approver approves own expense | Blocked/flagged if rule exists | ⬜ | |

### C5. Bulk Excel import

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXP-34 | [ ] | Download template | Click download template | Correct Excel template downloads | ⬜ | |
| EXP-35 | [ ] | Upload valid file | Fill template, upload | Parses; review step shows parsed rows | ⬜ | |
| EXP-36 | [ ] | Validation errors | Upload rows with bad data (missing/invalid) | Errors flagged per-row; bad rows blocked | ⬜ | |
| EXP-37 | [ ] | Wrong file type | Upload a non-Excel file | Rejected with message | ⬜ | |
| EXP-38 | [ ] | Large file/many rows | Upload many rows | Handles (batched client-side); progress shown | ⬜ | |
| EXP-39 | [ ] | Commit import | Commit the reviewed batch | Rows created as **drafts** (default) | ⬜ | |
| EXP-40 | [ ] | Partial failure | Some rows fail mid-commit | Clear result of what committed vs failed | ⬜ | |
| EXP-41 | [ ] | Cancel import | Abandon at review | Nothing created | ⬜ | |

### C6. Recurring expenses

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXP-42 | [ ] | Create series | New recurring series (frequency, start, amount, vendor) | Saved | ⬜ | |
| EXP-43 | [ ] | Occurrence generation | Generate next / wait for daily cron | Occurrence created; **idempotent** (no duplicates) | ⬜ | |
| EXP-44 | [ ] | Catch-up cap | Backdated series | Catch-up generation capped (no runaway) | ⬜ | |
| EXP-45 | [ ] | Draft ownership | Generated occurrences | Drafts owned by series creator | ⬜ | |
| EXP-46 | [ ] | Edit/pause/stop series | Modify or stop a series | Future occurrences reflect change | ⬜ | |

### C7. Categories, budgets, reports

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXP-47 | [ ] | Categories CRUD | Add/edit/delete a category | Works; used in expense form | ⬜ | |
| EXP-48 | [ ] | Budgets view | Open budgets | Budget vs actual displays correctly | ⬜ | |
| EXP-49 | [ ] | Budget breach | Exceed a budget | Over-budget indicated | ⬜ | |
| EXP-50 | [ ] | Reports | Open reports; change filters/date range | Charts/tables compute correctly | ⬜ | |
| EXP-51 | [ ] | Report export | Export report | CSV/PDF correct | ⬜ | |

### C8. Permissions & edge cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXP-52 | [ ] | No expenses.view | Without it | `/app/no-access` | ⬜ | |
| EXP-53 | [ ] | view.own scope | Own-only user | Sees only own; can't open others by URL | ⬜ | |
| EXP-54 | [ ] | No approve perm | Non-approver | Approval queue/actions hidden/blocked | ⬜ | |
| EXP-55 | [ ] | No lookups.manage | Without it | Cannot add categories/vendors/depts | ⬜ | |
| EXP-56 | [ ] | Export gating | Without `expenses.export` | Export disabled | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)). Check the **import wizard** and **right-rail summary/receipts** on mobile.

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| EXP-R1 | [ ] | Expenses list | ⬜ | ⬜ | ⬜ | |
| EXP-R2 | [ ] | Create/Edit (form + receipts rail) | ⬜ | ⬜ | ⬜ | |
| EXP-R3 | [ ] | Approval queue | ⬜ | ⬜ | ⬜ | |
| EXP-R4 | [ ] | Import wizard | ⬜ | ⬜ | ⬜ | |
| EXP-R5 | [ ] | Recurring / budgets / reports | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
