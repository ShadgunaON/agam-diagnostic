const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = 'agam-data-dev';

const ddbClient = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(ddbClient);

async function checkMatrix() {
  try {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: 'SETTINGS#RBAC',
        SK: 'PERMISSIONS',
      },
    };
    
    const result = await docClient.send(new GetCommand(params));
    if (!result.Item) {
      console.log("No PERMISSIONS record found in DynamoDB.");
      return;
    }
    
    const data = result.Item.data;
    const adminRecord = data.find(r => r.roleId === 'admin');
    if (!adminRecord) {
      console.log("No admin roleId found in the matrix.");
      return;
    }
    
    const ordersMod = (adminRecord.modules || []).find(m => m.id === 'orders');
    console.log("ORDERS MODULE:", JSON.stringify(ordersMod, null, 2));
    
  } catch (err) {
    console.error("Error querying DynamoDB:", err);
  }
}

checkMatrix();
