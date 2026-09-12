process.env.DYNAMODB_TABLE_NAME = 'agam-data-dev';
const graphql = require('./infrastructure/src/handlers/graphql');
async function test() {
  const ev1 = { 
    info: { fieldName: 'updateCollection' }, 
    arguments: { id: 'COL-1789160593877_2ws5y', input: '{"status":"Checked In"}' }, 
    identity: { sub: 'system-admin', groups: ['admin'] } 
  };
  try {
    const res = await graphql.handler(ev1);
    console.log('Update Success:', res);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
