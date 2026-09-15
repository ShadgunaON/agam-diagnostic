# 15 — Admin Staff Management & Settings

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the Platform Configuration (Settings) page and the admin profile. RBAC / Staff roles are covered in [02 — RBAC, Staff & Roles](02-rbac-staff-roles.md).

---

## A. Scope & routes

- `/admin/settings` — Platform Configuration (Lab Profile, Equipment, Report Formatting, Patient Communications)
- `/admin/profile` — Admin's own profile / account settings

---

## B. Preconditions

- A1 (Admin) logged in.
- At least one non-admin staff (A2) to test permission-gating of settings.
- Note: the settings page currently redirects to `/admin` — verify if Settings is live or in-progress. Mark blocked (⚠️) if redirect is intentional.

---

## C. Test Cases

### C1. Settings Hub — `/admin/settings`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-1 | [ ] | Settings page loads | A1: open `/admin/settings` | Settings page or redirect renders; no crash | ⬜ | |
| SET-2 | [ ] | Settings navigation items | View left nav | Lab Profile, Equipment, Report Formatting, Patient Communications tabs visible | ⬜ | |
| SET-3 | [ ] | Tab switching | Click each nav item | Active tab content panel changes to the correct section | ⬜ | |
| SET-4 | [ ] | Default tab | Page load | First tab (Lab Profile & Compliance) active by default | ⬜ | |

### C2. Lab Profile & Compliance Tab

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-5 | [ ] | Lab profile section loads | Click "Lab Profile & Compliance" | Lab profile form renders; no errors | ⬜ | |
| SET-6 | [ ] | Lab name field | View / edit lab name | Field editable; existing name pre-filled | ⬜ | |
| SET-7 | [ ] | Accreditation fields | View accreditations section | NABL / ISO or other accreditation fields visible | ⬜ | |
| SET-8 | [ ] | Signature upload | Upload lab director signature (if applicable) | Image uploads; preview shown | ⬜ | |
| SET-9 | [ ] | Save Lab Profile | Make a change; click Save Configuration | Success toast; changes persisted on reload | ⬜ | |
| SET-10 | [ ] | Cancel changes | Make a change; click Cancel Changes | Changes discarded; original values restored | ⬜ | |
| SET-11 | [ ] | Required fields | Submit with required fields blank | Inline validation errors | ⬜ | |

### C3. Equipment & Integrations Tab

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-12 | [ ] | Equipment tab loads | Click "Equipment & Integrations" | Section content renders | ⬜ | |
| SET-13 | [ ] | LIS integration fields | View content | LIS (Lab Information System) connection fields visible | ⬜ | |
| SET-14 | [ ] | Machine interface settings | View content | Analyzer / machine interface config fields visible | ⬜ | |
| SET-15 | [ ] | Test connection (if button exists) | Click "Test Connection" | Success or failure feedback shown | ⬜ | |
| SET-16 | [ ] | Save equipment config | Make changes; Save | Changes saved; toast shown | ⬜ | |

### C4. Report Formatting Tab

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-17 | [ ] | Report formatting tab loads | Click "Report Formatting" | Section content renders; no errors | ⬜ | |
| SET-18 | [ ] | Logo upload | Upload a logo image | Image uploaded; preview shown | ⬜ | |
| SET-19 | [ ] | Report header | Edit report header/footer text | Changes reflected in report PDF preview | ⬜ | |
| SET-20 | [ ] | Font / layout selection | Select a layout option (if available) | Layout preference saved | ⬜ | |
| SET-21 | [ ] | Preview report format | Click "Preview" | Sample report PDF renders with new settings | ⬜ | |
| SET-22 | [ ] | Save formatting config | Save changes | Config saved; success toast; persists on reload | ⬜ | |

### C5. Patient Communications Tab

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-23 | [ ] | Patient comms tab loads | Click "Patient Communications" | Section content renders | ⬜ | |
| SET-24 | [ ] | SMS alert settings | View content | SMS alert toggle/config visible (booking confirmation, report ready) | ⬜ | |
| SET-25 | [ ] | SMS toggle | Toggle an SMS alert ON/OFF | Toggle state saved | ⬜ | |
| SET-26 | [ ] | Delivery rules | View delivery rules | Time-of-day or frequency rules configurable | ⬜ | |
| SET-27 | [ ] | Template preview | View SMS template | Template text with placeholders shown | ⬜ | |
| SET-28 | [ ] | Save comms config | Make changes; Save | Config saved; toast shown; persists | ⬜ | |

### C6. Admin Profile — `/admin/profile`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-29 | [ ] | Admin profile loads | A1: open `/admin/profile` | Profile page renders with admin's info | ⬜ | |
| SET-30 | [ ] | Profile data pre-filled | View profile | Name, email/phone, role displayed | ⬜ | |
| SET-31 | [ ] | Edit name | Change name; save | Updated; success toast | ⬜ | |
| SET-32 | [ ] | Name required | Clear name; save | Inline required error | ⬜ | |
| SET-33 | [ ] | Change contact info | Edit phone/email (if allowed) | Update flow works; confirmation required | ⬜ | |
| SET-34 | [ ] | Save profile | Save changes | Changes persisted; shown on reload | ⬜ | |

### C7. Permission Gating

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| SET-35 | [ ] | Settings — admin only | A2 (non-admin) visits `/admin/settings` | Access denied; redirected back to `/admin` or error shown | ⬜ | |
| SET-36 | [ ] | Settings Save — admin only | If A2 somehow accesses settings form; tries to save | Server rejects; 403 error | ⬜ | |
| SET-37 | [ ] | Profile — own only | A2 visits own profile at `/admin/profile` | Can edit own profile; cannot change role | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| SET-R1 | [ ] | `/admin/settings` — all tabs | ⬜ | ⬜ | ⬜ | |
| SET-R2 | [ ] | `/admin/profile` | ⬜ | ⬜ | ⬜ | |
| SET-R3 | [ ] | Settings nav (left panel) on mobile | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 37 |
| S1/S2 bugs filed | |
