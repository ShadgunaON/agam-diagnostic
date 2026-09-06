import { NextResponse } from 'next/server';
import { env } from '@/config/env';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');
    
    // Explicit API key fallback for public queries (catalog, blogs, etc.)
    const apiKey = process.env.APPSYNC_API_KEY || '';
    
    const apiUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || env.graphqlUrl;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // If authenticated via Cognito, pass the token.
    // If unauthenticated (public query), pass the API key so AppSync accepts it.
    if (token) {
      headers['Authorization'] = token;
    } else if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('GraphQL Proxy Error:', error);
    return NextResponse.json(
      { errors: [{ message: error.message }] },
      { status: 500 }
    );
  }
}