# 12 — Payroll

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Salary configuration, payroll runs (with loss-of-pay from HR), payslip PDF generation, the income-tax simulator and reports. **Verify net pay and LOP by hand on at least one employee.** Governed by `payroll.*` and `payslips.view.own`.

## A. Scope & routes

- `/app/finance/payroll` — overview.
- `/app/finance/payroll/runs` — runs list.
- `/app/finance/payroll/runs/generate` — generate a run.
- `/app/finance/payroll/runs/[payrollId]` — run detail.
- `/app/finance/payroll/payslips` — all payslips.
- `/app/finance/payslips/mine` — own payslips (self-service).
- `/app/finance/payroll/employee-salary` (+ `/[employeeId]/add`, `/[employeeId]/[effectiveFrom]`) — salary config.
- `/app/finance/payroll/tax-simulator` — tax calculator.
- `/app/finance/payroll/reports` — reports.

## B. Preconditions

- Employees exist with **salary records**; payroll tax slabs configured in Settings → Payroll-taxes.
- Attendance/leave data for the period (so LOP can be exercised).
- A1/payroll-permitted user; A3 employee to test own payslips.

## C. Test cases

### C1. Salary configuration

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PAY-1 | [ ] | Salary page loads | Open employee-salary | Employees + current salary listed (masked) | ⬜ | |
| PAY-2 | [ ] | Add salary record | `/[employeeId]/add`: components + effective-from | Saved | ⬜ | |
| PAY-3 | [ ] | Components | Enter basic/HRA/allowances/deductions | Each saved; gross computed | ⬜ | |
| PAY-4 | [ ] | Required/validation | Blank/negative/non-numeric | Errors; blocked | ⬜ | |
| PAY-5 | [ ] | Effective-from history | Add a second record with a later date | History kept; correct record used per period | ⬜ | |
| PAY-6 | [ ] | View salary detail | Open `/[employeeId]/[effectiveFrom]` | Correct components | ⬜ | |
| PAY-7 | [ ] | Edit salary | Edit a record | Persists; future runs use it | ⬜ | |

### C2. Generate payroll run

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PAY-8 | [ ] | Generate page | Open `/runs/generate` | Period picker + employee scope | ⬜ | |
| PAY-9 | [ ] | Select period | Choose month/year | Eligible employees listed | ⬜ | |
| PAY-10 | [ ] | Run computation | Generate | Per-employee gross, deductions, **net** computed | ⬜ | |
| PAY-11 | [ ] | TDS/tax | Check tax deduction | Uses configured slabs/regime | ⬜ | |
| PAY-12 | [ ] | **LOP feed** | Employee with unpaid leave/absence in period | Loss-of-pay reduces net correctly | ⬜ | |
| PAY-13 | [ ] | No salary record | Employee missing a salary record | Handled (skipped/flagged), not a crash | ⬜ | |
| PAY-14 | [ ] | Re-generate | Generate same period again | Idempotent / clear overwrite behavior (no duplicates) | ⬜ | |
| PAY-15 | [ ] | Net hand-check | Pick one employee, compute by hand | App net matches | ⬜ | |

### C3. Run detail & payslips

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PAY-16 | [ ] | Runs list | Open `/runs` | All runs with period/status/totals | ⬜ | |
| PAY-17 | [ ] | Run detail | Open `/runs/[payrollId]` | Per-employee breakdown | ⬜ | |
| PAY-18 | [ ] | Money privacy | Mask ON | Amounts masked | ⬜ | |
| PAY-19 | [ ] | **Payslip PDF** | Download a payslip | PDF generates (Puppeteer); figures + branding correct | ⬜ | |
| PAY-20 | [ ] | PDF content | Inspect PDF | Earnings, deductions, net, employee + company details all correct | ⬜ | |
| PAY-21 | [ ] | Bulk payslips | If bulk generate exists | All payslips produced | ⬜ | |
| PAY-22 | [ ] | Payslips list | Open `/payslips` | All payslips listed/downloadable | ⬜ | |

### C4. Self-service payslips (as A3)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PAY-23 | [ ] | Own payslips | A3 opens `/payslips/mine` | Only own payslips listed | ⬜ | |
| PAY-24 | [ ] | Download own | Download an own payslip | PDF correct | ⬜ | |
| PAY-25 | [ ] | Can't see others | A3 tries another employee's payslip URL | Blocked | ⬜ | |

### C5. Tax simulator & reports

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PAY-26 | [ ] | Simulator loads | Open tax-simulator | Inputs render | ⬜ | |
| PAY-27 | [ ] | Compute tax | Enter income + regime | Tax computed per slabs; old vs new regime if offered | ⬜ | |
| PAY-28 | [ ] | Edge inputs | 0 / very high / boundary slab values | Correct at boundaries | ⬜ | |
| PAY-29 | [ ] | Reports | Open payroll reports | Compute correctly; filters work | ⬜ | |
| PAY-30 | [ ] | Report export | Export | CSV/PDF correct | ⬜ | |

### C6. Permissions & edge cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PAY-31 | [ ] | No payroll perm | Without `payroll.view` | `/app/no-access` (but `/payslips/mine` still allowed for own) | ⬜ | |
| PAY-32 | [ ] | No run perm | Without `payroll.run` | Generate disabled/blocked | ⬜ | |
| PAY-33 | [ ] | Concurrent run | Generate while another run in progress | Handled safely | ⬜ | |
| PAY-34 | [ ] | Period lock | Edit salary after a run is finalized | Doesn't retroactively alter finalized run | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)).

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| PAY-R1 | [ ] | Salary config + add | ⬜ | ⬜ | ⬜ | |
| PAY-R2 | [ ] | Generate run | ⬜ | ⬜ | ⬜ | |
| PAY-R3 | [ ] | Run detail (table) | ⬜ | ⬜ | ⬜ | |
| PAY-R4 | [ ] | My payslips | ⬜ | ⬜ | ⬜ | |
| PAY-R5 | [ ] | Tax simulator | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| Net pay + LOP hand-verified? | |
| S1/S2 bugs filed | |
