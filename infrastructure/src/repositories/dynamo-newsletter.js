const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';

class DynamoNewsletterRepository {
  _mapFromDb(item) {
    if (!item) return null;
    const { PK, SK, GSI1PK, GSI1SK, ...rest } = item;
    return rest;
  }

  async getByEmail(email) {
    if (!email) return null;
    const normalizedEmail = email.toLowerCase().trim();
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `NEWSLETTER#${normalizedEmail}`,
        SK: 'SUBSCRIBER',
      },
    };

    const { Item } = await docClient.send(new GetCommand(params));
    return Item ? this._mapFromDb(Item) : null;
  }

  async subscribe(email) {
    if (!email) throw new Error('Email is required');
    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date().toISOString();

    const existing = await this.getByEmail(normalizedEmail);

    const item = {
      PK: `NEWSLETTER#${normalizedEmail}`,
      SK: 'SUBSCRIBER',
      GSI1PK: 'NEWSLETTER',
      GSI1SK: `SUBSCRIBER#${existing ? (existing.subscribedAt || now) : now}`,
      id: existing ? existing.id : `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: existing ? existing.email : email, // Keep original casing
      normalizedEmail,
      status: 'Active',
      subscribedAt: existing ? (existing.subscribedAt || now) : now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return { 
      subscriber: this._mapFromDb(item), 
      isNew: !existing || existing.status !== 'Active' 
    };
  }

  async unsubscribe(email) {
    const existing = await this.getByEmail(email);
    if (!existing) return null;
    
    const now = new Date().toISOString();
    const item = {
      PK: `NEWSLETTER#${existing.normalizedEmail}`,
      SK: 'SUBSCRIBER',
      GSI1PK: 'NEWSLETTER',
      GSI1SK: `SUBSCRIBER#${existing.subscribedAt}`,
      ...existing,
      status: 'Unsubscribed',
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return this._mapFromDb(item);
  }

  async getAll() {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'NEWSLETTER',
      },
      ScanIndexForward: false, // newest first
    };

    const { Items } = await docClient.send(new QueryCommand(params));
    return (Items || []).map((item) => this._mapFromDb(item));
  }
}

module.exports = new DynamoNewsletterRepository();
