const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';

class DynamoInquiryRepository {
  async create(data) {
    const id = data.id || `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const dbItem = {
      PK: `INQUIRY#${id}`,
      SK: 'METADATA',
      GSI1PK: 'ENTITY#INQUIRY',
      GSI1SK: now,
      id,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      message: data.message || '',
      status: 'New',
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: dbItem,
      })
    );

    return {
      id: dbItem.id,
      firstName: dbItem.firstName,
      lastName: dbItem.lastName,
      email: dbItem.email,
      phone: dbItem.phone,
      message: dbItem.message,
      status: dbItem.status,
      createdAt: dbItem.createdAt,
      updatedAt: dbItem.updatedAt,
    };
  }

  async getById(id) {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `INQUIRY#${id}`,
          SK: 'METADATA',
        },
      })
    );

    if (!result.Item) return null;
    const item = result.Item;
    return {
      id: item.id,
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      email: item.email || '',
      phone: item.phone || '',
      message: item.message || '',
      status: item.status || 'New',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async list({ limit = 50, cursor = null, status = null, search = null } = {}) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': 'ENTITY#INQUIRY' },
      ScanIndexForward: false, // newest first
      Limit: limit,
    };

    if (cursor) {
      try {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
      } catch (_) {
        // ignore malformed cursors
      }
    }

    const result = await docClient.send(new QueryCommand(params));
    let items = (result.Items || []).map((item) => ({
      id: item.id,
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      email: item.email || '',
      phone: item.phone || '',
      message: item.message || '',
      status: item.status || 'New',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    // In-memory filters (DynamoDB scan-side filtering costs RCUs, so we filter small sets in memory)
    if (status) {
      items = items.filter((i) => i.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          (i.firstName + ' ' + i.lastName).toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.message.toLowerCase().includes(q)
      );
    }

    let nextCursor = null;
    if (result.LastEvaluatedKey) {
      nextCursor = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
    }

    return { items, nextCursor };
  }

  async updateStatus(id, status) {
    const now = new Date().toISOString();
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `INQUIRY#${id}`,
          SK: 'METADATA',
        },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': status,
          ':updatedAt': now,
        },
      })
    );
    return true;
  }
}

module.exports = new DynamoInquiryRepository();
