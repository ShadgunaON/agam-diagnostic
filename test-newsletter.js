async function testNewsletter() {
  const query = `
    mutation NewsletterSubscribe($email: String!) {
      newsletterSubscribe(email: $email)
    }
  `;
  
  const response = await fetch('http://localhost:3000/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { email: "yhshadgunasiddhi+11@gmail.com" } })
  });
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testNewsletter().catch(console.error);
