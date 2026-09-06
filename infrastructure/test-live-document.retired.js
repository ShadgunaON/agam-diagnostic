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

async function runLiveDocumentTests() {
  console.log('====================================================');
  console.log('STARTING P3C.7 LIVE DOCUMENT & REPORTS VERIFICATION');
  console.log('====================================================\n');

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

  // Regression Tests
  console.log('\n--- REGRESSION TESTS ---');
  const verRes = await apiGet('/api/version');
  console.log('GET /api/version -> Status:', verRes.status, verRes.data?.data?.service);

  const meRes = await apiGet('/api/patients/me');
  console.log('GET /api/patients/me -> Status:', meRes.status, 'Patient ID:', meRes.data?.data?.id || meRes.data?.id);

  const bookRes = await apiGet('/api/bookings');
  console.log('GET /api/bookings -> Status:', bookRes.status, 'Count:', Array.isArray(bookRes.data?.data) ? bookRes.data.data.length : 0);

  const colRes = await apiGet('/api/collections');
  console.log('GET /api/collections -> Status:', colRes.status, 'Count:', Array.isArray(colRes.data?.data) ? colRes.data.data.length : 0);

  const patientId = meRes.data?.data?.id || meRes.data?.id || 'pat_5418c478-c0d1-7019-6fda-e7a18ad58ca4';

  // TEST 1 — LIST DOCUMENTS
  console.log('\n--- TEST 1: LIST DOCUMENTS ---');
  const listDocsRes = await apiGet('/api/documents');
  console.log('GET /api/documents -> Status:', listDocsRes.status, 'Count:', Array.isArray(listDocsRes.data?.data) ? listDocsRes.data.data.length : 0);

  // TEST 2 — PATIENT-SCOPED QUERY
  console.log('\n--- TEST 2: PATIENT-SCOPED QUERY ---');
  const patientScopedRes = await apiGet(`/api/documents?patientId=${patientId}`);
  console.log(`GET /api/documents?patientId=${patientId} -> Status:`, patientScopedRes.status, 'Count:', Array.isArray(patientScopedRes.data?.data) ? patientScopedRes.data.data.length : 0);

  // TEST 3 — CROSS-PATIENT ISOLATION
  console.log('\n--- TEST 3: CROSS-PATIENT ISOLATION ---');
  const crossPatientRes = await apiGet('/api/documents?patientId=pat_unauthorized_attacker_999');
  console.log('GET /api/documents?patientId=pat_unauthorized_attacker_999 -> Status:', crossPatientRes.status, crossPatientRes.data?.error?.code);

  // TEST 4 — DOCUMENT UPLOAD INITIATION
  console.log('\n--- TEST 4: DOCUMENT UPLOAD INITIATION ---');
  const dummyPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
  const uploadPayload = {
    entityType: 'REPORT',
    entityId: `REP-${Date.now()}`,
    patientId: patientId,
    bookingId: `BK-${Date.now()}`,
    fileName: 'test-lab-report.pdf',
    contentType: 'application/pdf',
    fileSize: dummyPdfContent.length,
  };

  const uploadInitRes = await apiPost('/api/documents/upload-url', uploadPayload);
  const uploadData = uploadInitRes.data?.data;
  console.log('POST /api/documents/upload-url -> Status:', uploadInitRes.status, 'DocumentId:', uploadData?.documentId, 'Has UploadUrl:', Boolean(uploadData?.uploadUrl));

  if (!uploadData?.uploadUrl || !uploadData?.documentId) {
    console.error('Failed to initiate upload');
    process.exit(1);
  }

  const documentId = uploadData.documentId;
  const presignedPutUrl = uploadData.uploadUrl;

  // TEST 5 — DIRECT S3 UPLOAD
  console.log('\n--- TEST 5: DIRECT S3 UPLOAD VIA PRESIGNED PUT URL ---');
  const s3PutRes = await fetch(presignedPutUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf',
    },
    body: dummyPdfContent,
  });
  console.log('Direct S3 PUT -> HTTP Status:', s3PutRes.status, s3PutRes.ok ? 'SUCCESS' : 'FAILED');

  // TEST 6 — COMPLETE DOCUMENT
  console.log('\n--- TEST 6: COMPLETE DOCUMENT (PENDING -> UPLOADED) ---');
  const completeRes = await apiPost(`/api/documents/${documentId}/complete`, {});
  console.log('POST /api/documents/{id}/complete -> Status:', completeRes.status, 'New Document Status:', completeRes.data?.data?.status);

  // TEST 7 — DOCUMENT METADATA
  console.log('\n--- TEST 7: DOCUMENT METADATA GET ---');
  const metaRes = await apiGet(`/api/documents/${documentId}`);
  console.log(`GET /api/documents/${documentId} -> Status:`, metaRes.status, 'Metadata DocumentId:', metaRes.data?.data?.documentId, 'Status:', metaRes.data?.data?.status);

  // TEST 8 — DOWNLOAD URL & VERIFY DOWNLOAD
  console.log('\n--- TEST 8: GET PRESIGNED DOWNLOAD URL & DOWNLOAD FILE ---');
  const downloadUrlRes = await apiGet(`/api/documents/${documentId}/download-url`);
  const downloadData = downloadUrlRes.data?.data;
  console.log(`GET /api/documents/${documentId}/download-url -> Status:`, downloadUrlRes.status, 'Has DownloadUrl:', Boolean(downloadData?.downloadUrl));

  if (downloadData?.downloadUrl) {
    const s3GetRes = await fetch(downloadData.downloadUrl);
    const downloadedBuffer = Buffer.from(await s3GetRes.arrayBuffer());
    console.log('Direct S3 GET -> HTTP Status:', s3GetRes.status, 'Downloaded Bytes:', downloadedBuffer.length, 'Content Match:', downloadedBuffer.equals(dummyPdfContent));
  }

  // TEST 9 — UNAUTHORIZED DOCUMENT ACCESS
  console.log('\n--- TEST 9: UNAUTHORIZED DOCUMENT ACCESS ATTEMPT ---');
  // Attempt with invalid document ID
  const invalidDocRes = await apiGet('/api/documents/DOC-NONEXISTENT-999');
  console.log('GET /api/documents/DOC-NONEXISTENT-999 -> Status:', invalidDocRes.status, invalidDocRes.data?.error?.code);

  const invalidDownloadRes = await apiGet('/api/documents/DOC-NONEXISTENT-999/download-url');
  console.log('GET /api/documents/DOC-NONEXISTENT-999/download-url -> Status:', invalidDownloadRes.status, invalidDownloadRes.data?.error?.code);

  console.log('\n====================================================');
  console.log('ALL LIVE DOCUMENT VERIFICATION TESTS COMPLETE');
  console.log('====================================================');
}

runLiveDocumentTests();
