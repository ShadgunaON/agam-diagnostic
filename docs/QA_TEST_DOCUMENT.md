# Agam Diagnostics — QA Test Document

## Document Purpose
This document provides a comprehensive Quality Assurance (QA) testing guide for the Agam Diagnostics application. It details practical, actionable test cases based exclusively on the current implementation of the application (as of September 2026). This document is intended for QA engineers to independently execute full-cycle testing without needing prior development context.

## Application Scope
The application consists of:
1. **Public/E-Commerce Portal**: Patient registration, catalog browsing (Tests, Packages, Services), cart, checkout, payments, blogs, reviews, and a patient portal (My Bookings, My Reports).
2. **Admin Portal**: Internal management system for bookings, sample collections, reports, invoices, patient records, catalog content, staff, reviews moderation, and newsletter subscribers.
3. **GraphQL API**: AWS AppSync + Lambda backend managing all data logic, secured by Amazon Cognito.

## Environment / Test URL
- **Production/Test URL**: Currently deployed on AWS Amplify (refer to environment config).
- **Payment Gateway**: PhonePe (STRICTLY Sandbox/UAT environment only. Do not use production credentials).

## User Roles
The application uses AWS Cognito with custom attributes and groups for Role-Based Access Control (RBAC):
- **Guest (Unauthenticated)**: Can browse catalog, blog, and submit public forms.
- **Patient (`role: 'patient'`)**: Can book tests, view own bookings, reports, and invoices.
- **Phlebotomist / Lab Tech (`role: 'lab_tech'`)**: Can access assigned home collections.
- **Doctor / Staff (`role: 'doctor'`)**: Accesses specific modules defined in the DynamoDB permissions matrix (e.g., Reports, Bookings).
- **Admin (`role: 'admin'`)**: Full access to all modules, bypasses matrix checks.
- **Superadmin (`role: 'superadmin'`)**: Root immutable authority.

## Test Data Requirements
- **Test Patient Account**: Valid email/phone for Cognito OTP.
- **Test Admin Account**: Cognito user belonging to the `AdminGroup` or with `custom:role` set to `admin`.
- **Payment Data**: PhonePe sandbox test cards/VPA.
- **Dummy Reports**: Sample PDF/image files for report uploads.

## Testing Rules
1. **Never use real payment credentials.** Use only PhonePe Sandbox/UAT instruments.
2. **Do not test hidden features.** Base tests strictly on visible UI workflows and active API endpoints.
3. **Preserve data integrity.** Ensure test data is clearly marked as "TEST" in names/notes to avoid polluting production reports if testing on a live DB.

## Module Index
1. Authentication (AUTH)
2. Public Catalog & E-Commerce (CAT)
3. Booking & Checkout (BOOK)
4. Payment Processing (PAY)
5. Patient Portal (PORTAL)
6. Public Forms & Content (PUB)
7. Admin Dashboard & Analytics (DASH)
8. Admin Bookings & Collections (OPS)
9. Admin Reports & Invoices (RPT)
10. Admin Patients & Staff (USR)
11. Admin Catalog & Content Management (MGMT)
12. Authorization & RBAC (RBAC)

---

## 1. Authentication (AUTH)
**Purpose:** Handles user sign-up, login, OTP verification, and session management via AWS Cognito.
**Location:** `/login`, `/profile`, Top Navigation.

| TC ID | Test Case | Preconditions | Steps | Expected Result | Priority | Status |
|------|-----------|---------------|-------|-----------------|----------|--------|
| AUTH-001 | Patient Sign Up | Unauthenticated | 1. Go to `/login`<br>2. Fill sign-up form with valid email/phone<br>3. Submit and enter OTP | User is created in Cognito and DynamoDB. Session is established. | High | |
| AUTH-002 | Patient Login | Existing Patient Account | 1. Go to `/login`<br>2. Enter credentials<br>3. Submit | User successfully logs in and is redirected to previous page or Dashboard. | High | |
| AUTH-003 | Admin Login | Existing Admin Account | 1. Go to `/login`<br>2. Enter admin credentials | User logs in and gains access to `/admin` routes. | High | |
| AUTH-004 | Session Persistence | Logged in user | 1. Refresh page<br>2. Close and reopen tab | User remains logged in (JWT tokens persisted). | Medium | |
| AUTH-005 | Sign Out | Logged in user | 1. Click Profile icon<br>2. Click Sign Out | Session cleared, redirected to home. Cannot access protected routes. | High | |
| AUTH-006 | Invalid Login | Unauthenticated | 1. Go to `/login`<br>2. Enter wrong password | Error message displayed ("Incorrect username or password"). | High | |

