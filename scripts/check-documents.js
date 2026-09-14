const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function checkDocs() {
  const params = {
    TableName: 'agam-data-dev',
    FilterExpression: 'begins_with(PK, :pkPrefix) AND SK = :sk',
    ExpressionAttributeValues: {
      ':pkPrefix': 'DOCUMENT#',
      ':sk': 'METADATA'
    }
  };

  const { Items } = await docClient.send(new ScanCommand(params));
  console.log(`Total Documents in DB: ${Items.length}`);
  if (Items.length > 0) {
    console.log("Sample Document:", JSON.stringify(Items[0], null, 2));
  }
}

checkDocs().catch(console.error);
