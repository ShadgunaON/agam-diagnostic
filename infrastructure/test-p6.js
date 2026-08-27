/**
 * P6 Document Storage Foundation — Backend + S3 Test
 *
 * Tests:
 * 1. Create PENDING metadata in DynamoDB
 * 2. Generate presigned upload URL
 * 3. Upload a small test PDF to S3
 * 4. Confirm the S3 object exists
 * 5. Mark metadata UPLOADED
 * 6. Retrieve metadata
 * 7. Generate presigned download URL
 * 8. Verify the object can be retrieved via the presigned URL
 * 9. Test REPORT and INVOICE entity type attachments
 * 10. Cleanup: Delete only test objects/metadata
 *
 * SAFETY:
 * - Targets ONLY agam-data-dev
 * - Targets ONLY the Agam dev S3 bucket
 * - Uses explicit test IDs prefixed with DOCUMENT-P6-TEST
 * - Does NOT recursively delete objects
 * - Does NOT truncate DynamoDB
 * - Does NOT modify public website assets
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const https = require('https');
const http = require('http');

const REGION = 'us-east-1';
const TABLE_NAME = 'agam-data-dev';
const BUCKET_NAME = 'agam-storage-230937596130-us-east-1-dev';

const dynamoClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: REGION });

// Test identifiers
const TEST_DOCUMENT_ID = 'DOC-P6-TEST-001';
const TEST_REPORT_DOCUMENT_ID = 'DOC-P6-TEST-REPORT';
const TEST_INVOICE_DOCUMENT_ID = 'DOC-P6-TEST-INVOICE';
const TEST_PATIENT_ID = 'PAT-P6-TEST';
const TEST_REPORT_ID = 'REP-P6-TEST';
const TEST_INVOICE_ID = 'INV-P6-TEST';
const TEST_BOOKING_ID = 'BK-P6-TEST';

// A minimal valid PDF (header only, enough to verify S3 upload/download)
const TEST_PDF_CONTENT = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

async function uploadToPresignedUrl(presignedUrl, content, contentType) {
  return new Promise((resolve, reject) => {
    const url = new URL(presignedUrl);
    const protocol = url.protocol === 'https:' ? https : http;
    const options = {
      method: 'PUT',
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': contentType,
        'Content-Length': content.length,
      },
    };
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, body: data });
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(content);
    req.end();
  });
}

async function fetchPresignedUrl(presignedUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(presignedUrl);
    const protocol = url.protocol === 'https:' ? https : http;
    protocol.get(presignedUrl, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: Buffer.concat(data) });
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log(' P6 DOCUMENT STORAGE FOUNDATION — BACKEND TEST');
  console.log('═══════════════════════════════════════════════════\n');

  const testDocuments = [];
  const testS3Keys = [];

  try {
    // ─── TEST 1: Create PENDING metadata ─────────────────────────
    console.log('1. Creating PENDING document metadata...');
    const fileKey = `documents/${TEST_PATIENT_ID}/REPORT/${TEST_REPORT_ID}/${TEST_DOCUMENT_ID}.pdf`;
    const metadata = {
      PK: `DOCUMENT#${TEST_DOCUMENT_ID}`,
      SK: 'METADATA',
      GSI1PK: `ENTITY#REPORT#${TEST_REPORT_ID}`,
      GSI1SK: `DOCUMENT#${new Date().toISOString()}`,
      documentId: TEST_DOCUMENT_ID,
      entityType: 'REPORT',
      entityId: TEST_REPORT_ID,
      patientId: TEST_PATIENT_ID,
      bookingId: TEST_BOOKING_ID,
      fileKey,
      fileName: 'test-report.pdf',
      contentType: 'application/pdf',
      fileSize: TEST_PDF_CONTENT.length,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      createdBy: 'P6-TEST-SYSTEM',
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: metadata }));
    testDocuments.push(TEST_DOCUMENT_ID);
    testS3Keys.push(fileKey);
    console.log('   ✅ PENDING metadata created\n');

    // ─── TEST 2: Generate presigned upload URL ────────────────────
    console.log('2. Generating presigned upload URL...');
    const uploadUrl = await getSignedUrl(s3Client, new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: 'application/pdf',
    }), { expiresIn: 300 });
    console.log('   ✅ Presigned upload URL generated\n');

    // ─── TEST 3: Upload test PDF ──────────────────────────────────
    console.log('3. Uploading test PDF to S3 via presigned URL...');
    await uploadToPresignedUrl(uploadUrl, TEST_PDF_CONTENT, 'application/pdf');
    console.log('   ✅ Test PDF uploaded successfully\n');

    // ─── TEST 4: Confirm S3 object exists ─────────────────────────
    console.log('4. Verifying S3 object exists...');
    const headResult = await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    }));
    console.log(`   ✅ S3 object verified (ContentLength: ${headResult.ContentLength}, ContentType: ${headResult.ContentType})\n`);

    // ─── TEST 5: Mark metadata UPLOADED ───────────────────────────
    console.log('5. Updating metadata to UPLOADED...');
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `DOCUMENT#${TEST_DOCUMENT_ID}`, SK: 'METADATA' },
      UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
      ExpressionAttributeNames: { '#status': 'status', '#updatedAt': 'updatedAt' },
      ExpressionAttributeValues: { ':status': 'UPLOADED', ':updatedAt': new Date().toISOString() },
    }));
    console.log('   ✅ Metadata updated to UPLOADED\n');

    // ─── TEST 6: Retrieve metadata ────────────────────────────────
    console.log('6. Retrieving document metadata...');
    const getResult = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `DOCUMENT#${TEST_DOCUMENT_ID}`, SK: 'METADATA' },
    }));
    const item = getResult.Item;
    console.log(`   documentId: ${item.documentId}`);
    console.log(`   entityType: ${item.entityType}`);
    console.log(`   entityId:   ${item.entityId}`);
    console.log(`   patientId:  ${item.patientId}`);
    console.log(`   status:     ${item.status}`);
    console.log(`   fileKey:    ${item.fileKey}`);
    if (item.status !== 'UPLOADED') throw new Error('Expected status UPLOADED');
    if (item.entityType !== 'REPORT') throw new Error('Expected entityType REPORT');
    if (item.patientId !== TEST_PATIENT_ID) throw new Error('Expected matching patientId');
    console.log('   ✅ Metadata verified\n');

    // ─── TEST 7: Generate presigned download URL ──────────────────
    console.log('7. Generating presigned download URL...');
    const downloadUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    }), { expiresIn: 900 });
    console.log('   ✅ Presigned download URL generated\n');

    // ─── TEST 8: Retrieve object via presigned URL ────────────────
    console.log('8. Downloading object via presigned URL...');
    const downloadResult = await fetchPresignedUrl(downloadUrl);
    if (downloadResult.statusCode !== 200) throw new Error(`Download failed: ${downloadResult.statusCode}`);
    if (downloadResult.body.toString().startsWith('%PDF')) {
      console.log('   ✅ Downloaded content is valid PDF\n');
    } else {
      throw new Error('Downloaded content does not start with %PDF');
    }

    // ─── TEST 9: REPORT entity type attachment ────────────────────
    console.log('9. Testing REPORT entity type attachment...');
    const reportFileKey = `documents/${TEST_PATIENT_ID}/REPORT/${TEST_REPORT_ID}/${TEST_REPORT_DOCUMENT_ID}.pdf`;
    const reportMeta = {
      PK: `DOCUMENT#${TEST_REPORT_DOCUMENT_ID}`,
      SK: 'METADATA',
      GSI1PK: `ENTITY#REPORT#${TEST_REPORT_ID}`,
      GSI1SK: `DOCUMENT#${new Date().toISOString()}`,
      documentId: TEST_REPORT_DOCUMENT_ID,
      entityType: 'REPORT',
      entityId: TEST_REPORT_ID,
      patientId: TEST_PATIENT_ID,
      fileKey: reportFileKey,
      fileName: 'report-attachment.pdf',
      contentType: 'application/pdf',
      fileSize: TEST_PDF_CONTENT.length,
      status: 'UPLOADED',
      createdAt: new Date().toISOString(),
      createdBy: 'P6-TEST-SYSTEM',
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: reportMeta }));
    testDocuments.push(TEST_REPORT_DOCUMENT_ID);
    console.log('   ✅ REPORT document metadata created\n');

    // ─── TEST 9b: INVOICE entity type attachment ──────────────────
    console.log('   Testing INVOICE entity type attachment...');
    const invoiceFileKey = `documents/${TEST_PATIENT_ID}/INVOICE/${TEST_INVOICE_ID}/${TEST_INVOICE_DOCUMENT_ID}.pdf`;
    const invoiceMeta = {
      PK: `DOCUMENT#${TEST_INVOICE_DOCUMENT_ID}`,
      SK: 'METADATA',
      GSI1PK: `ENTITY#INVOICE#${TEST_INVOICE_ID}`,
      GSI1SK: `DOCUMENT#${new Date().toISOString()}`,
      documentId: TEST_INVOICE_DOCUMENT_ID,
      entityType: 'INVOICE',
      entityId: TEST_INVOICE_ID,
      patientId: TEST_PATIENT_ID,
      fileKey: invoiceFileKey,
      fileName: 'invoice-attachment.pdf',
      contentType: 'application/pdf',
      fileSize: TEST_PDF_CONTENT.length,
      status: 'UPLOADED',
      createdAt: new Date().toISOString(),
      createdBy: 'P6-TEST-SYSTEM',
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: invoiceMeta }));
    testDocuments.push(TEST_INVOICE_DOCUMENT_ID);
    console.log('   ✅ INVOICE document metadata created\n');

    // ─── TEST 9c: Verify GSI1 query by entity ────────────────────
    console.log('   Querying GSI1 for REPORT documents...');
    const gsi1Result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk',
      ExpressionAttributeValues: { ':gsi1pk': `ENTITY#REPORT#${TEST_REPORT_ID}` },
    }));
    console.log(`   ✅ Found ${gsi1Result.Items.length} REPORT documents via GSI1\n`);

    // ─── CLEANUP ──────────────────────────────────────────────────
    console.log('10. Cleaning up test data...');

    // Delete DynamoDB records
    for (const docId of testDocuments) {
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: `DOCUMENT#${docId}`, SK: 'METADATA' },
      }));
      console.log(`   ✅ Deleted DynamoDB record: DOCUMENT#${docId}`);
    }

    // Delete S3 object
    for (const key of testS3Keys) {
      try {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        }));
        console.log(`   ✅ Deleted S3 object: ${key}`);
      } catch (err) {
        console.log(`   ⚠️  S3 delete skipped (may not exist): ${key}`);
      }
    }

    // Verify cleanup
    for (const docId of testDocuments) {
      const verifyResult = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `DOCUMENT#${docId}`, SK: 'METADATA' },
      }));
      if (verifyResult.Item) {
        throw new Error(`Cleanup failed: DOCUMENT#${docId} still exists`);
      }
    }
    console.log('   ✅ All test data cleaned up\n');

    // ─── SUMMARY ─────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════');
    console.log(' ✅ ALL P6 TESTS PASSED');
    console.log('═══════════════════════════════════════════════════');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    console.error(err.stack);

    // Emergency cleanup
    console.log('\nAttempting emergency cleanup...');
    for (const docId of testDocuments) {
      try {
        await docClient.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: `DOCUMENT#${docId}`, SK: 'METADATA' },
        }));
      } catch (e) { /* ignore */ }
    }
    for (const key of testS3Keys) {
      try {
        await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
      } catch (e) { /* ignore */ }
    }
    process.exit(1);
  }
}

runTests();
