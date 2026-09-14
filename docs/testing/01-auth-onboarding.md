# 01 — Auth & Onboarding

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers sign-up, sign-in, OTP flows, and session management via AWS Cognito.

## A. Preconditions
- Real email address or phone number for receiving OTPs.

## B. Test Cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| AUTH-1 | [ ] | Page loads | Open `/login` | Sign In/Up form renders cleanly | ⬜ | |
| AUTH-2 | [ ] | Validation | Submit empty login form | Inline validation errors shown | ⬜ | |
| AUTH-3 | [ ] | Sign Up | Fill Sign Up tab with valid email | Sent to OTP verification screen | ⬜ | |
| AUTH-4 | [ ] | OTP Verification | Enter received OTP | Account activated, logged in | ⬜ | |
| AUTH-5 | [ ] | Wrong Password | Log in with incorrect password | Clear error message, access denied | ⬜ | |
| AUTH-6 | [ ] | Successful Login | Log in with correct credentials | Redirected to dashboard/intended page | ⬜ | |
| AUTH-7 | [ ] | Forgot Password | Click Forgot Password, enter email | OTP sent for password reset | ⬜ | |
| AUTH-8 | [ ] | Reset Password | Enter OTP and new password | Password changed, can log in with new | ⬜ | |
| AUTH-9 | [ ] | Session Persistence | Refresh page while logged in | User remains logged in | ⬜ | |
| AUTH-10 | [ ] | Sign Out | Click Profile -> Sign Out | Session cleared, tokens removed | ⬜ | |
