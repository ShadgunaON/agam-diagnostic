const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function backfill() {
  console.log("Starting backfill for BOOKING GSI1SK...");
  const params = {
    TableName: 'agam-data-dev',
    FilterExpression: 'begins_with(PK, :pkPrefix) AND SK = :sk',
    ExpressionAttributeValues: {
      ':pkPrefix': 'BOOKING#',
      ':sk': 'METADATA'
    }
  };

  let count = 0;
  let lastKey = undefined;

  do {
    params.ExclusiveStartKey = lastKey;
    const { Items, LastEvaluatedKey } = await docClient.send(new ScanCommand(params));
    lastKey = LastEvaluatedKey;

    for (const item of Items) {
      // If GSI1SK doesn't look like an ISO string (e.g. it's just a date '2026-10-01' or 'Not specified')
      // and createdAt is present, update it.
      if (item.GSI1SK && !item.GSI1SK.includes('T')) {
        const newSk = item.createdAt || new Date().toISOString();
        console.log(`Updating booking ${item.id} - GSI1SK from ${item.GSI1SK} to ${newSk}`);
        
        await docClient.send(new UpdateCommand({
          TableName: 'agam-data-dev',
          Key: { PK: item.PK, SK: item.SK },
          UpdateExpression: 'SET GSI1SK = :gsi1sk',
          ExpressionAttributeValues: {
            ':gsi1sk': newSk
          }
        }));
        count++;
      }
    }
  } while (lastKey);

  console.log(`Backfill complete. Updated ${count} items.`);
}

backfill().catch(console.error);
