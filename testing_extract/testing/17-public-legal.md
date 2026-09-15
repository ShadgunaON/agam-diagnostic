# 17 — Public Site & Legal

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

The public marketing website, its lead-capture forms (which feed the app inboxes), the consent checkboxes, the legal pages (Terms / Privacy / Refund), and analytics tags. These pages are **unauthenticated**.

## A. Scope & routes

- Marketing: `/`, `/about`, `/contact`, `/careers`, `/products`, `/services`, `/industries`, `/resources`, `/demo`, `/start-project`.
- Legal: `/terms`, `/privacy`, `/refund-policy`.
- Analytics: GA4 + Google Ads tag `AW-18206891911`.

## B. Preconditions

- Test in a logged-out / incognito session.
- Access to the app inboxes (A1) to confirm form submissions arrive (see [14 — Tasks & Submissions](14-tasks-submissions.md)).

## C. Test cases

### C1. Marketing pages

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-1 | [ ] | Home loads | Open `/` | Renders; no console errors; hero/sections intact | ⬜ | |
| PUB-2 | [ ] | About | Open `/about` | Renders | ⬜ | |
| PUB-3 | [ ] | Products | Open `/products` | Renders | ⬜ | |
| PUB-4 | [ ] | Services | Open `/services` | Renders; published services show (see [16](16-content.md)) | ⬜ | |
| PUB-5 | [ ] | Industries | Open `/industries` | Renders; published industries show | ⬜ | |
| PUB-6 | [ ] | Resources | Open `/resources` | Renders; published blog/case studies show | ⬜ | |
| PUB-7 | [ ] | Careers | Open `/careers` | Renders; published job postings show | ⬜ | |
| PUB-8 | [ ] | Demo | Open `/demo` | Renders | ⬜ | |
| PUB-9 | [ ] | Start project | Open `/start-project` | Renders | ⬜ | |
| PUB-10 | [ ] | Nav & footer | Header/footer links | All resolve; no 404s | ⬜ | |
| PUB-11 | [ ] | Logged-in header swap | Visit public site while logged in | Header reflects auth state (ConditionalPublicLayout) | ⬜ | |

### C2. Lead forms (feed app inboxes)

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-12 | [ ] | Contact form fields | Fill `/contact` form | All fields validate (name/email/message required) | ⬜ | |
| PUB-13 | [ ] | Contact submit | Submit valid form | Success message; lands in `/app/submissions` | ⬜ | |
| PUB-14 | [ ] | Contact invalid | Bad email / empty required | Inline errors; no submit | ⬜ | |
| PUB-15 | [ ] | Demo form | Submit demo request | Success; lands in app | ⬜ | |
| PUB-16 | [ ] | Start-project form | Submit | Success; lands in app | ⬜ | |
| PUB-17 | [ ] | Newsletter signup | Subscribe with email | Success; appears in `/app/subscribers` | ⬜ | |
| PUB-18 | [ ] | Newsletter duplicate | Subscribe same email twice | Handled (no duplicate) | ⬜ | |
| PUB-19 | [ ] | Job application | Apply on a careers posting (with resume) | Success; lands in `/app/job-applications` | ⬜ | |
| PUB-20 | [ ] | Resume upload validation | Wrong type / too large | Rejected with message | ⬜ | |
| PUB-21 | [ ] | Spam/double-submit | Submit twice fast | No duplicate; button guarded | ⬜ | |

### C3. Consent & legal

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-22 | [ ] | Consent checkbox present | On lead/signup forms | "I agree to Terms/Privacy" checkbox present | ⬜ | |
| PUB-23 | [ ] | Consent gating | Submit with consent unchecked | Blocked until checked | ⬜ | |
| PUB-24 | [ ] | Consent links | Click Terms/Privacy from the form | Open correct legal pages | ⬜ | |
| PUB-25 | [ ] | Terms page | Open `/terms` | Renders; content correct | ⬜ | |
| PUB-26 | [ ] | Privacy page | Open `/privacy` | Renders; reflects real data practices | ⬜ | |
| PUB-27 | [ ] | Refund page | Open `/refund-policy` | Renders | ⬜ | |
| PUB-28 | [ ] | Scrollspy TOC | On a legal page, scroll | TOC highlights the active section; clicking jumps correctly | ⬜ | |
| PUB-29 | [ ] | Legal links in footer | Footer → legal links | Resolve correctly | ⬜ | |

