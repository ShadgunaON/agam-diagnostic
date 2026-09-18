import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

export const dynamic = 'force-dynamic';

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';

function mapFromDb(item: Record<string, any>) {
  if (!item) return null;
  const { PK, SK, ...rest } = item;
  return rest;
}

async function getPage(id: string) {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `PAGE#${id}`, SK: 'METADATA' },
  }));
  return result.Item ? mapFromDb(result.Item as Record<string, any>) : null;
}

async function updatePage(id: string, content?: string | null, seo?: string | null, updatedBy = 'admin') {
  const now = new Date().toISOString();
  let existing = await getPage(id);

  if (!existing) {
    existing = {
      id,
      slug: id,
      title: id === 'home' ? 'Home Page' : id,
      status: 'DRAFT',
      createdAt: now,
      createdBy: updatedBy,
    };
  }

  const item = {
    ...existing,
    PK: `PAGE#${id}`,
    SK: 'METADATA',
    status: 'DRAFT',
    draftContent: content !== undefined ? content : existing.draftContent,
    draftSeo: seo !== undefined ? seo : existing.draftSeo,
    updatedAt: now,
    updatedBy,
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return mapFromDb(item);
}

async function publishPage(id: string, publishedBy = 'admin') {
  const existing = await getPage(id);
  if (!existing) throw new Error('Page not found — save draft first.');

  const now = new Date().toISOString();

  const item = {
    ...existing,
    PK: `PAGE#${id}`,
    SK: 'METADATA',
    status: 'PUBLISHED',
    publishedContent: existing.draftContent,
    publishedSeo: existing.draftSeo,
    publishedAt: now,
    publishedBy,
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return mapFromDb(item);
}

// ── Route Handlers ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const page = await getPage(id);
    return NextResponse.json({ page });
  } catch (err: any) {
    console.error('[CMS API] GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, content, seo } = body;

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    if (action === 'update') {
      const page = await updatePage(id, content, seo);
      return NextResponse.json({ page });
    }

    if (action === 'publish') {
      const page = await publishPage(id);
      return NextResponse.json({ page });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error('[CMS API] POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
