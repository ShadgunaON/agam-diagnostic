const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';

/**
 * DynamoDB single-table repository for the Tests catalog.
 *
 * Key schema:
 *   PK:     TEST#<id>
 *   SK:     METADATA
 *   GSI1PK: TESTS#catalog          (all active tests; range = GSI1SK for ordering)
 *   GSI1SK: TEST#<createdAt>#<id>  (descending = newest-first list)
 *   GSI2PK: TESTSLUG#<slug>        (slug → item lookup)
 *   GSI2SK: METADATA
 *
 * Only implements read operations required by ITestsRepository:
 *   - getCatalog (paginated list)
 *   - getBySlug
 *   - getCategories (static; derived from catalog items)
 *   - getHeroData  (stored as a single config item)
 *   - searchTests  (in-memory filter on catalog fetch)
 *
 * Write operations (create/update/delete) are not exposed via API.
 * Catalog items are seeded via the seed script.
 */
class DynamoTestRepository {
  /**
   * Strip DynamoDB index keys before returning to callers.
   */
  _mapFromDb(item) {
    if (!item) return null;
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    return rest;
  }

  /**
   * Fetch a single test by its stable ID.
   */
  async getById(id) {
    if (!id) return null;
    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `TEST#${id}`,
        SK: 'METADATA',
      },
    }));
    return response.Item ? this._mapFromDb(response.Item) : null;
  }

  /**
   * Fetch a single test by URL slug via GSI2.
   */
  async getBySlug(slug) {
    if (!slug) return null;
    const response = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :slugPk',
      ExpressionAttributeValues: {
        ':slugPk': `TESTSLUG#${slug}`,
      },
    }));
    if (!response.Items || response.Items.length === 0) return null;
    return this._mapFromDb(response.Items[0]);
  }

  /**
   * List all catalog items ordered newest-first via GSI1.
   * Supports basic pagination via page/limit (client-side window after full fetch).
   * For catalog sizes < 1000 items this is acceptable; add DynamoDB-native
   * pagination (LastEvaluatedKey) if the catalog grows large.
   */
  async getCatalog(limit = 100) {
    let items = [];
    let exclusiveStartKey = undefined;

    do {
      const params = {
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: {
          ':pk': 'TESTS#catalog',
        },
        ScanIndexForward: false, // Newest first
        ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
      };

      const response = await docClient.send(new QueryCommand(params));
      if (response.Items) {
        items = items.concat(response.Items);
      }
      exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);

    return items.map((item) => this._mapFromDb(item));
  }

  /**
   * Derive distinct categories from the catalog.
   * Returns the canonical "All Tests" entry plus one entry per distinct category value.
   */
  async getCategories() {
    const items = await this.getCatalog();
    const seen = new Set();
    const categories = [{ id: 'all', label: 'All Tests' }];
    for (const item of items) {
      if (item.category && !seen.has(item.category)) {
        seen.add(item.category);
        categories.push({ id: item.category, label: item.categoryLabel || item.category });
      }
    }
    return categories;
  }

  /**
   * Fetch hero section config. Stored as a dedicated item:
   *   PK: CONFIG#TESTS_HERO  SK: METADATA
   * Falls back to a sensible static default if the config item is absent.
   */
  async getHeroData() {
    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: 'CONFIG#TESTS_HERO',
        SK: 'METADATA',
      },
    }));
    if (response.Item) {
      const { PK, SK, ...rest } = response.Item;
      return rest;
    }
    // Safe default — matches the existing static hero data
    return {
      title: 'Health Tests',
      description: 'Book reliable blood tests and health checkups. NABL-accredited results with free home collection across Madurai.',
      image: '/images/hero_lab_visual.png',
    };
  }

  /**
   * Case-insensitive substring search across title and description.
   * Performed in memory on the full catalog; acceptable for catalog sizes < 10 000.
   */
  async searchTests(query) {
    const items = await this.getCatalog();
    if (!query || !query.trim()) return items;
    const lowerQuery = query.toLowerCase().trim();
    return items.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
        (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
        (item.tag && item.tag.toLowerCase().includes(lowerQuery)) ||
        (item.category && item.category.toLowerCase().includes(lowerQuery))
    );
  }

  // ----------------------------------------------------------------
  // Seed-only methods (not exposed via HTTP; used by the seed script)
  // ----------------------------------------------------------------

  /**
   * Upsert a single test item. Idempotent on slug (slug is the stable identity).
   */
  async upsert(testData) {
    const now = new Date().toISOString();
    const id = testData.id || `test-${testData.slug}`;
    const slug = testData.slug;

    const item = {
      PK: `TEST#${id}`,
      SK: 'METADATA',
      GSI1PK: 'TESTS#catalog',
      GSI1SK: `TEST#${testData.createdAt || now}#${id}`,
      GSI2PK: `TESTSLUG#${slug}`,
      GSI2SK: 'METADATA',
      id,
      slug,
      title: testData.title || 'Untitled Test',
      category: testData.category || 'blood',
      categoryLabel: testData.categoryLabel || testData.category || 'Blood Tests',
      tag: testData.tag || '',
      description: testData.description || '',
      
      // Pricing
      price: testData.price || null,
      basePrice: testData.basePrice ?? null,
      salePrice: testData.salePrice ?? null,
      
      // Status & Sorting
      status: testData.status || 'ACTIVE',
      sortOrder: testData.sortOrder || 0,
      
      // Medical Information
      sampleType: testData.sampleType || null,
      sampleVolume: testData.sampleVolume || null,
      turnaroundTime: testData.turnaroundTime || null,
      fastingRequired: testData.fastingRequired || false,
      homeCollectionAvailable: testData.homeCollectionAvailable ?? true,
      labCollectionAvailable: testData.labCollectionAvailable ?? true,
      
      // Detail Page Information
      overview: testData.overview || null,
      whatItChecks: testData.whatItChecks || null,
      whyPerformed: testData.whyPerformed || null,
      preparationRequired: testData.preparationRequired || null,
      precautions: testData.precautions || null,
      sampleInfo: testData.sampleInfo || null,
      reportTiming: testData.reportTiming || null,
      additionalInstructions: testData.additionalInstructions || null,
      
      // Legacy fields
      whoShouldGet: testData.whoShouldGet || null,
      preparation: testData.preparation || null,
      faqs: testData.faqs || [],
      relatedTests: testData.relatedTests || [],
      
      createdAt: testData.createdAt || now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return this._mapFromDb(item);
  }

  /**
   * Update an existing test entity.
   */
  async update(id, testData) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Test not found');

    const updated = {
      ...existing,
      ...testData,
      id: existing.id,
      slug: testData.slug || existing.slug,
      createdAt: existing.createdAt,
    };

    return this.upsert(updated);
  }

  /**
   * Update status only (e.g. deactivate).
   */
  async updateStatus(id, status) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Test not found');
    
    existing.status = status;
    await this.upsert(existing);
  }

  /**
   * Permanently delete a test by its ID.
   * This is irreversible. Use updateStatus('INACTIVE') for soft removal.
   */
  async delete(id) {
    if (!id) throw new Error('Test ID is required for deletion');
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `TEST#${id}`,
        SK: 'METADATA',
      },
    }));
  }

  /**
   * Upsert the hero config item.
   */
  async upsertHeroData(heroData) {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: 'CONFIG#TESTS_HERO',
        SK: 'METADATA',
        title: heroData.title,
        description: heroData.description,
        image: heroData.image,
        updatedAt: new Date().toISOString(),
      },
    }));
  }
}

module.exports = new DynamoTestRepository();
