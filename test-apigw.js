const { handler } = require('./infrastructure/src/handlers/staff');
const event = {
  httpMethod: 'GET',
  path: '/api/staff/roles',
  requestContext: {
    authorizer: {
      claims: {
        sub: '5418c478-c0d1-7019-6fda-e7a18ad58ca4',
        email: 'test@example.com'
      }
    }
  }
};
(async () => {
  const res = await handler(event);
  console.log('Response status:', res.statusCode);
  console.log('Response body:', res.body);
})();
