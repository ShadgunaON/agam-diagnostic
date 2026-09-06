import { NextResponse } from 'next/server';
import { handler } from '@/infrastructure/src/handlers/graphql';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, variables } = body;
    
    // Naive local AppSync proxy
    // In a real environment, AppSync would parse the query and route to fieldName.
    // Here we'll just extract the fieldName from the query string naively for the mock
    let fieldName = 'globalSearch';
    if (query.includes('dashboardStats')) fieldName = 'dashboardStats';
    if (query.includes('patient(')) fieldName = 'patient';
    
    // Simulate AppSync event
    const event = {
      info: {
        fieldName,
        parentTypeName: 'Query'
      },
      arguments: variables || {},
      identity: {
        // Mock identity for local testing
        sub: 'local-admin-sub',
        claims: {
          email: 'admin@agamdiagnostics.com',
          'custom:role': 'Admin'
        }
      }
    };
    
    const result = await handler(event);
    
    return NextResponse.json({
      data: {
        [fieldName]: result
      }
    });
  } catch (error: any) {
    console.error('Local GraphQL Error:', error);
    return NextResponse.json(
      { errors: [{ message: error.message }] },
      { status: 500 }
    );
  }
}
