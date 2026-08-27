const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';
process.env.DYNAMODB_TABLE_NAME = TABLE_NAME;

const invoiceRepo = require('./src/repositories/dynamo-invoice');

async function testInvoice() {
  console.log('Testing Invoice Repo...');
  
  const testInvoice = {
    id: 'INV-P5-TEST-123',
    bookingId: 'BOOKING-P5-TEST',
    patientId: 'PT-P5-TEST',
    items: [{ id: 'item1', name: 'Test Panel', type: 'Package', price: 100 }],
    subtotal: 100,
    discount: 0,
    tax: 5,
    total: 105,
    paymentStatus: 'Pending',
    createdAt: new Date().toISOString()
  };

  const created = await invoiceRepo.create(testInvoice);
  console.log('Created Invoice:', created);
  
  const fetched = await invoiceRepo.getById(created.id);
  console.log('Fetched Invoice by ID:', fetched.id === created.id);

  const updatedStatus = await invoiceRepo.updateStatus(created.id, 'Paid');
  console.log('Updated Status to Paid:', updatedStatus.paymentStatus === 'Paid');
  
  const allInvoices = await invoiceRepo.getAll();
  const found = allInvoices.find(inv => inv.id === created.id);
  console.log('Found in getAll:', !!found);
  
  // Clean up
  console.log('\nCleaning up test records...');
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);
  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `INVOICE#${created.id}`,
      SK: 'METADATA'
    }
  }));
  console.log('Cleanup complete.');
}

async function run() {
  try {
    await testInvoice();
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

run();
