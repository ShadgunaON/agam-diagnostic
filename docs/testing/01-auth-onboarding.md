# 01 — Auth & Onboarding

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the OTP-based progressive sign-in/sign-up flow, patient vs admin routing after login, session handling, and logout.

---

## A. Scope & routes

- `/login` — Progressive OTP sign-in / sign-up (patients and admins use the same entry point)
- `/dashboard` — Patient lands here after login
- `/admin` — Admin/Staff land here after login
- `/privacy-policy` and `/terms` — linked from auth screen

---

## B. Preconditions

- UAT URL reachable.
- A1 (Admin) account confirmed working.
- A5 (Patient) account with a registered mobile/email available.
- A fresh invite (phone/email) available to test new user registration.
- Ability to view OTP in test SMS/email.

---

## C. Test Cases

### C1. Page Load & Layout

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| AUTH-1 | [ ] | Login page loads | Open `/login` while logged out | Sign-in form renders; no console errors; no white screen | ⬜ | |
| AUTH-2 | [ ] | Branding present | View login page | Agam Diagnostics logo and branding visible | ⬜ | |
| AUTH-3 | [ ] | Legal links present | View login page | Links to Terms and Privacy Policy visible and clickable | ⬜ | |
| AUTH-4 | [ ] | Terms link | Click Terms link | Opens `/terms`; correct content renders | ⬜ | |
| AUTH-5 | [ ] | Privacy link | Click Privacy Policy link | Opens `/privacy-policy`; correct content renders | ⬜ | |
| AUTH-6 | [ ] | Already logged in (patient) | While logged in as A5, visit `/login` | Redirected to `/dashboard`; no second login screen | ⬜ | |
| AUTH-7 | [ ] | Already logged in (admin) | While logged in as A1, visit `/login` | Redirected to `/admin`; no second login screen | ⬜ | |

### C2. OTP Login — Email/Phone Entry

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| AUTH-8 | [ ] | Field required | Submit form with identifier blank | Inline "required" validation error; no OTP sent | ⬜ | |
| AUTH-9 | [ ] | Invalid format | Enter `notanemail` or `123` as phone | Inline format validation error | ⬜ | |
| AUTH-10 | [ ] | Valid email entry | Enter registered patient email; submit | OTP sent confirmation shown; OTP input step appears | ⬜ | |
| AUTH-11 | [ ] | Valid phone entry | Enter registered patient phone number; submit | OTP sent confirmation shown; OTP input step appears | ⬜ | |
| AUTH-12 | [ ] | Unregistered contact | Enter email/phone not in system | Either: new-user registration step begins, or generic prompt — no system data leaked | ⬜ | |
| AUTH-13 | [ ] | Submit disables button | Click Send OTP; watch button state | Button disables / shows spinner during request; no double-send | ⬜ | |
| AUTH-14 | [ ] | Trim/case handling | Enter email with trailing space or mixed case | Handled gracefully (trimmed/lowercased); OTP still sent | ⬜ | |

### C3. OTP Verification

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| AUTH-15 | [ ] | Correct OTP — patient | Enter correct OTP for A5 | Authenticated; redirected to `/dashboard` | ⬜ | |
| AUTH-16 | [ ] | Correct OTP — admin/staff | Enter correct OTP for A1 | Authenticated; redirected to `/admin` | ⬜ | |
| AUTH-17 | [ ] | Wrong OTP | Enter incorrect OTP | Clear error message "Invalid OTP"; form stays; can retry | ⬜ | |
| AUTH-18 | [ ] | Expired OTP | Wait for OTP to expire; enter old code | Clear error "OTP expired"; prompted to resend | ⬜ | |
| AUTH-19 | [ ] | Resend OTP | Click "Resend OTP" | New OTP sent; timer resets; old OTP invalidated | ⬜ | |
| AUTH-20 | [ ] | OTP field format | Enter letters or special chars | Only digits accepted; or clear validation error | ⬜ | |
| AUTH-21 | [ ] | OTP submit via Enter | Fill OTP field, press Enter | Submits verification | ⬜ | |
| AUTH-22 | [ ] | OTP empty | Submit OTP step with blank field | Inline "required" error; no request sent | ⬜ | |
| AUTH-23 | [ ] | Server error on verify | Force network failure during OTP submit | Graceful error toast; can retry | ⬜ | |

### C4. New User Registration (if applicable)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| AUTH-24 | [ ] | New contact triggers registration | Enter a phone/email not in system | Registration step or name-capture step appears | ⬜ | |
| AUTH-25 | [ ] | Name required | Submit registration with name blank | Inline required error | ⬜ | |
| AUTH-26 | [ ] | Complete registration | Fill name + OTP; submit | Account created; redirected to `/dashboard` | ⬜ | |
| AUTH-27 | [ ] | Duplicate registration | Use already-registered contact to register again | Treated as login, not duplicate creation | ⬜ | |

### C5. Session & Logout

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| AUTH-28 | [ ] | Session persists | Log in, close tab, reopen app URL | Still authenticated within session window | ⬜ | |
| AUTH-29 | [ ] | Session expiry | Let token expire naturally; then perform any action | Re-auth prompt or redirect to `/login`; no silent failure | ⬜ | |
| AUTH-30 | [ ] | Logout | Click Sign Out from user/header menu | Session cleared; redirected to `/`; browser back can't re-enter portal | ⬜ | |
| AUTH-31 | [ ] | Multi-tab logout | Log out in one tab; act in another open tab | Other tab loses access on next action | ⬜ | |
| AUTH-32 | [ ] | Deep-link redirect | Visit `/dashboard` while logged out | Redirected to `/login`; after login, lands on dashboard (or app home) | ⬜ | |
| AUTH-33 | [ ] | Admin deep-link while out | Visit `/admin/bookings` while logged out | Redirected to `/login`; admin route gated | ⬜ | |

### C6. Route-based Role Segregation

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| AUTH-34 | [ ] | Patient can't access admin | Logged in as A5; navigate to `/admin` | Redirected out; no admin data shown | ⬜ | |
| AUTH-35 | [ ] | Admin can access admin | Logged in as A1; navigate to `/admin` | Admin dashboard loads | ⬜ | |
| AUTH-36 | [ ] | Patient portal is patient-scoped | Logged in as A5; visit `/dashboard` | Shows only own bookings and reports — no other patient data | ⬜ | |

---

## D. Responsiveness

Run global checks GL-13 (see [00 — Smoke](00-smoke-and-global.md)) on each page.

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| AUTH-R1 | [ ] | `/login` — identifier step | ⬜ | ⬜ | ⬜ | |
| AUTH-R2 | [ ] | `/login` — OTP step | ⬜ | ⬜ | ⬜ | |
| AUTH-R3 | [ ] | `/login` — registration step | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 36 |
| S1/S2 bugs filed | |
