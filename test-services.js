const url = 'https://cihtpsxiibcb5bewwzxibt2l3i.appsync-api.us-east-1.amazonaws.com/graphql';
const key = 'da2-wyfofmw3ffgwrgdo5kyajft5yy';
const query = `query CatalogServices($page: Int, $limit: Int) {
  catalogServices(page: $page, limit: $limit) {
    data {
      id slug title category price salePrice basePrice description
      estimatedDuration homeAvailable labAvailable sortOrder status shortDescription
    }
    meta { total page limit totalPages }
  }
}`;
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': key },
  body: JSON.stringify({ query, variables: { page: 1, limit: 100 } })
}).then(r => r.json()).then(j => console.log(JSON.stringify(j, null, 2))).catch(console.error);
