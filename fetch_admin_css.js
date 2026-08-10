const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  const css = await page.evaluate(() => {
    let result = '';
    for (let i = 0; i < document.styleSheets.length; i++) {
      let sheet = document.styleSheets[i];
      try {
        if (sheet.cssRules) {
          for (let j = 0; j < sheet.cssRules.length; j++) {
            if (sheet.cssRules[j].cssText.includes('.admin-page-container')) {
              result += sheet.cssRules[j].cssText + '\\n';
            }
          }
        }
      } catch (e) { }
    }
    return result;
  });
  console.log('ADMIN PAGE CONTAINER RULES:', css);
  await browser.close();
})();
