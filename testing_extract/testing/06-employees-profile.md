# 06 — Employees, Profile & Departments

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

HR directory (admin-managed employees), the self-service **My Profile** page (where staff edit their own contact/bank/statutory details, skills, certifications, documents — while HR-owned fields stay locked), and **Departments**. Governed by `employees.*` / `hr.departments.*` / `profile.edit.own`.

> **Note:** verify exact field labels and which fields are locked vs editable against the live app; log mismatches.

## A. Scope & routes

- `/app/employees` — directory list.
- `/app/employees/new` — add employee.
- `/app/employees/[id]` — employee detail.
- `/app/employees/[id]/edit` — edit employee.
- `/app/profile` — self-service profile (skills/certs/documents).
- `/app/departments`, `/app/departments/[id]` — departments.

## B. Preconditions

- A **department** must exist before adding an employee.
- A1 admin (manage all), A3 employee (self-service & own-record only).

## C. Test cases

### C1. Employees list

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EMP-1 | [ ] | List loads | Open `/app/employees` | Directory renders | ⬜ | |
| EMP-2 | [ ] | Empty/loading/error | No data / throttle / fail | Each state renders | ⬜ | |
| EMP-3 | [ ] | Search | Search by name/email/ID | Filters | ⬜ | |
| EMP-4 | [ ] | Filters | Filter by department/status/role | Correct rows | ⬜ | |
| EMP-5 | [ ] | Sort & paginate & columns | Sort, page, toggle columns, reload | Work; config persists | ⬜ | |
| EMP-6 | [ ] | Row → detail | Click a row | Opens employee detail | ⬜ | |
| EMP-7 | [ ] | New button | Click Add employee | Opens create form | ⬜ | |

### C2. Create employee

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EMP-8 | [ ] | Required fields | Submit empty | Inline errors; no save | ⬜ | |
| EMP-9 | [ ] | Name | Valid name | Accepted | ⬜ | |
| EMP-10 | [ ] | Email | Invalid email | Format error | ⬜ | |
| EMP-11 | [ ] | Phone | Invalid phone | Validated | ⬜ | |
| EMP-12 | [ ] | Department select | Pick department (must exist) | Linked | ⬜ | |
| EMP-13 | [ ] | Designation/role | Set designation & role | Saved | ⬜ | |
| EMP-14 | [ ] | Date of joining | Set DOJ | Valid date; future/blank handling sane | ⬜ | |
| EMP-15 | [ ] | Date of birth | Set DOB | Valid; not in future | ⬜ | |
| EMP-16 | [ ] | Employment type | Set (full-time/probation/etc.) | Saved | ⬜ | |
| EMP-17 | [ ] | Bank / statutory IDs (if present) | PAN/Aadhaar/PF/bank fields | Format-validated | ⬜ | |
| EMP-18 | [ ] | Save success | Valid → Save | Saved; in directory | ⬜ | |
| EMP-19 | [ ] | Duplicate email | Same email as existing | Blocked/warned | ⬜ | |
| EMP-20 | [ ] | Cancel/discard | Cancel mid-edit | Returns; unsaved guard | ⬜ | |
| EMP-21 | [ ] | Double-submit | Save twice | One record | ⬜ | |

### C3. Employee detail

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EMP-22 | [ ] | Detail loads | Open an employee | Header + sections render | ⬜ | |
| EMP-23 | [ ] | Sections | View personal/job/payroll/documents sections | All load | ⬜ | |
| EMP-24 | [ ] | Salary link | If linked to payroll, salary section | Shows current salary record (privacy-masked) | ⬜ | |
| EMP-25 | [ ] | Invalid ID | Non-existent employee | Graceful not-found | ⬜ | |
| EMP-26 | [ ] | Edit shortcut | Click Edit | Opens edit prefilled | ⬜ | |

### C4. Edit employee

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EMP-27 | [ ] | Prefill | Open edit | All fields prefilled | ⬜ | |
| EMP-28 | [ ] | Change & save | Edit → Save | Persists | ⬜ | |
| EMP-29 | [ ] | Revalidation | Clear required → Save | Blocked | ⬜ | |
| EMP-30 | [ ] | Change department | Move to another department | Updated; reflected in filters | ⬜ | |
| EMP-31 | [ ] | Deactivate/offboard | Set inactive/terminated | Handled; excluded from active lists & payroll as designed | ⬜ | |

### C5. My Profile (self-service, as A3)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EMP-32 | [ ] | Profile loads | A3 opens `/app/profile` | Own profile renders | ⬜ | |
| EMP-33 | [ ] | Editable fields save | Edit contact / emergency contact / bank / statutory | Saves successfully | ⬜ | |
| EMP-34 | [ ] | Locked fields | Try to edit designation / department / DOJ | **Not editable** (read-only/locked) | ⬜ | |
| EMP-35 | [ ] | Validation | Invalid email/phone/IFSC on self-edit | Inline errors | ⬜ | |
| EMP-36 | [ ] | Can't see others | A3 tries `/app/employees/[other-id]` | Blocked (own record only via `employees.view.own`) | ⬜ | |
| EMP-37 | [ ] | Profile picture | Upload/change avatar (if present) | Updates; type/size validated | ⬜ | |

### C6. Skills / Certifications / Documents (as A3)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EMP-38 | [ ] | Add skill | Add a skill | Listed | ⬜ | |
| EMP-39 | [ ] | Edit/remove skill | Edit then remove | Updates/removes | ⬜ | |
| EMP-40 | [ ] | Add certification | Add cert (name, issuer, date) | Listed; date validated | ⬜ | |
| EMP-41 | [ ] | Document upload | Upload a document | Stored; type/size validated | ⬜ | |
| EMP-42 | [ ] | Document download/delete | Download then delete | Works | ⬜ | |
| EMP-43 | [ ] | Oversized/invalid file | Upload a too-large/wrong-type file | Rejected with message | ⬜ | |

### C7. Departments

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EMP-44 | [ ] | List loads | Open `/app/departments` | Departments render | ⬜ | |
| EMP-45 | [ ] | Create department | Add a department (name, type, head) | Saved | ⬜ | |
| EMP-46 | [ ] | Required validation | Save blank name | Blocked | ⬜ | |
| EMP-47 | [ ] | Department detail | Open `/app/departments/[id]` | Members listed | ⬜ | |
| EMP-48 | [ ] | Edit/delete department | Edit; delete empty department | Works; delete-guard if it has members | ⬜ | |

### C8. Permissions & edge cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EMP-49 | [ ] | No employees.view | User without it opens `/app/employees` | `/app/no-access` | ⬜ | |
| EMP-50 | [ ] | view.own scoping | A3 (employees.view.own) | Only own record visible | ⬜ | |
| EMP-51 | [ ] | No create/edit perm | View-only HR user | No add/edit actions | ⬜ | |
| EMP-52 | [ ] | Orphan guard | Delete employee with payroll/attendance | Handled (no orphaned data) | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)).

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| EMP-R1 | [ ] | Employees list | ⬜ | ⬜ | ⬜ | |
| EMP-R2 | [ ] | Create/Edit employee form | ⬜ | ⬜ | ⬜ | |
| EMP-R3 | [ ] | My Profile (cards) | ⬜ | ⬜ | ⬜ | |
| EMP-R4 | [ ] | Departments | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
