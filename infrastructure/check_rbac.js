const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'agam-data-dev';
const PK = 'SETTINGS#RBAC';
const SK = 'PERMISSIONS';

async function run() {
  try {
    const getRes = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK }
    }));

    if (!getRes.Item || !getRes.Item.data) {
      console.log('RBAC data not found!');
      return;
    }

    const rolesData = getRes.Item.data;
    
    ['admin', 'manager', 'staff'].forEach(roleId => {
      const role = rolesData.find(r => r.roleId === roleId);
      if (role) {
        const reportsMod = role.modules.find(m => m.id === 'reports');
        if (reportsMod) {
          console.log(`Role [${roleId}]:`);
          console.log(`  reports.view: ${reportsMod.permissions[0].view}`);
          console.log(`  reports.create: ${reportsMod.permissions[0].create}`);
          console.log(`  reports.edit: ${reportsMod.permissions[0].edit}`);
        } else {
          console.log(`Role [${roleId}]: missing 'reports' module entirely`);
        }
      }
    });

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
