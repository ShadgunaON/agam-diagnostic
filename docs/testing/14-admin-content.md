# 14 — Admin Content (Blog CMS, Reviews, Newsletter)

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers content management — blog post creation and management, patient review moderation (approve/reject), and newsletter subscriber management.

---

## A. Scope & routes

- `/admin/blogs` — Blog post management (CMS)
- `/admin/reviews` — Review moderation
- `/admin/newsletter` — Newsletter subscribers

---

## B. Preconditions

- A1 (Admin) logged in.
- At least 3 blog posts in mixed states (Published, Draft).
- At least 3 patient reviews — at least 1 pending approval, 1 approved, 1 rejected.
- At least 5 newsletter subscribers.

---

## C. Test Cases

### C1. Blog CMS — `/admin/blogs`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| BLG-1 | [ ] | Blogs page loads | A1: open `/admin/blogs` | Blog list renders; no errors | ⬜ | |
| BLG-2 | [ ] | Blog row content | View any blog row | Shows: title, author, publish date, status (Published/Draft) | ⬜ | |
| BLG-3 | [ ] | Status badges | View rows | Published = green, Draft = grey/yellow | ⬜ | |
| BLG-4 | [ ] | Filter by status | Select "Published" filter | Only published posts shown | ⬜ | |
| BLG-5 | [ ] | Search by title | Type blog title | List filters to matching posts | ⬜ | |
| BLG-6 | [ ] | Empty state | No blog posts | Friendly empty state with "Create Post" CTA | ⬜ | |
| BLG-7 | [ ] | Create blog post | Click "New Post" / "Create" | Blog editor or form opens | ⬜ | |
| BLG-8 | [ ] | Title required | Submit with blank title | Inline required error | ⬜ | |
| BLG-9 | [ ] | Content required | Submit with blank body | Inline required error | ⬜ | |
| BLG-10 | [ ] | Slug auto-generated | Enter title | Slug auto-populates | ⬜ | |
| BLG-11 | [ ] | Publish vs draft | Toggle publish/draft; save | Status saved correctly | ⬜ | |
| BLG-12 | [ ] | Save draft | Write content; save as Draft | Saved as Draft; not shown on public `/blog` | ⬜ | |
| BLG-13 | [ ] | Publish post | Set to Published; save | Appears on public `/blog` listing | ⬜ | |
| BLG-14 | [ ] | Edit post | Click Edit on a blog | Form pre-fills with existing content | ⬜ | |
| BLG-15 | [ ] | Edit — update content | Change body; save | Changes reflected on public blog page | ⬜ | |
| BLG-16 | [ ] | Delete post — confirmation | Click Delete | Confirm dialog appears | ⬜ | |
| BLG-17 | [ ] | Confirm delete | Confirm | Post removed from list and public blog | ⬜ | |
| BLG-18 | [ ] | Cancel delete | Cancel | Post not deleted | ⬜ | |
| BLG-19 | [ ] | Rich text editor | Use formatting (bold, lists, headings) in editor | Formatted content renders correctly on public page | ⬜ | |
| BLG-20 | [ ] | Image upload | Upload a featured image | Image shown in blog detail; no broken image | ⬜ | |

### C2. Review Moderation — `/admin/reviews`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| REV-1 | [ ] | Reviews page loads | A1: open `/admin/reviews` | All reviews listed (Pending, Approved, Rejected); no errors | ⬜ | |
| REV-2 | [ ] | Review row content | View any review row | Shows: patient name, star rating, comment text, status, date | ⬜ | |
| REV-3 | [ ] | Status badge — Pending | Pending review | Orange/yellow "Pending" badge | ⬜ | |
| REV-4 | [ ] | Status badge — Approved | Approved review | Green "Approved" badge | ⬜ | |
| REV-5 | [ ] | Status badge — Rejected | Rejected review | Red "Rejected" badge | ⬜ | |
| REV-6 | [ ] | Filter by status | Select Pending filter | Only pending reviews shown | ⬜ | |
| REV-7 | [ ] | Approve review | Click Approve on Pending review | Status changes to Approved; review appears on public `/reviews` | ⬜ | |
| REV-8 | [ ] | Reject review | Click Reject on Pending review | Status changes to Rejected; review does NOT appear on public page | ⬜ | |
| REV-9 | [ ] | Approve — confirmation | Click Approve | Confirmation toast or dialog shown | ⬜ | |
| REV-10 | [ ] | Reject — confirmation | Click Reject | Confirmation toast or dialog shown | ⬜ | |
| REV-11 | [ ] | Public page after approval | Approve a review; check `/reviews` | Approved review now visible publicly | ⬜ | |
| REV-12 | [ ] | Public page after rejection | Reject a review; check `/reviews` | Rejected review NOT visible publicly | ⬜ | |
| REV-13 | [ ] | Re-approve rejected review | On a Rejected review; click Approve | Status changes to Approved | ⬜ | |
| REV-14 | [ ] | Delete review (if available) | Click Delete; confirm | Review permanently removed | ⬜ | |
| REV-15 | [ ] | Empty state | No reviews | Friendly empty state | ⬜ | |
| REV-16 | [ ] | Star rating display | View a review | Star rating rendered visually (not just a number) | ⬜ | |
| REV-17 | [ ] | Long review text | View a review with long comment | Text truncated or readable; doesn't break layout | ⬜ | |

### C3. Newsletter — `/admin/newsletter`

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| NWS-1 | [ ] | Newsletter page loads | A1: open `/admin/newsletter` | Subscriber list renders; no errors | ⬜ | |
| NWS-2 | [ ] | Subscriber row content | View any row | Shows: email, subscription date, status (Active/Unsubscribed) | ⬜ | |
| NWS-3 | [ ] | Subscriber count | View page header/KPI | Total subscriber count shown | ⬜ | |
| NWS-4 | [ ] | Search by email | Type email in search | Matching subscriber shown | ⬜ | |
| NWS-5 | [ ] | Filter active | Filter by Active | Only active subscribers shown | ⬜ | |
| NWS-6 | [ ] | Filter unsubscribed | Filter by Unsubscribed | Only unsubscribed users shown | ⬜ | |
| NWS-7 | [ ] | Export subscribers | Click Export/Download | CSV file downloads with email list | ⬜ | |
| NWS-8 | [ ] | Pagination | > page-size subscribers | Pagination works | ⬜ | |
| NWS-9 | [ ] | Empty state | No subscribers | Friendly empty state | ⬜ | |
| NWS-10 | [ ] | Unsubscribe (admin) | Mark a subscriber as unsubscribed | Status changes; email removed from active list | ⬜ | |

### C4. Permission Gating

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CONT-P1 | [ ] | Blog — no permission | A2 without `blogs` permission; open `/admin/blogs` | Access denied | ⬜ | |
| CONT-P2 | [ ] | Reviews — no permission | A2 without `reviews` permission; open `/admin/reviews` | Access denied | ⬜ | |
| CONT-P3 | [ ] | Newsletter — no permission | A2 without `newsletter` permission; open `/admin/newsletter` | Access denied | ⬜ | |

---

## D. Responsiveness

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| CONT-R1 | [ ] | `/admin/blogs` | ⬜ | ⬜ | ⬜ | |
| CONT-R2 | [ ] | Blog editor/form | ⬜ | ⬜ | ⬜ | |
| CONT-R3 | [ ] | `/admin/reviews` | ⬜ | ⬜ | ⬜ | |
| CONT-R4 | [ ] | `/admin/newsletter` | ⬜ | ⬜ | ⬜ | |

---

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Pass count | __ / 50 |
| S1/S2 bugs filed | |