---

## 2. Public Catalog & E-Commerce (CAT)
**Purpose:** Displays available Tests, Packages, and Services for public browsing and global search.
**Location:** `/tests`, `/health-packages`, `/services`, `/tests/[slug]`, etc.

| TC ID | Test Case | Preconditions | Steps | Expected Result | Priority | Status |
|------|-----------|---------------|-------|-----------------|----------|--------|
| CAT-001 | View Catalog List | None | 1. Navigate to `/tests`<br>2. Scroll through list | Tests are displayed correctly with names, prices, and categories. | High | |
| CAT-002 | View Detail Page | Active Test exists | 1. Click a Test<br>2. Review fields (Overview, What it checks, FAQs) | Detail page loads with all rich content matching backend data. | High | |
| CAT-003 | Global Search | None | 1. Open search bar (top nav)<br>2. Type "Blood" | Live search results appear, categorized and alphabetically sorted. | Medium | |
| CAT-004 | Add to Cart | None | 1. On a detail page, click "Add to Cart" | Item added to global cart state. Cart counter increments. | High | |
| CAT-005 | Prevent Duplicate Cart Items | Item already in cart | 1. Click "Add to Cart" on the same item | Item is not duplicated. UI indicates it is already in cart. | Medium | |
| CAT-006 | Empty State | No active packages | 1. Go to `/health-packages` | "No packages found" message displays nicely. | Low | |

---

## 3. Booking & Checkout (BOOK)
**Purpose:** Allows users to finalize their cart and create a booking.
**Location:** `/book`, Cart slide-over.

| TC ID | Test Case | Preconditions | Steps | Expected Result | Priority | Status |
|------|-----------|---------------|-------|-----------------|----------|--------|
| BOOK-001 | Remove from Cart | Cart has items | 1. Open cart<br>2. Click remove icon | Item is removed, total price recalculates. | High | |
| BOOK-002 | Checkout Redirect | Unauthenticated, Cart has items | 1. Open cart<br>2. Click Checkout | Redirected to `/login`. After login, redirected back to `/book`. | High | |
| BOOK-003 | Create Booking (Valid) | Authenticated, Cart has items | 1. Go to `/book`<br>2. Fill required patient info<br>3. Submit | Booking is created in DB (Pending state). Redirected to payment gateway. | High | |
| BOOK-004 | Form Validation | Authenticated, Cart has items | 1. Leave required fields blank<br>2. Click Checkout | UI shows validation errors. Booking not created. | Medium | |
| BOOK-005 | Duplicate Submission | Authenticated | 1. Double click checkout rapidly | Idempotency prevents duplicate bookings/invoices. | High | |

---

## 4. Payment Processing (PAY)
**Purpose:** Handles integration with PhonePe Gateway (Sandbox).
**Location:** PhonePe redirect, `/payment/[invoiceId]/status`.

| TC ID | Test Case | Preconditions | Steps | Expected Result | Priority | Status |
|------|-----------|---------------|-------|-----------------|----------|--------|
| PAY-001 | PhonePe Sandbox Redirect | Booking created | 1. Complete checkout | Redirected correctly to PhonePe Sandbox payment page with exact invoice amount. | High | |
| PAY-002 | Successful Payment | On PhonePe page | 1. Use PhonePe test credentials<br>2. Simulate Success | Redirected to success URL. Invoice marked 'Paid'. Booking active. | High | |
| PAY-003 | Failed/Cancelled Payment | On PhonePe page | 1. Simulate Failure/Cancel | Redirected to failure URL. Invoice remains 'Pending' or 'Unpaid'. Booking not progressed. | High | |

