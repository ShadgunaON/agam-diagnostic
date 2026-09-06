const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'AgamDiagnosticsTable';

async function run() {
  console.log(`Starting backfill for table: ${TABLE_NAME}`);
  let lastEvaluatedKey = undefined;
  let count = 0;
  
  do {
    const response = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: {
        ':prefix': 'COLLECTION#',
        ':sk': 'METADATA'
      },
      ExclusiveStartKey: lastEvaluatedKey
    }));
    
    const items = response.Items || [];
    
    for (const item of items) {
      const assigneeId = item.phlebotomistId || 'UNASSIGNED';
      const status = item.status || 'Pending';
      const expectedGSI3PK = `ASSIGNEE#${assigneeId}`;
      const expectedGSI3SK = `STATUS#${status}`;
      
      if (item.GSI3PK !== expectedGSI3PK || item.GSI3SK !== expectedGSI3SK) {
        console.log(`Updating ${item.PK}...`);
        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: item.PK, SK: item.SK },
          UpdateExpression: 'SET GSI3PK = :pk, GSI3SK = :sk',
          ExpressionAttributeValues: {
            ':pk': expectedGSI3PK,
            ':sk': expectedGSI3SK
          }
        }));
        count++;
      }
    }
    
    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  
  console.log(`Backfill complete. Updated ${count} items.`);
}

run().catch(console.error);
