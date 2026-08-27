const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';

class DynamoPackageRepository {
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
        PK: `PACKAGE#${id}`,
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
        ':slugPk': `PACKAGESLUG#${slug}`,
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
          ':pk': 'PACKAGES#catalog',
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

  async getCategories() {
    const items = await this.getCatalog();
    const seen = new Set();
    const categories = [{ id: 'all', label: 'All Packages' }];
    for (const item of items) {
      if (item.category && !seen.has(item.category)) {
        seen.add(item.category);
        categories.push({ id: item.category, label: item.categoryLabel || item.category });
      }
    }
    return categories;
  }

  async getFeaturedPackages() {
    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: 'CONFIG#PACKAGES_FEATURED',
        SK: 'METADATA',
      },
    }));
    if (response.Item && response.Item.packageIds) {
      const ids = response.Item.packageIds;
      const promises = ids.map(id => this.getById(id));
      const packages = await Promise.all(promises);
      return packages.filter(Boolean);
    }
    return [];
  }

  async getHeroData() {
    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: 'CONFIG#PACKAGES_HERO',
        SK: 'METADATA',
      },
    }));
    if (response.Item) {
      const { PK, SK, ...rest } = response.Item;
      return rest;
    }
    return {
      title: 'Comprehensive Health Packages',
      description: 'Proactive health monitoring with our carefully designed full-body checkups and specialized wellness packages.',
      image: '/images/hero_packages_visual.png',
    };
  }

  async getBenefits() {
    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: 'CONFIG#PACKAGES_BENEFITS',
        SK: 'METADATA',
      },
    }));
    if (response.Item && response.Item.benefits) {
      return response.Item.benefits;
    }
    return [];
  }

  async getProcessSteps() {
    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: 'CONFIG#PACKAGES_PROCESS',
        SK: 'METADATA',
      },
    }));
    if (response.Item && response.Item.steps) {
      return response.Item.steps;
    }
    return [];
  }

  async upsert(packageData) {
    const now = new Date().toISOString();
    const id = packageData.id || `package-${packageData.slug}`;
    const slug = packageData.slug;

    const item = {
      PK: `PACKAGE#${id}`,
      SK: 'METADATA',
      GSI1PK: 'PACKAGES#catalog',
      GSI1SK: `PACKAGE#${packageData.createdAt || now}#${id}`,
      GSI2PK: `PACKAGESLUG#${slug}`,
      GSI2SK: 'METADATA',
      ...packageData,
      id,
      slug,
      createdAt: packageData.createdAt || now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return this._mapFromDb(item);
  }

  async upsertConfig(key, data) {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `CONFIG#${key}`,
        SK: 'METADATA',
        ...data,
        updatedAt: new Date().toISOString(),
      },
    }));
  }
}

module.exports = new DynamoPackageRepository();
