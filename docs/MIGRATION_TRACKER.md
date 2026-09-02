# Agam Diagnostics - Next.js Migration Tracker

## Overall Progress

- [x] Sprint 1 - Engineering Foundation
- [x] Sprint 2 - Shared Layout System
- [x] Sprint 3 - Reusable UI Components
- [x] Sprint 4 - Shared Composite Components
- [x] Sprint 5 - Homepage Migration
- [x] Sprint 6A - Core Marketing Pages (About, Contact, FAQ, Legal)
- [x] Sprint 6B - Services, Tests, Packages
- [x] Sprint 6C - Blog, Book Test, Login, Reports
- [ ] Sprint 7 - Forms & User Flows
- [ ] Sprint 8 - Accessibility
- [ ] Sprint 9 - Performance Optimization
- [ ] Sprint 10 - SEO & Metadata
- [ ] Sprint 11 - Final QA & Production Readiness

---

## Sprint 2 Checklist

### Layout
- [x] Root Layout
- [x] Header
- [x] Navbar
- [x] Mobile Navigation
- [x] Footer
- [x] Main Content Wrapper
- [x] Page Container
- [x] Section Wrapper

### Architecture
- [x] Folder Structure Verified
- [x] Naming Conventions Followed
- [x] TypeScript Types Added
- [x] Responsive Foundation Ready
- [x] Accessibility Considered

### Validation
- [x] npm run lint
- [x] npm run build
- [x] npm run dev

---

## Sprint 3 Checklist

### UI Foundation
- [x] Button
- [x] Input
- [x] Textarea
- [x] Select
- [x] Checkbox
- [x] Radio
- [x] Switch
- [x] Badge
- [x] Chip
- [x] Divider
- [x] Spinner
- [x] Skeleton
- [x] Avatar
- [x] IconButton
- [x] Container
- [x] Typography
- [x] Link
- [x] Breadcrumb
- [x] SearchInput

### Validation
- [x] npm run lint
- [x] npm run build
- [x] npm run dev

---

## Sprint 4 Checklist

### Composite Components
- [x] ServiceCard
- [x] PackageCard
- [x] BlogCard
- [x] TestimonialCard
- [x] StatisticCard
- [x] FeatureCard
- [x] ContactCard
- [x] TeamMemberCard
- [x] FAQItem
- [x] CTASection

### Forms
- [x] ContactForm
- [x] SearchForm
- [x] NewsletterForm
- [x] BookAppointmentForm

### Validation
- [x] npm run lint
- [x] npm run build
- [x] npm run dev

---

## Sprint 5

### Homepage Sections

- [x] HeroSection
- [x] QuickActionsSection (if applicable)
- [x] StatisticsSection
- [x] ServicesSection
- [x] WhyChooseUsSection
- [x] HealthPackagesSection
- [x] TestimonialsSection
- [x] BlogPreviewSection
- [x] FAQSection
- [x] ContactPreviewSection
- [x] PartnersSection (if applicable)
- [x] AwardsSection (if applicable)

### Data

- [x] Homepage data extracted
- [x] Typed interfaces created
- [x] Existing components reused
- [x] No duplicated markup

### Composition

- [x] app/page.tsx composed only from sections

### Validation

- [x] npm run lint
- [x] npm run build
- [x] npm run dev

---

### Sprint 6A (Core Marketing Pages)

Status: **Completed**

### Pages

- [x] About
- [x] Contact
- [x] FAQ
- [x] Privacy Policy
- [x] Terms & Conditions

### Architecture

- [x] Existing components reused
- [x] Static data extracted
- [x] Metadata configured
- [x] No duplicated markup

### Validation

- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm run dev` (visual review)

### Sprint 6B (Catalog & Detail Pages)

Status: **Completed**

### Pages

- [x] Services
- [x] Service Detail
- [x] Tests
- [x] Health Packages
- [x] Package Detail

### Sections

- [x] Catalog sections created
- [x] Detail sections created
- [x] Existing components reused
- [x] No duplicated markup

### Data

- [x] `services.ts`
- [x] `tests.ts`
- [x] `packages.ts`
- [x] Typed interfaces
- [x] Static route data prepared

### Routing

- [x] `services/[slug]`
- [x] `health-packages/[slug]`
- [x] Static params generated

### Validation

- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm run dev`

