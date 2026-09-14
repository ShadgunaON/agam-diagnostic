async function testInvoices() {
  const query = `
    query AdminInvoicesWorkspace($limit: Int, $cursor: String, $status: String, $search: String) {
      adminInvoicesWorkspace(limit: $limit, cursor: $cursor, status: $status, search: $search) {
        queue {
          id patientId bookingId paymentStatus paymentMethod
          total subtotal tax discount paidAt receivedBy createdAt updatedAt providerTransactionId
          items { id name type price }
        }
        nextCursor
      }
    }
  `;
  
  const response = await fetch('http://localhost:3000/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { limit: 15, status: "All", search: "" } })
  });
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testInvoices().catch(console.error);
