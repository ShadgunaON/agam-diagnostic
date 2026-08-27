const { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const REGION = 'us-east-1';
const CLIENT_ID = '1d72mbjmcvqqeunig5glbnich9';
const API_BASE = 'https://35ea31w6qf.execute-api.us-east-1.amazonaws.com/dev';
const TABLE_NAME = 'agam-data-dev';

const cognito = new CognitoIdentityProviderClient({ region: REGION });
const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

async function getIdToken(username, password) {
  const initCommand = new InitiateAuthCommand({
    AuthFlow: 'USER_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PREFERRED_CHALLENGE: 'PASSWORD',
      PASSWORD: password,
    },
  });

  const initResponse = await cognito.send(initCommand);

  if (initResponse.AuthenticationResult?.IdToken) {
    return initResponse.AuthenticationResult.IdToken;
  }

  if (initResponse.ChallengeName === 'PASSWORD') {
    const challengeCommand = new RespondToAuthChallengeCommand({
      ChallengeName: 'PASSWORD',
      ClientId: CLIENT_ID,
      Session: initResponse.Session,
      ChallengeResponses: {
        USERNAME: username,
        PASSWORD: password,
      },
    });
    const challengeResponse = await cognito.send(challengeCommand);
    return challengeResponse.AuthenticationResult?.IdToken;
  }

  throw new Error(`Unexpected challenge: ${initResponse.ChallengeName}`);
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

async function runLiveEndToEndReviewsTest() {
  console.log('====================================================');
  console.log('STARTING P3C.10 FULL END-TO-END LIVE REVIEWS SUITE');
  console.log('====================================================\n');

  let idToken;
  try {
    idToken = await getIdToken('yhshadgunasiddhi1@gmail.com', 'TestPassword123!');
    console.log('✅ Acquired Cognito ID Token for test user');
  } catch (err) {
    console.error('❌ Failed to authenticate:', err.message);
    process.exit(1);
  }

  const claims = parseJwt(idToken);
  const testSub = claims.sub;
  console.log(`Test user sub: ${testSub}`);

  const authHeaders = {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json',
  };

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  console.log('\n--- 1. PUBLIC REVIEWS API VERIFICATION ---');

  // Test 1: Public Reviews (unauthenticated)
  const publicRes = await fetch(`${API_BASE}/api/reviews`);
  const publicPayload = await publicRes.json().catch(() => null);
  const publicReviews = publicPayload?.data || publicPayload;
  assert(publicRes.status === 200, 'Public GET /api/reviews returns 200 OK');
  assert(Array.isArray(publicReviews), 'Public GET returns an array of reviews');

  // Test 2: Anonymous Review Creation -> 401
  const anonPostRes = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId: 'bk-test-999', rating: 5, comment: 'Anonymous review should fail' }),
  });
  assert(anonPostRes.status === 401, 'Anonymous POST /api/reviews returns 401 Unauthorized');

  console.log('\n--- 2. BOOKING ELIGIBILITY & ISOLATION ---');

  // 1. Create a Completed Booking Fixture for test user in DynamoDB
  const completedBookingId = `BK-P3C10-COMP-${Date.now()}`;
  const now = new Date().toISOString();
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `BOOKING#${completedBookingId}`,
        SK: 'METADATA',
        GSI1PK: 'ENTITY#BOOKING',
        GSI1SK: `BOOKING#${now}#${completedBookingId}`,
        GSI2PK: `PATIENT#pat_${testSub}`,
        GSI2SK: `BOOKING#${now}#${completedBookingId}`,
        id: completedBookingId,
        patientId: `pat_${testSub}`,
        ownerSub: testSub,
        status: 'Completed',
        createdAt: now,
        updatedAt: now,
      },
    })
  );

  // 2. Create a Pending Booking Fixture for test user
  const pendingBookingId = `BK-P3C10-PEND-${Date.now()}`;
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `BOOKING#${pendingBookingId}`,
        SK: 'METADATA',
        id: pendingBookingId,
        patientId: `pat_${testSub}`,
        ownerSub: testSub,
        status: 'Pending',
        createdAt: now,
        updatedAt: now,
      },
    })
  );

  // Test 4: Attempt review for non-completed booking -> 400 Bad Request
  const pendingRevRes = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      bookingId: pendingBookingId,
      rating: 5,
      comment: 'Attempting review on pending service should fail.',
    }),
  });
  assert(pendingRevRes.status === 400, 'POST /api/reviews on pending booking returns 400 Bad Request');

  // Test 5: Cross-patient booking review attempt -> 403 Forbidden
  const foreignBookingId = `BK-P3C10-FOREIGN-${Date.now()}`;
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `BOOKING#${foreignBookingId}`,
        SK: 'METADATA',
        id: foreignBookingId,
        patientId: 'pat_foreign_user_9999',
        ownerSub: 'foreign-sub-9999',
        status: 'Completed',
        createdAt: now,
        updatedAt: now,
      },
    })
  );
  const foreignRevRes = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      bookingId: foreignBookingId,
      rating: 5,
      comment: 'Attempting review on foreign booking should fail.',
    }),
  });
  assert(foreignRevRes.status === 403, 'POST /api/reviews on foreign booking returns 403 Forbidden');

  console.log('\n--- 3. AUTHENTICATED REVIEW SUBMISSION & DUPLICATE ATOMICITY ---');

  // Test 3: Authenticated review creation for completed booking
  const reviewRes = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      bookingId: completedBookingId,
      rating: 5,
      comment: 'Agam Diagnostics provided outstanding home collection service. Phlebotomist was punctual and gentle!',
      displayName: 'Verified Test Patient',
    }),
  });
  const reviewPayload = await reviewRes.json().catch(() => null);
  const reviewData = reviewPayload?.data || reviewPayload;
  assert(reviewRes.status === 201, 'POST /api/reviews for completed booking returns 201 Created');
  assert(reviewData.status === 'Pending', 'Created review initial status is forced to Pending');
  assert(reviewData.verified === true, 'Created review verified flag is forced to true');
  assert(reviewData.ownerSub === testSub, 'Created review ownerSub is derived from Cognito');

  const createdReviewId = reviewData.id;

  // Test 6: Duplicate Review for same completed booking -> 409
  const dupRes = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      bookingId: completedBookingId,
      rating: 4,
      comment: 'Second attempt to review the same booking should fail atomically.',
    }),
  });
  assert(dupRes.status === 409, 'Duplicate review returns 409 DUPLICATE_REVIEW');

  // Test 7: Patient moderation attempt -> 403
  const patientModRes = await fetch(`${API_BASE}/api/reviews/${createdReviewId}/status`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ status: 'Approved' }),
  });
  assert(patientModRes.status === 403, 'Patient PUT /api/reviews/{id}/status returns 403 Forbidden');

  console.log('\n--- 4. MODERATION & PUBLIC VISIBILITY CYCLE ---');

  // Test 8: Simulate Moderation in DB / Admin
  const repo = require('../src/repositories/dynamo-review');
  await repo.updateStatus(createdReviewId, 'Approved');
  console.log('  ℹ️ Moderated review to Approved state');

  // Test 9: Public Visibility after approval
  const publicAfterApprove = await fetch(`${API_BASE}/api/reviews`);
  const publicApprovePayload = await publicAfterApprove.json().catch(() => null);
  const publicApproveList = publicApprovePayload?.data || publicApprovePayload;
  const approvedItem = Array.isArray(publicApproveList) ? publicApproveList.find(r => r.id === createdReviewId) : null;
  assert(approvedItem !== null && approvedItem !== undefined, 'Approved review is publicly visible in GET /api/reviews');
  if (approvedItem) {
    assert(approvedItem.ownerSub === undefined, 'Publicly returned review strips ownerSub');
    assert(approvedItem.patientId === undefined, 'Publicly returned review strips patientId');
    assert(approvedItem.rating === 5, 'Publicly returned review preserves rating');
  }

  // Test 10: Rejection removes from public visibility
  await repo.updateStatus(createdReviewId, 'Rejected');
  console.log('  ℹ️ Moderated review to Rejected state');

  const publicAfterReject = await fetch(`${API_BASE}/api/reviews`);
  const publicRejectPayload = await publicAfterReject.json().catch(() => null);
  const publicRejectList = publicRejectPayload?.data || publicRejectPayload;
  const rejectedItem = Array.isArray(publicRejectList) ? publicRejectList.find(r => r.id === createdReviewId) : null;
  assert(rejectedItem === null || rejectedItem === undefined, 'Rejected review is NOT visible in public GET /api/reviews');

  // Cleanup test fixtures
  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: `BOOKING#${completedBookingId}`, SK: 'METADATA' } }));
  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: `BOOKING#${pendingBookingId}`, SK: 'METADATA' } }));
  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: `BOOKING#${foreignBookingId}`, SK: 'METADATA' } }));
  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: `REVIEW#${createdReviewId}`, SK: 'METADATA' } }));
  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: `BOOKING#${completedBookingId}#REVIEW`, SK: 'METADATA' } }));
  console.log('  ℹ️ Cleaned up test fixtures safely');

  console.log('\n--- 5. REGRESSION SUITE (P3C.1 - P3C.9) ---');

  const verRes = await fetch(`${API_BASE}/api/version`, { headers: authHeaders });
  const verPayload = await verRes.json().catch(() => null);
  const verData = verPayload?.data || verPayload;
  assert(verRes.status === 200, 'GET /api/version returns 200 OK');
  assert(verData && verData.service === 'agam-api', 'Version service is agam-api');

  const patRes = await fetch(`${API_BASE}/api/patients/me`, { headers: authHeaders });
  assert(patRes.status === 200, 'GET /api/patients/me returns 200 OK');

  const bookRes = await fetch(`${API_BASE}/api/bookings`, { headers: authHeaders });
  assert(bookRes.status === 200, 'GET /api/bookings returns 200 OK');

  const colRes = await fetch(`${API_BASE}/api/collections`, { headers: authHeaders });
  assert(colRes.status === 200, 'GET /api/collections returns 200 OK');

  const docRes = await fetch(`${API_BASE}/api/documents`, { headers: authHeaders });
  assert(docRes.status === 200, 'GET /api/documents returns 200 OK');

  const invRes = await fetch(`${API_BASE}/api/invoices`, { headers: authHeaders });
  assert(invRes.status === 200, 'GET /api/invoices returns 200 OK');

  const notifRes = await fetch(`${API_BASE}/api/notifications`, { headers: authHeaders });
  assert(notifRes.status === 200, 'GET /api/notifications returns 200 OK');

  console.log('\n====================================================');
  console.log(`LIVE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runLiveEndToEndReviewsTest();
