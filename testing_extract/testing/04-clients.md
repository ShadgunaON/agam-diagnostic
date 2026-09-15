# 04 — Clients

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Client directory: create/list/view/edit/delete/export clients and see their linked projects, invoices and documents. Governed by `clients.*` permissions.

> **Note on field labels:** the exact field set may differ slightly from this list — verify against the live form and log any mismatch. The point is to test *every* field/button/state that exists.

## A. Scope & routes

- `/app/clients` — list (search/filter/sort/paginate/export).
- `/app/clients/new` — create client.
- `/app/clients/[id]` — client detail (linked projects/invoices/contacts/documents).

## B. Preconditions

- A1 admin, plus a user with `clients.view`/`clients.create`/`clients.edit`/`clients.delete` to test gating (A2 Finance has clients access per group).
- Have at least one project/invoice linked to a client to test the delete-guard and detail tabs.

## C. Test cases

### C1. Clients list

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CLI-1 | [ ] | List loads | Open `/app/clients` | Table renders with clients; no console errors | ⬜ | |
| CLI-2 | [ ] | Empty state | View list with no clients (or filter to none) | Friendly empty state, not error/blank | ⬜ | |
| CLI-3 | [ ] | Loading state | Throttle network, reload | Skeleton/spinner shows | ⬜ | |
| CLI-4 | [ ] | Error state | Force API failure | Graceful error + retry | ⬜ | |
| CLI-5 | [ ] | Search | Type a client name/email | Filters to matches; clearing restores | ⬜ | |
| CLI-6 | [ ] | Sort each column | Click each sortable header | Sorts asc/desc correctly | ⬜ | |
| CLI-7 | [ ] | Status filter | Filter by status (active/inactive/etc.) | Only matching rows | ⬜ | |
| CLI-8 | [ ] | Pagination | Page through results | Correct page sizes & navigation | ⬜ | |
| CLI-9 | [ ] | Column config persists | Toggle columns, reload | Config restored (localStorage) | ⬜ | |
| CLI-10 | [ ] | Row → detail | Click a row | Opens `/app/clients/[id]` | ⬜ | |
| CLI-11 | [ ] | New button | Click "New client" | Opens create form | ⬜ | |

### C2. Create client

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CLI-12 | [ ] | Open form | `/app/clients/new` | Form renders with all fields | ⬜ | |
| CLI-13 | [ ] | Required fields | Submit empty | Inline errors on each required field; no save | ⬜ | |
| CLI-14 | [ ] | Name | Enter valid company/contact name | Accepted | ⬜ | |
| CLI-15 | [ ] | Email format | Enter invalid email | Format error | ⬜ | |
| CLI-16 | [ ] | Phone format | Enter invalid/long phone | Validated/normalized | ⬜ | |
| CLI-17 | [ ] | Tax/GSTIN (if present) | Enter invalid GST number | Format validation (15-char GSTIN) | ⬜ | |
| CLI-18 | [ ] | Address fields | Fill address/city/state/country/pincode | Saved correctly | ⬜ | |
| CLI-19 | [ ] | Status select | Choose status | Saved | ⬜ | |
| CLI-20 | [ ] | Long/special chars | Very long name, emoji, quotes | Handled without breaking layout/save | ⬜ | |
| CLI-21 | [ ] | Save success | Fill valid data, Save | Saves; toast; appears in list | ⬜ | |
| CLI-22 | [ ] | Duplicate detection | Create with same name/email/GST | Warned or blocked (if dedup exists) | ⬜ | |
| CLI-23 | [ ] | Cancel/discard | Edit then Cancel | Returns to list; unsaved-changes guard if prompted | ⬜ | |
| CLI-24 | [ ] | Double-submit | Click Save twice | Only one client created | ⬜ | |

### C3. Client detail

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CLI-25 | [ ] | Detail loads | Open a client | Header + all sections/tabs render | ⬜ | |
| CLI-26 | [ ] | Linked projects | View projects tab/section | Lists that client's projects; links work | ⬜ | |
| CLI-27 | [ ] | Linked invoices | View invoices section | Shows invoices + statuses/amounts (privacy-masked) | ⬜ | |
| CLI-28 | [ ] | Contacts | View/add/edit contacts (if supported) | CRUD works | ⬜ | |
| CLI-29 | [ ] | Documents | Upload/download/delete a document | Works; file type/size validated | ⬜ | |
| CLI-30 | [ ] | Edit shortcut | Click Edit from detail | Opens edit form prefilled | ⬜ | |
| CLI-31 | [ ] | Invalid ID | Open `/app/clients/does-not-exist` | Graceful not-found, not crash | ⬜ | |

### C4. Edit client

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CLI-32 | [ ] | Prefill | Open edit | All fields prefilled with current values | ⬜ | |
| CLI-33 | [ ] | Change & save | Edit a field, Save | Persists; reflected in list/detail | ⬜ | |
| CLI-34 | [ ] | Revalidation | Clear a required field, Save | Blocked with error | ⬜ | |
| CLI-35 | [ ] | Status change | Change status active↔inactive | Reflected in list filter | ⬜ | |

### C5. Delete & export

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CLI-36 | [ ] | Delete confirm | Delete a client | Confirmation dialog before delete | ⬜ | |
| CLI-37 | [ ] | Delete unlinked | Delete a client with no links | Removed from list | ⬜ | |
| CLI-38 | [ ] | Delete linked guard | Delete a client with projects/invoices | Blocked or warned (no orphaned records) | ⬜ | |
| CLI-39 | [ ] | Export CSV | Export the list | File downloads; columns/values correct | ⬜ | |
| CLI-40 | [ ] | Export respects filter | Filter then export | Export matches filtered set (confirm intended behavior) | ⬜ | |

### C6. Permissions & edge cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CLI-41 | [ ] | No view perm | User without `clients.view` opens `/app/clients` | `/app/no-access` | ⬜ | |
| CLI-42 | [ ] | No create perm | User without `clients.create` | No "New client" button; `/new` blocked | ⬜ | |
| CLI-43 | [ ] | No edit perm | View-only user | No Edit button; `/edit` blocked | ⬜ | |
| CLI-44 | [ ] | No delete perm | Non-delete user | No Delete action | ⬜ | |
| CLI-45 | [ ] | Concurrent edit | Two users edit same client | Last-write or conflict handling is sane (no silent data loss) | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)).

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| CLI-R1 | [ ] | Clients list (table→cards/scroll) | ⬜ | ⬜ | ⬜ | |
| CLI-R2 | [ ] | Create/Edit form | ⬜ | ⬜ | ⬜ | |
| CLI-R3 | [ ] | Client detail (tabs/sections) | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
