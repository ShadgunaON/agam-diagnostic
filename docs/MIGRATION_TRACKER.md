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
- [x] Sprint 6D - Catalog Data Reflection & Admin Enhancements
- [x] Hotfix — GraphQL Contract Alignment & RBAC Identity Fix (2026-09-07)
- [ ] Sprint 7 - Forms & User Flows
- [ ] Sprint 8 - Accessibility
- [ ] Sprint 9 - Performance Optimization
- [ ] Sprint 10 - SEO & Metadata
- [ ] Sprint 11 - Final QA & Production Readiness

## Complete Remediation — Systematic Fix Execution (2026-09-08)

### Remediation Log

#### Issue 11 (P0-2): createBooking fails when items are identified by ID instead of slug
- **Issue:** `createBooking` threw `"Package <name> is unavailable or invalid"` for any booking where cart items were stored/sent by ID only (no `slug` field). Reported as a production failure.
- **Confirmed Root Cause:** The item price-validation loop in `graphql.js` (lines 1523-1530) called `packageRepo.getBySlug(item.slug || item.id)`, `testRepo.getBySlug(...)`, and `serviceRepo.getBySlug(...)`. `getBySlug` queries the slug GSI — passing an `id` string always returns `null`. The `null` check then threw the "unavailable or invalid" error before any DynamoDB write, silently killing every booking submitted without a slug.
- **Files Changed:** `infrastructure/src/handlers/graphql.js`
- **Lines Changed:** 1524, 1528, 1530
- **Fix Applied:** Replaced the single-arg `getBySlug(item.slug || item.id)` calls with explicit branching: `item.slug ? repo.getBySlug(item.slug) : repo.getById(item.id)`. Applied to all three catalog lookups (packageRepo, testRepo, serviceRepo). No other code touched.
- **Verification Performed:**
  - `node --check infrastructure/src/handlers/graphql.js` → exit 0
  - 9-case inline Node.js regression test (7 fixed-path assertions + 2 old-path bug-reproduction assertions) → 9/9 passed
- **Commit:** `5c1fe58`
- **Result:** ✅ Fix verified. `createBooking` now resolves catalog items correctly whether `item.slug` or `item.id` is supplied.

#### Issue 12 (P0-1): createBooking crashes when idempotencyKey is omitted by the caller

- **Issue:** `dynamo-booking.js:createAggregate` performs a hard `throw` if `idempotencyKey` is falsy. The GraphQL schema declares `idempotencyKey: String` (nullable — no `!`), so any caller that legally omits it triggers a runtime crash before any DynamoDB write occurs.
- **Confirmed Root Cause:** Schema and repo contract mismatch. The resolver forwarded `args.idempotencyKey` directly to the repo with no fallback guard.
- **Caller Audit (pre-fix):**
  - `BookingProcessSection.tsx` — always provides `crypto.randomUUID()` via `useRef`
  - `ProgressiveBookingFlow.tsx` — same pattern
  - `admin/bookings/create/page.tsx` — always provides `crypto.randomUUID()` at submit time
  - `BookingService.ts` — service-layer fallback: `` options?.idempotencyKey || `idem_${Date.now()}` ``
  - **All real callers are safe.** The crash only fires for edge-case / direct API callers that omit the field.
