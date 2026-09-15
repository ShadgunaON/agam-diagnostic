# 02 — RBAC, Roles, Groups & Access Control

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

The permission model: **groups** grant `<module>.<action>` permissions; users inherit from their groups (plus optional direct permissions). **Administrator** has a wildcard `*`. The #1 risk to hunt for is **over-exposure** — a user seeing or doing something their permission set forbids. Test enforcement at the **route**, the **nav**, and the **action** (button) level.

## A. Scope & routes

- `/app/settings/groups` and `/app/settings/groups/[id]` — create/manage groups & permissions.
- `/app/settings/users` and `/app/settings/users/[sub]` — assign groups/permissions to users.
- `/app/no-access` — the block page shown when a user lacks permission.
- Nav gating (links only show for permitted areas) and route gating across **all** modules.

## B. Preconditions

- A1 (admin) to configure groups.
- A2 (Finance), A3 (Employee), A4 (External), A5 (Client) to verify scoped access.
- Create one **custom test group** with a small permission set to verify grant/revoke.

## B2. Reference — predefined groups (verify against `shared/src/rbac/permissions.ts`)

| Group | Broad capability | Notes |
|-------|------------------|-------|
| **Administrator** | Everything (wildcard `*`) | System group — not editable |
| **Finance** | Expenses (own), invoices/estimates/payments, vendors, tax/currency settings, budgets, reports | **Cannot approve/reject expenses** (segregation of duties); sees own expenses unless granted `expenses.view.all` |
| **Content Manager** | Blog / case studies / careers — draft & manage | **No publish** by default |
| **Employee** | Self-profile, own employee record, own payslips, own expenses, own tasks, HR self-service | Auto-granted to HR-linked users |
| **Client** | Client portal views (scoped to their client) | See [03 — External & Client Portal](03-external-client-portal.md) |

> Special rules to verify: Administrator `*` matches all permissions (incl. future ones); granting `invoices.create` auto-grants `invoices.view.own`; deprecated permissions are hidden in the UI but still resolve for legacy rows.

## C. Test cases

### C1. Groups management

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-1 | [ ] | Groups list loads | A1 → `/app/settings/groups` | Lists predefined + custom groups | ⬜ | |
| RBAC-2 | [ ] | Create group | New group, name + pick permissions, save | Created; appears in list | ⬜ | |
| RBAC-3 | [ ] | Group name required | Save with blank name | Validation error | ⬜ | |
| RBAC-4 | [ ] | Duplicate name | Create group with existing name | Blocked or warned | ⬜ | |
| RBAC-5 | [ ] | Edit permissions | Open group, toggle permission checkboxes, save | Persists | ⬜ | |
| RBAC-6 | [ ] | System group locked | Open Administrator group | Cannot edit/delete (read-only) | ⬜ | |
| RBAC-7 | [ ] | Add member to group | Group detail → add user | User listed as member | ⬜ | |
| RBAC-8 | [ ] | Remove member | Remove a member | Removed; loses inherited perms on next load | ⬜ | |
| RBAC-9 | [ ] | Delete group | Delete a custom (empty) group | Confirm dialog; removed | ⬜ | |
| RBAC-10 | [ ] | Delete group with members | Delete a group that has members | Handled (blocked or reassigns) — no orphaned access | ⬜ | |
| RBAC-11 | [ ] | Permission search/group UI | Use the permission picker | Grouped by module; searchable; deprecated perms hidden | ⬜ | |

### C2. Assigning access to users

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-12 | [ ] | User detail loads | A1 → `/app/settings/users/[sub]` | Shows groups, permissions, status | ⬜ | |
| RBAC-13 | [ ] | Assign group | Add a group to a user | Access summary updates; user gains perms on next load | ⬜ | |
| RBAC-14 | [ ] | Remove group | Remove a group | User loses those perms | ⬜ | |
| RBAC-15 | [ ] | Direct permission grant | Grant a single direct permission | Effective immediately on next load | ⬜ | |
| RBAC-16 | [ ] | Auto-grant view.own | Grant only `invoices.create` | User also effectively gets `invoices.view.own` (list loads) | ⬜ | |
| RBAC-17 | [ ] | Suspend user | Suspend a user | They can't log in / are blocked | ⬜ | |
| RBAC-18 | [ ] | Reactivate user | Un-suspend | Access restored | ⬜ | |
| RBAC-19 | [ ] | Admin wildcard | A1 visits every module | Full access everywhere, including future/admin-only pages | ⬜ | |

### C3. Route & nav enforcement

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-20 | [ ] | Nav hides blocked links | As A3 (employee), inspect sidebar | Only permitted links show; no links to blocked areas | ⬜ | |
| RBAC-21 | [ ] | Typed blocked URL | As A3, type `/app/settings/users` | Redirect to `/app/no-access`; **no flash** of the page content | ⬜ | |
| RBAC-22 | [ ] | No data leak on block | Watch Network tab on the blocked route | No data-bearing API call succeeds before the block | ⬜ | |
| RBAC-23 | [ ] | Deep-link refresh on blocked route | Hard-refresh a blocked URL | Stays blocked (no momentary content) | ⬜ | |
| RBAC-24 | [ ] | Revoke takes effect | A1 revokes a perm; affected user reloads | Page/action no longer available | ⬜ | |
| RBAC-25 | [ ] | Grant takes effect | A1 grants a perm; user reloads | Page/action now available | ⬜ | |
| RBAC-26 | [ ] | Action-level gating | User has view but not edit | Edit/Delete buttons hidden or blocked server-side | ⬜ | |

