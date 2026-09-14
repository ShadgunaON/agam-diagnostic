const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function checkDocs() {
  const params = {
    TableName: 'agam-data-dev',
    FilterExpression: 'begins_with(PK, :pkPrefix) AND SK = :sk',
    ExpressionAttributeValues: {
      ':pkPrefix': 'REPORT#',
      ':sk': 'METADATA'
    }
  };

  const { Items } = await docClient.send(new ScanCommand(params));
  console.log(`Total Reports in DB: ${Items.length}`);
  const withFile = Items.filter(i => i.fileKey || i.fileUrl || i.url);
  console.log(`Reports with a file attached: ${withFile.length}`);
  if (withFile.length > 0) {
    console.log("Sample file attachment from DB:", JSON.stringify({ fileKey: withFile[0].fileKey, url: withFile[0].url }, null, 2));
  }
}

checkDocs().catch(console.error);
