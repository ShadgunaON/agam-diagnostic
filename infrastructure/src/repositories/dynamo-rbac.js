/**
 * DynamoDB RBAC Repository
 * Single-table design using existing AgamDynamoDBTable.
 * 
 * PK: SETTINGS#RBAC
 * SK: ROLES
 * SK: PERMISSIONS
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

async function getRoles() {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: 'SETTINGS#RBAC',
      SK: 'ROLES',
    },
  };
  
  const result = await docClient.send(new GetCommand(params));
  return result.Item ? result.Item.data : null;
}

async function setRoles(rolesArray) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      PK: 'SETTINGS#RBAC',
      SK: 'ROLES',
      data: rolesArray,
      updatedAt: new Date().toISOString(),
    },
  };
  
  await docClient.send(new PutCommand(params));
  return rolesArray;
}

async function getPermissions() {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: 'SETTINGS#RBAC',
      SK: 'PERMISSIONS',
    },
  };
  
  const result = await docClient.send(new GetCommand(params));
  return result.Item ? result.Item.data : null;
}

async function setPermissions(permissionsArray) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      PK: 'SETTINGS#RBAC',
      SK: 'PERMISSIONS',
      data: permissionsArray,
      updatedAt: new Date().toISOString(),
    },
  };
  
  await docClient.send(new PutCommand(params));
  return permissionsArray;
}

module.exports = {
  getRoles,
  setRoles,
  getPermissions,
  setPermissions,
};
