const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

class DynamoPatientRepository {
  async getById(patientId) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `PATIENT#${patientId}`,
        SK: 'METADATA',
      },
    };
    const { Item } = await docClient.send(new GetCommand(params));
    return Item ? this._mapFromDb(Item) : null;
  }

  async getByOwner(ownerSub) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :userPk AND begins_with(GSI2SK, :patientPrefix)',
      ExpressionAttributeValues: {
        ':userPk': `USER#${ownerSub}`,
        ':patientPrefix': 'PATIENT#',
      },
      ScanIndexForward: false,
    };
    const { Items } = await docClient.send(new QueryCommand(params));
    return (Items || []).map((item) => this._mapFromDb(item));
  }

  async create(patient, ownerSub) {
    const now = new Date().toISOString();
    const resolvedOwner = ownerSub || patient.ownerSub || 'SYSTEM';
    const dbItem = {
      PK: `PATIENT#${patient.id}`,
      SK: 'METADATA',
      GSI1PK: 'ENTITY#PATIENT',
      GSI1SK: now,
      GSI2PK: `USER#${resolvedOwner}`,
      GSI2SK: `PATIENT#${now}`,
      ...patient,
      ownerSub: resolvedOwner,
      createdAt: patient.createdAt || now,
      updatedAt: patient.updatedAt || now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: dbItem,
      })
    );
    return this._mapFromDb(dbItem);
  }

  async update(patientId, data) {
    const now = new Date().toISOString();

    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeValues = {
      ':updatedAt': now,
    };
    const expressionAttributeNames = {};

    let hasUpdates = false;
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'PK' && key !== 'SK' && value !== undefined) {
        updateExpression += `, #k_${key} = :v_${key}`;
        expressionAttributeNames[`#k_${key}`] = key;
        expressionAttributeValues[`:v_${key}`] = value;
        hasUpdates = true;
      }
    }

    if (!hasUpdates) return this.getById(patientId);

    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `PATIENT#${patientId}`,
        SK: 'METADATA',
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    const { Attributes } = await docClient.send(new UpdateCommand(params));
    return this._mapFromDb(Attributes);
  }

  async getAll(limit = 100) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#PATIENT',
      },
      Limit: limit,
    };
    const { Items } = await docClient.send(new QueryCommand(params));
    return (Items || []).map((item) => this._mapFromDb(item));
  }

  _mapFromDb(item) {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    return rest;
  }
}

module.exports = new DynamoPatientRepository();
