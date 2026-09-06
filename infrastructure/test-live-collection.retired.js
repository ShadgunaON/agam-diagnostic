const { CognitoIdentityProviderClient, InitiateAuthCommand } = require('@aws-sdk/client-cognito-identity-provider');

const REGION = 'us-east-1';
const CLIENT_ID = '1d72mbjmcvqqeunig5glbnich9';
const API_BASE = 'https://35ea31w6qf.execute-api.us-east-1.amazonaws.com/dev';

const cognito = new CognitoIdentityProviderClient({ region: REGION });

const { RespondToAuthChallengeCommand } = require('@aws-sdk/client-cognito-identity-provider');

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

async function runTests() {
  console.log('--- 1. Authenticating test user via Cognito ---');
  let idToken;
  try {
    idToken = await getIdToken('yhshadgunasiddhi1@gmail.com', 'TestPassword123!');
    console.log('Successfully acquired Cognito ID Token');
  } catch (err) {
    console.error('Failed to authenticate:', err.message);
    process.exit(1);
  }

  const headers = {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json',
  };

  async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`, { headers });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  }

  async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  }

  async function apiPut(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  }

  console.log('\n--- 2. Testing GET /api/version (Regression) ---');
  const verRes = await apiGet('/api/version');
  console.log('GET /api/version -> Status:', verRes.status, verRes.data);

  console.log('\n--- 3. Testing GET /api/patients/me (Regression) ---');
  const meRes = await apiGet('/api/patients/me');
  console.log('GET /api/patients/me -> Status:', meRes.status, 'Patient ID:', meRes.data?.id);

  const myPatientId = meRes.data?.id;

  console.log('\n--- 4. Testing GET /api/bookings (Regression) ---');
  const bookRes = await apiGet('/api/bookings');
  console.log('GET /api/bookings -> Status:', bookRes.status, 'Total:', Array.isArray(bookRes.data) ? bookRes.data.length : bookRes.data);

  console.log('\n--- 5. Testing GET /api/collections (Patient Listing) ---');
  const colRes = await apiGet('/api/collections');
  console.log('GET /api/collections -> Status:', colRes.status, 'Total:', Array.isArray(colRes.data) ? colRes.data.length : colRes.data);

  if (myPatientId) {
    console.log(`\n--- 6. Testing GET /api/collections?patientId=${myPatientId} (Authorized) ---`);
    const myColRes = await apiGet(`/api/collections?patientId=${myPatientId}`);
    console.log(`GET /api/collections?patientId=${myPatientId} -> Status:`, myColRes.status, 'Total:', Array.isArray(myColRes.data) ? myColRes.data.length : myColRes.data);
  }

  console.log('\n--- 7. Testing GET /api/collections?patientId=pat_unauthorized_999 (Unauthorized) ---');
  const unauthColRes = await apiGet('/api/collections?patientId=pat_unauthorized_999');
  console.log('GET /api/collections?patientId=pat_unauthorized_999 -> Status:', unauthColRes.status, unauthColRes.data);

  console.log('\n--- 8. Testing GET /api/collections/COL-NONEXISTENT (Not Found) ---');
  const notFoundRes = await apiGet('/api/collections/COL-NONEXISTENT');
  console.log('GET /api/collections/COL-NONEXISTENT -> Status:', notFoundRes.status, notFoundRes.data);

  console.log('\n--- 9. Testing POST /api/collections (Create Task) ---');
  const newColPayload = {
    type: 'Home Collection',
    patient: 'Test Patient',
    time: '08:00 AM - 09:00 AM',
    date: '2026-08-20',
    address: '123 Test Street, Whitefield, Bengaluru',
    tests: ['Complete Blood Count (CBC)'],
  };
  const createColRes = await apiPost('/api/collections', newColPayload);
  const createdItem = createColRes.data?.data;
  console.log('POST /api/collections -> Status:', createColRes.status, 'Created ID:', createdItem?.id, 'Status:', createdItem?.status);

  const createdId = createdItem?.id;

  if (createdId) {
    console.log(`\n--- 10. Testing GET /api/collections/${createdId} (Single Lookup) ---`);
    const singleRes = await apiGet(`/api/collections/${createdId}`);
    console.log(`GET /api/collections/${createdId} -> Status:`, singleRes.status, 'ID:', singleRes.data?.data?.id, 'Status:', singleRes.data?.data?.status);

    console.log('\n--- 11. Testing Invalid Lifecycle Transition (Unassigned -> Completed by Patient) ---');
    const invalidPutRes = await apiPut(`/api/collections/${createdId}`, { status: 'Completed' });
    console.log('PUT /api/collections (Invalid Jump) -> Status:', invalidPutRes.status, invalidPutRes.data);
  }

  console.log('\n========================================');
  console.log('LIVE VERIFICATION TESTS COMPLETE');
  console.log('========================================');
}

runTests();
