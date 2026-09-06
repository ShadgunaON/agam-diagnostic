import { NextResponse } from 'next/server';
import { env } from '@/config/env';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');
    
    const apiUrl = env.graphqlUrl;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
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