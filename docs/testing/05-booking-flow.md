# 05 — Booking Flow

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the full end-to-end patient booking journey — from test/package selection through slot selection, patient information, collection type (Home vs Lab), order confirmation, and post-booking status page.

---

## A. Scope & routes

- `/bookings` — Multi-step booking wizard
- `/book` — Quick-book entry (redirect to wizard)
- `/bookings/[bookingId]` — Booking confirmation / status page

---

## B. Preconditions

- At least 1 active test, 1 package, and 1 service available.
- Booking slots configured in the system (Lab and Home collection).
- A5 (Patient) account with verified phone/email.
- A fresh (unregistered) phone number available for new-user booking test.
- Payment gateway in test/sandbox mode.

---

## C. Test Cases

### C1. Booking Wizard — Entry Points

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| BKG-1 | [ ] | Book from test detail | On `/tests/[slug]`, click "Book Now" | Booking wizard opens with the test pre-selected | ⬜ | |
| BKG-2 | [ ] | Book from package detail | On `/health-packages/[slug]`, click "Book Package" | Wizard opens with package pre-selected | ⬜ | |
| BKG-3 | [ ] | Book from homepage CTA | Click homepage "Book a Test" CTA | Navigates to booking wizard or catalog | ⬜ | |
| BKG-4 | [ ] | `/book` redirect | Open `/book` | Redirects correctly to the booking flow | ⬜ | |
| BKG-5 | [ ] | Direct `/bookings` | Open `/bookings` directly | Wizard renders at Step 1 (test selection) | ⬜ | |

### C2. Step 1 — Test / Package Selection

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| BKG-6 | [ ] | Tests listed in wizard | View Step 1 | Available tests shown with name and price | ⬜ | |
| BKG-7 | [ ] | Select a test | Click a test | Test highlighted / added to selection | ⬜ | |
| BKG-8 | [ ] | Deselect a test | Click selected test again | Test removed from selection | ⬜ | |
| BKG-9 | [ ] | Select multiple tests | Click 2+ tests | All selected tests shown in order summary | ⬜ | |
| BKG-10 | [ ] | Select package | Choose a health package | Package added to selection; its included tests shown | ⬜ | |
| BKG-11 | [ ] | Price calculation | Select tests; view order summary | Total price = sum of all selected items | ⬜ | |
| BKG-12 | [ ] | No selection — proceed | Click Next with nothing selected | Blocked; inline error "Please select at least one test" | ⬜ | |
| BKG-13 | [ ] | Search in wizard | Type test name in wizard search | Results filter correctly | ⬜ | |

### C3. Step 2 — Collection Type Selection

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| BKG-14 | [ ] | Collection options shown | Proceed to Step 2 | "Home Collection" and "Lab Visit" options visible | ⬜ | |
| BKG-15 | [ ] | Select Home Collection | Click Home Collection | Option selected; address fields appear | ⬜ | |
| BKG-16 | [ ] | Select Lab Visit | Click Lab Visit | Option selected; lab location info shown | ⬜ | |
| BKG-17 | [ ] | No collection type selected | Click Next without selecting | Blocked; error message shown | ⬜ | |
| BKG-18 | [ ] | Home collection — address required | Select Home; leave address blank; Next | Inline required error on address field | ⬜ | |
| BKG-19 | [ ] | Home collection — valid address | Fill address; proceed | Address saved to booking summary | ⬜ | |
| BKG-20 | [ ] | Pincode / area validation | Enter invalid pincode (if validated) | Error "Service not available in this area" | ⬜ | |
| BKG-21 | [ ] | Additional instructions | Enter note in optional instructions field | Note saved (shown in admin booking detail) | ⬜ | |

### C4. Step 3 — Slot / Date Selection

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| BKG-22 | [ ] | Date picker renders | Reach slot step | Calendar or date picker renders | ⬜ | |
| BKG-23 | [ ] | Only future dates selectable | View calendar | Past dates disabled / greyed out | ⬜ | |
| BKG-24 | [ ] | Select a date | Click a future date | Date highlighted; available time slots appear | ⬜ | |
| BKG-25 | [ ] | Available slots shown | After date selection | Morning / afternoon slots displayed | ⬜ | |
| BKG-26 | [ ] | Full / booked slot | If a slot is at capacity | Slot shown as unavailable / greyed out | ⬜ | |
| BKG-27 | [ ] | Select a slot | Click an available slot | Slot highlighted; proceeds | ⬜ | |
| BKG-28 | [ ] | No date selected — proceed | Click Next with no date/slot | Blocked; required error | ⬜ | |
| BKG-29 | [ ] | No slot selected | Select date but no slot; Next | Blocked; "Please select a time slot" error | ⬜ | |