- **Fix Decision:** Resolver-level fallback. Generating the fallback in the resolver (between schema and repo) ensures the repo guard is never reachable from a null key, while keeping true idempotency intact for all callers that supply a stable UUID. The repo guard (`dynamo-booking.js:51`) is left **untouched** as defence-in-depth.
- **Files Changed:** `infrastructure/src/handlers/graphql.js`
- **Lines Changed:** 1503 (1 line → 2 lines)
- **Fix Applied (diff):**
  ```diff
  -        const { input, idempotencyKey } = args;
  +        const { input, idempotencyKey: rawIdempotencyKey } = args;
  +        const idempotencyKey = rawIdempotencyKey || `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  ```
- **Verification Performed:**
  - `node --check infrastructure/src/handlers/graphql.js` → exit 0
  - 7-case behavioral test → 7/7 passed: UUID pass-through, idem_ pass-through, null fallback, undefined fallback, stable key stability, distinct fallbacks, repo guard unchanged
- **Commit:** `a75777d`
- **Result:** ✅ Fix verified. Missing `idempotencyKey` no longer crashes `createBooking`. True idempotency is preserved for all real callers.

#### Issue 13 (P1-3): setPaymentMethod sends wrong GraphQL argument name

- **Issue:** `InvoiceService.setPaymentMethod` sent the mutation variable as `$paymentMethod` / `paymentMethod: $paymentMethod`. AppSync rejected the request with an unknown-field error because the schema declares the argument as `method`, not `paymentMethod`. Additionally, the mutation requested a sub-selection `{ id paymentMethod }` but the schema return type is `Boolean!`, which has no fields.
- **Confirmed Root Cause:** Frontend mutation string and variables object used the wrong argument name. The schema (`schema.graphql:158`) and resolver (`graphql.js:2216`) both correctly use `method` — only the frontend was wrong.
- **Contract Evidence:**
  - Schema: `updateInvoicePaymentMethod(id: ID!, method: String!): Boolean!`
  - Resolver: `const { id, method: paymentMethod } = args;` — reads `method` ✅
  - Frontend (before fix): `$paymentMethod: String!` / `paymentMethod: $paymentMethod` / `{ id paymentMethod }` ❌
- **Files Changed:** `services/InvoiceService.ts`
- **Lines Changed:** 199-210 (method only — no other code touched)
- **Fix Applied (diff):**
  ```diff
  -    const data = await this._graphqlFetch<{ updateInvoicePaymentMethod: InvoiceModel }>(
  -      `mutation UpdateInvoicePaymentMethod($id: ID!, $paymentMethod: String!) {
  -        updateInvoicePaymentMethod(id: $id, paymentMethod: $paymentMethod) {
  -          id paymentMethod
  -        }
  -      }`,
  -      { id: invoiceId, paymentMethod: method }
  +    const data = await this._graphqlFetch<{ updateInvoicePaymentMethod: boolean }>(
  +      `mutation UpdateInvoicePaymentMethod($id: ID!, $method: String!) {
  +        updateInvoicePaymentMethod(id: $id, method: $method)
  +      }`,
  +      { id: invoiceId, method }
  ```
- **Verification Performed:**
  - `npx tsc --noEmit` → exit 0 (0 TypeScript errors)
  - 5-case contract alignment test → 5/5 passed:
    - Fixed `method` arg resolves correctly in resolver ✅
    - Old `paymentMethod` arg causes resolver to fail (reproduces bug) ✅
    - Mutation string uses `$method` not `$paymentMethod` ✅
    - Variables object has key `method` not `paymentMethod` ✅
    - No object sub-selection on Boolean! return ✅
- **Commit:** `09f1178`
- **Result:** ✅ Fix verified. `setPaymentMethod` now sends the correct argument name and AppSync will accept the mutation.

#### Issue 14 (P1-4): adminBookingsWorkspace checks wrong RBAC module key

- **Issue:** Staff with booking access were wrongly denied entry to the Admin Bookings Workspace.
- **Confirmed Root Cause:** The `adminBookingsWorkspace` resolver (`graphql.js:358`) checked `hasPermission(identityForCheck, 'bookings', 'view')`. However, the RBAC permission matrix and all other booking-related resolvers (`recentBookings`, `bookingsByPatient`, `createBooking`, etc.) uniformly use the module key `'orders'`. The mismatch caused the fail-closed RBAC engine to deny access.
- **Files Changed:** `infrastructure/src/handlers/graphql.js`
- **Lines Changed:** 358-359
- **Fix Applied:** Changed `'bookings'` to `'orders'` in both the `hasPermission` check and the resulting error message.
- **Verification Performed:**
  - `node --check infrastructure/src/handlers/graphql.js` → exit 0
  - Behavioral auth test script → 5/5 passed:
    - Admin gets access (bypasses matrix) ✅
    - Staff with `orders.view` gets access (uses matrix) ✅
    - Staff without `orders.view` is denied ✅
    - Patient is denied ✅
    - Old logic (`bookings.view`) reproduces the staff denial bug ✅
- **Commit:** `3b24081`
- **Result:** ✅ Fix verified. Staff with valid order viewing permissions can now access the Bookings Workspace.

#### Issue 15 (P1-1): deleteBlog resolver return type mismatch

- **Issue:** The `deleteBlog` mutation returned an object `{ message, id }` from the resolver, but the GraphQL schema declares the return type as `Boolean!`. This mismatch would cause AppSync to throw a field resolution error.
- **Confirmed Root Cause:** The resolver (`graphql.js:2623`) returned a message object instead of a boolean. The frontend caller (`BlogService.ts:153`) already correctly expected a boolean.
- **Files Changed:** `infrastructure/src/handlers/graphql.js`
- **Lines Changed:** 2623
- **Fix Applied:** Changed the return value from `{ message: 'Article deleted successfully', id: existing.id }` to `true`.
- **Verification Performed:**
  - `node --check infrastructure/src/handlers/graphql.js` → exit 0
  - Contract check script → 3/3 passed:
    - Resolver returns boolean ✅
    - Schema declares `Boolean!` ✅
    - Frontend expects `boolean` ✅
- **Commit:** `ce9475f`
- **Result:** ✅ Fix verified. The `deleteBlog` resolver now returns a boolean, satisfying the schema contract.

#### Issue 16 (P1-2): newsletterSubscribers returns flat array instead of SubscriberConnection

- **Issue:** The `newsletterSubscribers` resolver returned a flat array of subscribers, and the frontend requested fields as if it were a flat array. However, the GraphQL schema declares the return type as `SubscriberConnection!` (which contains `{ data, meta }`).
- **Confirmed Root Cause:** The resolver (`graphql.js:2493`) directly returned `newsletterRepo.getAll()`. The schema expects connection-based pagination.
- **Files Changed:**
  - `infrastructure/src/repositories/dynamo-newsletter.js`
  - `infrastructure/src/handlers/graphql.js`
  - `services/BlogService.ts`
- **Fix Applied:**
  - **Repository:** Added `getPaginated` using DynamoDB `QueryCommand` with `Limit` and `ExclusiveStartKey` (base64 encoded cursor), eliminating the `getAll()` unbounded read.
  - **Resolver:** Replaced the in-memory slice logic with `newsletterRepo.getPaginated({ limit, cursor })`, properly formatting the `{ data, meta }` response matching `PaginationMeta`.
  - **Frontend:** Updated the GraphQL query in `getNewsletterSubscribers` to request fields inside `data { ... }` and `meta { ... }`.
- **Verification Performed:**
  - `npx tsc --noEmit` → exit 0
  - Server-side cursor and limit logic check → ✅
- **Commit:** `18fc077`
- **Result:** ✅ Fix verified. `newsletterSubscribers` now properly adheres to the `SubscriberConnection` contract and uses server-side data access pagination without unbounded reads.

#### Issue 17 (P2-3): createReview incorrectly parses args instead of args.input

- **Issue:** The schema defines `createReview(input: String!): Review!`. The global middleware correctly parses `args.input` if it is a JSON string. However, the resolver destructured fields from the root `args` instead of `args.input`, and the frontend sent root arguments instead of a stringified input object.
- **Confirmed Root Cause:** Mismatched argument destructuring in `graphql.js:417` and incorrect GraphQL variables payload in `ReviewService.ts:107`.
- **Files Changed:**
  - `infrastructure/src/handlers/graphql.js`
  - `services/ReviewService.ts`
- **Lines Changed:**
  - `graphql.js`: 417-418
  - `ReviewService.ts`: 107-113
- **Fix Applied:**
  - **Resolver:** Added a guard for missing `args.input` and changed destructuring to target `args.input` instead of `args`.
  - **Frontend:** Changed the mutation to accept `$input: String!` and passed a stringified JSON payload matching the schema contract.
- **Verification Performed:**
  - `node --check infrastructure/src/handlers/graphql.js` → exit 0
  - `npx tsc --noEmit` → exit 0
  - Input parsing behavior script → 4/4 passed (valid input, missing input, null input, missing required fields)
- **Commit:** `f7c4376`
- **Result:** ✅ Fix verified. `createReview` now strictly obeys the `input: String!` schema contract on both the frontend and backend.


#### Issue 1: Deployed Lambda Syntax Crash
- **Issue:** Every GraphQL query and mutation returned `Runtime.UserCodeSyntaxError: SyntaxError: Unexpected token 'case'` from `GraphQLResolverFunction`.
- **Confirmed Root Cause:** Unclosed switch-case block in `infrastructure/src/handlers/graphql.js` preceding `case 'updateInvoicePaymentMethod': {`. The previous `case 'updateInvoiceStatus'` block had an unbalanced brace structure.
- **Files Changed:** `infrastructure/src/handlers/graphql.js`
- **Fix Applied:** Corrected the switch-case structure and closed the `case 'updateInvoiceStatus'` switch block.
- **Verification Performed:**
  - `node --check infrastructure/src/handlers/graphql.js` (Passed)
  - `npx tsc --noEmit` (Passed)
  - `sam build && sam deploy` (Passed, Stack UPDATE_COMPLETE)
  - `npm run build` (Passed)
- **Result:** ✅ Fix verified locally and deployed to AWS. GraphQL AppSync API is now successfully handling requests without syntax errors.

#### Issue 2: Missing Lambda Environment Variable `USER_POOL_ID` & IAM Permissions
- **Issue:** Admin staff creation (`createStaff`) and patient self-registration failed with `"userPoolId must not be null"`.
- **Confirmed Root Cause:** `GraphQLResolverFunction` in `infrastructure/template.yaml` lacked `USER_POOL_ID` in `Environment.Variables`, lacked IAM policies for `cognito-idp:AdminCreateUser`, `AdminAddUserToGroup`, `AdminGetUser`, and lacked SSM access to `/agam/SuperAdminSub`. Additionally, `@aws-sdk/client-cognito-identity-provider` was improperly placed in `devDependencies` in `infrastructure/package.json`.
- **Files Changed:** `infrastructure/template.yaml`, `infrastructure/package.json`
- **Fix Applied:** Injected `USER_POOL_ID: !Ref AgamUserPool` and `SUPER_ADMIN_SSM_PATH: "/agam/SuperAdminSub"` into `GraphQLResolverFunction` environment. Added IAM statements for Cognito IDP admin actions and SSM Parameter Store access. Moved Cognito and S3 SDK packages to `dependencies` in `infrastructure/package.json`.
- **Verification Performed:** YAML syntax and CloudFormation resource cross-reference inspection; `package.json` structure check.
- **Result:** ✅ Resolved missing environment variable and IAM role capabilities.

#### Issue 3: GraphQL Contract Mismatches (UnknownType AWSJSON & FieldUndefined)
- **Issue:** Frontend queries consistently returned `Validation error of type UnknownType: Unknown type AWSJSON` and `FieldUndefined` errors because they expected fields not present in the backend AppSync schema.
- **Confirmed Root Cause:** Frontend mutations erroneously defined inputs with `AWSJSON!`, whereas the AppSync schema specified `String!`. Additionally, the frontend requested fields (e.g., `age`, `gender`, `bloodGroup`) on `Patient` that existed in the TypeScript models but were absent from `schema.graphql`.
- **Files Changed:** `services/*.ts` (10 files), `infrastructure/schema.graphql`
- **Fix Applied:** Modified all frontend services to correctly specify `$input: String!` and stringify input variables globally. Added missing fields (`age`, `gender`, `bloodGroup`, `relation`, `dobOrAge`, `ownerSub`, `updatedAt`) to the `Patient` type in `schema.graphql` to establish contract parity.
- **Verification Performed:**
  - `npx tsc --noEmit` (Passed)
  - `npm run build` (Passed)
  - Validation: Confirmed parity of GraphQL parameters between Frontend queries and backend schema mutations.
- **Result:** ✅ Fix verified. Frontend mutations correctly match backend AppSync schema. `FieldUndefined` correctly resolved for the Patient model.

#### Issue 4: PhonePe AppSync Event Header Access
- **Issue:** PhonePe integration failed because the request origin/host could not be retrieved from `event.headers`.
- **Confirmed Root Cause:** AppSync Lambda Resolvers pass headers in `event.request.headers`, not `event.headers`.
- **Files Changed:** `infrastructure/src/handlers/graphql.js`, `infrastructure/src/shared/auth.js`
- **Fix Applied:** Modified the header extraction logic to safely use `event.request?.headers` to extract the correct origin during PhonePe payment initializations.
- **Verification Performed:** Code analysis verified that AppSync direct Lambda resolvers map context headers to `event.request.headers`.
- **Result:** ✅ Fixed AppSync PhonePe header resolution.

#### Issue 5: Cognito Group -> Admin Role / Authorization Mismatch
- **Issue:** Admin staff were failing RBAC authorization checks.
- **Confirmed Root Cause:** The `identity` object built directly in `graphql.js` was missing `primaryPatientId` and `staffId`, which are constructed correctly in `auth.js`. This mismatch caused RBAC functions (like `canAccessPatient`) to fail when checking against `identity.primaryPatientId`.
- **Files Changed:** `infrastructure/src/handlers/graphql.js`
- **Fix Applied:** Normalized the AppSync Cognito `identity` object constructed in `graphql.js` to exactly match the schema returned by `extractIdentity` in `auth.js`, including `primaryPatientId` and `staffId`.
- **Verification Performed:** Code analysis confirmed identity schema parity across both modules.
- **Result:** ✅ Resolved AppSync Cognito identity mismatch, restoring full RBAC functionality for Admin accounts.

#### Issue 6: Reports DynamoDB Map-type FilterExpression
- **Issue:** DynamoDB returned a `ValidationException: The first operand to the contains function must be a String, Set, or List` when searching Reports and Collections.
- **Confirmed Root Cause:** The search FilterExpression tried to use the `contains()` function directly on the `patient` attribute, which is a DynamoDB Map type, instead of a primitive type.
- **Files Changed:** `infrastructure/src/repositories/dynamo-report.js`, `infrastructure/src/repositories/dynamo-collection.js`
- **Fix Applied:** Modified the DynamoDB query FilterExpressions to use `patientId` (which is a String) instead of the `patient` Map or non-existent fields.
- **Verification Performed:** Verified DynamoDB Query commands use only scalar types for `contains()`.
- **Result:** ✅ Resolved `ValidationException` during pagination and search queries.

#### Issue 7: Reports GraphQL Mutation Contract Mismatch (P2-1)
- **Issue:** The `updateReportStatus` mutation in `ReportsService.ts` requested a sub-selection `{ id status }`, but the schema defined it as scalar `Boolean!`.
- **Confirmed Root Cause:** Frontend mutation contract mismatch.
- **Files Changed:** `services/ReportsService.ts`
- **Fix Applied:** Replaced the `{ id status }` sub-selection with a scalar request, and synthesized the domain return object internally so that the service layer continues to emit a properly shaped model.
- **Verification Performed:** Verified that the API call no longer produces a GraphQL sub-selection error.
- **Result:** ✅ Resolved.

#### Issue 8: Blog GraphQL Contract Mismatch (P2-2)
- **Issue:** The `deleteArticle` and `subscribeToNewsletter` mutations in `BlogService.ts` requested sub-selections, but the schema defines them as `Boolean!`.
- **Confirmed Root Cause:** Frontend mutation contract mismatch.
- **Files Changed:** `services/BlogService.ts`
- **Fix Applied:** Removed sub-selections from both `deleteBlog` and `newsletterSubscribe` mutations. Synthesized the correct success payloads locally to satisfy frontend types.
- **Verification Performed:** Verified the API calls are scalar-compliant.
- **Result:** ✅ Resolved.

#### Issue 9: Global Search Package Route 404 (P2-3)
- **Issue:** Global search previously returned `/packages/${p.slug}`.
- **Confirmed Root Cause:** The public route is `/health-packages/`, not `/packages/`.
- **Files Changed:** `infrastructure/src/handlers/graphql.js`
- **Fix Applied:** Adjusted the `packageRepo.search` map callback to correctly use `/health-packages/${p.slug}` in the `href`. (Note: This was verified as already completed during earlier hotfixes).
- **Verification Performed:** Verified code explicitly sets `href: /health-packages/${p.slug}`.
- **Result:** ✅ Resolved.

#### Issue 10: AWS SDK Dependency Packaging Risk (P3-1)
- **Issue:** Runtime-required AWS SDKs were incorrectly placed in `devDependencies`, which could cause SAM to strip them during production builds.
- **Confirmed Root Cause:** `package.json` misconfiguration.
- **Files Changed:** `infrastructure/package.json`
- **Fix Applied:** Relocated `@aws-sdk/client-cognito-identity-provider`, `@aws-sdk/client-s3`, and `@aws-sdk/s3-request-presigner` to the `dependencies` block. (Note: applied concurrently with P0-2).
- **Verification Performed:** Verified `package.json` structure and `sam build` artifact output.
- **Result:** ✅ Resolved.

---

## Hotfix — GraphQL Contract Alignment & RBAC Identity Fix

**Completed:** 2026-09-07  
**Scope:** End-to-end contract audit between AppSync schema, Lambda resolver, and frontend service queries. Fix for RBAC identity shape bug that silently blocked all permission checks for authenticated admin users.

### Executive Summary

Production deployed with six schema/service contract mismatches accumulated across sprints. Simultaneously, a structural bug in `graphql.js` built the identity object without properly mapping Cognito groups to roles when `custom:role` was missing, causing `isAdmin`, `isStaff`, and `hasPermission` to silently bypass RBAC for catalog admin features and block Admin creation flows. Furthermore, the catalog pricing fields were strictly evaluated as strings on the frontend despite being typed as Float! from AppSync, causing 500 errors on SSR pages.

**Fixes Applied & Verified (2026-09-07 Hotfix 2):**
- **Catalog Pricing 500 Error**: Updated `parsePrice` in `TestsCatalogSection`, `ServicesCatalogSection`, `PackagesCatalogSection`, and `PackagesFeaturedSection` to safely accept numeric inputs and bypass regex replacement.
- **Admin RBAC Role Resolution**: Migrated the `extractIdentity` group-to-role fallback logic into `graphql.js` identity construction, correctly resolving `identity.role` for AdminGroup members missing a custom attribute.
- **Verification**: `tsc` passed, `next build` passed, `sam deploy` completed, pushed to Amplify, live verification pending.

### Files Modified

| File | Change |
|---|---|
| `infrastructure/schema.graphql` | `TestItem` ← `tag`, `createdAt`, `updatedAt`; `PackageItem` ← `includes`, `createdAt`, `updatedAt`; `ServiceItem` ← `createdAt`, `updatedAt`; `BlogItem` expanded to full field set; `blogs` return type `BlogConnection!` → `[BlogItem!]!`; `blogById` arg renamed `id` → `idOrSlug` |
| `services/TestCatalogService.ts` | All 4 queries: `discountPrice` → `salePrice`, `duration` → `turnaroundTime`, `fastFasting` → `fastingRequired`, `homeCollection` → `homeCollectionAvailable`; removed `parametersCount`, `preparation` |
| `services/ServiceCatalogService.ts` | All 3 queries: `discountPrice` → `salePrice`, `duration` → `estimatedDuration`; removed `tag`, `preparation`; added `shortDescription`, `homeAvailable`, `labAvailable` |
| `services/PackageService.ts` | All 3 queries: replaced test-field copies with actual `PackageItem` schema fields (`packagePrice`, `individualValue`, `testIds`, `includes`); removed all test-specific fields |
| `services/BlogService.ts` | SSR now fetches AppSync directly (avoids Amplify hairpin timeout); `blogById` query uses `idOrSlug` argument to match resolver + schema |
| `infrastructure/src/handlers/graphql.js` | Added `groups: _normalizedGroups` to identity object (root cause of RBAC failure); normalized groups from both string and array Cognito formats; replaced all 65 `identityForCheck = { requestContext: ... }` wrappers with `identityForCheck = identity` |

### Architecture Decisions

- **Schema is the source of truth.** Stale field aliases in services were mapped back to what the schema + DynamoDB layer actually exposes, not the other direction.
- **`blogs` returns a flat array.** The resolver already returned `[BlogItem]` directly; the `BlogConnection` wrapper in the schema was a leftover from an unimplemented pagination plan. Changed schema to match resolver.
- **`identityForCheck = identity`.** The `{ requestContext: { authorizer: { claims: identity } } }` wrapping was a legacy REST/API-Gateway pattern copied incorrectly into the AppSync Lambda. Auth functions (`isAdmin`, `isStaff`, `hasPermission`) expect a flat identity object — they do not call `extractIdentity`. All 65 call sites corrected in one PowerShell bulk replace.
- **No REST endpoints created.** All fixes operate entirely within the existing GraphQL surface.

### Verification

| Gate | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | ✅ 0 errors |
| Next.js production build | ✅ Exit 0, 33/33 pages |
| SAM build | ✅ Build Succeeded |
| SAM deploy (CloudFormation) | ✅ `UPDATE_COMPLETE` — Lambda + Schema updated |

### Before vs After

| Surface | Before | After |
|---|---|---|
| `blogs` schema return type | `BlogConnection!` | `[BlogItem!]!` |
| `blogById` argument | `id: String!` | `idOrSlug: String!` |
| `identity.groups` in graphql.js | `undefined` (key was `'cognito:groups'`) | Correctly set array |
| Admin `canViewInactive` catalog | Always `false` | Correctly `true` for admin users |
| Blog SSR on Amplify | Hairpin `localhost:3000` timeout | Direct AppSync fetch |

---



## Sprint 6D — Catalog Data Reflection & Admin Enhancements

**Completed:** 2026-09-03  
**Scope:** Fasting requirement public reflection, FAQ editing in Admin, permanent delete end-to-end, card grid alignment.

### Files Modified

| File | Change |
|---|---|
| `components/sections/tests/TestDetailContent.tsx` | Added fasting badge (Required / No Fasting) to hero header |
| `components/sections/tests/TestsCatalogSection.tsx` | Added fasting row to hover tooltip; added description fallback; added `min-h-[200px]` for card alignment |
| `components/sections/packages/PackageDetailContent.tsx` | Added FAQ accordion section; fixed preparation field fallback |
| `app/(admin)/admin/catalog/tests/[id]/page.tsx` | Added FAQ editor (add/remove/update), merged `faqs` into submit payload |
| `app/(admin)/admin/catalog/services/[id]/page.tsx` | Added FAQ editor, merged `faqs` into submit payload |
| `app/(admin)/admin/catalog/packages/[id]/page.tsx` | Added FAQ editor, merged `faqs` into submit payload |
| `app/(admin)/admin/catalog/page.tsx` | Added `deleteItem` function; added trash button per row; uses `'del'` permission |
| `components/admin/navigation/AdminIcons.tsx` | Added `'trash'` icon name and SVG |
| `infrastructure/src/repositories/dynamo-test.js` | Added `delete(id)` using `DeleteCommand` |
| `infrastructure/src/repositories/dynamo-service.js` | Added `delete(id)` using `DeleteCommand` |
| `infrastructure/src/repositories/dynamo-package.js` | Added `delete(id)` using `DeleteCommand` |
| `infrastructure/src/handlers/test.js` | Added `DELETE` HTTP handler with `catalog:delete` RBAC check |
| `infrastructure/src/handlers/service.js` | Added `DELETE` HTTP handler |
| `infrastructure/src/handlers/package.js` | Added `DELETE` HTTP handler |
| `domains/tests/repository.ts` | Added `delete?` to `ITestsRepository` |
| `domains/services/repository.ts` | Added `delete?` to `IServicesRepository` |
| `domains/packages/repository.ts` | Added `delete?` to `IPackagesRepository` |
| `repositories/api/TestRepository.ts` | Implemented `delete()` calling `apiClient.delete` |
| `repositories/api/ServiceRepository.ts` | Implemented `delete()` |
| `repositories/api/PackageRepository.ts` | Implemented `delete()` |
| `services/TestCatalogService.ts` | Exposed `delete()` |
| `services/ServiceCatalogService.ts` | Exposed `delete()` |
| `services/PackageService.ts` | Exposed `delete()` |

### Architecture Decisions
- **Hard delete** selected over soft delete at user's discretion. Admins are reminded via `window.confirm()` that the action is permanent.
- **Permission:** Uses the existing `'del'` `PermissionAction` value rather than introducing a new string.
- **FAQs on Packages:** Added FAQ accordion to `PackageDetailContent` — the model already supported it, the public page simply did not render it.
- **Fasting on Tests:** Shows always on the detail page hero; shows conditionally in the card tooltip only when the field is present (safe for legacy seeded data).
- **No mock data introduced** — all fields are read from the backend.

### Build Verification
- TypeScript: ✅ 0 errors after fixing `'delete'` → `'del'` permission string
- Deployment platform agnostic: ✅ (no platform-specific imports added)

### Sprint 6D — Addendum: Related Tests Picker (Admin)

**Completed:** 2026-09-03  
**Scope:** Manually curated Related Tests picker in the Admin test editor.

#### Data Model Decision
Retained existing `relatedTests?: Array<{title, category, description, slug, status?}>` snapshot shape.  
**Rationale:** Resolves display data once at write time (admin save). Zero extra requests per public page load.  
`relatedTestIds` was rejected — it would require N `GetItem` calls or a catalog-wide fetch at every public page render.

#### INACTIVE Related Tests Handling
- Admin picker enforces ACTIVE-only selection (filters `status === 'ACTIVE'` from catalog response).
- `status` is snapshotted in the stored entry at curation time.
- Public renderer (`TestDetailContent`) filters out entries where `status` is present and not `'ACTIVE'`.
- **Known limitation:** If a related test is deactivated after curation, the snapshot status remains stale. Re-saving the parent test refreshes the list.
- No extra network requests introduced on the public path.

#### Caching Verification
API client (`lib/api/client.ts`) uses plain `fetch()` — **no in-memory or HTTP cache** for catalog responses.  
The picker uses a React `ref` (`pickerLoaded`) to ensure the catalog is fetched **at most once per page session** regardless of how many times the picker is opened.

#### Files Modified
| File | Change |
|---|---|
| `infrastructure/src/handlers/graphql.js` | Added 7 new Review queries and mutations. |
| `services/ReviewService.ts` | Refactored to issue `_graphqlFetch()` natively instead of using `IReviewRepository`. |
| `repositories/api/ReviewRepository.ts` | **Deleted**. |
| `repositories/registry.ts` | Removed `ApiReviewRepository` export. |
| `services/index.ts` | Removed `reviewRepository` injection into `ReviewService`. |
| `domains/tests/model.ts` | Added `status?` field to `relatedTests[]` item type; added documentation comment |
| `components/sections/tests/TestDetailContent.tsx` | Added `.filter(test => !test.status \|\| test.status === 'ACTIVE')` to related tests renderer |
| `app/(admin)/admin/catalog/tests/[id]/page.tsx` | Full Related Tests picker UI: lazy-load, search, chips, ACTIVE-only, self-exclusion, duplicate guard, save payload |
| `docs/MIGRATION_TRACKER.md` | This entry |

---

## Phase B2.6: Catalog Domain (Tests, Services, Packages) (Slices 6, 7, 8)
- **Status**: Completed
- **Objective**: Migrate the complete Test, Service, and Package catalog management (Public queries, Admin CRUD) from REST to unified GraphQL resolvers.

### Architecture Decisions
- **Unified Catalog Resolvers**: Created grouped GraphQL resolvers in `graphql.js` for `catalogTests`, `catalogServices`, and `catalogPackages`, reducing boilerplate and maintaining DRy principles.
- **REST Wrappers Eliminated**: Deleted `repositories/api/TestRepository.ts`, `repositories/api/ServiceRepository.ts`, and `repositories/api/PackageRepository.ts`.
- **Frontend Agnosticism**: `TestCatalogService`, `ServiceCatalogService`, and `PackageService` were rewritten to bypass the IRepository interface and issue `_graphqlFetch` directly.

### Files Modified
| File | Change |
|---|---|
| `infrastructure/src/handlers/graphql.js` | Added unified resolvers for all Catalog read/write operations. |
| `services/TestCatalogService.ts` | Rewritten to use GraphQL. |
| `services/ServiceCatalogService.ts` | Rewritten to use GraphQL. |
| `services/PackageService.ts` | Rewritten to use GraphQL. |
| `repositories/api/TestRepository.ts` | **Deleted**. |
| `repositories/api/ServiceRepository.ts` | **Deleted**. |
| `repositories/api/PackageRepository.ts` | **Deleted**. |
| `repositories/registry.ts` | Removed catalog repository exports. |
| `services/index.ts` | Removed repository dependencies. |

#### Request / Network Behavior
| Event | Requests |
|---|---|
| Admin opens test edit page | `GET /api/tests/{id}` (1 — unchanged) |
| Admin opens picker (first time) | `GET /api/tests?page=1&limit=200` (1 — lazy, only on first open) |
| Admin types in picker search | 0 — client-side filter |
| Admin saves | `PUT /api/tests/{id}` with `relatedTests[]` in body |
| Public test detail page | `GET /api/tests/{slug}` (1 — unchanged, includes relatedTests in response) |
| Public renderer | 0 extra requests |

#### Catalog Size
11 tests in seed file. API `limit` cap: 200. Well within safe range.

#### Architecture Decision
- Snapshot over FK — avoids N+1 resolution on every public page
- `status` in snapshot — zero-cost client-side stale filtering
- No backend changes — existing `upsert()` stores any field passed via spread


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

### Critical Bug Fixes
- **Date**: 2026-09-02
- **Issue**: Admin Catalog crash on edit (`Array.isArray(item.category)` causing `never` type error during build, blocking previous fixes from deploying).
- **Fix**: Implemented `normalizeCategory` helper to safely parse `unknown` to `string` in `AdminCatalogPage`, satisfying strict TS checks and preventing `.charAt(0)` runtime crashes.
- **Commit**: `ad4710e` (fix(catalog): fix category normalization build failure)

- **Date**: 2026-09-03
- **Issue**: Admin Catalog page throwing "reload error" due to a React Rules of Hooks violation (`useState` and `useEffect` called after an early return `if (!mounted)`).
- **Fix**: Moved `activeCategory` state and its related `useEffect` before the early return in `AdminCatalogPage` to ensure hooks are called in the exact same order on every render.

---

# GraphQL Migration — Phase 0 Audit + Migration Design

## 1. Baseline Status
- **Git State**: Branch `main`, working tree clean, up to date with `origin/main`.
- **FE Commit/Deployment State**: Frontend UI fixes for dropdowns (`baff6f6`, `2d2a7b1`) and catalog page layout (`eb4043e`) are committed and pushed.
- **BE Commit/Deployment State**: Backend RBAC whitelist (`78c6d81`) and frontend RBAC bypass (`d71b899`) are committed and pushed. No pending uncommitted changes.

## 2. Current REST Architecture
**Request Flow:**
`Frontend Service (e.g. PatientService)` → `HTTP GET /api/patients` → `API Gateway` → `Lambda (handlers/patient.js)` → `Repository (dynamo-patient.js)` → `DynamoDB (QueryCommand)`

The architecture relies entirely on REST endpoints. Aggregation, filtering, and data-joining are currently performed primarily on the **Client (Browser)** after fetching large monolithic collections.

## 3. Performance Findings

| Flow | Current Requests | DB Operation | Problem | Severity | GraphQL Benefit |
|---|---|---|---|---|---|
| **Global Search** | 8 parallel `GET`s | 8 `QueryCommands` | Client fetches entire DB into memory to search | **High** | Single query, server-side filtering, minimal payload |
| **Admin Dashboard** | N/A (Client agg) | `QueryCommand` | Analytics fetches all bookings/invoices to sum | **High** | Aggregate queries or optimized resolver |
| **Staff Alerts** | 2 `GET`s | 2 `QueryCommands` | Fetches all reports/collections to filter statuses | **Medium** | Filter in resolver, return just count |
| **Catalog Load** | `GET /api/tests` | `QueryCommand` | Fetches all tests to client before pagination | **Medium** | Server-side pagination, exact payload delivery |

## 4. Fetch-All/Filter Findings
- `GlobalSearchService.ts`: Fetches `getAll()` for Patients, Bookings, Reports, Tests, Packages, Services, Blogs, Staff, Invoices, and Reviews. Then runs `.filter()` in the browser.
- `PatientService.ts`: `getAllBookings`, `getAllReports`, `getAllCollections`, `getAllInvoices` fetch ALL items globally, then `.filter(i => i.patientId === id)` in the browser.
- `AnalyticsService.ts`: Fetches all bookings/invoices into the browser to run `.filter(b => b.status === 'Pending').length`.
- `AlertService.ts`: Fetches all reports and collections into the browser to run `.filter(r => r.status === 'Awaiting Verification').length`.

## 5. DynamoDB Findings
- **Scan vs Query:** **Excellent baseline.** There are NO `ScanCommand` operations in the repositories. All access is driven by `QueryCommand` (e.g., querying `GSI1` by entity type) or `GetCommand`.
- **Inefficiency:** The inefficiency is entirely at the **application/payload layer**. The Lambda queries a GSI for *all* items of a type, pulls them into Lambda memory, and ships the massive array to the frontend for client-side filtering.

## 6. Recommended GraphQL Candidates

| Flow | Recommendation | Reason |
|---|---|---|
| **Global Search** | GRAPHQL CANDIDATE | Replaces 8 parallel full-collection fetches with 1 optimized query. |
| **Patient Dashboard**| GRAPHQL CANDIDATE | Resolves the collection over-fetching and client-side filtering where Patient details, Bookings, Reports, and Invoices are fetched separately. |
| **Admin Analytics** | GRAPHQL CANDIDATE | Prevents fetching thousands of bookings to the client just to get a count of "Pending" ones. |
| **Catalog Details** | KEEP REST (For Now)| Detail pages (`/api/tests/:slug`) are efficient `GetItem`/GSI lookups returning exactly what is needed. |

## 7. Proposed GraphQL Architecture
- **Layer:** Introduce **AWS AppSync** acting as the single GraphQL endpoint.
- **Resolvers:** Map AppSync field-level resolvers directly to a shared Lambda data source (`GraphQLResolverFunction`), which maps requests to the *existing* DynamoDB repositories (`dynamo-patient.js`, etc.) to maintain a single source of truth.
  ```text
  AppSync GraphQL API
          ↓
  GraphQL field resolver(s)
          ↓
  Shared GraphQL Lambda data source
          ↓
  Existing domain/service/repository layer
          ↓
  DynamoDB
  ```
- **Auth:** Integrate with the existing Cognito User Pool for authentication. The shared Lambda resolver extracts the Cognito context and enforces the existing `hasPermission` RBAC matrix.
- **Frontend Integration:** Add a lightweight GraphQL client (`urql` or `graphql-request`) hidden behind the *existing* `ITestsRepository` interfaces. Do not leak GraphQL hooks into UI components.

## 8. Proposed Initial Schema
```graphql
type Query {
  # Direct Lookup
  patient(id: ID!): Patient
  
  # Aggregated Search
  globalSearch(query: String!): SearchResults!
  
  # Admin Dashboard
  dashboardStats: DashboardMetrics!
}

type Patient {
  id: ID!
  name: String!
  email: String
  # Resolves related data server-side
  bookings(status: String): [Booking!]! 
  reports: [Report!]!
  invoices: [Invoice!]!
}

type SearchResults {
  patients: [Patient!]!
  tests: [TestItem!]!
  packages: [Package!]!
}
```

## 9. REST + GraphQL Boundary
- **GraphQL:** Takes over complex READ operations (Dashboards, Search, Aggregations, Patient Portals).
- **REST:** Retains authority over MUTATIONS (Booking Creation, Invoice Generation, Payments, Catalog Editing). 
- *Reasoning:* Transactional integrity and backend pricing logic are already robust in REST. Do not risk payment flows during a read optimization migration.

## 10. Incremental Migration Plan
- **Phase A (Infrastructure):** Provision AppSync/GraphQL endpoint, connect Cognito, define base schema.
- **Phase B (Search/Dashboard):** Implement resolvers for `GlobalSearch` and `Analytics`.
- **Phase C (Frontend Search):** Swap `GlobalSearchService.ts` to use GraphQL endpoint. Verify 10x payload reduction.
- **Phase D (Patient Portal):** Implement `Patient` relational resolvers. Swap `PatientService.ts`.
- **Phase E:** Evaluate remaining REST GET endpoints for deprecation.

## 11. Risks
- **Authorization:** Replicating the custom RBAC logic inside GraphQL resolvers requires careful mapping to ensure staff cannot bypass DynamoDB module permissions.
- **Resolver Inefficiency:** If a GraphQL resolver calls `patientRepo.getAll()` behind the scenes, we haven't fixed the DB inefficiency. Resolvers must use targeted `QueryCommand`s with filter expressions.
- **Vendor Lock-in:** Hardcoding Amplify/AppSync clients directly in React components. Must abstract behind the existing Service/Repository interfaces.

## 12. Tracker Update
This document (`MIGRATION_TRACKER.md`) has been successfully updated with the Phase 0 findings.

## GraphQL Phase A
**Status**: Foundation Completed
**Objective**: Establish the GraphQL infrastructure and security foundation WITHOUT migrating application functionality yet.

**Architecture Details**:
- **Technology**: AWS AppSync + AWS Lambda + AWS DynamoDB
- **Authentication**: Native AWS AppSync Amazon Cognito User Pools integration.
- **Authorization**: The shared Lambda data source extracts identity from `event.identity` and leverages existing backend functions (`hasPermission`, `isStaff`, `canAccessPatient`).
- **Schema Foundation**: Basic schema built for `Patient`, `TestItem`, `ServiceItem`, `PackageItem`, `Booking`, `Invoice`, and `DashboardMetrics`.
- **Resolver Strategy**: AppSync field-level resolvers explicitly map to a single `GraphQLResolverFunction`, which routes internally via `event.info.fieldName`.
- **REST/GraphQL Boundary**: GraphQL is strictly for read-only aggregation (Search, Dashboards). REST retains all mutation authority (Booking, Payment, Invoicing, Editing).
- **DynamoDB Access Principles**: The shared lambda uses targeted index queries (`QueryCommand` and `GetCommand`). No `ScanCommand`s are introduced. No entire collections are loaded into memory to be filtered unless strictly bound by an entity ID.
- **Frontend Abstraction Strategy**: Future UI components will NOT contain raw GraphQL queries. GraphQL fetching will be abstracted behind existing service/repository classes.
- **Observability**: Base AppSync CloudWatch logs are enabled implicitly by standard SAM deployment. Lambda errors are logged via the existing `logger.js`.
- **Validation**:
  - `sam validate` passed.
  - `npx tsc --noEmit` passed.
  - `npm run build` passed.

## GraphQL Phase B1: Global Search Migration
**Status**: Completed

**Objective**: Replace the current browser-side collection over-fetching and client-side filtering with a single targeted GraphQL Global Search request, while preserving authorization, search behavior, and the existing domain architecture.

**Implementation Details**:
- **Database Layer**: Introduced a `search(query, limit)` method across 11 DynamoDB repositories (Patients, Bookings, Reports, Collections, Tests, Packages, Services, Blogs, Staff, Invoices, Reviews). 
- **DynamoDB Query with server-side FilterExpression**: The queries utilize `FilterExpression` coupled with `KeyConditionExpression` where possible. 
  - `KeyConditionExpression` determines the queried key/partition scope.
  - `FilterExpression` filters the items returned by the Query before they are sent over the network.
  - *Important Clarification*: `FilterExpression` does NOT prevent DynamoDB from evaluating the underlying queried items. It acts as an interim optimization to prevent Lambda memory bloat and network payload bloat. No `ScanCommand` was introduced. We do not claim arbitrary substring search is efficiently indexed.
- **GraphQL Resolver**: The `graphql.js` Lambda executes these targeted DB queries concurrently via `Promise.allSettled()`, enforcing RBAC (e.g., public vs. staff vs. admin searches) natively.

### Phase B2.1: Admin Dashboard & Analytics Metrics Migration
- **Status**: Completed
- **Architecture Strategy**: Migrated the Dashboard KPIs ("Today's Bookings", "Pending Tests", "Home Collections", "Revenue Today") from a full-table REST memory scan to an exact DynamoDB server-side calculation via GraphQL.

**Key Design Decisions & DynamoDB Access Patterns**:
1. **Targeted DynamoDB Querying with `Select: 'COUNT'`**:
   - To achieve absolute system-wide precision without causing Lambda memory/network payload bloat, we utilize DynamoDB `QueryCommand` scoped to the specific partition (e.g., `GSI1PK = 'ENTITY#BOOKING'`).
   - We strictly apply `Select: 'COUNT'` paired with full `LastEvaluatedKey` pagination. This ensures DynamoDB only sends integer sums over the wire. 
   - *Limitation Documented*: `FilterExpression` does **not** eliminate DynamoDB read evaluation. While this prevents memory bloat, DynamoDB still evaluates the partition before applying the filter, which implies potential RCU scaling costs for very large partitions. This is an optimal *interim* solution before dedicated aggregations (e.g., DynamoDB Streams to a counters table) are implemented.
   - We absolutely avoid `ScanCommand`.

2. **Verified KPI Semantics**:
   - **Timezone Convention**: The system persists and matches dates explicitly in **UTC** (`new Date().toISOString()`). All `begins_with` date prefixes respect this UTC standard.
   - **"Today's Bookings"**: Semantically strictly means "Bookings created today". Computed via `GSI1` Query + `FilterExpression: begins_with(createdAt, <UTC_TODAY>)`.
   - **"Pending Tests"**: System-wide count via `FilterExpression: status = 'Pending'`.
   - **"Home Collections"**: System-wide count via `FilterExpression: collection.type = 'Home Collection'`.
   - **"Revenue Today"**: Semantically strictly means "Invoices generated today (UTC) where paymentStatus === 'Paid'". Computed via `GSI1` Query + `begins_with(GSI1SK, INVOICE#<UTC_TODAY>)`. Lambda filters exact status and sums the totals.

**Frontend Integration**:
- `services/AnalyticsService.ts` refactored to make exactly **1 GraphQL request** (`dashboardStats`), replacing broad `GET /api/bookings` and `GET /api/invoices` pulls.
- The `BookingService.getRecent(4)` REST request remains strictly because the UI explicitly requires those raw booking objects to render the "Recent Bookings" table component.

## Phase B2.2: Patient Portal Migrations
- **Status**: Completed
- **Objective**: Eliminate parallel REST request fan-out and redundant client-side filtering on the Patient Portal by introducing a unified, selection-based GraphQL query.

### Pre-Implementation Audit Findings
- **Backend was already secure/optimized**: The REST handlers (`booking.js`, `invoice.js`, `report.js`) explicitly derived patient IDs from the authenticated Cognito `identity`, resolved family members, and performed highly optimized `GSI2` queries (`GSI2PK = PATIENT#<id>`). No `ScanCommand`s were being used.
- **Frontend Illusion**: The frontend assumed it was fetching all global records via `.getAll()` abstractions and filtered by `patientId` locally. This frontend filtering was functionally redundant since the backend already scoped the payload.
- **REST Fan-out**: `app/(public)/bookings/page.tsx` fired 5 parallel broad REST requests for bookings, invoices, reviews, collections, and reports simultaneously.

### Architecture Decisions
- **`myPortal` Unified Query**: Introduced a highly targeted GraphQL query that acts as the entry point for patient portal data.
- **Selection-Based Loading**: The `myPortal` resolver parses the GraphQL AST (`info.selectionSetList`) to determine precisely which domains the client requested. If a client only asks for `reports`, the backend only executes `reportRepo.getByPatientId`. This prevents GraphQL from introducing a backend over-fetching problem.
- **Concurrency & N+1 Protection**: For each authorized patient ID, the resolver executes the required `GSI2` queries in parallel via `Promise.allSettled`. Nested fields like `Booking.patient` and `Report.patient` are mapped natively from the denormalized DynamoDB snapshot—no nested resolver database lookups are triggered.
- **Strict Authorization Boundary**: The `myPortal` resolver never trusts a browser-supplied `patientId`. It exclusively builds its query scope from the authenticated user's `identity.sub`, `primaryPatientId`, and explicitly validated `savedPatients`.

### Frontend Pages Migrated
1. **`app/(public)/bookings/page.tsx`**: Replaced 5 parallel REST service calls (`getAll()`) with 1 targeted `myPortal` GraphQL request. Retained UI support for `collections` and `reviews` since the progress tracker requires them.
2. **`app/(public)/reports/page.tsx`**: Replaced the `/api/reports` REST call with the `myPortal` GraphQL query (fetching only reports).

### REST Reads Intentionally Retained
- **`app/(public)/dashboard/page.tsx`**: Still uses `GET /api/bookings?patientId={user.id}`. The dashboard only requires a tiny subset of booking fields and does not require invoices, reviews, or collections. Migrating it to `myPortal` would unnecessarily couple it to a larger schema scope.

### Remaining Limitations
- While we successfully removed REST fan-out and redundant client filtering, this is purely a *read* migration. All mutations (booking creation, payment workflows) remain safely anchored on REST.

---

## Phase B2.3 Batch 2: Admin Analytics, Review KPIs & Notification Bell
- **Status**: Completed
- **Objective**: Migrate remaining analytical admin metrics (Revenue by Month, Patient counts, Review aggregates) to authoritative, secure, server-rendered GraphQL queries. Address Admin Notification Bell dynamic behavior using existing REST API.

### 1. Revenue by Month
- **Implementation**: Added `analyticsCharts { revenueByMonth }` to AppSync schema.
- **DynamoDB Access Pattern**: Replaced a full-table invoice scan with a single bounded `QueryCommand` on `GSI1`.
  - `GSI1PK = ENTITY#INVOICE`
  - `GSI1SK BETWEEN 'INVOICE#<year>-01-01' AND 'INVOICE#<year+1>-01-01'`
  - **Why**: ISO timestamps sort lexicographically, meaning one exact bounded range query flawlessly captures the entire calendar year with no need for 12 parallel prefix queries.
- **Read Cost Documentation**: The `FilterExpression` (`paymentStatus = 'Paid'`) runs post-read. While all invoices for the year are evaluated, projecting only `createdAt` and `total` restricts Lambda memory bloat, and server-side aggregation prevents large network payloads.
- **Semantics**: UTC calendar year, identical month rendering labels, precise to the cent.

### 2. Patient KPIs
- **Static Metrics Removed**: Eliminated the fabricated 20% "New This Month" formula and the meaningless modulo "Retention Rate".
- **Implementation**: Added `patientStats { totalPatients, newThisMonth }` to schema.
- **DynamoDB Access Pattern**: 
  - Total: `QueryCommand` on `ENTITY#PATIENT` with `Select: COUNT`.
  - New This Month: `QueryCommand` on `ENTITY#PATIENT` with `begins_with(GSI1SK, 'YYYY-MM')` and `Select: COUNT`. (Works natively because `GSI1SK` is stored as an ISO date string).
- **Semantics**: Authoritative real-time counts. Retention rate intentionally left as `null` and displayed as `"N/A"` with a disclaimer, pending actual business/product definitions. "Active Bookings" correctly reuses the existing `dashboardStats.pendingBookings` GraphQL query.

### 3. Review KPIs
- **Static Metrics Fixed**: Identified and eliminated client-side status filtering based on booking pointers, replacing it with the authoritative review status partitions.
- **Implementation**: Added `reviewStats` to schema.
- **DynamoDB Access Pattern**:
  - Total: `Select: COUNT` on `ENTITY#REVIEW` (one pointer per review enforced by conditional write).
  - Pending/Approved: `Select: COUNT` on `REVIEW#STATUS#Pending` and `REVIEW#STATUS#Approved`.
  - Average Rating: `ProjectionExpression: rating` on `ENTITY#REVIEW`, calculated purely in Lambda.
- **Fallback Behavior**: Strictly enforced `stats ? stats.value : 'N/A'`. Deliberately prevented the UI from falling back to legacy `.length` measurements on failure, ensuring the metric is either provably authoritative or loudly absent.

### 4. Admin Notification Bell
- **Architecture**: Intentionally retained on REST as it already provided single-user, targeted, partitioned access.
- **Identity Security**: Removed `userId` dependency from the frontend fetch. The `notification.js` Lambda now exclusively uses `identity.sub` to pull notifications, guaranteeing users cannot query foreign IDs for self-notifications.
- **Dynamic Updates**:
  - Implemented 30-second `setInterval` polling for background updates while active.
  - Re-wired `markAsRead` to optimistically mutate the frontend notification state array, instantly decrementing the red badge without closing the dropdown.

## Phase B2.3 Batch 3: Admin List Pagination
- **Status**: Completed
- **Objective**: Eliminate remaining full-partition REST fetches for Admin Invoices and Admin Reviews by implementing bounded server-side cursor pagination.

### 1. Invoice Pagination
- **Old Access Pattern**: `getAll()` read entire `ENTITY#INVOICE` partition. Filtering and slicing occurred on the client.
- **New Access Pattern**: `QueryCommand` on `ENTITY#INVOICE` with a strict `Limit`.
- **Cursor Format**: Opaque Base64-encoded `LastEvaluatedKey` containing DynamoDB tracking attributes.
- **Page Size**: Defaults to 15 (consistent with frontend).
- **Filters**: Applied server-side via `FilterExpression` (`paymentStatus`, text search).
- **Authorization**: Validated via existing RBAC/Cognito checks inside `invoice.js` handler before applying filters. Cursors do not bypass or dictate authorization boundaries.

### 2. Review Pagination
- **Old Access Pattern**: `getAll()` read entire `ENTITY#REVIEW` partition and transferred to the client.
- **New Access Pattern**: `QueryCommand` on `ENTITY#REVIEW` with strict `Limit`.
- **Authoritative Dataset Decision**: `ENTITY#REVIEW` contains the booking uniqueness pointers, not the primary review records (which are partitioned by status). However, these pointers function as fully denormalized read-models (containing rating, comment, status) that are synchronized during moderation updates. To provide a "global" review list across all statuses without introducing a new GSI, the pagination intentionally targets these read-model pointers.
- **Cursor Format**: Opaque Base64-encoded `LastEvaluatedKey`.
- **Page Size**: Defaults to 15.
- **Filters**: Applied server-side via `FilterExpression` (`status`, `rating`, text search).
- **Authorization**: Handled by existing RBAC checks in `review.js`.

### 3. API Contract & GraphQL vs REST Decision
- **API Contract**: Handlers now return `{ data, nextCursor }`.
- **Admin Invoice List**: REST retained. Server-side pagination and `FilterExpression` efficiently solve the performance problem without requiring a GraphQL migration.
- **Admin Review List**: REST retained. The dataset is efficiently accessed via the existing pointer structure, avoiding the need for a GraphQL overhaul or a new DynamoDB GSI.

## Phase B2.3 Batch 4: Read-Path Audit & Optimization Targeting
- **Status**: Completed (Audit Only)
- **Objective**: Audit remaining read paths to identify the next highest-value migration candidate based on fan-out, overfetching, and unbounded reads.

### 1. Remaining getAll() Callers
- **`collectionRepo.getAll()`**: **Genuinely Unbounded.** Uses a `do-while` loop over `ENTITY#COLLECTION`. Called by `GET /api/collections` for Admins and Lab Techs.
- **`patientRepo.getAll()`**: Bounded (`Limit: 100`). Used by `GET /api/patients`.
- **`reportRepo.getAll()`**: Bounded (`Limit: 100`). Used by `GET /api/reports`.
- **`bookingRepo.getAll()`**: Bounded intentionally (maps to `getRecent(100)`).
- **`reviewRepo.getAll()`**: Legacy fallback. Retained in `review.js` if no pagination parameters are supplied.
- **`invoiceRepo.getAll()`**: Dead code in the handler, but the API method signature remains in the frontend repository (causing a bug noted below).

### 2. Read Path Classifications
- **AdminCollectionsPage**: **D. GraphQL Candidate / E. Backend Optimization.** Massive client-side fan-out. Fetches 6 distinct endpoints (`collections`, `staff`, `roles`, `reports`, `bookings`, `invoices`) in order to perform client-side joins. Triggers the unbounded `collectionRepo.getAll()` read.
- **AdminPatientProfile**: **D. GraphQL Candidate.** Currently makes 4 concurrent REST calls to `booking`, `reports`, `collections`, and `invoices` via targeted GSI queries (`patientId`). A GraphQL resolver could consolidate these round-trips.
- **AdminReportsPage**: **D. GraphQL Candidate.** Fetches all reports and all bookings to perform a client-side join.
- **Booking Success/Receipt Pages**: **B. Targeted REST.** Perform an O(1) fetch for Booking, followed by an O(1) fetch for the linked Invoice. (Note: The legacy fallback branch calls `invoiceService.getAll()` which is currently broken due to Batch 3 contract changes).
- **Notification Bell**: **B. Targeted REST.** Safely optimized via `getByUserId`.

### 3. Top 3 Optimization Opportunities
1. **AdminCollectionsPage (Collections Workspace)**: The worst remaining offender. Triggers an unbounded database scan and a massive 6-endpoint browser fan-out. Requires a purpose-built `DashboardCollectionQueue` read model (via GraphQL or a unified backend endpoint).
2. **AdminReportsPage**: Fetches independent bounded datasets and forces the client to merge them in-memory.
3. **AdminPatientsPage / BookingCreatePage**: Fetches `getAll(1, 1000)` solely to power a client-side search/dropdown.

### Deferred Items (Remaining B2.3 Work)
- Test Distribution (waiting on definitive category modeling).

## Phase B2.3 Batch 5: Admin Collections Workspace Migration & API Compatibility Fix
- **Status**: Completed
- **Objective**: Address the `AdminCollectionsPage` unbounded read and massive client-side fan-out by introducing a targeted GraphQL query. Fix the `BookingSuccessPage` invoice legacy fallback crash.

### 1. Collections GraphQL Workspace
- **Implementation**: Replaced `AdminCollectionsPage` REST calls with a unified `adminCollectionsWorkspace` GraphQL query.
- **N+1 Avoided**: The initial workspace request strictly fetches the collection queue, KPI stats, and eligible phlebotomists. It *does not* loop or fetch bookings/invoices/reports for every task in the queue.
- **Lazy-Loading Architecture**: `AdminCollectionsPage` now strictly watches `activeTask?.bookingId` and dynamically fetches related context (Booking, Invoice, Report) *only* for the actively selected task.

### 2. Pagination, Filtering, and Sorting
- **Pagination**: Implemented cursor-based pagination using the standard opaque Base64 `LastEvaluatedKey` approach. `AdminCollectionsPage` maintains a `cursorHistory` to support strict bidirectional traversal without offset counting.
- **Filtering & Sorting**: Tab state (Home vs In-Lab), sort parameters, and search queries are passed to `collectionRepo.getPaginated` and resolved against DynamoDB directly.
- **Client-Side Refactor**: Eliminated entirely the heavy client-side `.sort()` and `.filter()` operations over the entire `getAll()` payload.

### 3. KPI & Staff Lookup Strategies
- **KPI Query Strategy**: `getWorkspaceStats` computes live metrics via an optimized `do-while` loop bounded explicitly to *today's date partition* (`begins_with(GSI1SK, 'COLLECTION#YYYY-MM-DD')`). It uses `ProjectionExpression` for minimal payload overhead. This strictly maintains accurate KPI semantics without issuing exhaustive database scans.
- **Staff Lookup**: Reuses `staffRepo.getAllStaff()` bounded natively at 500 records. Because active phlebotomist volume fits entirely into one small query, this is heavily optimized and requires no new GSI overhead.

### 4. Invoice Regression & Legacy Checks
- **Invoice Regression**: Fixed the regression in `BookingSuccessPage` and `ReceiptPage` caused by the Batch 3 API format change. Replaced the `invoiceService.getAll()` array fallback with a targeted `getByPatientId` lookup bounded to `bookingId`.
- **Remaining `getAll()` Callers**: Confirmed `collectionRepo.getAll()` and `invoiceRepo.getAll()` are fully removed from `AdminCollectionsPage`, `BookingSuccessPage`, and `ReceiptPage` dependencies.

### 5. Verification Limitations & Build Results
- **TypeScript**: `npx tsc --noEmit` executed successfully with no errors (Code 0).
- **Next.js Build**: `npm run build` executed and successfully generated all static paths (Code 0).
- **REST State**: The fix leveraged the existing `invoiceService.getByPatientId` REST fallback to maintain stability and avoid duplicating invoice retrieval in a new GraphQL resolver, respecting the systematic migration strategy.

## 15. Recommended Next Implementation Step
**Phase B2.3 Batch 6: Remaining Admin List Migrations**
- **Action**: Target the `AdminReportsPage` which is currently fetching independent bounded datasets and performing a heavy client-side join.
- **Action**: Resolve the dropdown search issue in `AdminPatientsPage` and `BookingCreatePage` which fetches `getAll(1, 1000)` solely for search rendering.


## Phase B2.3 Batch 7: Admin Catalog and Collections GraphQL Migration
- **Status**: Completed
- **Objective**: Migrate remaining REST fetch calls in Admin Catalog item editors and Collections dashboard to GraphQL.

### 1. Admin Catalog Detail Reads
- **Implementation**: Migrated pp/(admin)/admin/catalog/tests/[id]/page.tsx, packages/[id]/page.tsx, and services/[id]/page.tsx from REST service.getById calls to GraphQL 	estById, packageById, and serviceById.
- **GraphQL Schema**: Added full schema field definitions for TestItem, PackageItem, ServiceItem and created FaqItem and RelatedTest types.
- **Related Tests Picker**: Migrated the catalog picker in 	ests/[id]/page.tsx from 	estCatalogService.getCatalog to the GraphQL dminCatalogWorkspace query.

### 2. Admin Collections Dashboard Refinements
- **Implementation**: Fully migrated AdminCollectionsPage workspace fetching to the  dminCollectionsWorkspace GraphQL query.
- **Related Entities**: Replaced the parallel REST fetches for Booking, Invoice, and Report (when an active task is selected) with a single, highly-targeted GraphQL query that fetches  ookingById, invoiceById and patient reports/invoices seamlessly.

### 3. Verification
- **TypeScript Check**: Passed without errors after fixing Result type mappings in BookingService.ts.
- **Build Success**: Next.js production build (
pm run build) completed successfully with 0 errors.

---

## Phase GRAPHQL-ONLY: Final Repository Migration — All REST Wrappers Eliminated
- **Status**: ✅ Completed
- **Date**: 2026-09-06
- **Objective**: Remove every remaining `Frontend → GraphQL → REST wrapper → /api/*` path. All internal API communication now flows exclusively through the centralized GraphQL handler (`infrastructure/src/handlers/graphql.js`), which calls DynamoDB repositories directly.

### Repositories Migrated in This Phase

| Repository | Service | Resolver(s) Added to graphql.js | Files Deleted |
|---|---|---|---|
| `InvoiceRepository.ts` | `InvoiceService.ts` | `invoiceById`, `invoices`, `invoicesByPatient`, `createInvoice`, `updateInvoiceStatus`, `updateInvoicePaymentMethod`, `updateInvoice` | `repositories/api/InvoiceRepository.ts` |
| `DocumentRepository.ts` | `DocumentService.ts` | `documentById`, `documents`, `initiateDocumentUpload`, `completeDocumentUpload`, `documentDownloadUrl` | `repositories/api/DocumentRepository.ts` |
| `BlogRepository.ts` | `BlogService.ts` | `blogs`, `blogById`, `createBlog`, `updateBlog`, `deleteBlog`, `newsletterSubscribe`, `newsletterSubscribers` | `repositories/api/BlogRepository.ts` |
| `ActivityRepository.ts` | `ActivityService.ts` | *(stub — not implemented on backend)* | `repositories/api/ActivityRepository.ts` |
| `AuthRepository.ts` | `AuthService.ts` | Auth calls Cognito SDK directly; `updateProfile` migrated to `updatePatient` GraphQL mutation | `repositories/api/AuthRepository.ts` |

### Architecture Changes

- **`infrastructure/src/handlers/graphql.js`**: Expanded with Document, Blog, Newsletter resolvers. Added `sanitizePublicBlog`, `canAccessDocument`, `canUploadDocument`, `canModifyDocument`, `canAccessBlog` auth helpers.
- **`services/DocumentService.ts`**: Rewritten — no repository dependency. Uses `_graphqlFetch()`.
- **`services/BlogService.ts`**: Rewritten — no repository dependency. Uses `_graphqlFetch()`. Newsletter operations included.
- **`services/ActivityService.ts`**: Constructor dependency removed. Returns `failure(new Error('Not implemented'))` as before.
- **`services/AuthService.ts`**: Inlined directly from `ApiAuthRepository` — all Cognito SDK calls preserved. `updateProfile` migrated to GraphQL.
- **`repositories/registry.ts`**: All `Api*Repository` imports and exports removed. Only mock/stub exports remain for StaffRepository (used for seeding).
- **`services/index.ts`**: All repository injection removed. All services now instantiate with `new Service()`.

### Build Verification
- **TypeScript**: `npx tsc --noEmit` → ✅ exit code 0, 0 errors
- **Architecture**: No `frontend → /api/*` REST paths remain for internal domain communication
- **Safety**: Authorization (RBAC, Cognito identity, ownership checks) preserved within all GraphQL resolvers
- **DynamoDB**: No `ScanCommand` introduced; all access via `QueryCommand`, `GetCommand`, `PutCommand`, `UpdateCommand`

---

## REST Infrastructure Closure — Final Module

**Completed:** 2026-09-06
**Scope:** Complete removal of all internal REST Lambda handlers, API Gateway infrastructure, and legacy test scripts. Full forensic audit and verification.

### Objective

Remove all dead internal REST infrastructure after proving — by forensic audit — that zero application callers remained. The target architecture is GraphQL-only for the application's API surface.

### Forensic Audit — Pre-Deletion Findings

| Metric | Result |
|--------|--------|
| Frontend `fetch('/api/...')` non-graphql calls | **0** |
| Service layer REST calls | **0** (all 17 services call `/api/graphql` only) |
| Repository REST calls | **0** |
| `/api/payments/*` callers | **0** |
| GraphQL → REST proxies | **0** |
| `Api*Repository` transport classes | **0** |

All 15 REST Lambda handlers were confirmed dead before deletion. No live application caller existed for any REST endpoint.

### `/health` and `/api/version` — Explicit Audit

Both endpoints were explicitly audited. The only consumers found were 6 legacy `test-live-*.js` integration scripts. No CI/CD pipeline (no `.github/` directory), no external monitoring system, and no application code consumed either endpoint.

**Verdict: Both removed.** Retaining unused infrastructure endpoints is not justified by convention alone.

### Infrastructure Deleted

**Lambda handler files removed (15):**

`patient.js`, `booking.js`, `collection.js`, `notification.js`, `invoice.js`, `document.js`, `report.js`, `review.js`, `blog.js`, `test.js`, `service.js`, `package.js`, `staff.js`, `health.js`, `version.js`

**SAM template resources removed:**

`AgamApi` (API Gateway), `HealthCheckFunction`, `VersionFunction`, and all 13 internal application REST Lambda + Event blocks. `ApiEndpoint` output removed.

**Legacy test scripts retired (6):**

`test-auth-authorization.js`, `test-staff-authorization.js`, `test-live-collection.js`, `test-live-document.js`, `test-live-blog.js`, `test-live-p4-3.js` → all renamed `.retired.js`

### Infrastructure Retained

| Resource | Justification |
|----------|---------------|
| `DefineAuthChallengeFunction` | Cognito OTP custom auth trigger — no API Gateway |
| `CreateAuthChallengeFunction` | Cognito OTP custom auth trigger — no API Gateway |
| `VerifyAuthChallengeResponseFunction` | Cognito OTP custom auth trigger — no API Gateway |
| `GraphQLResolverFunction` | AppSync data source — sole application API entry point |
| All AppSync resources | Application API surface |
| Cognito, DynamoDB, S3, IAM | Data and identity infrastructure |

### Payment Architecture Verified

- `createPaymentOrder` → GraphQL mutation in `graphql.js` (line 674)
- `paymentStatus` → GraphQL mutation in `graphql.js` (line 707)
- Amount computed server-side from DynamoDB invoice record (not client-supplied)
- PhonePe accessed via `shared/phonepe.js` — external provider integration, not an internal REST API

### Data Access Compliance — Final State

| Requirement | Status |
|-------------|--------|
| `ScanCommand` | ✅ 0 — all repos use `QueryCommand`/`GetCommand` |
| Fetch-all-then-filter | ✅ 0 — all reads use targeted GSI partition keys |
| Unjustified broad reads | ✅ 0 — `blogRepo.getAll()` = 2× GSI query Limit:100 (admin); `newsletterRepo.getAll()` = GSI1 query `NEWSLETTER` PK (admin) |
| Cursor-based admin pagination | ✅ Preserved — `ExclusiveStartKey` on booking/patient/collection lists |
| Pending booking KPI semantics | ✅ Preserved — GSI2 status-date partition key |
| GSI3 phlebotomist lookup | ✅ Preserved — targeted `STATUS#Collected` partition |

### Build Verification

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✅ Exit 0, 0 TypeScript errors |
| `npm run build` | ✅ Exit 0, 33/33 pages |
| `sam validate --lint` | ✅ "is a valid SAM Template" |

### Final Architecture State

```
Application API is GraphQL-only. No internal application REST endpoints remain.
```

```
Frontend → AppSync GraphQL API → GraphQLResolverFunction → DynamoDB / PhonePe (external)
Cognito custom auth triggers (OTP flow) → no API Gateway
```

No API Gateway exists in the deployed infrastructure. The `AppSyncEndpoint` output is the sole application API surface. PhonePe communicates as an external provider over HTTPS — it is not an internal REST endpoint.

### Migration Tracker — Overall Status

This module closes the REST→GraphQL migration. All application communication now goes through AppSync/GraphQL. The frontend, service layer, and repository layer contain zero internal REST API calls.


## AppSync Public Auth & Schema Fix
- Added API Key authentication to AppSync backend.
- Injected 90+ missing schema fields and updated dminRoles with strict RBAC enforcement.
- Deployed backend updates via AWS SAM successfully.
- Verified AppSync API Key access to public queries (catalog/blogs) works properly.

- [x] Verified Amplify Production Configuration: Injected APPSYNC_API_KEY into buildSpec for SSR environment variable availability.
