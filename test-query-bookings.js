const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function check() {
  const params = {
    TableName: 'agam-data-dev',
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :entity',
    ExpressionAttributeValues: { ':entity': 'ENTITY#BOOKING' },
    ScanIndexForward: false,
    Limit: 10
  };
  const { Items } = await docClient.send(new QueryCommand(params));
  console.log("Bookings returned:");
  Items.forEach(i => console.log(`${i.id} | GSI1SK: ${i.GSI1SK} | Date: ${i.collection?.date} | Created: ${i.createdAt} | Status: ${i.status} | Patient: ${i.patient?.name}`));
}

check().catch(console.error);
