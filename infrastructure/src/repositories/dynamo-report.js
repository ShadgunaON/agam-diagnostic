const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

class DynamoReportRepository {
  async getById(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `REPORT#${id}`,
        SK: 'METADATA',
      },
    };
    const { Item } = await docClient.send(new GetCommand(params));
    return Item ? this._mapFromDb(Item) : null;
  }

  async create(report) {
    const now = new Date().toISOString();
    const patientKey = report.patientId || (report.patient?.id ? report.patient.id : 'GENERAL');
    
    let bookingCreatedAt = report.createdAt || now;
    if (report.bookingId) {
      try {
        const bookingRes = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `BOOKING#${report.bookingId}`, SK: 'METADATA' }
        }));
        if (bookingRes.Item && bookingRes.Item.createdAt) {
          bookingCreatedAt = bookingRes.Item.createdAt;
        }
      } catch (err) {
        console.warn(`Failed to fetch booking ${report.bookingId} during report creation`, err);
      }
    }

    const dbItem = {
      PK: `REPORT#${report.id}`,
      SK: 'METADATA',
      GSI1PK: `PATIENT#${patientKey}`,
      GSI1SK: `REPORT#${report.id}`,
      GSI2PK: `ENTITY#REPORT`,
      GSI2SK: report.id,
      GSI3PK: 'ENTITY#REPORT',
      GSI3SK: `REPORT#${bookingCreatedAt}#${report.id}`,
      ...report,
      patientId: patientKey,
      createdAt: report.createdAt || now,
      updatedAt: report.updatedAt || now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: dbItem,
      })
    );
    return this._mapFromDb(dbItem);
  }

  async updateStatus(id, status) {
    const now = new Date().toISOString();
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `REPORT#${id}`,
        SK: 'METADATA',
      },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': now,
      },
      ReturnValues: 'ALL_NEW',
    };
    const { Attributes } = await docClient.send(new UpdateCommand(params));
    return this._mapFromDb(Attributes);
  }

  async getByPatientId(patientId) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :patientPk AND begins_with(GSI1SK, :reportPrefix)',
      ExpressionAttributeValues: {
        ':patientPk': `PATIENT#${patientId}`,
        ':reportPrefix': 'REPORT#',
      },
      ScanIndexForward: false,
    };
    const { Items } = await docClient.send(new QueryCommand(params));
    return (Items || []).map((item) => this._mapFromDb(item));
  }

  async getAll(limit = 100) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :entity',
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#REPORT',
      },
      ScanIndexForward: false,
      Limit: limit,
    };
    const { Items } = await docClient.send(new QueryCommand(params));
    return (Items || []).map((item) => this._mapFromDb(item));
  }

  async getPaginated({ limit = 20, cursor = null, status = 'All', sort = 'date_newest', search = '' }) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :entity',
      ScanIndexForward: sort === 'date_oldest',
      Limit: limit,
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#REPORT'
      }
    };

    if (cursor) {
      try {
        const decodedStr = Buffer.from(cursor, 'base64').toString('utf8');
        params.ExclusiveStartKey = JSON.parse(decodedStr);
      } catch (err) {
        const error = new Error('Malformed cursor');
        error.statusCode = 400;
        throw error;
      }
    }

    const filters = [];
    const attrNames = {};
    const attrValues = params.ExpressionAttributeValues;

    if (status !== 'All') {
      filters.push('#status = :status');
      attrNames['#status'] = 'status';
      attrValues[':status'] = status;
    }

    if (search && search.trim()) {
      const qLower = search.toLowerCase().trim();
      const qUpper = search.toUpperCase().trim();
      const qTitle = search.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      const qOriginal = search.trim();
      
      // 'patient' is a DynamoDB map attribute — contains() on a non-string type causes a validation error.
      // Use string fields: patientId (String), PK (String), and status (String).
      filters.push('(contains(PK, :qOriginal) OR contains(patientId, :qLower) OR contains(patientId, :qOriginal) OR contains(#status, :qLower) OR contains(#status, :qUpper) OR contains(#status, :qTitle))');
      attrNames['#status'] = 'status';
      attrValues[':qOriginal'] = qOriginal;
      attrValues[':qLower'] = qLower;
      attrValues[':qUpper'] = qUpper;
      attrValues[':qTitle'] = qTitle;
    }

    if (filters.length > 0) {
      params.FilterExpression = filters.join(' AND ');
      if (Object.keys(attrNames).length > 0) {
        params.ExpressionAttributeNames = attrNames;
      }
    }

    const response = await docClient.send(new QueryCommand(params));
    
    let nextCursor = null;
    if (response.LastEvaluatedKey) {
      nextCursor = Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64');
    }

    // Include a simple count of pending items to avoid UI doing it
    let pendingCount = 0;
    // We will just do a targeted query if this is needed, or the GraphQL resolver can do it.
    // Actually the UI only needs it for the current page, or total pending. We'll let GraphQL resolver do getStats if needed.

    return {
      data: (response.Items || []).map(item => this._mapFromDb(item)),
      nextCursor
    };
  }

  async search(query, limit = 12) {
    if (!query || !query.trim()) return [];
    
    const qLower = query.toLowerCase().trim();
    const qUpper = query.toUpperCase().trim();
    const qTitle = query.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    const qOriginal = query.trim();

    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :entity',
      FilterExpression: 'contains(#status, :qUpper) OR contains(#status, :qLower) OR contains(PK, :qOriginal) OR contains(patientName, :qLower) OR contains(patientName, :qUpper) OR contains(patientName, :qTitle)',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#REPORT',
        ':qLower': qLower,
        ':qUpper': qUpper,
        ':qTitle': qTitle,
        ':qOriginal': qOriginal
      },
      ScanIndexForward: false,
      Limit: limit,
    };
    
    const { Items } = await docClient.send(new QueryCommand(params));
    return (Items || []).map((item) => this._mapFromDb(item));
  }

  async getPendingCount() {
    // Counts all reports not in 'Published' status via GSI3.
    // Uses a FilterExpression — acceptable for a bounded scan since total reports
    // at any given time is small and this is a KPI-only call.
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :entity',
      FilterExpression: '#status <> :published',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#REPORT',
        ':published': 'Published',
      },
      Select: 'COUNT',
    };
    let count = 0;
    let lastKey;
    do {
      if (lastKey) params.ExclusiveStartKey = lastKey;
      const response = await docClient.send(new QueryCommand(params));
      count += response.Count || 0;
      lastKey = response.LastEvaluatedKey;
    } while (lastKey);
    return count;
  }

  _mapFromDb(item) {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, GSI3PK, GSI3SK, ...rest } = item;
    return rest;
  }
}

module.exports = new DynamoReportRepository();
