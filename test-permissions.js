const { handler } = require('./infrastructure/src/handlers/staff');
const identity = { sub: '5418c478-c0d1-7019-6fda-e7a18ad58ca4', groups: ['AdminGroup'], role: 'admin' };
const event = {
  httpMethod: 'GET',
  path: '/api/staff/permissions',
  requestContext: {
    authorizer: {
      claims: {
        sub: identity.sub,
        'cognito:groups': identity.groups,
        'custom:role': identity.role,
        email: 'test@example.com'
      }
    }
  }
};
(async () => {
  try {
    const res = await handler(event);
    console.log('Response:', res);
  } catch(err) {
    console.error('Crash:', err);
  }
})();