### C4. SEO, analytics & non-functional

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-30 | [ ] | GA4 fires | DevTools → Network, filter `collect`/`google`, navigate pages | GA4 pageview requests fire | ⬜ | |
| PUB-31 | [ ] | Google Ads tag | DevTools → Network, search `googletagmanager` | Tag loads from `googletagmanager.com` (in **UAT** the first-party `/metrics/` gateway is OFF — see C5 note) | ⬜ | |
| PUB-32 | [ ] | Meta/OG tags | View source on a few pages | Title/description/OG present | ⬜ | |
| PUB-33 | [ ] | 404 page | Visit a non-existent path | Branded 404, not a crash | ⬜ | |
| PUB-34 | [ ] | Performance | Load home on throttled network | Reasonable load; images lazy-load | ⬜ | |
| PUB-35 | [ ] | Accessibility spot-check | Tab through a form | Focus order + labels sane | ⬜ | |

### C5. Cookie consent banner & Consent Mode

> **What this is:** a banner ("We value your privacy — Accept All / Decline") appears on the public site. It controls Google's privacy settings (Consent Mode). The Google tag now loads for everyone; clicking Accept/Decline just updates the privacy preference. This is **different** from the legal "I agree to Terms" checkbox in C3.
>
> ⚠️ **Do NOT test the `/metrics/` first-party gateway in UAT.** That feature is **production-only** — in UAT the tag loads from `googletagmanager.com`, so visiting `…/metrics/` in UAT will 404. That is expected, **not a bug**. Don't file it.

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-36 | [ ] | Banner appears (first visit) | Open the site in a **fresh incognito** window | Cookie banner appears (after ~1s) with "Accept All" and "Decline" | ⬜ | |
| PUB-37 | [ ] | Accept All | Click **Accept All** | Banner closes | ⬜ | |
| PUB-38 | [ ] | Choice remembered | After accepting, reload the page | Banner does **not** reappear | ⬜ | |
| PUB-39 | [ ] | Decline | Fresh incognito → click **Decline** (or the ✕) | Banner closes; site still works normally | ⬜ | |
| PUB-40 | [ ] | Decline remembered | After declining, reload | Banner does **not** reappear | ⬜ | |
| PUB-41 | [ ] | Privacy link in banner | Click the **Privacy Policy** link inside the banner | Opens `/privacy` | ⬜ | |
| PUB-42 | [ ] | Tag loads regardless of choice | DevTools → Network → search `googletagmanager`, on a fresh visit **before** clicking the banner | The Google tag loads even before Accept (Consent Mode default) | ⬜ | |
| PUB-43 | [ ] | Site usable with banner open | With banner showing, scroll and click a nav link | Page works; banner doesn't block interaction | ⬜ | |
| PUB-44 | [ ] | Conversion on form submit (dev-assisted) | Submit the **Start-project** form, then ask dev to check GA4/Ads | Dev confirms a conversion/event was recorded | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)). Marketing pages are the most visible on mobile — check hero, nav drawer, and forms carefully.

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| PUB-R1 | [ ] | Home | ⬜ | ⬜ | ⬜ | |
| PUB-R2 | [ ] | Contact / Demo / Start-project forms | ⬜ | ⬜ | ⬜ | |
| PUB-R3 | [ ] | Careers + application form | ⬜ | ⬜ | ⬜ | |
| PUB-R4 | [ ] | Services / Industries / Resources | ⬜ | ⬜ | ⬜ | |
| PUB-R5 | [ ] | Legal pages (scrollspy TOC) | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
