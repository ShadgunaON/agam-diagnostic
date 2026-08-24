const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, UpdateCommand, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';

class DynamoReviewRepository {
  _mapFromDb(item) {
    if (!item) return null;
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    return rest;
  }

  async getById(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `REVIEW#${id}`,
        SK: 'METADATA',
      },
    };

    const response = await docClient.send(new GetCommand(params));
    return response.Item ? this._mapFromDb(response.Item) : null;
  }

  async getByBookingId(bookingId) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `BOOKING#${bookingId}#REVIEW`,
        SK: 'METADATA',
      },
    };

    const response = await docClient.send(new GetCommand(params));
    if (!response.Item) return null;

    if (response.Item.reviewId) {
      return this.getById(response.Item.reviewId);
    }
    return this._mapFromDb(response.Item);
  }

  async getPublicApproved() {
    return this.getByStatus('Approved');
  }

  async getByStatus(status) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :statusPk',
      ExpressionAttributeValues: {
        ':statusPk': `REVIEW#STATUS#${status}`,
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

  async getAll() {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entityPk',
      ExpressionAttributeValues: {
        ':entityPk': 'ENTITY#REVIEW',
      },
      ScanIndexForward: false, // Descending
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

  async getByPatientId(patientId) {
    const queryPartition = async (partitionKey) => {
      const params = {
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :patientPk',
        ExpressionAttributeValues: {
          ':patientPk': partitionKey,
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

      return items;
    };

    const patientPk = patientId.startsWith('PATIENT#') ? patientId : `PATIENT#${patientId}`;
    let rawItems = await queryPartition(patientPk);

    // If patientId could also be indexed under USER#
    if (!patientId.startsWith('pat_')) {
      const userPk = `USER#${patientId}`;
      const userItems = await queryPartition(userPk);
      rawItems = rawItems.concat(userItems);
    }

    // Deduplicate by ID
    const seen = new Set();
    const unique = [];
    for (const item of rawItems) {
      const id = item.id || item.reviewId;
      if (id && !seen.has(id)) {
        seen.add(id);
        unique.push(item);
      }
    }

    return unique.map(item => this._mapFromDb(item));
  }

  async create(review) {
    const now = new Date().toISOString();
    const createdAt = review.createdAt || now;
    const updatedAt = review.updatedAt || now;
    const reviewId = review.id || `REV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const status = review.status || 'Pending';

    const cleanReview = {
      id: reviewId,
      patientId: review.patientId,
      bookingId: review.bookingId,
      rating: review.rating,
      comment: review.comment,
      displayName: review.displayName || 'Verified Patient',
      status,
      verified: review.verified !== undefined ? review.verified : true,
      ownerSub: review.ownerSub,
      createdBy: review.createdBy,
      createdAt,
      updatedAt,
    };

    // Remove undefined values
    Object.keys(cleanReview).forEach(key => cleanReview[key] === undefined && delete cleanReview[key]);

    // 1. Booking Uniqueness Pointer Item
    const bookingPointerItem = {
      PK: `BOOKING#${cleanReview.bookingId}#REVIEW`,
      SK: 'METADATA',
      GSI1PK: 'ENTITY#REVIEW',
      GSI1SK: `REVIEW#${createdAt}#${reviewId}`,
      reviewId,
      bookingId: cleanReview.bookingId,
      patientId: cleanReview.patientId,
      rating: cleanReview.rating,
      comment: cleanReview.comment,
      displayName: cleanReview.displayName,
      status,
      verified: cleanReview.verified,
      ownerSub: cleanReview.ownerSub,
      createdBy: cleanReview.createdBy,
      createdAt,
      updatedAt,
    };
    Object.keys(bookingPointerItem).forEach(key => bookingPointerItem[key] === undefined && delete bookingPointerItem[key]);

    // Atomic conditional write on booking uniqueness
    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: bookingPointerItem,
          ConditionExpression: 'attribute_not_exists(PK)',
        })
      );
    } catch (err) {
      if (err.name === 'ConditionalCheckFailedException') {
        const conflictErr = new Error('A review has already been submitted for this booking.');
        conflictErr.code = 'DUPLICATE_REVIEW';
        conflictErr.statusCode = 409;
        throw conflictErr;
      }
      throw err;
    }

    // 2. Primary Review Item
    const primaryItem = {
      PK: `REVIEW#${reviewId}`,
      SK: 'METADATA',
      GSI1PK: `REVIEW#STATUS#${status}`,
      GSI1SK: `REVIEW#${createdAt}#${reviewId}`,
      GSI2PK: `PATIENT#${cleanReview.patientId}`,
      GSI2SK: `REVIEW#${createdAt}#${reviewId}`,
      ...cleanReview,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: primaryItem,
      })
    );

    return this._mapFromDb(primaryItem);
  }

  async updateStatus(id, newStatus) {
    const existing = await this.getById(id);
    if (!existing) {
      const notFoundErr = new Error('Review not found');
      notFoundErr.statusCode = 404;
      throw notFoundErr;
    }

    const updatedAt = new Date().toISOString();
    const createdAt = existing.createdAt || updatedAt;

    // Update primary item
    const updateParams = {
      TableName: TABLE_NAME,
      Key: {
        PK: `REVIEW#${id}`,
        SK: 'METADATA',
      },
      UpdateExpression: 'SET #status = :status, GSI1PK = :gsi1pk, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': newStatus,
        ':gsi1pk': `REVIEW#STATUS#${newStatus}`,
        ':updatedAt': updatedAt,
      },
      ReturnValues: 'ALL_NEW',
    };

    const response = await docClient.send(new UpdateCommand(updateParams));

    // Update booking uniqueness pointer if exists
    if (existing.bookingId) {
      try {
        await docClient.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `BOOKING#${existing.bookingId}#REVIEW`,
              SK: 'METADATA',
            },
            UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
              '#status': 'status',
            },
            ExpressionAttributeValues: {
              ':status': newStatus,
              ':updatedAt': updatedAt,
            },
          })
        );
      } catch (pointerErr) {
        // Non-fatal
      }
    }

    return this._mapFromDb(response.Attributes);
  }
}

module.exports = new DynamoReviewRepository();
