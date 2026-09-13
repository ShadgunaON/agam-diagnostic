const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

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
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      message: data.message,
      createdAt: now,
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
      message: dbItem.message,
      createdAt: dbItem.createdAt
    };
  }
}

module.exports = new DynamoInquiryRepository();