### Sprint 6C (Blog, Booking, Authentication & Reports)

Status: **Completed**

### Pages

- [x] Blog
- [x] Blog Detail
- [x] Book Test
- [x] Login
- [x] Reports (Architecture Placeholder)

### Sections

- [x] Blog sections
- [x] Booking sections
- [x] Authentication sections
- [x] Reports placeholder sections
- [x] Existing components reused
- [x] No duplicated markup

### Data

- [x] blog.ts
- [x] booking.ts
- [x] reports.ts
- [x] Typed interfaces
- [x] Static route data prepared

### Routing

- [x] blog/[slug]
- [x] Static params generated
- [x] Metadata generated

### Validation

- [x] npm run lint
- [x] npm run build
- [x] npm run dev
## Phase 3 - Frontend Production Hardening

Status: **Completed**

### Architecture

- [x] Architecture audit
- [x] Bundle optimization audit
- [x] Performance audit
- [x] Accessibility audit
- [x] SEO audit
- [x] Structured data implementation
- [x] Component audit
- [x] CSS audit
- [x] Static generation audit

### Documentation

- [x] ARCHITECTURE.md
- [x] COMPONENT_GUIDE.md
- [x] DATA_LAYER.md
- [x] DEPLOYMENT.md
- [x] ROUTING.md
- [x] SEO.md
- [x] CONTRIBUTING.md

### Validation

- [x] npm run lint
- [x] npm run build
- [x] npm run dev

## Phase 4 - Backend Integration Foundation

Status: **Completed**

### Architecture

- [x] API abstraction
- [x] Domain layer
- [x] DTO separation
- [x] Repository interfaces
- [x] Result abstraction
- [x] Configuration layer
- [x] Error model
- [x] Loading state strategy

### Documentation

- [x] API_ARCHITECTURE.md
- [x] DOMAIN_MODEL.md
- [x] REPOSITORY_PATTERN.md
- [x] CONFIGURATION.md
- [x] ERROR_HANDLING.md
- [x] FRONTEND_BACKEND_CONTRACT.md

### Validation

- [x] npm run lint
- [x] npm run build
- [x] npm run dev

## Phase 5 - Backend Implementation (Mock -> Real API Ready)

Status: **In Progress**

### Architecture

- [ ] Mock repositories
- [ ] API repository placeholders
- [ ] Repository registry
- [ ] Service layer
- [ ] UI integration
- [ ] Error state integration

### Documentation

- [ ] MOCK_REPOSITORIES.md
- [ ] SERVICE_LAYER.md
- [ ] DATA_FLOW.md

### Validation

- [ ] npm run lint
- [ ] npm run build
- [ ] npm run dev

## Phase 6 - Layout Foundation

Status: **In Progress**

### Module 1: Primitives Creation
- [x] Create Layout Standards
- [x] Create Container, Section, Stack, Grid
- [x] Configure tailwind-merge and clsx
- [x] Validate production build

### Module 2: Public Layouts Migration
- [x] Migrate `app/layout.tsx`
- [x] Migrate `Header.tsx`
- [x] Migrate `Footer.tsx`
- [x] Validate production build

### Module 3: Public Sections Migration
- [x] Migrate Home sections (Hero, Services, Packages, etc)
- [x] Migrate About sections (Hero, Journey, Mission, etc)
- [x] Migrate Contact section
- [x] Migrate Blog sections
- [x] Migrate Services sections
- [x] Migrate Tests sections
- [x] Migrate Packages sections
- [x] Migrate Legal sections
- [x] Validate production build
- [x] Generate Verification Reports

**Metrics:**
- Sections migrated: 37
- Total sections: 37
- Remaining sections: 0
- Completion percentage: 100%

**Definition of Done (Applied to every migrated section):**
- [x] Layout preserved
- [x] Responsive verified
- [x] Accessibility preserved
- [x] Design tokens respected
- [x] No arbitrary spacing
- [x] No unused whitespace
- [x] No excessive whitespace
- [x] Build successful

### Module 4: Cards Migration

#### Module 4A: Information Cards
Status: **Completed**
- [x] Migrate `FeatureCard`
- [x] Migrate `ContactCard`
- [x] Migrate `AwardCard`
- [x] Verified visual parity and responsiveness
- [x] Validate production build

