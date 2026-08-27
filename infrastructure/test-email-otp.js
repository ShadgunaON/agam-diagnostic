const {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const REGION = 'us-east-1';
const USER_POOL_ID = 'us-east-1_09a7n9aQH';
const CLIENT_ID = '1d72mbjmcvqqeunig5glbnich9';

const client = new CognitoIdentityProviderClient({ region: REGION });

async function testCustomAuth() {
  const testEmail = 'agam.test.auth@gmail.com';
  let createdUser = false;
  
  try {
    await client.send(new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: testEmail,
      UserAttributes: [
        { Name: 'email', Value: testEmail },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'phone_number', Value: '+919999999999' }
      ],
      MessageAction: 'SUPPRESS'
    }));
    createdUser = true;

    const initiateRes = await client.send(new InitiateAuthCommand({
      AuthFlow: 'CUSTOM_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: testEmail,
      }
    }));

    console.log('CUSTOM_AUTH InitiateAuth result:', JSON.stringify(initiateRes, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (createdUser) {
      await client.send(new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: testEmail
      }));
    }
  }
}

testCustomAuth();
