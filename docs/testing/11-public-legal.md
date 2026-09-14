# 11 — Public Forms & Legal

> Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ➖ N/A · ⬜ Not tested. See [README](README.md).

Covers unauthenticated forms, footer actions, and static legal pages.

## A. Preconditions
- None (Guest user).

## B. Test Cases

| # | ✓ | Test Case | Steps | Expected Result | Status | Comments |
|---|---|-----------|-------|-----------------|--------|----------|
| PUB-1 | [ ] | Contact Form | Visit Contact Us, submit valid data | Success message, data saved to Inquiries DB | ⬜ | |
| PUB-2 | [ ] | Contact Errors | Submit empty form | Validation errors shown | ⬜ | |
| PUB-3 | [ ] | Newsletter | Enter email in footer, subscribe | Success message, email saved to Newsletter DB | ⬜ | |
| PUB-4 | [ ] | Duplicate Email | Re-enter same email in footer | Handled gracefully | ⬜ | |
| PUB-5 | [ ] | Terms Page | Click Terms & Conditions in footer | Legal markdown renders | ⬜ | |
| PUB-6 | [ ] | Privacy Page | Click Privacy Policy in footer | Legal markdown renders | ⬜ | |
| PUB-7 | [ ] | Responsive Nav | Resize window to Mobile | Hamburger menu works, links accessible | ⬜ | |
