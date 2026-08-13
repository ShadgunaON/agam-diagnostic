import { NextResponse } from 'next/server';

// In-memory store attached to global to survive HMR in dev mode
const globalAny: any = global;
if (!globalAny.mockStore) {
  globalAny.mockStore = {};
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 });
  }

  return NextResponse.json({ data: globalAny.mockStore[key] || null });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, data } = body;
    
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    globalAny.mockStore[key] = data;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 });
  }

  delete globalAny.mockStore[key];
  return NextResponse.json({ success: true });
}
