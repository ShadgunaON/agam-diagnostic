const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function check() {
  const params = {
    TableName: 'agam-data-dev',
    Key: {
      PK: 'REPORT#REP-1789305156796_mtas9',
      SK: 'METADATA'
    }
  };
  const { Item } = await docClient.send(new GetCommand(params));
  console.log("Report:", JSON.stringify(Item, null, 2));
}

check().catch(console.error);
