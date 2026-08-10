const fs = require('fs');
const data = JSON.parse(fs.readFileSync('dom_rules.json', 'utf8'));

console.log("RULES FOUND:");
const seen = new Set();
data.rules.forEach(r => {
  if (!seen.has(r.cssText)) {
    console.log("- " + r.cssText);
    seen.add(r.cssText);
  }
});

console.log("\nCONTAINER PADDING:");
console.log(JSON.stringify(data.containerPadding, null, 2));

console.log("\nCONTAINER MARGIN:");
console.log(JSON.stringify(data.containerMargin, null, 2));

console.log("\nWRAPPER TRACE:");
console.log(JSON.stringify(data.wrapperTrace, null, 2));
