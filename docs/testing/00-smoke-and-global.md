# 00 — Smoke & Global Checks

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Run this suite first to ensure the environment is stable enough for deeper testing.

## A. Preconditions
- Test URL is reachable.
- A1 (Admin) and A5 (Patient) accounts are available.

## B. Smoke Tests

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SMK-1 | [ ] | App Loads | Open homepage logged out | Homepage renders without white screen or 500 errors | ⬜ | |
| SMK-2 | [ ] | Public Catalog | Click Tests in nav | List of tests loads successfully | ⬜ | |
| SMK-3 | [ ] | Login | Log in as A5 (Patient) | Reaches `/dashboard` | ⬜ | |
| SMK-4 | [ ] | Admin Access | Log in as A1 (Admin) | Reaches `/admin`; dashboard metrics load | ⬜ | |
| SMK-5 | [ ] | Sign Out | Click sign out from header | Successfully signs out to public homepage | ⬜ | |
| SMK-6 | [ ] | Global Search (Public) | Search for "Blood" from top bar | Results dropdown appears and populates | ⬜ | |
| SMK-7 | [ ] | 404 Page | Visit `/fake-route-123` | Agam Diagnostics branded 404 page renders | ⬜ | |
| SMK-8 | [ ] | GraphQL Up | View Network tab on load | `/api/graphql` returns 200 OK without unhandled schema errors | ⬜ | |

## C. Sign-off
**Tester:** _______________  
**Date:** _______________  
**Environment/Commit:** _______________