---

## 5. Patient Portal (PORTAL)
**Purpose:** Allows patients to track bookings, view reports, and download invoices.
**Location:** `/dashboard`, `/bookings`, `/reports`.

| TC ID | Test Case | Preconditions | Steps | Expected Result | Priority | Status |
|------|-----------|---------------|-------|-----------------|----------|--------|
| PORTAL-001 | View My Bookings | Patient logged in | 1. Go to Dashboard -> Bookings | Lists only bookings owned by this patient. | High | |
| PORTAL-002 | View Booking Details | Patient owns booking | 1. Click a booking | Shows status timeline (Confirmed, Sample Collected, etc.) and item list. | Medium | |
| PORTAL-003 | Download Receipt | Patient owns paid booking | 1. Go to Booking details<br>2. Click Print/Save PDF | Print dialog opens formatted correctly for PDF generation. | High | |
| PORTAL-004 | View My Reports | Patient owns published report | 1. Go to Reports | Lists reports marked as 'Published'. | High | |
| PORTAL-005 | Report Hidden if Processing | Report status = 'Processing' | 1. Go to Reports | Processing report does NOT appear in public list. | High | |
| PORTAL-006 | Unauthorized Access | Patient logged in | 1. Manually enter URL for another user's report | Access denied / Not Found. | High | |

---

## 6. Public Forms & Content (PUB)
**Purpose:** Handles public interactions like Contact Us, Newsletter, Blog, and Reviews.
**Location:** `/about`, `/blog`, `/reviews`.

| TC ID | Test Case | Preconditions | Steps | Expected Result | Priority | Status |
|------|-----------|---------------|-------|-----------------|----------|--------|
| PUB-001 | Submit Contact Form | None | 1. Go to Contact page<br>2. Fill valid data<br>3. Submit | Success message. Data saved to DynamoDB (Inquiries). | Medium | |
| PUB-002 | Newsletter Subscribe | None | 1. Enter email in footer<br>2. Click Subscribe | Success message. Email saved to DynamoNewsletterDB. | Medium | |
| PUB-003 | Submit Review | Logged in, owns completed booking | 1. Go to Booking<br>2. Click Leave Review<br>3. Submit | Review created in 'Pending' state (not publicly visible yet). | Medium | |
| PUB-004 | View Blog Post | None | 1. Go to `/blog`<br>2. Click a post | Post renders with formatted markdown/content. | Low | |

---

## 7. Admin Dashboard & Analytics (DASH)
**Purpose:** Administrative overview and KPI metrics.
**Location:** `/admin`, `/admin/analytics`.

| TC ID | Test Case | Preconditions | Steps | Expected Result | Priority | Status |
|------|-----------|---------------|-------|-----------------|----------|--------|
| DASH-001 | Dashboard KPIs | Admin logged in | 1. View Dashboard | Bookings, Pending Tests, Revenue display REAL values from DB (no fake trends). | High | |
| DASH-002 | Recent Bookings List | Admin logged in | 1. View Dashboard | Shows the latest incoming bookings in chronological order. | Medium | |
| DASH-003 | Analytics Charts | Admin logged in | 1. Go to Analytics | Revenue by Month chart and Test Distribution render using real backend data. | Medium | |
| DASH-004 | Analytics Export | Admin logged in | 1. Click Export PDF on Analytics | Print dialog opens, hiding sidebar and headers. | Low | |

---

## 8. Admin Bookings & Collections (OPS)
**Purpose:** Core operational workflows for processing patients.
**Location:** `/admin/bookings`, `/admin/collections`.

