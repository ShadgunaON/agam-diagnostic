const { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } = require('@aws-sdk/client-cognito-identity-provider');

const REGION = 'us-east-1';
const CLIENT_ID = '1d72mbjmcvqqeunig5glbnich9';
const API_BASE = 'https://35ea31w6qf.execute-api.us-east-1.amazonaws.com/dev';

const cognito = new CognitoIdentityProviderClient({ region: REGION });

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

async function runLiveNotificationTests() {
  console.log('====================================================');
  console.log('STARTING P3C.9 LIVE NOTIFICATION & REGRESSION SUITE');
  console.log('====================================================\n');

  let idToken;
  try {
    idToken = await getIdToken('yhshadgunasiddhi1@gmail.com', 'TestPassword123!');
    console.log('✅ Successfully acquired Cognito ID Token for authenticated test user');
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

  console.log('\n--- 1. NOTIFICATION ENDPOINT VERIFICATION ---');

  // 1. Anonymous request
  const anonRes = await fetch(`${API_BASE}/api/notifications`);
  assert(anonRes.status === 401, 'Anonymous GET /api/notifications returns 401 Unauthorized');

  // 2. Authenticated user GET notifications
  const userNotifRes = await fetch(`${API_BASE}/api/notifications`, { headers: authHeaders });
  const userNotifPayload = await userNotifRes.json().catch(() => null);
  const userNotifs = userNotifPayload?.data || userNotifPayload;
  assert(userNotifRes.status === 200, 'Authenticated GET /api/notifications returns 200 OK');
  assert(Array.isArray(userNotifs), 'Authenticated GET returns an array of notifications');

  // 3. Foreign user isolation
  const foreignRes = await fetch(`${API_BASE}/api/notifications?userId=00000000-0000-0000-0000-000000000000`, { headers: authHeaders });
  assert(foreignRes.status === 403, 'GET /api/notifications?userId=<foreign-user> returns 403 Forbidden');

  // 4. Nonexistent notification mark-as-read
  const nonExistRes = await fetch(`${API_BASE}/api/notifications/NOTIF-NONEXISTENT-9999/read`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({}),
  });
  assert(nonExistRes.status === 404, 'PUT /api/notifications/NOTIF-NONEXISTENT/read returns 404 Not Found');

  // 5. Patient creates self notification with explicit userId matching own sub
  const selfNotifRes = await fetch(`${API_BASE}/api/notifications`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      userId: testSub,
      title: 'Live Test Alert',
      message: 'Self-directed live test notification verification.',
    }),
  });
  const selfNotifPayload = await selfNotifRes.json().catch(() => null);
  const createdNotif = selfNotifPayload?.data || selfNotifPayload;
  assert(selfNotifRes.status === 200 || selfNotifRes.status === 201, 'POST /api/notifications self-notification returns 200/201');
  assert(createdNotif && createdNotif.id, 'Self-notification created with valid ID');

  // 6. Mark own notification as read
  if (createdNotif && createdNotif.id) {
    const markReadRes = await fetch(`${API_BASE}/api/notifications/${createdNotif.id}/read`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({}),
    });
    const markReadPayload = await markReadRes.json().catch(() => null);
    const markReadData = markReadPayload?.data || markReadPayload;
    assert(markReadRes.status === 200, 'PUT /api/notifications/<own-id>/read returns 200 OK');
    assert(markReadData && markReadData.isRead === true, 'Mark-as-read sets isRead to true');
  }

  // 7. Patient attempts to create notification for foreign user
  const foreignPostRes = await fetch(`${API_BASE}/api/notifications`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      userId: '00000000-0000-0000-0000-000000000000',
      title: 'Spam Alert',
      message: 'Testing unauthorized foreign targeting.',
    }),
  });
  assert(foreignPostRes.status === 403, 'POST /api/notifications targeting foreign user returns 403 Forbidden');

  console.log('\n--- 2. REGRESSION TESTS (P3C.1 - P3C.8) ---');

  // GET /api/version (Authenticated)
  const verRes = await fetch(`${API_BASE}/api/version`, { headers: authHeaders });
  const verPayload = await verRes.json().catch(() => null);
  const verData = verPayload?.data || verPayload;
  assert(verRes.status === 200, 'GET /api/version returns 200 OK');
  assert(verData && verData.service === 'agam-api', 'Version service is agam-api');

  // GET /api/patients/me
  const patRes = await fetch(`${API_BASE}/api/patients/me`, { headers: authHeaders });
  assert(patRes.status === 200, 'GET /api/patients/me returns 200 OK');

  // GET /api/bookings
  const bookRes = await fetch(`${API_BASE}/api/bookings`, { headers: authHeaders });
  assert(bookRes.status === 200, 'GET /api/bookings returns 200 OK');

  // GET /api/collections
  const colRes = await fetch(`${API_BASE}/api/collections`, { headers: authHeaders });
  assert(colRes.status === 200, 'GET /api/collections returns 200 OK');

  // GET /api/documents
  const docRes = await fetch(`${API_BASE}/api/documents`, { headers: authHeaders });
  assert(docRes.status === 200, 'GET /api/documents returns 200 OK');

  // GET /api/invoices
  const invRes = await fetch(`${API_BASE}/api/invoices`, { headers: authHeaders });
  assert(invRes.status === 200, 'GET /api/invoices returns 200 OK');

  console.log('\n====================================================');
  console.log(`LIVE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runLiveNotificationTests();
