const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function run() {
  try {
    await docClient.send(new UpdateCommand({
      TableName: 'agam-data-dev',
      Key: { PK: 'PAGE#health-packages', SK: 'METADATA' },
      UpdateExpression: 'REMOVE draftContent, publishedContent SET #s = :status',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':status': 'DRAFT' }
    }));
    console.log('Successfully wiped health-packages CMS DB entry.');
  } catch (err) {
    console.error('Failed', err);
  }
}
run();
