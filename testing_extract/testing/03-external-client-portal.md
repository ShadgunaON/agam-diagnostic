# 03 — External & Client Portal Users

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Two non-internal user kinds. **External users** get the internal admin app but with a **hard read-only ceiling** (`EXTERNAL_ALLOWED_PERMISSIONS`) — the risk is any write or over-exposure beyond that ceiling. **Client portal users** get a portal scoped to a single client — the risk is a **cross-client data leak**. Both must be enforced **server-side**, not just hidden in the UI.

## A. Scope & routes

- External invite flow in `/app/settings/users` (kind = External, view-bundle picker).
- The external user's restricted admin views (same pages as staff, read-only viewport).
- Client invite flow (kind = Client, must link a client).
- Client portal routes (the portal area a client logs into).

## B. Preconditions

- A1 admin to send invites.
- A4 external account; A5 client account.
- **At least two clients** with data (projects, invoices, expenses) to verify cross-client isolation.

## B2. Reference — external view bundles (verify against `shared/src/rbac/permissions.ts`)

| Bundle | Read-only? | Grants (broadly) |
|--------|-----------|------------------|
| Expenses | Yes | View all expenses + lookups |
| Expense reports | Yes | Reports dashboard |
| Expense budgets | Yes | Budgets/utilization |
| Finance dashboard | Yes | KPIs, taxes, activity |
| Invoices & payments | Yes | Invoices, estimates, payments |
| Projects | Yes | Project list/detail |
| Clients | Yes | Client directory |
| Vendors | Yes | Vendor directory (**bank #s masked**) |
| Export | add-on | Allow CSV/PDF downloads |
| **Expense management** | **No (write)** | Create/edit/submit/approve/reject/mark-paid |
| **Invoice management** | **No (write)** | Create/edit/send/mark-paid |
| **Settings — Taxes & currencies** | **No (write)** | Manage taxes/currencies/HSN |

## C. Test cases

### C1. Inviting an external user

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXT-1 | [ ] | External invite UI | A1 → Users → Invite → kind = External | Bundle picker appears; group picker hidden | ⬜ | |
| EXT-2 | [ ] | Block @orbitnexa.com | Enter an `@orbitnexa.com` email as External | Blocked: "use Internal teammate for @orbitnexa.com" | ⬜ | |
| EXT-3 | [ ] | Any other domain allowed | Enter a non-orbitnexa email | Accepted | ⬜ | |
| EXT-4 | [ ] | Pick read-only bundles | Select e.g. Invoices + Projects | Only selected views will be visible to the user | ⬜ | |
| EXT-5 | [ ] | No groups for external | Confirm there's no way to add external to a group | Group assignment not offered | ⬜ | |
| EXT-6 | [ ] | Send invite | Submit | Invite created; user marked "External" | ⬜ | |

### C2. External user — read-only enforcement

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXT-7 | [ ] | Granted view loads | A4 opens a granted view (e.g. Invoices) | Data visible, read-only | ⬜ | |
| EXT-8 | [ ] | No write buttons | Inspect granted views | No Create/Edit/Delete/Approve/Send buttons | ⬜ | |
| EXT-9 | [ ] | Non-granted module blocked | A4 opens a module not in their bundles | `/app/no-access` | ⬜ | |
| EXT-10 | [ ] | Direct /new URL blocked | A4 types `/app/finance/sales/invoices/new` | Blocked (no create form) | ⬜ | |
| EXT-11 | [ ] | Server-side write block | A4 attempts a write via API/devtools (or a `/edit` URL) | **403 server-side**, not just UI-hidden | ⬜ | |
| EXT-12 | [ ] | Vendor bank masking | A4 with Vendors bundle opens a vendor | Bank account numbers masked | ⬜ | |
| EXT-13 | [ ] | Export gating | Without Export add-on, look for export | Export disabled/absent; with add-on, allowed | ⬜ | |
| EXT-14 | [ ] | Money privacy | A4 views amounts | Respects privacy mode like staff | ⬜ | |

### C3. External user — write bundles

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXT-15 | [ ] | Expense management bundle | Grant Expense management; A4 creates/approves an expense | Those specific writes work | ⬜ | |
| EXT-16 | [ ] | Scope of write bundle | With only Expense management, try invoice write | Invoice writes still blocked | ⬜ | |
| EXT-17 | [ ] | Invoice management bundle | Grant it; A4 creates/sends an invoice | Works; other modules stay read-only | ⬜ | |
| EXT-18 | [ ] | Settings taxes bundle | Grant it; A4 edits a tax/currency | Works; nothing else writable | ⬜ | |

### C4. Promotion / kind immutability

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXT-19 | [ ] | Can't promote external | A1 tries to make A4 an Employee or add to a group | Not possible (UI hidden AND server rejects) | ⬜ | |
| EXT-20 | [ ] | Kind locked | A1 tries to change A4's kind to internal | Not allowed | ⬜ | |

### C5. Inviting a client portal user

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXT-21 | [ ] | Client invite UI | A1 → Users → Invite → kind = Client | Client picker shown; email auto-fills from client's primary contact (editable) | ⬜ | |
| EXT-22 | [ ] | Client link required | Try to invite without selecting a client | Blocked | ⬜ | |
| EXT-23 | [ ] | Any email domain | Use any domain | Accepted | ⬜ | |
| EXT-24 | [ ] | Auto Client group | Send invite | User auto-assigned Client group; can't be added to other groups | ⬜ | |

### C6. Client portal — access & data scope

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXT-25 | [ ] | Portal loads | A5 logs in | Lands on client portal (not the staff admin app) | ⬜ | |
| EXT-26 | [ ] | Sees own data only | A5 views projects/invoices/expenses | Only their linked client's records | ⬜ | |
| EXT-27 | [ ] | **Cross-client isolation** | Note an ID from another client; A5 tries that URL/ID | Blocked — cannot see another client's data | ⬜ | |
| EXT-28 | [ ] | No admin app | A5 types a staff URL (e.g. `/app/settings/users`) | Blocked | ⬜ | |
| EXT-29 | [ ] | Approve billable expense | If granted, A5 approves a client expense | Works within their scope | ⬜ | |
| EXT-30 | [ ] | Comments / uploads | A5 posts a comment / uploads a document where permitted | Saved; visible to staff | ⬜ | |
| EXT-31 | [ ] | Read-only elsewhere | A5 tries an action not in client perms | Blocked | ⬜ | |
| EXT-32 | [ ] | Multiple contacts per client | Invite a 2nd contact for same client | Both see the same client's data | ⬜ | |

### C7. Client task approval (portal side)

> Staff-completed client tasks land here for sign-off (staff side in [14 — Tasks](14-tasks-submissions.md#c1b-client-task-approval-loop)). The client **Approves** or **Requests revision** — and must **never see any price**. Precondition: staff marked a client task complete (TSK-12b) so A5 has a pending approval.

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| EXT-33 | [ ] | Approval request visible | A5 logs in after staff completes a task | Pending task appears for review (and an email was received) | ⬜ | |
| EXT-34 | [ ] | Approve | A5 clicks **Approve** | Status updates to approved; staff notified; unlocks invoicing on staff side | ⬜ | |
| EXT-35 | [ ] | Request revision | A5 clicks **Request revision** + note | Task returns to staff with the note; not billable yet | ⬜ | |
| EXT-36 | [ ] | No price shown | Inspect the task + the email A5 received | **No monetary amount/price** is ever shown to the client | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)).

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| EXT-R1 | [ ] | External invite flow (Users) | ⬜ | ⬜ | ⬜ | |
| EXT-R2 | [ ] | External read-only views | ⬜ | ⬜ | ⬜ | |
| EXT-R3 | [ ] | Client portal dashboard | ⬜ | ⬜ | ⬜ | |
| EXT-R4 | [ ] | Client portal project/invoice detail | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
