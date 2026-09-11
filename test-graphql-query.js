const endpoint = 'https://cihtpsxiibcb5bewwzxibt2l3i.appsync-api.us-east-1.amazonaws.com/graphql';
const apiKey = 'da2-wyfofmw3ffgwrgdo5kyajft5yy';

const query = `query TestBySlug($slug: String!) {
  testBySlug(slug: $slug) {
    id slug title category tag price salePrice basePrice description sampleType
    turnaroundTime fastingRequired homeCollectionAvailable labCollectionAvailable
    sortOrder status
    relatedTests { title category description slug status }
    faqs { question answer }
  }
}`;

fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  },
  body: JSON.stringify({ query, variables: { slug: 'seqq' } })
}).then(r => r.json()).then(j => console.log(JSON.stringify(j, null, 2))).catch(console.error);
