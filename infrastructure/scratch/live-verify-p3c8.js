const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, DeleteCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const ddbClient = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(ddbClient);

const INVOICE_FUNCTION_NAME = 'agam-diagnostics-foundation-InvoiceFunction-zlEFfVnY74DB';
const TABLE_NAME = 'agam-data-dev';

const SUB_ALICE = 'alice-live-p3c8-sub';
const SUB_BOB = 'bob-live-p3c8-sub';
const SUB_ADMIN = 'admin-live-p3c8-sub';

const PATIENT_ALICE = 'pat_alice_live_p3c8';
const PATIENT_BOB = 'pat_bob_live_p3c8';

const scratchDir = path.join(__dirname);
const payloadInFile = path.join(scratchDir, 'payload-in.json');
const payloadOutFile = path.join(scratchDir, 'payload-out.json');

function invokeLambda(functionName, event) {
  fs.writeFileSync(payloadInFile, JSON.stringify(event));
  execSync(
    `aws lambda invoke --function-name "${functionName}" --region us-east-1 --payload fileb://"${payloadInFile}" "${payloadOutFile}" --log-type Tail > nul 2>&1`
  );
  const out = fs.readFileSync(payloadOutFile, 'utf8');
  return JSON.parse(out);
}

function parseData(res) {
  if (!res || !res.body) return null;
  const parsed = JSON.parse(res.body);
  return parsed.data !== undefined ? parsed.data : parsed;
}

function buildEvent({ method, path, proxy, query, body, sub, role, email }) {
  const claims = sub
    ? {
        sub,
        email: email || `${sub}@example.com`,
        'custom:role': role || 'Patient',
      }
    : undefined;

  return {
    httpMethod: method,
    path: path,
    pathParameters: proxy ? { proxy } : {},
    queryStringParameters: query || null,
    body: body ? JSON.stringify(body) : null,
    headers: {
      'Content-Type': 'application/json',
    },
    requestContext: {
      authorizer: claims ? { claims } : undefined,
    },
  };
}

