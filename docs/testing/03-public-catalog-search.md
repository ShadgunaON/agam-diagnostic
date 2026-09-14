# 03 — Public Catalog & Search

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers the e-commerce display of Tests, Packages, Services, Blog, and global search.

## A. Preconditions
- Catalog contains at least 1 Test, 1 Package, and 1 Service.

## B. Test Cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CAT-1 | [ ] | Tests Listing | Visit `/tests` | Shows all active tests with prices and categories | ⬜ | |
| CAT-2 | [ ] | Packages Listing | Visit `/health-packages` | Shows all active packages | ⬜ | |
| CAT-3 | [ ] | Services Listing | Visit `/services` | Shows all active services | ⬜ | |
| CAT-4 | [ ] | Catalog Detail | Click a specific test | Details page shows Overview, What it Checks, FAQs | ⬜ | |
| CAT-5 | [ ] | Pagination | Scroll/Next page on `/tests` | Loads next set of items | ⬜ | |
| CAT-6 | [ ] | Filters/Sorting | Apply price/category filter | List updates correctly | ⬜ | |
| CAT-7 | [ ] | Global Search (Public) | Search "Thyroid" in top bar | Results show grouped tests/packages matching "Thyroid" | ⬜ | |
| CAT-8 | [ ] | Search Results | Click a search result | Navigates to the correct detail page | ⬜ | |
| CAT-9 | [ ] | Blog Listing | Visit `/blog` | Shows published blog articles | ⬜ | |
| CAT-10| [ ] | Blog Detail | Click a blog post | Markdown/rich text renders correctly | ⬜ | |
| CAT-11| [ ] | Public Reviews | Visit `/reviews` | Displays approved reviews only | ⬜ | |
