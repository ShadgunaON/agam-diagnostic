const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, UpdateCommand, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

class DynamoInvoiceRepository {
  async getAll() {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#INVOICE',
      },
      ScanIndexForward: false, // Descending by ID/Date
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

  async getById(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `INVOICE#${id}`,
        SK: 'METADATA',
      },
    };
    
    const response = await docClient.send(new GetCommand(params));
    return response.Item ? this._mapFromDb(response.Item) : null;
  }

  async create(invoice) {
    const createdAt = invoice.createdAt || new Date().toISOString();
    const dbItem = {
      PK: `INVOICE#${invoice.id}`,
      SK: 'METADATA',
      GSI1PK: 'ENTITY#INVOICE',
      GSI1SK: `INVOICE#${createdAt}#${invoice.id}`,
      GSI2PK: `PATIENT#${invoice.patientId}`,
      GSI2SK: `INVOICE#${createdAt}#${invoice.id}`,
      ...invoice,
      createdAt,
    };
    
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: dbItem,
      })
    );
    return this._mapFromDb(dbItem);
  }

  async getByPatientId(patientId) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :patient',
      ExpressionAttributeValues: {
        ':patient': `PATIENT#${patientId}`,
      },
      ScanIndexForward: false, // Descending by createdAt
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


  async updateStatus(id, status) {
    return this.update(id, { paymentStatus: status });
  }

  async update(id, updates) {
    if (!updates || Object.keys(updates).length === 0) {
      return this.getById(id);
    }

    // Always update updatedAt
    updates.updatedAt = new Date().toISOString();

    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (['id', 'PK', 'SK', 'GSI1PK', 'GSI1SK', 'GSI2PK', 'GSI2SK'].includes(key)) return;
      if (value === undefined) return;
      
      const attributeKey = `#${key}`;
      const valueKey = `:${key}`;
      updateExpressions.push(`${attributeKey} = ${valueKey}`);
      expressionAttributeNames[attributeKey] = key;
      expressionAttributeValues[valueKey] = value;
    });


    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `INVOICE#${id}`,
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
    if (!item) return null;
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    return rest;
  }
}

module.exports = new DynamoInvoiceRepository();
