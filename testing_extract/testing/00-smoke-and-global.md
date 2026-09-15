# 00 — Smoke Test & Global Checks

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Run this document **first** every test cycle. If smoke (Section A) fails, stop and report — deeper module testing is blocked. Sections B–E are cross-cutting checks referenced by every module doc.

---

## A. Smoke test (critical path)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SM-1 | [ ] | App loads | Open UAT URL unauthenticated | Redirects to `/login`; no console errors | ⬜ | |
| SM-2 | [ ] | Login | Log in as A1 (admin) | Lands on `/app` dashboard; nav renders | ⬜ | |
| SM-3 | [ ] | Create client | `/app/clients/new` → fill required → Save | Saves; appears in clients list | ⬜ | |
| SM-4 | [ ] | Create project | `/app/projects/new` → link client → Save | Saves; linked to client | ⬜ | |
| SM-5 | [ ] | Create invoice | New invoice → add line item → Save | Totals compute; saves; in list | ⬜ | |
| SM-6 | [ ] | Create employee | `/app/employees/new` → fill required → Save | Saves; in directory | ⬜ | |
| SM-7 | [ ] | Submit expense | `/app/finance/expenses/new` → fill → Save | Saves as draft; in list | ⬜ | |
| SM-8 | [ ] | Logout/login | Log out → log back in as A1 | Session restored; no data loss | ⬜ | |
| SM-9 | [ ] | Deep-link refresh | Hard-refresh on `/app/finance/sales/invoices` | Rehydrates; route gate passes; no flash to no-access | ⬜ | |
| SM-10 | [ ] | No-access route | As A3 (employee), open `/app/settings/users` | Redirects to `/app/no-access` (no data leak) | ⬜ | |

---

## B. Global non-functional checks

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| GL-1 | [ ] | Console clean | Open DevTools console; navigate 10 main pages | No uncaught errors/warnings on normal flows | ⬜ | |
| GL-2 | [ ] | Network clean | DevTools Network tab during normal flows | No 4xx/5xx on valid actions | ⬜ | |
| GL-3 | [ ] | Loading states | Throttle network (Slow 3G); load lists/details | Skeleton/spinner shows; no blank flash | ⬜ | |
| GL-4 | [ ] | Empty states | View a list with no data | Friendly empty state, not an error/blank | ⬜ | |
| GL-5 | [ ] | Error states | Disconnect network mid-load; or hit a failing call | Graceful error + retry, not a white screen | ⬜ | |
| GL-6 | [ ] | Form validation | Submit a form with required fields blank | Inline errors; submit blocked | ⬜ | |
| GL-7 | [ ] | Double-submit | Click Save twice rapidly | Only one record created; button disables while saving | ⬜ | |
| GL-8 | [ ] | Unsaved-changes guard | Edit a form, navigate away | Warns about unsaved changes (where designed) | ⬜ | |
| GL-9 | [ ] | Pagination/sort/filter | On a list, page, sort, filter, search | Each works; results correct | ⬜ | |
| GL-10 | [ ] | Column config persists | Change visible columns; reload | Config restored (localStorage) | ⬜ | |
| GL-11 | [ ] | Back/forward | Navigate then browser Back/Forward | State sane; no stale/broken view | ⬜ | |
| GL-12 | [ ] | Breadcrumbs | On any deep page | Section + page chips correct; links navigate | ⬜ | |
| GL-13 | [ ] | Dark theme | Across all pages | Consistent; no unreadable contrast | ⬜ | |
| GL-14 | [ ] | Session expiry | Let session expire, then act | Re-auth prompt or redirect to login; no silent failure | ⬜ | |
| GL-15 | [ ] | Export | Trigger CSV/PDF export where available | File downloads; columns/content correct | ⬜ | |

---

## C. Notifications bell {#notifications}

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| NB-1 | [ ] | Bell aggregates | Create pending items (e.g. pending leave, expense to approve) | Bell count increases; items listed | ⬜ | |
| NB-2 | [ ] | Bell links | Click a notification | Navigates to the relevant entity/page | ⬜ | |
| NB-3 | [ ] | Bell respects permissions | As a role without a source's permission | That source's items don't appear in their bell | ⬜ | |
| NB-4 | [ ] | Count accuracy | Resolve a pending item | Count decrements accordingly | ⬜ | |

---

## D. Money privacy mode {#money-privacy}

App-wide mask toggle in the top bar; **default = hidden (masked)**.

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| MP-1 | [ ] | Default masked | Fresh login; view any money value | Amounts masked by default | ⬜ | |
| MP-2 | [ ] | Reveal toggle | Click privacy toggle in top bar | All money figures unmask app-wide | ⬜ | |
| MP-3 | [ ] | No leaks (mask ON) | With mask ON, tour invoices, expenses, payroll, dashboards, reports | **Every** amount masked — any unmasked figure is a bug | ⬜ | |
| MP-4 | [ ] | Persistence | Toggle, navigate, reload | State persists as designed | ⬜ | |
| MP-5 | [ ] | Exports/PDF | With mask ON, export/download a doc | Confirm intended behavior (masked vs real) is consistent | ⬜ | |

---

## E. Global sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Browser/OS | |
| Smoke (A) result | __ / 10 |
| Blocking issues | |
