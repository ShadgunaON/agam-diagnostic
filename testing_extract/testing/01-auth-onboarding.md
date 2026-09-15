# 01 — Auth & Onboarding

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers sign-in, password reset, the invite-only onboarding flow, and the consent/legal links on the auth screens. The app has **no self-signup** — accounts are created by invite only.

## A. Scope & routes

- `/login` — email + password sign-in (Cognito).
- `/reset-password` — forgot/reset password flow.
- `/signup` — disabled; redirects to `/login`.
- `/auth/accept-invite` — set password & activate an invited account.
- Consent / "I agree to Terms & Privacy" line + legal links shown on the auth screens.

## B. Preconditions

- App URL + a valid A1 (admin) account to send invites.
- A pending invite email (or accept-invite link) for a fresh internal user.
- Know the password policy (length/complexity) from the dev team.
- A user you can safely **suspend** to test blocked login (use a throwaway).

## C. Test cases

### C1. Login

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| AUTH-1 | [ ] | Page loads | Open `/login` while logged out | Login form renders; no console errors | ⬜ | |
| AUTH-2 | [ ] | Email required | Leave email blank, submit | Inline "required" error; no request sent | ⬜ | |
| AUTH-3 | [ ] | Email format | Enter `notanemail`, submit | Inline format validation error | ⬜ | |
| AUTH-4 | [ ] | Password required | Valid email, blank password, submit | Inline "required" error | ⬜ | |
| AUTH-5 | [ ] | Wrong password | Valid email + wrong password | Clear "incorrect email or password" error; no app access | ⬜ | |
| AUTH-6 | [ ] | Unknown email | Email not in system + any password | Generic auth error (does not reveal whether email exists) | ⬜ | |
| AUTH-7 | [ ] | Successful login | A1 valid creds → submit | Redirects to `/app`; nav + user menu render | ⬜ | |
| AUTH-8 | [ ] | Password visibility toggle | Click show/hide eye (if present) | Toggles plaintext/masked | ⬜ | |
| AUTH-9 | [ ] | Submit disabled while pending | Submit, watch button | Button disables/spinner; no double-submit | ⬜ | |
| AUTH-10 | [ ] | Suspended user | Suspend a user (A1), then they log in | Access denied; cannot reach app | ⬜ | |
| AUTH-11 | [ ] | Already logged in | While logged in, visit `/login` | Redirect to app (no second login) | ⬜ | |
| AUTH-12 | [ ] | Deep-link while logged out | Visit `/app/finance/sales/invoices` logged out | Redirect to `/login`; after login, return to intended page (or app home) | ⬜ | |
| AUTH-13 | [ ] | Enter key submits | Fill form, press Enter | Submits the form | ⬜ | |
| AUTH-14 | [ ] | Trim/case | Email with trailing space / mixed case | Handled (trimmed/lowercased) — login still works | ⬜ | |
| AUTH-15 | [ ] | Server error | Force a network failure on submit | Graceful error message, not a white screen | ⬜ | |

### C2. Consent & legal links

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| AUTH-16 | [ ] | Agree line present | View login screen | "I agree to Terms / Privacy" line/links present | ⬜ | |
| AUTH-17 | [ ] | Terms link | Click Terms | Opens `/terms` (new tab or same), correct content | ⬜ | |
| AUTH-18 | [ ] | Privacy link | Click Privacy | Opens `/privacy`, correct content | ⬜ | |
| AUTH-19 | [ ] | Refund link (if shown) | Click Refund/Cancellation | Opens `/refund-policy` | ⬜ | |
| AUTH-20 | [ ] | Consent gating (if a checkbox) | If consent is a required checkbox, leave unchecked + submit | Submit blocked until checked | ⬜ | |

### C3. Reset password

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| AUTH-21 | [ ] | Open reset | From login → "Forgot password" → `/reset-password` | Reset form renders | ⬜ | |
| AUTH-22 | [ ] | Request code | Enter registered email, submit | Confirmation that a code/email was sent | ⬜ | |
| AUTH-23 | [ ] | Unknown email | Enter unregistered email | No account enumeration (same generic message) | ⬜ | |
| AUTH-24 | [ ] | Enter code + new password | Use received code, set new valid password | Success; redirect to login | ⬜ | |
| AUTH-25 | [ ] | Weak password rejected | Enter password violating policy | Inline policy error; blocked | ⬜ | |
| AUTH-26 | [ ] | Mismatch confirm | New password ≠ confirm | "Passwords don't match" error | ⬜ | |
| AUTH-27 | [ ] | Wrong/expired code | Enter invalid or old code | Clear error; can retry | ⬜ | |
| AUTH-28 | [ ] | Login with new password | After reset, log in with new password | Succeeds | ⬜ | |
| AUTH-29 | [ ] | Old password fails | Try old password after reset | Fails | ⬜ | |

### C4. Accept invite / onboarding

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| AUTH-30 | [ ] | Open invite link | Click `/auth/accept-invite` link from email | Accept-invite screen renders with the invited email | ⬜ | |
| AUTH-31 | [ ] | Set password | Enter valid password + confirm, submit | Account activated; can sign in | ⬜ | |
| AUTH-32 | [ ] | Password policy on invite | Weak password | Blocked with policy message | ⬜ | |
| AUTH-33 | [ ] | Expired invite | Use an old/expired invite link | Clear "invite expired" message; not activated | ⬜ | |
| AUTH-34 | [ ] | Reused invite | Use an already-accepted link again | Handled (already active / go to login) | ⬜ | |
| AUTH-35 | [ ] | Tampered link | Alter token in URL | Rejected | ⬜ | |
| AUTH-36 | [ ] | Permissions applied | Log in as the new user | They have exactly the permissions/groups assigned at invite | ⬜ | |
| AUTH-37 | [ ] | "Invite as Employee" | If invited as employee, first sign-in | Lands with self-service HR access; employee stub exists | ⬜ | |

### C5. Signup redirect & logout/session

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| AUTH-38 | [ ] | Signup disabled | Visit `/signup` | Redirects to `/login` | ⬜ | |
| AUTH-39 | [ ] | Logout | Use user menu → Log out | Session cleared; redirect to login; back button can't re-enter app | ⬜ | |
| AUTH-40 | [ ] | Session persists | Log in, close tab, reopen app | Still logged in (within session window) | ⬜ | |
| AUTH-41 | [ ] | Session expiry | Let token expire, then act | Re-auth prompt or redirect to login; no silent broken state | ⬜ | |
| AUTH-42 | [ ] | Multi-tab logout | Log out in one tab, act in another | Other tab also loses access on next action | ⬜ | |

## D. Responsiveness

Run global checks **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)) on each page.

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| AUTH-R1 | [ ] | `/login` | ⬜ | ⬜ | ⬜ | |
| AUTH-R2 | [ ] | `/reset-password` | ⬜ | ⬜ | ⬜ | |
| AUTH-R3 | [ ] | `/auth/accept-invite` | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