#### Module 4B: Content Cards
Status: **Completed**
- [x] Migrate `BlogCard`
- [x] Migrate `TeamMemberCard`
- [x] Migrate `ServiceCard`
- [x] Verified visual parity and responsiveness
- [x] Validate production build

#### Module 4C: Commerce Cards
Status: **Completed**
- [x] Migrate `PackageCard`
- [x] Migrate `card--test-premium` (TestsCatalogSection)
- [x] Migrate `card--service-premium` (ServicesCatalogSection)
- [x] Migrate `card--service-premium` (PackagesFeaturedSection)
- [x] Verified visual parity and responsiveness
- [x] Validate production build

#### Module 4D: Metrics Cards
Status: **Completed**
- [x] Migrate `StatisticCard`
- [x] Verified visual parity and responsiveness
- [x] Validate production build

#### Module 4E: Social Cards
Status: **Completed**
- [x] Migrate `TestimonialCard`
- [x] Verified visual parity and responsiveness
- [x] Validate production build

### Card Architecture Status
**Overall Phase 6 - Module 4 Status: COMPLETELY FROZEN & FINALIZED**
All Card families (Information, Content, Commerce, Metrics, Social) have been migrated.

## Phase 7 - Structural Overlays

Status: **In Progress**

### Module 7A: Overlay Foundation
Status: **Completed**
- [x] Install Headless Dependency (`@radix-ui/react-dialog`)
- [x] Create Overlay Layering Document
- [x] Configure Tailwind Keyframes for Overlays
- [x] Create `<Dialog>` Primitive
- [x] Create `<Drawer>` Primitive
- [x] Verify Accessiblity and Build

### Module 7B: Navigation Overlays
Status: **Completed**
- [x] Migrate `MobileNavigation.tsx`
- [x] Migrate `CartDrawer.tsx`

### Module 7C: Booking Overlays
Status: **Completed**
- [x] Migrate `Add Address Modal`
- [x] Migrate `Add Family Member Modal`

### Module 7D: Search Overlays
Status: **Completed**
- [x] Migrate `GlobalSearch.tsx`

## Phase 8 - Legacy Cleanup & Architecture Consolidation

Status: **In Progress**

### Module 8A: Booking Monolith Refactor
Status: **Completed**
- [x] Extract `BookingStepper.tsx`
- [x] Extract `BookingSummarySidebar.tsx`
- [x] Extract `BookingStepCart.tsx`
- [x] Extract `BookingStepSchedule.tsx`
- [x] Extract `BookingStepPatient.tsx`
- [x] Extract `BookingStepPayment.tsx`
- [x] Extract `BookingConfirmation.tsx`
- [x] Extract `AddAddressModal.tsx`
- [x] Extract `AddFamilyModal.tsx`
- [x] Refactor `BookingProcessSection.tsx` as orchestrator

## Unified Catalog & Pricing Architecture

This section tracks the migration to a unified, authoritative catalog model, removing frontend-driven pricing logic.

### Phase 1: Unified Domain Models and Backend Repositories
Status: **Completed**
Scope/Objective: Unify Test, Service, and Package models into a shared domain architecture. Centralize DynamoDB access patterns.
Major Changes: Created mapping layers, domain models, and updated DynamoDB repositories.
Associated Commit: `aeab498`

### Phase 2: Catalog Management UI
Status: **Completed**
Scope/Objective: Build Admin UI pages to view and manage Tests, Services, and Packages.
Major Changes: Created `/admin/catalog/*` routes and updated RBAC permissions for the catalog module.
Associated Commit: `24f1d0e`

### Phase 3: Public UI Consumes Authoritative Models
Status: **Completed**
Scope/Objective: Refactor public catalog pages to consume the new unified models instead of legacy structures.
Major Changes: Updated `TestDetailContent`, `PackageDetailContent`, `ServiceDetailContent`, and catalog sections.
Associated Commit: `33a852f`

### Phase 4: Backend Authoritative Pricing
Status: **Completed**
Scope/Objective: Ensure the backend is the sole monetary authority. Remove frontend trust for booking and invoice totals.
Major Changes: Updated `booking.js` lambda to resolve authoritative pricing from DynamoDB. Implemented 0% tax and conditional ₹150 collection fee. PhonePe integration confirmed to use server invoice total.
Associated Commit: `124041a`
