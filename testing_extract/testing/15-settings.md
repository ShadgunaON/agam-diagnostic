# 15 — Settings (Company, Currencies, HSN/SAC, Payroll-taxes, Users, Groups, Audit)

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Administrative configuration. Company profile/branding/banking feeds invoices & payslips; currencies/HSN/tax slabs feed finance; Users & Groups drive access; the Audit log records sensitive changes.

> **Users & Groups CRUD/UX is tested here; access *enforcement* is tested in [02 — RBAC](02-rbac-roles-groups.md).** Invite kinds (internal/client/external) are tested in [03 — External & Client Portal](03-external-client-portal.md).

## A. Scope & routes

- `/app/settings` — settings hub (permission-gated sections).
- `/app/settings/company` — company profile, branding, banking, UPI.
- `/app/settings/currencies` — currencies.
- `/app/settings/hsn-sac` — HSN/SAC codes.
- `/app/settings/payroll-taxes` — tax slabs/regimes.
- `/app/settings/users` (+ `/[sub]`) — user management.
- `/app/settings/groups` (+ `/[id]`) — groups.
- `/app/settings/audit` — audit log.

## B. Preconditions

- A1 admin. A second admin to test concurrent edits / audit attribution.

## C. Test cases

### C1. Settings hub

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-1 | [ ] | Hub loads | Open `/app/settings` | Section tiles render | ⬜ | |
| SET-2 | [ ] | Permission gating | As a non-admin with partial settings perms | Only permitted sections show | ⬜ | |
| SET-3 | [ ] | Tile navigation | Click each tile | Opens correct sub-page | ⬜ | |

### C2. Company profile

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-4 | [ ] | Loads | Open company settings | Current values prefilled | ⬜ | |
| SET-5 | [ ] | Edit profile | Change name/address/GSTIN/contact | Saved | ⬜ | |
| SET-6 | [ ] | GSTIN/PAN validation | Invalid format | Format error | ⬜ | |
| SET-7 | [ ] | Logo/branding upload | Upload a logo | Stored; type/size validated; appears on invoices | ⬜ | |
| SET-8 | [ ] | Banking details | Enter bank account, IFSC, UPI | Saved; IFSC validated | ⬜ | |
| SET-9 | [ ] | Reflects on invoice | Open an invoice / public render | Updated company + banking info shows | ⬜ | |
| SET-10 | [ ] | Reflects on payslip | Generate a payslip | Updated branding/company shows | ⬜ | |

### C3. Currencies

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-11 | [ ] | List + add | Add a currency | Saved; available in invoice/expense pickers | ⬜ | |
| SET-12 | [ ] | Validation | Duplicate/invalid code | Blocked | ⬜ | |
| SET-13 | [ ] | Edit/delete | Edit; delete unused | Works; delete-guard if in use | ⬜ | |
| SET-14 | [ ] | Default currency | Set default | Used as default on new invoices | ⬜ | |

### C4. HSN/SAC codes

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-15 | [ ] | List + add | Add an HSN/SAC (code, description, tax rate) | Saved | ⬜ | |
| SET-16 | [ ] | Validation | Invalid code/rate | Blocked | ⬜ | |
| SET-17 | [ ] | Edit/delete | Edit; delete unused | Works; guard if used on invoices | ⬜ | |
| SET-18 | [ ] | Used on invoice line | Open invoice form | Code selectable; tax auto-applies | ⬜ | |

### C5. Payroll taxes

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-19 | [ ] | Slabs load | Open payroll-taxes | Current slabs/regimes render | ⬜ | |
| SET-20 | [ ] | Edit slab | Change a slab threshold/rate | Saved | ⬜ | |
| SET-21 | [ ] | Validation | Overlapping/invalid slab | Blocked/warned | ⬜ | |
| SET-22 | [ ] | Reflects in payroll | Run payroll / use simulator | Uses updated slabs | ⬜ | |

### C6. Users management (CRUD/UX)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-23 | [ ] | Users list | Open `/app/settings/users` | All users + status + kind (internal/client/external) | ⬜ | |
| SET-24 | [ ] | Invite internal | Invite `@orbitnexa.com` + group(s) | Invite sent; appears pending | ⬜ | |
| SET-25 | [ ] | Internal domain rule | Invite non-orbitnexa as internal | Blocked: "must end @orbitnexa.com" | ⬜ | |
| SET-26 | [ ] | Invite-as-employee | Tick "invite as employee" | Employee stub created; Employee group pre-assigned | ⬜ | |
| SET-27 | [ ] | User detail | Open `/[sub]` | Groups, permissions, status, kind | ⬜ | |
| SET-28 | [ ] | Edit access | Add/remove group/permission | Saved (enforcement → [02](02-rbac-roles-groups.md)) | ⬜ | |
| SET-29 | [ ] | Suspend/reactivate | Toggle status | Reflected; login blocked when suspended | ⬜ | |
| SET-30 | [ ] | Resend/revoke invite | Resend or revoke a pending invite | Works | ⬜ | |
| SET-31 | [ ] | Search/filter users | By name/status/kind | Correct rows | ⬜ | |

### C7. Groups (CRUD/UX)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-32 | [ ] | Groups CRUD | Create/edit/delete a custom group | Works (detail → [02](02-rbac-roles-groups.md)) | ⬜ | |
| SET-33 | [ ] | System group locked | Open Administrator | Read-only | ⬜ | |
| SET-34 | [ ] | Members management | Add/remove members | Works | ⬜ | |

### C8. Audit log

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-35 | [ ] | Audit loads | Open `/app/settings/audit` | Entries render with actor + timestamp | ⬜ | |
| SET-36 | [ ] | Records invites | Send an invite, check audit | Entry recorded | ⬜ | |
| SET-37 | [ ] | Records perm changes | Change a permission/group | Entry with before/after | ⬜ | |
| SET-38 | [ ] | Records suspend | Suspend a user | Entry recorded | ⬜ | |
| SET-39 | [ ] | Filter/search audit | By actor/date/action | Correct rows | ⬜ | |
| SET-40 | [ ] | Audit permission | Only `admin.audit`/admin | Others blocked | ⬜ | |

### C9. Permissions & edge cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-41 | [ ] | Non-admin blocked | A2/A3 open restricted settings URLs | No-access | ⬜ | |
| SET-42 | [ ] | Concurrent admin edit | Two admins edit company profile | No silent data loss | ⬜ | |
| SET-43 | [ ] | Cancel/discard | Edit then cancel | Unsaved guard where designed | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)).

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| SET-R1 | [ ] | Settings hub | ⬜ | ⬜ | ⬜ | |
| SET-R2 | [ ] | Company profile form | ⬜ | ⬜ | ⬜ | |
| SET-R3 | [ ] | Currencies / HSN / taxes | ⬜ | ⬜ | ⬜ | |
| SET-R4 | [ ] | Users list + detail (perm picker) | ⬜ | ⬜ | ⬜ | |
| SET-R5 | [ ] | Audit log | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
