async function testWorkspace() {
  const query = `
    query GetReportsWorkspace($limit: Int, $status: String, $sort: String) {
      adminReportsWorkspace(limit: $limit, status: $status, sort: $sort) {
        queue {
          id status priority createdAt testType time
          patient { name }
        }
        pendingCount
      }
    }
  `;
  
  const response = await fetch('http://localhost:3000/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { limit: 10, status: 'All', sort: 'date_newest' } })
  });
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testWorkspace().catch(console.error);
