/**
 * DynamoDB Staff Repository
 * Single-table design using existing AgamDynamoDBTable.
 * 
 * PK: STAFF#<cognitoSub>
 * SK: METADATA
 * GSI1PK: ENTITY#STAFF
 * GSI1SK: <joinDate ISO>
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

function toItem(staff) {
  return {
    PK: `STAFF#${staff.id}`,
    SK: 'METADATA',
    GSI1PK: 'ENTITY#STAFF',
    GSI1SK: staff.joinDate || staff.createdAt || new Date().toISOString(),
    GSI2PK: `ROLE#${staff.role}`,
    GSI2SK: staff.id,
    id: staff.id,
    name: staff.name,
    email: staff.email,
    phone: staff.phone,
    role: staff.role,
    department: staff.department || 'General',
    status: staff.status || 'On Duty',
    shift: staff.shift || 'Morning',
    joinDate: staff.joinDate || new Date().toISOString(),
    cognitoUsername: staff.cognitoUsername || staff.email,
    cognitoStatus: staff.cognitoStatus || 'FORCE_CHANGE_PASSWORD',
    createdAt: staff.createdAt || new Date().toISOString(),
    updatedAt: staff.updatedAt || new Date().toISOString(),
    entityType: 'STAFF',
  };
}

function fromItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    role: item.role,
    department: item.department,
    status: item.status,
    shift: item.shift,
    joinDate: item.joinDate,
    cognitoUsername: item.cognitoUsername,
    cognitoStatus: item.cognitoStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function createStaff(staff) {
  const item = toItem(staff);
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK)',
  }));
  return fromItem(item);
}

async function getStaffById(id) {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `STAFF#${id}`, SK: 'METADATA' },
  }));
  return fromItem(result.Item);
}

async function getAllStaff(limit = 100) {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': 'ENTITY#STAFF' },
    Limit: limit,
    ScanIndexForward: false,
  }));
  return (result.Items || []).map(fromItem);
}

async function updateStaff(id, updates) {
  const allowedFields = ['name', 'phone', 'role', 'department', 'status', 'shift', 'cognitoStatus'];
  const filteredUpdates = {};
  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    return getStaffById(id);
  }

  filteredUpdates.updatedAt = new Date().toISOString();

  const updateParts = [];
  const expressionValues = {};
  const expressionNames = {};

  for (const [key, value] of Object.entries(filteredUpdates)) {
    updateParts.push(`#${key} = :${key}`);
    expressionValues[`:${key}`] = value;
    expressionNames[`#${key}`] = key;
  }

  const result = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `STAFF#${id}`, SK: 'METADATA' },
    UpdateExpression: `SET ${updateParts.join(', ')}`,
    ExpressionAttributeValues: expressionValues,
    ExpressionAttributeNames: expressionNames,
    ConditionExpression: 'attribute_exists(PK)',
    ReturnValues: 'ALL_NEW',
  }));

  return fromItem(result.Attributes);
}

module.exports = {
  createStaff,
  getStaffById,
  getAllStaff,
  updateStaff,
};
