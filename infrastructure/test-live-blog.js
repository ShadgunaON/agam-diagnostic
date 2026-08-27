const { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const REGION = 'us-east-1';
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

async function runLiveBlogVerification() {
  console.log('================================================================');
  console.log('STARTING P3C.12 BLOGS & CONTENT MANAGEMENT LIVE VERIFICATION');
  console.log('================================================================\n');

  let passedAssertions = 0;
  let failedAssertions = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedAssertions++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failedAssertions++;
    }
  }

  // 1. Authenticate Admin and Patient
  console.log('--- 1. Authenticating Admin & Patient Identities ---');
  let adminToken, patientToken;
  try {
    adminToken = await getIdToken('yhshadgunasiddhi1@gmail.com', 'TestPassword123!');
    console.log('  ✅ Admin token acquired');
    patientToken = await getIdToken('yhshadgunasiddhi@gmail.com', 'TestPassword123!');
    console.log('  ✅ Patient token acquired');
  } catch (err) {
    console.error('Authentication failure:', err);
    process.exit(1);
  }

  const adminHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  };

  const patientHeaders = {
    'Authorization': `Bearer ${patientToken}`,
    'Content-Type': 'application/json',
  };

  const publicHeaders = {
    'Content-Type': 'application/json',
  };

  async function apiRequest(method, path, body = null, headers = publicHeaders) {
    const options = {
      method,
      headers,
    };
    if (body) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${path}`, options);
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  }

  // 2. Public Unauthenticated Endpoint Verification
  console.log('\n--- 2. Public Unauthenticated Blog Catalog Verification ---');
  const publicListRes = await apiRequest('GET', '/api/blogs', null, publicHeaders);
  assert(publicListRes.status === 200, 'GET /api/blogs returns 200 OK for anonymous public user');
  const publicArticles = Array.isArray(publicListRes.data?.data) ? publicListRes.data.data : (Array.isArray(publicListRes.data) ? publicListRes.data : []);
  console.log(`  ℹ️ Found ${publicArticles.length} public published articles`);
  
  if (publicArticles.length > 0) {
    const firstPub = publicArticles[0];
    assert(firstPub.status === 'Published', 'Public article status is Published');
    assert(firstPub.ownerSub === undefined, 'Public article excludes ownerSub');
    assert(firstPub.createdBy === undefined, 'Public article excludes createdBy');
    assert(firstPub.updatedBy === undefined, 'Public article excludes updatedBy');
    assert(firstPub.PK === undefined, 'Public article excludes DynamoDB PK');
    assert(firstPub.SK === undefined, 'Public article excludes DynamoDB SK');
    assert(firstPub.GSI1PK === undefined, 'Public article excludes DynamoDB GSI1PK');
    assert(firstPub.GSI2PK === undefined, 'Public article excludes DynamoDB GSI2PK');
  }

  // 3. Complete Admin CRUD Lifecycle
  console.log('\n--- 3. Admin Blog Article CRUD Lifecycle ---');
  const testSlug = `p3c12-live-test-${Date.now()}`;
  const newArticlePayload = {
    title: 'P3C12 Live Test Article: Genomic Medicine Breakthroughs',
    slug: testSlug,
    category: 'Diagnostics',
    description: 'A temporary test article verifying production single-table persistence.',
    content: '<p>Genomic medicine represents the frontier of modern diagnostics.</p>',
    author: 'Live Verification Admin',
    status: 'Draft',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118',
  };

  // CREATE (Draft)
  const createRes = await apiRequest('POST', '/api/blogs', newArticlePayload, adminHeaders);
  assert(createRes.status === 201, `Admin POST /api/blogs creates article (Status: ${createRes.status})`);
  const createdArticle = createRes.data?.data || createRes.data;
  assert(Boolean(createdArticle?.id), `Article ID generated server-side (${createdArticle?.id})`);
  assert(createdArticle?.status === 'Draft', 'Article created with status Draft');
  assert(createdArticle?.slug === testSlug, `Article slug matches ${testSlug}`);
  assert(Boolean(createdArticle?.createdBy), `Server authoritatively stamps createdBy (${createdArticle?.createdBy})`);
  assert(Boolean(createdArticle?.ownerSub), `Server authoritatively stamps ownerSub (${createdArticle?.ownerSub})`);

  const testArticleId = createdArticle?.id;

  // READ by ID (Admin)
  const adminGetRes = await apiRequest('GET', `/api/blogs/${testArticleId}`, null, adminHeaders);
  assert(adminGetRes.status === 200, `Admin GET /api/blogs/${testArticleId} retrieves draft article`);
  assert(adminGetRes.data?.data?.id === testArticleId || adminGetRes.data?.id === testArticleId, 'Retrieved article matches ID');

  // READ by Slug (Admin)
  const adminGetSlugRes = await apiRequest('GET', `/api/blogs/${testSlug}`, null, adminHeaders);
  assert(adminGetSlugRes.status === 200, `Admin GET /api/blogs/${testSlug} retrieves draft article by slug`);

  // READ Draft by Public (Must return 404)
  const publicDraftSlugRes = await apiRequest('GET', `/api/blogs/${testSlug}`, null, publicHeaders);
  assert(publicDraftSlugRes.status === 404, 'Public GET /api/blogs/{draft-slug} returns 404 Not Found (Draft isolated)');

  const patientDraftSlugRes = await apiRequest('GET', `/api/blogs/${testSlug}`, null, patientHeaders);
  assert(patientDraftSlugRes.status === 404, 'Patient GET /api/blogs/{draft-slug} returns 404 Not Found');

  // 4. Draft -> Published Lifecycle Transition
  console.log('\n--- 4. Draft -> Published Lifecycle Transition ---');
  const publishUpdates = {
    status: 'Published',
    title: 'P3C12 Live Test Article: Genomic Medicine Breakthroughs (Published)',
  };
  const publishRes = await apiRequest('PUT', `/api/blogs/${testArticleId}`, publishUpdates, adminHeaders);
  assert(publishRes.status === 200, `Admin PUT /api/blogs/${testArticleId} updates status to Published`);
  const publishedArticle = publishRes.data?.data || publishRes.data;
  assert(publishedArticle?.status === 'Published', 'Article status updated to Published');
  assert(Boolean(publishedArticle?.publishedAt), 'Server authoritatively stamps publishedAt timestamp');

  // Public READ Published Article by Slug
  const publicPublishedSlugRes = await apiRequest('GET', `/api/blogs/${testSlug}`, null, publicHeaders);
  assert(publicPublishedSlugRes.status === 200, `Public GET /api/blogs/${testSlug} returns 200 OK when Published`);
  const pubItem = publicPublishedSlugRes.data?.data || publicPublishedSlugRes.data;
  assert(pubItem?.title === 'P3C12 Live Test Article: Genomic Medicine Breakthroughs (Published)', 'Public receives updated title');
  assert(pubItem?.ownerSub === undefined, 'Public detail view excludes ownerSub');
  assert(pubItem?.createdBy === undefined, 'Public detail view excludes createdBy');

  // 5. Published -> Draft Lifecycle Transition (Unpublish)
  console.log('\n--- 5. Published -> Draft Lifecycle Transition (Unpublish) ---');
  const unpublishUpdates = {
    status: 'Draft',
  };
  const unpublishRes = await apiRequest('PUT', `/api/blogs/${testArticleId}`, unpublishUpdates, adminHeaders);
  assert(unpublishRes.status === 200, `Admin PUT /api/blogs/${testArticleId} unpublishes article to Draft`);

  // Public READ immediately returns 404 after unpublish
  const publicUnpublishedRes = await apiRequest('GET', `/api/blogs/${testSlug}`, null, publicHeaders);
  assert(publicUnpublishedRes.status === 404, 'Public GET immediately returns 404 after article is unpublished');

  // 6. Anti-Spoofing & Field-Level Immutability Verification
  console.log('\n--- 6. Anti-Spoofing & Field-Level Immutability ---');
  const spoofPayload = {
    title: 'P3C12 Spoof Attempt Test',
    PK: 'TAMPERED_PK',
    SK: 'TAMPERED_SK',
    GSI1PK: 'TAMPERED_GSI1',
    GSI2PK: 'TAMPERED_GSI2',
    createdBy: 'victim-sub-1234',
    ownerSub: 'victim-sub-1234',
    id: 'TAMPERED_ID',
  };
  const spoofRes = await apiRequest('PUT', `/api/blogs/${testArticleId}`, spoofPayload, adminHeaders);
  assert(spoofRes.status === 200, 'Update request processed successfully');

  // Verify in DynamoDB directly that partition keys and ownership remained intact
  const dbItem = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `BLOG#${testArticleId}`,
        SK: 'METADATA',
      },
    })
  );
  assert(dbItem.Item?.PK === `BLOG#${testArticleId}`, 'DynamoDB PK is untampered');
  assert(dbItem.Item?.SK === 'METADATA', 'DynamoDB SK is METADATA');
  assert(dbItem.Item?.ownerSub !== 'victim-sub-1234', 'ownerSub cannot be spoofed by client payload');
  assert(dbItem.Item?.createdBy !== 'victim-sub-1234', 'createdBy cannot be spoofed by client payload');

  // 7. Full RBAC Matrix Verification
  console.log('\n--- 7. Live RBAC Matrix Authorization Verification ---');
  
  // Patient role attempts mutations -> Must return 403 Forbidden
  const patientPostRes = await apiRequest('POST', '/api/blogs', newArticlePayload, patientHeaders);
  assert(patientPostRes.status === 403, `Patient POST /api/blogs returns 403 Forbidden (Actual: ${patientPostRes.status})`);

  const patientPutRes = await apiRequest('PUT', `/api/blogs/${testArticleId}`, { title: 'Hacked by Patient' }, patientHeaders);
  assert(patientPutRes.status === 403, `Patient PUT /api/blogs/{id} returns 403 Forbidden (Actual: ${patientPutRes.status})`);

  const patientDelRes = await apiRequest('DELETE', `/api/blogs/${testArticleId}`, null, patientHeaders);
  assert(patientDelRes.status === 403, `Patient DELETE /api/blogs/{id} returns 403 Forbidden (Actual: ${patientDelRes.status})`);

  // Anonymous unauthenticated mutations -> Must return 401 Unauthorized
  const anonPostRes = await apiRequest('POST', '/api/blogs', newArticlePayload, publicHeaders);
  assert(anonPostRes.status === 401 || anonPostRes.status === 403, `Anonymous POST /api/blogs returns 401/403 (Actual: ${anonPostRes.status})`);

  const anonPutRes = await apiRequest('PUT', `/api/blogs/${testArticleId}`, { title: 'Hacked' }, publicHeaders);
  assert(anonPutRes.status === 401 || anonPutRes.status === 403, `Anonymous PUT /api/blogs/{id} returns 401/403 (Actual: ${anonPutRes.status})`);

  const anonDelRes = await apiRequest('DELETE', `/api/blogs/${testArticleId}`, null, publicHeaders);
  assert(anonDelRes.status === 401 || anonDelRes.status === 403, `Anonymous DELETE /api/blogs/{id} returns 401/403 (Actual: ${anonDelRes.status})`);

  // 8. Clean Deletion & Cleanup
  console.log('\n--- 8. Clean Deletion & Resource Cleanup ---');
  const deleteRes = await apiRequest('DELETE', `/api/blogs/${testArticleId}`, null, adminHeaders);
  assert(deleteRes.status === 200, `Admin DELETE /api/blogs/${testArticleId} returns 200 OK`);

  // Subsequent lookups must return 404
  const postDelAdminRes = await apiRequest('GET', `/api/blogs/${testArticleId}`, null, adminHeaders);
  assert(postDelAdminRes.status === 404, 'Admin GET after deletion returns 404 Not Found');

  const postDelSlugRes = await apiRequest('GET', `/api/blogs/${testSlug}`, null, adminHeaders);
  assert(postDelSlugRes.status === 404, 'Slug lookup after deletion returns 404 Not Found');

  // Verify deletion from DynamoDB
  const verifyDbDeleted = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `BLOG#${testArticleId}`,
        SK: 'METADATA',
      },
    })
  );
  assert(!verifyDbDeleted.Item, 'DynamoDB record completely removed (0 orphans)');

  // 9. Live Cross-Domain Regression Tests
  console.log('\n--- 9. Cross-Domain Live Regression Tests ---');
  const verRes = await apiRequest('GET', '/api/version', null, adminHeaders);
  assert(verRes.status === 200, 'GET /api/version returns 200 OK');

  const meRes = await apiRequest('GET', '/api/patients/me', null, patientHeaders);
  assert(meRes.status === 200, 'GET /api/patients/me returns 200 OK');

  const bookRes = await apiRequest('GET', '/api/bookings', null, patientHeaders);
  assert(bookRes.status === 200, 'GET /api/bookings returns 200 OK');

  const colRes = await apiRequest('GET', '/api/collections', null, adminHeaders);
  assert(colRes.status === 200, 'GET /api/collections returns 200 OK');

  const docRes = await apiRequest('GET', '/api/documents', null, adminHeaders);
  assert(docRes.status === 200, 'GET /api/documents returns 200 OK');

  const invRes = await apiRequest('GET', '/api/invoices', null, adminHeaders);
  assert(invRes.status === 200, 'GET /api/invoices returns 200 OK');

  const notifRes = await apiRequest('GET', '/api/notifications', null, patientHeaders);
  assert(notifRes.status === 200, 'GET /api/notifications returns 200 OK');

  const revRes = await apiRequest('GET', '/api/reviews', null, publicHeaders);
  assert(revRes.status === 200, 'GET /api/reviews returns 200 OK');

  console.log('\n================================================================');
  console.log(`LIVE RESULTS: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
  console.log('================================================================');

  if (failedAssertions > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runLiveBlogVerification().catch((err) => {
  console.error('Fatal error running live verification:', err);
  process.exit(1);
});
