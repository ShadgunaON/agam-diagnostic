# 17 — Responsiveness (Global Standard + Checklist)

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

This document defines **how** to test responsiveness and provides a **per-page checklist** specific to Agam Diagnostics. Every module doc also has its own short Responsiveness section — this is the master reference. Reference this when setting **Status** for responsive rows in individual module docs.

---

## A. Breakpoints to test

Use **Chrome DevTools → Device toolbar** (`Ctrl + Shift + M` or `F12` → the phone icon). Test each page at all three:

| Code | Width | Represents | Notes |
|------|-------|------------|-------|
| **M** (Mobile) | **390 px** | iPhone 12/13/14 | Most demanding; sidebar/nav must collapse to a drawer or hamburger |
| **T** (Tablet) | **768 px** | iPad portrait | Hybrid layout; wide tables often switch to cards or horizontal scroll |
| **D** (Desktop) | **1440 px** | 13–15 in laptop | Full layout — the baseline all designs target |

Also **spot-check 320 px** (oldest small phones) and **1920 px** (large monitor) on the homepage, login, and admin dashboard.

---

## B. What "responsive pass" means — check on every page

Run all 15 checks at all 3 breakpoints for each page. Record the overall result in the per-page table (Section C).

| # | ✓ | Check | Expected | M | T | D | Comments |
|---|---|-------|----------|---|---|---|----------|
| R-1 | [ ] | No horizontal scroll | Page never scrolls sideways (exception: data tables with an explicit internal scroll container) | ⬜ | ⬜ | ⬜ | |
| R-2 | [ ] | No overlap / clipping | Text, buttons, icons never overlap, get cut off, or disappear behind other elements | ⬜ | ⬜ | ⬜ | |
| R-3 | [ ] | Sidebar / nav | Collapses to hamburger/drawer on M (390); drawer opens and closes; overlay tap-to-dismiss works | ⬜ | ⬜ | ⬜ | |
| R-4 | [ ] | Tables | Switch to scrollable cards OR scroll horizontally inside their container (page itself does NOT scroll) | ⬜ | ⬜ | ⬜ | |
| R-5 | [ ] | Forms | Fields stack vertically; labels are readable; inputs are full-width and tappable (≥ 44 px touch target) | ⬜ | ⬜ | ⬜ | |
| R-6 | [ ] | Modals / dialogs | Fit within the viewport; scroll internally if tall; close button always reachable; not taller than screen height | ⬜ | ⬜ | ⬜ | |
| R-7 | [ ] | Tap targets | Buttons/links/icons ≥ ~40–44 px; not so close together that adjacent items are accidentally tapped | ⬜ | ⬜ | ⬜ | |
| R-8 | [ ] | Top / admin header bar | All header actions (notifications, user menu, privacy toggle) are reachable and not clipped | ⬜ | ⬜ | ⬜ | |
| R-9 | [ ] | Charts / dashboards | Charts resize to fit container; legends and axis labels not clipped; no overflow outside card bounds | ⬜ | ⬜ | ⬜ | |
| R-10 | [ ] | Long content | Long patient names, test names, amounts truncate (ellipsis) or wrap gracefully — never break layout | ⬜ | ⬜ | ⬜ | |
| R-11 | [ ] | Images / logos | Scale proportionally (object-fit); no distortion or stretching | ⬜ | ⬜ | ⬜ | |
| R-12 | [ ] | Sticky elements | Sticky headers / action bars / footers remain usable and do not permanently cover content | ⬜ | ⬜ | ⬜ | |
| R-13 | [ ] | Landscape orientation | Rotate mobile device to landscape — layout still works; nothing hidden or broken | ⬜ | ⬜ | ⬜ | |
| R-14 | [ ] | On-screen keyboard | When a text field is focused on mobile, the keyboard does not permanently hide the field | ⬜ | ⬜ | ⬜ | |
| R-15 | [ ] | Dark / light theme contrast | Contrast holds at every breakpoint; text is readable; nothing unreadable in either theme | ⬜ | ⬜ | ⬜ | |

---

