const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';

class DynamoServiceRepository {
  _mapFromDb(item) {
    if (!item) return null;
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    return rest;
  }

  async getById(id) {
    if (!id) return null;
    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `SERVICE#${id}`,
        SK: 'METADATA',
      },
    }));
    return response.Item ? this._mapFromDb(response.Item) : null;
  }

  async getBySlug(slug) {
    if (!slug) return null;
    const response = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :slugPk',
      ExpressionAttributeValues: {
        ':slugPk': `SERVICESLUG#${slug}`,
      },
    }));
    if (!response.Items || response.Items.length === 0) return null;
    return this._mapFromDb(response.Items[0]);
  }

  async getCatalog(limit = 100) {
    let items = [];
    let exclusiveStartKey = undefined;

    do {
      const params = {
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: {
          ':pk': 'SERVICES#catalog',
        },
        ScanIndexForward: false,
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

  async searchServices(query) {
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

  async getHeroData() {
    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: 'CONFIG#SERVICES_HERO',
        SK: 'METADATA',
      },
    }));
    if (response.Item) {
      const { PK, SK, ...rest } = response.Item;
      return rest;
    }
    return {
      title: 'Our Medical Services',
      description: 'Comprehensive diagnostic services delivering accurate results with state-of-the-art technology and expert care.',
      image: '/images/hero_services_visual.png',
    };
  }

  async upsert(serviceData) {
    const now = new Date().toISOString();
    const id = serviceData.id || `service-${serviceData.slug}`;
    const slug = serviceData.slug;

    const item = {
      PK: `SERVICE#${id}`,
      SK: 'METADATA',
      GSI1PK: 'SERVICES#catalog',
      GSI1SK: `SERVICE#${serviceData.createdAt || now}#${id}`,
      GSI2PK: `SERVICESLUG#${slug}`,
      GSI2SK: 'METADATA',
      
      id,
      slug,
      title: serviceData.title || 'Untitled Service',
      category: serviceData.category || 'general',
      description: serviceData.description || '',
      shortDescription: serviceData.shortDescription || '',
      icon: serviceData.icon || 'default-icon',
      color: serviceData.color || 'blue',
      
      // Pricing
      price: serviceData.price || null,
      basePrice: serviceData.basePrice ?? null,
      salePrice: serviceData.salePrice ?? null,
      
      // Status & Sorting
      status: serviceData.status || 'ACTIVE',
      sortOrder: serviceData.sortOrder || 0,
      
      // Medical Information
      estimatedDuration: serviceData.estimatedDuration || null,
      homeAvailable: serviceData.homeAvailable ?? false,
      labAvailable: serviceData.labAvailable ?? true,
      
      // Detail Page Information
      overview: serviceData.overview || null,
      whatIncludes: serviceData.whatIncludes || null,
      whoItIsFor: serviceData.whoItIsFor || null,
      preparationRequired: serviceData.preparationRequired || null,
      precautions: serviceData.precautions || null,
      whatToExpect: serviceData.whatToExpect || null,
      additionalInstructions: serviceData.additionalInstructions || null,
      
      // Legacy detail data fields, will be deprecated/migrated
      valueProps: serviceData.valueProps || [],
      aboutHtml: serviceData.aboutHtml || '',
      whoShouldUse: serviceData.whoShouldUse || [],
      process: serviceData.process || [],
      preparation: serviceData.preparation || null,
      faqs: serviceData.faqs || [],
      relatedTests: serviceData.relatedTests || [],
      otherServices: serviceData.otherServices || [],
      
      createdAt: serviceData.createdAt || now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return this._mapFromDb(item);
  }

  async update(id, serviceData) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Service not found');

    const updated = {
      ...existing,
      ...serviceData,
      id: existing.id,
      slug: serviceData.slug || existing.slug,
      createdAt: existing.createdAt,
    };

    return this.upsert(updated);
  }

  async updateStatus(id, status) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Service not found');
    
    existing.status = status;
    await this.upsert(existing);
  }

  /**
   * Permanently delete a service by its ID.
   * This is irreversible. Use updateStatus('INACTIVE') for soft removal.
   */
  async delete(id) {
    if (!id) throw new Error('Service ID is required for deletion');
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `SERVICE#${id}`,
        SK: 'METADATA',
      },
    }));
  }

  async upsertHeroData(heroData) {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: 'CONFIG#SERVICES_HERO',
        SK: 'METADATA',
        ...heroData,
        updatedAt: new Date().toISOString(),
      },
    }));
  }
}

module.exports = new DynamoServiceRepository();
