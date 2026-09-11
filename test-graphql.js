const url = 'https://cihtpsxiibcb5bewwzxibt2l3i.appsync-api.us-east-1.amazonaws.com/graphql';
const query = `mutation { 
  createPatient(input: {
    name: "Test User",
    email: "admin@agamdiagnostics.com",
    phone: "+919999999999",
    age: 30,
    gender: "Male"
  }) { id name email }
}`;
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'dummy' },
  body: JSON.stringify({query})
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2))).catch(console.error);
