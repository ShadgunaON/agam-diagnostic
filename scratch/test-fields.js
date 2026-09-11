const handler = require('../infrastructure/src/handlers/graphql');

async function run() {
  const event = {
    info: { parentTypeName: 'Query', fieldName: 'myPortal' },
    identity: { sub: 'b4584438-80b1-7005-3c62-62a0635eb627' }
  };
  
  try {
    const res = await handler.handler(event);
    const badBooking = res.bookings.find(b => !b.id || !b.status || !b.createdAt || !b.items || b.items.some(i => !i.name || !i.type) || !b.patient || !b.patient.name); 
    const badInv = res.invoices.find(i => !i.id || !i.paymentStatus); 
    const badRev = res.reviews.find(r => !r.id || !r.bookingId || !r.status); 
    const badCol = res.collections.find(c => !c.id || !c.bookingId || !c.status); 
    const badRep = res.reports.find(r => !r.id || !r.status); 
    console.log("Bad:", {badBooking, badInv, badRev, badCol, badRep});
  } catch (err) {
    console.error(err);
  }
}

run();
