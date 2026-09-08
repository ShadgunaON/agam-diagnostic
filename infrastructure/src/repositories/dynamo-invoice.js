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

  async search(query, limit = 12) {
    if (!query || !query.trim()) return [];
    
    const qOriginal = query.trim();
    const qLower = query.toLowerCase().trim();
    const qUpper = query.toUpperCase().trim();

    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      FilterExpression: 'contains(PK, :qOriginal) OR contains(patientId, :qOriginal) OR contains(patientId, :qLower) OR contains(patientId, :qUpper) OR contains(bookingId, :qOriginal) OR contains(bookingId, :qLower) OR contains(bookingId, :qUpper)',
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#INVOICE',
        ':qOriginal': qOriginal,
        ':qLower': qLower,
        ':qUpper': qUpper
      },
      ScanIndexForward: false,
      Limit: limit,
    };
    
    const { Items } = await docClient.send(new QueryCommand(params));
    return (Items || []).map((item) => this._mapFromDb(item));
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

  /**
   * Aggregate paid invoice revenue per calendar month for the given UTC year.
   *
   * Access pattern: single bounded range Query on GSI1.
   *   GSI1PK = 'ENTITY#INVOICE'
   *   GSI1SK BETWEEN 'INVOICE#<year>-01-01' AND 'INVOICE#<year+1>-01-01' (exclusive)
   *
   * ISO timestamps sort lexicographically in chronological order, so the
   * range correctly captures every invoice whose createdAt falls within
   * the UTC calendar year.
   *
   * Read-cost note: FilterExpression (paymentStatus = 'Paid') is evaluated
   * AFTER DynamoDB reads all items matching the key range — it does NOT act
   * as an index. Non-Paid invoices within the year are still consumed read
   * capacity but are excluded from the returned result set.
   *
   * ProjectionExpression: only createdAt and total are retrieved; full
   * invoice objects are never sent to Lambda memory or the browser.
   *
   * @param {number} year - UTC calendar year (defaults to current UTC year)
   * @returns {Array<{month: string, revenue: number}>} 12 entries, Jan–Dec
   */
  async getRevenueByMonth(year) {
    const targetYear = year || new Date().getUTCFullYear();
    const lowerBound = `INVOICE#${targetYear}-01-01`;
    const upperBound = `INVOICE#${targetYear + 1}-01-01`;

    const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthTotals = new Array(12).fill(0);

    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression:
        'GSI1PK = :entity AND GSI1SK BETWEEN :lower AND :upper',
      FilterExpression: 'paymentStatus = :paid',
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#INVOICE',
        ':lower': lowerBound,
        ':upper': upperBound,
        ':paid': 'Paid',
      },
      ProjectionExpression: 'createdAt, #total',
      ExpressionAttributeNames: { '#total': 'total' },
      ScanIndexForward: true,
    };

    let exclusiveStartKey = undefined;
    do {
      params.ExclusiveStartKey = exclusiveStartKey;
      const response = await docClient.send(new QueryCommand(params));
      if (response.Items) {
        for (const item of response.Items) {
          if (!item.createdAt) continue;
          const monthIndex = new Date(item.createdAt).getUTCMonth(); // 0-based
          monthTotals[monthIndex] += item.total || 0;
        }
      }
      exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);

    return MONTH_LABELS.map((month, i) => ({ month, revenue: monthTotals[i] }));
  }

  async getTodayRevenue() {
    const todayStr = new Date().toISOString().split('T')[0];
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity AND begins_with(GSI1SK, :todayStr)',
      FilterExpression: '#paymentStatus = :paidStatus',
      ExpressionAttributeNames: {
        '#paymentStatus': 'paymentStatus',
        '#total': 'total'
      },
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#INVOICE',
        ':todayStr': `INVOICE#${todayStr}`,
        ':paidStatus': 'Paid'
      },
      ProjectionExpression: '#total'
    };

    let totalRevenue = 0;
    let exclusiveStartKey = undefined;

    do {
      params.ExclusiveStartKey = exclusiveStartKey;
      const response = await docClient.send(new QueryCommand(params));
      
      if (response.Items) {
        for (const item of response.Items) {
          totalRevenue += (item.total || 0);
        }
      }
      exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);

    return totalRevenue;
  }

  async getPaginated({ limit = 20, cursor = null, status = 'All', search = '' }) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      ScanIndexForward: false, // Descending by Date/ID
      Limit: limit,
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#INVOICE'
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

    if (status && status !== 'All') {
      filters.push('paymentStatus = :status');
      attrValues[':status'] = status;
    }

    if (search && search.trim()) {
      const qLower = search.toLowerCase().trim();
      const qUpper = search.toUpperCase().trim();
      const qOriginal = search.trim();
      filters.push('(contains(PK, :qOriginal) OR contains(patientId, :qOriginal) OR contains(patientId, :qLower) OR contains(patientId, :qUpper) OR contains(bookingId, :qOriginal) OR contains(bookingId, :qLower) OR contains(bookingId, :qUpper))');
      attrValues[':qOriginal'] = qOriginal;
      attrValues[':qLower'] = qLower;
      attrValues[':qUpper'] = qUpper;
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

    return {
      data: (response.Items || []).map(item => this._mapFromDb(item)),
      nextCursor
    };
  }

  _mapFromDb(item) {
    if (!item) return null;
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    return rest;
  }
}

module.exports = new DynamoInvoiceRepository();
