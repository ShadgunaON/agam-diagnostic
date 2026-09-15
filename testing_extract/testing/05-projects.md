# 05 — Projects

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Project management: create/list/view/edit projects, manage milestones, tasks and status. A project must link to a client. Governed by `projects.*` permissions.

> **Note:** verify exact field labels against the live forms; log mismatches. Test every field/button/state that exists.

## A. Scope & routes

- `/app/projects` — list.
- `/app/projects/new` — create.
- `/app/projects/[id]` — detail (milestones, tasks, status, team, documents).
- `/app/projects/edit/[id]` — edit.

## B. Preconditions

- At least one **client** exists (projects link to clients).
- A1 + a user with `projects.*` permissions.
- Optionally employees to assign to a project team.

## C. Test cases

### C1. Projects list

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PRJ-1 | [ ] | List loads | Open `/app/projects` | Table renders | ⬜ | |
| PRJ-2 | [ ] | Empty/loading/error | No data / throttle / force fail | Each state renders correctly | ⬜ | |
| PRJ-3 | [ ] | Search | Search by project/client name | Filters correctly | ⬜ | |
| PRJ-4 | [ ] | Sort columns | Click each sortable header | Sorts correctly | ⬜ | |
| PRJ-5 | [ ] | Status filter | Filter by status | Only matching rows | ⬜ | |
| PRJ-6 | [ ] | Client filter | Filter by client (if present) | Only that client's projects | ⬜ | |
| PRJ-7 | [ ] | Pagination & column config | Page + toggle columns + reload | Works; config persists | ⬜ | |
| PRJ-8 | [ ] | Row → detail | Click a row | Opens detail | ⬜ | |
| PRJ-9 | [ ] | New button | Click New | Opens create form | ⬜ | |

### C2. Create project

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PRJ-10 | [ ] | Required fields | Submit empty | Inline errors; no save | ⬜ | |
| PRJ-11 | [ ] | Client link required | Save without a client | Blocked | ⬜ | |
| PRJ-12 | [ ] | Client picker | Select a client | Linked correctly; shows on detail | ⬜ | |
| PRJ-13 | [ ] | Name | Enter valid name | Accepted | ⬜ | |
| PRJ-14 | [ ] | Dates | Set start & end dates | Saved; **end ≥ start** enforced | ⬜ | |
| PRJ-15 | [ ] | Invalid date range | End before start | Validation error | ⬜ | |
| PRJ-16 | [ ] | Budget/value | Enter budget | Numeric only; negatives rejected | ⬜ | |
| PRJ-17 | [ ] | Status default | Create new | Sensible default status (e.g. planning/active) | ⬜ | |
| PRJ-18 | [ ] | Team/assignees (if present) | Assign employees | Saved | ⬜ | |
| PRJ-19 | [ ] | Description/long text | Long text + special chars | Handled | ⬜ | |
| PRJ-20 | [ ] | Save success | Valid data → Save | Saved; appears in list; linked to client | ⬜ | |
| PRJ-21 | [ ] | Cancel/discard | Cancel mid-edit | Returns to list; unsaved guard if any | ⬜ | |
| PRJ-22 | [ ] | Double-submit | Save twice fast | One project created | ⬜ | |

### C3. Project detail

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PRJ-23 | [ ] | Detail loads | Open a project | Header + sections render | ⬜ | |
| PRJ-24 | [ ] | Client link | Click linked client | Opens client detail | ⬜ | |
| PRJ-25 | [ ] | Documents | Upload/download/delete | Works; type/size validated | ⬜ | |
| PRJ-26 | [ ] | Invalid ID | Open non-existent project | Graceful not-found | ⬜ | |
| PRJ-27 | [ ] | Edit shortcut | Click Edit | Opens edit prefilled | ⬜ | |

### C4. Edit project

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PRJ-28 | [ ] | Prefill | Open `/edit/[id]` | All fields prefilled | ⬜ | |
| PRJ-29 | [ ] | Change & save | Edit field → Save | Persists | ⬜ | |
| PRJ-30 | [ ] | Revalidation | Clear required → Save | Blocked | ⬜ | |
| PRJ-31 | [ ] | Change client | Re-link to another client | Updates correctly | ⬜ | |

### C5. Milestones & tasks

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PRJ-32 | [ ] | Add milestone | Add a milestone (name, date, amount/%) | Saved; listed | ⬜ | |
| PRJ-33 | [ ] | Edit milestone | Edit a milestone | Persists | ⬜ | |
| PRJ-34 | [ ] | Complete milestone | Mark complete | Status updates; reflected in progress | ⬜ | |
| PRJ-35 | [ ] | Delete milestone | Delete | Confirm + removed | ⬜ | |
| PRJ-36 | [ ] | Project tasks | Create/assign a task within the project | Appears in Tasks module too (see [14](14-tasks-submissions.md)) | ⬜ | |

### C5b. Milestone ↔ task billing

> A milestone can be **billed from its completed/approved tasks**: pull tasks into a milestone and its amount **auto-sums** each task's bill amount; generating an invoice from that milestone produces **one line item per task**. Preconditions: a project with several tasks, some marked **completed** (and client-approved where applicable, see [14](14-tasks-submissions.md)), each carrying a bill amount.

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PRJ-44 | [ ] | Pull tasks into milestone | Open a milestone → add completed/approved tasks | Tasks attach (`milestoneId` set); listed under the milestone | ⬜ | |
| PRJ-45 | [ ] | Auto-sum bill amount | After attaching tasks | Milestone amount = **sum of attached task bill amounts** | ⬜ | |
| PRJ-46 | [ ] | Only eligible tasks | Try to add an incomplete/unapproved task | Not selectable / blocked | ⬜ | |
| PRJ-47 | [ ] | Detach task | Remove a task from the milestone | Milestone amount **recalculates** | ⬜ | |
| PRJ-48 | [ ] | Invoice from milestone | Generate an invoice from the milestone | Invoice has **one line per task**; amounts match (cross-check [07](07-invoices.md)) | ⬜ | |
| PRJ-49 | [ ] | Back-links | After invoicing | The milestone's tasks are linked to the invoice (no double-billing) | ⬜ | |

### C6. Status transitions

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PRJ-37 | [ ] | Valid transition | Move status forward (e.g. active→completed) | Allowed; reflected everywhere | ⬜ | |
| PRJ-38 | [ ] | Invalid transition | Attempt a disallowed jump (if rules exist) | Blocked | ⬜ | |
| PRJ-39 | [ ] | Dashboard reflect | After status change | Project counts/dashboards update | ⬜ | |

### C7. Permissions & edge cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PRJ-40 | [ ] | No view perm | User without `projects.view` | `/app/no-access` | ⬜ | |
| PRJ-41 | [ ] | No create perm | Without `projects.create` | No New button; `/new` blocked | ⬜ | |
| PRJ-42 | [ ] | No edit/delete perm | View-only user | No edit/delete actions | ⬜ | |
| PRJ-43 | [ ] | Delete with invoices | Delete a project that has invoices | Blocked/warned (no orphans) | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)).

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| PRJ-R1 | [ ] | Projects list | ⬜ | ⬜ | ⬜ | |
| PRJ-R2 | [ ] | Create/Edit form | ⬜ | ⬜ | ⬜ | |
| PRJ-R3 | [ ] | Project detail (milestones/tasks) | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