| TC ID | Test Case | Preconditions | Steps | Expected Result | Priority | Status |
|------|-----------|---------------|-------|-----------------|----------|--------|
| OPS-001 | Bookings Workspace | Admin logged in | 1. Go to Bookings | Paginated list, sorted newest first. Shows Payment Status. | High | |
| OPS-002 | Filter Bookings | Admin logged in | 1. Search by Patient Name<br>2. Change Status filter | Table updates instantly with correct filtered data. | Medium | |
| OPS-003 | Update Booking Status | Admin logged in | 1. Open Booking<br>2. Change status to 'Sample Collected' | Status updates in DB. Triggers Collection/Report lifecycle if applicable. | High | |
| OPS-004 | Collections Workspace | Admin logged in | 1. Go to Collections | Lists active collections. | High | |
| OPS-005 | Update Collection | Admin logged in | 1. Open Collection<br>2. Mark 'Completed' | Status updates. Syncs back to parent Booking if required. | High | |

---

## 9. Admin Reports & Invoices (RPT)
**Purpose:** Managing test results and financial ledgers.
**Location:** `/admin/reports`, `/admin/invoices`.

| TC ID | Test Case | Preconditions | Steps | Expected Result | Priority | Status |
|------|-----------|---------------|-------|-----------------|----------|--------|
| RPT-001 | Reports Workspace | Admin logged in | 1. Go to Reports | Paginated list, sorted newest first. | High | |
| RPT-002 | Upload Report | Admin logged in | 1. Open Pending Report<br>2. Upload PDF file | File uploaded to S3. Report status updates to 'Processing' or 'Published'. | High | |
| RPT-003 | Publish Report | Uploaded Report | 1. Click Publish | Status changes to 'Published'. Now visible in Patient Portal. | High | |
| RPT-004 | Invoices Workspace | Admin logged in | 1. Go to Invoices | Lists all invoices. Identifies Paid vs Pending. | High | |
| RPT-005 | Record Manual Payment | Invoice is Pending | 1. Open Invoice<br>2. Click Record Payment (Card/Cash) | Invoice marked Paid. Status synced to Booking. | High | |
| RPT-006 | Print Admin Invoice | Admin logged in | 1. Open Invoice<br>2. Click Print / Save PDF | Dialog opens. Sidebar hidden. Perfect invoice layout. | Medium | |

---

## 10. Admin Patients & Staff (USR)
**Purpose:** CRM for patient records and staff directory.
**Location:** `/admin/patients`, `/admin/staff`.

| TC ID | Test Case | Preconditions | Steps | Expected Result | Priority | Status |
|------|-----------|---------------|-------|-----------------|----------|--------|
| USR-001 | Patient Directory | Admin logged in | 1. Go to Patients | Paginated list of all registered patients. | Medium | |
| USR-002 | Patient KPIs | Admin logged in | 1. View Patients Page | Top KPIs show Total Patients, Active Bookings. | Low | |
| USR-003 | Staff Directory | Admin logged in | 1. Go to Staff | Lists internal staff users (requires specific DB setup or Cognito group fetch). | Medium | |

---

## 11. Admin Catalog & Content Management (MGMT)
**Purpose:** CMS functionality for tests, packages, blogs, reviews, and newsletters.
**Location:** `/admin/catalog`, `/admin/blogs`, `/admin/reviews`, `/admin/newsletter`.

| TC ID | Test Case | Preconditions | Steps | Expected Result | Priority | Status |
|------|-----------|---------------|-------|-----------------|----------|--------|
| MGMT-001 | Create Catalog Item | Admin logged in | 1. Go to Catalog -> Add New<br>2. Fill Test details (Price, Overview)<br>3. Save | Test is saved. Immediately visible in Public Catalog. | High | |
| MGMT-002 | Edit Catalog Item | Admin logged in | 1. Edit existing Package<br>2. Change price<br>3. Save | Price updates instantly in Admin and Public site. | High | |
| MGMT-003 | Moderate Reviews | Pending Review exists | 1. Go to Reviews<br>2. Click Approve | Status changes to Approved. Review appears on public Home/Reviews page. | High | |
| MGMT-004 | Newsletter Unsubscribe | Active Subscriber exists | 1. Go to Newsletter<br>2. Click 3-dots -> Unsubscribe | Subscriber status flips to 'Unsubscribed'. | Medium | |
| MGMT-005 | Newsletter Delete | Subscriber exists | 1. Click 3-dots -> Delete | Subscriber permanently removed from DB and UI. | Medium | |

