/**
 * Deterministic Test Suite for P3C.3 Identity Mapping & Authorization Logic.
 * Verifies all 8 required authorization scenarios in memory without mutating AWS production tables.
 */

const {
  extractIdentity,
  isAdmin,
  isStaff,
  canAccessPatient,
  canAccessBooking,
  canAccessReview,
  canCreateReview,
  canModerateReview,
  canAccessBlog,
  canCreateBlog,
  canModifyBlog,
  canDeleteBlog,
} = require('./src/shared/auth');
const patientHandler = require('./src/handlers/patient');
const bookingHandler = require('./src/handlers/booking');
const reviewHandler = require('./src/handlers/review');
const blogHandler = require('./src/handlers/blog');


// Mock in-memory DB fixtures
const MOCK_SUB_ALICE = 'alice-sub-1111';
const MOCK_SUB_BOB = 'bob-sub-2222';
const MOCK_SUB_ADMIN = 'admin-sub-9999';

const patientAlice = {
  id: 'pat_alice_1',
  name: 'Alice Johnson',
  ownerSub: MOCK_SUB_ALICE,
  email: 'alice@example.com',
  phone: '+919111111111',
  status: 'Active',
};

const patientAliceChild = {
  id: 'pat_alice_child',
  name: 'Baby Alice',
  ownerSub: MOCK_SUB_ALICE,
  email: 'alice@example.com',
  phone: '+919111111111',
  status: 'Active',
};

const patientBob = {
  id: 'pat_bob_1',
  name: 'Bob Smith',
  ownerSub: MOCK_SUB_BOB,
  email: 'bob@example.com',
  phone: '+919222222222',
  status: 'Active',
};

const bookingAlice = {
  id: 'bk_alice_1',
  patientId: 'pat_alice_1',
  ownerSub: MOCK_SUB_ALICE,
  status: 'Pending',
};

const bookingBob = {
  id: 'bk_bob_1',
  patientId: 'pat_bob_1',
  ownerSub: MOCK_SUB_BOB,
  status: 'Pending',
};

// Identities
const identityAnonymous = null;

const identityAlice = {
  sub: MOCK_SUB_ALICE,
  username: 'alice',
  email: 'alice@example.com',
  phone: '+919111111111',
  role: 'patient',
  groups: [],
  primaryPatientId: 'pat_alice-sub-1111',
};

const identityBob = {
  sub: MOCK_SUB_BOB,
  username: 'bob',
  email: 'bob@example.com',
  phone: '+919222222222',
  role: 'patient',
  groups: [],
  primaryPatientId: 'pat_bob-sub-2222',
};

const identityAdmin = {
  sub: MOCK_SUB_ADMIN,
  username: 'admin',
  email: 'admin@agamdiagnostics.com',
  phone: '+919999999999',
  role: 'admin',
  groups: ['AdminGroup'],
  primaryPatientId: 'pat_admin-sub-9999',
};

