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

  /**
   * Cursor-paginated patient list for the admin workspace.
   * Uses GSI1 (ENTITY#PATIENT partition) with DynamoDB-native Limit + ExclusiveStartKey.
   * cursor is a base64-encoded JSON LastEvaluatedKey.
   */
  async getPaginated({ limit = 20, cursor = null, search = '' } = {}) {
    if (search) {
      const results = await this.search(search, limit);
      return { data: results, nextCursor: null };
    }

    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      ExpressionAttributeValues: { ':entity': 'ENTITY#PATIENT' },
      ScanIndexForward: false,
      Limit: limit,
    };

    if (cursor) {
      try {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
      } catch {
        const err = new Error('Malformed cursor');
        err.statusCode = 400;
        throw err;
      }
    }

    const response = await docClient.send(new QueryCommand(params));
    const data = (response.Items || []).map((item) => this._mapFromDb(item));
    const nextCursor = response.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
      : null;

    return { data, nextCursor };
  }


  async search(query, limit = 12) {
    if (!query || !query.trim()) return [];
    
    const qLower = query.toLowerCase().trim();
    const qUpper = query.toUpperCase().trim();
    const qTitle = query.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    const qOriginal = query.trim();

    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      FilterExpression: 'contains(#name, :qLower) OR contains(#name, :qUpper) OR contains(#name, :qTitle) OR contains(#phone, :qOriginal) OR contains(#email, :qLower) OR contains(PK, :qOriginal)',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#phone': 'phone',
        '#email': 'email'
      },
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#PATIENT',
        ':qLower': qLower,
        ':qUpper': qUpper,
        ':qTitle': qTitle,
        ':qOriginal': qOriginal
      },
      Limit: limit,
    };
    const { Items } = await docClient.send(new QueryCommand(params));
    return (Items || []).map((item) => this._mapFromDb(item));
  }

  /**
   * Count all patients using Select:COUNT on GSI1.
   * No item data is transferred — only the DynamoDB Count integer per page.
   * Read-cost: proportional to the number of patient records.
   */
  async countAll() {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      ExpressionAttributeValues: { ':entity': 'ENTITY#PATIENT' },
      Select: 'COUNT',
    };
    let total = 0;
    let exclusiveStartKey = undefined;
    do {
      params.ExclusiveStartKey = exclusiveStartKey;
      const response = await docClient.send(new QueryCommand(params));
      total += response.Count || 0;
      exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);
    return total;
  }

  /**
   * Count patients created in a specific UTC calendar month.
   *
   * Access pattern: begins_with on GSI1SK.
   *   GSI1PK = 'ENTITY#PATIENT'
   *   GSI1SK begins_with 'YYYY-MM'   (e.g. '2026-09')
   *
   * GSI1SK is a raw ISO timestamp (e.g. '2026-09-04T08:32:06.000Z').
   * begins_with('2026-09-04T...', '2026-09') = true. This is safe and correct.
   *
   * @param {string} yearMonth - 'YYYY-MM' format UTC year-month
   */
  async countThisMonth(yearMonth) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity AND begins_with(GSI1SK, :monthPrefix)',
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#PATIENT',
        ':monthPrefix': yearMonth,
      },
      Select: 'COUNT',
    };
    let total = 0;
    let exclusiveStartKey = undefined;
    do {
      params.ExclusiveStartKey = exclusiveStartKey;
      const response = await docClient.send(new QueryCommand(params));
      total += response.Count || 0;
      exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);
    return total;
  }

  _mapFromDb(item) {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    return rest;
  }
}

module.exports = new DynamoPatientRepository();
