const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';

class DynamoPageRepository {
  _mapFromDb(item) {
    if (!item) return null;
    const { PK, SK, ...rest } = item;
    return rest;
  }

  async getById(id) {
    if (!id) return null;
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `PAGE#${id}`,
        SK: 'METADATA',
      },
    };

    const response = await docClient.send(new GetCommand(params));
    return response.Item ? this._mapFromDb(response.Item) : null;
  }

  async update(id, updates) {
    let existing = await this.getById(id);
    const now = new Date().toISOString();

    if (!existing) {
      existing = {
        id,
        slug: id,
        title: id === 'home' ? 'Home Page' : 'Untitled',
        status: 'DRAFT',
        createdAt: now,
        createdBy: updates.updatedBy || 'system',
      };
    }

    const item = {
      ...existing,
      // Always guarantee required fields are present
      id,
      slug: existing.slug || id,
      title: existing.title || (id === 'home' ? 'Home Page' : 'Untitled'),
      PK: `PAGE#${id}`,
      SK: 'METADATA',
      status: 'DRAFT',
      draftContent: updates.content !== undefined ? updates.content : existing.draftContent,
      draftSeo: updates.seo !== undefined ? updates.seo : existing.draftSeo,
      updatedAt: now,
      updatedBy: updates.updatedBy || existing.updatedBy || 'admin',
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return this._mapFromDb(item);
  }

  async publish(id, userId) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Page not found');

    const now = new Date().toISOString();

    const item = {
      ...existing,
      // Always guarantee required fields are present
      id,
      slug: existing.slug || id,
      title: existing.title || (id === 'home' ? 'Home Page' : 'Untitled'),
      PK: `PAGE#${id}`,
      SK: 'METADATA',
      status: 'PUBLISHED',
      publishedContent: existing.draftContent,
      publishedSeo: existing.draftSeo,
      publishedAt: now,
      publishedBy: userId || 'admin',
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return this._mapFromDb(item);
  }
}

module.exports = new DynamoPageRepository();
