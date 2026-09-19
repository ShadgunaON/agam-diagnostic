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

  async getById(id, { consistentRead = false } = {}) {
    if (!id) return null;
    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PAGE#${id}`, SK: 'METADATA' },
      ConsistentRead: consistentRead,
    }));
    return response.Item ? this._mapFromDb(response.Item) : null;
  }

  async update(id, updates) {
    // Strongly consistent read so we never miss a previous write
    let existing = await this.getById(id, { consistentRead: true });
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

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return this._mapFromDb(item);
  }

  /**
   * Publish accepts content + seo directly from the caller so there is zero
   * chance of an eventual-consistency race between the updatePage write and
   * the publishPage read.  If not supplied, falls back to the DB value using
   * a strongly-consistent read.
   */
  async publish(id, userId, { draftContent, draftSeo } = {}) {
    // Strongly consistent read — always sees the latest committed item
    const existing = await this.getById(id, { consistentRead: true });
    if (!existing) throw new Error('Page not found');

    const now = new Date().toISOString();

    // Prefer the explicitly-passed draft over whatever is in DynamoDB
    const contentToPublish = draftContent !== undefined ? draftContent : existing.draftContent;
    const seoToPublish     = draftSeo     !== undefined ? draftSeo     : existing.draftSeo;

    const item = {
      ...existing,
      id,
      slug: existing.slug || id,
      title: existing.title || (id === 'home' ? 'Home Page' : 'Untitled'),
      PK: `PAGE#${id}`,
      SK: 'METADATA',
      status: 'PUBLISHED',
      // Keep draft in sync so admin form stays up to date
      draftContent: contentToPublish,
      draftSeo: seoToPublish,
      publishedContent: contentToPublish,
      publishedSeo: seoToPublish,
      publishedAt: now,
      publishedBy: userId || 'admin',
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return this._mapFromDb(item);
  }
}

module.exports = new DynamoPageRepository();
