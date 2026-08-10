const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const cdp = await page.target().createCDPSession();
  
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');

  await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle0' });

  // Function to get matched rules for a selector
  const getRulesForSelector = async (selector) => {
    try {
      const { root: { nodeId } } = await cdp.send('DOM.getDocument');
      const { nodeId: targetNodeId } = await cdp.send('DOM.querySelector', { nodeId, selector });
      if (!targetNodeId) return null;
      
      const { matchedCSSRules } = await cdp.send('CSS.getMatchedStylesForNode', { nodeId: targetNodeId });
      
      const rules = matchedCSSRules.map(r => {
        return {
          selector: r.rule.selectorList.text,
          style: r.rule.style.cssText
        };
      });
      return rules;
    } catch (e) {
      return e.message;
    }
  };

  const containerRules = await getRulesForSelector('.admin-page-container');
  const wrapperRules = await getRulesForSelector('.mx-auto.w-full.max-w-\\\\[1440px\\\\]');

  console.log("=== admin-page-container RULES ===");
  console.log(JSON.stringify(containerRules, null, 2));

  console.log("\n=== wrapper RULES ===");
  console.log(JSON.stringify(wrapperRules, null, 2));

  await browser.close();
})();
