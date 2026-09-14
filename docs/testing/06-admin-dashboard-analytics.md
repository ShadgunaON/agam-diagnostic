# 06 — Admin Dashboard & Analytics

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the internal admin dashboard and revenue/test distribution charts.

## A. Preconditions
- Logged in as Admin (A2).
- Application has real data (bookings, patients).

## B. Test Cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| DSH-1 | [ ] | View Dashboard | Visit `/admin` | Dashboard renders without errors | ⬜ | |
| DSH-2 | [ ] | Real KPIs | Check top 4 KPI cards | Values match DB exactly. No hardcoded pseudo-random multipliers exist. | ⬜ | |
| DSH-3 | [ ] | Recent Bookings | Scroll to recent bookings table | Shows latest 10 bookings sorted by date newest | ⬜ | |
| DSH-4 | [ ] | Analytics Charts | Visit `/admin/analytics` | Revenue by Month and Test Distribution charts render | ⬜ | |
| DSH-5 | [ ] | Empty Chart Data | Empty the DB and visit analytics | Charts handle zero-data gracefully without breaking UI | ⬜ | |
| DSH-6 | [ ] | Export PDF | Click Export on Analytics page | Triggers print preview formatted for PDF | ⬜ | |
| DSH-7 | [ ] | Global Search (Admin) | Search in admin top bar | Shows results grouped by Bookings, Patients, Reports | ⬜ | |
