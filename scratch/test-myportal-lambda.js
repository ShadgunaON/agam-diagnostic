const { handler } = require('../infrastructure/src/handlers/graphql.js');

async function run() {
  try {
    const event = {
      info: {
        fieldName: 'myPortal',
        parentTypeName: 'Query',
        selectionSetList: [
          'bookings',
          'invoices',
          'reviews',
          'collections',
          'reports'
        ]
      },
      arguments: {},
      identity: {
        sub: 'b4584438-80b1-7005-3c62-62a0635eb627', // I will use a dummy sub or one from the logs
        username: 'ashh'
      }
    };
    const res = await handler(event);
    || !i.name)); console.log("Bad booking item:", badBooking);
  } catch (e) {
    console.error(e);
  }
}
run();