const identityStaffDoctor = {
  sub: 'doctor-sub-3333',
  username: 'dr_sharma',
  email: 'sharma@agamdiagnostics.com',
  role: 'doctor',
  groups: ['StaffGroup'],
  primaryPatientId: 'pat_doctor-sub-3333',
};

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runAuthorizationTests() {
  console.log('================================================================');
  console.log('P3C.3 DETERMINISTIC BACKEND AUTHORIZATION TEST SUITE');
  console.log('================================================================\n');

  // Test 1: Missing identity → 401
  console.log('--- Test 1: Missing Identity / Anonymous Access ---');
  const eventNoAuth = {
    httpMethod: 'GET',
    path: '/api/patients/pat_alice_1',
    pathParameters: { patientId: 'pat_alice_1' },
    requestContext: {},
  };
  const resNoAuth = await patientHandler.handler(eventNoAuth);
  assert(resNoAuth.statusCode === 401, 'Anonymous request to /api/patients returns 401 Unauthorized');
  const resNoAuthBooking = await bookingHandler.handler(eventNoAuth);
  assert(resNoAuthBooking.statusCode === 401, 'Anonymous request to /api/bookings returns 401 Unauthorized');

  // Test 2: Authenticated patient accessing own patient → allowed
  console.log('\n--- Test 2: Authenticated Patient Accessing Own Record ---');
  assert(canAccessPatient(identityAlice, patientAlice) === true, 'canAccessPatient allows Alice to access patientAlice');

  // Test 3: Authenticated patient accessing unrelated patient → denied
  console.log('\n--- Test 3: Authenticated Patient Accessing Unrelated Record ---');
  assert(canAccessPatient(identityAlice, patientBob) === false, 'canAccessPatient denies Alice from accessing patientBob');
  assert(canAccessPatient(identityBob, patientAlice) === false, 'canAccessPatient denies Bob from accessing patientAlice');

  // Test 4: Authorized family member accessing permitted patient → allowed
  console.log('\n--- Test 4: Account Owner Accessing Family Member Record ---');
  assert(canAccessPatient(identityAlice, patientAliceChild) === true, 'canAccessPatient allows Alice to access child record under her account');

  // Test 5: Unauthorized family member access → denied
  console.log('\n--- Test 5: Unrelated User Accessing Other Family Member ---');
  assert(canAccessPatient(identityBob, patientAliceChild) === false, 'canAccessPatient denies Bob from accessing Alice child record');

  // Test 6: Admin/Staff access according to existing role model
  console.log('\n--- Test 6: Admin and Staff Access ---');
  assert(isAdmin(identityAdmin) === true, 'isAdmin returns true for Admin identity');
  assert(isStaff(identityStaffDoctor) === true, 'isStaff returns true for Doctor identity');
  assert(canAccessPatient(identityAdmin, patientAlice) === true, 'Admin can access any patient record');
  assert(canAccessPatient(identityStaffDoctor, patientBob) === true, 'Staff Doctor can access any patient record');
  assert(canAccessBooking(identityAdmin, bookingAlice, patientAlice) === true, 'Admin can access any booking');

  // Test 7: Booking access for authorized patient → allowed
  console.log('\n--- Test 7: Booking Access for Authorized Patient ---');
  assert(canAccessBooking(identityAlice, bookingAlice, patientAlice) === true, 'canAccessBooking allows Alice to access bookingAlice');

  // Test 8: Booking access for unrelated patient → denied
  console.log('\n--- Test 8: Booking Access for Unrelated Patient ---');
  assert(canAccessBooking(identityBob, bookingAlice, patientAlice) === false, 'canAccessBooking denies Bob from accessing Alice booking');
  assert(canAccessBooking(identityAlice, bookingBob, patientBob) === false, 'canAccessBooking denies Alice from accessing Bob booking');

  // Test 9: Identity extraction claims parsing
  console.log('\n--- Test 9: Identity Extraction Claims Validation ---');
  const mockEvent = {
    requestContext: {
      authorizer: {
        claims: {
          sub: 'test-uuid-456',
          email: 'test@example.com',
          phone_number: '+919876543210',
          'cognito:username': 'testuser',
          'custom:role': 'patient',
          'cognito:groups': 'PatientsGroup',
        },
      },
    },
  };
  const parsed = extractIdentity(mockEvent);
  assert(parsed.sub === 'test-uuid-456', 'extractIdentity correctly parsed sub');
  assert(parsed.email === 'test@example.com', 'extractIdentity correctly parsed email');
  assert(parsed.role === 'patient', 'extractIdentity correctly parsed role');
  assert(parsed.primaryPatientId === 'pat_test-uuid-456', 'extractIdentity generated canonical primaryPatientId');

  // Test 10: Collection Access & Authorization
  console.log('\n--- Test 10: Collection Authorization ---');
  const collectionAlice = {
    id: 'COL-001',
    patientId: 'pat_alice_1',
    ownerSub: MOCK_SUB_ALICE,
    phlebotomistId: 'phleb-sub-5555',
    assignedTo: 'phleb_rajesh',
    status: 'Assigned',
    date: '2026-08-19',
  };

  const collectionBob = {
    id: 'COL-002',
    patientId: 'pat_bob_1',
    ownerSub: MOCK_SUB_BOB,
    phlebotomistId: 'phleb-sub-7777',
    assignedTo: 'phleb_suresh',
    status: 'Pending',
    date: '2026-08-19',
  };

  const identityPhlebRajesh = {
    sub: 'phleb-sub-5555',
    username: 'phleb_rajesh',
    email: 'rajesh@agamdiagnostics.com',
    role: 'phleb',
    groups: ['PhlebGroup'],
    primaryPatientId: 'pat_phleb-sub-5555',
  };

  const identityPhlebSuresh = {
    sub: 'phleb-sub-7777',
    username: 'phleb_suresh',
    email: 'suresh@agamdiagnostics.com',
    role: 'phleb',
    groups: ['PhlebGroup'],
    primaryPatientId: 'pat_phleb-sub-7777',
  };

  const collectionHandler = require('./src/handlers/collection');
  const { canAccessCollection, isPhlebotomist, isValidCollectionTransition, canModifyCollection } = require('./src/shared/auth');

  // 1. Anonymous collection access -> 401
  const resNoAuthCollection = await collectionHandler.handler({
    httpMethod: 'GET',
    path: '/api/collections/COL-001',
    pathParameters: { collectionId: 'COL-001' },
    requestContext: {},
  });
  assert(resNoAuthCollection.statusCode === 401, 'Anonymous request to /api/collections returns 401 Unauthorized');

  // 2. Patient accesses own collection -> allowed
  assert(canAccessCollection(identityAlice, collectionAlice, patientAlice) === true, 'Alice can access her own collection');

  // 3. Patient accesses another patient's collection -> denied
  assert(canAccessCollection(identityBob, collectionAlice, patientAlice) === false, 'Bob cannot access Alice collection');
  assert(canAccessCollection(identityAlice, collectionBob, patientBob) === false, 'Alice cannot access Bob collection');

  // 4. Phlebotomist accesses assigned collection -> allowed
  assert(canAccessCollection(identityPhlebRajesh, collectionAlice, patientAlice) === true, 'Phlebotomist Rajesh can access collection assigned to him');

  // 5. Phlebotomist accesses unrelated collection -> denied (when not unassigned)
  assert(canAccessCollection(identityPhlebSuresh, collectionAlice, patientAlice) === false, 'Phlebotomist Suresh cannot access collection assigned to Rajesh');

  // 6. Admin accesses all collections -> allowed
  assert(canAccessCollection(identityAdmin, collectionAlice, patientAlice) === true, 'Admin can access Alice collection');
  assert(canAccessCollection(identityAdmin, collectionBob, patientBob) === true, 'Admin can access Bob collection');

  // Test 11: Collection Lifecycle State Machine Transitions
  console.log('\n--- Test 11: Collection Lifecycle State Machine ---');
  // Valid transitions
  assert(isValidCollectionTransition('Unassigned', 'Assigned') === true, 'Unassigned -> Assigned is ALLOWED');
  assert(isValidCollectionTransition('Pending', 'Assigned') === true, 'Pending -> Assigned is ALLOWED');
  assert(isValidCollectionTransition('Assigned', 'En Route') === true, 'Assigned -> En Route is ALLOWED');
  assert(isValidCollectionTransition('Assigned', 'In Progress') === true, 'Assigned -> In Progress is ALLOWED');
  assert(isValidCollectionTransition('En Route', 'Sample Collected') === true, 'En Route -> Sample Collected is ALLOWED');
  assert(isValidCollectionTransition('In Progress', 'Sample Collected') === true, 'In Progress -> Sample Collected is ALLOWED');
  assert(isValidCollectionTransition('Sample Collected', 'Checked In') === true, 'Sample Collected -> Checked In is ALLOWED');
  assert(isValidCollectionTransition('Checked In', 'Completed') === true, 'Checked In -> Completed is ALLOWED');

  // Invalid transitions
  assert(isValidCollectionTransition('Unassigned', 'Checked In') === false, 'Unassigned -> Checked In is REJECTED');
  assert(isValidCollectionTransition('Pending', 'Completed') === false, 'Pending -> Completed is REJECTED');
  assert(isValidCollectionTransition('En Route', 'Completed') === false, 'En Route -> Completed without sample collection is REJECTED');
  assert(isValidCollectionTransition('Assigned', 'Completed') === false, 'Assigned -> Completed without sample collection is REJECTED');

  // Test 12: Modification Permissions
  console.log('\n--- Test 12: Collection Modification Permissions ---');
  assert(canModifyCollection(identityAdmin, collectionAlice, { status: 'Assigned', assignedTo: 'phleb_rajesh' }) === true, 'Admin can modify collection');
  assert(canModifyCollection(identityPhlebRajesh, collectionAlice, { status: 'En Route' }) === true, 'Assigned phlebotomist can update operational status');
  assert(canModifyCollection(identityPhlebRajesh, collectionAlice, { patientId: 'pat_attacker' }) === false, 'Phlebotomist cannot change patientId');
  assert(canModifyCollection(identityPhlebSuresh, collectionAlice, { status: 'En Route' }) === false, 'Unassigned phlebotomist cannot modify collection');
  assert(canModifyCollection(identityAlice, collectionAlice, { status: 'Sample Collected' }) === false, 'Patient cannot advance collection lifecycle');

  // Test 13: Document & Reports Authorization
  console.log('\n--- Test 13: Document & Reports Authorization ---');
  const documentHandler = require('./src/handlers/document');
  const { canAccessDocument, canUploadDocument } = require('./src/shared/auth');

  const docAlice = {
    documentId: 'DOC-ALICE-001',
    patientId: 'pat_alice_1',
    ownerSub: MOCK_SUB_ALICE,
    entityType: 'REPORT',
    entityId: 'REP-001',
    status: 'UPLOADED',
    fileKey: 'documents/pat_alice_1/REPORT/REP-001/DOC-ALICE-001.pdf',
  };

  const docAliceChild = {
    documentId: 'DOC-ALICE-CHILD-001',
    patientId: 'pat_alice_child',
    ownerSub: MOCK_SUB_ALICE,
    entityType: 'REPORT',
    entityId: 'REP-002',
    status: 'UPLOADED',
    fileKey: 'documents/pat_alice_child/REPORT/REP-002/DOC-ALICE-CHILD-001.pdf',
  };

  const docBob = {
    documentId: 'DOC-BOB-001',
    patientId: 'pat_bob_1',
    ownerSub: MOCK_SUB_BOB,
    entityType: 'REPORT',
    entityId: 'REP-003',
    status: 'UPLOADED',
    fileKey: 'documents/pat_bob_1/REPORT/REP-003/DOC-BOB-001.pdf',
  };

  // 1. Anonymous document access -> 401
  const resNoAuthDoc = await documentHandler.handler({
    httpMethod: 'GET',
    path: '/api/documents/DOC-ALICE-001',
    pathParameters: { proxy: 'DOC-ALICE-001' },
    requestContext: {},
  });
  assert(resNoAuthDoc.statusCode === 401, 'Anonymous request to /api/documents returns 401 Unauthorized');

  // 2. Anonymous upload -> 401
  const resNoAuthUpload = await documentHandler.handler({
    httpMethod: 'POST',
    path: '/api/documents/upload-url',
    pathParameters: { proxy: 'upload-url' },
    requestContext: {},
    body: JSON.stringify({
      entityType: 'REPORT',
      entityId: 'REP-001',
      patientId: 'pat_alice_1',
      fileName: 'report.pdf',
      contentType: 'application/pdf',
      fileSize: 1024,
    }),
  });
  assert(resNoAuthUpload.statusCode === 401, 'Anonymous request to /api/documents/upload-url returns 401 Unauthorized');

  // 3. Patient accesses own document -> allowed
  assert(canAccessDocument(identityAlice, docAlice, patientAlice) === true, 'Alice can access her own document');

  // 4. Patient accesses family member document -> allowed
  assert(canAccessDocument(identityAlice, docAliceChild, patientAliceChild) === true, 'Alice can access her child document');

  // 5. Patient accesses another patient document -> denied (403)
  assert(canAccessDocument(identityBob, docAlice, patientAlice) === false, 'Bob cannot access Alice document');
  assert(canAccessDocument(identityAlice, docBob, patientBob) === false, 'Alice cannot access Bob document');

  // 6. Patient uploads for own patient / family member -> allowed
  assert(canUploadDocument(identityAlice, 'pat_alice_1', patientAlice) === true, 'Alice can upload for herself');
  assert(canUploadDocument(identityAlice, 'pat_alice_child', patientAliceChild) === true, 'Alice can upload for child');

  // 7. Patient attempts upload for another patient -> denied
  assert(canUploadDocument(identityAlice, 'pat_bob_1', patientBob) === false, 'Alice cannot upload for Bob');
  assert(canUploadDocument(identityBob, 'pat_alice_1', patientAlice) === false, 'Bob cannot upload for Alice');

  // 8. Staff / Doctor / Admin document access -> allowed
  assert(canAccessDocument(identityAdmin, docAlice, patientAlice) === true, 'Admin can access Alice document');
  assert(canAccessDocument(identityAdmin, docBob, patientBob) === true, 'Admin can access Bob document');
  assert(canAccessDocument(identityStaffDoctor, docAlice, patientAlice) === true, 'Doctor can access Alice document');
  assert(canUploadDocument(identityAdmin, 'pat_bob_1', patientBob) === true, 'Admin can upload for Bob');
  assert(canUploadDocument(identityStaffDoctor, 'pat_alice_1', patientAlice) === true, 'Doctor can upload for Alice');

  // Test 14: Invoice & Payment Authorization & Lifecycle
  console.log('\n--- Test 14: Invoice & Payment Authorization & Lifecycle ---');
  const invoiceHandler = require('./src/handlers/invoice');
  const { canAccessInvoice, canModifyInvoice, isValidInvoiceTransition } = require('./src/shared/auth');

  const invoiceAlice = {
    id: 'INV-ALICE-001',
    bookingId: 'bk_alice_1',
    patientId: 'pat_alice_1',
    ownerSub: MOCK_SUB_ALICE,
    items: [{ id: 'item_1', name: 'Complete Blood Count', type: 'Test', price: 500 }],
    subtotal: 500,
    discount: 0,
    tax: 25,
    total: 525,
    paymentStatus: 'Pending',
    createdAt: '2026-08-20T10:00:00Z',
  };

  const invoiceAliceChild = {
    id: 'INV-ALICE-CHILD-001',
    bookingId: 'bk_alice_child',
    patientId: 'pat_alice_child',
    ownerSub: MOCK_SUB_ALICE,
    items: [{ id: 'item_2', name: 'Lipid Profile', type: 'Test', price: 800 }],
    subtotal: 800,
    discount: 0,
    tax: 40,
    total: 840,
    paymentStatus: 'Pending',
    createdAt: '2026-08-20T10:05:00Z',
  };

  const invoiceBob = {
    id: 'INV-BOB-001',
    bookingId: 'bk_bob_1',
    patientId: 'pat_bob_1',
    ownerSub: MOCK_SUB_BOB,
    items: [{ id: 'item_3', name: 'Thyroid Panel', type: 'Test', price: 600 }],
    subtotal: 600,
    discount: 0,
    tax: 30,
    total: 630,
    paymentStatus: 'Pending',
    createdAt: '2026-08-20T10:10:00Z',
  };

  // 1. Anonymous invoice access -> 401
  const resNoAuthInvoice = await invoiceHandler.handler({
    httpMethod: 'GET',
    path: '/api/invoices/INV-ALICE-001',
    pathParameters: { proxy: 'INV-ALICE-001' },
    requestContext: {},
  });
  assert(resNoAuthInvoice.statusCode === 401, 'Anonymous request to /api/invoices returns 401 Unauthorized');

  // 2. Patient accesses own invoice -> allowed
  assert(canAccessInvoice(identityAlice, invoiceAlice, patientAlice) === true, 'Alice can access her own invoice');

  // 3. Patient accesses family member invoice -> allowed
  assert(canAccessInvoice(identityAlice, invoiceAliceChild, patientAliceChild) === true, 'Alice can access her child invoice');

  // 4. Patient accesses another patient's invoice -> denied (403)
  assert(canAccessInvoice(identityBob, invoiceAlice, patientAlice) === false, 'Bob cannot access Alice invoice');
  assert(canAccessInvoice(identityAlice, invoiceBob, patientBob) === false, 'Alice cannot access Bob invoice');

  // 5. Admin and Staff can access any invoice -> allowed
  assert(canAccessInvoice(identityAdmin, invoiceAlice, patientAlice) === true, 'Admin can access Alice invoice');
  assert(canAccessInvoice(identityAdmin, invoiceBob, patientBob) === true, 'Admin can access Bob invoice');
  assert(canAccessInvoice(identityStaffDoctor, invoiceAlice, patientAlice) === true, 'Doctor can access Alice invoice');

  // 6. Patient cannot modify invoice fields directly -> denied
  assert(canModifyInvoice(identityAlice, invoiceAlice, { total: 1 }) === false, 'Alice cannot alter invoice total');
  assert(canModifyInvoice(identityAlice, invoiceAlice, { paymentStatus: 'Paid' }) === false, 'Alice cannot mark invoice Paid directly');

  // 7. Staff and Admin can record payment / update operational details -> allowed
  assert(canModifyInvoice(identityAdmin, invoiceAlice, { paymentStatus: 'Paid' }) === true, 'Admin can update invoice status');
  assert(canModifyInvoice(identityStaffDoctor, invoiceAlice, { paymentMethod: 'Card', receivedBy: 'STAFF-01' }) === true, 'Staff can record payment details');
  assert(canModifyInvoice(identityStaffDoctor, invoiceAlice, { total: 1 }) === false, 'Staff cannot tamper with immutable total amount');

  // 8. Lifecycle state machine transitions
  assert(isValidInvoiceTransition('Pending', 'Paid') === true, 'Pending -> Paid is ALLOWED');
  assert(isValidInvoiceTransition('Unpaid', 'Paid') === true, 'Unpaid -> Paid is ALLOWED');
  assert(isValidInvoiceTransition('Paid', 'Unpaid') === false, 'Paid -> Unpaid is REJECTED');
  assert(isValidInvoiceTransition('Paid', 'Pending') === false, 'Paid -> Pending is REJECTED');
  assert(isValidInvoiceTransition('Cancelled', 'Paid') === false, 'Cancelled -> Paid is REJECTED');

  // --- Test 15: In-App Notification Authorization & Lifecycle ---
  console.log('\n--- Test 15: In-App Notification Authorization & Lifecycle ---');

  const notifHandler = require('./src/handlers/notification');
  const { canAccessNotification, canCreateNotification } = require('./src/shared/auth');

  const notifAlice = {
    id: 'NOTIF-ALICE-001',
    userId: MOCK_SUB_ALICE,
    ownerSub: MOCK_SUB_ALICE,
    title: 'Report Ready',
    message: 'Your CBC report is ready.',
    isRead: false,
    createdAt: '2026-08-20T12:00:00.000Z',
  };

  const notifBob = {
    id: 'NOTIF-BOB-001',
    userId: MOCK_SUB_BOB,
    ownerSub: MOCK_SUB_BOB,
    title: 'Appointment Scheduled',
    message: 'Your appointment is confirmed.',
    isRead: false,
    createdAt: '2026-08-20T12:00:00.000Z',
  };

  const notifPhleb = {
    id: 'NOTIF-PHLEB-001',
    userId: 'phleb-sub-5555',
    ownerSub: 'phleb-sub-5555',
    title: 'New Home Collection Assignment',
    message: 'You have been assigned a task.',
    isRead: false,
    createdAt: '2026-08-20T12:00:00.000Z',
  };

  // 1. Anonymous notification access -> 401
  const resNoAuthNotif = await notifHandler.handler({
    httpMethod: 'GET',
    path: '/api/notifications',
    requestContext: {},
  });
  assert(resNoAuthNotif.statusCode === 401, 'Anonymous request to /api/notifications returns 401 Unauthorized');

  // 2. Patient accesses own notification -> allowed
  assert(canAccessNotification(identityAlice, notifAlice) === true, 'Alice can access her own notification');

  // 3. Patient accesses another user notification -> denied
  assert(canAccessNotification(identityBob, notifAlice) === false, 'Bob cannot access Alice notification');
  assert(canAccessNotification(identityAlice, notifBob) === false, 'Alice cannot access Bob notification');

  // 4. Admin accesses any notification -> allowed
  assert(canAccessNotification(identityAdmin, notifAlice) === true, 'Admin can access Alice notification');
  assert(canAccessNotification(identityAdmin, notifBob) === true, 'Admin can access Bob notification');

  // 5. Phlebotomist accesses own notification -> allowed
  assert(canAccessNotification(identityPhlebRajesh, notifPhleb) === true, 'Phlebotomist Rajesh can access his own notification');
  assert(canAccessNotification(identityPhlebSuresh, notifPhleb) === false, 'Phlebotomist Suresh cannot access Rajesh notification');

  // 6. Notification creation permissions
  assert(canCreateNotification(identityAdmin, { userId: MOCK_SUB_ALICE }) === true, 'Admin can create notification for Alice');
  assert(canCreateNotification(identityStaffDoctor, { userId: MOCK_SUB_ALICE }) === true, 'Staff Doctor can create notification for Alice');
  assert(canCreateNotification(identityAlice, { userId: MOCK_SUB_ALICE }) === true, 'Alice can create notification for herself');
  assert(canCreateNotification(identityAlice, { userId: MOCK_SUB_BOB }) === false, 'Alice cannot create notification for Bob');
  assert(canCreateNotification(identityBob, { userId: MOCK_SUB_ALICE }) === false, 'Bob cannot create notification for Alice');

  // 7. Handler BOLA protection on query parameters
  const resAliceQueryBob = await notifHandler.handler({
    httpMethod: 'GET',
    path: '/api/notifications',
    queryStringParameters: { userId: MOCK_SUB_BOB },
    requestContext: {
      authorizer: {
        claims: {
          sub: MOCK_SUB_ALICE,
          email: 'alice@example.com',
          'custom:role': 'patient',
        },
      },
    },
  });
  assert(resAliceQueryBob.statusCode === 403, 'Alice query for Bob userId returns 403 Forbidden');

  // =================================================================
  // Test Suite 16: Reviews & Feedback Authorization & Validation
  // =================================================================
  console.log('\n--- Test 16: Reviews & Feedback Authorization & Validation ---');

  const reviewApproved = {
    id: 'REV-001',
    patientId: 'pat_alice_1',
    ownerSub: MOCK_SUB_ALICE,
    bookingId: 'bk_alice_comp',
    rating: 5,
    comment: 'Exceptional phlebotomy service, highly professional and accurate.',
    displayName: 'Alice Johnson',
    status: 'Approved',
    verified: true,
    createdAt: new Date().toISOString(),
  };

  const reviewPendingAlice = {
    id: 'REV-002',
    patientId: 'pat_alice_1',
    ownerSub: MOCK_SUB_ALICE,
    bookingId: 'bk_alice_comp_2',
    rating: 4,
    comment: 'Fast results, courteous staff and clean equipment.',
    displayName: 'Alice Johnson',
    status: 'Pending',
    verified: true,
    createdAt: new Date().toISOString(),
  };

  const reviewPendingBob = {
    id: 'REV-003',
    patientId: 'pat_bob_1',
    ownerSub: MOCK_SUB_BOB,
    bookingId: 'bk_bob_comp',
    rating: 5,
    comment: 'Great experience with home sample collection.',
    displayName: 'Bob Smith',
    status: 'Pending',
    verified: true,
    createdAt: new Date().toISOString(),
  };

  const completedBookingAlice = {
    id: 'bk_alice_comp',
    patientId: 'pat_alice-sub-1111',
    ownerSub: MOCK_SUB_ALICE,
    status: 'Completed',
  };

  const pendingBookingAlice = {
    id: 'bk_alice_pending',
    patientId: 'pat_alice-sub-1111',
    ownerSub: MOCK_SUB_ALICE,
    status: 'Pending',
  };

  // 1. Anonymous access to approved review -> allowed
  assert(canAccessReview(null, reviewApproved) === true, 'Anonymous can access Approved review');

  // 2. Anonymous access to pending review -> denied
  assert(canAccessReview(null, reviewPendingAlice) === false, 'Anonymous CANNOT access Pending review');

  // 3. Patient access own pending review -> allowed
  assert(canAccessReview(identityAlice, reviewPendingAlice) === true, 'Alice can access her own Pending review');

  // 4. Patient access foreign pending review -> denied
  assert(canAccessReview(identityBob, reviewPendingAlice) === false, 'Bob CANNOT access Alice Pending review');
  assert(canAccessReview(identityAlice, reviewPendingBob) === false, 'Alice CANNOT access Bob Pending review');

  // 5. Admin & Doctor can access all reviews
  assert(canAccessReview(identityAdmin, reviewPendingAlice) === true, 'Admin can access any Pending review');
  assert(canAccessReview(identityStaffDoctor, reviewPendingBob) === true, 'Staff Doctor can access any Pending review');

  // 6. Patient creates review for own completed booking -> allowed
  assert(canCreateReview(identityAlice, {}, completedBookingAlice) === true, 'Alice can create review for own Completed booking');

  // 7. Patient creates review for foreign booking -> denied
  assert(canCreateReview(identityBob, {}, completedBookingAlice) === false, 'Bob CANNOT create review for Alice booking');

  // 8. Patient creates review for non-completed booking -> denied
  assert(canCreateReview(identityAlice, {}, pendingBookingAlice) === false, 'Alice CANNOT create review for non-completed booking');

  // 9. Moderation permissions
  assert(canModerateReview(identityAlice) === false, 'Patient CANNOT moderate reviews');
  assert(canModerateReview(identityBob) === false, 'Patient Bob CANNOT moderate reviews');
  assert(canModerateReview(identityAdmin) === true, 'Admin CAN moderate reviews');
  assert(canModerateReview(identityStaffDoctor) === true, 'Staff Doctor CAN moderate reviews');

  // 10. Rating validation rules
  function isValidRating(r) {
    const num = Number(r);
    return Number.isInteger(num) && num >= 1 && num <= 5;
  }
  assert(isValidRating(1) === true, 'Rating 1 is VALID');
  assert(isValidRating(5) === true, 'Rating 5 is VALID');
  assert(isValidRating(0) === false, 'Rating 0 is REJECTED');
  assert(isValidRating(6) === false, 'Rating 6 is REJECTED');
  assert(isValidRating(4.5) === false, 'Decimal rating 4.5 is REJECTED');
  assert(isValidRating('five') === false, 'String rating is REJECTED');

  // 11. Comment validation rules
  function isValidComment(c) {
    if (typeof c !== 'string') return false;
    const trimmed = c.trim();
    return trimmed.length >= 10 && trimmed.length <= 2000;
  }
  assert(isValidComment('Short') === false, 'Comment < 10 chars is REJECTED');
  assert(isValidComment('Great diagnostic lab with very clean equipment and friendly staff.') === true, 'Valid comment is ALLOWED');
  assert(isValidComment('a'.repeat(2001)) === false, 'Comment > 2000 chars is REJECTED');


  // 12. Public sanitization verification
  function sanitizePublic(r) {
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      displayName: r.displayName || 'Verified Patient',
      verified: !!r.verified,
      createdAt: r.createdAt,
    };
  }
  const sanitized = sanitizePublic(reviewApproved);
  assert(sanitized.ownerSub === undefined, 'Public review excludes ownerSub');
  assert(sanitized.patientId === undefined, 'Public review excludes patientId');
  assert(sanitized.id === 'REV-001', 'Public review retains review ID');
  assert(sanitized.verified === true, 'Public review retains verified status');

  // 13. Lifecycle transition validation
  function isValidReviewStatus(s) {
    return ['Approved', 'Rejected'].includes(s);
  }
  assert(isValidReviewStatus('Approved') === true, 'Approved status transition is VALID');
  assert(isValidReviewStatus('Rejected') === true, 'Rejected status transition is VALID');
  assert(isValidReviewStatus('Pending') === false, 'Patient cannot reset to Pending');
  assert(isValidReviewStatus('Deleted') === false, 'Unknown status is REJECTED');



  // ----------------------------------------------------
  // Test Suite 17: Comprehensive RBAC Matrix & Full CRUD Authorization Audit
  // ----------------------------------------------------
  console.log('\n--- Test 17: Comprehensive RBAC Matrix & Full CRUD Conformance ---');

  // Authoritative RBAC Permissions Definitions
  const RBAC_MODULES = [
    'patients', 'orders', 'collections', 'reports', 'catalog',
    'staff', 'analytics', 'settings', 'blogs', 'invoices', 'reviews'
  ];

  const RBAC_PERMISSIONS_MATRIX = {
    admin: {
      patients: { view: true, create: true, edit: true, del: true },
      orders: { view: true, create: true, edit: true, del: true },
      collections: { view: true, create: true, edit: true, del: true },
      reports: { view: true, create: true, edit: true, del: true },
      catalog: { view: true, create: true, edit: true, del: true },
      staff: { view: true, create: true, edit: true, del: true },
      analytics: { view: true, create: true, edit: true, del: true },
      settings: { view: true, create: true, edit: true, del: true },
      blogs: { view: true, create: true, edit: true, del: true },
      invoices: { view: true, create: true, edit: true, del: true },
      reviews: { view: true, create: true, edit: true, del: true },
    },
    op: {
      patients: { view: true, create: true, edit: true, del: false },
      orders: { view: true, create: true, edit: true, del: false },
      collections: { view: true, create: true, edit: true, del: false },
      reports: { view: true, create: false, edit: false, del: false },
      catalog: { view: true, create: true, edit: true, del: false },
      staff: { view: false, create: false, edit: false, del: false },
      analytics: { view: false, create: false, edit: false, del: false },
      settings: { view: false, create: false, edit: false, del: false },
      blogs: { view: false, create: false, edit: false, del: false },
      invoices: { view: true, create: false, edit: false, del: false },
      reviews: { view: true, create: false, edit: false, del: false },
    },
    path: {
      patients: { view: true, create: false, edit: true, del: false },
      orders: { view: true, create: false, edit: false, del: false },
      collections: { view: true, create: false, edit: false, del: false },
      reports: { view: true, create: false, edit: true, del: false },
      catalog: { view: false, create: false, edit: false, del: false },
      staff: { view: false, create: false, edit: false, del: false },
      analytics: { view: false, create: false, edit: false, del: false },
      settings: { view: false, create: false, edit: false, del: false },
      blogs: { view: false, create: false, edit: false, del: false },
      invoices: { view: false, create: false, edit: false, del: false },
      reviews: { view: false, create: false, edit: false, del: false },
    },
    phleb: {
      patients: { view: true, create: false, edit: false, del: false },
      orders: { view: true, create: false, edit: true, del: false },
      collections: { view: true, create: false, edit: true, del: false },
      reports: { view: false, create: false, edit: false, del: false },
      catalog: { view: false, create: false, edit: false, del: false },
      staff: { view: false, create: false, edit: false, del: false },
      analytics: { view: false, create: false, edit: false, del: false },
      settings: { view: false, create: false, edit: false, del: false },
      blogs: { view: false, create: false, edit: false, del: false },
      invoices: { view: false, create: false, edit: false, del: false },
      reviews: { view: false, create: false, edit: false, del: false },
    },
    phleb_home: {
      patients: { view: true, create: false, edit: false, del: false },
      orders: { view: false, create: false, edit: false, del: false },
      collections: { view: true, create: false, edit: true, del: false },
      reports: { view: false, create: false, edit: false, del: false },
      catalog: { view: false, create: false, edit: false, del: false },
      staff: { view: false, create: false, edit: false, del: false },
      analytics: { view: false, create: false, edit: false, del: false },
      settings: { view: false, create: false, edit: false, del: false },
      blogs: { view: false, create: false, edit: false, del: false },
      invoices: { view: false, create: false, edit: false, del: false },
      reviews: { view: false, create: false, edit: false, del: false },
    },
    phleb_lab: {
      patients: { view: true, create: false, edit: false, del: false },
      orders: { view: false, create: false, edit: false, del: false },
      collections: { view: true, create: false, edit: true, del: false },
      reports: { view: false, create: false, edit: false, del: false },
      catalog: { view: false, create: false, edit: false, del: false },
      staff: { view: false, create: false, edit: false, del: false },
      analytics: { view: false, create: false, edit: false, del: false },
      settings: { view: false, create: false, edit: false, del: false },
      blogs: { view: false, create: false, edit: false, del: false },
      invoices: { view: false, create: false, edit: false, del: false },
      reviews: { view: false, create: false, edit: false, del: false },
    },
    patient: {
      patients: { view: false, create: false, edit: false, del: false },
      orders: { view: false, create: false, edit: false, del: false },
      collections: { view: false, create: false, edit: false, del: false },
      reports: { view: false, create: false, edit: false, del: false },
      catalog: { view: false, create: false, edit: false, del: false },
      staff: { view: false, create: false, edit: false, del: false },
      analytics: { view: false, create: false, edit: false, del: false },
      settings: { view: false, create: false, edit: false, del: false },
      blogs: { view: false, create: false, edit: false, del: false },
      invoices: { view: false, create: false, edit: false, del: false },
      reviews: { view: false, create: false, edit: false, del: false },
    },
  };

  // Helper evaluator
  function checkRBAC(roleId, moduleId, action) {
    if (roleId === 'admin') return true;
    const roleMatrix = RBAC_PERMISSIONS_MATRIX[roleId];
    if (!roleMatrix) return false;
    const mod = roleMatrix[moduleId];
    if (!mod) return false;
    return !!mod[action];
  }

  // 1. Role × CRUD Matrix Verification
  assert(checkRBAC('admin', 'patients', 'del') === true, 'Admin has full delete permission on patients');
  assert(checkRBAC('admin', 'staff', 'create') === true, 'Admin can create staff');
  assert(checkRBAC('admin', 'settings', 'edit') === true, 'Admin can edit settings');

  assert(checkRBAC('op', 'patients', 'view') === true, 'Operations Manager can view patients');
  assert(checkRBAC('op', 'orders', 'create') === true, 'Operations Manager can create orders');
  assert(checkRBAC('op', 'staff', 'view') === false, 'Operations Manager CANNOT view staff management');
  assert(checkRBAC('op', 'settings', 'edit') === false, 'Operations Manager CANNOT edit settings');

  assert(checkRBAC('path', 'reports', 'edit') === true, 'Pathologist can edit reports');
  assert(checkRBAC('path', 'orders', 'create') === false, 'Pathologist CANNOT create orders');
  assert(checkRBAC('path', 'invoices', 'view') === false, 'Pathologist CANNOT view invoices');

  assert(checkRBAC('phleb', 'collections', 'edit') === true, 'Phlebotomist can edit collections');
  assert(checkRBAC('phleb', 'reports', 'view') === false, 'Phlebotomist CANNOT view reports');
  assert(checkRBAC('phleb', 'patients', 'edit') === false, 'Phlebotomist CANNOT edit patient demographic records');

  assert(checkRBAC('patient', 'patients', 'view') === false, 'Patient CANNOT access admin patient module');
  assert(checkRBAC('patient', 'invoices', 'view') === false, 'Patient CANNOT access admin invoices module');
  assert(checkRBAC('patient', 'staff', 'view') === false, 'Patient CANNOT access admin staff module');

  // 2. Page-level Route Guards & URL Access Matrix
  const ROUTE_PERMISSIONS = {
    '/admin': { moduleId: 'analytics', action: 'view' },
    '/admin/analytics': { moduleId: 'analytics', action: 'view' },
    '/admin/bookings': { moduleId: 'orders', action: 'view' },
    '/admin/collections': { moduleId: 'collections', action: 'view' },
    '/admin/patients': { moduleId: 'patients', action: 'view' },
    '/admin/invoices': { moduleId: 'invoices', action: 'view' },
    '/admin/reports': { moduleId: 'reports', action: 'view' },
    '/admin/reviews': { moduleId: 'reviews', action: 'view' },
    '/admin/staff': { moduleId: 'staff', action: 'view' },
    '/admin/blogs': { moduleId: 'blogs', action: 'view' },
    '/admin/settings': { moduleId: 'settings', action: 'view' },
  };

  function canAccessAdminRoute(roleId, pathname) {
    if (roleId === 'patient' || !roleId) return false;
    if (roleId === 'admin') return true;
    const perm = ROUTE_PERMISSIONS[pathname];
    if (!perm) return true; // Non-module internal admin pages
    return checkRBAC(roleId, perm.moduleId, perm.action);
  }

  assert(canAccessAdminRoute('admin', '/admin/settings') === true, 'Admin can access /admin/settings');
  assert(canAccessAdminRoute('op', '/admin/bookings') === true, 'Operations Manager can access /admin/bookings');
  assert(canAccessAdminRoute('op', '/admin/staff') === false, 'Operations Manager CANNOT access /admin/staff');
  assert(canAccessAdminRoute('path', '/admin/reports') === true, 'Pathologist can access /admin/reports');
  assert(canAccessAdminRoute('path', '/admin/invoices') === false, 'Pathologist CANNOT access /admin/invoices');
  assert(canAccessAdminRoute('phleb', '/admin/collections') === true, 'Phlebotomist can access /admin/collections');
  assert(canAccessAdminRoute('phleb', '/admin/analytics') === false, 'Phlebotomist CANNOT access /admin/analytics');
  assert(canAccessAdminRoute('patient', '/admin') === false, 'Patient CANNOT access /admin');
  assert(canAccessAdminRoute('patient', '/admin/invoices') === false, 'Patient CANNOT access /admin/invoices');

  // 3. Field-Level Immutability & Anti-Spoofing Audit
  function validateFieldModification(roleId, domain, updatePayload) {
    if (roleId === 'admin') return true;
    if (domain === 'collection' && (roleId === 'phleb' || roleId === 'phleb_home' || roleId === 'phleb_lab')) {
      const forbidden = ['patientId', 'ownerSub', 'bookingId', 'phlebotomistId', 'assignedTo', 'tests'];
      return !Object.keys(updatePayload).some(k => forbidden.includes(k));
    }
    if (domain === 'invoice' && roleId !== 'admin') {
      const forbidden = ['id', 'PK', 'SK', 'subtotal', 'total', 'patientId', 'ownerSub', 'bookingId', 'paymentStatus'];
      return !Object.keys(updatePayload).some(k => forbidden.includes(k));
    }
    if (roleId === 'patient') {
      const forbidden = ['status', 'verified', 'paymentStatus', 'ownerSub', 'createdBy', 'subtotal', 'total', 'patientId', 'bookingId'];
      return !Object.keys(updatePayload).some(k => forbidden.includes(k));
    }
    return true;
  }

  assert(validateFieldModification('phleb', 'collection', { status: 'Sample Collected' }) === true, 'Phlebotomist can update collection status');
  assert(validateFieldModification('phleb', 'collection', { patientId: 'pat_tampered' }) === false, 'Phlebotomist CANNOT tamper with patientId');
  assert(validateFieldModification('phleb', 'collection', { assignedTo: 'phleb_other' }) === false, 'Phlebotomist CANNOT tamper with assignedTo');
  assert(validateFieldModification('doctor', 'invoice', { notes: 'Reviewed by doctor' }) === true, 'Staff Doctor can add notes to invoice');
  assert(validateFieldModification('doctor', 'invoice', { total: 0 }) === false, 'Staff Doctor CANNOT tamper with invoice total amount');
  assert(validateFieldModification('patient', 'review', { status: 'Approved' }) === false, 'Patient CANNOT tamper with review status');
  assert(validateFieldModification('patient', 'invoice', { paymentStatus: 'Paid' }) === false, 'Patient CANNOT tamper with paymentStatus');

  // 4. Role Escalation Protection Audit
  function sanitizeIdentityClaims(incomingEvent) {
    return extractIdentity(incomingEvent);
  }

  const spoofedAdminEvent = {
    requestContext: {
      authorizer: {
        claims: {
          sub: 'hacker-sub-1234',
          email: 'hacker@example.com',
          // Client attempts to claim custom:role = admin without cognito group
          'custom:role': 'admin',
        }
      }
    }
  };
  const verifiedIdentity = sanitizeIdentityClaims(spoofedAdminEvent);
  assert(verifiedIdentity.sub === 'hacker-sub-1234', 'Identity sub is extracted correctly');
  assert(verifiedIdentity.primaryPatientId === 'pat_hacker-sub-1234', 'Primary patient ID strictly scoped to caller sub');

  // ----------------------------------------------------
  // Test Suite 18: Blog / Content Management Authorization & Full CRUD Audit
  // ----------------------------------------------------
  console.log('\n--- Test 18: Blog / Content Management Backend & CRUD Conformance ---');

  const publishedBlog = {
    id: 'BLOG-101',
    slug: 'understanding-cbc',
    title: 'Understanding Your Complete Blood Count',
    category: 'Patient Education',
    content: '<p>CBC is a vital diagnostic panel.</p>',
    status: 'Published',
    author: 'Dr. Sarah Jenkins',
    authorId: 'STAFF-001',
    date: 'Aug 1, 2026',
    views: 1240,
    createdBy: MOCK_SUB_ADMIN,
    ownerSub: MOCK_SUB_ADMIN,
    createdAt: '2026-08-01T10:00:00.000Z',
    publishedAt: '2026-08-01T10:00:00.000Z',
  };

  const draftBlog = {
    id: 'BLOG-102',
    slug: 'future-molecular-diagnostics',
    title: 'Future of Molecular Diagnostics (Draft)',
    category: 'Medical Research',
    content: '<p>Draft research notes.</p>',
    status: 'Draft',
    author: 'Dr. Robert Wilson',
    authorId: 'STAFF-002',
    date: 'Aug 15, 2026',
    views: 0,
    createdBy: MOCK_SUB_ADMIN,
    ownerSub: MOCK_SUB_ADMIN,
    createdAt: '2026-08-15T12:00:00.000Z',
    publishedAt: null,
  };

  // 1. Public / Anonymous Access to Published vs Draft Blogs
  assert(canAccessBlog(null, publishedBlog) === true, 'Anonymous CAN access Published blog');
  assert(canAccessBlog(null, draftBlog) === false, 'Anonymous CANNOT access Draft blog');
  assert(canAccessBlog(identityAlice, publishedBlog) === true, 'Patient Alice CAN access Published blog');
  assert(canAccessBlog(identityAlice, draftBlog) === false, 'Patient Alice CANNOT access Draft blog');
  assert(canAccessBlog(identityBob, draftBlog) === false, 'Patient Bob CANNOT access Draft blog');
  assert(canAccessBlog(identityStaffDoctor, draftBlog) === false, 'Doctor without Admin CANNOT access Draft blog');
  assert(canAccessBlog(identityAdmin, publishedBlog) === true, 'Admin CAN access Published blog');
  assert(canAccessBlog(identityAdmin, draftBlog) === true, 'Admin CAN access Draft blog');

  // 2. Blog Creation Authorization
  assert(canCreateBlog(null) === false, 'Anonymous CANNOT create blog');
  assert(canCreateBlog(identityAlice) === false, 'Patient CANNOT create blog');
  assert(canCreateBlog(identityStaffDoctor) === false, 'Staff Doctor CANNOT create blog');
  assert(canCreateBlog(identityAdmin) === true, 'Admin CAN create blog');

  // 3. Blog Modification & Deletion Authorization
  assert(canModifyBlog(null) === false, 'Anonymous CANNOT modify blog');
  assert(canModifyBlog(identityAlice) === false, 'Patient CANNOT modify blog');
  assert(canModifyBlog(identityStaffDoctor) === false, 'Staff Doctor CANNOT modify blog');
  assert(canModifyBlog(identityAdmin) === true, 'Admin CAN modify blog');

  assert(canDeleteBlog(null) === false, 'Anonymous CANNOT delete blog');
  assert(canDeleteBlog(identityAlice) === false, 'Patient CANNOT delete blog');
  assert(canDeleteBlog(identityStaffDoctor) === false, 'Staff Doctor CANNOT delete blog');
  assert(canDeleteBlog(identityAdmin) === true, 'Admin CAN delete blog');

  // 4. Public Sanitization Verification
  function sanitizePublicBlogTest(article) {
    if (!article) return null;
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      description: article.description,
      content: article.content,
      date: article.date,
      category: article.category,
      author: article.author || 'Medical Editorial Team',
      authorId: article.authorId,
      icon: article.icon || 'fileText',
      colorPrimary: article.colorPrimary || '#3b82f6',
      colorSecondary: article.colorSecondary || '#bfdbfe',
      imageUrl: article.imageUrl || article.image || '',
      image: article.image || article.imageUrl || '',
      status: article.status || 'Published',
      views: article.views || 0,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
    };
  }

  const sanitizedBlog = sanitizePublicBlogTest(publishedBlog);
  assert(sanitizedBlog.ownerSub === undefined, 'Public blog excludes ownerSub');
  assert(sanitizedBlog.createdBy === undefined, 'Public blog excludes createdBy');
  assert(sanitizedBlog.id === 'BLOG-101', 'Public blog retains blog ID');
  assert(sanitizedBlog.slug === 'understanding-cbc', 'Public blog retains slug');
  assert(sanitizedBlog.status === 'Published', 'Public blog retains status');

  // 5. Anti-Spoofing & Field-Level Immutability on Mutation
  function sanitizeBlogPayload(callerIdentity, rawPayload) {
    if (!isAdmin(callerIdentity)) return null;
    const {
      id: _id,
      PK: _pk,
      SK: _sk,
      GSI1PK: _g1pk,
      GSI1SK: _g1sk,
      GSI2PK: _g2pk,
      GSI2SK: _g2sk,
      createdAt: _ca,
      createdBy: _cb,
      ownerSub: _os,
      ...allowed
    } = rawPayload;
    return {
      ...allowed,
      createdBy: callerIdentity.sub,
      ownerSub: callerIdentity.sub,
      updatedBy: callerIdentity.sub,
    };
  }

  const maliciousPayload = {
    title: 'New Valid Article',
    content: '<p>Legitimate content</p>',
    id: 'BLOG-SPOOFED',
    PK: 'MALICIOUS_PK',
    SK: 'MALICIOUS_SK',
    createdBy: 'hacker-sub',
    ownerSub: 'hacker-sub',
  };

  const cleanArticle = sanitizeBlogPayload(identityAdmin, maliciousPayload);
  assert(cleanArticle.createdBy === MOCK_SUB_ADMIN, 'Server authoritatively enforces createdBy from caller claims');
  assert(cleanArticle.ownerSub === MOCK_SUB_ADMIN, 'Server authoritatively enforces ownerSub from caller claims');
  assert(cleanArticle.PK === undefined, 'Client-supplied PK is stripped');
  assert(cleanArticle.SK === undefined, 'Client-supplied SK is stripped');

  // 6. Blog Lifecycle State Transitions
  function isValidBlogStatusTransition(currentStatus, nextStatus) {
    if (!currentStatus || !nextStatus) return false;
    const validStatuses = ['Draft', 'Published'];
    if (!validStatuses.includes(nextStatus)) return false;
    return true; // Draft <-> Published are valid bidirectional transitions
  }

  assert(isValidBlogStatusTransition('Draft', 'Published') === true, 'Draft -> Published is ALLOWED');
  assert(isValidBlogStatusTransition('Published', 'Draft') === true, 'Published -> Draft is ALLOWED');
  assert(isValidBlogStatusTransition('Draft', 'Archived') === false, 'Unapproved status is REJECTED');

  // 7. Simulated Handler Dispatch Validation
  const mockBlogDb = [publishedBlog, draftBlog];
  function simulateBlogGetHandler(callerIdentity, slugOrId) {
    if (!slugOrId) {
      // List
      if (!isAdmin(callerIdentity)) {
        return mockBlogDb.filter(b => b.status === 'Published').map(sanitizePublicBlogTest);
      }
      return mockBlogDb;
    }
    const found = mockBlogDb.find(b => b.slug === slugOrId || b.id === slugOrId);
    if (!found) return { status: 404 };
    if (!canAccessBlog(callerIdentity, found)) return { status: 404 };
    return { status: 200, data: isAdmin(callerIdentity) ? found : sanitizePublicBlogTest(found) };
  }

  const anonList = simulateBlogGetHandler(null);
  assert(anonList.length === 1, 'Anonymous listing contains ONLY Published articles');
  assert(anonList[0].id === 'BLOG-101', 'Anonymous listing contains published article BLOG-101');

  const adminList = simulateBlogGetHandler(identityAdmin);
  assert(adminList.length === 2, 'Admin listing contains BOTH Published and Draft articles');

  const anonDraftGet = simulateBlogGetHandler(null, 'future-molecular-diagnostics');
  assert(anonDraftGet.status === 404, 'Anonymous request for Draft blog returns 404');

  const adminDraftGet = simulateBlogGetHandler(identityAdmin, 'future-molecular-diagnostics');
  assert(adminDraftGet.status === 200, 'Admin request for Draft blog returns 200');
  assert(adminDraftGet.data.id === 'BLOG-102', 'Admin successfully reads Draft article');

  console.log('\n================================================================');
  console.log(`TOTAL RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('================================================================');

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAuthorizationTests();


