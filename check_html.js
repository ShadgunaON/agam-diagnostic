const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1700, height: 1000 });
  await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  const htmlFs = await page.evaluate(() => window.getComputedStyle(document.documentElement).fontSize);
  console.log('HTML FONT SIZE:', htmlFs);
  await browser.close();
})();
