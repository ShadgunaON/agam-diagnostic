import { NextResponse } from 'next/server';

export async function GET() {
  const result: any = {
    envKeys: Object.keys(process.env).filter(k => k.includes('NEXT') || k.includes('API') || k.includes('APPSYNC')),
    apiKeyExists: !!process.env.APPSYNC_API_KEY,
    graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://cihtpsxiibcb5bewwzxibt2l3i.appsync-api.us-east-1.amazonaws.com/graphql',
  };

  try {
    const apiUrl = result.graphqlUrl;
    const apiKey = process.env.APPSYNC_API_KEY || '';
    const query = `query GetTests { catalogTests(limit: 1) { data { id title } } }`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ query }),
    });

    result.status = response.status;
    result.ok = response.ok;
    
    if (response.ok) {
      result.data = await response.json();
    } else {
      result.errorText = await response.text();
    }
  } catch (err: any) {
    result.error = err.message;
  }

  return NextResponse.json(result);
}