async function runLiveVerification() {
  console.log('================================================================');
  console.log('STARTING P3C.8 LIVE INVOICE & PAYMENT VERIFICATION');
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

  let testInvoiceId = null;

  try {
    // 1. Setup temporary patient records in DynamoDB for live ownership resolution
    console.log('1. Setting up temporary patient records in DynamoDB...');
    const now = new Date().toISOString();
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `PATIENT#${PATIENT_ALICE}`,
          SK: 'METADATA',
          GSI1PK: 'ENTITY#PATIENT',
          GSI1SK: now,
          id: PATIENT_ALICE,
          ownerSub: SUB_ALICE,
          name: 'Alice Live Test',
          createdAt: now,
          updatedAt: now,
        },
      })
    );
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `PATIENT#${PATIENT_BOB}`,
          SK: 'METADATA',
          GSI1PK: 'ENTITY#PATIENT',
          GSI1SK: now,
          id: PATIENT_BOB,
          ownerSub: SUB_BOB,
          name: 'Bob Live Test',
          createdAt: now,
          updatedAt: now,
        },
      })
    );
    console.log('  Temporary patient records inserted.\n');

    // 2. Anonymous access
    console.log('2. Testing Anonymous Access...');
    const resAnon = invokeLambda(
      INVOICE_FUNCTION_NAME,
      buildEvent({ method: 'GET', path: '/api/invoices', proxy: '' })
    );
    assert(resAnon.statusCode === 401, 'Anonymous GET /api/invoices returns 401 Unauthorized');

    // 3. Invoice Creation with Server-Authoritative Calculation
    console.log('\n3. Testing Server-Authoritative Invoice Creation...');
    const postBody = {
      patientId: PATIENT_ALICE,
      bookingId: 'BK-LIVE-001',
      items: [
        { id: 'it_1', name: 'Complete Blood Count', price: 600 },
        { id: 'it_2', name: 'Thyroid Profile', price: 900 },
      ],
      subtotal: 10, // Attempted tamper (client sends ₹10 instead of ₹1500)
      discount: 100,
      tax: 5, // Attempted tamper
      total: 15, // Attempted tamper (client sends ₹15 instead of ₹1475)
    };

    const resCreate = invokeLambda(
      INVOICE_FUNCTION_NAME,
      buildEvent({
        method: 'POST',
        path: '/api/invoices',
        body: postBody,
        sub: SUB_ALICE,
        role: 'Patient',
      })
    );

    assert(resCreate.statusCode === 201, 'POST /api/invoices returns 201 Created');

    const createdData = parseData(resCreate);
    testInvoiceId = createdData ? createdData.id : null;


    assert(testInvoiceId && testInvoiceId.startsWith('INV-'), `Invoice ID generated: ${testInvoiceId}`);
    assert(createdData && createdData.subtotal === 1500, `Server authoritative subtotal: ₹${createdData ? createdData.subtotal : 'N/A'} (expected ₹1500)`);
    assert(createdData && createdData.discount === 100, `Discount applied: ₹${createdData ? createdData.discount : 'N/A'}`);
    assert(createdData && createdData.tax === 75, `Server authoritative tax (5%): ₹${createdData ? createdData.tax : 'N/A'} (expected ₹75)`);
    assert(createdData && createdData.total === 1475, `Server authoritative total: ₹${createdData ? createdData.total : 'N/A'} (expected ₹1475)`);
    assert(createdData && createdData.paymentStatus === 'Pending', `Initial paymentStatus is '${createdData ? createdData.paymentStatus : 'N/A'}'`);
    assert(createdData && createdData.ownerSub === SUB_ALICE, `ownerSub derived from Cognito sub: '${createdData ? createdData.ownerSub : 'N/A'}'`);

    // 4. Patient gets own invoice
    console.log('\n4. Testing Patient Lookup & Isolation...');
    const resGetOwned = invokeLambda(
      INVOICE_FUNCTION_NAME,
      buildEvent({
        method: 'GET',
        path: `/api/invoices/${testInvoiceId}`,
        proxy: testInvoiceId,
        sub: SUB_ALICE,
        role: 'Patient',
      })
    );
    assert(resGetOwned.statusCode === 200, 'Alice retrieves her owned invoice with 200 OK');

    // 5. Cross-patient access forbidden
    const resGetCross = invokeLambda(
      INVOICE_FUNCTION_NAME,
      buildEvent({
        method: 'GET',
        path: `/api/invoices/${testInvoiceId}`,
        proxy: testInvoiceId,
        sub: SUB_BOB,
        role: 'Patient',
      })
    );
    assert(resGetCross.statusCode === 403, 'Bob accessing Alice invoice returns 403 Forbidden');

    // 6. Patient query by unauthorized patientId
    const resQueryUnauthorized = invokeLambda(
      INVOICE_FUNCTION_NAME,
      buildEvent({
        method: 'GET',
        path: '/api/invoices',
        query: { patientId: PATIENT_BOB },
        sub: SUB_ALICE,
        role: 'Patient',
      })
    );
    assert(resQueryUnauthorized.statusCode === 403, 'Alice querying Bob patientId returns 403 Forbidden');

    // 7. Patient query by authorized patientId
    const resQueryAuthorized = invokeLambda(
      INVOICE_FUNCTION_NAME,
      buildEvent({
        method: 'GET',
        path: '/api/invoices',
        query: { patientId: PATIENT_ALICE },
        sub: SUB_ALICE,
        role: 'Patient',
      })
    );
    assert(resQueryAuthorized.statusCode === 200, 'Alice querying her own patientId returns 200 OK');
    const aliceInvoices = parseData(resQueryAuthorized);
    assert(Array.isArray(aliceInvoices) && aliceInvoices.some((i) => i.id === testInvoiceId), 'Found created invoice in Alice GSI2 query');

    // 8. Nonexistent invoice lookup -> 404
    const resGetNotFound = invokeLambda(
      INVOICE_FUNCTION_NAME,
      buildEvent({
        method: 'GET',
        path: '/api/invoices/NONEXISTENT-999',
        proxy: 'NONEXISTENT-999',
        sub: SUB_ALICE,
        role: 'Patient',
      })
    );
    assert(resGetNotFound.statusCode === 404, 'Lookup of NONEXISTENT invoice returns 404 Not Found');

    // 9. Payment Security Test: Patient attempts to mark invoice Paid directly -> 403
    console.log('\n5. Testing Payment Security & Role Protection...');
    const resPatientMarkPaid = invokeLambda(
      INVOICE_FUNCTION_NAME,
      buildEvent({
        method: 'PUT',
        path: `/api/invoices/${testInvoiceId}/status`,
        proxy: `${testInvoiceId}/status`,
        body: { status: 'Paid' },
        sub: SUB_ALICE,
        role: 'Patient',
      })
    );
    assert(resPatientMarkPaid.statusCode === 403, 'Patient direct status update to Paid returns 403 Forbidden');

    // 10. Legitimate Payment Recording: Staff / Admin records payment -> 200
    console.log('\n6. Testing Staff Payment Recording...');
    const resStaffMarkPaid = invokeLambda(
      INVOICE_FUNCTION_NAME,
      buildEvent({
        method: 'PUT',
        path: `/api/invoices/${testInvoiceId}/status`,
        proxy: `${testInvoiceId}/status`,
        body: { status: 'Paid', paymentMethod: 'UPI' },
        sub: SUB_ADMIN,
        role: 'Admin',
      })
    );
    assert(resStaffMarkPaid.statusCode === 200, 'Admin/Staff payment recording returns 200 OK');
    const updatedInvoice = parseData(resStaffMarkPaid);
    assert(updatedInvoice && updatedInvoice.paymentStatus === 'Paid', "Invoice paymentStatus successfully transitioned to 'Paid'");
    assert(updatedInvoice && !!updatedInvoice.paidAt, `paidAt timestamp populated: ${updatedInvoice ? updatedInvoice.paidAt : 'N/A'}`);
    assert(updatedInvoice && updatedInvoice.paymentMethod === 'UPI', `paymentMethod recorded: ${updatedInvoice ? updatedInvoice.paymentMethod : 'N/A'}`);
    assert(updatedInvoice && updatedInvoice.receivedBy === SUB_ADMIN, `receivedBy recorded: ${updatedInvoice ? updatedInvoice.receivedBy : 'N/A'}`);

    // 11. Lifecycle Test: Invalid state machine transitions rejected
    console.log('\n7. Testing Invoice Lifecycle Enforcement...');
    const resPaidToPending = invokeLambda(
      INVOICE_FUNCTION_NAME,
      buildEvent({
        method: 'PUT',
        path: `/api/invoices/${testInvoiceId}/status`,
        proxy: `${testInvoiceId}/status`,
        body: { status: 'Pending' },
        sub: SUB_ADMIN,
        role: 'Admin',
      })
    );
    assert(resPaidToPending.statusCode === 400, "Paid -> Pending transition rejected with 400 Bad Request");

    const resPaidToUnpaid = invokeLambda(
      INVOICE_FUNCTION_NAME,
      buildEvent({
        method: 'PUT',
        path: `/api/invoices/${testInvoiceId}/status`,
        proxy: `${testInvoiceId}/status`,
        body: { status: 'Unpaid' },
        sub: SUB_ADMIN,
        role: 'Admin',
      })
    );
    assert(resPaidToUnpaid.statusCode === 400, "Paid -> Unpaid transition rejected with 400 Bad Request");

    // 12. DynamoDB GSI2 Query Direct Verification (Zero Table Scans)
    console.log('\n8. Verifying GSI2 Query on DynamoDB...');
    const gsi2Params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `PATIENT#${PATIENT_ALICE}`,
      },
      ScanIndexForward: false,
    };
    const gsi2Res = await docClient.send(new QueryCommand(gsi2Params));
    assert(gsi2Res.Items && gsi2Res.Items.length > 0, `GSI2 query successfully returned ${gsi2Res.Items.length} items`);
    const indexedItem = gsi2Res.Items.find((it) => it.PK === `INVOICE#${testInvoiceId}`);
    assert(!!indexedItem, 'Created invoice retrieved via GSI2 indexed query');
    assert(indexedItem && indexedItem.GSI2PK === `PATIENT#${PATIENT_ALICE}`, `GSI2PK correctly formatted: ${indexedItem ? indexedItem.GSI2PK : 'N/A'}`);
    assert(indexedItem && indexedItem.GSI2SK.startsWith('INVOICE#'), `GSI2SK correctly formatted: ${indexedItem ? indexedItem.GSI2SK : 'N/A'}`);

    // 13. Regression Testing Across Handlers
    console.log('\n9. Testing Regression Across Domain Functions...');
    const resVersion = invokeLambda(
      'agam-diagnostics-foundation-VersionFunction-QB901lsk9eJx',
      buildEvent({ method: 'GET', path: '/api/version' })
    );
    assert(resVersion.statusCode === 200, 'GET /api/version returns 200 OK');

    const resPatientsMe = invokeLambda(
      'agam-diagnostics-foundation-PatientFunction-jLSMLXFGWajQ',
      buildEvent({ method: 'GET', path: '/api/patients/me', proxy: 'me', sub: SUB_ALICE, role: 'Patient' })
    );
    assert(resPatientsMe.statusCode === 200, 'GET /api/patients/me returns 200 OK');

    const resBookings = invokeLambda(
      'agam-diagnostics-foundation-BookingFunction-c4GAbhVyqIxS',
      buildEvent({ method: 'GET', path: '/api/bookings', proxy: '', sub: SUB_ALICE, role: 'Patient' })
    );
    assert(resBookings.statusCode === 200, 'GET /api/bookings returns 200 OK');

    const resCollections = invokeLambda(
      'agam-diagnostics-foundation-CollectionFunction-K7VuwmPoHTCk',
      buildEvent({ method: 'GET', path: '/api/collections', proxy: '', sub: SUB_ALICE, role: 'Patient' })
    );
    assert(resCollections.statusCode === 200, 'GET /api/collections returns 200 OK');

    const resDocs = invokeLambda(
      'agam-diagnostics-foundation-DocumentFunction-QZUZbgWF7S0X',
      buildEvent({ method: 'GET', path: '/api/documents', proxy: '', sub: SUB_ALICE, role: 'Patient' })
    );
    assert(resDocs.statusCode === 200, 'GET /api/documents returns 200 OK');

  } catch (err) {
    console.error('Test Execution Error:', err);
    failed++;
  } finally {
    // Cleanup temporary test items from DynamoDB and temp files
    console.log('\n10. Cleaning up temporary live test items...');
    try {
      if (testInvoiceId) {
        await docClient.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { PK: `INVOICE#${testInvoiceId}`, SK: 'METADATA' },
          })
        );
        console.log(`  Cleaned up invoice: INVOICE#${testInvoiceId}`);
      }
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: `PATIENT#${PATIENT_ALICE}`, SK: 'METADATA' },
        })
      );
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: `PATIENT#${PATIENT_BOB}`, SK: 'METADATA' },
        })
      );
      console.log('  Cleaned up temporary patient records.');

      if (fs.existsSync(payloadInFile)) fs.unlinkSync(payloadInFile);
      if (fs.existsSync(payloadOutFile)) fs.unlinkSync(payloadOutFile);
    } catch (cleanupErr) {
      console.warn('Cleanup warning:', cleanupErr);
    }
  }

  console.log('\n================================================================');
  console.log(`LIVE VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runLiveVerification();
