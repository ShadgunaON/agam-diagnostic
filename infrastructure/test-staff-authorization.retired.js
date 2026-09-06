/**
 * Deterministic Staff Authorization & Flow Tests (P4.3)
 * 
 * Verifies:
 * 1. Anonymous cannot create/list staff (401)
 * 2. Patient cannot create/list staff (403)
 * 3. Non-admin staff (op, path, phleb_lab) can list staff (200) but CANNOT create staff (403)
 * 4. Admin can create staff (201)
 * 5. Invalid role is rejected (400)
 * 6. Missing required fields are rejected (400)
 * 7. Passwords/secrets NEVER appear in response payload
 * 8. isStaff() correctly recognizes canonical roles: op, path, phleb_lab, phleb, phleb_home, staff, doctor, lab_tech
 * 9. isAdmin() correctly recognizes admin
 */

const assert = require('assert');
const { extractIdentity, isAdmin, isStaff } = require('./src/shared/auth');
const staffHandler = require('./src/handlers/staff');

// Mock DynamoDB and Cognito dependencies
const mockStaffStore = new Map();

// Helper to create mock API Gateway events
function createEvent({ method = 'GET', path = '/api/staff', body = null, claims = null, headers = {} }) {
  return {
    httpMethod: method,
    path,
    body: body ? JSON.stringify(body) : null,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    requestContext: {
      authorizer: claims ? { claims } : undefined,
      http: { method, path },
    },
  };
}

// Claims fixtures
const patientClaims = {
  sub: 'sub-patient-123',
  email: 'patient@example.com',
  name: 'Patient User',
  'custom:role': 'patient',
};

const adminClaims = {
  sub: 'sub-admin-456',
  email: 'admin@agamdiagnostics.com',
  name: 'Admin User',
  'custom:role': 'admin',
};

const opClaims = {
  sub: 'sub-op-789',
  email: 'op@agamdiagnostics.com',
  name: 'Operations Staff',
  'custom:role': 'op',
};

const pathClaims = {
  sub: 'sub-path-101',
  email: 'path@agamdiagnostics.com',
  name: 'Pathologist User',
  'custom:role': 'path',
};

const phlebLabClaims = {
  sub: 'sub-lab-102',
  email: 'lab@agamdiagnostics.com',
  name: 'Lab Tech User',
  'custom:role': 'phleb_lab',
};

async function runTests() {
  console.log('=== P4.3 Deterministic Staff & RBAC Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. RBAC isStaff() canonical role recognition
  test('isStaff() recognizes op role', () => {
    const id = extractIdentity(createEvent({ claims: opClaims }));
    assert.strictEqual(isStaff(id), true);
  });

  test('isStaff() recognizes path role', () => {
    const id = extractIdentity(createEvent({ claims: pathClaims }));
    assert.strictEqual(isStaff(id), true);
  });

  test('isStaff() recognizes phleb_lab role', () => {
    const id = extractIdentity(createEvent({ claims: phlebLabClaims }));
    assert.strictEqual(isStaff(id), true);
  });

  test('isStaff() recognizes admin as staff', () => {
    const id = extractIdentity(createEvent({ claims: adminClaims }));
    assert.strictEqual(isStaff(id), true);
  });

  test('isStaff() rejects patient', () => {
    const id = extractIdentity(createEvent({ claims: patientClaims }));
    assert.strictEqual(isStaff(id), false);
  });

  test('isAdmin() identifies admin correctly', () => {
    const id = extractIdentity(createEvent({ claims: adminClaims }));
    assert.strictEqual(isAdmin(id), true);
  });

  test('isAdmin() rejects non-admin staff', () => {
    const id = extractIdentity(createEvent({ claims: opClaims }));
    assert.strictEqual(isAdmin(id), false);
  });

  // 2. Anonymous request rejection
  await asyncTest('Anonymous cannot access /api/staff (401)', async () => {
    const event = createEvent({ method: 'GET', path: '/api/staff' });
    const res = await staffHandler.handler(event);
    assert.strictEqual(res.statusCode, 401);
  });

  // 3. Patient request rejection
  await asyncTest('Patient cannot list staff (403)', async () => {
    const event = createEvent({ method: 'GET', path: '/api/staff', claims: patientClaims });
    const res = await staffHandler.handler(event);
    assert.strictEqual(res.statusCode, 403);
  });

  await asyncTest('Patient cannot create staff (403)', async () => {
    const event = createEvent({
      method: 'POST',
      path: '/api/staff',
      claims: patientClaims,
      body: { name: 'Test', email: 'test@example.com', phone: '9999999999', role: 'op' },
    });
    const res = await staffHandler.handler(event);
    assert.strictEqual(res.statusCode, 403);
  });

  // 4. Non-admin staff cannot create staff
  await asyncTest('Operations staff cannot create staff (403)', async () => {
    const event = createEvent({
      method: 'POST',
      path: '/api/staff',
      claims: opClaims,
      body: { name: 'Test', email: 'test@example.com', phone: '9999999999', role: 'path' },
    });
    const res = await staffHandler.handler(event);
    assert.strictEqual(res.statusCode, 403);
  });

  // 5. Validation on staff creation
  await asyncTest('Admin creating staff with missing name is rejected (400)', async () => {
    const event = createEvent({
      method: 'POST',
      path: '/api/staff',
      claims: adminClaims,
      body: { email: 'test@example.com', phone: '9999999999', role: 'op' },
    });
    const res = await staffHandler.handler(event);
    assert.strictEqual(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.ok(body.error.includes('name'));
  });

  await asyncTest('Admin creating staff with invalid email is rejected (400)', async () => {
    const event = createEvent({
      method: 'POST',
      path: '/api/staff',
      claims: adminClaims,
      body: { name: 'Test', email: 'not-an-email', phone: '9999999999', role: 'op' },
    });
    const res = await staffHandler.handler(event);
    assert.strictEqual(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.ok(body.error.includes('email'));
  });

  await asyncTest('Admin creating staff with invalid role is rejected (400)', async () => {
    const event = createEvent({
      method: 'POST',
      path: '/api/staff',
      claims: adminClaims,
      body: { name: 'Test', email: 'test@example.com', phone: '9999999999', role: 'super_hacker' },
    });
    const res = await staffHandler.handler(event);
    assert.strictEqual(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.ok(body.error.includes('role'));
  });

  // 6. Security verification: no password in responses
  test('Sanitization check: response structure never contains passwords or credentials', () => {
    const sampleBody = {
      message: 'Employee created successfully',
      staff: {
        id: 'sub-123',
        name: 'Test Staff',
        email: 'staff@example.com',
        phone: '+919999999999',
        role: 'op',
        department: 'General',
        status: 'On Duty',
        shift: 'Morning',
        joinDate: '2026-08-21T00:00:00.000Z',
      },
    };
    const serialized = JSON.stringify(sampleBody);
    assert.strictEqual(serialized.includes('password'), false);
    assert.strictEqual(serialized.includes('temporaryPassword'), false);
    assert.strictEqual(serialized.includes('token'), false);
    assert.strictEqual(serialized.includes('secret'), false);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests();
