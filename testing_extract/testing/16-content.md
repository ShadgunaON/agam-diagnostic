# 16 — Content Management (Blog, Case Studies, Services, Industries, Careers)

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Authoring surfaces for the public marketing site. Drafting/managing is separate from **publishing** (publishing is gated — Content Managers can draft but not publish by default). Governed by `content.*` (e.g. `content.blog.manage` vs `content.blog.publish`) and `content.case_studies.*`, `content.careers.*`.

> After publishing, **verify the change on the public site** (see [17 — Public & Legal](17-public-legal.md)).

## A. Scope & routes

- Blog: `/app/content/blog`, `/new`, `/[slug]/edit`.
- Case studies: `/app/content/case-studies`, `/new`, `/[slug]/edit`.
- Services: `/app/content/services`, `/new`, `/[slug]/edit`.
- Industries: `/app/content/industries`, `/new`, `/[slug]/edit`.
- Careers: `/app/content/careers`, `/new`, `/[slug]/edit`.

## B. Preconditions

- A1 admin (can publish) and a **Content Manager** user (draft/manage, no publish) to verify gating.

## C. Test cases

> Run **C1** for **each** content type (Blog, Case Studies, Services, Industries, Careers) — the flows are parallel. Use the prefix shown per type.

### C1. Generic content flow (repeat per type)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CNT-1 | [ ] | List loads | Open the content list | Items + status (draft/published) render | ⬜ | |
| CNT-2 | [ ] | Empty/loading/error | No data / throttle / fail | Each state renders | ⬜ | |
| CNT-3 | [ ] | Create draft | `/new`: title, slug, body, image, meta | Saved as draft | ⬜ | |
| CNT-4 | [ ] | Required validation | Submit empty | Inline errors | ⬜ | |
| CNT-5 | [ ] | Slug handling | Auto-slug / duplicate slug | Unique; duplicate blocked | ⬜ | |
| CNT-6 | [ ] | Rich text/body | Format text, lists, links | Renders correctly in editor + preview | ⬜ | |
| CNT-7 | [ ] | Image upload | Upload cover/inline image | Stored; type/size validated | ⬜ | |
| CNT-8 | [ ] | SEO/meta fields | Fill meta title/description | Saved | ⬜ | |
| CNT-9 | [ ] | Save draft | Save | In list as draft | ⬜ | |
| CNT-10 | [ ] | Edit | `/[slug]/edit` → change → save | Persists | ⬜ | |
| CNT-11 | [ ] | Preview | Preview before publish | Matches intended output | ⬜ | |
| CNT-12 | [ ] | **Publish (admin)** | Publish the item | Status → published; appears on public site | ⬜ | |
| CNT-13 | [ ] | **Publish gated** | As Content Manager, attempt publish | No publish action / blocked | ⬜ | |
| CNT-14 | [ ] | Unpublish/archive | Unpublish (if supported) | Removed from public site | ⬜ | |
| CNT-15 | [ ] | Delete | Delete an item | Confirm + removed; gone from public site if was live | ⬜ | |
| CNT-16 | [ ] | Cancel/double-submit | Cancel; save twice | Guarded; one item | ⬜ | |

### C2. Per-type specifics

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CNT-17 | [ ] | Blog | Run C1 for Blog; check author + view.own (authors see own drafts) | Works; `content.blog.author` scoping correct | ⬜ | |
| CNT-18 | [ ] | Case studies | Run C1; check client/industry linkage fields | Works | ⬜ | |
| CNT-19 | [ ] | Services | Run C1; service appears on `/services` after publish | Works | ⬜ | |
| CNT-20 | [ ] | Industries | Run C1; industry appears on `/industries` after publish | Works | ⬜ | |
| CNT-21 | [ ] | Careers | Run C1; job posting appears on `/careers`; application form attaches to it | Works; applications land in [14](14-tasks-submissions.md) | ⬜ | |

### C3. Permissions & edge cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| CNT-22 | [ ] | No content perm | Non-content role | No-access | ⬜ | |
| CNT-23 | [ ] | Author sees own only | `view.own` blog author | Sees only own drafts | ⬜ | |
| CNT-24 | [ ] | Publish→public lag | Publish then load public page | Reflects (allow for cache/ISR; note delay if any) | ⬜ | |
| CNT-25 | [ ] | Special chars/long content | Long titles, emoji, code blocks | Handled in editor + public render | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)). Check the **editor** on tablet/mobile.

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| CNT-R1 | [ ] | Content lists | ⬜ | ⬜ | ⬜ | |
| CNT-R2 | [ ] | Editor (new/edit) | ⬜ | ⬜ | ⬜ | |
| CNT-R3 | [ ] | Preview | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