---

## 12. Authorization & RBAC (RBAC)
**Purpose:** Validating security barriers and matrix permissions.
**Location:** Edge routing, API endpoints.

| TC ID | Test Case | Preconditions | Steps | Expected Result | Priority | Status |
|------|-----------|---------------|-------|-----------------|----------|--------|
| RBAC-001 | Prevent Unauthenticated Admin | Guest | 1. Navigate to `/admin` | Redirected to `/login`. | Critical | |
| RBAC-002 | Prevent Patient in Admin | Logged in as Patient | 1. Navigate to `/admin` | Access denied. Kicked out or shows Unauthorized UI. | Critical | |
| RBAC-003 | GraphQL Auth Denial | Guest / Postman | 1. Send POST to `/api/graphql` with `adminBookingsWorkspace` query | Request rejected. Error: Unauthorized / Missing token. | Critical | |

---

## End-to-End Test Matrix

### FLOW-001: Happy Path Booking & Fulfillment
1. **Patient Registration**: New user signs up and logs in.
2. **Catalog Browsing**: Patient searches for "Complete Blood Count", views details.
3. **Checkout**: Patient adds to cart and proceeds to `/book`. Fills form.
4. **Payment**: Redirects to PhonePe Sandbox. Patient simulates Successful Payment.
5. **Confirmation**: Patient lands on Success page. Booking is `Confirmed`. Invoice is `Paid`.
6. **Admin Triage**: Admin logs in, goes to Bookings. Sees new booking.
7. **Collection**: Admin assigns phlebotomist. Phlebotomist marks collection as `Completed`.
8. **Reporting**: Admin goes to Reports. Uploads a PDF result file. Clicks `Publish`.
9. **Patient Review**: Patient goes to Dashboard -> Reports. Views/downloads the PDF.
10. **Feedback**: Patient submits a Review. Admin approves it. Review shows on homepage.

### FLOW-002: Abandoned Payment Safety Check
1. **Checkout**: Patient checks out, redirects to PhonePe.
2. **Failure**: Patient clicks "Cancel/Fail" on PhonePe.
3. **Redirection**: Patient returns to Failure screen.
4. **Validation**: 
   - Invoice must be `Unpaid` or `Pending`.
   - Booking must NOT transition to Confirmed.
   - Admin Collections/Reports must NOT have generated tasks for this booking.

---

## Cross-Module Regression Checklist
Before certifying a release, verify:
- [ ] Global Search returns valid data across both Public (Tests, Packages) and Admin (Patients, Invoices) scopes.
- [ ] Admin Sidebar navigation is fully functional without hard reloads.
- [ ] Print functionality in Receipts and Invoices cleanly hides navigation bars.
- [ ] No fake or randomly generated data appears in Analytics KPIs (must be disabled or real).

---

## Critical / High-Priority Test Cases
- **AUTH-001, AUTH-002, AUTH-005**: Core login flows.
- **BOOK-003**: Checkout form and Idempotency.
- **PAY-002, PAY-003**: PhonePe Sandbox success/failure handling.
- **RBAC-001, RBAC-002**: Infrastructure boundary security.
- **RPT-002, RPT-003**: Medical report upload and access control.

---

## Known Limitations / Not Testable
- **PhonePe Production**: Cannot be tested. All payment testing is strictly locked to UAT/Sandbox.
- **Automated Emails (SES)**: AWS SES is not configured. Email triggers (Newsletter, Contact Form, Blog alerts) are currently skipped/disabled. Testing these will not yield email delivery.
- **Live Notifications**: Push notifications are purely UI-based for now.
- **Superadmin Matrix Configuration**: UI for editing the raw RBAC matrix is hidden/developer-only via DynamoDB direct access. Tests assume matrix is pre-configured.

---
## QA Execution Summary
| Tester Name | Date Executed | Environment | Status (Pass/Fail) | Notes |
|-------------|---------------|-------------|--------------------|-------|
|             |               |             |                    |       |
