# 09 — Admin CRM (Patients & Staff)

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers management of registered users and internal staff directory.

## A. Preconditions
- Logged in as Admin (A2).

## B. Test Cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CRM-1 | [ ] | Patients List | Visit `/admin/patients` | Paginated list of registered patients | ⬜ | |
| CRM-2 | [ ] | Patient Details | Click a patient record | Shows history, previous bookings | ⬜ | |
| CRM-3 | [ ] | Patient KPIs | Check top of Patients page | Values (Total Patients, New this Month) accurately reflect DB | ⬜ | |
| CRM-4 | [ ] | Staff Directory | Visit `/admin/staff` | Lists internal staff users | ⬜ | |
| CRM-5 | [ ] | Role Management | Try to edit a staff role | Correctly updates in DB/Cognito | ⬜ | |
