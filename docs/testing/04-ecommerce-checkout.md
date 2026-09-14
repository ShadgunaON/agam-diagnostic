# 04 — E-Commerce & Checkout

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers cart functionality, the booking checkout form, and the PhonePe payment flow. 

**CRITICAL:** ALL payment testing must be done using PhonePe Sandbox/UAT mode.

## A. Preconditions
- Items added to the cart.
- Logged in as Patient (A5).

## B. Test Cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| ECO-1 | [ ] | Add to Cart | From catalog detail, click Add to Cart | Cart counter increments, item shows in cart drawer | ⬜ | |
| ECO-2 | [ ] | Duplicate Items | Try to add the same item again | Ignored or shows "Already in cart" | ⬜ | |
| ECO-3 | [ ] | Remove from Cart | Open cart, click remove | Item removed, total updates | ⬜ | |
| ECO-4 | [ ] | Checkout Unauth | While logged out, open cart -> Checkout | Redirected to `/login`, then back to `/book` | ⬜ | |
| ECO-5 | [ ] | Checkout Form | Fill `/book` form with missing fields | Shows validation errors | ⬜ | |
| ECO-6 | [ ] | Idempotency | Double-click "Pay" button | Only one booking/invoice is created | ⬜ | |
| ECO-7 | [ ] | PhonePe Redirect | Submit valid checkout form | Redirects securely to PhonePe Sandbox | ⬜ | |
| ECO-8 | [ ] | Payment Success | Simulate success on PhonePe | Redirected to Success page. Invoice is Paid. Booking is Confirmed. | ⬜ | |
| ECO-9 | [ ] | Payment Failure | Simulate failure on PhonePe | Redirected to Failure page. Invoice Unpaid. Booking Pending. | ⬜ | |
| ECO-10| [ ] | Cancel Payment | Click "Cancel" on PhonePe | Same as failure. State remains clean. | ⬜ | |
