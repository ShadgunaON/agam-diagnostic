# 02 — RBAC, Roles, & Groups

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers authorization enforcement at the routing and API (GraphQL) levels based on Cognito custom attributes/groups.

## A. Preconditions
- Accounts for all roles (Patient, Lab Tech, Doctor, Admin, Superadmin, Guest).

## B. Test Cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| RBAC-1 | [ ] | Guest Access | Navigate to `/admin` | Redirected to `/login` | ⬜ | |
| RBAC-2 | [ ] | Guest API Access | Call `/api/graphql` directly via Postman | Request rejected with 401/Unauthorized | ⬜ | |
| RBAC-3 | [ ] | Patient Access | Login as A5 (Patient), visit `/admin` | Access denied (booted back to public or unauthorized screen) | ⬜ | |
| RBAC-4 | [ ] | Admin Access | Login as A2 (Admin), visit `/admin` | Full admin dashboard loads | ⬜ | |
| RBAC-5 | [ ] | Admin Scope | Admin visits Patient Dashboard | Should not be able to act as Patient unless using specific support flow | ⬜ | |
| RBAC-6 | [ ] | Restricted Data | Patient A attempts to view Patient B's report | Access denied / 404 | ⬜ | |
| RBAC-7 | [ ] | Matrix Perms | A4 (Doctor) visits restricted admin module | Matrix denies access if not explicitly granted in DB | ⬜ | |
