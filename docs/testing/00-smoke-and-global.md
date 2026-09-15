# 00 — Smoke Test & Global Checks

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Run this document **first** every test cycle. If smoke (Section A) fails, stop and report — deeper module testing is blocked. Sections B–D are cross-cutting checks referenced by every module doc.

---

## A. Scope & routes

Critical path across both the **Public Site** and the **Admin Portal**:

- `/` — public homepage
- `/login` — OTP-based sign-in / sign-up
- `/tests` — test catalog
- `/bookings` — booking wizard
- `/dashboard` — patient portal
- `/admin` — admin dashboard
- `/admin/bookings` — admin booking workspace

---

## B. Smoke Test (critical path)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SMK-1 | [ ] | Public homepage loads | Open UAT URL unauthenticated | Homepage renders (Hero, nav, footer); no console errors | ⬜ | |
| SMK-2 | [ ] | Test catalog loads | Click "Tests" in public nav | `/tests` lists active tests with name, price, category | ⬜ | |
| SMK-3 | [ ] | Test detail loads | Click any test | Detail page renders (overview, what it checks, FAQs) | ⬜ | |
| SMK-4 | [ ] | Patient login | Log in as A5 (Patient) via OTP | Redirects to `/dashboard`; patient nav renders | ⬜ | |
| SMK-5 | [ ] | Booking flow opens | From catalog, click "Book Now" | Booking wizard opens at Step 1 | ⬜ | |
| SMK-6 | [ ] | Admin login | Log in as A1 (Admin) | Redirects to `/admin`; KPIs and recent bookings load | ⬜ | |
| SMK-7 | [ ] | Admin bookings workspace | A1: open `/admin/bookings` | Booking list renders; tabs (All/Home/Lab) functional | ⬜ | |
| SMK-8 | [ ] | Admin patients | A1: open `/admin/patients` | Patient directory loads with KPI cards | ⬜ | |
| SMK-9 | [ ] | Admin catalog | A1: open `/admin/catalog` | Tabs render (Tests/Services/Packages); items list | ⬜ | |
| SMK-10 | [ ] | Admin reports | A1: open `/admin/reports` | Reports queue renders; pending count badge visible | ⬜ | |
| SMK-11 | [ ] | Logout | Patient: user menu → Sign out | Session cleared; redirected to `/`; back button can't re-enter portal | ⬜ | |
| SMK-12 | [ ] | 404 page | Visit `/nonexistent-route-xyz` | Agam Diagnostics branded 404 page renders | ⬜ | |
| SMK-13 | [ ] | GraphQL health | Check Network tab on any admin page | `/api/graphql` returns 200; no unhandled schema errors | ⬜ | |
| SMK-14 | [ ] | No-access gate | Log in as A5 (Patient), visit `/admin` | Redirected out of admin; no admin data exposed | ⬜ | |

---

## C. Global Non-Functional Checks

These apply to **every** page in the app. Reference these from each module doc rather than repeating.

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| GL-1 | [ ] | Console clean | Open DevTools Console; navigate 10+ main pages | No uncaught JS errors or warnings on normal flows | ⬜ | |
| GL-2 | [ ] | Network clean | DevTools Network tab during all normal flows | No 4xx/5xx responses on valid actions | ⬜ | |
| GL-3 | [ ] | Loading states | Throttle to Slow 3G; load any list or detail page | Skeleton / spinner renders; no blank white flash | ⬜ | |
| GL-4 | [ ] | Empty states | View any list with zero items | Friendly empty-state illustration/message, not a crash | ⬜ | |
| GL-5 | [ ] | Error states | Disconnect network mid-load, or hit a failing API call | Graceful error UI + retry option; no white screen | ⬜ | |
| GL-6 | [ ] | Form validation | Submit any form with required fields blank | Inline validation errors appear; submission is blocked | ⬜ | |
| GL-7 | [ ] | Double-submit guard | Click any Save/Submit button twice rapidly | Only one record created; button disables during save | ⬜ | |
| GL-8 | [ ] | Pagination | On any list, click Next/Prev page | Correct items load; cursor/page state is correct | ⬜ | |
| GL-9 | [ ] | Sort & filter | On any list, change sort and apply filters | Results update correctly and consistently | ⬜ | |
| GL-10 | [ ] | Search debounce | Type in any search field rapidly | Results update after debounce delay (≈500 ms), not per-keystroke | ⬜ | |
| GL-11 | [ ] | Browser back/forward | Navigate deep, then use browser Back/Forward | State sane; no stale or broken view | ⬜ | |
| GL-12 | [ ] | Session expiry | Let auth token expire, then perform an action | Re-auth prompt or redirect to login; no silent failure or data leak | ⬜ | |
| GL-13 | [ ] | Responsive layout | View every tested page at 390 / 768 / 1440 px | No overflow, truncation, or broken layout | ⬜ | |
| GL-14 | [ ] | Dark/light consistency | Toggle theme (if supported); review all pages | No unreadable contrast or unstyled elements | ⬜ | |
| GL-15 | [ ] | Image loading | Navigate to pages with images/banners | Images load; no broken-image icons | ⬜ | |
| GL-16 | [ ] | Keyboard navigation | Tab through any form/page | Focus rings visible; all interactive elements reachable via keyboard | ⬜ | |

---

## D. Notifications & Toast System

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| NTF-1 | [ ] | Success toast | Complete any successful action (e.g. save settings) | Green success toast appears and auto-dismisses | ⬜ | |
| NTF-2 | [ ] | Error toast | Trigger a server-side error | Red error toast appears with meaningful message | ⬜ | |
| NTF-3 | [ ] | Info toast | Trigger an informational action | Info toast appears correctly | ⬜ | |
| NTF-4 | [ ] | Toast dismiss | Click the × on a toast | Dismisses immediately | ⬜ | |
| NTF-5 | [ ] | Multiple toasts | Trigger several actions quickly | Toasts stack or queue; don't overlay each other unreadably | ⬜ | |

---

## E. Global Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Browser / OS | |
| Smoke (B) result | __ / 14 |
| Blocking issues | |
