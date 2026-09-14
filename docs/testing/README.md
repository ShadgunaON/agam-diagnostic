# Agam Diagnostics — Manual Testing Suite

This folder is the **complete manual test suite** for Agam Diagnostics. It is split into one document per module so a tester can pick up a single file and exhaustively test that module — every page, every button, every field, every state — and record results inline.

Each test case has a **Status** column (mark Pass/Fail/Blocked/N-A) and a **Comments** column (free notes, bug links, screenshots). Tick the checkbox when a case is done.

---

## 1. What you need before you start
- Use **Google Chrome** (clean results; avoid Brave/ad-blockers).
- The **Test App URL** (AWS Amplify link) — this is the *only* site you test.
- Your **Test Accounts** (Patients, Lab Techs, Admins) — ask the dev team for credentials.
- **Payment Testing**: ALL payments must use PhonePe Sandbox/UAT credentials. **NEVER test against Production.**

## 2. Status legend (used in every doc)

| Symbol | Meaning |
|--------|---------|
| ✅ | **Pass** — behaves as expected |
| ❌ | **Fail** — does not match expected result (file a bug, put ID in Comments) |
| ⚠️ | **Blocked** — could not test (dependency missing, env down) |
| ➖ | **N/A** — feature not enabled in this environment / not applicable |
| ⬜ | **Not yet tested** (default) |

**Severity (for bugs):** `S1` blocker/data-loss · `S2` major feature broken · `S3` minor · `S4` trivial/cosmetic.

---

## 3. Test accounts

| ID | Type | Role | Used for |
|----|------|------|----------|
| **A1** | Superadmin | `superadmin` | Full system access, configuration, bypasses RBAC. |
| **A2** | Admin | `admin` | Operations, catalog management, bookings management. |
| **A3** | Lab Tech | `lab_tech` | Home collections, sample tracking. |
| **A4** | Doctor | `doctor` | Viewing specific patient records, medical reports (based on RBAC matrix). |
| **A5** | Patient | `patient` | Standard consumer booking tests, checking own reports/invoices. |
| **A6** | Guest | (none) | Unauthenticated user browsing catalog. |

> 🟢 **Start here:** do **[00 — Smoke & Global Checks](00-smoke-and-global.md)** first. If anything there fails, stop and tell the dev team before continuing.
