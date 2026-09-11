const fetch = require('node-fetch'); // Assuming node-fetch is available, or use native fetch in node 18+

const query = `
  query MyPortal {
    myPortal {
      bookings {
        id
        status
        createdAt
        collection { type date timeSlot address }
        items { name type }
        patient { name }
      }
      invoices {
        id
        bookingId
        paymentStatus
        paymentMethod
      }
      reviews {
        id
        bookingId
        status
      }
      collections {
        id
        bookingId
        status
        assignedTo
      }
      reports {
        id
        bookingId
        status
      }
    }
  }
`;

async function run() {
  try {
    // In node 22, we have native fetch
    const response = await fetch('https://cihtpsxiibcb5bewwzxibt2l3i.appsync-api.us-east-1.amazonaws.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'da2-wyfofmw3ffgwrgdo5kyajft5yy' // API key found in previous SAM deploy logs
      },
      body: JSON.stringify({ query })
    });
    
    const json = await response.json();
    console.log(JSON.stringify(json, null, 2));
  } catch(e) {
    console.error(e);
  }
}

run();
