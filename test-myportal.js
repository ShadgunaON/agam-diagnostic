
const query = \query MyPortal {
  myPortal {
    bookings { id }
    invoices { id bookingId paymentStatus }
  }
}\;
const token = require('fs').readFileSync('.env.local', 'utf8').match(/TEST_TOKEN=(.*)/)?.[1] || '';
fetch('http://localhost:3000/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
  body: JSON.stringify({ query })
}).then(r => r.json()).then(console.log).catch(console.error);

