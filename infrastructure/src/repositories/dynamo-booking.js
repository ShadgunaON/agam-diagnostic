const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand, TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');

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

  async createAggregate({ booking, invoice, collectionTask, idempotencyKey, ownerSub }) {
    if (!idempotencyKey) {
      throw new Error('Idempotency-Key is required for aggregate creation');
    }

    const now = new Date().toISOString();
    
    // Booking Item
    const resolvedOwner = ownerSub || booking.ownerSub || 'SYSTEM';
    const patientKey = booking.patientId || (booking.patient?.id ? booking.patient.id : 'GENERAL');
    const bookingItem = {
      PK: `BOOKING#${booking.id}`,
      SK: 'METADATA',
      GSI1PK: 'ENTITY#BOOKING',
      GSI1SK: booking.collection?.date || booking.scheduledDate || now,
      GSI2PK: `PATIENT#${patientKey}`,
      GSI2SK: `BOOKING#${booking.collection?.date || booking.scheduledDate || now}`,
      ...booking,
      patientId: patientKey,
      ownerSub: resolvedOwner,
      invoiceId: invoice.id,
      createdAt: booking.createdAt || now,
      updatedAt: booking.updatedAt || now,
    };

    // Invoice Item
    const invoiceItem = {
      PK: `INVOICE#${invoice.id}`,
      SK: 'METADATA',
      GSI1PK: 'ENTITY#INVOICE',
      GSI1SK: `INVOICE#${now}#${invoice.id}`,
      GSI2PK: `PATIENT#${invoice.patientId || patientKey}`,
      GSI2SK: `INVOICE#${now}#${invoice.id}`,
      ...invoice,
      createdAt: invoice.createdAt || now,
      updatedAt: invoice.updatedAt || now,
    };

    // Collection Task Item
    const collectionDateStr = collectionTask.date || now.split('T')[0];
    const collectionItem = {
      PK: `COLLECTION#${collectionTask.id}`,
      SK: 'METADATA',
      GSI1PK: 'ENTITY#COLLECTION',
      GSI1SK: `COLLECTION#${collectionDateStr}#${collectionTask.id}`,
      GSI2PK: `PATIENT#${collectionTask.patientId || patientKey}`,
      GSI2SK: `COLLECTION#${collectionDateStr}#${collectionTask.id}`,
      ...collectionTask,
      ownerSub: ownerSub || collectionTask.ownerSub,
      createdAt: collectionTask.createdAt || now,
      updatedAt: collectionTask.updatedAt || now,
    };

    // Idempotency Item
    const idempotencyItem = {
      PK: `IDEMPOTENCY#${idempotencyKey}`,
      SK: 'METADATA',
      bookingId: booking.id,
      createdAt: now,
      ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours TTL
    };

    // Determine initial pending delta (+1 if Pending, 0 otherwise)
    const isPendingOnCreate = !booking.status || booking.status === 'Pending';

    try {
      const transactItems = [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: idempotencyItem,
            ConditionExpression: 'attribute_not_exists(PK)'
          }
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: bookingItem
          }
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: invoiceItem
          }
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: collectionItem
          }
        }
      ];

      if (isPendingOnCreate) {
        transactItems.push({
          Update: {
            TableName: TABLE_NAME,
            Key: { PK: 'AGGREGATE#PendingBookings', SK: 'METADATA' },
            UpdateExpression: 'ADD #count :delta',
            ExpressionAttributeNames: { '#count': 'count' },
            ExpressionAttributeValues: { ':delta': 1 }
          }
        });
      }

      await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
      
      return {
        isDuplicate: false,
        booking: this._mapFromDb(bookingItem),
        invoice: this._mapFromDb(invoiceItem),
        collectionTask: this._mapFromDb(collectionItem)
      };
    } catch (error) {
      if (error.name === 'TransactionCanceledException') {
        const cancellationReasons = error.CancellationReasons || [];
        // Reason index 0 corresponds to the idempotency item check
        if (cancellationReasons[0]?.Code === 'ConditionalCheckFailed') {
          // Idempotency key exists! Fetch the existing idempotency record
          const { Item } = await docClient.send(
            new GetCommand({
              TableName: TABLE_NAME,
              Key: {
                PK: `IDEMPOTENCY#${idempotencyKey}`,
                SK: 'METADATA'
              }
            })
          );
          
          if (Item && Item.bookingId) {
            // Found it. Now fetch the original booking.
            const existingBooking = await this.getById(Item.bookingId);
            if (existingBooking) {
              return {
                isDuplicate: true,
                booking: existingBooking
              };
            }
          }
        }
      }
      throw error;
    }
  }

  async updateStatus(bookingId, status) {
    const now = new Date().toISOString();

    // Fetch current status to determine if counter needs adjustment
    const existing = await this.getById(bookingId);
    const wasP = existing?.status === 'Pending';
    const isP  = status === 'Pending';
    const counterDelta = (isP && !wasP) ? 1 : (!isP && wasP) ? -1 : 0;

    if (counterDelta !== 0) {
      // Atomic: update status + adjust counter together
      await docClient.send(new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: TABLE_NAME,
              Key: { PK: `BOOKING#${bookingId}`, SK: 'METADATA' },
              UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
              ExpressionAttributeNames: { '#status': 'status' },
              ExpressionAttributeValues: { ':status': status, ':updatedAt': now }
            }
          },
          {
            Update: {
              TableName: TABLE_NAME,
              Key: { PK: 'AGGREGATE#PendingBookings', SK: 'METADATA' },
              UpdateExpression: 'ADD #count :delta',
              ExpressionAttributeNames: { '#count': 'count' },
              ExpressionAttributeValues: { ':delta': counterDelta }
            }
          }
        ]
      }));
      // Re-fetch the updated booking to return its current state
      return this.getById(bookingId);
    }

    // No counter change needed — plain update
    const params = {
      TableName: TABLE_NAME,
      Key: { PK: `BOOKING#${bookingId}`, SK: 'METADATA' },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': status, ':updatedAt': now },
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
      FilterExpression: 'contains(#status, :qUpper) OR contains(#status, :qLower) OR contains(PK, :qOriginal) OR contains(patientId, :qLower) OR contains(patientId, :qOriginal)',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#BOOKING',
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

  async _exactCount(params) {
    let count = 0;
    let exclusiveStartKey = undefined;
    do {
      params.ExclusiveStartKey = exclusiveStartKey;
      const response = await docClient.send(new QueryCommand(params));
      count += (response.Count || 0);
      exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);
    return count;
  }

  /**
   * Read the atomic pending-bookings counter.
   * Falls back to the full exact-count query if the counter item has not yet been
   * seeded (i.e., during initial deployment before the backfill runs).
   */
  async getPendingBookingsCount() {
    const { Item } = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: 'AGGREGATE#PendingBookings', SK: 'METADATA' }
    }));
    if (Item && typeof Item.count === 'number') return Item.count;

    // Fallback — counter not seeded yet; compute and seed it
    const pendingParams = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      FilterExpression: '#status = :pendingStatus',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':entity': 'ENTITY#BOOKING', ':pendingStatus': 'Pending' },
      Select: 'COUNT'
    };
    const count = await this._exactCount(pendingParams);
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: 'AGGREGATE#PendingBookings', SK: 'METADATA' },
      UpdateExpression: 'SET #count = if_not_exists(#count, :zero) + :zero',
      ExpressionAttributeNames: { '#count': 'count' },
      ExpressionAttributeValues: { ':zero': count }
    }));
    return count;
  }

  async getDashboardMetrics() {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Today's Bookings (created today)
    const todayParams = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      FilterExpression: 'begins_with(createdAt, :todayStr)',
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#BOOKING',
        ':todayStr': todayStr
      },
      Select: 'COUNT'
    };



    // 3. Home Collections
    const homeParams = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      FilterExpression: '#collection.#type = :homeType',
      ExpressionAttributeNames: {
        '#collection': 'collection',
        '#type': 'type'
      },
      ExpressionAttributeValues: {
        ':entity': 'ENTITY#BOOKING',
        ':homeType': 'Home Collection'
      },
      Select: 'COUNT'
    };

    const [bookingsToday, pendingBookings, homeCollections] = await Promise.all([
      this._exactCount(todayParams),
      this.getPendingBookingsCount(), // O(1) counter read instead of full GSI scan
      this._exactCount(homeParams)
    ]);

    return {
      bookingsToday,
      pendingBookings,
      homeCollections
    };
  }

  /**
   * Cursor-paginated admin booking queue.
   *
   * Index: GSI1 — GSI1PK = ENTITY#BOOKING, GSI1SK = collection.date (e.g., "2026-09-01")
   * Sort order: collection/scheduled date, controlled by ScanIndexForward.
   *
   * Determinism note: DynamoDB orders within the same GSI1SK (same collection date)
   * by PK in its internal sort order. Within a single date this ordering is consistent
   * across pages of the same query but is not semantically meaningful. This matches the
   * existing getRecent() behavior and is acceptable for an admin queue view.
   *
   * FilterExpression limitation: status, tab, and search filters are applied AFTER
   * DynamoDB reads `limit` items from the index. A page may appear to have fewer than
   * `limit` items if filters eliminate some reads. This is standard DynamoDB behavior
   * and is acceptable for this use case. Clients must use `nextCursor` to continue
   * regardless of page size.
   */
  async getPaginated({ limit = 20, cursor = null, status = 'All', tab = 'All', sort = 'date_newest', search = '' } = {}) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :entity',
      ExpressionAttributeValues: { ':entity': 'ENTITY#BOOKING' },
      ScanIndexForward: sort === 'date_oldest',
      Limit: Math.min(limit, 50), // cap at 50 to protect Lambda memory
    };

    const filterParts = [];
    const expressionNames = {};

    // Tab → collection type filter
    if (tab && tab !== 'All') {
      const collType = tab === 'HOME' ? 'Home Collection' : 'Lab Visit';
      filterParts.push('#collection.#collType = :collType');
      expressionNames['#collection'] = 'collection';
      expressionNames['#collType'] = 'type';
      params.ExpressionAttributeValues[':collType'] = collType;
    }

    // Status filter
    if (status && status !== 'All') {
      filterParts.push('#bookingStatus = :bookingStatus');
      expressionNames['#bookingStatus'] = 'status';
      params.ExpressionAttributeValues[':bookingStatus'] = status;
    }

    // Search filter — case-insensitive approximation via multi-variant contains()
    if (search && search.trim()) {
      const q = search.trim();
      const qL = q.toLowerCase();
      const qU = q.toUpperCase();
      const qT = q.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      filterParts.push(
        '(contains(#bookingId, :searchOrig) OR contains(#patient.#patientName, :searchQ) OR contains(#patient.#patientName, :searchQU) OR contains(#patient.#patientName, :searchQT) OR contains(#patient.#patientPhone, :searchOrig))'
      );
      expressionNames['#bookingId'] = 'id';
      expressionNames['#patient'] = 'patient';
      expressionNames['#patientName'] = 'name';
      expressionNames['#patientPhone'] = 'phone';
      params.ExpressionAttributeValues[':searchOrig'] = q;
      params.ExpressionAttributeValues[':searchQ'] = qL;
      params.ExpressionAttributeValues[':searchQU'] = qU;
      params.ExpressionAttributeValues[':searchQT'] = qT;
    }

    if (filterParts.length > 0) {
      params.FilterExpression = filterParts.join(' AND ');
      params.ExpressionAttributeNames = expressionNames;
    }

    // Decode cursor into DynamoDB ExclusiveStartKey
    if (cursor) {
      try {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
      } catch (_) {
        // Ignore invalid cursor — start from the beginning
      }
    }

    const response = await docClient.send(new QueryCommand(params));

    const nextCursor = response.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
      : null;

    return {
      data: (response.Items || []).map(item => this._mapFromDb(item)),
      nextCursor,
    };
  }

  _mapFromDb(item) {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    return rest;
  }
}

module.exports = new DynamoBookingRepository();
