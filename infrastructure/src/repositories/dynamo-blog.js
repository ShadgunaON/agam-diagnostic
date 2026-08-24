const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, DeleteCommand, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';

class DynamoBlogRepository {
  _mapFromDb(item) {
    if (!item) return null;
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
    return rest;
  }

  async getById(id) {
    if (!id) return null;
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `BLOG#${id}`,
        SK: 'METADATA',
      },
    };

    const response = await docClient.send(new GetCommand(params));
    return response.Item ? this._mapFromDb(response.Item) : null;
  }

  async getBySlug(slug) {
    if (!slug) return null;
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :slugPk',
      ExpressionAttributeValues: {
        ':slugPk': `BLOGSLUG#${slug}`,
      },
    };

    const response = await docClient.send(new QueryCommand(params));
    if (!response.Items || response.Items.length === 0) return null;
    return this._mapFromDb(response.Items[0]);
  }

  async getPublicPublished(limit = 100) {
    return this.getByStatus('Published', limit);
  }

  async getByStatus(status = 'Published', limit = 100) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :statusPk',
      ExpressionAttributeValues: {
        ':statusPk': `BLOGS#${status}`,
      },
      ScanIndexForward: false, // Newest first
      Limit: limit,
    };

    const response = await docClient.send(new QueryCommand(params));
    return (response.Items || []).map((item) => this._mapFromDb(item));
  }

  async getAll(limit = 100) {
    const [published, drafts] = await Promise.all([
      this.getByStatus('Published', limit),
      this.getByStatus('Draft', limit),
    ]);

    const combined = [...published, ...drafts];
    combined.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.date || 0).getTime();
      return dateB - dateA;
    });

    return combined.slice(0, limit);
  }

  async create(articleData) {
    const now = new Date().toISOString();
    const id = articleData.id || `BLOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const status = articleData.status === 'Draft' ? 'Draft' : 'Published';
    const slug = articleData.slug || articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const item = {
      PK: `BLOG#${id}`,
      SK: 'METADATA',
      GSI1PK: `BLOGS#${status}`,
      GSI1SK: `BLOG#${now}#${id}`,
      GSI2PK: `BLOGSLUG#${slug}`,
      GSI2SK: 'METADATA',
      id,
      slug,
      title: articleData.title || 'Untitled Article',
      description: articleData.description || '',
      content: articleData.content || '',
      category: articleData.category || 'Patient Education',
      author: articleData.author || 'Admin User',
      authorId: articleData.authorId || 'admin',
      date: articleData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status,
      views: Number(articleData.views) || 0,
      icon: articleData.icon || 'fileText',
      colorPrimary: articleData.colorPrimary || '#3b82f6',
      colorSecondary: articleData.colorSecondary || '#bfdbfe',
      imageUrl: articleData.imageUrl || articleData.image || '',
      image: articleData.image || articleData.imageUrl || '',
      createdAt: now,
      updatedAt: now,
      publishedAt: status === 'Published' ? now : null,
      createdBy: articleData.createdBy || 'system',
      ownerSub: articleData.ownerSub || 'system',
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return this._mapFromDb(item);
  }

  async update(id, updates) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const status = updates.status !== undefined ? updates.status : existing.status;
    const slug = updates.slug !== undefined ? updates.slug : existing.slug;
    const createdAt = existing.createdAt || now;

    const publishedAt =
      status === 'Published'
        ? existing.publishedAt || now
        : null;

    const item = {
      ...existing,
      ...updates,
      id,
      PK: `BLOG#${id}`,
      SK: 'METADATA',
      GSI1PK: `BLOGS#${status}`,
      GSI1SK: `BLOG#${createdAt}#${id}`,
      GSI2PK: `BLOGSLUG#${slug}`,
      GSI2SK: 'METADATA',
      status,
      slug,
      publishedAt,
      updatedAt: now,
      updatedBy: updates.updatedBy || existing.updatedBy || 'admin',
      // Keep immutable system fields intact
      createdAt: existing.createdAt || now,
      createdBy: existing.createdBy || 'system',
      ownerSub: existing.ownerSub || 'system',
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return this._mapFromDb(item);
  }

  async delete(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `BLOG#${id}`,
        SK: 'METADATA',
      },
    };

    await docClient.send(new DeleteCommand(params));
    return true;
  }
}

module.exports = new DynamoBlogRepository();
