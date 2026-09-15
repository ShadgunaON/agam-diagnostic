# 11 — Admin Reports (Clinical Reports)

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the clinical reports workspace — the pending queue, reviewing/approving/releasing reports, previewing report PDFs, and the report detail view.

---

## A. Scope & routes

- `/admin/reports` — Clinical reports workspace (queue view)
- `/admin/reports/[reportId]` — Individual report detail / approval page (if applicable)

---

## B. Preconditions

- A1 (Admin) logged in.
- At least 5 reports in mixed statuses: Pending, Under Review, Released.
- At least 1 report with a PDF attached.
- A2 (limited-permission staff) to test permission gating on report approval.

---

## C. Test Cases

### C1. Reports Workspace — Load & Layout

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| REP-1 | [ ] | Reports page loads | A1: open `/admin/reports` | Page renders with report queue; no white screen or errors | ⬜ | |
| REP-2 | [ ] | Pending count badge | View page | "Pending" count badge visible and accurate | ⬜ | |
| REP-3 | [ ] | Report row content | View any report row | Shows: patient name, test name, booking date, status | ⬜ | |
| REP-4 | [ ] | Status badges | View rows with different statuses | Pending = yellow/orange, Released = green, Under Review = blue | ⬜ | |
| REP-5 | [ ] | First report auto-selected | Page load | First report in queue is selected/highlighted in split view | ⬜ | |
| REP-6 | [ ] | Loading state | Slow network | Skeleton/spinner shows while queue loads | ⬜ | |
| REP-7 | [ ] | Empty state | No reports in system | Friendly empty state; not a crash | ⬜ | |

### C2. Filter & Sort

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| REP-8 | [ ] | Filter — All | Select "All" status filter | All reports shown | ⬜ | |
| REP-9 | [ ] | Filter — Pending | Select "Pending" filter | Only pending reports shown | ⬜ | |
| REP-10 | [ ] | Filter — Released | Select "Released" filter | Only released reports shown | ⬜ | |
| REP-11 | [ ] | Sort — newest | Select "Date: Newest" | Most recent reports at top | ⬜ | |
| REP-12 | [ ] | Sort — oldest | Select "Date: Oldest" | Oldest reports at top | ⬜ | |
| REP-13 | [ ] | Search by patient name | Type patient name | Queue filters to matching reports | ⬜ | |
| REP-14 | [ ] | Search by test name | Type test name | Queue filters to matching | ⬜ | |
| REP-15 | [ ] | Search no results | Type unmatched term | Friendly empty state for search | ⬜ | |
| REP-16 | [ ] | Clear search | Clear search field | Full queue restores | ⬜ | |

### C3. Cursor-based Pagination

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| REP-17 | [ ] | Next page | > 20 reports; click Next | Next batch of reports loads | ⬜ | |
| REP-18 | [ ] | Previous page | On page 2+; click Previous | Previous batch reloads | ⬜ | |
| REP-19 | [ ] | Last page | On last page | Next disabled/hidden | ⬜ | |
| REP-20 | [ ] | Filter + paginate | Filter; paginate | Pagination stays within filtered set | ⬜ | |

### C4. Report Detail / Preview

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| REP-21 | [ ] | Select report from queue | Click a report row | Report detail/preview pane loads | ⬜ | |
| REP-22 | [ ] | Detail — patient info | View report detail | Patient name, phone/email, DOB, gender shown | ⬜ | |
| REP-23 | [ ] | Detail — test info | View report detail | Test name, booking date, collection type shown | ⬜ | |
| REP-24 | [ ] | Detail — report results | View report detail | Test results / values shown (if available) | ⬜ | |
| REP-25 | [ ] | Preview modal | Click "Preview Report" / "View PDF" | PDF preview modal opens | ⬜ | |
| REP-26 | [ ] | Preview modal — content | View preview | Report content correct; patient name and values match | ⬜ | |
| REP-27 | [ ] | Preview modal — close | Click close (×) on preview | Modal closes; returns to queue | ⬜ | |
| REP-28 | [ ] | Download from preview | Click download in preview | PDF downloads; file not corrupted | ⬜ | |

### C5. Report Approval / Release Actions

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| REP-29 | [ ] | Approve / Release report | On a Pending report; click Approve/Release | Status changes to Released; pending count decrements | ⬜ | |
| REP-30 | [ ] | Patient can now see report | After release; check patient portal `/reports` | Released report appears for the patient | ⬜ | |
| REP-31 | [ ] | Release — confirmation dialog | Click Release | Confirmation dialog appears before action | ⬜ | |
| REP-32 | [ ] | Cancel release | Click Cancel in confirmation dialog | Report not released; status unchanged | ⬜ | |
| REP-33 | [ ] | Cannot un-release | On a Released report | No "Un-release" button; status locked (or controlled flow) | ⬜ | |
| REP-34 | [ ] | Release — toast feedback | After successful release | Success toast shown | ⬜ | |
| REP-35 | [ ] | Release — error handling | Server fails during release | Error toast shown; status not changed | ⬜ | |
| REP-36 | [ ] | Double-release guard | Click Release twice rapidly | Only released once; second click blocked | ⬜ | |

### C6. Permission Gating

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| REP-37 | [ ] | View reports — permission | A2 with `reports.view`; open `/admin/reports` | Queue visible; no approve/release button | ⬜ | |
| REP-38 | [ ] | Edit / approve — permission | A2 with `reports.edit`; can approve | Approve button visible; action works | ⬜ | |
| REP-39 | [ ] | No access | A2 without `reports` permission; navigate to `/admin/reports` | Access denied; no report data shown | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| REP-R1 | [ ] | `/admin/reports` — list | ⬜ | ⬜ | ⬜ | |
| REP-R2 | [ ] | `/admin/reports` — split view with detail | ⬜ | ⬜ | ⬜ | |
| REP-R3 | [ ] | Preview modal | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 39 |
| S1/S2 bugs filed | |
