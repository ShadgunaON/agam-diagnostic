# 02 — RBAC, Staff & Roles

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the staff management page, role creation, the permission matrix, staff invite flow, no-access enforcement, and admin profile.

---

## A. Scope & routes

- `/admin/staff` — Staff & Roles workspace (Roles tab + Employees tab, permission matrix)
- `/admin/staff/[staffId]` — Individual staff member detail
- `/admin/profile` — Admin's own profile
- Role-gated access across all admin pages

---

## B. Preconditions

- A1 (full admin) account.
- At least one custom role (besides the default admin role).
- At least one invited staff member (A2 — finance-scoped) available for segregation tests.
- Know which modules/permissions each role has.

---

## C. Test Cases

### C1. Page Load & Layout

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-1 | [ ] | Staff page loads | A1: open `/admin/staff` | Page renders; Roles and Employees tabs visible | ⬜ | |
| RBAC-2 | [ ] | Roles tab default | On page load | Roles tab is active by default; role list renders | ⬜ | |
| RBAC-3 | [ ] | Employees tab | Click Employees tab | Staff list renders with name, role, email | ⬜ | |
| RBAC-4 | [ ] | Role selection | Click a role in the left panel | Permission matrix for that role loads on the right | ⬜ | |
| RBAC-5 | [ ] | Empty roles state | If no roles exist | Friendly empty state; "Create Role" CTA visible | ⬜ | |
| RBAC-6 | [ ] | Empty employees state | If no staff invited yet | Friendly empty state; "Invite Staff" CTA visible | ⬜ | |

### C2. Role Management

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-7 | [ ] | Create role opens drawer | Click "New Role" / "Create Role" | Drawer or modal opens | ⬜ | |
| RBAC-8 | [ ] | Role name required | Submit new role with blank name | Inline required error; blocked | ⬜ | |
| RBAC-9 | [ ] | Role internal name required | Submit with blank internal identifier | Inline required error; blocked | ⬜ | |
| RBAC-10 | [ ] | Create role successfully | Fill name + internal name; submit | Role created; appears in role list | ⬜ | |
| RBAC-11 | [ ] | Duplicate role name | Create role with existing name | Error shown; blocked | ⬜ | |
| RBAC-12 | [ ] | Role appears in matrix | Select newly created role | Permission matrix shows with all modules (all unchecked by default) | ⬜ | |
| RBAC-13 | [ ] | Delete role (if available) | Delete a custom role with no staff assigned | Role removed from list | ⬜ | |
| RBAC-14 | [ ] | Delete role with staff | Attempt to delete role with assigned staff | Warning / blocked; role not deleted | ⬜ | |

### C3. Permission Matrix

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-15 | [ ] | Permissions load | Select any role | View/Create/Edit/Delete checkboxes visible per module | ⬜ | |
| RBAC-16 | [ ] | Toggle permission ON | Check a View permission for a module | Checkbox becomes checked; state registers | ⬜ | |
| RBAC-17 | [ ] | Toggle permission OFF | Uncheck a permission | Checkbox unchecks; state registers | ⬜ | |
| RBAC-18 | [ ] | Save permissions | Toggle several permissions; click Save/Apply | Success confirmation; permissions persisted | ⬜ | |
| RBAC-19 | [ ] | Permission persists on reload | Save permissions; reload page; reopen role | Saved permissions still shown | ⬜ | |
| RBAC-20 | [ ] | View-only without create | Give a role View but not Create on bookings | That role can see bookings list but Create button is hidden | ⬜ | |
| RBAC-21 | [ ] | No-permission redirect | Log in as staff whose role has no access to a module; navigate to that module's route | Redirected out or "No Access" UI; no data shown | ⬜ | |
| RBAC-22 | [ ] | Admin wildcard | A1 admin can access all modules | Every module accessible; no restrictions | ⬜ | |
| RBAC-23 | [ ] | Discard pending permissions | Toggle permissions; close/cancel without saving | Changes not persisted on reload | ⬜ | |

### C4. Invite Staff

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-24 | [ ] | Invite drawer opens | Click "Invite Staff" | Drawer or modal opens with name/email/phone/role fields | ⬜ | |
| RBAC-25 | [ ] | Name required | Submit invite with name blank | Inline required error | ⬜ | |
| RBAC-26 | [ ] | Email required | Submit invite with email blank | Inline required error | ⬜ | |
| RBAC-27 | [ ] | Invalid email | Enter `notanemail`; submit | Inline format validation error | ⬜ | |
| RBAC-28 | [ ] | Role required | Submit without selecting a role | Inline required error | ⬜ | |
| RBAC-29 | [ ] | Successful invite | Fill all fields; submit | Staff member added to Employees list; invite sent (email/OTP) | ⬜ | |
| RBAC-30 | [ ] | Duplicate invite | Invite already-existing email | Error "User already exists"; blocked | ⬜ | |
| RBAC-31 | [ ] | Invited staff permissions | Invited staff logs in | Exactly the role's permissions apply; nothing more, nothing less | ⬜ | |
| RBAC-32 | [ ] | Cancel invite drawer | Open invite drawer; click Cancel/close | Drawer closes; no staff added | ⬜ | |

### C5. Staff Detail & Employee Tab

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-33 | [ ] | Employee list renders | Click Employees tab | Shows all staff with name, role badge, contact | ⬜ | |
| RBAC-34 | [ ] | Navigate to staff detail | Click a staff row / name | `/admin/staff/[staffId]` loads with staff info | ⬜ | |
| RBAC-35 | [ ] | Staff detail content | View staff detail page | Shows name, role, contact, any assigned bookings/activity | ⬜ | |
| RBAC-36 | [ ] | Change staff role | On staff detail, change role and save | Role updated; new permissions apply on next login | ⬜ | |
| RBAC-37 | [ ] | Deactivate staff | Deactivate a staff account (if available) | Staff can no longer log in | ⬜ | |

### C6. No-access Enforcement (Cross-module)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-38 | [ ] | Restricted staff can't create | Staff with view-only permission; try to create a booking | Create button hidden or action blocked | ⬜ | |
| RBAC-39 | [ ] | URL manipulation | Staff with no `reports` permission; manually navigate to `/admin/reports` | Access denied; redirected; no report data shown | ⬜ | |
| RBAC-40 | [ ] | Admin profile accessible | A1: open `/admin/profile` | Profile page renders with account info | ⬜ | |
| RBAC-41 | [ ] | Patient can't reach staff page | Logged in as A5; navigate to `/admin/staff` | Blocked; no admin page rendered | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| RBAC-R1 | [ ] | `/admin/staff` — Roles tab | ⬜ | ⬜ | ⬜ | |
| RBAC-R2 | [ ] | `/admin/staff` — Employees tab | ⬜ | ⬜ | ⬜ | |
| RBAC-R3 | [ ] | `/admin/staff/[staffId]` | ⬜ | ⬜ | ⬜ | |
| RBAC-R4 | [ ] | Invite drawer | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 41 |
| S1/S2 bugs filed | |
