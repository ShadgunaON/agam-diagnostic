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
    
    const dbItem = {
      PK: `REPORT#${report.id}`,
      SK: 'METADATA',
      GSI1PK: `PATIENT#${patientKey}`,
      GSI1SK: `REPORT#${report.id}`,
      GSI2PK: `ENTITY#REPORT`,
      GSI2SK: report.id,
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

  _mapFromDb(item) {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    return rest;
  }
}

module.exports = new DynamoReportRepository();
