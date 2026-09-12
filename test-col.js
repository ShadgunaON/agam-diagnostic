process.env.DYNAMODB_TABLE_NAME = 'agam-data-dev';
const graphql = require('./infrastructure/src/handlers/graphql');

async function test() {
  const event = {
    info: { fieldName: 'adminCollectionsWorkspace' },
    arguments: { tab: 'LAB', limit: 20 },
    identity: { sub: 'system-admin', groups: ['admin'] } // Mock admin identity
  };
  
  try {
    const res = await graphql.handler(event);
    console.log(JSON.stringify(res, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
