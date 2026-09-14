# 10 — Admin Content & Catalog

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers CMS functionality: managing catalog items, blogs, reviews, and newsletter.

## A. Preconditions
- Logged in as Admin (A2).

## B. Test Cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CNT-1 | [ ] | Catalog List | Visit `/admin/catalog` | Lists Tests, Packages, Services | ⬜ | |
| CNT-2 | [ ] | Add Item | Create a new Test | Fields (Overview, Price, Category, FAQs) saved and visible in Public site | ⬜ | |
| CNT-3 | [ ] | Edit Item | Edit existing Package | Updates immediately reflect globally | ⬜ | |
| CNT-4 | [ ] | Blog List | Visit `/admin/blogs` | Lists blog posts | ⬜ | |
| CNT-5 | [ ] | Manage Blog | Create/Edit a blog post | Updates correctly render on public `/blog` | ⬜ | |
| CNT-6 | [ ] | Reviews List | Visit `/admin/reviews` | Table shows all submitted reviews | ⬜ | |
| CNT-7 | [ ] | Moderate Review | Click "Approve" on a Pending review | Status updates, Review appears on homepage/public pages | ⬜ | |
| CNT-8 | [ ] | Reject Review | Click "Reject" | Review remains hidden from public | ⬜ | |
| CNT-9 | [ ] | Newsletter List | Visit `/admin/newsletter` | Shows all subscribers | ⬜ | |
| CNT-10| [ ] | Newsletter Remove | Click Unsubscribe / Delete | Subscriber status changes or record is deleted | ⬜ | |
