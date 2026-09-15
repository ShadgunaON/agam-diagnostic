# 14 — Tasks, Submissions, Subscribers & Recruitment

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Operational inboxes and task management: tasks (own/all), the public **contact-form submissions** inbox, the newsletter **subscribers** list, and **job applications** from the careers site. Governed by `tasks.*`, `marketing.submissions.*`, `marketing.subscribers.*`, `recruitment.applications.*`.

## A. Scope & routes

- `/app/tasks` — all tasks; `/app/tasks/mine` — own tasks.
- `/app/submissions` — contact-form inbox.
- `/app/subscribers` — newsletter subscribers.
- `/app/job-applications` — recruitment applications.

## B. Preconditions

- Submit a public contact form, newsletter signup, and a job application (see [17 — Public & Legal](17-public-legal.md)) so these inboxes have data.
- A1 + roles with/without each permission.

## C. Test cases

### C1. Tasks

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| TSK-1 | [ ] | Tasks list loads | Open `/app/tasks` | Renders | ⬜ | |
| TSK-2 | [ ] | Empty/loading/error | No data / throttle / fail | Each state renders | ⬜ | |
| TSK-3 | [ ] | Create task | Add task (title, assignee, due date, priority, status) | Saved; listed | ⬜ | |
| TSK-4 | [ ] | Required validation | Submit empty | Inline errors | ⬜ | |
| TSK-5 | [ ] | Assign | Assign to an employee | Appears in their tasks | ⬜ | |
| TSK-6 | [ ] | Edit task | Edit fields | Persists | ⬜ | |
| TSK-7 | [ ] | Status change | Move status (todo→in-progress→done) | Reflected | ⬜ | |
| TSK-8 | [ ] | Delete task | Delete | Confirm + removed | ⬜ | |
| TSK-9 | [ ] | My tasks | Open `/app/tasks/mine` | Only own-assigned tasks | ⬜ | |
| TSK-10 | [ ] | Filter/sort/search | Exercise | Correct results | ⬜ | |
| TSK-11 | [ ] | Project link | Tasks created from a project | Linked correctly (see [05](05-projects.md)) | ⬜ | |
| TSK-12 | [ ] | Permissions | `tasks.view.own` vs all | Scoped correctly; no perm → no-access | ⬜ | |
| TSK-12a | [ ] | Assignee by identity | Assign a task; that person opens `/app/tasks/mine` | Task matches the assignee by their account (Cognito sub), not just name | ⬜ | |

### C1b. Client task approval loop

> A **client-facing** task can require client sign-off before it's billable: staff mark it complete → the client is **emailed** → the client **Approves** or **Requests revision** in the portal → an approved task can be **added to an invoice** (the bill amount is entered on the invoice; the **client never sees the price**). Needs SES email + backend deployed in UAT. Portal side is tested in [03 — Client Portal](03-external-client-portal.md). Preconditions: a client task assigned, and an A5 client portal user for that client.

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| TSK-12b | [ ] | Mark client task complete | Staff completes a client task | `approvalStatus` → **pending**; client emailed (check SES/inbox) | ⬜ | |
| TSK-12c | [ ] | Locked until approved | Try to invoice the task before approval | Not allowed until client approves | ⬜ | |
| TSK-12d | [ ] | Client approves (see [03](03-external-client-portal.md)) | A5 approves in portal; staff refresh | Status → **approved**; staff notified (bell) | ⬜ | |
| TSK-12e | [ ] | Revision requested | A5 requests revision with a note | Status → **revision requested**; note visible to staff; task re-opens | ⬜ | |
| TSK-12f | [ ] | Approved → invoice | After approval, add the task to an invoice | Allowed; **bill amount entered on the invoice**, not exposed to client (cross-check [07](07-invoices.md)) | ⬜ | |
| TSK-12g | [ ] | No price leak | Review what the client saw in the portal/email | Client never saw any monetary amount | ⬜ | |

### C2. Contact submissions inbox

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| TSK-13 | [ ] | Inbox loads | Open `/app/submissions` | Submissions render | ⬜ | |
| TSK-14 | [ ] | New submission arrives | Submit public contact form, refresh | New entry appears | ⬜ | |
| TSK-15 | [ ] | View detail | Open a submission (e.g. `?id=`) | Full message/details | ⬜ | |
| TSK-16 | [ ] | Mark/triage | Mark read/handled/status (if supported) | Persists | ⬜ | |
| TSK-17 | [ ] | Filter/search | By status/date/keyword | Correct rows | ⬜ | |
| TSK-18 | [ ] | Permissions | Without `marketing.submissions.view` | No-access | ⬜ | |

### C3. Subscribers

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| TSK-19 | [ ] | List loads | Open `/app/subscribers` | Subscribers render | ⬜ | |
| TSK-20 | [ ] | New signup arrives | Newsletter signup (public), refresh | New subscriber appears | ⬜ | |
| TSK-21 | [ ] | Duplicate email | Sign up same email twice | No duplicate / handled | ⬜ | |
| TSK-22 | [ ] | Manage/unsubscribe | Remove/unsubscribe (if supported) | Updates | ⬜ | |
| TSK-23 | [ ] | Export | Export subscribers | CSV correct | ⬜ | |
| TSK-24 | [ ] | Permissions | Without `marketing.subscribers.view` | No-access | ⬜ | |

### C4. Job applications

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| TSK-25 | [ ] | List loads | Open `/app/job-applications` | Applications render | ⬜ | |
| TSK-26 | [ ] | New application arrives | Apply via careers page, refresh | New application appears | ⬜ | |
| TSK-27 | [ ] | View detail + resume | Open an application | Details + resume download | ⬜ | |
| TSK-28 | [ ] | Triage/status | Set status (new/shortlisted/rejected) | Persists | ⬜ | |
| TSK-29 | [ ] | Filter by posting | Filter by job/status | Correct rows | ⬜ | |
| TSK-30 | [ ] | Export | Export | CSV correct | ⬜ | |
| TSK-31 | [ ] | Permissions | Without `recruitment.applications.view` | No-access | ⬜ | |

## D. Responsiveness

Run **R-1…R-15** (see [19 — Responsiveness](19-responsiveness.md)).

| # | ✓ | Page | M (390) | T (768) | D (1440) | Comments |
|---|---|------|---------|---------|----------|----------|
| TSK-R1 | [ ] | Tasks list + mine | ⬜ | ⬜ | ⬜ | |
| TSK-R2 | [ ] | Submissions inbox | ⬜ | ⬜ | ⬜ | |
| TSK-R3 | [ ] | Subscribers | ⬜ | ⬜ | ⬜ | |
| TSK-R4 | [ ] | Job applications | ⬜ | ⬜ | ⬜ | |

## E. Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build/commit | |
| Pass count | __ / __ |
| S1/S2 bugs filed | |
