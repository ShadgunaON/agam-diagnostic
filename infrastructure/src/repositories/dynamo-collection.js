const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

class DynamoCollectionRepository {
  async getById(id) {
    const { Item } = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `COLLECTION#${id}`,
          SK: 'METADATA',
        },
      })
    );
    return Item ? this._mapFromDb(Item) : null;
  }

  async getAll() {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#COLLECTION',
      },
      ScanIndexForward: false, // Descending by date/ID
    };
    
    let items = [];
    let exclusiveStartKey = undefined;
    
    do {
      params.ExclusiveStartKey = exclusiveStartKey;
      const response = await docClient.send(new QueryCommand(params));
      if (response.Items) {
        items = items.concat(response.Items);
      }
      exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);
    
    return items.map(item => this._mapFromDb(item));
  }

  async getByPatientId(patientId) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :pk AND begins_with(GSI2SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `PATIENT#${patientId}`,
        ':skPrefix': 'COLLECTION#',
      },
      ScanIndexForward: false,
    };

    let items = [];
    let exclusiveStartKey = undefined;

    do {
      params.ExclusiveStartKey = exclusiveStartKey;
      const response = await docClient.send(new QueryCommand(params));
      if (response.Items) {
        items = items.concat(response.Items);
      }
      exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);

    return items.map((item) => this._mapFromDb(item));
  }

  async create(task, ownerSub) {
    const dateStr = task.date || new Date().toISOString().split('T')[0];
    const dbItem = {
      PK: `COLLECTION#${task.id}`,
      SK: 'METADATA',
      GSI1PK: 'ENTITY#COLLECTION',
      GSI1SK: `COLLECTION#${dateStr}#${task.id}`,
      GSI2PK: `PATIENT#${task.patientId || 'UNKNOWN'}`,
      GSI2SK: `COLLECTION#${dateStr}#${task.id}`,
      ownerSub: ownerSub || task.ownerSub,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...task,
    };
    
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: dbItem,
      })
    );
    return this._mapFromDb(dbItem);
  }

  async update(id, data) {
    if (!data || Object.keys(data).length === 0) {
      return this._mapFromDb({});
    }

    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.entries(payload).forEach(([key, value]) => {
      // Exclude PK, SK, GSIs, id
      if (['id', 'PK', 'SK', 'GSI1PK', 'GSI1SK', 'GSI2PK', 'GSI2SK'].includes(key)) return;
      
      const attributeKey = `#${key}`;
      const valueKey = `:${key}`;
      updateExpressions.push(`${attributeKey} = ${valueKey}`);
      expressionAttributeNames[attributeKey] = key;
      expressionAttributeValues[valueKey] = value;
    });

    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `COLLECTION#${id}`,
        SK: 'METADATA',
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    const { Attributes } = await docClient.send(new UpdateCommand(params));
    return this._mapFromDb(Attributes);
  }

  _mapFromDb(item) {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item || {};
    return rest;
  }
}

module.exports = new DynamoCollectionRepository();