## C. Per-page responsive checklist

For each row, run **R-1…R-15** and record the **overall** M / T / D result here. Log detailed failures in the relevant module doc.

### Public Site

| Page / route | M (390) | T (768) | D (1440) | Comments |
|--------------|---------|---------|----------|----------|
| `/` — homepage | ⬜ | ⬜ | ⬜ | |
| `/tests` — catalog list | ⬜ | ⬜ | ⬜ | |
| `/tests/[slug]` — test detail | ⬜ | ⬜ | ⬜ | |
| `/packages` — health packages | ⬜ | ⬜ | ⬜ | |
| `/blogs` — blog list | ⬜ | ⬜ | ⬜ | |
| `/blogs/[slug]` — blog post | ⬜ | ⬜ | ⬜ | |
| `/about` | ⬜ | ⬜ | ⬜ | |
| `/contact` | ⬜ | ⬜ | ⬜ | |
| `/careers` | ⬜ | ⬜ | ⬜ | |
| `/login` — OTP login / sign-up | ⬜ | ⬜ | ⬜ | |
| `/terms` | ⬜ | ⬜ | ⬜ | |
| `/privacy` | ⬜ | ⬜ | ⬜ | |
| `/refund-policy` | ⬜ | ⬜ | ⬜ | |

### Patient Portal

| Page / route | M (390) | T (768) | D (1440) | Comments |
|--------------|---------|---------|----------|----------|
| `/dashboard` — patient home | ⬜ | ⬜ | ⬜ | |
| `/bookings` — booking wizard (all steps) | ⬜ | ⬜ | ⬜ | |
| `/dashboard/bookings` — my bookings list | ⬜ | ⬜ | ⬜ | |
| `/dashboard/bookings/[id]` — booking detail | ⬜ | ⬜ | ⬜ | |
| `/dashboard/reports` — my reports | ⬜ | ⬜ | ⬜ | |
| `/dashboard/reports/[id]` — report detail / PDF view | ⬜ | ⬜ | ⬜ | |
| `/dashboard/invoices` — my invoices | ⬜ | ⬜ | ⬜ | |
| `/dashboard/profile` — patient profile | ⬜ | ⬜ | ⬜ | |

### Admin Portal

| Page / route | M (390) | T (768) | D (1440) | Comments |
|--------------|---------|---------|----------|----------|
| `/admin` — dashboard & analytics | ⬜ | ⬜ | ⬜ | |
| `/admin/bookings` — bookings workspace | ⬜ | ⬜ | ⬜ | |
| `/admin/bookings/[id]` — booking detail | ⬜ | ⬜ | ⬜ | |
| `/admin/patients` — patient CRM list | ⬜ | ⬜ | ⬜ | |
| `/admin/patients/[id]` — patient detail | ⬜ | ⬜ | ⬜ | |
| `/admin/catalog/tests` — test list | ⬜ | ⬜ | ⬜ | |
| `/admin/catalog/packages` — packages list | ⬜ | ⬜ | ⬜ | |
| `/admin/catalog/categories` — categories | ⬜ | ⬜ | ⬜ | |
| `/admin/reports` — reports list | ⬜ | ⬜ | ⬜ | |
| `/admin/invoices` — invoices list | ⬜ | ⬜ | ⬜ | |
| `/admin/collections` — home collection jobs | ⬜ | ⬜ | ⬜ | |
| `/admin/blogs` — blog CMS | ⬜ | ⬜ | ⬜ | |
| `/admin/reviews` — review moderation | ⬜ | ⬜ | ⬜ | |
| `/admin/newsletter` — subscribers | ⬜ | ⬜ | ⬜ | |
| `/admin/staff` — staff / RBAC | ⬜ | ⬜ | ⬜ | |
| `/admin/settings` — platform settings | ⬜ | ⬜ | ⬜ | |
| `/admin/profile` — admin profile | ⬜ | ⬜ | ⬜ | |

---

## D. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Devices / browsers used | |
| Pages passing all breakpoints | __ / __ |
| S1/S2 responsive bugs filed | |
