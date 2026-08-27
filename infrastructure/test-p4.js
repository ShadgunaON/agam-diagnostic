const collectionRepo = require('c:/Users/YHShadgunaSiddhi/Desktop/agam wireframe/agam-diagnostics-next/infrastructure/src/repositories/dynamo-collection.js');
const notificationRepo = require('c:/Users/YHShadgunaSiddhi/Desktop/agam wireframe/agam-diagnostics-next/infrastructure/src/repositories/dynamo-notification.js');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

process.env.DYNAMODB_TABLE_NAME = 'agam-data-dev';

async function run() {
  console.log('Testing Collection Repo...');
  const newCollection = await collectionRepo.create({
    id: 'test-col-123',
    patientId: 'P-123',
    bookingId: 'B-123',
    time: '10:00 AM',
    date: '2026-08-18',
    patient: 'Test Patient',
    tests: ['Test A'],
    status: 'Unassigned',
  });
  console.log('Created Collection:', newCollection);

  const updatedCollection = await collectionRepo.update('test-col-123', {
    status: 'Assigned',
    phlebotomistId: 'Staff-123',
  });
  console.log('Updated Collection:', updatedCollection);

  const allCollections = await collectionRepo.getAll();
  console.log('All Collections Count:', allCollections.length);
  const found = allCollections.find(c => c.id === 'test-col-123');
  console.log('Found created collection in getAll:', !!found);

  console.log('\nTesting Notification Repo...');
  const newNotif = await notificationRepo.create({
    userId: 'Staff-123',
    title: 'Test Notification',
    message: 'Hello World',
    isRead: false
  });
  console.log('Created Notification:', newNotif);

  await notificationRepo.markAsRead(newNotif.id);
  console.log('Marked as read.');

  const notifs = await notificationRepo.getByUserId('Staff-123');
  console.log('Notifications for Staff-123 Count:', notifs.length);
  const foundNotif = notifs.find(n => n.id === newNotif.id);
  console.log('Found created notification:', !!foundNotif);
  if (foundNotif) {
    console.log('Is Read?', foundNotif.isRead);
  }

  // Cleanup
  console.log('\nCleaning up test records...');
  const client = new DynamoDBClient({ region: 'us-east-1' });
  const docClient = DynamoDBDocumentClient.from(client);
  const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
  
  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: 'COLLECTION#test-col-123', SK: 'METADATA' } }));
  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: `NOTIFICATION#${newNotif.id}`, SK: 'METADATA' } }));
  console.log('Cleanup complete.');
}

run().catch(console.error);
