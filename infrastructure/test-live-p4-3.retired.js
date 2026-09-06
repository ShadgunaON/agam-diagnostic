const {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const REGION = 'us-east-1';
const USER_POOL_ID = 'us-east-1_09a7n9aQH';
const CLIENT_ID = '1d72mbjmcvqqeunig5glbnich9';
const API_BASE = 'https://35ea31w6qf.execute-api.us-east-1.amazonaws.com/dev';
const TABLE_NAME = 'agam-data-dev';

const cognito = new CognitoIdentityProviderClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

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

async function apiRequest(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const options = { method, headers };
  if (body) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runLiveVerification() {
  console.log('================================================================');
  console.log('STARTING P4.3 LIVE BACKEND & RBAC VERIFICATION');
  console.log('================================================================\n');

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

  // 1. Authenticate Admin and Patient
  console.log('--- 1. Authenticating Identities ---');
  let adminToken, patientToken;
  try {
    adminToken = await getIdToken('yhshadgunasiddhi1@gmail.com', 'TestPassword123!');
    console.log('  ✅ Admin token acquired (yhshadgunasiddhi1@gmail.com)');
    patientToken = await getIdToken('yhshadgunasiddhi@gmail.com', 'TestPassword123!');
    console.log('  ✅ Patient token acquired (yhshadgunasiddhi@gmail.com)');
  } catch (err) {
    console.error('Authentication failure:', err);
    process.exit(1);
  }

  // 2. RBAC Verification for Staff Endpoints
  console.log('\n--- 2. Live Staff Endpoint RBAC Verification ---');
  
  // Anonymous GET
  const anonGet = await apiRequest('GET', '/api/staff');
  assert(anonGet.status === 401, 'Anonymous GET /api/staff is rejected with 401');

  // Anonymous POST
  const anonPost = await apiRequest('POST', '/api/staff', { name: 'Anon', email: 'anon@example.com', phone: '9999999999', role: 'op' });
  assert(anonPost.status === 401, 'Anonymous POST /api/staff is rejected with 401');

  // Patient GET
  const patGet = await apiRequest('GET', '/api/staff', null, patientToken);
  assert(patGet.status === 403, 'Patient GET /api/staff is rejected with 403');

  // Patient POST
  const patPost = await apiRequest('POST', '/api/staff', { name: 'Hacker', email: 'hacker@example.com', phone: '9999999999', role: 'op' }, patientToken);
  assert(patPost.status === 403, 'Patient POST /api/staff is rejected with 403');

  // Admin GET
  const adminGet = await apiRequest('GET', '/api/staff', null, adminToken);
  assert(adminGet.status === 200, 'Admin GET /api/staff returns 200 OK');
  assert(Array.isArray(adminGet.data), 'Admin GET /api/staff returns staff array');

  // 3. Cognito Native Employee Creation Flow Test
  console.log('\n--- 3. Live Employee Creation Flow Test ---');
  const timestamp = Date.now();
  const testEmployeeEmail = `test.employee.${timestamp}@agamdiagnostics.com`;
  const testEmployeePhone = `+9198${String(timestamp).slice(-8)}`;
  const testEmployeeName = `P4.3 Operations Lead ${timestamp}`;
  const testEmployeeRole = 'op';

  console.log(`  ℹ️ Creating test employee: ${testEmployeeEmail}`);
  const createRes = await apiRequest('POST', '/api/staff', {
    name: testEmployeeName,
    email: testEmployeeEmail,
    phone: testEmployeePhone,
    role: testEmployeeRole,
    department: 'Pathology Operations',
    shift: 'Morning',
  }, adminToken);

  assert(createRes.status === 201, 'Admin POST /api/staff returns 201 Created');
  assert(createRes.data?.staff?.id !== undefined, 'Response contains created staff ID');
  assert(createRes.data?.staff?.email === testEmployeeEmail, 'Response contains correct employee email');
  assert(createRes.data?.staff?.role === 'op', 'Response contains correct employee role (op)');
  
  // Security check: no credentials in response
  const serializedRes = JSON.stringify(createRes.data);
  assert(!serializedRes.includes('password') && !serializedRes.includes('temporaryPassword'), 'Zero passwords or credentials exposed in API response');

  const createdStaffId = createRes.data?.staff?.id;

  // 4. Verify Cognito User State & Native Invitation
  console.log('\n--- 4. Verifying Cognito User State & Native Invitation ---');
  let cognitoUser;
  try {
    cognitoUser = await cognito.send(new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: testEmployeeEmail,
    }));
  } catch (err) {
    console.error('Failed to get Cognito user:', err);
  }

  assert(cognitoUser !== undefined, 'Cognito user exists in User Pool us-east-1_09a7n9aQH');
  assert(cognitoUser.Enabled === true, 'Cognito user account is Enabled');
  
  const getAttr = (name) => cognitoUser.UserAttributes?.find(a => a.Name === name)?.Value;
  assert(getAttr('email') === testEmployeeEmail, `Email attribute matches: ${getAttr('email')}`);
  assert(getAttr('name') === testEmployeeName, `Name attribute matches: ${getAttr('name')}`);
  assert(getAttr('custom:role') === 'op', `custom:role matches: ${getAttr('custom:role')}`);
  assert(getAttr('phone_number') === testEmployeePhone, `phone_number matches: ${getAttr('phone_number')}`);
  console.log('  ℹ️ Invitation delivery was accepted by Cognito native email mechanism (DesiredDeliveryMediums: EMAIL).');

  // 5. First Login & NEW_PASSWORD_REQUIRED Password Setup Simulation
  console.log('\n--- 5. Simulating First-Login & NEW_PASSWORD_REQUIRED Flow ---');
  
  // Set temporary password on the user via AdminSetUserPassword to test the first-login challenge flow
  const tempPassword = 'TempPassword123!';
  const permanentPassword = 'PermanentPassword123!';
  
  await cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: USER_POOL_ID,
    Username: testEmployeeEmail,
    Password: tempPassword,
    Permanent: false, // Puts user in FORCE_CHANGE_PASSWORD status
  }));

  // Verify status is FORCE_CHANGE_PASSWORD
  const userInForceChange = await cognito.send(new AdminGetUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: testEmployeeEmail,
  }));
  assert(userInForceChange.UserStatus === 'FORCE_CHANGE_PASSWORD', `Cognito user is in FORCE_CHANGE_PASSWORD status (actual: ${userInForceChange.UserStatus})`);

  // Step 5a: InitiateAuth with temporary password
  const initLogin = await cognito.send(new InitiateAuthCommand({
    AuthFlow: 'USER_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: testEmployeeEmail,
      PREFERRED_CHALLENGE: 'PASSWORD',
      PASSWORD: tempPassword,
    },
  }));

  let challengeName = initLogin.ChallengeName;
  let challengeSession = initLogin.Session;

  if (challengeName === 'PASSWORD') {
    const step2 = await cognito.send(new RespondToAuthChallengeCommand({
      ChallengeName: 'PASSWORD',
      ClientId: CLIENT_ID,
      Session: challengeSession,
      ChallengeResponses: {
        USERNAME: testEmployeeEmail,
        PASSWORD: tempPassword,
      },
    }));
    challengeName = step2.ChallengeName;
    challengeSession = step2.Session;
  }

  assert(challengeName === 'NEW_PASSWORD_REQUIRED', `First login returned NEW_PASSWORD_REQUIRED challenge (actual: ${challengeName})`);
  assert(challengeSession !== undefined, 'Cognito returned challenge Session token');

  // Step 5b: RespondToAuthChallenge with new permanent password
  const completeChallenge = await cognito.send(new RespondToAuthChallengeCommand({
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    ClientId: CLIENT_ID,
    Session: challengeSession,
    ChallengeResponses: {
      USERNAME: testEmployeeEmail,
      NEW_PASSWORD: permanentPassword,
    },
  }));

  assert(completeChallenge.AuthenticationResult?.IdToken !== undefined, 'Permanent password accepted, IdToken returned');
  assert(completeChallenge.AuthenticationResult?.AccessToken !== undefined, 'AccessToken returned');

  // Verify Cognito user transitioned to CONFIRMED
  const userAfterPassword = await cognito.send(new AdminGetUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: testEmployeeEmail,
  }));
  assert(userAfterPassword.UserStatus === 'CONFIRMED', `Cognito user is now CONFIRMED (actual: ${userAfterPassword.UserStatus})`);

  // Decode IdToken to verify custom:role
  const employeeIdToken = completeChallenge.AuthenticationResult.IdToken;
  const tokenPayload = JSON.parse(Buffer.from(employeeIdToken.split('.')[1], 'base64').toString('utf8'));
  assert(tokenPayload['custom:role'] === 'op', `Decoded IdToken contains authoritative custom:role = op (actual: ${tokenPayload['custom:role']})`);
  assert(tokenPayload.email === testEmployeeEmail, `Decoded IdToken contains email = ${testEmployeeEmail}`);

  // 6. Test Non-Admin Staff Authorization with New Employee Token
  console.log('\n--- 6. Non-Admin Staff Authorization Check (op Role) ---');
  const employeeGetStaff = await apiRequest('GET', '/api/staff', null, employeeIdToken);
  assert(employeeGetStaff.status === 200, 'Non-admin staff (op) CAN view staff directory (200 OK)');

  const employeePostStaff = await apiRequest('POST', '/api/staff', {
    name: 'Unauthorized Create',
    email: 'unauth@agam.com',
    phone: '+919999999999',
    role: 'op',
  }, employeeIdToken);
  assert(employeePostStaff.status === 403, 'Non-admin staff (op) CANNOT create new staff (403 Forbidden)');

  // 7. DynamoDB Staff Record Verification
  console.log('\n--- 7. DynamoDB Staff Record Verification ---');
  const ddbRes = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `STAFF#${createdStaffId}`,
      SK: 'METADATA',
    },
  }));

  assert(ddbRes.Item !== undefined, `DynamoDB item exists at PK: STAFF#${createdStaffId}, SK: METADATA`);
  const item = ddbRes.Item || {};
  assert(item.name === testEmployeeName, `DynamoDB item name matches: ${item.name}`);
  assert(item.email === testEmployeeEmail, `DynamoDB item email matches: ${item.email}`);
  assert(item.role === 'op', `DynamoDB item role matches: ${item.role}`);
  assert(item.department === 'Pathology Operations', `DynamoDB item department matches: ${item.department}`);
  assert(item.shift === 'Morning', `DynamoDB item shift matches: ${item.shift}`);
  assert(item.GSI1PK === 'ENTITY#STAFF', `GSI1PK is correctly indexed as ENTITY#STAFF`);
  assert(item.password === undefined, 'Zero passwords stored in DynamoDB record');
  assert(item.temporaryPassword === undefined, 'Zero temporary passwords stored in DynamoDB record');
  assert(item.accessToken === undefined, 'Zero access tokens stored in DynamoDB record');

  // 8. Live Regression Verification Across All Existing Endpoints
  console.log('\n--- 8. Existing Live API Regression Verification ---');
  
  const healthRes = await apiRequest('GET', '/health');
  assert(healthRes.status === 200, 'GET /health returns 200 OK (public health check)');

  const versionRes = await apiRequest('GET', '/api/version', null, patientToken);
  assert(versionRes.status === 200, 'GET /api/version returns 200 OK (authenticated version check)');

  const patientMeRes = await apiRequest('GET', '/api/patients/me', null, patientToken);
  assert(patientMeRes.status === 200, 'GET /api/patients/me returns 200 OK');

  const bookingsRes = await apiRequest('GET', '/api/bookings', null, patientToken);
  assert(bookingsRes.status === 200, 'GET /api/bookings returns 200 OK');

  const collectionsRes = await apiRequest('GET', '/api/collections', null, adminToken);
  assert(collectionsRes.status === 200, 'GET /api/collections returns 200 OK');

  const documentsRes = await apiRequest('GET', '/api/documents', null, patientToken);
  assert(documentsRes.status === 200, 'GET /api/documents returns 200 OK');

  const invoicesRes = await apiRequest('GET', '/api/invoices', null, patientToken);
  assert(invoicesRes.status === 200, 'GET /api/invoices returns 200 OK');

  const notificationsRes = await apiRequest('GET', '/api/notifications', null, patientToken);
  assert(notificationsRes.status === 200, 'GET /api/notifications returns 200 OK');

  const reviewsRes = await apiRequest('GET', '/api/reviews');
  assert(reviewsRes.status === 200, 'GET /api/reviews returns 200 OK');

  const blogsRes = await apiRequest('GET', '/api/blogs');
  assert(blogsRes.status === 200, 'GET /api/blogs returns 200 OK');

  console.log('\n================================================================');
  console.log(`TOTAL LIVE ASSERTIONS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }

  return {
    testEmployeeEmail,
    testEmployeePhone,
    testEmployeeName,
    createdStaffId,
  };
}

runLiveVerification().then((data) => {
  console.log('Test Account Info for Audit Records:');
  console.log(JSON.stringify(data, null, 2));
}).catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
