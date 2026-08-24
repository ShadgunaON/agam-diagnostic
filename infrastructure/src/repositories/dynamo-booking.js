const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

class DynamoBookingRepository {
  async getById(bookingId) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `BOOKING#${bookingId}`,
        SK: 'METADATA',
      },
    };
    const { Item } = await docClient.send(new GetCommand(params));
    return Item ? this._mapFromDb(Item) : null;
  }

  async create(booking, ownerSub) {
    const now = new Date().toISOString();
    const resolvedOwner = ownerSub || booking.ownerSub || 'SYSTEM';
    const patientKey = booking.patientId || (booking.patient?.id ? booking.patient.id : 'GENERAL');
    
    const dbItem = {
      PK: `BOOKING#${booking.id}`,
      SK: 'METADATA',
      GSI1PK: 'ENTITY#BOOKING',
      GSI1SK: booking.collection?.date || booking.scheduledDate || now,
      GSI2PK: `PATIENT#${patientKey}`,
      GSI2SK: `BOOKING#${booking.collection?.date || booking.scheduledDate || now}`,
      ...booking,
      patientId: patientKey,
      ownerSub: resolvedOwner,
      createdAt: booking.createdAt || now,
      updatedAt: booking.updatedAt || now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: dbItem,
      })
    );
    return this._mapFromDb(dbItem);
  }

  async updateStatus(bookingId, status) {
    const now = new Date().toISOString();
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `BOOKING#${bookingId}`,
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

  async updatePaymentStatus(bookingId, paymentStatus) {
    const now = new Date().toISOString();
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `BOOKING#${bookingId}`,
        SK: 'METADATA',
      },
      UpdateExpression: 'SET payment.#status = :paymentStatus, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':paymentStatus': paymentStatus,
        ':updatedAt': now,
      },
      ReturnValues: 'ALL_NEW',
    };
    const { Attributes } = await docClient.send(new UpdateCommand(params));
    return this._mapFromDb(Attributes);
  }

  async getRecent(limit = 10) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#BOOKING',
      },
      ScanIndexForward: false,
      Limit: limit,
    };
    const { Items } = await docClient.send(new QueryCommand(params));
    return (Items || []).map((item) => this._mapFromDb(item));
  }

  async getByPatientId(patientId) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :patientPk AND begins_with(GSI2SK, :bookingPrefix)',
      ExpressionAttributeValues: {
        ':patientPk': `PATIENT#${patientId}`,
        ':bookingPrefix': 'BOOKING#',
      },
      ScanIndexForward: false,
    };
    const { Items } = await docClient.send(new QueryCommand(params));
    return (Items || []).map((item) => this._mapFromDb(item));
  }

  async getAll() {
    return this.getRecent(100);
  }

  _mapFromDb(item) {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    return rest;
  }
}

module.exports = new DynamoBookingRepository();
