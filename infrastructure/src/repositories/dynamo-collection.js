const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

class DynamoCollectionRepository {
  async getById(id) {
    const { Item } = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `COLLECTION#${id}`,
          SK: 'METADATA',
        },
      })
    );
    return Item ? this._mapFromDb(Item) : null;
  }

  async getAll() {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#COLLECTION',
      },
      ScanIndexForward: false, // Descending by date/ID
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

  async getPaginated({ limit = 20, cursor = null, tab = 'HOME', sort = 'date_oldest', search = '' }) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      ScanIndexForward: sort === 'date_oldest' ? true : false,
      Limit: limit,
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#COLLECTION'
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

    if (tab === 'HOME') {
      filters.push('#type <> :labVisit');
      attrNames['#type'] = 'type';
      attrValues[':labVisit'] = 'Lab Visit';
    } else if (tab === 'LAB') {
      filters.push('#type = :labVisit');
      attrNames['#type'] = 'type';
      attrValues[':labVisit'] = 'Lab Visit';
    }

    if (search && search.trim()) {
      const qLower = search.toLowerCase().trim();
      const qUpper = search.toUpperCase().trim();
      const qTitle = search.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      const qOriginal = search.trim();
      
      filters.push('(contains(PK, :qOriginal) OR contains(patientId, :qLower) OR contains(patientId, :qOriginal) OR contains(address, :qLower) OR contains(address, :qUpper) OR contains(address, :qTitle) OR contains(assignedTo, :qLower) OR contains(assignedTo, :qUpper) OR contains(assignedTo, :qTitle))');
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

    return {
      data: (response.Items || []).map(item => this._mapFromDb(item)).filter(Boolean),
      nextCursor
    };
  }

  async getStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity AND begins_with(GSI1SK, :todayPrefix)',
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#COLLECTION',
        ':todayPrefix': `COLLECTION#${todayStr}`
      },
      // Ensure we only pull what we strictly need to evaluate counts
      ProjectionExpression: '#status, assignedTo, #type',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#type': 'type'
      }
    };

    let totalTasks = 0;
    let completedTasks = 0;
    let enRouteTasks = 0;
    let unassignedTasks = 0;
    
    let exclusiveStartKey = undefined;

    do {
      params.ExclusiveStartKey = exclusiveStartKey;
      const response = await docClient.send(new QueryCommand(params));
      
      if (response.Items) {
        for (const item of response.Items) {
          if (item.type !== 'Lab Visit') {
            totalTasks++;
            if (item.status === 'Completed') completedTasks++;
            if (item.status === 'En Route') enRouteTasks++;
            if (item.status === 'Unassigned') unassignedTasks++;
          }
        }
      }
      exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);

    return { totalTasks, completedTasks, enRouteTasks, unassignedTasks };
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
      FilterExpression: 'contains(#status, :qUpper) OR contains(#status, :qLower) OR contains(PK, :qOriginal) OR contains(patientId, :qLower) OR contains(patientId, :qOriginal) OR contains(address, :qLower) OR contains(address, :qUpper) OR contains(address, :qTitle) OR contains(assignedTo, :qLower) OR contains(assignedTo, :qUpper) OR contains(assignedTo, :qTitle)',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#COLLECTION',
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

  async getByPatientId(patientId) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :pk AND begins_with(GSI2SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `PATIENT#${patientId}`,
        ':skPrefix': 'COLLECTION#',
      },
      ScanIndexForward: false,
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

    return items.map((item) => this._mapFromDb(item));
  }

  async getByAssignee(assigneeId) {
    if (!assigneeId) return [];
    
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `ASSIGNEE#${assigneeId}`,
      }
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
    
    return items.map((item) => this._mapFromDb(item));
  }

  async create(task, ownerSub) {
    const dateStr = task.date || new Date().toISOString().split('T')[0];
    const assigneeId = task.phlebotomistId || 'UNASSIGNED';
    const createdAt = task.createdAt || new Date().toISOString();
    const dbItem = {
      PK: `COLLECTION#${task.id}`,
      SK: 'METADATA',
      GSI1PK: 'ENTITY#COLLECTION',
      GSI1SK: `COLLECTION#${createdAt}#${task.id}`,
      GSI2PK: `PATIENT#${task.patientId || 'UNKNOWN'}`,
      GSI2SK: `COLLECTION#${dateStr}#${task.id}`,
      GSI3PK: `ASSIGNEE#${assigneeId}`,
      GSI3SK: `STATUS#${task.status || 'Pending'}`,
      ownerSub: ownerSub || task.ownerSub,
      createdAt: createdAt,
      updatedAt: createdAt,
      ...task,
    };
    
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: dbItem,
      })
    );
    return this._mapFromDb(dbItem);
  }

  async update(id, data) {
    if (!data || Object.keys(data).length === 0) {
      return this._mapFromDb({});
    }

    const existing = await this.getById(id);
    if (!existing) return null;

    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const newPhlebotomistId = data.phlebotomistId !== undefined ? data.phlebotomistId : existing.phlebotomistId;
    const newStatus = data.status !== undefined ? data.status : existing.status;

    const updateExpressions = [];
    const removeExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.entries(payload).forEach(([key, value]) => {
      if (['id', 'PK', 'SK', 'GSI1PK', 'GSI1SK', 'GSI2PK', 'GSI2SK', 'GSI3PK', 'GSI3SK'].includes(key)) return;
      if (value === null) {
        removeExpressions.push(`#${key}`);
        expressionAttributeNames[`#${key}`] = key;
      } else {
        const attributeKey = `#${key}`;
        const valueKey = `:${key}`;
        updateExpressions.push(`${attributeKey} = ${valueKey}`);
        expressionAttributeNames[attributeKey] = key;
        expressionAttributeValues[valueKey] = value;
      }
    });

    const assigneeId = newPhlebotomistId || 'UNASSIGNED';
    
    updateExpressions.push('#gsi3pk = :gsi3pk');
    updateExpressions.push('#gsi3sk = :gsi3sk');
    expressionAttributeNames['#gsi3pk'] = 'GSI3PK';
    expressionAttributeNames['#gsi3sk'] = 'GSI3SK';
    expressionAttributeValues[':gsi3pk'] = `ASSIGNEE#${assigneeId}`;
    expressionAttributeValues[':gsi3sk'] = `STATUS#${newStatus || 'Pending'}`;

    let updateExpression = '';
    if (updateExpressions.length > 0) updateExpression += `SET ${updateExpressions.join(', ')} `;
    if (removeExpressions.length > 0) updateExpression += `REMOVE ${removeExpressions.join(', ')}`;

    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `COLLECTION#${id}`,
        SK: 'METADATA',
      },
      UpdateExpression: updateExpression.trim(),
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    };

    if (Object.keys(expressionAttributeValues).length > 0) {
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    const { Attributes } = await docClient.send(new UpdateCommand(params));
    return this._mapFromDb(Attributes);
  }

  _mapFromDb(item) {
    if (!item) return null;
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    
    if (!rest.status) rest.status = 'Pending';
    if (!rest.type) rest.type = 'Home';
    if (!rest.date) rest.date = rest.createdAt ? rest.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
    if (!rest.timeSlot) rest.timeSlot = 'Morning (8AM - 11AM)';
    if (!rest.time) rest.time = rest.timeSlot || 'N/A';
    if (!rest.address) rest.address = 'Unknown Address';
    if (!rest.createdAt) rest.createdAt = rest.updatedAt || new Date().toISOString();
    if (!rest.patientId) rest.patientId = item.GSI2PK ? item.GSI2PK.replace('PATIENT#', '') : 'UNKNOWN';
    if (!rest.bookingId) rest.bookingId = item.PK ? item.PK.replace('COLLECTION#', '').replace('COL-', 'bk_') : 'UNKNOWN';
    // Ensure tests is a valid non-null array to satisfy schema [String!]
    if (!Array.isArray(rest.tests)) rest.tests = [];
    else rest.tests = rest.tests.filter(t => t != null);
    
    return rest;
  }
}

module.exports = new DynamoCollectionRepository();