### C5. Step 4 — Patient Information

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| BKG-30 | [ ] | Logged-in auto-fill | Logged in as A5; reach patient info step | Name, phone, email pre-filled from profile | ⬜ | |
| BKG-31 | [ ] | Guest booking entry | Not logged in; reach patient info | Fields blank; all required | ⬜ | |
| BKG-32 | [ ] | Patient name required | Leave name blank; proceed | Inline required error | ⬜ | |
| BKG-33 | [ ] | Phone required | Leave phone blank; proceed | Inline required error | ⬜ | |
| BKG-34 | [ ] | Invalid phone format | Enter `12345`; proceed | Inline format error | ⬜ | |
| BKG-35 | [ ] | Email optional or required | Validate per design | If required: error on blank. If optional: proceeds without | ⬜ | |
| BKG-36 | [ ] | Age / DOB | Enter date of birth | DOB saved; age calculated correctly | ⬜ | |
| BKG-37 | [ ] | Gender selection | Choose gender | Selection saved | ⬜ | |
| BKG-38 | [ ] | Add multiple patients | If multiple patients supported | Additional patient form fields appear correctly | ⬜ | |

### C6. Step 5 — Order Review & Confirmation

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| BKG-39 | [ ] | Order summary renders | Reach review step | Selected tests, date, slot, patient info, total all shown | ⬜ | |
| BKG-40 | [ ] | Edit from summary | Click "Edit" on any section | Returns to that step with data intact | ⬜ | |
| BKG-41 | [ ] | Confirm booking | Click Confirm / Place Order | Booking created; redirect to confirmation page | ⬜ | |
| BKG-42 | [ ] | Double-confirm guard | Click Confirm twice rapidly | Only one booking created; button disables | ⬜ | |
| BKG-43 | [ ] | Booking ID generated | After confirm | Unique booking ID shown on confirmation page | ⬜ | |
| BKG-44 | [ ] | Confirmation page renders | After successful booking | `/bookings/[bookingId]` loads with booking details | ⬜ | |
| BKG-45 | [ ] | Confirmation — correct details | View confirmation page | Test names, slot, address, price all match what was selected | ⬜ | |
| BKG-46 | [ ] | Payment CTA | If payment required | "Pay Now" or payment option visible on confirmation | ⬜ | |

### C7. Payment — `/payment/[invoiceId]`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| BKG-47 | [ ] | Payment page loads | Navigate to `/payment/[invoiceId]` | Invoice summary and payment form render | ⬜ | |
| BKG-48 | [ ] | Invoice amount correct | View payment page | Amount matches the booking total | ⬜ | |
| BKG-49 | [ ] | Payment gateway renders | View payment form | Payment fields (card / UPI / net banking) render (sandbox) | ⬜ | |
| BKG-50 | [ ] | Successful test payment | Complete payment using test card | Marked as paid; success state shown | ⬜ | |
| BKG-51 | [ ] | Failed payment | Use a failing test card | Clear payment-failed message; can retry | ⬜ | |
| BKG-52 | [ ] | Invalid invoice ID | Visit `/payment/invalid-id` | 404 or error; no crash | ⬜ | |

### C8. Booking Status Page — `/bookings/[bookingId]`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| BKG-53 | [ ] | Status page loads | Open `/bookings/[bookingId]` | Page renders with booking details | ⬜ | |
| BKG-54 | [ ] | Correct booking info | View status page | Test, date, slot, patient name, status badge all correct | ⬜ | |
| BKG-55 | [ ] | Status badge — Pending | New booking | Status shows "Pending" or "Confirmed" | ⬜ | |
| BKG-56 | [ ] | Status badge — Completed | Completed booking | Status shows "Completed" | ⬜ | |
| BKG-57 | [ ] | Access other patient's booking | Logged in as A5; visit another patient's bookingId URL | Access denied; no other patient data shown | ⬜ | |
| BKG-58 | [ ] | Invalid booking ID | Visit `/bookings/fake-id` | 404 or error; not a crash | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| BKG-R1 | [ ] | `/bookings` — Step 1 (Test Selection) | ⬜ | ⬜ | ⬜ | |
| BKG-R2 | [ ] | `/bookings` — Step 2 (Collection Type) | ⬜ | ⬜ | ⬜ | |
| BKG-R3 | [ ] | `/bookings` — Step 3 (Slot Selection) | ⬜ | ⬜ | ⬜ | |
| BKG-R4 | [ ] | `/bookings` — Step 4 (Patient Info) | ⬜ | ⬜ | ⬜ | |
| BKG-R5 | [ ] | `/bookings` — Step 5 (Review) | ⬜ | ⬜ | ⬜ | |
| BKG-R6 | [ ] | `/bookings/[bookingId]` | ⬜ | ⬜ | ⬜ | |
| BKG-R7 | [ ] | `/payment/[invoiceId]` | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 58 |
| S1/S2 bugs filed | |
