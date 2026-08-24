const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, UpdateCommand, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

class DynamoNotificationRepository {
  async getById(id) {
    if (!id) return null;
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `NOTIFICATION#${id}`,
        SK: 'METADATA',
      },
    };
    const { Item } = await docClient.send(new GetCommand(params));
    return Item ? this._mapFromDb(Item) : null;
  }

  async getByUserId(userId) {
    if (!userId) return [];
    
    // Multi-partition backward-compatible indexed queries on GSI2 (zero table scans)
    const partitionKeys = [`USER#${userId}`, `STAFF#${userId}`];
    if (userId.startsWith('pat_')) {
      partitionKeys.push(`PATIENT#${userId}`);
    }

    const itemsMap = new Map();

    for (const pk of partitionKeys) {
      const params = {
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :pk AND begins_with(GSI2SK, :notificationPrefix)',
        ExpressionAttributeValues: {
          ':pk': pk,
          ':notificationPrefix': 'NOTIFICATION#',
        },
        ScanIndexForward: false, // Newest first
      };

      try {
        const { Items } = await docClient.send(new QueryCommand(params));
        if (Items && Items.length > 0) {
          for (const item of Items) {
            if (!itemsMap.has(item.id)) {
              itemsMap.set(item.id, this._mapFromDb(item));
            }
          }
        }
      } catch (err) {
        // Continue querying remaining partition formats
      }
    }

    const allItems = Array.from(itemsMap.values());
    allItems.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return allItems;
  }

  async create(notification) {
    const now = new Date().toISOString();
    const id = notification.id || `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const targetUserId = notification.userId;
    
    const dbItem = {
      PK: `NOTIFICATION#${id}`,
      SK: 'METADATA',
      GSI2PK: `USER#${targetUserId}`,
      GSI2SK: `NOTIFICATION#${now}`,
      id,
      userId: targetUserId,
      title: notification.title || '',
      message: notification.message || '',
      isRead: false,
      link: notification.link || undefined,
      ownerSub: notification.ownerSub || targetUserId,
      createdBy: notification.createdBy || undefined,
      type: notification.type || 'info',
      createdAt: now,
      updatedAt: now,
      ...notification,
    };
    
    // Remove undefined attributes
    Object.keys(dbItem).forEach(key => dbItem[key] === undefined && delete dbItem[key]);

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: dbItem,
      })
    );
    return this._mapFromDb(dbItem);
  }

  async markAsRead(id) {
    const now = new Date().toISOString();
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `NOTIFICATION#${id}`,
        SK: 'METADATA',
      },
      UpdateExpression: 'SET isRead = :isRead, readAt = :readAt, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':isRead': true,
        ':readAt': now,
        ':updatedAt': now,
      },
    };

    await docClient.send(new UpdateCommand(params));
    return { id, isRead: true, readAt: now };
  }

  _mapFromDb(item) {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item || {};
    return rest;
  }
}

module.exports = new DynamoNotificationRepository();
