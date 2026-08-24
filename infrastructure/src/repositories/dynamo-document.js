const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

class DynamoDocumentRepository {
  async createMetadata(doc, ownerSub) {
    const createdAt = doc.createdAt || new Date().toISOString();
    const documentId = doc.documentId;
    const patientId = doc.patientId;

    const dbItem = {
      ...doc,
      PK: `DOCUMENT#${documentId}`,
      SK: 'METADATA',
      GSI1PK: `ENTITY#${doc.entityType}#${doc.entityId}`,
      GSI1SK: `DOCUMENT#${createdAt}#${documentId}`,
      ownerSub: ownerSub || doc.ownerSub,
      createdAt,
      updatedAt: createdAt,
    };

    if (patientId) {
      dbItem.GSI2PK = `PATIENT#${patientId}`;
      dbItem.GSI2SK = `DOCUMENT#${createdAt}#${documentId}`;
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: dbItem,
      })
    );
    return this._mapFromDb(dbItem);
  }

  async getById(documentId) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `DOCUMENT#${documentId}`,
        SK: 'METADATA',
      },
    };

    const response = await docClient.send(new GetCommand(params));
    return response.Item ? this._mapFromDb(response.Item) : null;
  }

  async getByEntity(entityType, entityId) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk and begins_with(GSI1SK, :docPrefix)',
      ExpressionAttributeValues: {
        ':gsi1pk': `ENTITY#${entityType}#${entityId}`,
        ':docPrefix': 'DOCUMENT#',
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

    return items.map(item => this._mapFromDb(item));
  }

  async getByPatientId(patientId) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :gsi2pk and begins_with(GSI2SK, :docPrefix)',
      ExpressionAttributeValues: {
        ':gsi2pk': `PATIENT#${patientId}`,
        ':docPrefix': 'DOCUMENT#',
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

    return items.map(item => this._mapFromDb(item));
  }

  async updateStatus(documentId, status) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `DOCUMENT#${documentId}`,
        SK: 'METADATA',
      },
      UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    };

    const { Attributes } = await docClient.send(new UpdateCommand(params));
    return this._mapFromDb(Attributes);
  }

  _mapFromDb(item) {
    if (!item) return null;
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    return rest;
  }
}

module.exports = new DynamoDocumentRepository();
