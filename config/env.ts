/**
 * Platform-agnostic environment variable parser/validator.
 * In a real-world scenario, this might be powered by Zod or Envalid.
 * For now, this acts as a centralized typed registry of ENV vars.
 */
export const env = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false',

  // AWS Cognito Configuration
  cognitoRegion: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  cognitoUserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_09a7n9aQH',
  cognitoClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '1d72mbjmcvqqeunig5glbnich9',
  
  // Future integrations
  analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  paymentGatewayKey: process.env.NEXT_PUBLIC_PAYMENT_KEY,
};