### C4. Per-module permission matrix

For each module: confirm a **permitted** role can access, and an **unpermitted** role is blocked (→ no-access) **and** can't act via direct URL.

| # | ✓ | Module | Permitted check | Unpermitted check | Status | Comments |
|---|---|--------|-----------------|-------------------|--------|----------|
| RBAC-27 | [ ] | Clients | A2/A1 can view/manage per perms | A3 blocked from `/app/clients` | ⬜ | |
| RBAC-28 | [ ] | Projects | Permitted can view/manage | Unpermitted blocked | ⬜ | |
| RBAC-29 | [ ] | Invoices | A2 (Finance) full | A3 blocked | ⬜ | |
| RBAC-30 | [ ] | Expenses | A2 own; approver can approve | A2 has **no** approve action; A3 own only | ⬜ | |
| RBAC-31 | [ ] | Payroll | Payroll-permitted only | A3 sees only own payslips, not runs | ⬜ | |
| RBAC-32 | [ ] | Employees | HR-permitted view all | A3 `employees.view.own` → own record only | ⬜ | |
| RBAC-33 | [ ] | HR (leave/attendance) | Manager approves | A3 applies/marks own only | ⬜ | |
| RBAC-34 | [ ] | Settings | Admin/permitted | A2/A3 blocked from restricted settings | ⬜ | |
| RBAC-35 | [ ] | Users & Groups | Admin only | A2/A3 blocked | ⬜ | |
| RBAC-36 | [ ] | Content | Content Manager manage; publish gated | Non-content roles blocked | ⬜ | |
| RBAC-37 | [ ] | Vendors | Finance view/manage | Unpermitted blocked; bank # masked for restricted roles | ⬜ | |
| RBAC-38 | [ ] | Audit log | Admin/`admin.audit` only | Others blocked | ⬜ | |

### C5. Edge cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-39 | [ ] | User in multiple groups | Assign two groups with overlapping perms | Union of permissions; no conflict/error | ⬜ | |
| RBAC-40 | [ ] | Remove last group | Strip all groups & direct perms | User lands on `/app/no-access` (nothing permitted) | ⬜ | |
| RBAC-41 | [ ] | Self-lockout guard | A1 tries to remove own admin (if only admin) | Prevented or warned (don't lock out last admin) | ⬜ | |
| RBAC-42 | [ ] | Concurrent change | Change perms while user is active | Applies on their next navigation/reload, not mid-action crash | ⬜ | |
| RBAC-43 | [ ] | Audit trail | After grants/revokes/suspends | Audit log records actor, target, change, timestamp | ⬜ | |

### C6. Project-scoped access (per-user project allowlist)

> On top of group permissions, an admin can restrict a user to **specific projects only**. A scoped user sees only their assigned projects **and** the sub-resources of those projects (tasks, milestones, invoices, expenses) — everything else is hidden. Must be enforced **server-side**. Set per user on the user detail page. Use a fresh test user **A6 (scoped)** with `projects.view` but limited to 1–2 projects, while ≥3 projects exist.

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-44 | [ ] | Assign project scope | A1 → user detail → assign 1–2 specific projects (project access card) | Saved; user marked as project-scoped (scope badge/tag) | ⬜ | |
| RBAC-45 | [ ] | Scoped projects list | A6 opens `/app/projects` | **Only** the assigned projects appear; others hidden | ⬜ | |
| RBAC-46 | [ ] | Direct URL to non-assigned project | A6 opens an un-assigned project's URL/ID | Blocked server-side (no data leak) | ⬜ | |
| RBAC-47 | [ ] | Sub-resources cascade | A6 views tasks / milestones / invoices / expenses | Only items belonging to assigned projects show | ⬜ | |
| RBAC-48 | [ ] | Empty scope state | A6 with **no** projects assigned | Friendly scoped-user empty state (not an error) | ⬜ | |
| RBAC-49 | [ ] | Admin sees all + badge | A1 (unscoped admin) views projects | Sees all projects; scope badge indicates admin/global access | ⬜ | |
| RBAC-50 | [ ] | Remove scope | A1 removes the allowlist (back to global) | A6 regains access per normal permissions | ⬜ | |

### C7. Per-user UI restrictions (hidden tabs & force-masked amounts)

> An admin can apply **display-level** restrictions per user: hide specific **project tabs**, and **force money masking** app-wide (the user can't unmask). This is a UI overlay on top of (not a replacement for) RBAC. Set on the user detail page. Use test user **A6**.

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-51 | [ ] | Hide project tabs | A1 → user detail → hide specific project tab(s) for A6 | Saved | ⬜ | |
| RBAC-52 | [ ] | Hidden tabs not shown | A6 opens a project detail | The hidden tab(s) are absent from the project view | ⬜ | |
| RBAC-53 | [ ] | Force-mask amounts | A1 enables "hide amounts" for A6 | Saved | ⬜ | |
| RBAC-54 | [ ] | Amounts forced masked | A6 tours money screens + tries the privacy toggle | **All** amounts masked; user **cannot** unmask (toggle disabled/no-op) | ⬜ | |
| RBAC-55 | [ ] | Restriction lifted | A1 clears the restrictions | A6 sees tabs / can unmask again | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)).

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| RBAC-R1 | [ ] | `/app/settings/groups` (list + detail) | ⬜ | ⬜ | ⬜ | |
| RBAC-R2 | [ ] | `/app/settings/users/[sub]` (permission picker + project scope + UI restrictions) | ⬜ | ⬜ | ⬜ | |
| RBAC-R3 | [ ] | `/app/no-access` | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
